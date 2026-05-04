"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  updateCategory,
} from "@/services/categories";
import { uploadImage } from "@/services/products";
import type { CategoryDTO } from "@/types";
import { Upload } from "lucide-react";

export default function AdminCategoriesPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [list, setList] = useState<CategoryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [image, setImage] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setList(await fetchCategories());
    } catch {
      setMsg("Failed to load categories.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const reset = () => {
    setEditingId(null);
    setName("");
    setSortOrder("0");
    setImage("");
    setParentId("");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!name.trim()) {
      setMsg("Name is required.");
      return;
    }
    const so = Number(sortOrder);
    try {
      if (editingId) {
        await updateCategory(editingId, {
          name: name.trim(),
          sortOrder: Number.isNaN(so) ? 0 : so,
          image: image.trim(),
          parentId: parentId || undefined,
        });
        setMsg("Category updated.");
      } else {
        await createCategory({
          name: name.trim(),
          sortOrder: Number.isNaN(so) ? 0 : so,
          image: image.trim(),
          parentId: parentId || undefined,
        });
        setMsg("Category created.");
      }
      reset();
      load();
    } catch {
      setMsg("Save failed — duplicate name or unauthorized.");
    }
  };

  const startEdit = (c: CategoryDTO) => {
    setEditingId(c._id);
    setName(c.name);
    setSortOrder(String(c.sortOrder));
    setImage(c.image);
    setParentId(c.parentId ?? "");
  };

  const onDelete = async (c: CategoryDTO) => {
    if (
      !confirm(
        `Delete category "${c.name}"?\n\nAll products in this category will be permanently deleted.`
      )
    ) {
      return;
    }
    try {
      const { productsDeleted } = await deleteCategory(c._id);
      setMsg(
        productsDeleted > 0
          ? `Category deleted. ${productsDeleted} product(s) removed.`
          : "Category deleted."
      );
      load();
    } catch {
      setMsg("Delete failed.");
    }
  };

  const onFile = async (f: File | null) => {
    if (!f) return;
    setUploading(true);
    setMsg(null);
    try {
      setImage(await uploadImage(f));
    } catch {
      setMsg("Image upload failed — check internet or try a different file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Categories</h1>
        <p className="text-sm text-[#f3e8c7]/70">
          Names should match what you pick on products.{" "}
          <strong>New categories</strong> are added at the <strong>bottom</strong> of the menu
          automatically. When editing, you can change sort order (lower = higher on page).
        </p>
      </div>
      {msg && (
        <div className="rounded-xl border border-[#d5b16a]/20 bg-[#d5b16a]/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-[#d5b16a]">{msg}</div>
      )}

      <form
        onSubmit={onSubmit}
        className="grid gap-4 rounded-2xl border border-[#d5b16a]/20 bg-[#111111] p-4 sm:p-6 shadow-sm md:grid-cols-2"
      >
        <label className="text-xs font-bold uppercase text-[#d5b16a]/70">
          Name
          <input
            required
            className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        {editingId ? (
          <label className="text-xs font-bold uppercase text-[#d5b16a]/70">
            Sort order
            <input
              type="number"
              className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            />
          </label>
        ) : (
          <div className="flex items-end pb-1 text-sm text-[#f3e8c7]/70">
            <p>
              Sort: <span className="font-semibold text-[#f5d79e]">last</span> (new
              categories go to the bottom)
            </p>
          </div>
        )}
        <label className="md:col-span-2 text-xs font-bold uppercase text-[#d5b16a]/70">
          Parent category (optional, for sub-category)
          <select
            className="mt-1 w-full rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] focus:border-[#d5b16a] outline-none"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
          >
            <option value="">None (main category)</option>
            {list
              .filter((c) => c._id !== editingId)
              .map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        <div className="md:col-span-2 space-y-2">
          <label className="block text-xs font-bold uppercase text-[#d5b16a]/70">
            Thumbnail Image (Paste URL or Upload)
            <div className="flex mt-1 gap-2">
              <input
                className="flex-1 rounded-xl border border-[#d5b16a]/20 bg-[#0a0a0a] px-3 py-2 text-sm text-[#f3e8c7] outline-none focus:border-[#d5b16a] focus:ring-1 focus:ring-[#d5b16a]/50"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              {image && (
                <button
                  type="button"
                  onClick={() => setImage("")}
                  className="shrink-0 rounded-xl bg-[#d5b16a]/10 px-3 py-2 text-xs font-semibold text-[#f3e8c7]/70 hover:bg-[#d5b16a]/20"
                >
                  Clear
                </button>
              )}
            </div>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <span className="text-[10px] font-bold uppercase text-[#d5b16a]/40 shrink-0">Presets:</span>
            {[
              "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=150&q=80",
              "https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=150&q=80",
            ].map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImage(url.replace('w=150', 'w=800'))}
                className="h-8 w-8 shrink-0 overflow-hidden rounded-md border border-[#d5b16a]/20 focus:outline-none focus:ring-2 focus:ring-[#d5b16a]"
              >
                <img src={url} alt={`Preset ${i}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* File Upload Area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              if (!uploading) fileInputRef.current?.click();
            }
          }}
          className={`md:col-span-2 cursor-pointer rounded-xl border-2 border-dashed border-[#d5b16a]/40 bg-gradient-to-br from-[#111111] to-[#0a0a0a] p-3 text-center transition hover:border-[#d5b16a]/70 hover:shadow-[0_0_15px_rgba(213,177,106,0.1)] ${uploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <Upload className="mx-auto h-8 w-8 text-[#d5b16a]" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-[#f5d79e]">Upload image</p>
          <p className="mt-0.5 text-xs text-[#f3e8c7]/70">
            Click or drag PNG/JPG
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            disabled={uploading}
          />
          <p className="mt-1.5 text-xs text-[#d5b16a]/70">
            {uploading ? "Uploading…" : "Square (1:1)"}
          </p>
        </div>
        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            className="rounded-full bg-gradient-to-r from-[#b38a46] to-[#d5b16a] px-8 py-2.5 text-[10px] font-bold uppercase tracking-widest text-black shadow-[0_10px_20px_rgba(213,177,106,0.2)] hover:scale-[1.02] transition-transform"
          >
            {editingId ? "Update" : "Add category"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={reset}
              className="rounded-full border border-[#d5b16a]/20 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a]/70 hover:bg-[#d5b16a]/10 hover:text-[#d5b16a] transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-[#d5b16a]/20 bg-[#111111] scrollbar-hide">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#0a0a0a] text-xs uppercase text-[#d5b16a]/70">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  Loading…
                </td>
              </tr>
            ) : (
              list.map((c) => (
                <tr key={c._id} className="border-t border-[#d5b16a]/10">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 tabular-nums">{c.sortOrder}</td>
                  <td className="px-4 py-3">
                    {c.parentId
                      ? list.find((x) => x._id === c.parentId)?.name ?? "Unknown"
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs break-all">{c.image || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="mr-3 text-[10px] font-bold uppercase tracking-widest text-[#d5b16a] hover:text-[#f5d79e] transition-colors"
                      onClick={() => startEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-[10px] font-bold uppercase tracking-widest text-rose-500 hover:text-rose-400 transition-colors"
                      onClick={() => onDelete(c)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
