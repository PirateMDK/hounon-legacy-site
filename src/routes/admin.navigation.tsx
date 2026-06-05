import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  ChevronUp,
  ChevronDown,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/navigation")({
  component: NavigationAdmin,
});

type NavRow = {
  id: string;
  label: string;
  url: string;
  order_position: number;
  is_visible: boolean;
  open_new_tab: boolean;
  is_core: boolean;
};

function NavigationAdmin() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-nav"],
    queryFn: async () => {
      const { data } = await supabase.from("navigation_items").select("*").order("order_position");
      return (data ?? []) as NavRow[];
    },
  });
  const [items, setItems] = useState<NavRow[]>([]);
  const [dirty, setDirty] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({
    label: "",
    url: "",
    open_new_tab: false,
    is_visible: true,
  });

  useEffect(() => {
    if (data) setItems(data);
  }, [data]);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...items];
    const j = idx + dir;
    if (j < 0 || j >= next.length) return;
    [next[idx], next[j]] = [next[j], next[idx]];
    setItems(next);
    setDirty(true);
  };

  const updateField = (id: string, field: keyof NavRow, value: string | boolean) => {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
    setDirty(true);
  };

  const toggleVisible = async (row: NavRow) => {
    const { error } = await supabase
      .from("navigation_items")
      .update({ is_visible: !row.is_visible })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries({ queryKey: ["admin-nav"] });
    qc.invalidateQueries({ queryKey: ["public-nav"] });
  };

  const remove = async (row: NavRow) => {
    if (row.is_core) {
      toast.error("Les pages principales ne peuvent pas être supprimées, seulement masquées.");
      return;
    }
    if (!confirm(`Supprimer "${row.label}" ?`)) return;
    const { error } = await supabase.from("navigation_items").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Supprimé");
    qc.invalidateQueries({ queryKey: ["admin-nav"] });
    qc.invalidateQueries({ queryKey: ["public-nav"] });
  };

  const saveAll = async () => {
    const updates = items.map((it, idx) => ({
      id: it.id,
      label: it.label,
      url: it.url,
      order_position: idx + 1,
      is_visible: it.is_visible,
      open_new_tab: it.open_new_tab,
    }));
    for (const u of updates) {
      const { error } = await supabase
        .from("navigation_items")
        .update({
          label: u.label,
          url: u.url,
          order_position: u.order_position,
          is_visible: u.is_visible,
          open_new_tab: u.open_new_tab,
        })
        .eq("id", u.id);
      if (error) {
        toast.error(error.message);
        return;
      }
    }
    toast.success("Ordre et modifications enregistrés");
    setDirty(false);
    qc.invalidateQueries({ queryKey: ["admin-nav"] });
    qc.invalidateQueries({ queryKey: ["public-nav"] });
  };

  const addItem = async () => {
    if (!newItem.label || !newItem.url) {
      toast.error("Label et URL requis");
      return;
    }
    const order = (items[items.length - 1]?.order_position ?? 0) + 1;
    const { error } = await supabase
      .from("navigation_items")
      .insert({ ...newItem, order_position: order, is_core: false });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Lien ajouté");
    setShowAdd(false);
    setNewItem({ label: "", url: "", open_new_tab: false, is_visible: true });
    qc.invalidateQueries({ queryKey: ["admin-nav"] });
    qc.invalidateQueries({ queryKey: ["public-nav"] });
  };

  return (
    <div>
      <h1 className="font-display text-3xl text-gold mb-2">Gestion des Menus</h1>
      <p className="text-sand mb-6">
        Gérez et réorganisez les éléments du menu de navigation du site public.
      </p>

      <div className="bg-gold/10 border border-gold/40 rounded p-4 text-sand text-sm mb-6">
        ℹ️ Les modifications s'appliquent immédiatement sur le menu de navigation du site public.
      </div>

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setShowAdd(true)} className="btn-outline text-sm">
          <Plus size={14} /> Ajouter un lien
        </button>
        {dirty && (
          <button onClick={saveAll} className="btn-primary text-sm">
            <Save size={14} /> Enregistrer l'ordre
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sand">Chargement…</p>
      ) : (
        <div className="space-y-2">
          {items.map((row, idx) => (
            <div
              key={row.id}
              className={`flex items-center gap-3 p-3 bg-card border rounded ${row.is_core ? "border-gold/30" : "border-border"}`}
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(idx, -1)}
                  disabled={idx === 0}
                  className="text-sand hover:text-gold disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <GripVertical size={14} className="text-sand/40" />
                <button
                  onClick={() => move(idx, 1)}
                  disabled={idx === items.length - 1}
                  className="text-sand hover:text-gold disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </div>
              <input
                value={row.label}
                onChange={(e) => updateField(row.id, "label", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 bg-input border border-border rounded text-ivory text-sm"
                placeholder="Label"
              />
              <input
                value={row.url}
                onChange={(e) => updateField(row.id, "url", e.target.value)}
                className="flex-1 min-w-0 px-2 py-1 bg-input border border-border rounded text-sand text-sm font-mono"
                placeholder="/url"
              />
              <label className="text-xs text-sand inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={row.open_new_tab}
                  onChange={(e) => updateField(row.id, "open_new_tab", e.target.checked)}
                />
                ↗
              </label>
              <button
                onClick={() => toggleVisible(row)}
                className="text-sand hover:text-gold"
                title={row.is_visible ? "Masquer" : "Afficher"}
              >
                {row.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
              {row.is_core ? (
                <span
                  className="text-xs text-gold/60 px-2"
                  title="Page principale — non supprimable"
                >
                  🔒
                </span>
              ) : (
                <button
                  onClick={() => remove(row)}
                  className="text-destructive hover:text-earth-red"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-gold/40 rounded-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-gold text-xl">Nouveau lien</h3>
              <button onClick={() => setShowAdd(false)} className="text-sand hover:text-ivory">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-sand mb-1">Label *</label>
                <input
                  value={newItem.label}
                  onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-ivory"
                />
              </div>
              <div>
                <label className="block text-sm text-sand mb-1">
                  URL * (interne /page ou externe https://…)
                </label>
                <input
                  value={newItem.url}
                  onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
                  className="w-full px-3 py-2 bg-input border border-border rounded text-ivory font-mono"
                  placeholder="/page ou https://…"
                />
              </div>
              <label className="flex items-center gap-2 text-sand text-sm">
                <input
                  type="checkbox"
                  checked={newItem.open_new_tab}
                  onChange={(e) => setNewItem({ ...newItem, open_new_tab: e.target.checked })}
                />
                Ouvrir dans un nouvel onglet
              </label>
              <label className="flex items-center gap-2 text-sand text-sm">
                <input
                  type="checkbox"
                  checked={newItem.is_visible}
                  onChange={(e) => setNewItem({ ...newItem, is_visible: e.target.checked })}
                />
                Visible
              </label>
            </div>
            <div className="flex gap-3 mt-6 justify-end">
              <button onClick={() => setShowAdd(false)} className="btn-outline text-sm">
                Annuler
              </button>
              <button onClick={addItem} className="btn-primary text-sm">
                <Save size={14} /> Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
