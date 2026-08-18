import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { ExpenseCategory } from "../../lib/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await api.get<ExpenseCategory[]>("/categories");
    setCategories(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/categories", { name });
      setName("");
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tạo danh mục");
    }
  }

  async function toggleActive(c: ExpenseCategory) {
    await api.patch(`/categories/${c.id}`, { isActive: !c.isActive });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa danh mục này?")) return;
    try {
      await api.delete(`/categories/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể xóa (có thể đang có giao dịch liên quan)");
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-700 mb-4">Danh mục chi phí</h2>

      <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tên danh mục mới"
          className="border rounded-md px-3 py-1.5 text-sm flex-1 max-w-xs"
        />
        <button type="submit" className="bg-emerald-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-emerald-700">
          Thêm
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Tên danh mục</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-6 text-slate-400">Đang tải...</td>
              </tr>
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2">{c.name}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`text-xs px-2 py-1 rounded-full ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.isActive ? "Đang dùng" : "Ngừng"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(c.id)} className="text-red-600 text-xs hover:underline">
                      Xóa
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
