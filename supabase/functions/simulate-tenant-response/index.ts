// Demo simulator: makes the "tenant" reply in a conversation.
// Used to mimic Tenant accepting/declining a viewing invite, or sending a
// follow-up question — closing the loop without real WhatsApp.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { conversation_id, kind } = await req.json();
    if (!conversation_id) throw new Error("conversation_id is required");

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
      auth: { persistSession: false },
    });

    const { data: conv } = await supabase
      .from("conversations")
      .select("id, agency_id, lead_id, tenant_name, property_title")
      .eq("id", conversation_id)
      .single();
    if (!conv) throw new Error("Conversation not found");

    let body = "";
    let notifTitle = "";
    let updates: Record<string, unknown> = {};

    if (kind === "accept_viewing") {
      body = `¡Perfecto! Confirmo la visita. Llegaré 5 minutos antes. Muchas gracias 🙏`;
      notifTitle = `✅ Viewing accepted: ${conv.tenant_name ?? "Tenant"}`;
      updates = { viewing_accepted_at: new Date().toISOString() };
    } else if (kind === "decline_viewing") {
      body = `Hola, lo siento mucho pero ya he encontrado otro piso. ¡Gracias!`;
      notifTitle = `↩️ Viewing declined: ${conv.tenant_name ?? "Tenant"}`;
      updates = { viewing_declined_at: new Date().toISOString() };
    } else {
      body = `Una pregunta más: ¿está incluido el agua y la luz en el alquiler?`;
      notifTitle = `💬 New message: ${conv.tenant_name ?? "Tenant"}`;
    }

    await supabase.from("messages").insert({
      conversation_id,
      sender_type: "tenant",
      sender_name: conv.tenant_name ?? "Tenant",
      body,
    });

    if (conv.lead_id && Object.keys(updates).length) {
      await supabase.from("leads").update(updates).eq("id", conv.lead_id);
    }

    await supabase.from("notifications").insert({
      agency_id: conv.agency_id,
      type: "new_message",
      title: notifTitle,
      body: `${conv.property_title ?? ""}`,
      link: `/agency/inbox?conversation=${conversation_id}`,
      related_conversation_id: conversation_id,
    });

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[simulate-tenant-response] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
