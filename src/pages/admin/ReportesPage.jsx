import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, Filter, Eye, Calendar, MapPin, Clock, MessageSquare, Shield, X, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);

  useEffect(() => { cargarReportes(); }, []);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/reportes");
      setReportes(response.data.data.content || []);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const cerrarModal = () => setReporteSeleccionado(null);

  const reportesFiltrados = reportes.filter(rep => 
    rep.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.empresaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rep.area?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Bandeja de Reportes</h1>
        <p className="text-slate-500 mt-1">Gestión centralizada de incidentes y evidencias</p>
      </div>

      {/* Buscador */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 flex gap-4 items-center">
        <div className="flex-1 bg-slate-50 rounded-xl flex items-center px-4 py-2.5 border border-slate-200">
          <Search className="text-slate-400 mr-2" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por folio, empresa o área..." 
            className="bg-transparent w-full outline-none text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="p-5 font-bold">Incidente / Folio</th>
              <th className="p-5 font-bold">Empresa / Área</th>
              <th className="p-5 font-bold text-center">Estado</th>
              <th className="p-5 font-bold text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan="4" className="p-10 text-center animate-pulse text-slate-400">Cargando datos...</td></tr>
            ) : reportesFiltrados.map((rep) => (
              <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-5">
                  <div className="font-black text-blue-600 tracking-tight">{rep.folio}</div>
                  <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1 uppercase">
                    <Calendar size={12} /> {rep.fechaOcurrido}
                  </div>
                </td>
                <td className="p-5">
                  <div className="font-bold text-slate-700">{rep.empresaNombre}</div>
                  <div className="text-xs text-slate-400">{rep.area}</div>
                </td>
                <td className="p-5 text-center">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                    rep.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {rep.estado}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => setReporteSeleccionado(rep)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                  >
                    <Eye size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE DETALLE INTUITIVO */}
      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300">
            
            {/* Header del Modal */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">
                  Detalle del Incidente
                </span>
                <h2 className="text-2xl font-black text-slate-800 mt-2 flex items-center gap-2">
                  {reporteSeleccionado.folio} 
                  <span className="text-slate-300 font-light">|</span> 
                  <span className="text-slate-500 text-lg font-bold">{reporteSeleccionado.empresaNombre}</span>
                </h2>
              </div>
              <button onClick={cerrarModal} className="p-3 hover:bg-white hover:shadow-md rounded-full transition-all text-slate-400 hover:text-red-500">
                <X size={24} />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                
                {/* Columna Izquierda: Información */}
                <div className="space-y-8">
                  
                  {/* Grid de Datos Rápidos */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Calendar size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span>
                      </div>
                      <p className="font-bold text-slate-700">{reporteSeleccionado.fechaOcurrido}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Clock size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Turno</span>
                      </div>
                      <p className="font-bold text-slate-700">{reporteSeleccionado.turno}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <MapPin size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Área / Lugar</span>
                      </div>
                      <p className="font-bold text-slate-700">{reporteSeleccionado.area}</p>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">{reporteSeleccionado.lugarEspecifico || "N/A"}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-400 mb-1">
                        <Shield size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Clasificación</span>
                      </div>
                      <p className="font-bold text-blue-600">{reporteSeleccionado.tipoComportamientoNombre}</p>
                    </div>
                  </div>

                  {/* Descripción y Medida */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-3">
                        <MessageSquare size={16} className="text-blue-500" /> Descripción del Suceso
                      </h4>
                      <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 text-slate-700 leading-relaxed text-sm italic">
                        "{reporteSeleccionado.descripcionComportamiento}"
                      </div>
                    </div>

                    {reporteSeleccionado.medidaContencion && (
                      <div>
                        <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-3">
                          <Shield size={16} className="text-green-500" /> Acción Tomada Inmediata
                        </h4>
                        <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100/50 text-slate-700 text-sm">
                          {reporteSeleccionado.medidaContencion}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Columna Derecha: Evidencias Fotográficas */}
                <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100">
                  <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-6">
                    <ImageIcon size={16} className="text-slate-400" /> Evidencias Adjuntas
                  </h4>
                  
                  {reporteSeleccionado.evidencias && reporteSeleccionado.evidencias.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {reporteSeleccionado.evidencias.map((img, idx) => (
                        <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-md border-4 border-white aspect-video bg-white">
                          <img 
                            src={img.urlCloudinary} 
                            alt="Evidencia" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <a 
                            href={img.urlCloudinary} 
                            target="_blank" 
                            rel="noreferrer"
                            className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2"
                          >
                            <Eye size={20} /> Ver tamaño completo
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
                      <ImageIcon size={48} className="mb-2 opacity-20" />
                      <p className="font-bold text-sm">Sin fotos adjuntas</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="p-6 bg-slate-900 flex justify-between items-center text-white">
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                <span>Registrado: {new Date(reporteSeleccionado.createdAt).toLocaleString()}</span>
              </div>
              <button 
                onClick={cerrarModal}
                className="bg-white/10 hover:bg-white/20 px-6 py-2.5 rounded-xl font-bold transition-all text-sm"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}