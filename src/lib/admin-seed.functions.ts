import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ADMIN_EMAIL = "hounonpropre@gmail.com";
const ADMIN_DEFAULT_PASSWORD = "default1234";

export const ensureAdminSeeded = createServerFn({ method: "POST" }).handler(async () => {
  // Check if any user with this email already exists
  const { data: list } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  const existing = list?.users?.find((u) => u.email === ADMIN_EMAIL);
  let userId = existing?.id;
  if (!userId) {
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_DEFAULT_PASSWORD,
      email_confirm: true,
      user_metadata: { full_name: "Hounon Propre" },
    });
    if (error) return { ok: false, error: error.message };
    userId = data.user?.id;
  }
  if (!userId) return { ok: false, error: "no user id" };
  // Ensure super_admin role
  await supabaseAdmin.from("user_roles").upsert(
    { user_id: userId, role: "super_admin" as never },
    { onConflict: "user_id,role" }
  );
  // Ensure profile
  await supabaseAdmin.from("profiles").upsert({ id: userId, email: ADMIN_EMAIL, full_name: "Hounon Propre" });
  return { ok: true };
});
