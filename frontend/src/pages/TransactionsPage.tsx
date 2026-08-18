import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatCurrency, formatDate } from "../lib/format";
import { useAuth } from "../lib/auth-context";
import { NumberInput } from "../components/NumberInput";
import type { ExpenseCategory, Project, Transaction, TransactionListResponse, TransactionType } from "../lib/types";

const emptyForm = {
  projectId: "",
  categoryId: "",
  type: "CHI" as TransactionType,
  amount: "",
  date: new Date().toISOString().slice(0, 10),
  note: "",
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [data, setData] = useState<TransactionListResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filterProject, setFilterProject] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get("/projects").then((res) => setProjects(res.data));
    api.get("/categories").then((res) => setCategories(res.data));
  }, []);

  async function loadTransactions() {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (filterProject) params.projectId = filterProject;
      if (filterCategory) params.categoryId = filterCategory;
      if (filterFrom) params.from = filterFrom;
      if (filterTo) params.to = filterTo;
      const res = await api.get<TransactionListResponse>("/transactions", { params });
      setData(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không tải được dữ liệu");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterProject, filterCategory, filterFrom, filterTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("projectId", form.projectId);
      fd.append("categoryId", form.categoryId);
      fd.append("type", form.type);
      fd.append("amount", form.amount);
      fd.append("date", form.date);
      if (form.note) fd.append("note", form.note);
      if (file) fd.append("attachment", file);

      await api.post("/transactions", fd, { headers: { "Content-Type": "multipart/form-data" } });
      setForm(emptyForm);
      setFile(null);
      setShowForm(false);
      loadTransactions();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không thể tạo giao dịch");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Xóa giao dịch này?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      loadTransactions();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể xóa");
    }
  }

  function canManage(t: Transaction) {
    return user?.role === "ADMIN" || user?.id === t.createdById;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-slate-800">Giao dịch chi phí công trình</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          {showForm ? "Đóng" : "+ Thêm giao dịch"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Công trình</label>
            <select
              required
              value={form.projectId}
              onChange={(e) => setForm({ ...form, projectId: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">-- Chọn công trình --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Danh mục chi phí</label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Loại</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TransactionType })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            >
              <option value="CHI">Chi</option>
              <option value="THU">Thu</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Số tiền (VNĐ)</label>
            <NumberInput
              required
              value={form.amount}
              onChange={(v) => setForm({ ...form, amount: v })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Ngày</label>
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Hóa đơn/chứng từ đính kèm</label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Ghi chú</label>
            <input
              type="text"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full border rounded-md px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-600 text-white text-sm px-4 py-2 rounded-md hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Đang lưu..." : "Lưu giao dịch"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border rounded-lg p-4 mb-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Lọc công trình</label>
          <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm">
            <option value="">Tất cả</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Lọc danh mục</label>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm">
            <option value="">Tất cả</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Từ ngày</label>
          <input type="date" value={filterFrom} onChange={(e) => setFilterFrom(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Đến ngày</label>
          <input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} className="w-full border rounded-md px-2 py-1.5 text-sm" />
        </div>
      </div>

      {data && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-3 mb-4 text-sm text-indigo-900">
          Tổng cộng <strong>{data.total}</strong> giao dịch — Tổng số tiền: <strong>{formatCurrency(data.totalAmount)}</strong>
        </div>
      )}

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Ngày</th>
              <th className="text-left px-3 py-2">Công trình</th>
              <th className="text-left px-3 py-2">Danh mục</th>
              <th className="text-left px-3 py-2">Loại</th>
              <th className="text-right px-3 py-2">Số tiền</th>
              <th className="text-left px-3 py-2">Ghi chú</th>
              <th className="text-left px-3 py-2">Đính kèm</th>
              <th className="text-left px-3 py-2">Người tạo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-slate-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && data?.items.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center py-6 text-slate-400">
                  Chưa có giao dịch nào
                </td>
              </tr>
            )}
            {!loading &&
              data?.items.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(t.date)}</td>
                  <td className="px-3 py-2">
                    {t.project.code} - {t.project.name}
                  </td>
                  <td className="px-3 py-2">{t.category.name}</td>
                  <td className="px-3 py-2">
                    <span className={t.type === "CHI" ? "text-red-600" : "text-emerald-600"}>{t.type === "CHI" ? "Chi" : "Thu"}</span>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">{formatCurrency(t.amount)}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate">{t.note}</td>
                  <td className="px-3 py-2">
                    {t.attachmentUrl ? (
                      <a href={t.attachmentUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">
                        Xem file
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{t.createdBy.name}</td>
                  <td className="px-3 py-2 text-right">
                    {canManage(t) && (
                      <button onClick={() => handleDelete(t.id)} className="text-red-600 text-xs hover:underline">
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
