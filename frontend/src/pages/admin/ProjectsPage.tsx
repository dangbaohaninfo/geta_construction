import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { Project } from "../../lib/types";

const emptyForm = { name: "", code: "", note: "" };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await api.get<Project[]>("/projects");
    setProjects(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/projects", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tạo công trình");
    }
  }

  async function toggleActive(p: Project) {
    await api.patch(`/projects/${p.id}`, { isActive: !p.isActive });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa công trình này? Các giao dịch liên quan cũng nên được kiểm tra trước.")) return;
    try {
      await api.delete(`/projects/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể xóa (có thể đang có giao dịch liên quan)");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Danh sách công trình</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700">
          {showForm ? "Đóng" : "+ Thêm công trình"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mã công trình</label>
            <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tên công trình</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
            <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          {error && <p className="md:col-span-3 text-sm text-red-600">{error}</p>}
          <div className="md:col-span-3">
            <button type="submit" className="bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700">
              Lưu
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Mã</th>
              <th className="text-left px-3 py-2">Tên công trình</th>
              <th className="text-left px-3 py-2">Ghi chú</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400">Đang tải...</td>
              </tr>
            ) : (
              projects.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="px-3 py-2">{p.code}</td>
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2 text-slate-500">{p.note}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`text-xs px-2 py-1 rounded-full ${p.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {p.isActive ? "Đang hoạt động" : "Ngừng"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-600 text-xs hover:underline">
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
