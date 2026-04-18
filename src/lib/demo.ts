// Demo / seed configuration shared across the app.
// The demo agency owns all seeded data and is also the agency that newly
// submitted tenant onboarding applications get attached to.
import { supabase } from "@/integrations/supabase/client";

export const DEMO_AGENCY_EMAIL = "demo@modero.app";
export const DEMO_ADMIN_EMAIL = "admin@modero.app";

let cachedAgencyId: string | null = null;

/** Returns the demo agency's user id, looking it up via the profiles table. */
export async function getDemoAgencyId(): Promise<string | null> {
  if (cachedAgencyId) return cachedAgencyId;
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", DEMO_AGENCY_EMAIL)
    .maybeSingle();
  cachedAgencyId = data?.id ?? null;
  return cachedAgencyId;
}

/** Returns the demo agency's first active property id (used as the default
 *  property for tenant onboarding submissions). */
export async function getDefaultPropertyId(): Promise<string | null> {
  const agencyId = await getDemoAgencyId();
  if (!agencyId) return null;
  const { data } = await supabase
    .from("properties")
    .select("id")
    .eq("agency_id", agencyId)
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data?.id ?? null;
}

/** Triggers the seed-demo-data edge function. Safe to call multiple times. */
export async function runDemoSeed(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.functions.invoke("seed-demo-data");
    if (error) return { ok: false, message: error.message };
    cachedAgencyId = (data as any)?.agencyId ?? null;
    return { ok: true, message: "Demo data seeded." };
  } catch (e: any) {
    return { ok: false, message: e?.message ?? "Seed failed" };
  }
}
