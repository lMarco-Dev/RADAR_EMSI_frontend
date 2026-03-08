import { CheckCircle } from "lucide-react";

export default function Paso6Exito({ folio, onReset }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 space-y-6 animate-in fade-in zoom-in duration-500">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 shadow-inner">
        <CheckCircle size={56} />
      </div>
      <h2 className="text-3xl font-extrabold text-slate-800">¡Reporte Enviado!</h2>
      <p className="text-slate-600 max-w-md">Tu información ha sido registrada exitosamente.</p>
      
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 w-full max-w-sm mt-4">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Ticket de Seguimiento</p>
        <p className="text-2xl font-black text-slate-800">{folio}</p>
      </div>

      <button onClick={onReset} className="mt-8 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200 w-full max-w-sm">
        Registrar Nuevo Reporte
      </button>
    </div>
  );
}