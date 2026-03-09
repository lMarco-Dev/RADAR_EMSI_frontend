import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LogOut, ShieldCheck } from "lucide-react";

export default function TopbarCliente() {
  const navigate = useNavigate();
  const { user, setLogout } = useAuthStore();

  const handleLogout = () => {
    setLogout();
    navigate("/cliente/login");
  };

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      {/* Lado izquierdo: Logo o Identificador */}
      <div className="flex items-center gap-3">
        <div className="bg-slate-900 p-2 rounded-xl flex items-center justify-center">
          <ShieldCheck className="text-blue-500 w-6 h-6" />
        </div>
        <div>
          <h2 className="font-bold text-slate-800 text-lg leading-tight">Portal SST</h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {user?.empresaNombre || "Empresa Cliente"}
          </p>
        </div>
      </div>

      {/* Lado derecho: Usuario y Salir */}
      <div className="flex items-center gap-6">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-700">{user?.nombre}</p>
          <p className="text-xs text-slate-500">Supervisor</p>
        </div>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-semibold text-sm"
        >
          <LogOut size={16} />
          <span>Salir</span>
        </button>
      </div>
    </div>
  );
}