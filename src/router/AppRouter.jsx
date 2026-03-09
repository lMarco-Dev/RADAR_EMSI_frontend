import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar"; 
import FormularioReportePage from "../pages/publico/FormularioReportePage";
import ClientesPage from "../pages/admin/ClientesPage"; 
import ReportesPage from "../pages/admin/ReportesPage"; 
import LoginPage from "../pages/auth/LoginPage";
import LoginClientePage from "../pages/cliente/LoginClientePage";
import DashboardPage from "../pages/admin/DashboardPage"; 
import DashboardClientePage from "../pages/cliente/DashboardClientePage";
import { useAuthStore } from "../store/authStore";

export default function AppRouter() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardRoute = () => user?.rol === 'CLIENTE' ? '/cliente/dashboard' : '/admin/dashboard';

  return (
    <Routes>
      {/* RUTA PÚBLICA */}
      <Route path="/reportar/:token" element={<FormularioReportePage />} />

      {/* RUTAS DE LOGIN (Separadas) */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to={getDashboardRoute()} />} />
      <Route path="/cliente/login" element={!isAuthenticated ? <LoginClientePage /> : <Navigate to={getDashboardRoute()} />} />

      {/* RUTAS ADMINISTRATIVAS: Solo ADMIN */}
      <Route
        path="/admin/*"
        element={
          isAuthenticated && user?.rol === 'ADMIN' ? (
            <div className="flex">
              <Sidebar /> 
              <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="reportes" element={<ReportesPage />} />
                  <Route path="usuarios" element={<div>Gestión de Usuarios (Próximamente)</div>} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to={isAuthenticated ? "/cliente/dashboard" : "/login"} />
          )
        }
      />

      {/* RUTAS DEL CLIENTE SUPERVISOR: Solo CLIENTE */}
      <Route
        path="/cliente/*"
        element={
          isAuthenticated && user?.rol === 'CLIENTE' ? (
            <div className="flex flex-col min-h-screen bg-slate-50">
              <TopbarCliente />
              <main className="flex-1 w-full max-w-7xl mx-auto">
                <Routes>
                  <Route path="dashboard" element={<DashboardClientePage />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to={isAuthenticated ? "/admin/dashboard" : "/cliente/login"} />
          )
        }
      />

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}