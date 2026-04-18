// Invite agency team members to the agency portal.
// Uses Supabase Auth admin invite — no custom email domain required.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InviteMember {
  name: string;
  email: string;
  agency_id: string;
  agency_name: string;
  role?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { members } = (await req.json()) as { members: InviteMember[] };

    if (!Array.isArray(members) || members.length === 0) {
      return new Response(JSON.stringify({ invited: 0, skipped: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const results: Array<{ email: string; status: string; error?: string }> = [];

    for (const m of members) {
      if (!m.email?.trim()) {
        results.push({ email: m.email || "", status: "skipped", error: "no email" });
        continue;
      }

      // Check if user already exists — skip invite if so.
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .ilike("email", m.email.trim())
        .maybeSingle();

      if (existing) {
        results.push({ email: m.email, status: "already_exists" });
        continue;
      }

      const { error } = await admin.auth.admin.inviteUserByEmail(m.email.trim(), {
        data: {
          full_name: m.name,
          agency_name: m.agency_name,
          agency_id: m.agency_id,
          role: m.role || "Agent",
          user_type: "agency_member",
        },
      });

      if (error) {
        results.push({ email: m.email, status: "failed", error: error.message });
      } else {
        results.push({ email: m.email, status: "invited" });
      }
    }

    const invited = results.filter((r) => r.status === "invited").length;
    const skipped = results.filter((r) => r.status !== "invited").length;

    return new Response(JSON.stringify({ invited, skipped, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("invite-agency-team error", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
