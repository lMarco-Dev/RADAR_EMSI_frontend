import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, Legend
} from "recharts";
import { Activity, Clock, ShieldAlert, CheckCircle, Info, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para los nuevos filtros y paginación
  const [filtroEmpresa, setFiltroEmpresa] = useState("Todos");
  const [verTodasEmpresas, setVerTodasEmpresas] = useState(false);
  const [paginaEmpresas, setPaginaEmpresas] = useState(0);

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        const url = filtroEmpresa === "Todos" 
          ? "/reportes/estadisticas" 
          : `/reportes/estadisticas?empresa=${encodeURIComponent(filtroEmpresa)}`;

        const res = await axiosInstance.get(url);
        setData(res.data.data);
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
        <p className="font-bold animate-pulse">Sincronizando métricas en tiempo real...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500">Error al conectar con el servidor.</div>;

  const { contadores, porArea, porEmpresa, porTipo, tendencia } = data;
  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#22c55e'];

  // --- LÓGICA DE ÁREAS (Top 3 general o Top 5 por empresa) ---
  const areasAMostrar = filtroEmpresa === "Todos" ? porArea.slice(0, 3) : porArea.slice(0, 5);

  // --- LÓGICA DE EMPRESAS (Top 5 o Paginación de a 10) ---
  const limiteEmpresas = verTodasEmpresas ? 10 : 5;
  const totalPaginasEmpresas = Math.ceil(porEmpresa.length / limiteEmpresas);
  const empresasAMostrar = porEmpresa.slice(
    paginaEmpresas * limiteEmpresas, 
    (paginaEmpresas + 1) * limiteEmpresas
  );

  return (
    <div className="p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel Gerencial SST</h1>
        <p className="text-slate-500 mt-1">Análisis estratégico basado en datos reales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Tarjeta color="bg-slate-800" icon={<Activity />} titulo="Total Histórico" valor={contadores.total} />
        <Tarjeta color="bg-amber-500" icon={<Clock />} titulo="Pendientes" valor={contadores.pendientes} />
        <Tarjeta color="bg-blue-500" icon={<ShieldAlert />} titulo="En Revisión" valor={contadores.enRevision} />
        <Tarjeta color="bg-green-500" icon={<CheckCircle />} titulo="Solucionados" valor={contadores.solucionados} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico 1: Zonas Calientes con Filtro */}
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
                <option key={i} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          }
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={areasAMostrar} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={90} />
              <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Bar dataKey="cantidad" fill="#ef4444" radius={[0, 4, 4, 0]} barSize={20} />
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
                className="text-[10px] font-bold uppercase text-blue-500 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
              >
                {verTodasEmpresas ? "Ver Top 5" : "Ver Todas"}
              </button>
            </div>
          }
        >
          <div className="flex flex-col h-full">
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={empresasAMostrar} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} width={110} />
                  <RechartsTooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                  <Bar dataKey="cantidad" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={verTodasEmpresas ? 12 : 20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Controles de Paginación (solo visibles si "Ver Todas" está activo y hay > 1 página) */}
            {verTodasEmpresas && totalPaginasEmpresas > 1 && (
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                <button 
                  disabled={paginaEmpresas === 0}
                  onClick={() => setPaginaEmpresas(p => p - 1)}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[10px] font-bold text-slate-400">Pág {paginaEmpresas + 1} de {totalPaginasEmpresas}</span>
                <button 
                  disabled={paginaEmpresas >= totalPaginasEmpresas - 1}
                  onClick={() => setPaginaEmpresas(p => p + 1)}
                  className="p-1 rounded-lg hover:bg-slate-100 disabled:opacity-30 text-slate-500"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </ChartCard>

        {/* Gráfico 3: Tipo de comportamiento */}
        <ChartCard titulo="Tipo de Comportamiento" info="Distribución según la clasificación del riesgo.">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={porTipo} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {porTipo.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Gráfico 4: Evolución */}
        <ChartCard titulo="Evolución de Incidentes" info="Tendencia de reportes detectados por mes.">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendencia}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="incidentes" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: "#3b82f6" }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

      </div>
    </div>
  );
}

function Tarjeta({ color, icon, titulo, valor }) {
  // ... (mismo código que antes)
  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md hover:-translate-y-1">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{titulo}</p>
        <p className="text-3xl font-black text-slate-800 leading-tight">{valor}</p>
      </div>
    </div>
  );
}

function ChartCard({ titulo, info, children, extraHeader }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold text-slate-700">{titulo}</h2>
        
        <div className="flex items-center gap-3">
          {extraHeader} {/* Renderiza el select o botón extra aquí */}
          <div className="relative group cursor-help">
            <Info size={16} className="text-slate-300 hover:text-blue-500 transition-colors" />
            <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 text-white text-[10px] p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none">
              {info}
              <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-800 transform rotate-45"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}