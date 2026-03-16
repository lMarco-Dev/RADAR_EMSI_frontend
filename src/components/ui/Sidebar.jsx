import { useState } from "react";
import {
  LayoutDashboard,
  Building2,
  ClipboardList,
  Users,
  LogOut,
  Radar,
  Settings2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setLogout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setLogout(); 
    navigate("/login");
  };

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: "Clientes",
      path: "/admin/clientes",
      icon: <Building2 size={20} />,
    },
    {
      name: "Reportes",
      path: "/admin/reportes",
      icon: <ClipboardList size={20} />,
    },
    {
      name: "Catálogos",
      path: "/admin/catalogos",
      icon: <Settings2 size={20} />,
    },
    { name: "Usuarios", path: "/admin/usuarios", icon: <Users size={20} /> },
  ];

  return (
    <>
      <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col p-6 text-slate-300 z-40">
        <div className="flex items-center gap-3 mb-10 px-2">
          <Radar className="text-red-500 animate-pulse" size={28} />
          <span className="text-white font-black tracking-widest text-xl">
            RADAR
          </span>
        </div>

        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all ${
                location.pathname === item.path
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-3 w-full p-3 text-slate-400 hover:text-red-500 hover:bg-red-50/10 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de Confirmación de Salida */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
              <LogOut size={32} className="ml-1" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Cerrar Sesión?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Saldrás del panel de administración central de EMSI.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutModal(false)} 
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmLogout} 
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}