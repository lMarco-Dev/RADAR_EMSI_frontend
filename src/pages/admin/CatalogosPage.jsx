import { useState, useEffect } from "react";
import { catalogoApi } from "../../api/catalogoApi";
import {
  Settings2,
  Plus,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CatalogosPage() {
  // 1. Estados de la interfaz
  const [activeTab, setActiveTab] = useState("causas"); // "causas" o "tipos"
  const [loading, setLoading] = useState(true);

  // 2. Estados de datos
  const [causas, setCausas] = useState([]);
  const [tipos, setTipos] = useState([]);

  // 3. Estados de modales
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemAEliminar, setItemAEliminar] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "", // Solo se usa en Tipos
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    cargarCatalogos();
  }, []);

  const cargarCatalogos = async () => {
    setLoading(true);
    try {
      const [resCausas, resTipos] = await Promise.all([
        catalogoApi.getCausas(),
        catalogoApi.getTipos(),
      ]);
      setCausas(resCausas.data.data);
      setTipos(resTipos.data.data);
    } catch (error) {
      toast.error("Error al cargar los catálogos");
    } finally {
      setLoading(false);
    }
  };

  // Preparar el modal para crear o editar
  const abrirModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setFormData({
        nombre: item.nombre,
        descripcion: item.descripcion || "",
      });
    } else {
      setEditingId(null);
      setFormData({ nombre: "", descripcion: "" });
    }
    setIsModalOpen(true);
  };

  const cerrarModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ nombre: "", descripcion: "" });
  };

  // Función Mágica: Guarda Causas o Tipos dependiendo de la pestaña activa
  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return toast.error("El nombre es obligatorio");

    const loadingToast = toast.loading("Guardando...");
    try {
      if (activeTab === "causas") {
        if (editingId)
          await catalogoApi.actualizarCausa(editingId, {
            nombre: formData.nombre,
          });
        else await catalogoApi.crearCausa({ nombre: formData.nombre });
      } else {
        if (editingId) await catalogoApi.actualizarTipo(editingId, formData);
        else await catalogoApi.crearTipo(formData);
      }

      toast.success("Guardado correctamente", { id: loadingToast });
      cerrarModal();
      cargarCatalogos(); // Recargamos la tabla
    } catch (error) {
      const msj = error.response?.data?.message || "Error al guardar";
      toast.error(msj, { id: loadingToast });
    }
  };

  // Función para desactivar (Soft Delete)
  const handleEliminar = async () => {
    const loadingToast = toast.loading("Eliminando...");
    try {
      if (activeTab === "causas")
        await catalogoApi.eliminarCausa(itemAEliminar.id);
      else await catalogoApi.eliminarTipo(itemAEliminar.id);

      toast.success("Eliminado correctamente", { id: loadingToast });
      setItemAEliminar(null);
      cargarCatalogos();
    } catch (error) {
      toast.error("Error al eliminar", { id: loadingToast });
    }
  };

  // Datos actuales a mostrar en la tabla según la pestaña
  const datosTabla = activeTab === "causas" ? causas : tipos;

  return (
    <div className="p-8 max-w-5xl mx-auto bg-slate-50 min-h-screen font-sans text-slate-900">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-3">
            <Settings2 className="text-blue-600" size={32} />
            Catálogos Maestros
          </h1>
          <p className="text-slate-500 mt-1">
            Configura las opciones de los formularios de reporte
          </p>
        </div>
        <button
          onClick={() => abrirModal()}
          className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-slate-800 flex items-center gap-2 shadow-lg transition-all active:scale-95"
        >
          <Plus size={20} /> Nuevo Registro
        </button>
      </div>

      {/* Selector de Pestañas (Tabs) */}
      <div className="flex gap-2 mb-6 bg-white p-1 rounded-xl shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab("causas")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "causas"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Causas de Incidente
        </button>
        <button
          onClick={() => setActiveTab("tipos")}
          className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === "tipos"
              ? "bg-blue-50 text-blue-700"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Tipos de Comportamiento
        </button>
      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-widest border-b border-slate-100">
              <th className="p-5 font-bold w-16">ID</th>
              <th className="p-5 font-bold">Nombre</th>
              {activeTab === "tipos" && (
                <th className="p-5 font-bold">Descripción</th>
              )}
              <th className="p-5 font-bold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr>
                <td
                  colSpan="4"
                  className="p-10 text-center text-slate-400 animate-pulse"
                >
                  Cargando catálogos...
                </td>
              </tr>
            ) : datosTabla.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-10 text-center text-slate-400">
                  No hay registros activos
                </td>
              </tr>
            ) : (
              datosTabla.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  <td className="p-5 text-slate-400 font-medium">#{item.id}</td>
                  <td className="p-5 font-bold text-slate-800">
                    {item.nombre}
                  </td>
                  {activeTab === "tipos" && (
                    <td className="p-5 text-sm text-slate-500">
                      {item.descripcion || "-"}
                    </td>
                  )}
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => abrirModal(item)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setItemAEliminar(item)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal: Formulario Dinámico */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-slate-50">
              <h2 className="text-xl font-black text-slate-800">
                {editingId ? "Editar " : "Nuevo "}
                {activeTab === "causas" ? "Causa" : "Tipo de Comportamiento"}
              </h2>
              <button
                onClick={cerrarModal}
                className="p-2 hover:bg-slate-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Nombre
                </label>
                <input
                  required
                  type="text"
                  className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={formData.nombre}
                  onChange={(e) =>
                    setFormData({ ...formData, nombre: e.target.value })
                  }
                />
              </div>

              {/* El campo descripción SOLO aparece si estamos en la pestaña Tipos */}
              {activeTab === "tipos" && (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                    Descripción (Opcional)
                  </label>
                  <textarea
                    rows="3"
                    className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                    value={formData.descripcion}
                    onChange={(e) =>
                      setFormData({ ...formData, descripcion: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 py-3.5 text-slate-500 font-bold hover:bg-slate-100 rounded-2xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-[2] bg-blue-600 text-white py-3.5 rounded-2xl font-bold hover:bg-blue-700 shadow-lg"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación */}
      {itemAEliminar && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center shadow-2xl animate-in zoom-in">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">
              ¿Eliminar registro?
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Estás a punto de ocultar "<b>{itemAEliminar.nombre}</b>". No
              aparecerá más en los formularios nuevos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setItemAEliminar(null)}
                className="flex-1 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleEliminar}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
