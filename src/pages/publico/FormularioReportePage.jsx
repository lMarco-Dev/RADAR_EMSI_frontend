import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import { Radar, ShieldCheck, Loader2 } from "lucide-react"; 
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

const STEPS = ["Identificación", "Clasificación", "Detalle", "Evidencia", "Confirmar"];

export default function FormularioReportePage() {
  const { token } = useParams();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [evidencias, setEvidencias] = useState([]);
  
  const [empresa, setEmpresa] = useState(null);
  const [catalogos, setCatalogos] = useState({ tipos: [], causas: [] });
  const [areasSugeridas, setAreasSugeridas] = useState([]); // NUEVO: Estado para áreas
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketId, setTicketId] = useState(null);

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
          const resEmpresa = await axiosInstance.get(`/publico/empresa/${token}`);
          setEmpresa(resEmpresa.data.data);
          recargarAreas(); 
        }
        const resCatalogos = await axiosInstance.get('/publico/catalogos');
        setCatalogos(resCatalogos.data.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    cargarDatos();
  }, [token]);

  // 2. Autoguardado: Recuperar
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

  // 3. Autoguardado: Guardar cambios
  useEffect(() => {
    if (step < 6 && Object.keys(formData).length > 0) {
      localStorage.setItem(`radar_reporte_${token}`, JSON.stringify({
        savedStep: step,
        savedFormData: formData
      }));
    }
  }, [step, formData, token]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const selectedTipo = catalogos.tipos.find((t) => t.id.toString() === formData.tipoComportamiento?.toString());
  const esReconocimiento = selectedTipo?.nombre?.toUpperCase() === "RECONOCIMIENTO";

  const isStepValid = () => {
    switch (step) {
      case 1: return formData.fechaOcurrido && formData.turno; 
      case 2: return formData.tipoComportamiento && formData.area;
      case 3:
        if (esReconocimiento) return formData.motivoReconocimiento && formData.descripcion;
        return formData.causa && formData.descripcion && formData.medidaContencion;
      default: return true; 
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

      if (formData.tipoComportamiento) formPayload.append("tipoComportamientoId", formData.tipoComportamiento);
      if (formData.causa) formPayload.append("causaId", formData.causa);
      
      formPayload.append("descripcionComportamiento", formData.descripcion || "");

      Object.keys(formData).forEach(key => {
        if (formData[key] && !['tipoComportamiento', 'causa', 'descripcion'].includes(key)) {
          formPayload.append(key, formData[key]);
        }
      });

      formPayload.append("camposDinamicos", JSON.stringify({
        motivoReconocimiento: formData.motivoReconocimiento
      }));

      evidencias.forEach((evidencia) => {
        if (evidencia.file) formPayload.append("evidencias", evidencia.file);
      });

      const response = await axiosInstance.post('/publico/reportes', formPayload, {
        headers: { 'X-Empresa-Token': token, 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        toast.success("Reporte enviado con éxito", { id: loadingToast });
        setTicketId(response.data.data.folio);
        setStep(6);
        localStorage.removeItem(`radar_reporte_${token}`);
      }
    } catch (error) {
      console.error("Detalle del error 400:", error.response?.data);
      const errorReal = error.response?.data?.message || "Error al enviar los datos. Revisa los campos.";
      toast.error(errorReal, { id: loadingToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: return <Paso1Identificacion formData={formData} onChange={handleChange} />;
      // NUEVO: Pasamos las areasSugeridas como prop al Paso 2
      case 2: return <Paso2Clasificacion formData={formData} onChange={handleChange} tipos={catalogos.tipos} areasSugeridas={areasSugeridas} />;
      case 3: return <Paso3Detalle formData={formData} onChange={handleChange} causas={catalogos.causas} esReconocimiento={esReconocimiento} />;
      case 4: return <Paso4Evidencia evidencias={evidencias} onEvidenciasChange={setEvidencias} />;
      case 5: return <Paso5Confirmacion formData={formData} evidencias={evidencias} />;
      case 6: return <Paso6Exito folio={ticketId} onReset={handleReset} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar de diseño */}
      <div className="md:w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-between relative text-center shadow-xl z-10">
        <div className="relative z-10 flex items-center gap-2 mt-2">
          <Radar className="w-8 h-8 text-red-500 animate-pulse" />
          <span className="text-white font-bold tracking-widest">RADAR</span>
        </div>
        <div className="relative z-10 flex flex-col items-center my-auto py-8">
          <div className="bg-white p-2 rounded-2xl shadow-lg mb-6 w-40 h-40 flex items-center justify-center overflow-hidden">
            <img src={empresa?.logoUrl || "/emsi_logo_sinfondo.png"} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
            Reporte de <br /><span className="text-red-500">Incidente</span>
          </h2>
          {empresa && <p className="text-slate-300 mt-2 font-semibold">{empresa.nombre}</p>}
        </div>
        <div className="relative z-10 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4" /><span>© 2026 EMSI</span>
        </div>
        <div className="mt-8 text-center">
          <Link to="/cliente/login" className="text-[10px] text-slate-400 hover:text-blue-500 flex items-center justify-center gap-1 transition-colors">
            <Lock size={12} /> Acceso Supervisores
          </Link>
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
                  <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
                    Atrás
                  </Button>
                )}
                <div className="ml-auto">
                  {step < 5 ? (
                    <Button onClick={handleNext} className={!isStepValid() ? "opacity-50" : ""}>
                      Siguiente
                    </Button>
                  ) : (
                    <Button 
                      variant="success" 
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="flex items-center gap-2"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
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
  );
}