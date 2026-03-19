import { useState, useEffect } from "react";
import { usuarioApi } from "../../api/usuarioApi";
import { useAuthStore } from "../../store/authStore";
import {
  Users,
  Plus,
  Trash2,
  X,
  AlertTriangle,
  ShieldCheck,
  Eye,
  EyeOff,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";

export default function UsuariosPage() {
  const authUser = useAuthStore((state) => state.user);
  const [usuariosAdmin, setUsuariosAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginaActual, setPaginaActual] = useState(0);

  // Estados del Modal de Creación/Edición
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [verPass, setVerPass] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  // Estado del Modal de Eliminación
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);

  // --- FUNCIONES DE VALIDACIÓN ---
  const esEmailValido = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validarPassword = (pass) => {
    return {
      longitud: pass.length >= 8,
      letras: /[a-z]/.test(pass) && /[A-Z]/.test(pass),
      numero: /[0-9]/.test(pass),
    };
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const response = await usuarioApi.getUsuarios();
      const soloAdmins = response.data.data.filter((u) => u.rol === "ADMIN");
      setUsuariosAdmin(soloAdmins);
    } catch (error) {
      toast.error("Error al cargar los usuarios del sistema");
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE PAGINACIÓN FRONTEND ---
  const totalPaginasCalculadas = Math.ceil(usuariosAdmin.length / 10);
  const usuariosPaginados = usuariosAdmin.slice(
    paginaActual * 10,
    (paginaActual + 1) * 10
  );

  const abrirModalCrear = () => {
    setEditingUsuario(null);
    setFormData({ nombre: "", email: "", password: "" });
    setVerPass(false);
    setIsModalOpen(true);
  };

  const abrirEdicion = (user) => {
    setEditingUsuario(user);
    setFormData({ nombre: user.nombre, email: user.email, password: "" });
    setVerPass(false);
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingUsuario(null);
    setFormData({ nombre: "", email: "", password: "" });
    setVerPass(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loadingToast = toast.loading(
      editingUsuario ? "Actualizando administrador..." : "Creando administrador..."
    );
    try {
      const payload = {
        ...formData,
        rol: "ADMIN",
      };

      // Si estamos editando y no escribió contraseña, no la enviamos
      if (editingUsuario && !formData.password) {
        delete payload.password;
      }

      if (editingUsuario) {
        // Asumiendo que tu API tiene este método
        await usuarioApi.actualizarUsuario(editingUsuario.id, payload);
        toast.success("Administrador actualizado exitosamente", { id: loadingToast });
      } else {
        await usuarioApi.crearUsuario(payload);
        toast.success("Administrador creado exitosamente", { id: loadingToast });
      }

      cerrarModal();
      cargarUsuarios();
    } catch (error) {
      const msj =
        error.response?.data?.message ||
        "Error al procesar la solicitud. Verifica los datos.";
      toast.error(msj, { id: loadingToast });
    }
  };

  const handleEliminar = async () => {
    const loadingToast = toast.loading("Desactivando cuenta...");
    try {
      await usuarioApi.eliminarUsuario(usuarioAEliminar.id);
      toast.success("Usuario desactivado", { id: loadingToast });
      setUsuarioAEliminar(null);
      
      // Si eliminamos el último de la página, regresamos una página
      if (usuariosPaginados.length === 1 && paginaActual > 0) {
          setPaginaActual(paginaActual - 1);
      }
      cargarUsuarios();
    } catch (error) {
      toast.error("Error al desactivar el usuario", { id: loadingToast });
    }
  };

  // Validación para el botón Submit
  const isFormValid = () => {
    if (!esEmailValido(formData.email)) return false;
    
    // Si estamos creando, la contraseña es obligatoria y debe ser válida
    if (!editingUsuario) {
      const pVal = validarPassword(formData.password);
      return pVal.longitud && pVal.letras && pVal.numero;
    } 
    
    // Si estamos editando, la contraseña es válida si está vacía, o si cumple las reglas
    if (editingUsuario && formData.password !== "") {
      const pVal = validarPassword(formData.password);
      return pVal.longitud && pVal.letras && pVal.numero;
    }

    return true;
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
          onClick={abrirModalCrear}
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
                  <td colSpan="4" className="p-10 text-center text-slate-400 animate-pulse">
                    Cargando equipo...
                  </td>
                </tr>
              ) : usuariosPaginados.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-10 text-center text-slate-400">
                    No hay administradores registrados
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((user) => {
                  // LÓGICA DE BLINDAJE: El admin principal (ID 1) o tú mismo no se pueden borrar
                  const isProtected = user.id === 1 || user.email === authUser?.email;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-black">
                            {user.nombre.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">
                              {user.nombre}
                              {user.id === 1 && (
                                <span className="ml-2 text-[9px] bg-slate-800 text-white px-2 py-0.5 rounded-md uppercase tracking-widest">
                                  Root
                                </span>
                              )}
                            </p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <ShieldCheck size={12} className="text-emerald-500" />
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
                            onClick={() => abrirEdicion(user)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar administrador"
                          >
                            <Pencil size={18} />
                          </button>
                          
                          {!isProtected ? (
                            <button
                              onClick={() => setUsuarioAEliminar(user)}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Desactivar acceso"
                            >
                              <Trash2 size={18} />
                            </button>
                          ) : (
                            <div className="p-2 w-[34px]" title="Usuario protegido"></div> // Espacio vacío para mantener alineación
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER DE PAGINACIÓN (Alineado a la izquierda) */}
        <div className="p-4 border-t border-slate-100 flex justify-start items-center bg-slate-50/50">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setPaginaActual(p => Math.max(0, p - 1))} 
              disabled={paginaActual === 0} 
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-slate-500">
              Pág. {paginaActual + 1} de {totalPaginasCalculadas === 0 ? 1 : totalPaginasCalculadas}
            </span>
            <button 
              onClick={() => setPaginaActual(p => Math.min(totalPaginasCalculadas - 1, p + 1))} 
              disabled={paginaActual >= totalPaginasCalculadas - 1 || totalPaginasCalculadas === 0} 
              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-xs font-bold disabled:opacity-50 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: NUEVO / EDITAR ADMINISTRADOR */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800">
                {editingUsuario ? "Editar Administrador" : "Alta de Administrador"}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

              {/* CAMPO EMAIL MODIFICADO */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Correo Electrónico (Institucional)
                </label>
                <input
                  required
                  type="email"
                  placeholder="admin@emsi.com"
                  className={`w-full bg-slate-50 border p-3.5 rounded-2xl outline-none transition-all ${
                    formData.email && !esEmailValido(formData.email)
                      ? "border-red-400 focus:ring-2 focus:ring-red-200"
                      : "border-transparent focus:ring-2 focus:ring-blue-500"
                  }`}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {formData.email && !esEmailValido(formData.email) && (
                  <p className="text-[10px] text-red-500 font-bold mt-1.5 animate-in fade-in">
                    Debe ser un correo válido (ej: usuario@empresa.com)
                  </p>
                )}
              </div>

              {/* CAMPO CONTRASEÑA MODIFICADO */}
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  {editingUsuario ? "Nueva Contraseña (Opcional)" : "Contraseña de Acceso"}
                </label>
                <div className="relative">
                  <input
                    required={!editingUsuario}
                    type={verPass ? "text" : "password"}
                    placeholder={editingUsuario ? "Dejar en blanco para no cambiar" : "Mínimo 8 caracteres"}
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
                
                {/* INDICADORES INTERACTIVOS DE CONTRASEÑA */}
                {formData.password && (
                  <div className="mt-2.5 space-y-1 animate-in slide-in-from-top-1">
                    <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formData.password).longitud ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formData.password).longitud ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      Al menos 8 caracteres
                    </p>
                    <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formData.password).letras ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formData.password).letras ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      Una minúscula y una mayúscula
                    </p>
                    <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formData.password).numero ? 'text-green-600' : 'text-slate-400'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formData.password).numero ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                      Al menos 1 número
                    </p>
                  </div>
                )}
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
                  disabled={!isFormValid()}
                  className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  {editingUsuario ? "Guardar Cambios" : "Crear Cuenta"}
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