import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Plus, Save, Eye, EyeOff } from "lucide-react";

export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "textarea" | "number" | "date" | "boolean" | "select";
  options?: string[];
  defaultValue?: string | number | boolean;
};

type Row = Record<string, unknown> & { id: string };

export function CrudPanel({
  title, table, fields, orderBy = "sort_order", filter,
}: {
  title: string;
  table: string;
  fields: FieldDef[];
  orderBy?: string;
  filter?: { column: string; value: string };
}) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Row | null>(null);

  const { data: rows, isLoading } = useQuery({
    queryKey: ["admin", table, filter?.value],
    queryFn: async () => {
      let q = supabase.from(table as never).select("*").order(orderBy as never, { ascending: true });
      if (filter) q = q.eq(filter.column as never, filter.value as never);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });

  const startNew = () => {
    const r: Row = { id: "" };
    fields.forEach((f) => { r[f.key] = f.defaultValue ?? (f.type === "boolean" ? true : f.type === "number" ? 0 : ""); });
    if (filter) r[filter.column] = filter.value;
    setEditing(r);
  };

  const save = async () => {
    if (!editing) return;
    const payload: Record<string, unknown> = {};
    fields.forEach((f) => {
      let v = editing[f.key];
      if (f.type === "number") v = Number(v) || 0;
      if (f.type === "date" && !v) v = null;
      payload[f.key] = v;
    });
    if (filter) payload[filter.column] = filter.value;
    let err;
    if (editing.id) {
      ({ error: err } = await supabase.from(table as never).update(payload as never).eq("id", editing.id));
    } else {
      ({ error: err } = await supabase.from(table as never).insert(payload as never));
    }
    if (err) { toast.error(err.message); return; }
    toast.success("Enregistré");
    setEditing(null);
    qc.invalidateQueries({ queryKey: ["admin", table] });
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer définitivement ?")) return;
    const { error } = await supabase.from(table as never).delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Supprimé");
    qc.invalidateQueries({ queryKey: ["admin", table] });
  };

  const toggleVisible = async (r: Row) => {
    if (!("visible" in r)) return;
    const { error } = await supabase.from(table as never).update({ visible: !r.visible } as never).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["admin", table] });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-gold">{title}</h2>
        <button onClick={startNew} className="btn-primary text-sm"><Plus size={14} /> Ajouter</button>
      </div>

      {isLoading ? <p className="text-sand">Chargement…</p> : (
        <div className="space-y-2">
          {(rows ?? []).map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 p-3 bg-card border border-border rounded">
              <div className="flex-1 min-w-0">
                <p className="text-ivory font-medium truncate">{String(r[fields[0].key] ?? "(sans titre)")}</p>
                {fields[1] && <p className="text-sand text-xs truncate">{String(r[fields[1].key] ?? "")}</p>}
              </div>
              <div className="flex gap-1">
                {"visible" in r && (
                  <button onClick={() => toggleVisible(r)} className="p-2 hover:text-gold text-sand" title="Visibilité">
                    {r.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                )}
                <button onClick={() => setEditing(r)} className="text-gold text-xs px-3 hover:underline">Modifier</button>
                <button onClick={() => remove(r.id)} className="p-2 text-destructive hover:text-earth-red"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
          {(rows ?? []).length === 0 && <p className="text-sand text-sm italic">Aucun élément.</p>}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card border border-gold/40 rounded-lg w-full max-w-2xl p-6 my-8">
            <h3 className="font-display text-gold text-xl mb-4">{editing.id ? "Modifier" : "Ajouter"}</h3>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm text-sand mb-1">{f.label}</label>
                  {f.type === "textarea" ? (
                    <textarea value={String(editing[f.key] ?? "")} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      rows={5} className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
                  ) : f.type === "boolean" ? (
                    <input type="checkbox" checked={Boolean(editing[f.key])} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.checked })} />
                  ) : f.type === "select" ? (
                    <select value={String(editing[f.key] ?? "")} onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-input border border-border rounded text-ivory">
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                      value={String(editing[f.key] ?? "")}
                      onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 bg-input border border-border rounded text-ivory" />
                  )}
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setEditing(null)} className="btn-outline text-sm">Annuler</button>
              <button onClick={save} className="btn-primary text-sm"><Save size={14} /> Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
