import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Lock,
  Radar,
  ShieldCheck,
  Loader2,
  Search,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
} from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import StepIndicator from "../../components/ui/StepIndicator";
import Button from "../../components/ui/Button";
import Paso1Identificacion from "../../components/reporte/FormularioPasos/Paso1Identificacion";
import Paso2Clasificacion from "../../components/reporte/FormularioPasos/Paso2Clasificacion";
import Paso3Detalle from "../../components/reporte/FormularioPasos/Paso3Detalle";
import Paso4Evidencia from "../../components/reporte/FormularioPasos/Paso4Evidencia";
import Paso5Confirmacion from "../../components/reporte/FormularioPasos/Paso5Confirmacion";
import Paso6Exito from "../../components/reporte/FormularioPasos/Paso6Exito";
import toast from "react-hot-toast";

const STEPS = [
  "Identificación",
  "Clasificación",
  "Detalle",
  "Evidencia",
  "Confirmar",
];

export default function FormularioReportePage() {
  const { token } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [evidencias, setEvidencias] = useState([]);

  const [empresa, setEmpresa] = useState(null);
  const [catalogos, setCatalogos] = useState({ tipos: [], causas: [] });
  const [areasSugeridas, setAreasSugeridas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);

  // Estados del Rastreador
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [folioSearch, setFolioSearch] = useState("");
  const [trackerLoading, setTrackerLoading] = useState(false);
  const [trackerResult, setTrackerResult] = useState(null);
  const [trackerError, setTrackerError] = useState("");

  const recargarAreas = async () => {
    try {
      const res = await axiosInstance.get(`/publico/empresa/${token}/areas`);
      setAreasSugeridas(res.data.data || []);
    } catch (error) {
      console.error("Error recargando áreas", error);
    }
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        if (token) {
          const resEmpresa = await axiosInstance.get(
            `/publico/empresa/${token}`,
          );
          setEmpresa(resEmpresa.data.data);
          recargarAreas();
        }
        const resCatalogos = await axiosInstance.get("/publico/catalogos");
        setCatalogos(resCatalogos.data.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, [token]);

  useEffect(() => {
    const progresoGuardado = localStorage.getItem(`radar_reporte_${token}`);
    if (progresoGuardado) {
      try {
        const { savedStep, savedFormData } = JSON.parse(progresoGuardado);
        if (savedStep && savedStep < 6) setStep(savedStep);
        if (savedFormData) setFormData(savedFormData);
      } catch (e) {
        console.error("Error leyendo autoguardado", e);
      }
    }
  }, [token]);

  useEffect(() => {
    if (step < 6 && Object.keys(formData).length > 0) {
      localStorage.setItem(
        `radar_reporte_${token}`,
        JSON.stringify({
          savedStep: step,
          savedFormData: formData,
        }),
      );
    }
  }, [step, formData, token]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedTipo = catalogos.tipos.find(
    (t) => t.id.toString() === formData.tipoComportamiento?.toString(),
  );
  const esReconocimiento =
    selectedTipo?.nombre?.toUpperCase() === "RECONOCIMIENTO";

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.fechaOcurrido && formData.turno && formData.area && formData.nombreReportante;
      case 2:
        return formData.tipoComportamiento;
      case 3:
        if (esReconocimiento)
          return formData.motivoReconocimiento && formData.descripcion;
        return (
          formData.causa && formData.descripcion && formData.medidaContencion
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isStepValid()) {
      setStep((p) => p + 1);
    } else {
      toast.error("Completa todos los campos obligatorios antes de continuar.");
    }
  };

  const handleBack = () => setStep((p) => p - 1);

  const handleReset = () => {
    setStep(1);
    setFormData({});
    setEvidencias([]);
    setTicketId(null);
    localStorage.removeItem(`radar_reporte_${token}`);
    recargarAreas();
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    const loadingToast = toast.loading("Enviando reporte...");

    try {
      const formPayload = new FormData();

      if (empresa?.id) formPayload.append("empresaId", empresa.id);
      if (formData.tipoComportamiento)
        formPayload.append("tipoComportamientoId", formData.tipoComportamiento);
      if (formData.causa) formPayload.append("causaId", formData.causa);

      formPayload.append(
        "descripcionComportamiento",
        formData.descripcion || "",
      );

      Object.keys(formData).forEach((key) => {
        if (
          formData[key] &&
          !["tipoComportamiento", "causa", "descripcion"].includes(key)
        ) {
          formPayload.append(key, formData[key]);
        }
      });

      formPayload.append(
        "camposDinamicos",
        JSON.stringify({
          motivoReconocimiento: formData.motivoReconocimiento,
        }),
      );

      evidencias.forEach((evidencia) => {
        if (evidencia.file) formPayload.append("evidencias", evidencia.file);
      });

      const response = await axiosInstance.post(
        "/publico/reportes",
        formPayload,
        {
          headers: {
            "X-Empresa-Token": token,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (response.data.success) {
        toast.success("Reporte enviado con éxito", { id: loadingToast });
        setTicketId(response.data.data.folio);
        setStep(6);
        localStorage.removeItem(`radar_reporte_${token}`);
      }
    } catch (error) {
      const errorReal =
        error.response?.data?.message ||
        "Error al enviar los datos. Revisa los campos.";
      toast.error(errorReal, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lógica del Rastreador
  const handleRastrear = async (e) => {
    e.preventDefault();
    if (!folioSearch.trim()) return;
    setTrackerLoading(true);
    setTrackerError("");
    setTrackerResult(null);
    try {
      const { data } = await axiosInstance.get(
        `/publico/reportes/rastrear/${folioSearch.trim()}`,
      );
      setTrackerResult(data.data);
    } catch (error) {
      setTrackerError(
        error.response?.data?.message ||
          "No se encontró ningún reporte con este folio.",
      );
    } finally {
      setTrackerLoading(false);
    }
  };

  const formatearFecha = (fecha) =>
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
        className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wider ${estilos[estado] || "bg-slate-100 text-slate-600"}`}
      >
        {estado?.replace("_", " ")}
      </span>
    );
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Paso1Identificacion
            formData={formData}
            onChange={handleChange}
            departamentos={areasSugeridas} // <-- Le pasamos los departamentos aquí
          />
        );
      case 2:
        return (
          <Paso2Clasificacion
            formData={formData}
            onChange={handleChange}
            tipos={catalogos.tipos || []} // <-- Le pasamos los Tipos de Comportamiento
          />
        );
      case 3:
        return (
          <Paso3Detalle
            formData={formData}
            onChange={handleChange}
            causas={catalogos.causas || []} // <-- Le pasamos las Causas
            esReconocimiento={esReconocimiento}
          />
        );
      case 4:
        return (
          <Paso4Evidencia
            evidencias={evidencias}
            onEvidenciasChange={setEvidencias}
          />
        );
      case 5:
        return (
          <Paso5Confirmacion formData={formData} evidencias={evidencias} />
        );
      case 6:
        return <Paso6Exito folio={ticketId} onReset={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
        {/* Sidebar de diseño */}
        <div className="md:w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-between relative text-center shadow-xl z-10">
          <div className="relative z-10 flex items-center gap-2 mt-2">
            <Radar className="w-8 h-8 text-red-500 animate-pulse" />
            <span className="text-white font-bold tracking-widest">RADAR</span>
          </div>
          <div className="relative z-10 flex flex-col items-center my-auto py-8">
            <div className="bg-white p-2 rounded-2xl shadow-lg mb-6 w-40 h-40 flex items-center justify-center overflow-hidden">
              <img
                src={empresa?.logoUrl || "/emsi_logo_sinfondo.png"}
                alt="Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
              Reporte de <br />
              <span className="text-red-500">Incidente</span>
            </h2>
            {empresa && (
              <p className="text-slate-300 mt-2 font-semibold">
                {empresa.nombre}
              </p>
            )}
          </div>

          <div className="w-full relative z-10 flex flex-col items-center gap-4">
            {/* NUEVO: Botón Rastreador */}
            <button
              onClick={() => setIsTrackerOpen(true)}
              className="w-full max-w-[200px] bg-white/10 hover:bg-white/20 text-white border border-white/20 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all"
            >
              <Search size={18} /> Rastrear mi Folio
            </button>

            <div className="flex items-center justify-center gap-2 text-slate-500 text-xs mt-4">
              <ShieldCheck className="w-4 h-4" />
              <span>© 2026 EMSI</span>
            </div>
            <div className="text-center">
              <Link
                to="/cliente/login"
                className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center justify-center gap-1 transition-colors"
              >
                <Lock size={12} /> Acceso Supervisores
              </Link>
            </div>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col p-6 md:p-12 h-screen overflow-y-auto">
          <div className="max-w-2xl w-full mx-auto">
            <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
              {step < 6 && <StepIndicator steps={STEPS} currentStep={step} />}
              <div className="min-h-[400px] mt-8">{renderStep()}</div>

              {step < 6 && (
                <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
                  {step > 1 && (
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      disabled={isSubmitting}
                    >
                      Atrás
                    </Button>
                  )}
                  <div className="ml-auto">
                    {step < 5 ? (
                      <Button
                        onClick={handleNext}
                        className={!isStepValid() ? "opacity-50" : ""}
                      >
                        Siguiente
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex items-center gap-2"
                      >
                        {isSubmitting && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DEL RASTREADOR PÚBLICO */}
      {isTrackerOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 animate-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                  <Search className="text-blue-600" /> Rastreador de Folio
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Consulta el estado de tu reporte de forma anónima.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsTrackerOpen(false);
                  setTrackerResult(null);
                  setTrackerError("");
                  setFolioSearch("");
                }}
                className="p-2 bg-slate-100 text-slate-500 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRastrear} className="flex gap-2 mb-6">
              <input
                type="text"
                placeholder="Ej: REP-A1B2C3D4"
                className="flex-1 bg-slate-50 border border-slate-200 p-3.5 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold uppercase"
                value={folioSearch}
                onChange={(e) => setFolioSearch(e.target.value.toUpperCase())}
                required
              />
              <Button
                type="submit"
                disabled={trackerLoading}
                className="px-6 rounded-xl"
              >
                {trackerLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Buscar"
                )}
              </Button>
            </form>

            {trackerError && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertCircle size={18} /> {trackerError}
              </div>
            )}

            {trackerResult && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Datos básicos públicos */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="col-span-2 flex justify-between items-center border-b border-slate-200 pb-3 mb-1">
                    <p className="font-black text-lg text-slate-800">
                      {trackerResult.folio}
                    </p>
                    {getEstadoBadge(trackerResult.estado)}
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Tipo
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {trackerResult.tipoComportamientoNombre}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      Fecha Registrado
                    </p>
                    <p className="font-semibold text-slate-700 text-sm">
                      {formatearFecha(trackerResult.createdAt)}
                    </p>
                  </div>
                </div>

                {/* Línea Temporal Pública */}
                <div>
                  <h3 className="text-md font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" /> Historial de
                    Seguimiento
                  </h3>
                  <div className="space-y-6 border-l-2 border-slate-100 ml-3 pl-6 relative">
                    {trackerResult.historial?.length > 0 ? (
                      trackerResult.historial.map((hist, idx) => (
                        <div key={idx} className="relative">
                          <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200 text-slate-400">
                            {hist.estadoNuevo === "SOLUCIONADO" ? (
                              <CheckCircle
                                size={16}
                                className="text-emerald-500"
                              />
                            ) : (
                              <AlertCircle
                                size={16}
                                className="text-blue-500"
                              />
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase">
                            {formatearFecha(hist.fechaCambio)}
                          </p>
                          <p className="font-bold text-slate-700 mt-0.5">
                            Estado: {hist.estadoNuevo.replace("_", " ")}
                          </p>
                          {hist.comentario && (
                            <p className="text-sm text-slate-600 bg-white border border-slate-100 p-3 rounded-xl mt-2 italic shadow-sm">
                              "{hist.comentario}"
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400 italic">
                        Tu reporte ha sido recibido y está pendiente de
                        revisión.
                      </p>
                    )}

                    {/* Evento inicial */}
                    <div className="relative">
                      <div className="absolute -left-[35px] bg-white p-1 rounded-full border-2 border-slate-200 text-slate-400">
                        <FileText size={16} />
                      </div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        {formatearFecha(trackerResult.createdAt)}
                      </p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        Reporte Registrado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
