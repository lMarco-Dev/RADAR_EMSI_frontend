import { Radar, ShieldCheck } from "lucide-react";
import { useState } from "react";
import InputField from "../../components/ui/InputField";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  //1. Estado de Formulario
  const [form, setForm] = useState({ email: "", password: "" });

  //2. Estado de carga del boton
  const [loading, setLoading] = useState(false);

  //3. Función cuando el formulario es enviado "Submit"
  const handleSubmit = (e) => {
    e.preventDefault(); //Evita que la pagina recarge
    setLoading(true);

    //Simulación de 2 segundos.
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    // Contenedor principal que ocupa toda la pantalla
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <InputField
              label="Correo electrónico"
              type="email"
              required
              placeholder="ejemplo@emsi.com"
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
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
              />
              <div className="flex justify-end mt-1">
                <a
                  href="#"
                  className="text-sm font-semibold text-red-700 hover:text-red-800 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
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
