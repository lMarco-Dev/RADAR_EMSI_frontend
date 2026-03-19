import { Radar, ShieldCheck, AlertTriangle } from "lucide-react";
import { useState } from "react";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axiosInstance from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";

export default function LoginPage() {
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
      
      if (data.success && data.data.rol === 'ADMIN') {
        setLogin(
          { 
            nombre: data.data.nombre, 
            email: data.data.email, 
            rol: data.data.rol,
            empresaId: data.data.empresaId,
            empresaNombre: data.data.empresaNombre,
            empresaToken: data.data.empresaToken 
          }, 
          data.data.accessToken
        );
        
        toast.success("¡Bienvenido al Sistema Interno RADAR!");
        navigate('/admin/dashboard'); 
      } else if (data.success && data.data.rol !== 'ADMIN') {
        setErrorMsg("Acceso denegado. Utiliza el portal de clientes para ingresar.");
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Credenciales incorrectas o error en el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <div className="md:w-1/2 bg-slate-900 p-10 flex flex-col items-center justify-between relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute w-[800px] h-[800px] border border-white rounded-full -top-[400px] -left-[200px]"></div>
          <div className="absolute w-[1000px] h-[1000px] border border-white rounded-full -top-[500px] -left-[300px]"></div>
        </div>

        {/* Encabezado Izquierdo */}
        <div className="relative z-10 flex items-center gap-2 mt-4">
          <Radar className="w-8 h-8 text-red-500 animate-pulse" />
          <span className="text-white font-bold text-xl tracking-widest">
            RADAR
          </span>
        </div>

        {/* Contenido Central Izquierdo */}
        <div className="relative z-10 flex flex-col items-center my-auto py-10">
          <div className="bg-white p-2 rounded-2xl shadow-2xl mb-8 inline-block">
            <img
              src="/emsi_logo_sinfondo.png"
              alt="Logo EMSI"
              className="w-48 md:w-56 object-contain rounded-xl"
            />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
            Bienvenido a <br />
            <span className="text-red-500">RADAR EMSI</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-md mx-auto">
            Plataforma centralizada para el reporte activo de alertas, gestión
            de incidentes y seguridad corporativa.
          </p>
        </div>

        {/* Pie de página Izquierdo */}
        <div className="relative z-10 flex items-center justify-center gap-2 text-slate-400 text-sm mb-4">
          <ShieldCheck className="w-5 h-5" />
          <span>© 2026 Corporación EMSI. Acceso restringido.</span>
        </div>
      </div>

      <div className="md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-100">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-slate-800 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-slate-500 text-sm">
              Ingresa tus credenciales para acceder a tu panel de control.
            </p>
          </div>

          {/* ALERTA DE ERROR VISUAL */}
          {errorMsg && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle size={20} className="shrink-0" />
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Correo electrónico"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />

            <div>
              <InputField
                label="Contraseña"
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full py-3 text-lg mt-4"
              loading={loading}
            >
              Ingresar ahora
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}