import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "https://esm.sh/@supabase/supabase-js@2.95.0/cors";

interface ApplicationData {
  id: string;
  tenant_id: string;
  employment_status: string | null;
  contract_type: string | null;
  income_monthly: number | null;
  rent: number | null;
  job_title: string | null;
  company: string | null;
  documents_complete: boolean | null;
  linkedin_verified: boolean | null;
  salary_payment_date: number | null;
}

interface TenantData {
  name: string;
  email: string;
  phone: string | null;
  nationality: string | null;
  age_range: string | null;
  country_of_birth: string | null;
  email_verified: boolean | null;
  phone_verified: boolean | null;
}

// Financial Stability: 0-35
function scoreFinancial(app: ApplicationData): number {
  let score = 0;
  const income = app.income_monthly || 0;
  const rent = app.rent || 0;

  // Income-to-rent ratio (max 20)
  if (rent > 0 && income > 0) {
    const ratio = income / rent;
    if (ratio >= 3) score += 20;
    else if (ratio >= 2.5) score += 16;
    else if (ratio >= 2) score += 12;
    else if (ratio >= 1.5) score += 8;
    else score += 4;
  } else if (income >= 2000) {
    score += 10; // Has income but no rent to compare
  }

  // Salary payment date provided (max 5)
  if (app.salary_payment_date && app.salary_payment_date >= 1 && app.salary_payment_date <= 31) {
    score += 5;
  }

  // Income level bonus (max 10)
  if (income >= 4000) score += 10;
  else if (income >= 3000) score += 8;
  else if (income >= 2000) score += 6;
  else if (income >= 1500) score += 4;
  else if (income > 0) score += 2;

  return Math.min(score, 35);
}

// Employment Trust: 0-20
function scoreEmployment(app: ApplicationData): number {
  let score = 0;

  // Employment status (max 8)
  switch (app.employment_status) {
    case "employed": score += 8; break;
    case "self-employed": score += 6; break;
    case "retired": score += 5; break;
    case "student": score += 3; break;
    case "unemployed": score += 1; break;
  }

  // Contract type (max 6)
  switch (app.contract_type) {
    case "permanent": score += 6; break;
    case "temporary": score += 4; break;
    case "freelance": score += 3; break;
    case "internship": score += 2; break;
  }

  // Job title + company provided (max 4)
  if (app.job_title) score += 2;
  if (app.company) score += 2;

  // LinkedIn verified (max 2)
  if (app.linkedin_verified) score += 2;

  return Math.min(score, 20);
}

// Document Integrity: 0-20
function scoreDocuments(app: ApplicationData, docCount: number): number {
  let score = 0;

  // Documents uploaded (max 12)
  if (docCount >= 5) score += 12;
  else if (docCount >= 3) score += 10;
  else if (docCount >= 2) score += 7;
  else if (docCount >= 1) score += 4;

  // Documents complete flag (max 8)
  if (app.documents_complete) score += 8;

  return Math.min(score, 20);
}

// Identity Risk: 0-15
function scoreIdentity(tenant: TenantData): number {
  let score = 0;

  // Email verified (max 4)
  if (tenant.email_verified) score += 4;

  // Phone provided (max 3)
  if (tenant.phone) score += 2;
  if (tenant.phone_verified) score += 1;

  // Nationality provided (max 2)
  if (tenant.nationality) score += 2;

  // Country of birth provided (max 2)
  if (tenant.country_of_birth) score += 2;

  // Age range provided (max 2)
  if (tenant.age_range) score += 2;

  // Name completeness (max 2)
  if (tenant.name && tenant.name.trim().includes(" ")) score += 2;

  return Math.min(score, 15);
}

// Fraud Signals: 0-10 (penalty-based, starts at 10)
function scoreFraud(app: ApplicationData, tenant: TenantData): { score: number; flag: boolean; reasons: string[] } {
  let penalty = 0;
  const reasons: string[] = [];

  // Mismatched or missing critical info
  if (!tenant.phone) { penalty += 2; reasons.push("No phone number provided"); }
  if (!app.employment_status) { penalty += 2; reasons.push("No employment status"); }
  if (!app.income_monthly || app.income_monthly <= 0) { penalty += 3; reasons.push("No income declared"); }
  if (!app.documents_complete) { penalty += 2; reasons.push("Incomplete documents"); }

  // Suspiciously high income with no employment
  if (app.income_monthly && app.income_monthly > 10000 && app.employment_status === "unemployed") {
    penalty += 3;
    reasons.push("High income declared with unemployed status");
  }

  const score = Math.max(10 - penalty, 0);
  const flag = penalty >= 5;

  return { score, flag, reasons };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { application_id } = await req.json();
    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    // Fetch application
    const { data: app, error: appError } = await supabase
      .from("tenant_applications")
      .select("*")
      .eq("id", application_id)
      .single();

    if (appError || !app) {
      return new Response(JSON.stringify({ error: "Application not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch tenant
    const { data: tenant, error: tenantError } = await supabase
      .from("tenants")
      .select("*")
      .eq("id", app.tenant_id)
      .single();

    if (tenantError || !tenant) {
      return new Response(JSON.stringify({ error: "Tenant not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Count documents
    const { count: docCount } = await supabase
      .from("documents")
      .select("id", { count: "exact", head: true })
      .eq("application_id", application_id);

    // Calculate scores
    const financial = scoreFinancial(app);
    const employment = scoreEmployment(app);
    const documents = scoreDocuments(app, docCount || 0);
    const identity = scoreIdentity(tenant);
    const fraud = scoreFraud(app, tenant);

    const totalScore = financial + employment + documents + identity + fraud.score;

    // Determine category — Modero Trust Score v2 bands
    let category: string;
    if (totalScore >= 80) category = "high_quality";
    else if (totalScore >= 60) category = "review";
    else if (totalScore >= 40) category = "risk";
    else category = "reject";

    let result: string;
    if (totalScore >= 80) result = "approved";
    else if (totalScore >= 60) result = "review";
    else if (totalScore >= 40) result = "risk";
    else result = "rejected";

    // Insert score log
    await supabase.from("score_logs").insert({
      application_id,
      score: totalScore,
      financial_score: financial,
      employment_score: employment,
      document_score: documents,
      identity_score: identity,
      fraud_penalty: 10 - fraud.score,
      fraud_flag: fraud.flag,
      fraud_reasons: fraud.reasons,
      result,
      breakdown: {
        financial,
        employment,
        documents,
        identity,
        fraud: fraud.score,
      },
    });

    // Update application
    // Update application — map result to status
    const status =
      result === "approved" ? "approved" :
      result === "review"   ? "under_review" :
      result === "risk"     ? "under_review" :
                              "rejected";

    await supabase
      .from("tenant_applications")
      .update({
        score: totalScore,
        score_category: category,
        fraud_flag: fraud.flag,
        status,
      })
      .eq("id", application_id);

    return new Response(
      JSON.stringify({
        score: totalScore,
        category,
        result,
        breakdown: { financial, employment, documents, identity, fraud: fraud.score },
        fraud_flag: fraud.flag,
        fraud_reasons: fraud.reasons,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (err) {
    console.error('calculate-score error:', err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
