import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-md text-sm font-medium ${
      isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Quản trị</h1>
      <div className="flex gap-1 mb-6 border-b pb-3">
        <NavLink to="/admin" end className={linkClass}>
          Tổng quan
        </NavLink>
        <NavLink to="/admin/users" className={linkClass}>
          Người dùng
        </NavLink>
        <NavLink to="/admin/projects" className={linkClass}>
          Công trình
        </NavLink>
        <NavLink to="/admin/categories" className={linkClass}>
          Danh mục chi phí
        </NavLink>
      </div>
      <Outlet />
    </div>
  );
}
