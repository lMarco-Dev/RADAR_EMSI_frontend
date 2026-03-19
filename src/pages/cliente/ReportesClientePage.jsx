import { useState, useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import axiosInstance from "../../api/axiosInstance";
import {
  FileText,
  Eye,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Shield,
  MessageSquare,
  Image as ImageIcon,
  ChevronRight as ChevronRightIcon,
  Search
} from "lucide-react";
import toast from "react-hot-toast";

const decodificarHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export default function ReportesClientePage() {
  const { user } = useAuthStore();
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Paginación Local
  const [page, setPage] = useState(0);

  // Modal y Detalle
  const [modalOpen, setModalOpen] = useState(false);
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [viendoImagenes, setViendoImagenes] = useState(false);

  useEffect(() => {
    if (user?.empresaId) cargarReportes();
  }, [user]);

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get("/reportes", {
        params: { empresaId: user.empresaId, page: 0, size: 1000 },
      });

      const datosLimpios = (data.data.content || []).map((rep) => ({
        ...rep,
        empresaNombre: decodificarHTML(rep.empresaNombre),
        area: decodificarHTML(rep.area),
        tipoComportamientoNombre: decodificarHTML(rep.tipoComportamientoNombre),
        nombreReportante: decodificarHTML(rep.nombreReportante),
      }));

      setReportes(datosLimpios);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const verDetalle = async (id) => {
    setModalOpen(true);
    setViendoImagenes(false);
    setLoadingDetalle(true);
    try {
      const { data } = await axiosInstance.get(`/reportes/${id}`);

      let detalle = data.data;
      detalle.empresaNombre = decodificarHTML(detalle.empresaNombre);
      detalle.area = decodificarHTML(detalle.area);
      detalle.tipoComportamientoNombre = decodificarHTML(detalle.tipoComportamientoNombre);
      detalle.descripcionComportamiento = decodificarHTML(detalle.descripcionComportamiento);
      detalle.medidaContencion = decodificarHTML(detalle.medidaContencion);
      detalle.nombreReportante = decodificarHTML(detalle.nombreReportante);

      if (detalle.historial) {
        detalle.historial = detalle.historial.map((h) => ({
          ...h,
          comentario: decodificarHTML(h.comentario),
        }));
      }

      setReporteSeleccionado(detalle);
    } catch (error) {
      toast.error("Error al cargar el detalle");
      setModalOpen(false);
    } finally {
      setLoadingDetalle(false);
    }
  };

  const formatearFechaCorta = (fechaStr) => {
    if (!fechaStr) return "";
    const [year, month, day] = fechaStr.split("-");
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" });
  };

  const formatearFechaCompleta = (fecha) =>
    new Date(fecha).toLocaleDateString("es-PE", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getEstadoBadge = (estado) => {
    const estilos = {
      PENDIENTE: "bg-amber-100 text-amber-700 border-amber-200",
      EN_REVISION: "bg-blue-100 text-blue-700 border-blue-200",
      SOLUCIONADO: "bg-emerald-100 text-emerald-700 border-emerald-200",
    };
    return (
      <span
        className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${
          estilos[estado] || "bg-slate-100 text-slate-600"
        }`}
      >
        {estado?.replace("_", " ")}
      </span>
    );
  };

  // Filtro de búsqueda
  const reportesFiltrados = reportes.filter((rep) => {
    const term = searchTerm.toLowerCase();
    return (
      rep.folio?.toLowerCase().includes(term) ||
      rep.nombreReportante?.toLowerCase().includes(term) ||
      rep.fechaOcurrido?.includes(term)
    );
  });

  const totalPages = Math.ceil(reportesFiltrados.length / 10);
  const reportesPaginados = reportesFiltrados.slice(page * 10, (page + 1) * 10);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Tus Reportes</h2>
          <p className="text-slate-500 text-sm">Historial de incidencias reportadas en tu empresa.</p>
        </div>
        
        {/* Buscador */}
        <div className="w-full md:w-auto bg-slate-50 rounded-2xl flex items-center px-4 py-2 border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
          <Search className="text-slate-400 mr-3" size={20} />
          <input
            type="text"
            placeholder="Buscar por folio, nombre o fecha..."
            className="bg-transparent w-full md:w-64 outline-none text-sm font-medium text-slate-700 py-1"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="p-4 font-bold">Folio</th>
              <th className="p-4 font-bold">Tipo</th>
              <th className="p-4 font-bold">Fecha / Área</th>
              <th className="p-4 font-bold">Estado</th>
              <th className="p-4 font-bold text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 animate-pulse">
                  Cargando reportes...
                </td>
              </tr>
            ) : reportesPaginados.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">
                  No se encontraron reportes.
                </td>
              </tr>
            ) : (
              reportesPaginados.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-700">{rep.folio}</td>
                  <td className="p-4">
                    <p className="text-sm font-semibold text-slate-800">
                      {rep.tipoComportamientoNombre}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm text-slate-600 font-medium flex items-center gap-1">
                      <Calendar size={14} /> {formatearFechaCorta(rep.fechaOcurrido)}
                    </p>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{rep.area}</p>
                  </td>
                  <td className="p-4">{getEstadoBadge(rep.estado)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => verDetalle(rep.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    >
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-slate-500">
            Página {page + 1} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-7xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            
            {/* Panel Izquierdo: Información */}
            <div className="flex-1 flex flex-col bg-white relative overflow-hidden border-r border-slate-100">
              <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center z-10 bg-white gap-4">
                <div>
                  <span className="text-[10px] font-black bg-slate-800 text-white px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Detalle del Incidente
                  </span>
                  <h2 className="text-2xl font-black text-slate-800 mt-3 flex items-center gap-3">
                    <span className="text-blue-600">{reporteSeleccionado?.folio}</span>
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end hidden md:flex">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Estado Actual
                    </span>
                    {getEstadoBadge(reporteSeleccionado?.estado)}
                  </div>
                  <div className="h-10 w-px bg-slate-200 hidden md:block"></div>
                  <button
                    onClick={() => setViendoImagenes(!viendoImagenes)}
                    className={`flex items-center justify-center gap-2 font-bold px-6 py-3 rounded-xl transition-all shadow-sm ${
                      viendoImagenes
                        ? "bg-slate-800 hover:bg-slate-700 text-white"
                        : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100"
                    }`}
                  >
                    <ImageIcon size={18} />
                    {viendoImagenes
                      ? "Volver a Detalles"
                      : `Evidencias (${reporteSeleccionado?.evidencias?.length || 0})`}
                  </button>
                  
                  {/* Botón X visible en móvil, se oculta en desktop (porque a la derecha hay otro) */}
                  <button
                    onClick={() => setModalOpen(false)}
                    className="p-2 bg-slate-100 text-slate-500 hover:bg-red-500 hover:text-white rounded-full transition-colors md:hidden"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {loadingDetalle ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 animate-pulse">
                  Cargando detalles...
                </div>
              ) : reporteSeleccionado && (
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                  {viendoImagenes ? (
                    <div className="animate-in fade-in duration-300">
                      {reporteSeleccionado.evidencias && reporteSeleccionado.evidencias.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {reporteSeleccionado.evidencias.map((img, idx) => (
                            <div
                              key={idx}
                              className="group relative rounded-3xl overflow-hidden shadow-md border-4 border-white ring-1 ring-slate-100 aspect-video bg-slate-50"
                            >
                              <img
                                src={img.urlCloudinary}
                                alt="Evidencia"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                              <a
                                href={img.urlCloudinary}
                                target="_blank"
                                rel="noreferrer"
                                className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2 backdrop-blur-sm"
                              >
                                <Eye size={20} /> Ver Original
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                          <ImageIcon size={48} className="mb-3 text-slate-300" />
                          <p className="font-bold text-slate-500">
                            Sin material fotográfico adjunto
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="animate-in fade-in duration-300 space-y-8">
                      {/* PASO 1 y 2: DATOS BÁSICOS */}
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Calendar size={14} />{" "}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Fecha</span>
                          </div>
                          <p className="font-bold text-slate-700 text-lg">
                            {reporteSeleccionado.fechaOcurrido}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <Clock size={14} />{" "}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Turno</span>
                          </div>
                          <p className="font-bold text-slate-700 text-lg">
                            {reporteSeleccionado.turno || "N/A"}
                          </p>
                        </div>
                        <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100 shadow-sm">
                          <div className="flex items-center gap-2 text-slate-400 mb-2">
                            <MapPin size={14} />{" "}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Departamento / Área</span>
                          </div>
                          <p className="font-bold text-slate-700 truncate text-lg" title={reporteSeleccionado.area}>
                            {reporteSeleccionado.area}
                          </p>
                        </div>
                        <div className="bg-blue-50/50 p-5 rounded-[1.5rem] border border-blue-100 shadow-sm">
                          <div className="flex items-center gap-2 text-blue-400 mb-2">
                            <Shield size={14} />{" "}
                            <span className="text-[10px] font-bold uppercase tracking-widest">Tipo de comportamiento</span>
                          </div>
                          <p className="font-black text-blue-700 truncate text-lg" title={reporteSeleccionado.tipoComportamientoNombre}>
                            {reporteSeleccionado.tipoComportamientoNombre}
                          </p>
                        </div>
                      </div>

                      {/* CAMPOS OPCIONALES Y VARIABLES CORTOS */}
                      {(reporteSeleccionado.nombreReportante ||
                        reporteSeleccionado.lugarEspecifico ||
                        reporteSeleccionado.causaNombre ||
                        (reporteSeleccionado.camposDinamicos && reporteSeleccionado.camposDinamicos !== "{}")) && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {reporteSeleccionado.nombreReportante && (
                            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Nombres y Apellidos
                              </span>
                              <p className="font-bold text-slate-700 mt-1">
                                {reporteSeleccionado.nombreReportante}
                              </p>
                            </div>
                          )}
                          {reporteSeleccionado.lugarEspecifico && (
                            <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                Lugar específico
                              </span>
                              <p className="font-bold text-slate-700 mt-1">
                                {reporteSeleccionado.lugarEspecifico}
                              </p>
                            </div>
                          )}

                          {reporteSeleccionado.tipoComportamientoNombre?.toUpperCase() === "RECONOCIMIENTO" ? (
                            reporteSeleccionado.camposDinamicos &&
                            reporteSeleccionado.camposDinamicos !== "{}" && (
                              <div className="bg-amber-50/50 p-5 rounded-[1.5rem] border border-amber-100/50">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600">
                                  Motivo del Reconocimiento
                                </span>
                                <p className="font-bold text-slate-700 mt-1">
                                  {(() => {
                                    try {
                                      return (
                                        JSON.parse(reporteSeleccionado.camposDinamicos).motivoReconocimiento || "No especificado"
                                      );
                                    } catch (e) {
                                      return "No especificado";
                                    }
                                  })()}
                                </p>
                              </div>
                            )
                          ) : (
                            reporteSeleccionado.causaNombre && (
                              <div className="bg-red-50/50 p-5 rounded-[1.5rem] border border-red-100/50">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-red-500">
                                  Causa raíz (Aparente)
                                </span>
                                <p className="font-bold text-slate-700 mt-1">
                                  {reporteSeleccionado.causaNombre}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )}

                      {/* PASO 3: TEXTOS LARGOS DINÁMICOS */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div
                          className={
                            reporteSeleccionado.tipoComportamientoNombre?.toUpperCase() === "RECONOCIMIENTO"
                              ? "lg:col-span-2"
                              : ""
                          }
                        >
                          <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-4">
                            <MessageSquare size={16} className="text-blue-500" />
                            {reporteSeleccionado.tipoComportamientoNombre?.toUpperCase() === "RECONOCIMIENTO"
                              ? "Descripción del reconocimiento"
                              : "Descripción detallada"}
                          </h4>
                          <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm text-slate-600 text-sm leading-relaxed h-[200px] overflow-y-auto custom-scrollbar whitespace-pre-wrap font-medium">
                            {reporteSeleccionado.descripcionComportamiento}
                          </div>
                        </div>

                        {reporteSeleccionado.tipoComportamientoNombre?.toUpperCase() !== "RECONOCIMIENTO" && (
                          <div>
                            <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-4">
                              <Shield size={16} className="text-emerald-500" />{" "}
                              Medida de contención inmediata
                            </h4>
                            {reporteSeleccionado.medidaContencion ? (
                              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm text-slate-600 text-sm leading-relaxed h-[200px] overflow-y-auto custom-scrollbar whitespace-pre-wrap font-medium">
                                {reporteSeleccionado.medidaContencion}
                              </div>
                            ) : (
                              <div className="flex items-center justify-center bg-slate-50 border border-slate-100 rounded-[1.5rem] h-[200px] text-sm font-bold text-slate-400 text-center px-4">
                                Sin medidas de contención <br /> reportadas.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Panel Derecho: SOLO Seguimiento */}
            <div className="w-full md:w-[350px] bg-slate-900 flex flex-col z-20 shadow-2xl relative">
              <div className="p-5 flex justify-between items-center border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0">
                <span className="text-xs font-bold text-blue-400 tracking-widest uppercase flex items-center gap-2">
                  <Clock size={14} /> Historial
                </span>
                {/* Botón X visible en Desktop aquí */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500 p-2 rounded-xl transition-all hidden md:block"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-slate-950">
                {reporteSeleccionado?.historial && reporteSeleccionado.historial.length > 0 ? (
                  <div className="space-y-6 pl-3 border-l-2 border-slate-800 ml-2">
                    {reporteSeleccionado.historial.map((hito, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1 shadow-[0_0_10px_rgba(59,130,246,0.6)] ring-4 ring-slate-950"></div>
                        
                        <p className="text-xs font-black text-slate-400 uppercase tracking-wide flex items-center gap-2">
                          {hito.estadoAnterior}{" "}
                          <ChevronRightIcon size={12} className="text-slate-600" />{" "}
                          <span className={hito.estadoNuevo === "SOLUCIONADO" ? "text-emerald-400" : "text-blue-400"}>
                            {hito.estadoNuevo}
                          </span>
                        </p>
                        
                        <div className="mt-1.5 mb-3">
                          <p className="text-[10px] text-slate-500 font-bold">
                            {formatearFechaCompleta(hito.fechaCambio)}
                          </p>
                        </div>

                        {hito.comentario && (
                          <div className="bg-slate-900 p-4 rounded-2xl text-xs text-slate-300 border border-slate-800 italic leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
                            "{hito.comentario}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-3">
                    <Clock size={32} className="opacity-20" />
                    <p className="text-sm font-bold text-center px-4">
                      Reporte recién ingresado.
                      <br />
                      No registra movimientos.
                    </p>
                  </div>
                )}
                
                {/* Evento inicial siempre visible */}
                <div className="relative pl-3 mt-6 ml-2">
                  <div className="absolute w-3 h-3 bg-slate-700 rounded-full -left-[5px] top-1 ring-4 ring-slate-950"></div>
                  <div className="pl-6">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wide">
                      Reporte Creado
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold mt-1">
                      {formatearFechaCompleta(reporteSeleccionado?.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}