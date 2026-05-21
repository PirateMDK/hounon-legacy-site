import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ROLES = ["super_admin", "admin", "sub_admin", "editor", "graduate"] as const;

async function assertSuperAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (!data) throw new Error("Réservé aux Super Administrateurs.");
}

export const adminCreateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(72),
      full_name: z.string().min(1).max(120),
      role: z.enum(ROLES),
      email_confirm: z.boolean().default(true),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context.userId);

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: data.email_confirm,
      user_metadata: { full_name: data.full_name },
    });
    if (error || !created.user) throw new Error(error?.message ?? "Création échouée");

    await supabaseAdmin.from("profiles").upsert({
      id: created.user.id,
      email: data.email,
      full_name: data.full_name,
    });
    await supabaseAdmin.from("user_roles").insert({
      user_id: created.user.id,
      role: data.role as never,
    });

    return { ok: true, user_id: created.user.id };
  });
