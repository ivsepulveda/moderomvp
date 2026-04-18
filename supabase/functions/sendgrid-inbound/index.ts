// SendGrid Inbound Parse webhook for Idealista lead emails.
// Receives multipart/form-data POST from SendGrid, extracts tenant + listing
// info, matches the Idealista listing ID against `properties`, and either
// creates a tenant_application (matched) or stores the raw lead for manual
// review (unmatched). Always logs the raw lead in `leads`.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// ---------- Parsing helpers ----------

const stripHtml = (html: string) =>
  html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

const firstMatch = (text: string, regex: RegExp): string | null => {
  const m = text.match(regex);
  return m ? (m[1] ?? m[0]).trim() : null;
};

// Idealista listing IDs are 8-10 digit numbers, often appearing as
// `inmueble/12345678` in URLs or "Ref: 12345678" in body text.
const extractListingId = (text: string, subject: string): string | null => {
  const haystack = `${subject}\n${text}`;
  return (
    firstMatch(haystack, /inmueble[\/\-](\d{6,12})/i) ||
    firstMatch(haystack, /idealista\.[a-z.]+\/[a-z\/\-]*?(\d{8,12})/i) ||
    firstMatch(haystack, /\b(?:ref(?:erencia)?|reference|ref\.|c[óo]digo)[:\s#]*(\d{6,12})\b/i) ||
    firstMatch(haystack, /\b(\d{8,10})\b/) // fallback: any 8-10 digit number
  );
};

const extractPrice = (text: string): number | null => {
  const m =
    text.match(/(\d{2,3}(?:[.,]\d{3})+)\s*€/) ||
    text.match(/€\s*(\d{2,3}(?:[.,]\d{3})+)/) ||
    text.match(/(\d{3,5})\s*€\s*(?:\/\s*mes|\/mo|per month)?/i);
  if (!m) return null;
  const n = parseInt(m[1].replace(/[.,]/g, ""), 10);
  return Number.isFinite(n) ? n : null;
};

const extractEmail = (text: string): string | null =>
  firstMatch(text, /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i);

const extractPhone = (text: string): string | null =>
  firstMatch(text, /(\+?\d[\d\s().-]{7,}\d)/);

const extractTenantName = (text: string, fromName: string | null): string | null => {
  // Try common patterns first; fall back to From header display name.
  const pat =
    firstMatch(text, /(?:from|de|da)\s*[:\-]?\s*([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/) ||
    firstMatch(text, /(?:nombre|name|nome)[:\s]+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+)+)/i);
  if (pat) return pat;
  if (fromName && !fromName.includes("@")) return fromName.replace(/["<>]/g, "").trim();
  return null;
};

const parseFromHeader = (from: string): { name: string | null; email: string | null } => {
  if (!from) return { name: null, email: null };
  const m = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || null, email: m[2].trim().toLowerCase() };
  const email = extractEmail(from);
  return { name: null, email: email?.toLowerCase() ?? null };
};

const extractPropertyTitle = (subject: string, text: string): string | null => {
  // Idealista subjects often look like "Nuevo contacto sobre tu anuncio: Piso en Calle X"
  const fromSubject =
    firstMatch(subject, /(?:anuncio|listing|annuncio|an[úu]ncio)[:\-\s]+(.{5,120}?)$/i) ||
    firstMatch(subject, /(?:about|sobre|su)\s+(.{5,120}?)$/i);
  if (fromSubject) return fromSubject;
  return firstMatch(text, /(?:property|propiedad|imm?obile|im[óo]vel)[:\s]+(.{5,120})/i);
};

// ---------- Main handler ----------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  try {
    // SendGrid Inbound Parse sends multipart/form-data. Also accept JSON for testing.
    const ct = req.headers.get("content-type") || "";
    let fields: Record<string, string> = {};
    if (ct.includes("application/json")) {
      const j = await req.json();
      fields = Object.fromEntries(
        Object.entries(j).map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)])
      );
    } else {
      const form = await req.formData();
      for (const [k, v] of form.entries()) {
        if (typeof v === "string") fields[k] = v;
      }
    }

    const subject = fields["subject"] ?? "";
    const fromHeader = fields["from"] ?? "";
    const html = fields["html"] ?? "";
    const textRaw = fields["text"] ?? "";
    const bodyText = textRaw || (html ? stripHtml(html) : "");

    const { name: fromName, email: fromEmail } = parseFromHeader(fromHeader);
    // Idealista emails come from a noreply@idealista address; the actual tenant
    // email is in the body. Fall back to From only if it's not from idealista.
    const isIdealistaSender = (fromEmail ?? "").includes("idealista");
    const tenantEmail = (extractEmail(bodyText) ?? (isIdealistaSender ? null : fromEmail))?.toLowerCase() ?? null;
    const tenantPhone = extractPhone(bodyText);
    const tenantName = extractTenantName(bodyText, fromName);
    const listingId = extractListingId(bodyText, subject);
    const price = extractPrice(bodyText);
    const propertyTitle = extractPropertyTitle(subject, bodyText);

    console.log("[sendgrid-inbound] parsed", {
      subject,
      fromHeader,
      tenantEmail,
      tenantName,
      tenantPhone,
      listingId,
      price,
      propertyTitle,
    });

    // ---------- Match listing ----------
    let property: { id: string; agency_id: string; title: string; rent: number | null } | null = null;
    if (listingId) {
      const { data: matches } = await supabase
        .from("properties")
        .select("id, agency_id, title, rent")
        .eq("idealista_listing_id", listingId)
        .limit(1);
      property = matches?.[0] ?? null;
    }

    // ---------- Always log raw lead ----------
    const { data: leadRow, error: leadErr } = await supabase
      .from("leads")
      .insert({
        idealista_listing_id: listingId,
        tenant_email: tenantEmail,
        tenant_name: tenantName,
        tenant_phone: tenantPhone,
        property_title: propertyTitle ?? property?.title ?? null,
        price: price ?? property?.rent ?? null,
        message: bodyText.slice(0, 4000),
        raw_email_source: "sendgrid",
        raw_email_data: { subject, from: fromHeader, fields },
        match_status: property ? "matched" : "unmatched",
        processed: false,
      })
      .select("id")
      .single();
    if (leadErr) throw leadErr;

    // ---------- Unmatched: stop here (manual review) ----------
    if (!property || !tenantEmail) {
      const reason = !property
        ? `No property matched listing id ${listingId ?? "(none extracted)"}`
        : "No tenant email extracted";
      console.log("[sendgrid-inbound] unmatched lead", reason);
      return new Response(
        JSON.stringify({ status: "stored_unmatched", lead_id: leadRow.id, reason }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---------- Upsert tenant ----------
    const { data: existingTenant } = await supabase
      .from("tenants")
      .select("id")
      .ilike("email", tenantEmail)
      .limit(1)
      .maybeSingle();

    let tenantId = existingTenant?.id as string | undefined;
    if (!tenantId) {
      const { data: newTenant, error: tErr } = await supabase
        .from("tenants")
        .insert({
          email: tenantEmail,
          name: tenantName ?? tenantEmail.split("@")[0],
          phone: tenantPhone,
          auth_type: "email",
        })
        .select("id")
        .single();
      if (tErr) throw tErr;
      tenantId = newTenant.id;
    }

    // ---------- Avoid duplicate application ----------
    const { data: existingApp } = await supabase
      .from("tenant_applications")
      .select("id")
      .eq("tenant_id", tenantId!)
      .eq("property_id", property.id)
      .limit(1)
      .maybeSingle();

    let applicationId = existingApp?.id as string | undefined;
    if (!applicationId) {
      const { data: newApp, error: aErr } = await supabase
        .from("tenant_applications")
        .insert({
          tenant_id: tenantId!,
          property_id: property.id,
          agency_id: property.agency_id,
          idealista_listing_id: listingId,
          rent: property.rent,
          status: "pending",
          linked_lead_id: leadRow.id,
        })
        .select("id")
        .single();
      if (aErr) throw aErr;
      applicationId = newApp.id;
    }

    // ---------- Mark lead processed + linked ----------
    await supabase
      .from("leads")
      .update({
        processed: true,
        match_status: "matched",
        linked_application_id: applicationId,
      })
      .eq("id", leadRow.id);

    return new Response(
      JSON.stringify({
        status: "ok",
        lead_id: leadRow.id,
        tenant_id: tenantId,
        application_id: applicationId,
        property_id: property.id,
        agency_id: property.agency_id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[sendgrid-inbound] error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
