import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { listPatients, updatePatient, myRole } from "@/lib/patients.functions";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/Brand";
import { LogOut, Search, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/_authenticated/doctor")({
  head: () => ({ meta: [{ title: "Pacientes — DOKTAP" }, { name: "robots", content: "noindex" }] }),
  component: DoctorDashboard,
});

const STATUSES = [
  { v: "new", l: "Nuevo", c: "bg-[oklch(0.93_0.05_240)] text-[oklch(0.35_0.1_240)]" },
  { v: "contacted", l: "Contactado", c: "bg-[oklch(0.93_0.08_75)] text-[oklch(0.4_0.12_75)]" },
  { v: "approved", l: "Aprobado", c: "bg-primary-soft text-primary" },
  { v: "rejected", l: "Rechazado", c: "bg-[oklch(0.95_0.04_27)] text-destructive" },
];

function DoctorDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listPatients);
  const role = useServerFn(myRole);
  const update = useServerFn(updatePatient);

  const roleQ = useQuery({ queryKey: ["my-role"], queryFn: () => role() });
  const patientsQ = useQuery({
    queryKey: ["patients"],
    queryFn: () => list(),
    enabled: !!roleQ.data?.isDoctor,
  });

  const mut = useMutation({
    mutationFn: (vars: { id: string; status?: any; doctor_notes?: string }) =>
      update({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patients"] }),
  });

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<any | null>(null);

  const filtered = useMemo(() => {
    const items = patientsQ.data ?? [];
    return items.filter((p: any) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (q) {
        const s = q.toLowerCase();
        return (
          p.full_name?.toLowerCase().includes(s) ||
          p.email?.toLowerCase().includes(s) ||
          p.phone?.toLowerCase().includes(s) ||
          p.province?.toLowerCase().includes(s)
        );
      }
      return true;
    });
  }, [patientsQ.data, q, statusFilter]);

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  if (roleQ.isLoading) {
    return <div className="grid min-h-screen place-items-center text-muted-foreground">Cargando…</div>;
  }
  if (!roleQ.data?.isDoctor) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream p-4">
        <div className="card-soft max-w-md p-8 text-center">
          <ShieldAlert className="mx-auto size-10 text-destructive" />
          <h1 className="mt-4 text-xl font-extrabold">Sin acceso médico</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Tu cuenta existe pero aún no tiene rol de <b>doctor</b>. Pídele a un admin
            que te lo asigne (tabla <code>user_roles</code>).
          </p>
          <button onClick={signOut} className="btn-primary mt-6">Cerrar sesión</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Wordmark />
            <span className="chip-soft">Portal médico</span>
          </div>
          <button onClick={signOut} className="btn-ghost text-sm"><LogOut className="size-4"/> Salir</button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-extrabold">Pacientes</h1>
          <span className="text-sm text-muted-foreground">{filtered.length} / {patientsQ.data?.length ?? 0}</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar nombre, email…"
                className="w-64 rounded-full border border-border bg-card pl-9 pr-3 py-2 text-sm focus:border-primary focus:outline-none" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-full border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none">
              <option value="all">Todos</option>
              {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        </div>

        {patientsQ.isLoading ? (
          <p className="text-muted-foreground">Cargando pacientes…</p>
        ) : filtered.length === 0 ? (
          <div className="card-soft p-12 text-center text-muted-foreground">
            Aún no hay pacientes que coincidan.
          </div>
        ) : (
          <div className="card-soft overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Paciente</th>
                  <th className="px-4 py-3">Contacto</th>
                  <th className="px-4 py-3">Meta</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p: any) => {
                  const st = STATUSES.find((s) => s.v === p.status) ?? STATUSES[0];
                  const toLose = Math.max(0, Math.round((Number(p.current_weight_kg) - Number(p.goal_weight_kg)) * 10) / 10);
                  return (
                    <tr key={p.id} className="cursor-pointer border-t border-border hover:bg-muted/40"
                        onClick={() => setSelected(p)}>
                      <td className="px-4 py-3">
                        <div className="font-semibold">{p.full_name}</div>
                        <div className="text-xs text-muted-foreground">{p.province || "—"}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <div>{p.email}</div>
                        <div className="text-muted-foreground">{p.phone}</div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {p.current_weight_kg} → {p.goal_weight_kg} kg
                        <div className="text-muted-foreground">-{toLose} kg</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${st.c}`}>{st.l}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(p.created_at).toLocaleDateString("es-DO", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {selected && (
        <PatientDrawer
          patient={selected}
          onClose={() => setSelected(null)}
          onUpdate={(patch: { status?: string; doctor_notes?: string }) => mut.mutate({ id: selected.id, ...patch })}
          saving={mut.isPending}
        />
      )}
    </div>
  );
}

function PatientDrawer({ patient, onClose, onUpdate, saving }: any) {
  const [notes, setNotes] = useState(patient.doctor_notes || "");
  const [status, setStatus] = useState(patient.status);
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <aside className="flex w-full max-w-xl flex-col overflow-y-auto bg-background shadow-2xl">
        <div className="sticky top-0 border-b border-border bg-background px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-extrabold">{patient.full_name}</h2>
              <p className="text-xs text-muted-foreground">
                Recibido {new Date(patient.created_at).toLocaleString("es-DO")}
              </p>
            </div>
            <button onClick={onClose} className="btn-ghost">Cerrar</button>
          </div>
        </div>

        <div className="space-y-5 p-6 text-sm">
          <Section title="Contacto">
            <KV k="Email" v={patient.email} />
            <KV k="WhatsApp" v={patient.phone} />
            <KV k="Provincia" v={patient.province || "—"} />
            <KV k="Cédula" v={patient.cedula || "—"} />
          </Section>
          <Section title="Datos básicos">
            <KV k="Sexo" v={patient.sex === "male" ? "Hombre" : "Mujer"} />
            <KV k="Fecha de nacimiento" v={patient.date_of_birth || "—"} />
            <KV k="Altura" v={`${patient.height_cm} cm`} />
            <KV k="Peso actual" v={`${patient.current_weight_kg} kg`} />
            <KV k="Peso meta" v={`${patient.goal_weight_kg} kg`} />
            <KV k="Ritmo deseado" v={patient.pace_choice || "—"} />
          </Section>
          <Section title="Salud">
            <KV k="Presión arterial" v={patient.blood_pressure_range || "—"} />
            <KV k="Embarazo / lactancia" v={patient.pregnant_or_nursing ? "Sí" : "No"} />
            <KV k="GLP-1 previo" v={patient.prior_glp1 ? "Sí" : "No"} />
            <KV k="Medicamentos" v={patient.medications || "—"} />
            <KV k="Alergias" v={patient.allergies || "—"} />
            <div>
              <div className="text-xs font-semibold text-muted-foreground">Condiciones</div>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {(patient.conditions || []).length === 0
                  ? <span className="text-muted-foreground">—</span>
                  : (patient.conditions as string[]).map((c) => (
                    <span key={c} className="chip-soft">{c}</span>
                  ))}
              </div>
            </div>
          </Section>

          <Section title="Decisión médica">
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 focus:border-primary focus:outline-none">
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Notas del doctor</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={5}
                className="w-full rounded-xl border border-border bg-card px-3 py-2 focus:border-primary focus:outline-none" />
            </div>
            <button
              onClick={() => onUpdate({ status, doctor_notes: notes })}
              disabled={saving}
              className="btn-primary w-full"
            >
              {saving ? "Guardando…" : "Guardar"}
            </button>
          </Section>
        </div>
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-soft p-4">
      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function KV({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className="text-right font-medium">{v}</span>
    </div>
  );
}
