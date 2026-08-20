import { useEffect, useState, type FormEvent } from "react";
import { api } from "../../lib/api";
import type { Employee } from "../../lib/types";

const emptyForm = { name: "", role: "" };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await api.get<Employee[]>("/employees");
    setEmployees(res.data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/employees", form);
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tạo nhân viên");
    }
  }

  async function toggleActive(emp: Employee) {
    await api.patch(`/employees/${emp.id}`, { isActive: !emp.isActive });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa nhân viên này? Dữ liệu chấm công liên quan cũng nên được kiểm tra trước.")) return;
    try {
      await api.delete(`/employees/${id}`);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể xóa (có thể đang có dữ liệu chấm công liên quan)");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Danh sách nhân viên</h2>
        <button onClick={() => setShowForm((s) => !s)} className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700">
          {showForm ? "Đóng" : "+ Thêm nhân viên"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Tên nhân viên</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Vai trò</label>
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full border rounded-md px-2 py-1.5 text-sm" placeholder="Thợ hàn, Thợ điện, ..." />
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
              <th className="text-left px-3 py-2">Tên nhân viên</th>
              <th className="text-left px-3 py-2">Vai trò</th>
              <th className="text-left px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-6 text-slate-400">Đang tải...</td>
              </tr>
            ) : (
              employees.map((emp) => (
                <tr key={emp.id} className="border-t">
                  <td className="px-3 py-2">{emp.name}</td>
                  <td className="px-3 py-2 text-slate-500">{emp.role}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleActive(emp)}
                      className={`text-xs px-2 py-1 rounded-full ${emp.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {emp.isActive ? "Đang làm việc" : "Ngừng"}
                    </button>
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => handleDelete(emp.id)} className="text-red-600 text-xs hover:underline">
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
