import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar";
import TopbarCliente from "../components/ui/TopbarCliente";
import FormularioReportePage from "../pages/publico/FormularioReportePage";
import ClientesPage from "../pages/admin/ClientesPage";
import ReportesPage from "../pages/admin/ReportesPage";
import LoginPage from "../pages/auth/LoginPage";
import LoginClientePage from "../pages/cliente/LoginClientePage";
import DashboardPage from "../pages/admin/DashboardPage";
import DashboardClientePage from "../pages/cliente/DashboardClientePage";
import { useAuthStore } from "../store/authStore";
import ReportesClientePage from "../pages/cliente/ReportesClientePage";
import CatalogosPage from "../pages/admin/CatalogosPage";
import UsuariosPage from "../pages/admin/UsuariosPage";


export default function AppRouter() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboardRoute = () => {
    if (!user) return "/login";
    return user.rol === 'SUPERVISOR' ? '/cliente/dashboard' : '/admin/dashboard';
  };

  return (
    <Routes>
      {/* 1. RUTA PÚBLICA (Accesible siempre) */}
      <Route path="/reportar/:token" element={<FormularioReportePage />} />

      {/* 2. RUTAS DE LOGIN: Solo accesibles si NO hay usuario o NO está autenticado */}
      <Route 
        path="/login" 
        element={(!isAuthenticated || !user) ? <LoginPage /> : <Navigate to={getDashboardRoute()} replace />} 
      />
      <Route 
        path="/cliente/login" 
        element={(!isAuthenticated || !user) ? <LoginClientePage /> : <Navigate to={getDashboardRoute()} replace />} 
      />

      {/* 3. RUTAS ADMINISTRATIVAS: Estrictamente para ADMIN */}
      <Route
        path="/admin/*"
        element={
          (isAuthenticated && user?.rol === 'ADMIN') ? (
            <div className="flex">
              <Sidebar />
              <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="catalogos" element={<CatalogosPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="reportes" element={<ReportesPage />} />
                  <Route path="usuarios" element={<UsuariosPage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} replace />
          )
        }
      />

      {/* 4. RUTAS DEL CLIENTE: Estrictamente para CLIENTE SUPERVISOR */}
      <Route
        path="/cliente/*"
        element={
          (isAuthenticated && user?.rol === 'SUPERVISOR') ? (
            <div className="flex flex-col min-h-screen bg-slate-50">
              <TopbarCliente />
              <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                <Routes>
                  <Route path="dashboard" element={<DashboardClientePage />} />
                  <Route path="reportes" element={<ReportesClientePage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to={isAuthenticated ? getDashboardRoute() : "/cliente/login"} replace />
          )
        }
      />

      {/* 5. REDIRECCIÓN POR DEFECTO */}
      <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}