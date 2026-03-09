import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { ShieldCheck } from "lucide-react";

export default function LoginClientePage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setLogin = useAuthStore((state) => state.setLogin);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post('/auth/login', form);
      if (data.success && data.data.rol === 'CLIENTE') { // Validamos que sea cliente
        setLogin(data.data, data.data.accessToken);
        toast.success(`Bienvenido a ${data.data.empresaNombre}`);
        navigate('/cliente/dashboard'); 
      } else {
        toast.error("Acceso denegado. Credenciales de administrador no permitidas aquí.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al iniciar sesión");
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

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <InputField label="Correo Corporativo" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <InputField label="Contraseña" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <Button type="submit" className="w-full" loading={loading}>Ingresar al Portal</Button>
        </form>
      </div>
    </div>
  );
}