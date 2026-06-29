import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPatient, updatePatient } from "@/lib/patients.functions";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/patient/$id")({
  component: PatientDetail,
});

function PatientDetail() {
  const { id } = useParams({ from: "/dashboard/patient/$id" });
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  
  // Edit state
  const [status, setStatus] = useState("new");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getPatient(id)
      .then((data) => {
        setPatient(data);
        setStatus(data.status || "new");
        setNotes(data.doctor_notes || "");
        setLoading(false);
      })
      .catch((e) => {
        setErr(e.message);
        setLoading(false);
      });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setErr(null);
    try {
      await updatePatient({ id, status, doctor_notes: notes });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando datos del paciente...</div>;
  if (err && !patient) return <div className="p-8 text-red-600">Error: {err}</div>;
  if (!patient) return <div className="p-8">Paciente no encontrado.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 mb-6">
        <ArrowLeft className="size-4" />
        Volver a la lista
      </Link>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">{patient.full_name}</h1>
          <p className="text-gray-500 mt-1">{patient.email} &middot; {patient.phone}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500"
          >
            <option value="new">Nuevo</option>
            <option value="contacted">Contactado</option>
            <option value="approved">Aprobado</option>
            <option value="rejected">Rechazado</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "..." : saved ? <CheckCircle className="size-4" /> : <Save className="size-4" />}
            {saved ? "Guardado" : "Guardar Cambios"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Izquierda: Detalles del Quiz */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Información Física</h2>
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-xs text-gray-500">Sexo Biológico</p>
                <p className="font-medium">{patient.sex === "male" ? "Hombre" : "Mujer"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
                <p className="font-medium">{patient.date_of_birth || "No especificada"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Altura</p>
                <p className="font-medium">{patient.height_cm} cm</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Peso Actual</p>
                <p className="font-medium">{patient.current_weight_kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Peso Meta</p>
                <p className="font-medium text-green-600">{patient.goal_weight_kg} kg</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">IMC (Estimado)</p>
                <p className="font-medium">
                  {((patient.current_weight_kg / Math.pow(patient.height_cm / 100, 2)) || 0).toFixed(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Historial Médico</h2>
            
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">Condiciones (Marcadas en el quiz)</p>
              <div className="flex flex-wrap gap-2">
                {patient.conditions && patient.conditions.length > 0 ? (
                  patient.conditions.map((c: string) => (
                    <span key={c} className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs rounded-md">
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Ninguna reportada</span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-4">
              <div>
                <p className="text-xs text-gray-500">Presión Arterial</p>
                <p className="font-medium capitalize">{patient.blood_pressure_range || "Desconocida"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">¿Probó GLP-1 (últimas 4 semanas)?</p>
                <p className="font-medium">{patient.prior_glp1 ? "Sí" : "No"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">¿Embarazada o lactando?</p>
                <p className="font-medium">{patient.pregnant_or_nursing ? "Sí" : "No"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Medicamentos Actuales</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{patient.medications || "Ninguno reportado"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Alergias</p>
                <p className="text-sm bg-gray-50 p-3 rounded-lg">{patient.allergies || "Ninguna reportada"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Notas del Doctor */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Notas del Doctor</h2>
            <p className="text-xs text-gray-500 mb-3">
              Usa este espacio para registrar la decisión médica, prescripciones enviadas o plan de tratamiento aprobado.
            </p>
            <textarea
              className="flex-1 w-full border border-gray-300 rounded-lg p-3 text-sm focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none min-h-[300px]"
              placeholder="Ej. Se aprobó Semaglutida 0.25mg mensual. El paciente no presenta contraindicaciones..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
