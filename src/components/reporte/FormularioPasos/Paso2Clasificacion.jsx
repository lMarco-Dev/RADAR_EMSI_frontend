import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";

export default function Paso2Clasificacion({ formData, onChange, tipos = [] }) {
  // Transformamos el listado del backend para que el SelectField lo entienda
  const opcionesTipos = Array.from(
    new Map(tipos.map((t) => [t.nombre, { value: t.id, label: t.nombre }])).values()
  );

  return (
    <div className="space-y-4">
      <SelectField
        label="Tipo de comportamiento"
        required
        options={opcionesTipos}
        value={formData.tipoComportamiento || ""}
        onChange={(e) => onChange("tipoComportamiento", e.target.value)}
      />

      <InputField
        label="Área donde ocurrió"
        required
        placeholder="Ej: Almacén, Producción, SS.HH..."
        value={formData.area || ""}
        onChange={(e) => onChange("area", e.target.value)}
      />

      <InputField
        label="Lugar específico (Opcional)"
        placeholder="Ej: Pasillo 3, cerca de la máquina #5"
        value={formData.lugarEspecifico || ""}
        onChange={(e) => onChange("lugarEspecifico", e.target.value)}
      />
    </div>
  );
}