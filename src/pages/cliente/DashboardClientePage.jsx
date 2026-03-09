import { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import { useAuthStore } from "../../store/authStore";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, LineChart, Line, Legend
} from "recharts";
import { Activity, Clock, ShieldAlert, CheckCircle, Info, Loader2 } from "lucide-react";

export default function DashboardClientePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Obtenemos el usuario del estado global
  const { user } = useAuthStore();
  const nombreEmpresa = user?.empresaNombre || "";

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        // Pide automáticamente solo los datos de su empresa
        const res = await axiosInstance.get("/reportes/estadisticas", {
          params: { empresa: nombreEmpresa }
        });
        setData(res.data.data);
      } catch (error) {
        console.error("Error al cargar dashboard del cliente", error);
      } finally {
        setLoading(false);
      }
    };
    if (nombreEmpresa) cargarDashboard();
  }, [nombreEmpresa]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-slate-400 bg-slate-50">
        <Loader2 className="animate-spin mb-4 text-blue-500" size={48} />
        <p className="font-bold animate-pulse">Cargando métricas de {nombreEmpresa}...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500">Error al conectar con el servidor.</div>;

  const { contadores, porArea, porTipo, tendencia } = data;
  const COLORS = ['#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#22c55e'];

  // Mostramos el top 5 de áreas de SU empresa
  const areasAMostrar = porArea.slice(0, 5);

  return (
    <div className="p-8 animate-in fade-in duration-500 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Panel de Seguridad SST</h1>
        <p className="text-slate-500 mt-1">Métricas exclusivas para <span className="font-bold text-slate-700">{nombreEmpresa}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Tarjeta color="bg-slate-800" icon={<Activity />} titulo="Total Histórico" valor={contadores.total} />
        <Tarjeta color="bg-amber-500" icon={<Clock />} titulo="Pendientes" valor={contadores.pendientes} />
        <Tarjeta color="bg-blue-500" icon={<ShieldAlert />} titulo="En Revisión" valor={contadores.enRevision} />
        <Tarjeta color="bg-green-500" icon={<CheckCircle />} titulo="Solucionados" valor={contadores.solucionados} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico 1: Zonas Calientes */}
        <ChartCard 
          titulo="Zonas Calientes (Área)" 
          info="Las 5 áreas con mayor acumulación de reportes en sus instalaciones."
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

        {/* Gráfico 2: Tipo de comportamiento */}
        <ChartCard titulo="Tipo de Comportamiento" info="Distribución según la clasificación del riesgo en sus reportes.">
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

        {/* Gráfico 3: Evolución (Ocupa el ancho completo abajo) */}
        <div className="lg:col-span-2">
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
    </div>
  );
}

function Tarjeta({ color, icon, titulo, valor }) {
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

function ChartCard({ titulo, info, children }) {
  return (
    <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-md font-bold text-slate-700">{titulo}</h2>
        <div className="relative group cursor-help">
          <Info size={16} className="text-slate-300 hover:text-blue-500 transition-colors" />
          <div className="absolute right-0 top-full mt-2 w-56 bg-slate-800 text-white text-[10px] p-3 rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 shadow-xl pointer-events-none">
            {info}
            <div className="absolute -top-1 right-2 w-2 h-2 bg-slate-800 transform rotate-45"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}