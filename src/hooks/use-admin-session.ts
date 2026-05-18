import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAdminSession() {
  const [state, setState] = useState<{
    loading: boolean;
    userId: string | null;
    email: string | null;
    isStaff: boolean;
  }>({ loading: true, userId: null, email: null, isStaff: false });

  useEffect(() => {
    let mounted = true;
    const check = async (uid: string | null, email: string | null) => {
      if (!uid) {
        if (mounted) setState({ loading: false, userId: null, email: null, isStaff: false });
        return;
      }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid);
      const roles = (data ?? []).map((r) => r.role);
      const isStaff = roles.includes("super_admin" as never) || roles.includes("editor" as never);
      if (mounted) setState({ loading: false, userId: uid, email, isStaff });
    };
    supabase.auth.getSession().then(({ data }) => {
      check(data.session?.user.id ?? null, data.session?.user.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      check(session?.user.id ?? null, session?.user.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}
