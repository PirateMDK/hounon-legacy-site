import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";

export function SiteContentEditor({ contentKey, title, fields }: {
  contentKey: string;
  title: string;
  fields: { key: string; label: string; type?: "text" | "textarea" | "boolean" | "url" }[];
}) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["site_content", contentKey],
    queryFn: async () => {
      const { data } = await supabase.from("site_content").select("value").eq("key", contentKey).maybeSingle();
      return (data?.value as Record<string, unknown>) ?? {};
    },
  });
  const [form, setForm] = useState<Record<string, unknown>>({});
  useEffect(() => { if (data) setForm(data); }, [data]);

  const save = async () => {
    const { error } = await supabase.from("site_content").upsert({ key: contentKey, value: form as never });
    if (error) { toast.error(error.message); return; }
    toast.success("Enregistré");
    qc.invalidateQueries({ queryKey: ["site_content", contentKey] });
    qc.invalidateQueries({ queryKey: [contentKey] });
  };

  return (
    <section className="sacred-card">
      <h3 className="font-display text-xl text-gold mb-4">{title}</h3>
      <div className="space-y-3">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm text-sand mb-1">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea value={String(form[f.key] ?? "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                rows={6} className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
            ) : f.type === "boolean" ? (
              <label className="inline-flex items-center gap-2 text-ivory">
                <input type="checkbox" checked={Boolean(form[f.key])} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} />
                Activer
              </label>
            ) : (
              <input type={f.type === "url" ? "url" : "text"} value={String(form[f.key] ?? "")}
                onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
            )}
          </div>
        ))}
        <button onClick={save} className="btn-primary text-sm"><Save size={14} /> Enregistrer</button>
      </div>
    </section>
  );
}
