import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import type { Employee, Project, Timesheet } from "../lib/types";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function daysInMonth(year: number, month: number) {
  const days: Date[] = [];
  const last = new Date(year, month, 0).getDate();
  for (let d = 1; d <= last; d++) days.push(new Date(year, month - 1, d));
  return days;
}

const weekdayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

export default function AttendancePage() {
  const now = new Date();
  const [month, setMonth] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}`);
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get<Project[]>("/projects").then((res) => setProjects(res.data));
    api.get<Employee[]>("/employees").then((res) => setEmployees(res.data));
  }, []);

  const [year, monthNum] = month.split("-").map(Number);
  const days = useMemo(() => daysInMonth(year, monthNum), [year, monthNum]);

  async function loadTimesheets() {
    setLoading(true);
    setError("");
    try {
      const from = toDateStr(days[0]);
      const to = toDateStr(days[days.length - 1]);
      const params: Record<string, string> = { from, to };
      if (selectedProjectId) params.projectId = selectedProjectId;
      const res = await api.get<Timesheet[]>("/timesheets", { params });
      setTimesheets(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Không tải được dữ liệu chấm công");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTimesheets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, selectedProjectId]);

  const activeEmployees = employees.filter((e) => e.isActive);

  function findEntry(employeeId: string, dateStr: string) {
    return timesheets.find((t) => t.employeeId === employeeId && t.date.slice(0, 10) === dateStr);
  }

  async function handleCellCommit(employeeId: string, dateStr: string, rawValue: string) {
    const trimmed = rawValue.trim();
    const existing = findEntry(employeeId, dateStr);

    if (trimmed === "" || trimmed === "-") {
      if (existing) {
        await api.delete(`/timesheets/${existing.id}`);
        loadTimesheets();
      }
      return;
    }

    const hours = Number(trimmed);
    if (Number.isNaN(hours) || hours < 0 || hours > 24) return;
    if (existing && existing.hoursWorked === hours) return;

    try {
      await api.post("/timesheets", {
        employeeId,
        projectId: selectedProjectId,
        date: dateStr,
        hoursWorked: hours,
      });
      loadTimesheets();
    } catch (err: any) {
      alert(err?.response?.data?.message ?? "Không thể lưu chấm công");
    }
  }

  function employeeTotal(employeeId: string) {
    return timesheets.filter((t) => t.employeeId === employeeId).reduce((s, t) => s + t.hoursWorked, 0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Chấm công</h1>
          <p className="text-xs text-slate-500 mt-1">Nhập số giờ làm việc thực tế theo từng nhân viên, từng ngày</p>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-4 mb-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Tháng</label>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-md px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Công trình</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setEditMode(false);
            }}
            className="border rounded-md px-2 py-1.5 text-sm min-w-[220px]"
          >
            <option value="">Tất cả công trình</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>
        </div>
        <div className="ml-auto">
          <button
            type="button"
            disabled={!selectedProjectId}
            onClick={() => setEditMode((s) => !s)}
            title={!selectedProjectId ? "Chọn một công trình cụ thể để chỉnh sửa chấm công" : undefined}
            className={`text-sm font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
              editMode ? "bg-emerald-600 text-white hover:bg-emerald-700" : "bg-slate-800 text-white hover:bg-slate-700"
            }`}
          >
            {editMode ? "Hoàn tất chỉnh sửa" : "Chỉnh sửa"}
          </button>
        </div>
      </div>

      {!selectedProjectId && (
        <p className="text-xs text-amber-600 mb-3">
          Đang xem tổng hợp tất cả công trình. Để nhập/sửa giờ công, hãy chọn một công trình cụ thể ở trên.
        </p>
      )}
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase">
              <th className="text-left px-3 py-2 sticky left-0 bg-slate-50 min-w-[160px]">Nhân viên</th>
              {days.map((d) => (
                <th key={toDateStr(d)} className={`px-1 py-2 text-center w-8 ${d.getDay() === 0 ? "text-red-500" : ""}`}>
                  <div>{weekdayLabels[d.getDay()]}</div>
                  <div>{d.getDate()}</div>
                </th>
              ))}
              <th className="px-3 py-2 text-right min-w-[70px]">Tổng</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={days.length + 2} className="text-center py-6 text-slate-400">
                  Đang tải...
                </td>
              </tr>
            )}
            {!loading && activeEmployees.length === 0 && (
              <tr>
                <td colSpan={days.length + 2} className="text-center py-6 text-slate-400">
                  Chưa có nhân viên nào. Thêm nhân viên tại trang Quản trị.
                </td>
              </tr>
            )}
            {!loading &&
              activeEmployees.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-1.5 font-medium text-slate-700 sticky left-0 bg-white whitespace-nowrap">{emp.name}</td>
                  {days.map((d) => {
                    const dateStr = toDateStr(d);
                    const entry = findEntry(emp.id, dateStr);
                    const val = entry ? String(entry.hoursWorked) : "";
                    const colorClass =
                      val === ""
                        ? "text-slate-300"
                        : Number(val) === 0
                        ? "text-red-500 font-semibold"
                        : Number(val) < 8
                        ? "text-orange-500 font-semibold"
                        : "text-emerald-600 font-semibold";
                    return (
                      <td key={dateStr} className="p-0 text-center border-l">
                        {editMode ? (
                          <input
                            type="text"
                            defaultValue={val}
                            onBlur={(e) => handleCellCommit(emp.id, dateStr, e.target.value)}
                            className={`w-8 h-8 text-center bg-transparent outline-none focus:bg-indigo-50 text-xs ${colorClass}`}
                          />
                        ) : (
                          <div className={`w-8 h-8 flex items-center justify-center text-xs ${colorClass}`}>{val}</div>
                        )}
                      </td>
                    );
                  })}
                  <td className="px-3 py-1.5 text-right font-semibold text-slate-700">{employeeTotal(emp.id)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
