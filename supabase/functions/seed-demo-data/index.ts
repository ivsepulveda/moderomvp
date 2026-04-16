import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Verify the caller is an authenticated admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin");
    if (!roleData || roleData.length === 0) {
      return new Response(JSON.stringify({ error: "Forbidden: admin role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: string[] = [];

    // Helper to create auth user
    async function createUser(email: string, password: string, meta: Record<string, string>) {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: meta,
      });
      if (error && error.message.includes("already been registered")) {
        // fetch existing
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users?.find((u: any) => u.email === email);
        if (existing) return existing.id;
        throw error;
      }
      if (error) throw error;
      return data.user.id;
    }

    // ─── 1. ADMIN USER ───
    const adminId = await createUser("admin@modero.io", "Admin123!", { full_name: "Admin User" });
    results.push(`Admin user: admin@modero.io / Admin123!`);

    // Set admin role
    await supabase.from("user_roles").upsert({ user_id: adminId, role: "admin" }, { onConflict: "user_id,role" });

    // Update admin profile
    await supabase.from("profiles").upsert({
      id: adminId,
      email: "admin@modero.io",
      full_name: "Admin User",
      onboarding_completed: true,
    }, { onConflict: "id" });

    // ─── 2. AGENCY 1 — Onboarded ───
    const agency1Id = await createUser("agency1@premierrentals.es", "Agency123!", { full_name: "Carlos Mendez" });
    results.push(`Agency 1: agency1@premierrentals.es / Agency123!`);

    await supabase.from("user_roles").upsert({ user_id: agency1Id, role: "agency" }, { onConflict: "user_id,role" });
    await supabase.from("profiles").upsert({
      id: agency1Id,
      email: "agency1@premierrentals.es",
      full_name: "Carlos Mendez",
      agency_name: "Premier Rentals Madrid",
      notification_email: "viewings@premierrentals.es",
      onboarding_completed: true,
    }, { onConflict: "id" });

    // Agency 1 agents
    await supabase.from("agency_agents").insert([
      {
        agency_id: agency1Id,
        name: "Maria Lopez",
        email: "maria@premierrentals.es",
        phone: "+34 612 345 678",
        permissions: { view_tenants: true, approve_tenants: true, schedule_viewings: true, manage_listings: false },
      },
      {
        agency_id: agency1Id,
        name: "Juan Garcia",
        email: "juan@premierrentals.es",
        phone: "+34 612 987 654",
        permissions: { view_tenants: true, approve_tenants: false, schedule_viewings: true, manage_listings: true },
      },
    ]);

    // ─── 3. AGENCY 2 — Not onboarded ───
    const agency2Id = await createUser("agency2@costahomes.pt", "Agency123!", { full_name: "Ana Silva" });
    results.push(`Agency 2 (not onboarded): agency2@costahomes.pt / Agency123!`);

    await supabase.from("user_roles").upsert({ user_id: agency2Id, role: "agency" }, { onConflict: "user_id,role" });
    await supabase.from("profiles").upsert({
      id: agency2Id,
      email: "agency2@costahomes.pt",
      full_name: "Ana Silva",
      agency_name: null,
      onboarding_completed: false,
    }, { onConflict: "id" });

    // ─── 4. PROPERTIES for Agency 1 ───
    const { data: props } = await supabase.from("properties").insert([
      {
        agency_id: agency1Id,
        title: "Luxury 2BR Apartment - Salamanca",
        address: "Calle Serrano 42, 28001 Madrid",
        rent: 2200,
        currency: "EUR",
        bedrooms: 2,
        bathrooms: 2,
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
      },
      {
        agency_id: agency1Id,
        title: "Cozy Studio - Malasaña",
        address: "Calle Fuencarral 88, 28004 Madrid",
        rent: 1100,
        currency: "EUR",
        bedrooms: 0,
        bathrooms: 1,
        is_active: true,
        listing_rules: {
          min_income_ratio: 2.5,
          require_linkedin: false,
          require_payslips: true,
          require_db_credit: true,
          require_biometric_id: true,
          require_work_contract: false,
          require_nie: false,
          require_tax_return: false,
          residency_history_check: false,
          scoring_weights: { identity: 25, linkedin: 10, db_credit: 35, residency: 15, verification: 15 },
        },
      },
      {
        agency_id: agency1Id,
        title: "Family 3BR - Chamberí",
        address: "Paseo de la Castellana 120, 28046 Madrid",
        rent: 3500,
        currency: "EUR",
        bedrooms: 3,
        bathrooms: 2,
        is_active: true,
        listing_rules: {
          min_income_ratio: 3,
          require_linkedin: true,
          require_payslips: true,
          require_db_credit: true,
          require_biometric_id: true,
          require_work_contract: true,
          require_nie: true,
          require_tax_return: true,
          residency_history_check: true,
          scoring_weights: { identity: 20, linkedin: 20, db_credit: 30, residency: 15, verification: 15 },
        },
      },
    ]).select();

    const prop1Id = props![0].id;
    const prop2Id = props![1].id;
    const prop3Id = props![2].id;

    // ─── 5. TENANTS ───
    const tenant1Id_auth = await createUser("tenant1@gmail.com", "Tenant123!", { full_name: "Emma Johnson", user_type: "tenant" });
    const tenant2Id_auth = await createUser("tenant2@gmail.com", "Tenant123!", { full_name: "Luca Rossi", user_type: "tenant" });
    const tenant3Id_auth = await createUser("tenant3@gmail.com", "Tenant123!", { full_name: "Sophie Martin", user_type: "tenant" });
    const tenant4Id_auth = await createUser("tenant4@gmail.com", "Tenant123!", { full_name: "Hans Mueller", user_type: "tenant" });
    const tenant5Id_auth = await createUser("tenant5@gmail.com", "Tenant123!", { full_name: "Yuki Tanaka", user_type: "tenant" });

    results.push("Tenants: tenant1-5@gmail.com / Tenant123!");

    // The handle_new_tenant trigger should have created tenants, but let's upsert to be sure
    const tenantData = [
      { user_id: tenant1Id_auth, name: "Emma Johnson", email: "tenant1@gmail.com", phone: "+44 7700 900001", nationality: "British", country_of_birth: "United Kingdom", age_range: "25-34", linkedin_profile: "https://linkedin.com/in/emmajohnson", linkedin_verified: true, email_verified: true },
      { user_id: tenant2Id_auth, name: "Luca Rossi", email: "tenant2@gmail.com", phone: "+39 320 123 4567", nationality: "Italian", country_of_birth: "Italy", age_range: "30-39", linkedin_profile: "https://linkedin.com/in/lucarossi", linkedin_verified: true, email_verified: true },
      { user_id: tenant3Id_auth, name: "Sophie Martin", email: "tenant3@gmail.com", phone: "+33 6 12 34 56 78", nationality: "French", country_of_birth: "France", age_range: "22-28", linkedin_profile: null, linkedin_verified: false, email_verified: true },
      { user_id: tenant4Id_auth, name: "Hans Mueller", email: "tenant4@gmail.com", phone: "+49 170 1234567", nationality: "German", country_of_birth: "Germany", age_range: "35-44", linkedin_profile: "https://linkedin.com/in/hansmueller", linkedin_verified: true, email_verified: true },
      { user_id: tenant5Id_auth, name: "Yuki Tanaka", email: "tenant5@gmail.com", phone: "+81 90 1234 5678", nationality: "Japanese", country_of_birth: "Japan", age_range: "28-35", linkedin_profile: null, linkedin_verified: false, email_verified: true },
    ];

    // Get or create tenants
    const tenantIds: string[] = [];
    for (const t of tenantData) {
      const { data: existing } = await supabase.from("tenants").select("id").eq("user_id", t.user_id).maybeSingle();
      if (existing) {
        await supabase.from("tenants").update(t).eq("id", existing.id);
        tenantIds.push(existing.id);
      } else {
        const { data: created } = await supabase.from("tenants").insert(t).select("id").single();
        tenantIds.push(created!.id);
      }
    }

    // ─── 6. TENANT APPLICATIONS ───
    const { data: apps } = await supabase.from("tenant_applications").insert([
      {
        agency_id: agency1Id,
        property_id: prop1Id,
        tenant_id: tenantIds[0],
        status: "approved",
        employment_status: "employed",
        job_title: "Software Engineer",
        company: "Google",
        contract_type: "permanent",
        income_monthly: 7500,
        rent: 2200,
        score: 87,
        score_category: "excellent",
        documents_complete: true,
        linkedin_verified: true,
        fraud_flag: false,
      },
      {
        agency_id: agency1Id,
        property_id: prop2Id,
        tenant_id: tenantIds[1],
        status: "approved",
        employment_status: "employed",
        job_title: "Product Designer",
        company: "Spotify",
        contract_type: "permanent",
        income_monthly: 5000,
        rent: 1100,
        score: 78,
        score_category: "good",
        documents_complete: true,
        linkedin_verified: true,
        fraud_flag: false,
      },
      {
        agency_id: agency1Id,
        property_id: prop1Id,
        tenant_id: tenantIds[2],
        status: "pending",
        employment_status: "employed",
        job_title: "Marketing Coordinator",
        company: "L'Oréal",
        contract_type: "temporary",
        income_monthly: 3200,
        rent: 2200,
        score: 52,
        score_category: "fair",
        documents_complete: false,
        linkedin_verified: false,
        fraud_flag: false,
      },
      {
        agency_id: agency1Id,
        property_id: prop3Id,
        tenant_id: tenantIds[3],
        status: "rejected",
        employment_status: "self-employed",
        job_title: "Freelance Consultant",
        company: "Self",
        contract_type: "freelance",
        income_monthly: 8000,
        rent: 3500,
        score: 41,
        score_category: "poor",
        documents_complete: true,
        linkedin_verified: true,
        fraud_flag: true,
      },
      {
        agency_id: agency1Id,
        property_id: prop2Id,
        tenant_id: tenantIds[4],
        status: "pending",
        employment_status: "employed",
        job_title: "Data Analyst",
        company: "Remote Corp",
        contract_type: "permanent",
        income_monthly: 4500,
        rent: 1100,
        score: 0,
        score_category: null,
        documents_complete: false,
        linkedin_verified: false,
        fraud_flag: false,
      },
    ]).select();

    const app1Id = apps![0].id;
    const app2Id = apps![1].id;
    const app3Id = apps![2].id;
    const app4Id = apps![3].id;

    // ─── 7. SCORE LOGS ───
    await supabase.from("score_logs").insert([
      {
        application_id: app1Id,
        score: 87,
        financial_score: 28,
        employment_score: 18,
        document_score: 14,
        identity_score: 18,
        fraud_penalty: 0,
        fraud_flag: false,
        result: "excellent",
        breakdown: { income_ratio: 3.4, contract_stable: true, docs_verified: 4 },
      },
      {
        application_id: app2Id,
        score: 78,
        financial_score: 25,
        employment_score: 17,
        document_score: 12,
        identity_score: 16,
        fraud_penalty: 0,
        fraud_flag: false,
        result: "good",
        breakdown: { income_ratio: 4.5, contract_stable: true, docs_verified: 3 },
      },
      {
        application_id: app3Id,
        score: 52,
        financial_score: 12,
        employment_score: 10,
        document_score: 8,
        identity_score: 14,
        fraud_penalty: 0,
        fraud_flag: false,
        result: "fair",
        breakdown: { income_ratio: 1.45, contract_stable: false, docs_verified: 1 },
      },
      {
        application_id: app4Id,
        score: 41,
        financial_score: 20,
        employment_score: 8,
        document_score: 13,
        identity_score: 15,
        fraud_penalty: -15,
        fraud_flag: true,
        fraud_reasons: ["Inconsistent income documentation", "Company could not be verified"],
        result: "poor",
        breakdown: { income_ratio: 2.3, contract_stable: false, docs_verified: 3 },
      },
    ]);

    // ─── 8. VIEWINGS ───
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    await supabase.from("viewings").insert([
      {
        agency_id: agency1Id,
        property_id: prop1Id,
        application_id: app1Id,
        tenant_id: tenantIds[0],
        start_time: new Date(tomorrow.setHours(10, 0, 0)).toISOString(),
        end_time: new Date(tomorrow.setHours(10, 30, 0)).toISOString(),
        status: "confirmed",
        notes: "Tenant confirmed via email. Bring passport.",
      },
      {
        agency_id: agency1Id,
        property_id: prop2Id,
        application_id: app2Id,
        tenant_id: tenantIds[1],
        start_time: new Date(nextWeek.setHours(14, 0, 0)).toISOString(),
        end_time: new Date(nextWeek.setHours(14, 30, 0)).toISOString(),
        status: "pending",
        notes: null,
      },
      {
        agency_id: agency1Id,
        property_id: prop1Id,
        application_id: app1Id,
        tenant_id: tenantIds[0],
        start_time: new Date(lastWeek.setHours(11, 0, 0)).toISOString(),
        end_time: new Date(lastWeek.setHours(11, 30, 0)).toISOString(),
        status: "completed",
        notes: "Tenant liked the property. Proceeding with contract.",
      },
    ]);

    // ─── 9. LEADS ───
    await supabase.from("leads").insert([
      {
        tenant_name: "Pablo Fernandez",
        tenant_email: "pablo.f@outlook.com",
        tenant_phone: "+34 611 222 333",
        property_title: "Luxury 2BR Apartment - Salamanca",
        idealista_listing_id: "IDL-2024-001",
        price: 2200,
        message: "Hello, I am interested in renting this apartment. I am a software developer working remotely. Available for viewings any day.",
        processed: false,
      },
      {
        tenant_name: "Charlotte Dubois",
        tenant_email: "charlotte.d@gmail.com",
        tenant_phone: "+33 6 98 76 54 32",
        property_title: "Cozy Studio - Malasaña",
        idealista_listing_id: "IDL-2024-002",
        price: 1100,
        message: "Bonjour, I am relocating to Madrid for work in September. Very interested in this studio.",
        processed: true,
      },
      {
        tenant_name: "Unknown Sender",
        tenant_email: "noreply@suspicious.com",
        tenant_phone: null,
        property_title: "Family 3BR - Chamberí",
        idealista_listing_id: "IDL-2024-003",
        price: 3500,
        message: "I want to rent immediately. Can pay 6 months upfront. No need for viewing.",
        processed: false,
      },
    ]);

    // ─── 10. AGENCY APPLICATIONS (network applications) ───
    await supabase.from("applications").insert([
      {
        agency_name: "SunCoast Properties",
        email: "info@suncoastproperties.es",
        website: "https://suncoastproperties.es",
        status: "pending",
        idealista_profile: "https://idealista.com/pro/suncoast",
        active_listings: "25",
        years_operating: "8",
        monthly_inquiries: "120",
        pitch: "We manage premium beach properties along Costa del Sol with 98% occupancy rate.",
        associations: "API, FIABCI",
      },
      {
        agency_name: "Lisboa Living",
        email: "contact@lisboaliving.pt",
        website: "https://lisboaliving.pt",
        status: "pending",
        idealista_profile: "https://idealista.pt/pro/lisboaliving",
        active_listings: "15",
        years_operating: "5",
        monthly_inquiries: "80",
        pitch: "Specializing in expat rentals across Lisbon, we handle relocation packages end-to-end.",
        associations: "APEMIP",
      },
    ]);

    results.push("---");
    results.push("✅ Seed complete! Login credentials:");
    results.push("Admin: admin@modero.io / Admin123!");
    results.push("Agency 1 (onboarded): agency1@premierrentals.es / Agency123!");
    results.push("Agency 2 (not onboarded): agency2@costahomes.pt / Agency123!");
    results.push("Tenants: tenant1@gmail.com through tenant5@gmail.com / Tenant123!");
    results.push("---");
    results.push("Data created: 3 properties, 5 applications, 4 scores, 3 viewings, 3 leads, 2 network applications, 2 agents");

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error('seed-demo-data error:', error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
