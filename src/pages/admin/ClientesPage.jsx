import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";
import { Search, Plus, X, QrCode, Copy, Building2, Upload, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import toast from "react-hot-toast";

// Sub-componente para manejar el error de la imagen rota
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

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Estados para Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [qrModalData, setQrModalData] = useState(null);
  const [editingEmpresa, setEditingEmpresa] = useState(null);
  const [empresaAEliminar, setEmpresaAEliminar] = useState(null);
  
  const [formData, setFormData] = useState({ nombre: "", ruc: "", logo: null });

  useEffect(() => {
    cargarEmpresas();
  }, []);

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFormData({ ...formData, logo: file });
  };

  // Abrir modal para editar
  const abrirEdicion = (emp) => {
    setEditingEmpresa(emp);
    setFormData({ nombre: emp.nombre, ruc: emp.ruc, logo: null });
    setIsFormModalOpen(true);
  };

  const cerrarModal = () => {
    setIsFormModalOpen(false);
    setEditingEmpresa(null);
    setFormData({ nombre: "", ruc: "", logo: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss(); // Limpia notificaciones previas

    if (formData.ruc.length !== 11) {
      toast.error("El RUC debe tener exactamente 11 dígitos numéricos");
      return;
    }

    const loadingToast = toast.loading(editingEmpresa ? "Actualizando empresa..." : "Creando empresa...");
    
    try {
      const data = new FormData();
      data.append("nombre", formData.nombre);
      data.append("ruc", formData.ruc);
      if (formData.logo) data.append("logo", formData.logo);

      if (editingEmpresa) {
        await axiosInstance.put(`/empresas/${editingEmpresa.id}`, data);
        toast.success("Empresa actualizada correctamente", { id: loadingToast });
      } else {
        await axiosInstance.post("/empresas", data);
        toast.success("Empresa registrada exitosamente", { id: loadingToast });
      }
      
      cerrarModal();
      cargarEmpresas();
    } catch (error) {
      // Aquí capturamos el error exacto del backend (RUC/Nombre duplicado)
      const msj = error.response?.data?.message || "Ocurrió un error al procesar la solicitud";
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
    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = `QR_${qrModalData.nombre.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    setTimeout(() => {
      toast.success("Iniciando descarga del QR...");
    }, 100);
  };

  const empresasFiltradas = empresas.filter(emp => 
    emp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.ruc.includes(searchTerm)
  );

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">Gestión de Empresas</h1>
          <p className="text-slate-500 mt-1">Configura tus clientes y sus canales de reporte</p>
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
          onChange={(e) => setSearchTerm(e.target.value)}
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
                <tr><td colSpan="3" className="p-10 text-center text-slate-400 animate-pulse">Cargando empresas...</td></tr>
              ) : empresasFiltradas.length === 0 ? (
                <tr><td colSpan="3" className="p-10 text-center text-slate-400">No se encontraron resultados</td></tr>
              ) : (
                empresasFiltradas.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-white flex items-center justify-center shadow-sm">
                          {/* Aquí usamos el nuevo componente para evitar logos rotos */}
                          <LogoConFallback url={emp.logoUrl} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{emp.nombre}</p>
                          <p className="text-xs text-blue-600 font-medium tracking-wide">ACTIVA</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-slate-600 font-medium">{emp.ruc || "No registrado"}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => abrirEdicion(emp)} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="Editar">
                          <Pencil size={18} />
                        </button>
                        <button onClick={() => copiarEnlace(emp.tokenPublico)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Copiar Enlace">
                          <Copy size={18} />
                        </button>
                        <button onClick={() => setQrModalData(emp)} className="p-2.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-xl transition-all" title="Ver QR">
                          <QrCode size={18} />
                        </button>
                        <button onClick={() => setEmpresaAEliminar(emp)} className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" title="Eliminar">
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

      {/* Modal: Formulario (Crear/Editar) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800">
                {editingEmpresa ? "Editar Empresa" : "Nueva Empresa"}
              </h2>
              <button onClick={cerrarModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Nombre Comercial</label>
                <input required type="text" className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none" 
                  
                  value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Número de RUC</label>
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
                      setFormData({...formData, ruc: soloNumeros});
                    }
                  }} 
                />
              </div>
              
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Logo Corporativo</label>
                <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 hover:border-blue-400 transition-all bg-slate-50 group/upload">
                  <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <div className="text-center">
                    <Upload className="mx-auto text-slate-300 group-hover/upload:text-blue-500 transition-colors mb-2" size={28} />
                    <p className="text-sm font-bold text-slate-600">
                      {formData.logo ? formData.logo.name : (editingEmpresa ? "Cambiar logo actual" : "Subir imagen")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Formatos sugeridos: PNG o JPG</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={cerrarModal} className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl transition-colors">Cancelar</button>
                <button type="submit" className="flex-[2] bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-95">
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
            <h2 className="text-xl font-black text-slate-800 mb-2">¿Eliminar Empresa?</h2>
            <p className="text-slate-500 text-sm mb-6">Estás a punto de eliminar a <b>{empresaAEliminar.nombre}</b>. Esta acción desactivará la empresa del sistema.</p>
            <div className="flex gap-3">
              <button onClick={() => setEmpresaAEliminar(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">Cancelar</button>
              <button onClick={handleEliminar} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors">Eliminar</button>
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
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{qrModalData.nombre}</h2>
                <p className="text-blue-600 text-xs font-bold uppercase tracking-widest mt-1">Código QR de Acceso</p>
              </div>
              <button onClick={() => setQrModalData(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
            </div>
            
            <div className="flex justify-center mb-8 bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
              <QRCodeCanvas id="qr-canvas" value={`${window.location.origin}/reportar/${qrModalData.tokenPublico}`} size={200} level={"H"} includeMargin={true} />
            </div>

            <button onClick={descargarQR} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
              Descargar Imagen para Imprimir
            </button>
          </div>
        </div>
      )}
    </div>
  );
}