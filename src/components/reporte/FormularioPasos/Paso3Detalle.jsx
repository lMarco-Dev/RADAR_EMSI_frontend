import SelectField from "../../ui/SelectField";
import TextAreaField from "../../ui/TextAreaField";

const motivosPosi = [
  { value: "USO_EPP", label: "Uso correcto de EPP" },
  { value: "CUMPLIMIENTO", label: "Cumplimiento de estándares" },
  { value: "PROACTIVIDAD", label: "Proactividad en seguridad" },
  { value: "AYUDA", label: "Ayuda a un compañero" },
];

export default function Paso3Detalle({ formData, onChange, causas = [], esReconocimiento }) {
  // Transformamos las causas de la BD al formato del SelectField
  const opcionesCausas = Array.from(
    new Map(causas.map((c) => [c.nombre, { value: c.id, label: c.nombre }])).values()
  );

  return (
    <div className="space-y-4">
      {esReconocimiento ? (
        <>
          <SelectField
            label="Motivo del Reconocimiento"
            required
            options={motivosPosi}
            value={formData.motivoReconocimiento || ""}
            onChange={(e) => onChange("motivoReconocimiento", e.target.value)}
          />
          <TextAreaField
            label="Descripción del reconocimiento"
            required
            rows={4}
            placeholder="Describe la acción positiva observada..."
            value={formData.descripcion || ""}
            onChange={(e) => onChange("descripcion", e.target.value)}
          />
        </>
      ) : (
        <>
          <SelectField
            label="Causa raíz (Aparente)"
            required
            options={opcionesCausas}
            value={formData.causa || ""}
            onChange={(e) => onChange("causa", e.target.value)}
          />
          <TextAreaField
            label="Descripción detallada"
            required
            rows={4}
            placeholder="Describe detalladamente lo ocurrido..."
            value={formData.descripcion || ""}
            onChange={(e) => onChange("descripcion", e.target.value)}
          />
          <TextAreaField
            label="Medida de contención inmediata"
            required
            rows={3}
            placeholder="¿Qué acción inmediata se tomó para evitar que empeore?"
            value={formData.medidaContencion || ""}
            onChange={(e) => onChange("medidaContencion", e.target.value)}
          />
        </>
      )}
    </div>
  );
}