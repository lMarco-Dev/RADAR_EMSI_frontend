import { useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";

export default function Paso4Evidencia({ evidencias, onEvidenciasChange }) {
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);

    if (evidencias.length + files.length > 3) {
      alert("Máximo 3 fotos permitidas");
      return;
    }

    setIsCompressing(true);

    // Configuración de compresión: Máximo 1MB y 1920px de resolución
    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedEvidencias = await Promise.all(
        files.map(async (file) => {
          try {
            const compressedFile = await imageCompression(file, options);
            return {
              url: URL.createObjectURL(compressedFile),
              file: compressedFile, // Guardamos la versión ligera
            };
          } catch (err) {
            console.error("Error al comprimir, usando original:", err);
            return { url: URL.createObjectURL(file), file: file };
          }
        })
      );

      onEvidenciasChange([...evidencias, ...compressedEvidencias]);
    } catch (error) {
      console.error("Error general en el proceso de imágenes", error);
    } finally {
      setIsCompressing(false);
      e.target.value = ""; // Limpiar input
    }
  };

  const removeEvidencia = (index) => {
    onEvidenciasChange(evidencias.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold text-gray-700">
        Adjunta hasta 3 fotos como evidencia (Opcional)
      </p>

      {evidencias.length < 3 && (
        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-8 transition-colors ${isCompressing ? "border-blue-300 bg-blue-50 cursor-wait" : "border-gray-300 hover:border-red-400 hover:bg-slate-50 cursor-pointer"}`}>
          <div className="flex flex-col items-center gap-2 text-slate-500">
            {isCompressing ? (
              <>
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                <span className="text-sm font-medium text-blue-600">Optimizando imagen...</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-sm font-medium">Toca para tomar foto o seleccionar</span>
                <span className="text-xs text-slate-400">JPG, PNG, WEBP</span>
              </>
            )}
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
            capture="environment"
            disabled={isCompressing}
          />
        </label>
      )}

      {evidencias.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          {evidencias.map((ev, i) => (
            <div key={i} className="relative group">
              <img src={ev.url} alt={`Evidencia ${i + 1}`} className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm" />
              <button
                type="button"
                onClick={() => removeEvidencia(i)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}