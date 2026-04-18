import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ADMIN_EMAIL = "admin@modero.app";
const ADMIN_PASSWORD = "Admin1234!";
const AGENCY_EMAIL = "demo@modero.app";
const AGENCY_PASSWORD = "Demo1234!";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: string[] = [];

    // ───────── helpers ─────────
    async function findUserByEmail(email: string): Promise<string | null> {
      // Paginate (just 1 page is enough for demo)
      const { data } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
      const u = data?.users?.find((x: any) => x.email?.toLowerCase() === email.toLowerCase());
      return u?.id ?? null;
    }

    async function ensureUser(email: string, password: string, meta: Record<string, string>) {
      let id = await findUserByEmail(email);
      if (id) return id;
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: meta,
      });
      if (error) {
        if (error.message.includes("already")) {
          id = await findUserByEmail(email);
          if (id) return id;
        }
        throw error;
      }
      return data.user!.id;
    }

    // ───────── 1. ADMIN ─────────
    const adminId = await ensureUser(ADMIN_EMAIL, ADMIN_PASSWORD, { full_name: "Modero Admin" });
    await supabase.from("user_roles").upsert(
      { user_id: adminId, role: "admin" },
      { onConflict: "user_id,role" }
    );
    await supabase.from("profiles").upsert(
      {
        id: adminId,
        email: ADMIN_EMAIL,
        full_name: "Modero Admin",
        onboarding_completed: true,
      },
      { onConflict: "id" }
    );
    results.push(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);

    // ───────── 2. AGENCY ─────────
    const agencyId = await ensureUser(AGENCY_EMAIL, AGENCY_PASSWORD, { full_name: "Demo Agency Owner" });
    await supabase.from("user_roles").upsert(
      { user_id: agencyId, role: "agency" },
      { onConflict: "user_id,role" }
    );
    await supabase.from("profiles").upsert(
      {
        id: agencyId,
        email: AGENCY_EMAIL,
        full_name: "Carla Demo",
        agency_name: "Modero Demo Rentals",
        notification_email: AGENCY_EMAIL,
        onboarding_completed: true,
      },
      { onConflict: "id" }
    );
    results.push(`Agency: ${AGENCY_EMAIL} / ${AGENCY_PASSWORD}`);

    // ───────── 3. CLEAN existing demo data for this agency ─────────
    // Delete in dependency order
    await supabase.from("viewings").delete().eq("agency_id", agencyId);
    const { data: existingApps } = await supabase
      .from("tenant_applications")
      .select("id")
      .eq("agency_id", agencyId);
    const appIds = (existingApps ?? []).map((a) => a.id);
    if (appIds.length) {
      await supabase.from("score_logs").delete().in("application_id", appIds);
      await supabase.from("documents").delete().in("application_id", appIds);
      await supabase.from("tenant_applications").delete().eq("agency_id", agencyId);
    }
    await supabase.from("properties").delete().eq("agency_id", agencyId);
    await supabase.from("agency_agents").delete().eq("agency_id", agencyId);
    // Also wipe demo leads (they aren't agency-scoped, so just clear all for the demo)
    await supabase.from("leads").delete().neq("id", "00000000-0000-0000-0000-000000000000");

    // ───────── 4. AGENTS ─────────
    await supabase.from("agency_agents").insert([
      {
        agency_id: agencyId,
        name: "Maria Lopez",
        email: "maria@modero.app",
        phone: "+34 612 000 001",
        permissions: { view_tenants: true, approve_tenants: true, schedule_viewings: true, manage_listings: true },
      },
      {
        agency_id: agencyId,
        name: "Juan Garcia",
        email: "juan@modero.app",
        phone: "+34 612 000 002",
        permissions: { view_tenants: true, approve_tenants: false, schedule_viewings: true, manage_listings: false },
      },
    ]);

    // ───────── 5. PROPERTIES ─────────
    const propertiesData = [
      {
        title: "Luxury 2BR — Salamanca",
        address: "Calle Serrano 42, 28001 Madrid",
        rent: 2200, bedrooms: 2, bathrooms: 2,
      },
      {
        title: "Cozy Studio — Malasaña",
        address: "Calle Fuencarral 88, 28004 Madrid",
        rent: 1100, bedrooms: 0, bathrooms: 1,
      },
      {
        title: "Family 3BR — Chamberí",
        address: "Paseo de la Castellana 120, 28046 Madrid",
        rent: 3500, bedrooms: 3, bathrooms: 2,
      },
      {
        title: "Bright 1BR — Lisbon Centro",
        address: "Rua Augusta 15, 1100-053 Lisbon",
        rent: 1400, bedrooms: 1, bathrooms: 1,
      },
    ].map((p) => ({
      ...p,
      agency_id: agencyId,
      currency: "EUR",
      is_active: true,
      listing_rules: {
        min_income_ratio: 3,
        require_linkedin: true,
        require_payslips: true,
        require_db_credit: true,
        require_biometric_id: true,
        require_work_contract: true,
        require_nie: false,
        require_tax_return: false,
        residency_history_check: false,
        scoring_weights: { identity: 20, linkedin: 20, db_credit: 30, residency: 15, verification: 15 },
      },
    }));

    const { data: props, error: propErr } = await supabase
      .from("properties")
      .insert(propertiesData)
      .select();
    if (propErr) throw propErr;
    const [prop1, prop2, prop3, prop4] = props!;

    // ───────── 6. TENANTS (6 varied) ─────────
    const tenants = [
      { email: "emma@modero-demo.com", name: "Emma Johnson", phone: "+44 7700 900001", nationality: "British", country: "United Kingdom", age: "30-35", linkedin: "https://linkedin.com/in/emmajohnson", linkedinV: true },
      { email: "luca@modero-demo.com", name: "Luca Rossi", phone: "+39 320 000 002", nationality: "Italian", country: "Italy", age: "28-32", linkedin: "https://linkedin.com/in/lucarossi", linkedinV: true },
      { email: "sophie@modero-demo.com", name: "Sophie Martin", phone: "+33 6 00 00 00 03", nationality: "French", country: "France", age: "25-30", linkedin: null, linkedinV: false },
      { email: "hans@modero-demo.com", name: "Hans Mueller", phone: "+49 170 000 0004", nationality: "German", country: "Germany", age: "35-40", linkedin: "https://linkedin.com/in/hansmueller", linkedinV: true },
      { email: "yuki@modero-demo.com", name: "Yuki Tanaka", phone: "+81 90 0000 0005", nationality: "Japanese", country: "Japan", age: "26-30", linkedin: null, linkedinV: false },
      { email: "carlos@modero-demo.com", name: "Carlos Mendez", phone: "+34 612 000 006", nationality: "Spanish", country: "Spain", age: "30-35", linkedin: "https://linkedin.com/in/carlosmendez", linkedinV: true },
    ];

    const tenantIds: string[] = [];
    for (const t of tenants) {
      // Try to find existing tenant by email (no auth needed for these — agency-only demo)
      const { data: existing } = await supabase
        .from("tenants")
        .select("id")
        .eq("email", t.email)
        .maybeSingle();
      const payload = {
        name: t.name,
        email: t.email,
        phone: t.phone,
        nationality: t.nationality,
        country_of_birth: t.country,
        age_range: t.age,
        linkedin_profile: t.linkedin,
        linkedin_headline: t.linkedinV ? `${t.name} — verified profile` : null,
        email_verified: true,
        phone_verified: true,
        auth_type: "demo",
      };
      if (existing) {
        await supabase.from("tenants").update(payload).eq("id", existing.id);
        tenantIds.push(existing.id);
      } else {
        const { data, error } = await supabase.from("tenants").insert(payload).select("id").single();
        if (error) throw error;
        tenantIds.push(data!.id);
      }
    }

    // ───────── 7. TENANT APPLICATIONS (varied scores) ─────────
    const appsToInsert = [
      // Emma — excellent
      { tenant_id: tenantIds[0], property_id: prop1.id, status: "approved", employment: "employed", job: "Senior Engineer", company: "Google", contract: "permanent", income: 7500, rent: 2200, score: 92, cat: "excellent", docs: true, linkedin: true, fraud: false },
      // Luca — good
      { tenant_id: tenantIds[1], property_id: prop2.id, status: "approved", employment: "employed", job: "Product Designer", company: "Spotify", contract: "permanent", income: 5000, rent: 1100, score: 81, cat: "good", docs: true, linkedin: true, fraud: false },
      // Sophie — fair, pending
      { tenant_id: tenantIds[2], property_id: prop1.id, status: "pending", employment: "employed", job: "Marketing Coordinator", company: "L'Oréal", contract: "temporary", income: 3200, rent: 2200, score: 58, cat: "fair", docs: false, linkedin: false, fraud: false },
      // Hans — rejected, fraud flag
      { tenant_id: tenantIds[3], property_id: prop3.id, status: "rejected", employment: "self-employed", job: "Freelance Consultant", company: "Self", contract: "freelance", income: 8000, rent: 3500, score: 41, cat: "poor", docs: true, linkedin: true, fraud: true },
      // Yuki — pending, no score yet
      { tenant_id: tenantIds[4], property_id: prop2.id, status: "pending", employment: "employed", job: "Data Analyst", company: "Remote Corp", contract: "permanent", income: 4500, rent: 1100, score: 0, cat: null, docs: false, linkedin: false, fraud: false },
      // Carlos — good, pending
      { tenant_id: tenantIds[5], property_id: prop4.id, status: "pending", employment: "employed", job: "Auditor", company: "Deloitte", contract: "permanent", income: 4200, rent: 1400, score: 76, cat: "good", docs: true, linkedin: true, fraud: false },
    ];

    const { data: insertedApps, error: appErr } = await supabase.from("tenant_applications").insert(
      appsToInsert.map((a) => ({
        agency_id: agencyId,
        tenant_id: a.tenant_id,
        property_id: a.property_id,
        status: a.status,
        employment_status: a.employment,
        job_title: a.job,
        company: a.company,
        contract_type: a.contract,
        income_monthly: a.income,
        rent: a.rent,
        score: a.score,
        score_category: a.cat,
        documents_complete: a.docs,
        linkedin_verified: a.linkedin,
        fraud_flag: a.fraud,
      }))
    ).select();
    if (appErr) throw appErr;

    // ───────── 8. SCORE LOGS ─────────
    const scoreLogs = insertedApps!.map((app, i) => {
      const a = appsToInsert[i];
      if (a.score === 0) return null;
      return {
        application_id: app.id,
        score: a.score,
        financial_score: Math.round(a.score * 0.32),
        employment_score: Math.round(a.score * 0.20),
        document_score: Math.round(a.score * 0.18),
        identity_score: Math.round(a.score * 0.20),
        fraud_penalty: a.fraud ? -15 : 0,
        fraud_flag: a.fraud,
        fraud_reasons: a.fraud ? ["Inconsistent income documentation", "Company could not be verified"] : null,
        result: a.cat,
        breakdown: { income_ratio: a.income / a.rent, contract_stable: a.contract === "permanent", docs_verified: a.docs ? 4 : 1 },
      };
    }).filter(Boolean);
    if (scoreLogs.length) await supabase.from("score_logs").insert(scoreLogs as any);

    // ───────── 9. VIEWINGS ─────────
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(10, 0, 0, 0);
    const tomorrowEnd = new Date(tomorrow); tomorrowEnd.setMinutes(30);
    const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7); nextWeek.setHours(14, 0, 0, 0);
    const nextWeekEnd = new Date(nextWeek); nextWeekEnd.setMinutes(30);
    const lastWeek = new Date(now); lastWeek.setDate(lastWeek.getDate() - 7); lastWeek.setHours(11, 0, 0, 0);
    const lastWeekEnd = new Date(lastWeek); lastWeekEnd.setMinutes(30);

    await supabase.from("viewings").insert([
      {
        agency_id: agencyId, property_id: prop1.id, application_id: insertedApps![0].id, tenant_id: tenantIds[0],
        start_time: tomorrow.toISOString(), end_time: tomorrowEnd.toISOString(),
        status: "confirmed", notes: "Bring passport.",
      },
      {
        agency_id: agencyId, property_id: prop2.id, application_id: insertedApps![1].id, tenant_id: tenantIds[1],
        start_time: nextWeek.toISOString(), end_time: nextWeekEnd.toISOString(),
        status: "pending",
      },
      {
        agency_id: agencyId, property_id: prop4.id, application_id: insertedApps![5].id, tenant_id: tenantIds[5],
        start_time: lastWeek.toISOString(), end_time: lastWeekEnd.toISOString(),
        status: "completed", notes: "Tenant interested. Drafting contract.",
      },
    ]);

    // ───────── 10. LEADS ─────────
    await supabase.from("leads").insert([
      {
        tenant_name: "Pablo Fernandez", tenant_email: "pablo.f@outlook.com", tenant_phone: "+34 611 222 333",
        property_title: prop1.title, idealista_listing_id: "IDL-2026-001", price: prop1.rent,
        message: "Hello, I am interested in this apartment. Software dev working remotely.",
        processed: false,
      },
      {
        tenant_name: "Charlotte Dubois", tenant_email: "charlotte.d@gmail.com", tenant_phone: "+33 6 98 76 54 32",
        property_title: prop2.title, idealista_listing_id: "IDL-2026-002", price: prop2.rent,
        message: "Bonjour, relocating to Madrid in September.",
        processed: true,
      },
      {
        tenant_name: "Suspicious Sender", tenant_email: "noreply@suspicious.com", tenant_phone: null,
        property_title: prop3.title, idealista_listing_id: "IDL-2026-003", price: prop3.rent,
        message: "Will pay 6 months upfront. No viewing needed.",
        processed: false,
      },
    ]);

    // ───────── 11. AGENCY APPLICATIONS (admin queue) ─────────
    // Make sure the demo agency itself shows as approved in the admin Agencies page
    const { data: existingApp } = await supabase
      .from("applications")
      .select("id")
      .eq("email", AGENCY_EMAIL)
      .maybeSingle();
    if (!existingApp) {
      await supabase.from("applications").insert({
        agency_name: "Modero Demo Rentals",
        email: AGENCY_EMAIL,
        website: "https://modero.app",
        idealista_profile: "https://idealista.com/pro/modero-demo",
        active_listings: "25",
        years_operating: "5-10",
        monthly_inquiries: "100-200",
        pitch: "Premier rentals across Madrid and Lisbon. We screen every tenant.",
        associations: "API",
        status: "approved",
      });
    } else {
      await supabase.from("applications").update({ status: "approved" }).eq("id", existingApp.id);
    }

    // Plus a couple of pending applications for the admin queue
    await supabase.from("applications").insert([
      {
        agency_name: "SunCoast Properties", email: "info@suncoastproperties.es",
        website: "https://suncoastproperties.es", status: "pending",
        idealista_profile: "https://idealista.com/pro/suncoast",
        active_listings: "25", years_operating: "5-10", monthly_inquiries: "50-100",
        pitch: "Premium Costa del Sol agency.", associations: "API, FIABCI",
      },
      {
        agency_name: "Lisboa Living", email: "contact@lisboaliving.pt",
        website: "https://lisboaliving.pt", status: "pending",
        idealista_profile: "https://idealista.pt/pro/lisboaliving",
        active_listings: "10-25", years_operating: "3-5", monthly_inquiries: "50-100",
        pitch: "Expat-focused Lisbon rentals.", associations: "APEMIP",
      },
    ]);

    results.push("✅ Seed complete — 6 tenants, 4 properties, 6 applications, 3 viewings, 3 leads, 2 agents");

    return new Response(JSON.stringify({ success: true, agencyId, adminId, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("seed-demo-data error:", error);
    return new Response(JSON.stringify({ success: false, error: error?.message ?? "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
