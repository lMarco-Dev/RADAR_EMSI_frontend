import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
  LabelList,
} from "recharts";
import {
  Activity,
  Clock,
  ShieldAlert,
  CheckCircle,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";

import toast from "react-hot-toast";

// Función utilitaria para arreglar caracteres HTML como "Almac&eacute;n" -> "Almacén"
const decodificarHTML = (html) => {
  if (!html) return "";
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para los filtros y paginación
  const [filtroEmpresa, setFiltroEmpresa] = useState("Todos");
  const [verTodasEmpresas, setVerTodasEmpresas] = useState(false);
  const [paginaEmpresas, setPaginaEmpresas] = useState(0);

  const handleExportarExcel = async () => {
    const loadingToast = toast.loading("Generando Excel corporativo...");

    try {
      const url =
        filtroEmpresa === "Todos"
          ? "/reportes/exportar/excel"
          : `/reportes/exportar/excel?empresaNombre=${encodeURIComponent(filtroEmpresa)}`;

      const response = await axiosInstance.get(url, { responseType: "blob" });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `Reportes_SST_${filtroEmpresa === "Todos" ? "General" : filtroEmpresa}.xlsx`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      toast.success("Excel descargado correctamente", { id: loadingToast });
    } catch (error) {
      console.error("Error al exportar:", error);
      toast.error("Error al generar el Excel", { id: loadingToast });
    }
  };

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const url =
          filtroEmpresa === "Todos"
            ? "/reportes/estadisticas"
            : `/reportes/estadisticas?empresa=${encodeURIComponent(filtroEmpresa)}`;

        const res = await axiosInstance.get(url);

        // --- NUEVA LÓGICA: Agrupar la tendencia por mes y estado ---
        const tendenciaAgrupada = res.data.data.tendencia.reduce(
          (acc, curr) => {
            let mesExistente = acc.find((item) => item.mes === curr.mes);

            if (!mesExistente) {
              mesExistente = {
                mes: curr.mes,
                PENDIENTE: 0,
                EN_REVISION: 0,
                SOLUCIONADO: 0,
              };
              acc.push(mesExistente);
            }

            mesExistente[curr.estado] += curr.cantidad;
            return acc;
          },
          [],
        );

        const dataLimpia = {
          ...res.data.data,
          porArea: res.data.data.porArea.map((item) => ({
            ...item,
            name: decodificarHTML(item.name),
          })),
          porEmpresa: res.data.data.porEmpresa.map((item) => ({
            ...item,
            name: decodificarHTML(item.name),
          })),
          porTipo: res.data.data.porTipo.map((item) => ({
            ...item,
            name: decodificarHTML(item.name),
          })),
          tendencia: tendenciaAgrupada, // Usamos la tendencia procesada
        };

        setData(dataLimpia);
      } catch (error) {
        console.error("Error al cargar dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDashboard();
  }, [filtroEmpresa]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400 bg-slate-50">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="font-bold animate-pulse">
          Sincronizando métricas en tiempo real...
        </p>
      </div>
    );
  }

  if (!data)
    return (
      <div className="p-8 text-red-500">Error al conectar con el servidor.</div>
    );

  const { contadores, porArea, porEmpresa, porTipo, tendencia } = data;
  const COLORS = [
    "#ef4444",
    "#f97316",
    "#3b82f6",
    "#8b5cf6",
    "#22c55e",
    "#ec4899",
    "#06b6d4",
  ];

  // --- LÓGICA DE ÁREAS Y EMPRESAS ---
  const areasAMostrar =
    filtroEmpresa === "Todos" ? porArea.slice(0, 3) : porArea.slice(0, 5);

  const limiteEmpresas = verTodasEmpresas ? 10 : 5;
  const totalPaginasEmpresas = Math.ceil(porEmpresa.length / limiteEmpresas);
  const empresasAMostrar = porEmpresa.slice(
    paginaEmpresas * limiteEmpresas,
    (paginaEmpresas + 1) * limiteEmpresas,
  );

  // Custom Tooltip para los gráficos (Look oscuro y profesional)
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs font-bold z-50">
          <p>{`${payload[0].payload.name}: ${payload[0].value} Reportes`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen font-sans text-slate-900">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Panel Gerencial SST
          </h1>
          <p className="text-slate-500 mt-1">
            Análisis estratégico basado en datos reales
          </p>
        </div>

        <button
          onClick={handleExportarExcel}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
        >
          <Download size={18} />
          Exportar a Excel
        </button>
      </div>

      {/* TARJETAS KPI */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Tarjeta
          color="bg-slate-800"
          icon={<Activity />}
          titulo="Total Histórico"
          valor={contadores.total}
        />
        <Tarjeta
          color="bg-amber-500"
          icon={<Clock />}
          titulo="Pendientes"
          valor={contadores.pendientes}
        />
        <Tarjeta
          color="bg-blue-500"
          icon={<ShieldAlert />}
          titulo="En Revisión"
          valor={contadores.enRevision}
        />
        <Tarjeta
          color="bg-green-500"
          icon={<CheckCircle />}
          titulo="Solucionados"
          valor={contadores.solucionados}
        />
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Gráfico 1: Zonas Calientes */}
        <ChartCard
          titulo="Zonas Calientes (Área)"
          info="Áreas con mayor acumulación de reportes. Top 3 general o Top 5 por empresa."
          extraHeader={
            <select
              value={filtroEmpresa}
              onChange={(e) => setFiltroEmpresa(e.target.value)}
              className="bg-slate-100 border-none text-xs font-bold text-slate-600 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-200 transition-colors"
            >
              <option value="Todos">Todas las Empresas</option>
              {porEmpresa.map((emp, i) => (
                <option key={i} value={emp.name}>
                  {emp.name}
                </option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={areasAMostrar}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#e2e8f0"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                width={120}
              />
              <RechartsTooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc" }}
              />

              <Bar dataKey="cantidad" radius={[0, 8, 8, 0]} barSize={24}>
                {areasAMostrar.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="cantidad"
                  position="right"
                  fill="#64748b"
                  fontSize={12}
                  fontWeight={900}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 2: Top Empresas con Paginación */}
        <ChartCard
          titulo="Empresas con más Reportes"
          info="Clientes que generan mayor volumen de incidencias."
          extraHeader={
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setVerTodasEmpresas(!verTodasEmpresas);
                  setPaginaEmpresas(0);
                }}
                className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                {verTodasEmpresas ? "Ver Top 5" : "Ver Todas"}
              </button>
            </div>
          }
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={empresasAMostrar}
                  layout="vertical"
                  margin={{ top: 5, right: 40, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                    width={120}
                  />
                  <RechartsTooltip
                    content={<CustomTooltip />}
                    cursor={{ fill: "#f8fafc" }}
                  />

                  <Bar
                    dataKey="cantidad"
                    fill="#8b5cf6"
                    radius={[0, 8, 8, 0]}
                    barSize={verTodasEmpresas ? 14 : 24}
                  >
                    <LabelList
                      dataKey="cantidad"
                      position="right"
                      fill="#64748b"
                      fontSize={12}
                      fontWeight={900}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Controles de Paginación */}
            {verTodasEmpresas && totalPaginasEmpresas > 1 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                <button
                  disabled={paginaEmpresas === 0}
                  onClick={() => setPaginaEmpresas((p) => p - 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-md border border-slate-100">
                  Pág {paginaEmpresas + 1} de {totalPaginasEmpresas}
                </span>
                <button
                  disabled={paginaEmpresas >= totalPaginasEmpresas - 1}
                  onClick={() => setPaginaEmpresas((p) => p + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500 transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Gráfico 3: Tipo de comportamiento */}
        <ChartCard
          titulo="Tipo de Comportamiento"
          info="Distribución según la clasificación del riesgo."
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={porTipo}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {porTipo.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <RechartsTooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "20px",
                  fontWeight: "500",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 4: Evolución */}
        <ChartCard
          titulo="Evolución de Incidentes"
          info="Tendencia mensual de reportes separados por su estado actual."
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={tendencia}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 600 }}
              />

              <RechartsTooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              />

              <Legend
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "10px",
                  fontWeight: "600",
                }}
              />

              {/* LÍNEA 1: PENDIENTES (Ámbar) */}
              <Line
                type="monotone"
                dataKey="PENDIENTE"
                name="Pendientes"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#f59e0b" }}
                activeDot={{
                  r: 6,
                  fill: "#f59e0b",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />

              {/* LÍNEA 2: EN REVISIÓN (Azul) */}
              <Line
                type="monotone"
                dataKey="EN_REVISION"
                name="En Revisión"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#3b82f6" }}
                activeDot={{
                  r: 6,
                  fill: "#3b82f6",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />

              {/* LÍNEA 3: SOLUCIONADOS (Verde) */}
              <Line
                type="monotone"
                dataKey="SOLUCIONADO"
                name="Solucionados"
                stroke="#10b981"
                strokeWidth={4}
                dot={{ r: 5, strokeWidth: 2, fill: "#fff", stroke: "#10b981" }}
                activeDot={{
                  r: 8,
                  fill: "#10b981",
                  stroke: "#fff",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES SECUNDARIOS
// ==========================================

function Tarjeta({ color, icon, titulo, valor }) {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-5 transition-all hover:shadow-md hover:-translate-y-1">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {titulo}
        </p>
        <p className="text-3xl font-black text-slate-800 leading-tight">
          {valor}
        </p>
      </div>
    </div>
  );
}

function ChartCard({ titulo, info, children, extraHeader }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-80">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-md font-bold text-slate-800">{titulo}</h2>

        <div className="flex items-center gap-3">
          {extraHeader}
          <div className="relative group cursor-help">
            <Info
              size={18}
              className="text-slate-300 hover:text-blue-500 transition-colors"
            />
            <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 text-white text-[11px] p-3.5 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none font-medium leading-relaxed">
              {info}
              <div className="absolute -top-1.5 right-2 w-3 h-3 bg-slate-800 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">{children}</div>
    </div>
  );
}
