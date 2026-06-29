import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listPatients } from "@/lib/patients.functions";
import { Search } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    listPatients()
      .then((data) => {
        setPatients(data);
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.message);
        setLoading(false);
      });
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new": return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">Nuevo</span>;
      case "contacted": return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">Contactado</span>;
      case "approved": return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">Aprobado</span>;
      case "rejected": return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">Rechazado</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">{status}</span>;
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pacientes Recientes</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      {err && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
          Error al cargar pacientes: {err}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-semibold">Nombre</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Provincia</th>
              <th className="px-6 py-4 font-semibold">Fecha</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Cargando pacientes...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No hay pacientes registrados aún.</td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{p.full_name}</td>
                  <td className="px-6 py-4">{p.email}</td>
                  <td className="px-6 py-4">{p.province || "N/A"}</td>
                  <td className="px-6 py-4">
                    {new Date(p.created_at).toLocaleDateString("es-DO", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(p.status || "new")}</td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      to={`/dashboard/patient/${p.id}`}
                      className="text-green-600 hover:text-green-700 font-medium"
                    >
                      Revisar &rarr;
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
