import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";
import FormularioReportePage from "../pages/publico/FormularioReportePage";
import DashboardPage from "../pages/admin/DashboardPage";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reportar" element={<FormularioReportePage />} />

        {/* Rutas Privadas */}
        <Route path="/admin/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
