import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://dvgqbffipykrflkzsezj.supabase.co";
const SUPABASE_KEY = "sb_publishable_mmxmU1OvKnV5jnL83ECHBg_kVO_HB6C";
const CLIENT = createClient(SUPABASE_URL, SUPABASE_KEY);

const main = async () => {
  const { data, error } = await CLIENT.auth.signInWithPassword({
    email: "hounonpropre@gmail.com",
    password: "default1234",
  });
  console.log("error:", error);
  console.log("data:", JSON.stringify(data, null, 2));
};

main().catch((err) => {
  console.error("unexpected:", err);
  process.exit(1);
});
