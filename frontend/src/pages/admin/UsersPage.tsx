import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import { formatDate } from "../../lib/format";
import type { Role, User } from "../../lib/types";

const emptyForm = { name: "", email: "", password: "", role: "STAFF" as Role };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await api.get<User[]>("/users");
    setUsers(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/users", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tạo người dùng");
    }
  }

  async function handleRoleChange(id: string, role: Role) {
    await api.patch(`/users/${id}`, { role });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa người dùng này?")) return;
    try {
      await api.delete(`/users/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể xóa");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Danh sách người dùng</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700">
          {showForm ? "Đóng" : "+ Thêm người dùng"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Họ tên</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Mật khẩu</label>
            <input required type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vai trò</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="w-full border rounded-md px-2 py-1.5 text-sm">
              <option value="STAFF">Nhân viên</option>
              <option value="ADMIN">Quản trị</option>
            </select>
          </div>
          {error && <p className="md:col-span-4 text-sm text-red-600">{error}</p>}
          <div className="md:col-span-4">
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
              <th className="text-left px-3 py-2">Họ tên</th>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Vai trò</th>
              <th className="text-left px-3 py-2">Ngày tạo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-slate-400">Đang tải...</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">
                    <select value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value as Role)} className="border rounded-md px-2 py-1 text-xs">
                      <option value="STAFF">Nhân viên</option>
                      <option value="ADMIN">Quản trị</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">{formatDate(u.createdAt)}</td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 text-xs hover:underline">
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
