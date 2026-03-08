import { LayoutDashboard, Building2, ClipboardList, Users, LogOut, Radar } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Clientes", path: "/admin/clientes", icon: <Building2 size={20} /> },
    { name: "Reportes", path: "/admin/reportes", icon: <ClipboardList size={20} /> },
    { name: "Usuarios", path: "/admin/usuarios", icon: <Users size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col p-6 text-slate-300">
      <div className="flex items-center gap-3 mb-10 px-2">
        <Radar className="text-red-500 animate-pulse" size={28} />
        <span className="text-white font-black tracking-widest text-xl">RADAR</span>
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

      <button 
        onClick={logout}
        className="flex items-center gap-4 px-4 py-3 hover:bg-red-500/10 hover:text-red-500 rounded-xl font-bold transition-all mt-auto"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  );
}