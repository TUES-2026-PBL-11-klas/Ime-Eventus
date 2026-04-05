"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/client/state/auth";
import { useRouter } from "next/navigation";
import * as categoryService from "@/services/categoryService";
import type { CategoryResponseData } from "@/schemas/auth";
import { CategoryRequestSchema } from "@/schemas/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag, Plus, Edit2, Trash2, X } from "lucide-react";

const PRESET_COLORS = [
  "bg-primary",
  "bg-accent",
  "bg-success",
  "bg-warning",
  "bg-destructive",
];

export default function CategoriesPage() {
  const { token, hasRole } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryResponseData[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasRole("ADMIN")) {
      router.replace("/dashboard");
    }
  }, [hasRole, router]);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res = await categoryService.getAllCategories(token);
    if (res.success) {
      setCategories(res.data);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setName("");
    setDescription("");
    setColor(PRESET_COLORS[0]);
    setFormError(null);
  };

  const openEdit = (cat: CategoryResponseData) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setColor(cat.color || PRESET_COLORS[0]);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsed = CategoryRequestSchema.safeParse({ name, description, color });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    if (!token) return;

    if (editingId) {
      const res = await categoryService.updateCategory(editingId, parsed.data, token);
      if (!res.success) {
        setFormError(res.error);
        return;
      }
    } else {
      const res = await categoryService.createCategory(parsed.data, token);
      if (!res.success) {
        setFormError(res.error);
        return;
      }
    }

    resetForm();
    fetchCategories();
  };

  const handleDeactivate = async (id: string) => {
    if (!token) return;
    await categoryService.deactivateCategory(id, token);
    fetchCategories();
  };

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground leading-tight">
            Categories
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage event categories and types
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        )}
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="rounded-xl bg-card border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              {editingId ? "Edit Category" : "New Category"}
            </h2>
            <button onClick={resetForm}>
              <X className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Workshop" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description" />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex items-center gap-2 mt-1">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-8 w-8 rounded-lg ${c} transition-all ${color === c ? "ring-2 ring-offset-2 ring-primary" : ""}`}
                  />
                ))}
              </div>
            </div>
            <div className="md:col-span-3 flex items-center gap-3">
              <Button type="submit">{editingId ? "Save Changes" : "Create"}</Button>
              <Button type="button" variant="ghost" onClick={resetForm}>Cancel</Button>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
            </div>
          </form>
        </div>
      )}

      {/* Category cards */}
      {loading ? (
        <div className="text-center text-sm text-muted-foreground py-8">Loading categories…</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="rounded-xl bg-card border border-border p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-lg ${cat.color || "bg-primary"} flex items-center justify-center`}
                  >
                    <Tag className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{cat.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {cat.active ? "Active" : "Inactive"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                  {cat.active && (
                    <button
                      onClick={() => handleDeactivate(cat.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{cat.description}</p>
            </div>
          ))}
          {categories.length === 0 && (
            <div className="md:col-span-3 text-center text-sm text-muted-foreground py-8">
              No categories yet. Create your first one above.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
