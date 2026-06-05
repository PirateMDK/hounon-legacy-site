import fs from "fs";
import { createClient } from "@supabase/supabase-js";

const envText = fs.readFileSync(".env", "utf8");
const env = Object.fromEntries(
  envText
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return [line, ""];
      const key = line.slice(0, idx);
      let value = line.slice(idx + 1);
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      }
      return [key, value];
    }),
);

const SUPABASE_URL = env.SUPABASE_URL || "https://dvgqbffipykrflkzsezj.supabase.co";
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = "hounonpropre@gmail.com";

if (!SUPABASE_KEY) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing in .env");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const main = async () => {
  const { data: users, error: userError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 100,
  });
  console.log("userError", userError);
  console.log("found user count", users?.users?.length);
  const user = users?.users?.find((u) => u.email === ADMIN_EMAIL);
  console.log("user", user?.id, user?.email);
  if (!user?.id) return;
  const { data: roles, error: rolesError } = await supabase
    .from("user_roles")
    .select("*")
    .eq("user_id", user.id);
  console.log("rolesError", rolesError);
  console.log("roles", roles);
  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id);
  console.log("profilesError", profilesError);
  console.log("profile", profiles);
};

main().catch((err) => {
  console.error("unexpected", err);
  process.exit(1);
});
