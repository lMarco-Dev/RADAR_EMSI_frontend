import { useAuthStore } from "../../store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Panel de Administración</h1>
      <p className="mt-4">Bienvenido, {user?.nombre} ({user?.rol})</p>
    </div>
  );
}