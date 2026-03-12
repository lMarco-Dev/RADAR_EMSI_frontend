import { Routes, Route, Navigate } from "react-router-dom";
<<<<<<< HEAD
import Sidebar from "../components/ui/Sidebar"; 
import TopbarCliente from "../components/ui/TopbarCliente"; // Importación necesaria
=======
import Sidebar from "../components/ui/Sidebar";
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
import FormularioReportePage from "../pages/publico/FormularioReportePage";
import ClientesPage from "../pages/admin/ClientesPage";
import ReportesPage from "../pages/admin/ReportesPage";
import LoginPage from "../pages/auth/LoginPage";
import LoginClientePage from "../pages/cliente/LoginClientePage";
import DashboardPage from "../pages/admin/DashboardPage";
import DashboardClientePage from "../pages/cliente/DashboardClientePage";
import { useAuthStore } from "../store/authStore";
<<<<<<< HEAD
import ReportesClientePage from "../pages/cliente/ReportesClientePage";
=======
import CatalogosPage from "../pages/admin/CatalogosPage";
import UsuariosPage from "../pages/admin/UsuariosPage";
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0

export default function AppRouter() {
  const { isAuthenticated, user } = useAuthStore();

<<<<<<< HEAD
  const getDashboardRoute = () => {
    if (!user) return "/login";
    return user.rol === 'SUPERVISOR' ? '/cliente/dashboard' : '/admin/dashboard';
  };
=======
  const getDashboardRoute = () =>
    user?.rol === "CLIENTE" ? "/cliente/dashboard" : "/admin/dashboard";
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0

  return (
    <Routes>
      {/* 1. RUTA PÚBLICA (Accesible siempre) */}
      <Route path="/reportar/:token" element={<FormularioReportePage />} />

<<<<<<< HEAD
      {/* 2. RUTAS DE LOGIN: Solo accesibles si NO hay usuario o NO está autenticado */}
      <Route 
        path="/login" 
        element={(!isAuthenticated || !user) ? <LoginPage /> : <Navigate to={getDashboardRoute()} replace />} 
      />
      <Route 
        path="/cliente/login" 
        element={(!isAuthenticated || !user) ? <LoginClientePage /> : <Navigate to={getDashboardRoute()} replace />} 
=======
      {/* RUTAS DE LOGIN (Separadas) */}
      <Route
        path="/login"
        element={
          !isAuthenticated ? (
            <LoginPage />
          ) : (
            <Navigate to={getDashboardRoute()} />
          )
        }
      />
      <Route
        path="/cliente/login"
        element={
          !isAuthenticated ? (
            <LoginClientePage />
          ) : (
            <Navigate to={getDashboardRoute()} />
          )
        }
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
      />

      {/* 3. RUTAS ADMINISTRATIVAS: Estrictamente para ADMIN */}
      <Route
        path="/admin/*"
        element={
<<<<<<< HEAD
          (isAuthenticated && user?.rol === 'ADMIN') ? (
=======
          isAuthenticated && user?.rol === "ADMIN" ? (
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
            <div className="flex">
              <Sidebar />
              <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
                <Routes>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="catalogos" element={<CatalogosPage />} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="reportes" element={<ReportesPage />} />
<<<<<<< HEAD
                  <Route path="usuarios" element={<div>Gestión de Usuarios (Próximamente)</div>} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
=======
                  <Route path="usuarios" element={<UsuariosPage />} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to={isAuthenticated ? getDashboardRoute() : "/login"} replace />
          )
        }
      />

      {/* 4. RUTAS DEL CLIENTE: Estrictamente para CLIENTE */}
      <Route
        path="/cliente/*"
        element={
<<<<<<< HEAD
          (isAuthenticated && user?.rol === 'SUPERVISOR') ? (
=======
          isAuthenticated && user?.rol === "CLIENTE" ? (
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
            <div className="flex flex-col min-h-screen bg-slate-50">
              <TopbarCliente />
              <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
                <Routes>
                  <Route path="dashboard" element={<DashboardClientePage />} />
                  <Route path="*" element={<Navigate to="dashboard" replace />} />
                  <Route path="reportes" element={<ReportesClientePage />} />
                </Routes>
              </main>
            </div>
          ) : (
<<<<<<< HEAD
            <Navigate to={isAuthenticated ? getDashboardRoute() : "/cliente/login"} replace />
=======
            <Navigate
              to={isAuthenticated ? "/admin/dashboard" : "/cliente/login"}
            />
>>>>>>> 5dd8fbd62948a68c426b48dbd278b6b1de51e5a0
          )
        }
      />

      {/* 5. REDIRECCIÓN POR DEFECTO */}
      <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
