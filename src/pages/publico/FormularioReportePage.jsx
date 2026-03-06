import { useState } from "react";
import { Loader2, Radar, ShieldCheck } from "lucide-react";
import StepIndicator from "../../components/ui/StepIndicator";
import Button from "../../components/ui/Button";
import Paso1Identificacion from "../../components/reporte/FormularioPasos/Paso1Identificacion";
import Paso2Clasificacion from "../../components/reporte/FormularioPasos/Paso2Clasificacion";
import Paso3Detalle from "../../components/reporte/FormularioPasos/Paso3Detalle";
import Paso4Evidencia from "../../components/reporte/FormularioPasos/Paso4Evidencia";
import Paso5Confirmacion from "../../components/reporte/FormularioPasos/Paso5Confirmacion";

const STEPS = [
  "Identificación",
  "Clasificación",
  "Detalle",
  "Evidencia",
  "Confirmar",
];

export default function FormularioReportePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [evidencias, setEvidencias] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //1. Manejo del estado general del formulario
  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  //2. Validaciones por paso
  const isStepValid = () => {
    switch (step) {
      case 1:
        return (
          formData.empresaId &&
          formData.departamentoId &&
          formData.fechaOcurrido &&
          formData.turno
        );
      case 2:
        return formData.tipoComportamiento && formData.area;
      case 3:
        if (formData.tipoComportamiento === "RECONOCIMIENTO") {
          return formData.motivoReconocimiento && formData.descripcion;
        }
        return (
          formData.causa && formData.descripcion && formData.medidaContencion
        );
      default:
        return true;
    }
  };

  //3. Navegación
  const handleNext = () => {
    if (isStepValid()) {
      setStep((p) => p + 1);
    } else {
      alert(
        "Por favor, completa todos los campos obligatorios antes de continuar.",
      );
    }
  };

  const handleBack = () => setStep((p) => p - 1);

  //4. Lógica de Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName = "dhfs8sqpe";
    const uploadPreset = "emsi_fotos";

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", uploadPreset);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: data,
      });

      const resData = await response.json();
      return resData.secure_url;
    } catch (error) {
      console.error("Error Cloudinary: ", error);
      return null;
    }
  };

  //5. Envío Final
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      let urlsImagenes = [];

      //Subir imagenes a Cloudinary si existen
      if (evidencias.length > 0) {
        const uploadPromises = evidencias.map((ev) =>
          uploadToCloudinary(ev.file),
        );
        urlsImagenes = await Promise.all(uploadPromises);
      }

      const reporteFinal = {
        ...formData,
        evidencias: urlsImagenes.filter((url) => url !== null),
        fechaRegistro: new Date().toISOString,
        estado: "PENDIENTE",
      };

      console.log("Reporte listo para enviar al servidor:", reporteFinal);

      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (error) {
      console.error("Error general de envío:", error);
      alert("Hubo un error al procesar el reporte.");
    } finally {
      setIsSubmitting(false);
    }
  };

  //6. Renderizado dinámico de los pasos
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <Paso1Identificacion formData={formData} onChange={handleChange} />
        );
      case 2:
        return (
          <Paso2Clasificacion formData={formData} onChange={handleChange} />
        );
      case 3:
        return <Paso3Detalle formData={formData} onChange={handleChange} />;
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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar con Logo EMSI */}
      <div className="md:w-1/3 bg-slate-900 p-8 flex flex-col items-center justify-between relative text-center shadow-xl z-10">
        <div className="relative z-10 flex items-center gap-2 mt-2">
          <Radar className="w-8 h-8 text-red-500 animate-pulse" />
          <span className="text-white font-bold tracking-widest">RADAR</span>
        </div>
        <div className="relative z-10 flex flex-col items-center my-auto py-8">
          <div className="bg-white p-2 rounded-2xl shadow-lg mb-6 w-40 h-40">
            <img
              src="/emsi_logo_sinfondo.png"
              alt="Logo EMSI"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-2 leading-tight">
            Reporte de <br />
            <span className="text-red-500">Incidente</span>
          </h2>
        </div>
        <div className="relative z-10 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4" />
          <span>© 2026 EMSI</span>
        </div>
      </div>

      {/* Contenido del Formulario */}
      <div className="md:w-2/3 flex flex-col p-6 md:p-12 h-screen overflow-y-auto">
        <div className="max-w-2xl w-full mx-auto">
          <div className="bg-white p-8 rounded-3xl shadow-md border border-gray-100">
            <StepIndicator steps={STEPS} currentStep={step} />
            <div className="min-h-[400px] mt-8">{renderStep()}</div>
            <div className="flex justify-between mt-10 pt-6 border-t border-gray-100">
              {step > 1 && (
                <Button variant="outline" onClick={handleBack}>
                  Atrás
                </Button>
              )}
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
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Enviando..." : "Enviar Reporte"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
