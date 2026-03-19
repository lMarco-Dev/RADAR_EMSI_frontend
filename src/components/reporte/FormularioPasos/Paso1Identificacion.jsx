import InputField from "../../ui/InputField";
import SelectField from "../../ui/SelectField";
import { useMemo } from "react";

const turnoOptions = [
  { value: "MANANA", label: "Mañana" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOCHE", label: "Noche" },
];

export default function Paso1Identificacion({
  formData,
  onChange,
  departamentos = [],
}) {
  const opcionesDepartamentos = useMemo(() => {
    return departamentos.map((dep) => ({
      value: dep,
      label: dep,
    }));
  }, [departamentos]);

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
    const regex = /^[a-zA-ZñÑáéíóúÁÉÍÓÚ\s]*$/;
    if (regex.test(value) || value === "") onChange("nombreReportante", value);
  };

  return (
    <div className="space-y-4">
      <SelectField
        label="Departamento / Área"
        required
        options={opcionesDepartamentos}
        value={formData.area || ""}
        onChange={(e) => onChange("area", e.target.value)}
      />
      <InputField
        label="Nombres y Apellidos"
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
