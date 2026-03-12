import { useState, useEffect } from "react";
import { usuarioApi } from "../../api/usuarioApi";
import {
  Users,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
} from "lucide-react";
import toast from "react-hot-toast";

export default function UsuariosPage() {
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados del Modal de Creación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [verPass, setVerPass] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  // Estado del Modal de Eliminación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await usuarioApi.getUsuarios();

      // La API trae a todos (Admins y Clientes).
      // Filtramos en el frontend para mostrar SOLO a los Administradores de EMSI.
      const soloAdmins = response.data.data.filter((u) => u.rol === "ADMIN");
      setUsuariosAdmin(soloAdmins);
    } catch (error) {
      toast.error("Error al cargar los usuarios del sistema");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setFormData({ nombre: "", email: "", password: "" });
    setVerPass(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();

    // Validación de seguridad para la contraseña (mínimo 6 caracteres según tu DTO)
    if (formData.password.length < 6) {
      return toast.error("La contraseña debe tener al menos 6 caracteres");
    }

    const loadingToast = toast.loading("Creando administrador...");
    try {
      // El payload fuerza el rol ADMIN. No mandamos empresaId.
      const payload = {
        ...formData,
        rol: "ADMIN",
      };

      await usuarioApi.crearUsuario(payload);

      toast.success("Administrador creado exitosamente", { id: loadingToast });
      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      const msj =
        error.response?.data?.message ||
        "Error al crear el usuario. Verifica que el correo no exista.";
      toast.error(msj, { id: loadingToast });
    }
  };

  const handleEliminar = async () => {
    const loadingToast = toast.loading("Desactivando cuenta...");
    try {
      await usuarioApi.eliminarUsuario(usuarioAEliminar.id);
      toast.success("Usuario desactivado", { id: loadingToast });
      setUsuarioAEliminar(null);
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al desactivar el usuario", { id: loadingToast });
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Users className="text-blue-600" size={32} />
            Equipo EMSI
          </h1>
          <p className="text-slate-500 mt-1">
            Gestiona los administradores con acceso total al sistema
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Administrador
        </button>
      </div>

      {/* TABLA DE USUARIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold">Administrador</th>
                <th className="p-5 font-bold">Email de Acceso</th>
                <th className="p-5 font-bold">Fecha de Alta</th>
                <th className="p-5 font-bold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="p-10 text-center text-slate-400 animate-pulse"
                  >
                    Cargando equipo...
                  </td>
                </tr>
              ) : usuariosAdmin.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    No hay administradores registrados
                  </td>
                </tr>
              ) : (
                usuariosAdmin.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                          {user.nombre.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.nombre}
                          </p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <ShieldCheck
                              size={12}
                              className="text-emerald-500"
                            />
                            <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                              Super Admin
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                      {user.email}
                    </td>
                    <td className="p-5 text-slate-500 text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setUsuarioAEliminar(user)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Desactivar acceso"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: NUEVO ADMINISTRADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800">
                Alta de Administrador
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Nombre Completo
                </label>
                <input
                  required
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Correo Electrónico (Institucional)
                </label>
                <input
                  required
                  type="email"
                  placeholder="admin@emsi.com"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Contraseña de Acceso
                </label>
                <div className="relative">
                  <input
                    required
                    type={verPass ? "text" : "password"}
                    placeholder="Mínimo 6 caracteres"
                    minLength="6"
                    className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setVerPass(!verPass)}
                    className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                >
                  Crear Cuenta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRMAR ELIMINACIÓN */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              ¿Revocar acceso?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Estás a punto de desactivar la cuenta de{" "}
              <b>{usuarioAEliminar.nombre}</b>. Ya no podrá ingresar al panel de
              EMSI.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setUsuarioAEliminar(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Desactivar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
