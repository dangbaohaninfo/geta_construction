import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { formatCurrency } from "../../lib/format";
import type { ProjectSummary } from "../../lib/types";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProjectSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ProjectSummary[]>("/transactions/summary")
      .then((res) => setSummary(res.data))
      .finally(() => setLoading(false));
  }, []);

  const totalChi = summary.reduce((s, p) => s + p.totalChi, 0);
  const totalThu = summary.reduce((s, p) => s + p.totalThu, 0);
  const maxChi = Math.max(1, ...summary.map((p) => p.totalChi));

  if (loading) return <p className="text-slate-400">Đang tải...</p>;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Tổng chi</p>
          <p className="text-2xl font-semibold text-red-600">{formatCurrency(totalChi)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Tổng thu</p>
          <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(totalThu)}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-xs text-slate-500 mb-1">Số công trình</p>
          <p className="text-2xl font-semibold text-slate-800">{summary.length}</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-sm font-semibold text-slate-700 mb-4">Chi phí theo công trình</h2>
        <div className="space-y-3">
          {summary.map((p) => (
            <div key={p.projectId}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-700">
                  {p.projectCode} - {p.projectName}{" "}
                  <span className="text-slate-400">({p.count} giao dịch)</span>
                </span>
                <span className="font-medium text-red-600">{formatCurrency(p.totalChi)}</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full"
                  style={{ width: `${(p.totalChi / maxChi) * 100}%` }}
                />
              </div>
            </div>
          ))}
          {summary.length === 0 && <p className="text-slate-400 text-sm">Chưa có dữ liệu</p>}
        </div>
      </div>
    </div>
  );
}
