import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";
import {
  Search,
  Plus,
  X,
  QrCode,
  Copy,
  Building2,
  Upload,
  Pencil,
  Trash2,
  AlertTriangle,
  UserCog,
  Eye,
  EyeOff,
  ShieldCheck,
  Info,
  Key, Power, PowerOff, Save, Users
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

function LogoConFallback({ url }) {
  const [error, setError] = useState(false);

  if (!url || error) {
    return <Building2 className="text-slate-300" size={24} />;
  }

  return (
    <img
      src={url}
      alt="logo"
      className="w-full h-full object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function ClientesPage() {
  const user = useAuthStore((state) => state.user);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [paginaActual, setPaginaActual] = useState(0);
  
  

  const [supervisorModalData, setSupervisorModalData] = useState(null);
  const [supervisorActual, setSupervisorActual] = useState(null); 
  const [loadingSup, setLoadingSup] = useState(false);
  const [supervisores, setSupervisores] = useState([]);
  const [isCreatingSup, setIsCreatingSup] = useState(false);
  const [resetPwdData, setResetPwdData] = useState({ id: null, password: "" });
  const [verPass, setVerPass] = useState(false);

  // ESTADOS PARA CONFIRMACIONES
  const [confirmToggleSup, setConfirmToggleSup] = useState(null); 
  const [confirmPasswordSup, setConfirmPasswordSup] = useState(null);

  const [formSup, setFormSup] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  // Estados para Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);

  const [formData, setFormData] = useState({ nombre: "", ruc: "", logo: null });

  // Estados para Departamentos
  const [departamentos, setDepartamentos] = useState([]);
  const [nuevoDepto, setNuevoDepto] = useState("");

  useEffect(() => {
    cargarEmpresas();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); 

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/empresas");
      setEmpresas(response.data.data);
    } catch (error) {
      toast.error("Error al cargar las empresas");
    } finally {
      setLoading(false);
    }
  };

  const esEmailValido = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const validarPassword = (pass) => {
    return {
      longitud: pass.length >= 8,
      letras: /[a-z]/.test(pass) && /[A-Z]/.test(pass),
      numero: /[0-9]/.test(pass)
    };
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logo: file });
  };

  // ---------- Crear los departamentos ---------------
  const agregarDepto = () => {
    if (
      nuevoDepto.trim() !== "" &&
      !departamentos.includes(nuevoDepto.trim())
    ) {
      setDepartamentos([...departamentos, nuevoDepto.trim()]);
      setNuevoDepto("");
    }
  };

  // ---------- Eliminar el departamento -------------
  const removerDepto = (indexToRemove) => {
    setDepartamentos(
      departamentos.filter((_, index) => index !== indexToRemove),
    );
  };

  // Abrir modal para editar
  const abrirEdicion = (emp) => {
    setEditingEmpresa(emp);
    setFormData({ nombre: emp.nombre, ruc: emp.ruc, logo: null });
    setDepartamentos(emp.departamentos || []);
    setIsFormModalOpen(true);
  };

  const cerrarModal = () => {
    setIsFormModalOpen(false);
    setEditingEmpresa(null);
    setFormData({ nombre: "", ruc: "", logo: null });
    setDepartamentos([]);
    setNuevoDepto("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Limpia notificaciones previas

    if (formData.ruc.length !== 11) {
      toast.error("El RUC debe tener exactamente 11 dígitos numéricos");
      return;
    }

    if (departamentos.length === 0) {
      toast.error("Debes registrar al menos un departamento");
      return;
    }

    const loadingToast = toast.loading(
      editingEmpresa ? "Actualizando empresa..." : "Creando empresa...",
    );

    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("ruc", formData.ruc);
      if (formData.logo) data.append("logo", formData.logo);

      departamentos.forEach((depto, index) => {
        data.append(`departamentos[${index}]`, depto);
      });

      if (editingEmpresa) {
        await axiosInstance.put(`/empresas/${editingEmpresa.id}`, data);
        toast.success("Empresa actualizada correctamente", {
          id: loadingToast,
        });
      } else {
        await axiosInstance.post("/empresas", data);
        toast.success("Empresa registrada exitosamente", { id: loadingToast });
      }

      cerrarModal();
      cargarEmpresas();
    } catch (error) {
      const msj =
        error.response?.data?.message ||
        "Ocurrió un error al procesar la solicitud";
      toast.error(msj, { id: loadingToast });
    }
  };

  const handleEliminar = async () => {
    toast.dismiss();
    const loadingToast = toast.loading("Eliminando empresa...");
    try {
      await axiosInstance.delete(`/empresas/${empresaAEliminar.id}`);
      toast.success("Empresa eliminada", { id: loadingToast });
      setEmpresaAEliminar(null);
      cargarEmpresas();
    } catch (error) {
      toast.error("Error al eliminar la empresa", { id: loadingToast });
    }
  };

  const copiarEnlace = (token) => {
    toast.dismiss();
    const link = `${window.location.origin}/reportar/${token}`;
    navigator.clipboard.writeText(link);

    setTimeout(() => {
      toast.success("Enlace de reportes copiado");
    }, 100);
  };

  const descargarQR = () => {
    toast.dismiss();
    const canvas = document.getElementById("qr-canvas");
    const pngUrl = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${qrModalData.nombre.replace(/\s+/g, "_")}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      toast.success("Iniciando descarga del QR...");
    }, 100);
  };

  const empresasFiltradas = empresas.filter(
    (emp) =>
      emp.nombre.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
      emp.ruc.includes(debouncedSearchTerm) 
  );

  const totalPaginasCalculadas = Math.ceil(empresasFiltradas.length / 10);
  const empresasPaginadas = empresasFiltradas.slice(paginaActual * 10, (paginaActual + 1) * 10);

  const abrirGestionSupervisor = async (emp) => {
    setSupervisorModalData(emp);
    setLoadingSup(true);
    setSupervisores([]);
    setIsCreatingSup(false);
    setResetPwdData({ id: null, password: "" });
    setFormSup({ nombre: "", email: "", password: "" });

    try {
      const res = await axiosInstance.get(`/usuarios/empresa/${emp.id}`);
      setSupervisores(res.data.data || []);
    } catch (error) {
      toast.error("Error al cargar supervisores");
    } finally {
      setLoadingSup(false);
    }
  };

  const handleCrearSupervisor = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Creando acceso...");
    try {
      const payload = { ...formSup, rol: "SUPERVISOR", empresaId: supervisorModalData.id };
      await axiosInstance.post("/usuarios", payload);
      toast.success("Acceso creado", { id: loadingToast });
      abrirGestionSupervisor(supervisorModalData);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error al crear", { id: loadingToast });
    }
  };

  const ejecutarToggleEstadoSup = async () => {
    if (!confirmToggleSup) return;
    const loadingToast = toast.loading("Actualizando estado...");
    try {
      await axiosInstance.patch(`/usuarios/${confirmToggleSup}/estado`);
      toast.success("Estado actualizado", { id: loadingToast });
      abrirGestionSupervisor(supervisorModalData);
    } catch (error) {
      toast.error("Error al actualizar", { id: loadingToast });
    } finally {
      setConfirmToggleSup(null);
    }
  };

  const ejecutarCambiarPassword = async () => {
    const loadingToast = toast.loading("Cambiando contraseña...");
    try {
      await axiosInstance.patch(`/usuarios/${confirmPasswordSup}/password`, { 
        password: resetPwdData.password 
      });
      toast.success("Contraseña actualizada", { id: loadingToast });
      setResetPwdData({ id: null, password: "" });
      setConfirmPasswordSup(null); 
    } catch (error) {
      toast.error("Error al cambiar contraseña", { id: loadingToast });
      setConfirmPasswordSup(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Gestión de Empresas</h1>
          <p className="text-slate-500 mt-1">
            Configura tus clientes y sus canales de reporte
          </p>
        </div>
        <button
          onClick={() => setIsFormModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Registrar Empresa
        </button>
      </div>

      {/* Buscador */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 mb-6 flex items-center gap-3">
        <div className="p-2 bg-slate-50 rounded-xl ml-1 text-slate-400">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Buscar empresa por nombre o RUC..."
          className="w-full py-2 outline-none bg-transparent"
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPaginaActual(0); }}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
                <th className="p-5 font-bold">Empresa Cliente</th>
                <th className="p-5 font-bold">Identificación (RUC)</th>
                <th className="p-5 font-bold text-right">Canales y Edición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="3"
                    className="p-10 text-center text-slate-400 animate-pulse"
                  >
                    Cargando empresas...
                  </td>
                </tr>
              ) : empresasPaginadas.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-10 text-center text-slate-400">
                    No se encontraron resultados
                  </td>
                </tr>
              ) : (
                empresasPaginadas.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-white flex items-center justify-center shadow-sm">
                          <LogoConFallback url={emp.logoUrl} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {emp.nombre}
                          </p>
                          <p className="text-xs text-blue-600 font-medium tracking-wide">
                            ACTIVA
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">
                      {emp.ruc || "No registrado"}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirEdicion(emp)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="Editar"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => copiarEnlace(emp.tokenPublico)}
                          className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                          title="Copiar Enlace"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={() => setQrModalData(emp)}
                          className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                          title="Ver QR"
                        >
                          <QrCode size={18} />
                        </button>
                        <button
                          onClick={() => setEmpresaAEliminar(emp)}
                          className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          title="Eliminar"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => abrirGestionSupervisor(emp)}
                          className="p-2.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                          title="Gestionar Supervisor"
                        >
                          <UserCog size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
        </div>
        {/* NUEVO: Controles de Paginación */}
        <div className="p-4 border-t border-slate-100 flex justify-end items-center bg-slate-50/50 gap-4">
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

      {/* Modal: Formulario (Crear/Editar) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50 sticky top-0 bg-white z-10">
              <h2 className="text-xl font-black text-slate-800">
                {editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
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
                  Nombre Comercial
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Número de RUC
                </label>
                <input
                  required
                  type="text"
                  maxLength="11"
                  pattern="\d{11}"
                  title="Debe contener exactamente 11 números"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                  value={formData.ruc}
                  onChange={(e) => {
                    const soloNumeros = e.target.value.replace(/\D/g, "");
                    if (soloNumeros.length <= 11) {
                      setFormData({ ...formData, ruc: soloNumeros });
                    }
                  }}
                />
              </div>

              {/* SECCIÓN VISUAL PARA DEPARTAMENTOS */}
              <div className="border-t border-slate-100 pt-5 mt-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Departamentos / Áreas
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Recursos Humanos"
                    className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-sm"
                    value={nuevoDepto}
                    onChange={(e) => setNuevoDepto(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault(); // Evita que el form se envíe al presionar Enter
                        agregarDepto();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={agregarDepto}
                    className="bg-blue-100 text-blue-700 px-5 py-3.5 rounded-2xl font-bold hover:bg-blue-200 transition-colors"
                  >
                    Añadir
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mt-3 min-h-[40px]">
                  {departamentos.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      No has agregado ningún departamento.
                    </span>
                  ) : (
                    departamentos.map((depto, index) => (
                      <span
                        key={index}
                        className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-2 animate-in fade-in"
                      >
                        {depto}
                        <button
                          type="button"
                          onClick={() => removerDepto(index)}
                          className="text-slate-400 hover:text-red-400 font-bold"
                          title="Eliminar"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-5 mt-2">
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Logo Corporativo
                </label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-blue-400 transition-all bg-slate-50 group/upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <Upload
                      className="mx-auto text-slate-300 group-hover/upload:text-blue-500 transition-colors mb-2"
                      size={28}
                    />
                    <p className="text-sm font-bold text-slate-600">
                      {formData.logo
                        ? formData.logo.name
                        : editingEmpresa
                          ? "Cambiar logo actual"
                          : "Subir imagen"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Formatos sugeridos: PNG o JPG
                    </p>
                  </div>
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
                  className="flex-[2] bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95"
                >
                  {editingEmpresa ? "Guardar Cambios" : "Registrar Empresa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Eliminar */}
      {empresaAEliminar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              ¿Eliminar Empresa?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Estás a punto de eliminar a <b>{empresaAEliminar.nombre}</b>. Esta
              acción desactivará la empresa del sistema.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setEmpresaAEliminar(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: QR */}
      {qrModalData && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-sm overflow-hidden shadow-2xl text-center p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div className="text-left">
                <h2 className="text-2xl font-black text-slate-800 leading-tight">
                  {qrModalData.nombre}
                </h2>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">
                  Código QR de Acceso
                </p>
              </div>
              <button
                onClick={() => setQrModalData(null)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex justify-center mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <QRCodeCanvas
                id="qr-canvas"
                value={`${window.location.origin}/reportar/${qrModalData.tokenPublico}`}
                size={200}
                level={"H"}
                includeMargin={true}
              />
            </div>

            <button
              onClick={descargarQR}
              className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2"
            >
              Descargar Imagen para Imprimir
            </button>
          </div>
        </div>
      )}

      {/* Modal: Gestión de Supervisor REDISEÑADO */}
      {supervisorModalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" /> Accesos de Cliente
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {supervisorModalData.nombre}
                </p>
              </div>
              <button onClick={() => setSupervisorModalData(null)} className="p-2 hover:bg-white hover:shadow-sm rounded-full transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
              {loadingSup ? (
                <div className="py-10 text-center animate-pulse text-slate-400 font-medium">
                  Buscando credenciales...
                </div>
              ) : (
                <>
                  {!isCreatingSup ? (
                    /* LISTA DE SUPERVISORES */
                    <div className="space-y-4">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Supervisores Autorizados</h3>
                        <button onClick={() => setIsCreatingSup(true)} className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200 flex items-center gap-1">
                          <Plus size={14}/> Nuevo Acceso
                        </button>
                      </div>

                      {supervisores.length === 0 ? (
                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center">
                          <Users size={32} className="mx-auto text-slate-300 mb-2" />
                          <p className="text-sm text-slate-500 font-bold">Sin supervisores registrados</p>
                        </div>
                      ) : (
                        <div className="grid gap-3">
                          {supervisores.map(sup => (
                            <div key={sup.id} className={`p-4 rounded-2xl border transition-all ${sup.activo ? 'border-blue-100 bg-blue-50/30' : 'border-slate-200 bg-slate-50 opacity-70'}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className={`font-bold ${sup.activo ? 'text-slate-800' : 'text-slate-500 line-through'}`}>{sup.nombre}</h4>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase ${sup.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                      {sup.activo ? 'Activo' : 'Inactivo'}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 mt-0.5">{sup.email}</p>
                                </div>
                                <div className="flex gap-1.5">
                                  <button onClick={() => setResetPwdData({id: sup.id, password: ""})} className="p-2 text-slate-400 hover:text-blue-600 bg-white border border-slate-200 rounded-lg">
                                    <Key size={16}/>
                                  </button>
                                  <button onClick={() => setConfirmToggleSup(sup.id)} className={`p-2 rounded-lg border bg-white ${sup.activo ? 'text-red-500 hover:text-red-700 border-slate-200' : 'text-green-600 hover:text-green-700 border-slate-200'}`}>
                                    {sup.activo ? <PowerOff size={16} /> : <Power size={16} />}
                                  </button>
                                </div>
                              </div>
                              
                              {/* Formulario de Cambio de Clave Inline MODIFICADO */}
                              {resetPwdData.id === sup.id && (
                                <div className="mt-4 pt-3 border-t border-slate-200">
                                  <div className="flex gap-2 relative">
                                    <div className="relative flex-1">
                                      <input 
                                        type={verPass ? "text" : "password"} 
                                        placeholder="Nueva contraseña..." 
                                        className="text-sm border border-slate-200 px-3 py-2 rounded-xl w-full outline-none focus:border-blue-500 bg-white" 
                                        value={resetPwdData.password} 
                                        onChange={(e) => setResetPwdData({id: sup.id, password: e.target.value})} 
                                      />
                                      <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-3 top-2 text-slate-400 hover:text-slate-600">
                                        {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                      </button>
                                    </div>
                                    
                                    <button 
                                      type="button"
                                      disabled={
                                        !validarPassword(resetPwdData.password).longitud ||
                                        !validarPassword(resetPwdData.password).letras ||
                                        !validarPassword(resetPwdData.password).numero
                                      }
                                      onClick={() => {
                                          setConfirmPasswordSup(sup.id);
                                      }} 
                                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed"
                                    >
                                      <Save size={16}/>
                                    </button>
                                    <button type="button" onClick={() => {setResetPwdData({id: null, password: ""}); setVerPass(false);}} className="bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-2 rounded-xl text-sm font-bold transition-colors"><X size={16}/></button>
                                  </div>

                                  {/* CHECKS VISUALES INLINE */}
                                  {resetPwdData.password && (
                                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 animate-in fade-in">
                                      <span className={`text-[9px] font-bold transition-colors ${validarPassword(resetPwdData.password).longitud ? 'text-green-600' : 'text-slate-400'}`}>
                                        {validarPassword(resetPwdData.password).longitud ? '✓' : '○'} 8+ chars
                                      </span>
                                      <span className={`text-[9px] font-bold transition-colors ${validarPassword(resetPwdData.password).letras ? 'text-green-600' : 'text-slate-400'}`}>
                                        {validarPassword(resetPwdData.password).letras ? '✓' : '○'} Aa
                                      </span>
                                      <span className={`text-[9px] font-bold transition-colors ${validarPassword(resetPwdData.password).numero ? 'text-green-600' : 'text-slate-400'}`}>
                                        {validarPassword(resetPwdData.password).numero ? '✓' : '○'} 123
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* FORMULARIO DE CREACIÓN */
                    <form onSubmit={handleCrearSupervisor} className="space-y-4">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Nuevo Acceso</h3>
                        <button type="button" onClick={() => setIsCreatingSup(false)} className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1">
                          <X size={14}/> Cancelar
                        </button>
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre Completo</label>
                        <input required type="text" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none" value={formSup.nombre} onChange={(e) => setFormSup({ ...formSup, nombre: e.target.value })} />
                      </div>
                      {/* CAMPO EMAIL MODIFICADO */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Email Corporativo</label>
                        <input 
                          required 
                          type="email" 
                          className={`w-full bg-slate-50 border p-3 rounded-xl outline-none transition-all ${
                            formSup.email && !esEmailValido(formSup.email) 
                              ? "border-red-400 focus:ring-2 focus:ring-red-200" 
                              : "border-slate-100 focus:border-blue-500"
                          }`}
                          value={formSup.email} 
                          onChange={(e) => setFormSup({ ...formSup, email: e.target.value })} 
                        />
                        {formSup.email && !esEmailValido(formSup.email) && (
                          <p className="text-[10px] text-red-500 font-bold mt-1.5 animate-in fade-in">
                            Debe ser un correo válido (ej: usuario@empresa.com)
                          </p>
                        )}
                      </div>
                      
                      {/* CAMPO CONTRASEÑA MODIFICADO */}
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Contraseña Temporal</label>
                        <div className="relative">
                          <input 
                            required 
                            type={verPass ? "text" : "password"} 
                            className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:border-blue-500 transition-all" 
                            value={formSup.password} 
                            onChange={(e) => setFormSup({ ...formSup, password: e.target.value })} 
                          />
                          <button type="button" onClick={() => setVerPass(!verPass)} className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                            {verPass ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        
                        {/* INDICADORES INTERACTIVOS DE CONTRASEÑA */}
                        {formSup.password && (
                          <div className="mt-2.5 space-y-1 animate-in slide-in-from-top-1">
                            <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formSup.password).longitud ? 'text-green-600' : 'text-slate-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formSup.password).longitud ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              Al menos 8 caracteres
                            </p>
                            <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formSup.password).letras ? 'text-green-600' : 'text-slate-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formSup.password).letras ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              Una minúscula y una mayúscula
                            </p>
                            <p className={`text-[10px] font-bold flex items-center gap-1.5 transition-colors ${validarPassword(formSup.password).numero ? 'text-green-600' : 'text-slate-400'}`}>
                              <div className={`w-1.5 h-1.5 rounded-full ${validarPassword(formSup.password).numero ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                              Al menos 1 número
                            </p>
                          </div>
                        )}
                      </div>
                      <button 
                        type="submit" 
                        disabled={
                          !esEmailValido(formSup.email) || 
                          !validarPassword(formSup.password).longitud ||
                          !validarPassword(formSup.password).letras ||
                          !validarPassword(formSup.password).numero
                        }
                        className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-bold mt-4 disabled:opacity-50 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all"
                      >
                        Guardar Credenciales
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL CONFIRMAR ESTADO */}
      {confirmToggleSup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Cambiar Acceso?</h2>
            <p className="text-slate-500 text-sm mb-6">
              El usuario <b>{supervisores.find(s => s.id === confirmToggleSup)?.activo ? "perderá" : "recuperará"}</b> su acceso al sistema inmediatamente.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmToggleSup(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={ejecutarToggleEstadoSup} className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600 transition-colors">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CONTRASEÑA */}
      {confirmPasswordSup && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
              <Key size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Cambiar Contraseña?</h2>
            <p className="text-slate-500 text-sm mb-6">
              Asegúrate de haber copiado la nueva clave antes de confirmar.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPasswordSup(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Cancelar
              </button>
              <button onClick={ejecutarCambiarPassword} className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>  
  );
}