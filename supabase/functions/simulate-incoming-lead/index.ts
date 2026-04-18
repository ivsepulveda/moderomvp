// Demo simulator: spawns a fake Idealista inquiry on one of the agency's
// properties, then immediately calls qualify-lead so the AI brain processes it.
// Used by the "Simulate New Inquiry" button in the Agency Inbox.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PERSONAS = [
  {
    name: "Elena Vargas",
    email: "elena.vargas@bbva.com",
    phone: "+34 611 555 101",
    message:
      "Buenos días, estoy muy interesada en este piso. Trabajo como Senior Risk Analyst en BBVA con contrato indefinido (€4.800/mes neto). Puedo aportar nóminas, contrato y referencias. ¿Cuándo podría visitarlo?",
  },
  {
    name: "Tom Fischer",
    email: "tom.fischer@n26.com",
    phone: "+49 170 555 202",
    message:
      "Hello, I'm relocating from Berlin to Madrid for a permanent role at N26 (€5,500/month net). I have payslips, contract, and a German credit report. Could we book a viewing this week?",
  },
  {
    name: "Mathieu Garnier",
    email: "mathieu@gmail.com",
    phone: "+33 6 55 12 34 56",
    message:
      "Bonjour, je cherche un appartement. Je travaille en freelance, revenus variables (1.500-2.500€/mois). Pouvez-vous m'envoyer plus d'infos?",
  },
  {
    name: "Anonymous Renter",
    email: "fastdeal99@protonmail.com",
    phone: null,
    message:
      "Hi, I want to rent immediately. Will pay 12 months upfront in cash. No need for viewing or paperwork. Send IBAN.",
  },
  {
    name: "Priya Sharma",
    email: "priya.sharma@deloitte.com",
    phone: "+34 622 555 303",
    message:
      "Hello, Senior Manager at Deloitte (€6,200/month, indefinido contract). Looking to move in next month with my partner. Both employed, no pets. Can we schedule a viewing?",
  },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const body = await req.json().catch(() => ({}));
    const { agency_id, property_id } = body;
    if (!agency_id) throw new Error("agency_id is required");

    // Pick a property — the one supplied, else a random active one for the agency
    let property;
    if (property_id) {
      const { data } = await supabase
        .from("properties")
        .select("id, agency_id, title, idealista_listing_id, rent")
        .eq("id", property_id)
        .maybeSingle();
      property = data;
    } else {
      const { data: props } = await supabase
        .from("properties")
        .select("id, agency_id, title, idealista_listing_id, rent")
        .eq("agency_id", agency_id)
        .eq("is_active", true)
        .is("rented_at", null);
      if (!props || props.length === 0) throw new Error("No active vacant properties");
      property = props[Math.floor(Math.random() * props.length)];
    }
    if (!property) throw new Error("Property not found");

    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];

    const { data: lead, error: leadErr } = await supabase
      .from("leads")
      .insert({
        agency_id: property.agency_id,
        property_id: property.id,
        idealista_listing_id: property.idealista_listing_id ?? `IDL-SIM-${Date.now()}`,
        tenant_name: persona.name,
        tenant_email: persona.email,
        tenant_phone: persona.phone,
        property_title: property.title,
        price: property.rent,
        message: persona.message,
        raw_email_source: "simulator",
        match_status: "matched",
        processed: false,
      })
      .select("id")
      .single();
    if (leadErr) throw leadErr;

    // Trigger qualification
    const qResp = await fetch(`${SUPABASE_URL}/functions/v1/qualify-lead`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SERVICE_ROLE}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ lead_id: lead.id }),
    });
    const qBody = await qResp.json();

    return new Response(
      JSON.stringify({ ok: true, lead_id: lead.id, qualification: qBody }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[simulate-incoming-lead] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
