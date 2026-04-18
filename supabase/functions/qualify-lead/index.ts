// Modero AI Qualification Brain
// Reads a lead + the matched property's listing_rules, asks Gemini to score
// the candidate against the rules (with a hard-coded fallback when no rules
// are present), then writes the verdict + a tenant-facing AI message.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;

const FALLBACK_RULES = {
  min_income_ratio: 3,
  require_payslips: true,
  require_work_contract: true,
  require_linkedin: false,
};

interface QualifyResult {
  status: "qualified" | "pending" | "rejected";
  score: number;
  reasons: string[];
  ai_summary: string;
  tenant_message: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { lead_id } = await req.json();
    if (!lead_id) throw new Error("lead_id is required");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    // Load lead
    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();
    if (leadErr || !lead) throw new Error(`Lead not found: ${leadErr?.message}`);

    // Try to match a property if not already linked
    let property: any = null;
    if (lead.property_id) {
      const { data } = await supabase
        .from("properties")
        .select("id, agency_id, title, rent, listing_rules")
        .eq("id", lead.property_id)
        .maybeSingle();
      property = data;
    } else if (lead.idealista_listing_id) {
      const { data } = await supabase
        .from("properties")
        .select("id, agency_id, title, rent, listing_rules")
        .eq("idealista_listing_id", lead.idealista_listing_id)
        .maybeSingle();
      property = data;
    }

    const rules = property?.listing_rules ?? FALLBACK_RULES;
    const rent = property?.rent ?? lead.price ?? null;

    // Ask Gemini for a structured verdict
    const systemPrompt = `You are Modero, an AI tenant qualification engine for Spanish/Portuguese/Italian rental agencies.
You receive a tenant inquiry and the property's listing rules. Decide:
- "qualified": clearly meets the rules (income ≥ min_income_ratio × rent, plausible employment, no red flags)
- "pending": partial fit — promising but missing info
- "rejected": clearly fails (insufficient income, suspicious patterns, scam signals like "pay 6 months upfront, no viewing needed")
Be strict but fair. Return concise reasons.`;

    const userPrompt = `Property: ${property?.title ?? lead.property_title ?? "Unknown"}
Monthly rent: ${rent ? `€${rent}` : "unknown"}
Rules: ${JSON.stringify(rules)}

Tenant inquiry:
- Name: ${lead.tenant_name ?? "unknown"}
- Email: ${lead.tenant_email ?? "unknown"}
- Phone: ${lead.tenant_phone ?? "unknown"}
- Message: """${lead.message ?? ""}"""`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "submit_qualification",
              description: "Submit the qualification verdict",
              parameters: {
                type: "object",
                properties: {
                  status: { type: "string", enum: ["qualified", "pending", "rejected"] },
                  score: { type: "integer", minimum: 0, maximum: 100 },
                  reasons: { type: "array", items: { type: "string" }, maxItems: 4 },
                  ai_summary: { type: "string", description: "1-2 sentence summary for the agent" },
                  tenant_message: {
                    type: "string",
                    description:
                      "WhatsApp-style first reply to the tenant (friendly, multilingual-aware, asks for missing info if pending, polite rejection if rejected, viewing-invite teaser if qualified)",
                  },
                },
                required: ["status", "score", "reasons", "ai_summary", "tenant_message"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "submit_qualification" } },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, t);
      if (aiResp.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      if (aiResp.status === 402)
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      throw new Error(`AI gateway ${aiResp.status}: ${t}`);
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");
    const verdict: QualifyResult = JSON.parse(toolCall.function.arguments);

    // Update lead
    await supabase
      .from("leads")
      .update({
        agency_id: property?.agency_id ?? null,
        property_id: property?.id ?? null,
        qualification_status: verdict.status,
        qualification_score: verdict.score,
        qualification_reasons: verdict.reasons,
        ai_summary: verdict.ai_summary,
        match_status: property ? "matched" : "unmatched",
        processed: true,
      })
      .eq("id", lead_id);

    // If matched to an agency, ensure a conversation exists & seed AI message + agent alert
    let conversationId: string | null = null;
    if (property?.agency_id) {
      // Find existing conversation for this lead
      const { data: existingConv } = await supabase
        .from("conversations")
        .select("id")
        .eq("lead_id", lead_id)
        .maybeSingle();

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        const { data: newConv, error: cErr } = await supabase
          .from("conversations")
          .insert({
            agency_id: property.agency_id,
            property_id: property.id,
            lead_id: lead_id,
            tenant_name: lead.tenant_name,
            tenant_email: lead.tenant_email,
            tenant_phone: lead.tenant_phone,
            property_title: property.title,
            status: "ai_handling",
          })
          .select("id")
          .single();
        if (cErr) throw cErr;
        conversationId = newConv.id;
      }

      // Seed messages: tenant's original message, then AI reply
      await supabase.from("messages").insert([
        {
          conversation_id: conversationId,
          sender_type: "tenant",
          sender_name: lead.tenant_name ?? "Tenant",
          body: lead.message ?? "(inquiry from Idealista)",
        },
        {
          conversation_id: conversationId,
          sender_type: "ai",
          sender_name: "Modero AI",
          body: verdict.tenant_message,
          metadata: { qualification: verdict.status, score: verdict.score },
        },
      ]);

      // Notification for the agent
      const notifTitle =
        verdict.status === "qualified"
          ? `🚀 Qualified candidate: ${lead.tenant_name ?? "New tenant"}`
          : verdict.status === "pending"
          ? `⏳ Needs review: ${lead.tenant_name ?? "New tenant"}`
          : `❌ Auto-rejected: ${lead.tenant_name ?? "New tenant"}`;

      await supabase.from("notifications").insert({
        agency_id: property.agency_id,
        type: verdict.status === "qualified" ? "new_qualified_lead" : "lead_processed",
        title: notifTitle,
        body: `${verdict.ai_summary} — ${property.title}`,
        link: `/agency/inbox?conversation=${conversationId}`,
        related_lead_id: lead_id,
        related_conversation_id: conversationId,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, verdict, conversation_id: conversationId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[qualify-lead] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
