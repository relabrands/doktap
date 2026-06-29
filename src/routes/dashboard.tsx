import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Wordmark } from "@/components/Brand";
import { LogOut, LayoutDashboard, Users } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        navigate({ to: "/auth" });
      } else {
        setUser(u);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Wordmark />
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
            activeProps={{ className: "bg-green-50 text-green-700 hover:bg-green-100" }}
            activeOptions={{ exact: true }}
          >
            <LayoutDashboard className="size-5" />
            Resumen
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-100"
            activeProps={{ className: "bg-green-50 text-green-700 hover:bg-green-100" }}
          >
            <Users className="size-5" />
            Pacientes
          </Link>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <p className="text-xs text-gray-500 mb-3 truncate">{user?.email}</p>
          <button
            onClick={() => signOut(auth)}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
          >
            <LogOut className="size-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
