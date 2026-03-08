import { Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "../components/ui/Sidebar"; // Asegúrate de crear este componente
import FormularioReportePage from "../pages/publico/FormularioReportePage";
import ClientesPage from "../pages/admin/ClientesPage"; // Tu antiguo DashboardPage
import ReportesPage from "../pages/admin/ReportesPage"; // El nuevo módulo
import LoginPage from "../pages/auth/LoginPage";
import { useAuthStore } from "../store/authStore";

export default function AppRouter() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* RUTA PÚBLICA: Formulario para trabajadores */}
      <Route path="/reportar/:token" element={<FormularioReportePage />} />

      {/* RUTA DE LOGIN */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/admin/dashboard" />} />

      {/* RUTAS ADMINISTRATIVAS: Protegidas y con Sidebar */}
      <Route
        path="/admin/*"
        element={
          isAuthenticated ? (
            <div className="flex">
              {/* Menú lateral fijo */}
              <Sidebar /> 
              
              {/* Contenido dinámico a la derecha (Margen de 64 para no chocar con el Sidebar) */}
              <main className="flex-1 ml-64 bg-slate-50 min-h-screen">
                <Routes>
                  <Route path="dashboard" element={<div>Vista de Estadísticas (Próximamente)</div>} />
                  <Route path="clientes" element={<ClientesPage />} />
                  <Route path="reportes" element={<ReportesPage />} />
                  <Route path="usuarios" element={<div>Gestión de Usuarios (Próximamente)</div>} />
                  <Route path="*" element={<Navigate to="dashboard" />} />
                </Routes>
              </main>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />

      {/* Redirección por defecto */}
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  );
}