import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { ShieldCheck, AlertTriangle } from "lucide-react";

export default function LoginClientePage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); // <-- NUEVO ESTADO
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(""); // Limpiar errores previos

    try {
      const { data } = await axiosInstance.post('/auth/login', form);
      if (data.success && data.data.rol === 'SUPERVISOR') {       
        setLogin({
          nombre: data.data.nombre,
          email: data.data.email,
          rol: data.data.rol,
          empresaId: data.data.empresaId,
          empresaNombre: data.data.empresaNombre,
          empresaToken: data.data.empresaToken
        }, data.data.accessToken);
        
        toast.success(`Bienvenido a ${data.data.empresaNombre}`);
        navigate('/cliente/dashboard'); 
      } else {
        setErrorMsg("Acceso denegado. Credenciales de administrador no permitidas aquí.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Credenciales incorrectas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-lg border border-slate-200 text-center">
        <ShieldCheck className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Portal de Supervisores</h2>
        <p className="text-slate-500 text-sm mb-6">Accede a las métricas SST de tu empresa.</p>

        {/* ALERTA DE ERROR VISUAL */}
        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center text-left gap-3 animate-in fade-in slide-in-from-top-2">
            <AlertTriangle size={20} className="shrink-0" />
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <InputField label="Correo Corporativo" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <InputField label="Contraseña" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" loading={loading}>Ingresar al Portal</Button>
        </form>
      </div>
    </div>
  );
}