import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import TransactionsPage from "./pages/TransactionsPage";
import AttendancePage from "./pages/AttendancePage";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import DashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import ProjectsPage from "./pages/admin/ProjectsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import EmployeesPage from "./pages/admin/EmployeesPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<TransactionsPage />} />
          <Route path="/attendance" element={<AttendancePage />} />

          <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
            <Route path="/management" element={<AdminLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="employees" element={<EmployeesPage />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
