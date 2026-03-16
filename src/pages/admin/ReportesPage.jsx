import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { Search, Filter, Eye, Calendar, MapPin, Clock, MessageSquare, Shield, X, Image as ImageIcon, Loader2, Download } from "lucide-react"; 
import toast from "react-hot-toast";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [paginaActual, setPaginaActual] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [estadisticas, setEstadisticas] = useState({ TOTAL: 0, PENDIENTE: 0, EN_REVISION: 0, SOLUCIONADO: 0 });
  const [reporteSeleccionado, setReporteSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [comentario, setComentario] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [viendoImagenes, setViendoImagenes] = useState(false);

  useEffect(() => { cargarReportes(); cargarEstadisticas(); }, []);

  const cargarEstadisticas = async () => {
    try {
      const res = await axiosInstance.get("/reportes/estadisticas");
      const contadores = res.data.data.contadores; 

      setEstadisticas({
        TOTAL: contadores?.total || 0,
        PENDIENTE: contadores?.pendientes || 0,
        EN_REVISION: contadores?.enRevision || 0,
        SOLUCIONADO: contadores?.solucionados || 0
      });
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    }
  };

  const cargarReportes = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/reportes", {
        params: { page: 0, size: 1000 } 
      });
      setReportes(response.data.data.content || []);
    } catch (error) {
      toast.error("Error al cargar los reportes");
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = async (id) => {
    setViendoImagenes(false);
    setLoadingDetalle(true);
    try {
      const res = await axiosInstance.get(`/reportes/${id}`);
      const data = res.data.data;
      setReporteSeleccionado(data);
      setNuevoEstado(data.estado); 
      setComentario("");
    } catch (error) {
      toast.error("Error al cargar el detalle del reporte");
    } finally {
      setLoadingDetalle(false);
    }
  };

  const cerrarModal = () => {
    setViendoImagenes(false);
    setReporteSeleccionado(null);
    setNuevoEstado("");
    setComentario("");
  };

  const handleGuardarCambios = async () => {
    setIsUpdating(true);
    try {
      await axiosInstance.patch(`/reportes/${reporteSeleccionado.id}/estado`, {
        estado: nuevoEstado,
        comentario: comentario
      });
      toast.success("Actualizado correctamente");
      cargarReportes(); 
      cargarEstadisticas(); // Refrescar los contadores
      abrirModal(reporteSeleccionado.id); 
      setComentario("");
    } catch (error) {
      toast.error("Error al actualizar");
    } finally {
      setIsUpdating(false);
    }
  };

  const estadoCambiado = reporteSeleccionado && (nuevoEstado !== reporteSeleccionado.estado);
  const comentarioValido = comentario.trim().length > 0;

  const reportesFiltrados = reportes.filter(rep => {
    const matchBusqueda = rep.folio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rep.empresaNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          rep.area?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchEstado = filtroEstado === "TODOS" || rep.estado === filtroEstado;
    
    let matchFecha = true;
    if (fechaDesde && fechaHasta && rep.fechaOcurrido) {
      const fechaRep = new Date(rep.fechaOcurrido);
      const desde = new Date(fechaDesde);
      const hasta = new Date(fechaHasta);
      matchFecha = fechaRep >= desde && fechaRep <= hasta;
    }

    return matchBusqueda && matchEstado && matchFecha;
  });

  const totalPaginasCalculadas = Math.ceil(reportesFiltrados.length / 10);
  const reportesPaginados = reportesFiltrados.slice(paginaActual * 10, (paginaActual + 1) * 10);

  const handleExportCSV = () => {
    if (reportesFiltrados.length === 0) {
      toast.error("No hay datos para exportar");
      return;
    }

    const separador = ";";
    const encabezados = ["Folio", "Fecha", "Empresa", "Area", "Turno", "Clasificacion", "Estado"].join(separador);
    
    const limpiarTexto = (texto) => {
      if (!texto) return '""';
      return `"${texto.toString().replace(/"/g, '""').replace(/\n/g, ' ')}"`;
    };

    const filas = reportesFiltrados.map(r => [
      r.folio,
      r.fechaOcurrido,
      limpiarTexto(r.empresaNombre),
      limpiarTexto(r.area),
      r.turno,
      limpiarTexto(r.tipoComportamientoNombre),
      r.estado
    ].join(separador));

    const contenidoCSV = [encabezados, ...filas].join("\n");
    const blob = new Blob(["\ufeff" + contenidoCSV], { type: "text/csv;charset=utf-8;" }); 
    
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Reportes_RADAR_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    toast.success("Excel generado correctamente");
  };

  return (
    <div className="p-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800">Bandeja de Reportes</h1>
        <p className="text-slate-500 mt-1">Gestión centralizada de incidentes y evidencias</p>
      </div>

      <div className="mb-6 space-y-3">
        
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 w-full bg-white rounded-2xl flex items-center px-4 py-3 border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-50 transition-all">
            <Search className="text-slate-400 mr-3" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por folio, empresa o área..." 
              className="bg-transparent w-full outline-none text-sm font-medium text-slate-700"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPaginaActual(0); }}
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:bg-green-50 hover:text-green-700 hover:border-green-200 text-slate-600 rounded-2xl font-bold transition-all text-sm shadow-sm active:scale-95"
          >
            <Download size={18} /> Exportar
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-slate-50/80 p-3 rounded-2xl border border-slate-100">
          
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-full md:w-auto overflow-x-auto custom-scrollbar">
            {["TODOS", "PENDIENTE", "EN_REVISION", "SOLUCIONADO"].map((est) => {
              const cantidadReal = est === "TODOS" ? estadisticas.TOTAL : (estadisticas[est] || 0);
              return (
                <button
                  key={est}
                  onClick={() => { setFiltroEstado(est); setPaginaActual(0); }}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                    filtroEstado === est 
                      ? "bg-white text-blue-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {est.replace('_', ' ')}
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${filtroEstado === est ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'}`}>
                    {cantidadReal}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block"></div>

          <div className="flex flex-wrap items-center gap-2 text-sm w-full md:w-auto">
            <Calendar size={14} className="text-slate-400" />
            <input 
              type="date" 
              className="bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 shadow-sm"
              value={fechaDesde}
              onChange={(e) => { setFechaDesde(e.target.value); setPaginaActual(0); }}
            />
            <span className="text-slate-400 text-xs mx-1">-</span>
            <input 
              type="date" 
              className="bg-white border border-slate-200 text-slate-600 text-xs font-medium rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 shadow-sm"
              value={fechaHasta}
              onChange={(e) => { setFechaHasta(e.target.value); setPaginaActual(0); }}
            />
            
            {(fechaDesde || fechaHasta || filtroEstado !== "TODOS") && (
              <button 
                onClick={() => { setFechaDesde(""); setFechaHasta(""); setFiltroEstado("TODOS"); setPaginaActual(0); }}
                className="ml-auto md:ml-2 text-xs text-red-500 hover:text-red-700 font-bold px-3 py-1.5 bg-red-50 rounded-lg transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

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
            ) : reportesPaginados.length === 0 ? ( 
              <tr><td colSpan="4" className="p-10 text-center text-slate-400">No se encontraron reportes.</td></tr>
            ) : reportesPaginados.map((rep) => (   
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
                    rep.estado === 'PENDIENTE' ? 'bg-amber-100 text-amber-700' : 
                    rep.estado === 'EN_REVISION' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {rep.estado}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button 
                    onClick={() => abrirModal(rep.id)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100"
                  >
                    {loadingDetalle && reporteSeleccionado?.id === rep.id ? <Loader2 size={18} className="animate-spin" /> : <Eye size={18} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Footer de Tabla: Solo Paginación */}
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

      {reporteSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-7xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            
            <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10 bg-white">
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
                <button 
                  onClick={() => setViendoImagenes(!viendoImagenes)}
                  className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm"
                >
                  <ImageIcon size={18} className="text-blue-500" /> 
                  {viendoImagenes ? "Volver a Detalles" : `Ver Evidencias (${reporteSeleccionado.evidencias?.length || 0})`}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {viendoImagenes ? (
                  <div className="animate-in fade-in duration-300">
                    {reporteSeleccionado.evidencias && reporteSeleccionado.evidencias.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {reporteSeleccionado.evidencias.map((img, idx) => (
                          <div key={idx} className="group relative rounded-3xl overflow-hidden shadow-md border-2 border-slate-100 aspect-video bg-slate-50">
                            <img src={img.urlCloudinary} alt="Evidencia" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            <a href={img.urlCloudinary} target="_blank" rel="noreferrer" className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-bold gap-2">
                              <Eye size={20} /> Pantalla Completa
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50">
                        <ImageIcon size={48} className="mb-2 opacity-30" />
                        <p className="font-bold">Sin fotos adjuntas</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="animate-in fade-in duration-300 space-y-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><Calendar size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Fecha</span></div>
                        <p className="font-bold text-slate-700">{reporteSeleccionado.fechaOcurrido}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><Clock size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Turno</span></div>
                        <p className="font-bold text-slate-700">{reporteSeleccionado.turno}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><MapPin size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Área / Lugar</span></div>
                        <p className="font-bold text-slate-700 truncate">{reporteSeleccionado.area}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-400 mb-1"><Shield size={14} /> <span className="text-[10px] font-bold uppercase tracking-wider">Clasificación</span></div>
                        <p className="font-bold text-blue-600 truncate">{reporteSeleccionado.tipoComportamientoNombre}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-3"><MessageSquare size={16} className="text-blue-500" /> Descripción</h4>
                        <div className="bg-blue-50/30 p-5 rounded-2xl border border-blue-100/50 text-slate-700 text-sm leading-relaxed h-[180px] overflow-y-auto custom-scrollbar">
                          "{reporteSeleccionado.descripcionComportamiento}"
                        </div>
                      </div>

                      {reporteSeleccionado.medidaContencion ? (
                        <div>
                          <h4 className="flex items-center gap-2 text-slate-800 font-black text-sm uppercase tracking-wider mb-3"><Shield size={16} className="text-green-500" /> Acción Inmediata</h4>
                          <div className="bg-green-50/30 p-5 rounded-2xl border border-green-100/50 text-slate-700 text-sm leading-relaxed h-[180px] overflow-y-auto custom-scrollbar">
                            {reporteSeleccionado.medidaContencion}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center bg-slate-50 border border-slate-100 rounded-2xl h-full text-sm font-bold text-slate-400">
                          Sin medidas inmediatas reportadas.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full md:w-[420px] bg-slate-900 flex flex-col z-20 border-l border-slate-800 shadow-xl">
              <div className="p-4 flex justify-between items-center border-b border-slate-800">
                <span className="text-xs font-bold text-slate-400 tracking-widest uppercase ml-2 flex items-center gap-2">
                  <Clock size={14} /> Seguimiento
                </span>
                <button onClick={cerrarModal} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-red-500 p-2 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {reporteSeleccionado.historial && reporteSeleccionado.historial.length > 0 ? (
                  <div className="space-y-5 pl-2 border-l border-slate-700 ml-2">
                    {reporteSeleccionado.historial.map((hito, idx) => (
                      <div key={idx} className="relative pl-5">
                        <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[5.5px] top-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                          {hito.estadoAnterior} <span className="text-slate-600 mx-1">➔</span> <span className="text-blue-400">{hito.estadoNuevo}</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mb-2 mt-0.5">
                          {new Date(hito.fechaCambio).toLocaleString()} — {hito.usuarioModificador || "Sistema"}
                        </p>
                        {hito.comentario && (
                          <div className="bg-slate-800/80 p-3 rounded-xl text-xs text-slate-300 border border-slate-700/50 italic">
                            "{hito.comentario}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 text-sm italic text-center mt-10">Reporte recién ingresado. Sin movimientos.</p>
                )}
              </div>

              <div className="p-6 bg-slate-950 border-t border-slate-800 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Actualizar Estado</span>
                  {!estadoCambiado && (
                    <span className="text-[10px] text-amber-500/80 font-bold tracking-wide animate-pulse">
                      * Elige un estado distinto
                    </span>
                  )}
                </div>

                <div className="flex bg-slate-900 p-1 rounded-xl w-full border border-slate-800">
                  {['PENDIENTE', 'EN_REVISION', 'SOLUCIONADO'].map((est) => (
                    <button
                      key={est}
                      onClick={() => setNuevoEstado(est)}
                      className={`flex-1 py-2 rounded-lg text-[10px] font-black transition-all ${
                        nuevoEstado === est 
                          ? (est === 'PENDIENTE' ? 'bg-amber-500 text-white' : est === 'EN_REVISION' ? 'bg-blue-600 text-white' : 'bg-green-500 text-white')
                          : 'text-slate-500 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {est.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  <textarea 
                    rows="2"
                    placeholder={estadoCambiado ? "Agrega un comentario obligatorio..." : "Cambia el estado para comentar."}
                    disabled={!estadoCambiado}
                    className="w-full bg-slate-900 text-sm text-white border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed resize-none custom-scrollbar"
                    value={comentario}
                    onChange={(e) => setComentario(e.target.value)}
                  ></textarea>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {["Revisado/Derivado", "Falta evidencia", "Solucionado"].map((resp, i) => (
                      <button
                        key={i}
                        onClick={() => setComentario(prev => prev ? `${prev} ${resp}` : resp)}
                        disabled={!estadoCambiado}
                        className="text-[10px] font-bold bg-slate-800 text-slate-400 px-2 py-1 rounded-md hover:bg-slate-700 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        + {resp}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleGuardarCambios}
                  disabled={isUpdating || !comentarioValido || !estadoCambiado}
                  className={`w-full py-3 rounded-xl font-black transition-all text-sm uppercase tracking-wider mt-2 ${
                    !comentarioValido || !estadoCambiado
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]'
                  }`}
                >
                  {isUpdating ? "Guardando..." : "Confirmar Actualización"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}