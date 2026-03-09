import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";

export default function Paso2Clasificacion({ formData, onChange, tipos = [], areasSugeridas = [] }) {
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

      <div className="flex flex-col">
        <InputField
          label="Área donde ocurrió"
          required
          list="areas-sugeridas-list"
          placeholder="Ej: Almacén, Producción, SS.HH..."
          value={formData.area || ""}
          onChange={(e) => onChange("area", e.target.value)}
        />
        {/* Datalist dinámico con las áreas únicas de la empresa */}
        <datalist id="areas-sugeridas-list">
          {areasSugeridas.map((area, index) => (
            <option key={index} value={area} />
          ))}
        </datalist>
        <p className="text-[10px] text-slate-400 italic mt-1 ml-1">
          Tip: Al escribir, selecciona un área sugerida si ya existe.
        </p>
      </div>

      <InputField
        label="Lugar específico (Opcional)"
        placeholder="Ej: Pasillo 3, cerca de la máquina #5"
        value={formData.lugarEspecifico || ""}
        onChange={(e) => onChange("lugarEspecifico", e.target.value)}
      />
    </div>
  );
}