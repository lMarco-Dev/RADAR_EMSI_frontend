import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";
import { useMemo } from "react";

const departamentosFalsos = [
  { value: "dep_1", label: "Operaciones" },
  { value: "dep_2", label: "SSOMA" },
];

const turnoOptions = [
  { value: "MANANA", label: "Mañana" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOCHE", label: "Noche" },
];

export default function Paso1Identificacion({ formData, onChange }) {
  const { maxDate, minDate } = useMemo(() => {
    const today = new Date();
    const localToday = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000,
    );
    const max = localToday.toISOString().split("T")[0];
    const min = new Date(localToday.getTime() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    return { maxDate: max, minDate: min };
  }, []);

  const handleNameChange = (e) => {
    const value = e.target.value;
    const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/; // Solo letras y espacios
    if (regex.test(value) || value === "") onChange("nombreReportante", value);
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Departamento"
        required
        options={departamentosFalsos}
        value={formData.departamentoId || ""}
        onChange={(e) => onChange("departamentoId", e.target.value)}
      />
      <InputField
        label="Nombres y Apellidos (Opcional)"
        placeholder="Ej: Juan Pérez"
        value={formData.nombreReportante || ""}
        onChange={handleNameChange}
      />
      <InputField
        label="Fecha"
        type="date"
        required
        value={formData.fechaOcurrido || ""}
        onChange={(e) => onChange("fechaOcurrido", e.target.value)}
        max={maxDate}
        min={minDate}
        onKeyDown={(e) => e.preventDefault()}
      />
      <SelectField
        label="Turno"
        required
        options={turnoOptions}
        value={formData.turno || ""}
        onChange={(e) => onChange("turno", e.target.value)}
      />
    </div>
  );
}