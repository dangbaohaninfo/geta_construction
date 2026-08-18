import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"
    }`;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-lg text-slate-800">Quản lý chi phí công trình</span>
            <nav className="flex gap-1">
              <NavLink to="/transactions" className={linkClass}>
                Giao dịch
              </NavLink>
              {user?.role === "ADMIN" && (
                <NavLink to="/admin" className={linkClass}>
                  Quản trị
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-slate-600">
              {user?.name} <span className="text-slate-400">({user?.role})</span>
            </span>
            <button onClick={handleLogout} className="text-red-600 hover:underline">
              Đăng xuất
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
