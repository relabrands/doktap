import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft, ArrowRight, CheckCircle2, Play, Mars, Venus,
  Activity, Gauge, ShieldCheck,
} from "lucide-react";
import { QuizHeader } from "@/components/Brand";
import { RD_PROVINCES, CONDITIONS, BP_RANGES, TOTAL_STEPS } from "@/lib/rd-data";
import { submitPatient } from "@/lib/patients.functions";
import testi1 from "@/assets/testimonial-1.jpg";
import testi2 from "@/assets/testimonial-2.jpg";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Evaluación gratis — DOKTAP" },
      { name: "description", content: "3 minutos. Cuéntanos tu salud y meta de peso. Un doctor revisa tu caso." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Quiz,
});

type Sex = "male" | "female";
type Pace = "works" | "faster" | "too_fast";

type QuizState = {
  step: number;
  heightUnit: "cm" | "ft";
  heightCm: number | null;
  heightFt: number | null;
  heightIn: number | null;
  weightUnit: "kg" | "lb";
  currentKg: number | null;
  goalKg: number | null;
  sex: Sex | null;
  dob: string;
  pace: Pace | null;
  conditions: string[];
  medications: string;
  allergies: string;
  bp: string | null;
  pregnant: boolean;
  priorGlp1: boolean;
  fullName: string;
  email: string;
  phone: string;
  province: string;
  cedula: string;
};

const STORAGE_KEY = "doktap_quiz_v1";

const initialState: QuizState = {
  step: 1,
  heightUnit: "ft",
  heightCm: null, heightFt: 5, heightIn: 6,
  weightUnit: "lb",
  currentKg: null, goalKg: null,
  sex: null, dob: "",
  pace: null,
  conditions: [], medications: "", allergies: "",
  bp: null, pregnant: false, priorGlp1: false,
  fullName: "", email: "", phone: "+1 ", province: "", cedula: "",
};

function Quiz() {
  const navigate = useNavigate();
  const [s, setS] = useState<QuizState>(initialState);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = useServerFn(submitPatient);

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...initialState, ...JSON.parse(raw), step: 1 });
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, [s]);

  const set = <K extends keyof QuizState>(k: K, v: QuizState[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const heightCm = useMemo(() => {
    if (s.heightUnit === "cm") return s.heightCm ?? 0;
    return Math.round(((s.heightFt ?? 0) * 12 + (s.heightIn ?? 0)) * 2.54);
  }, [s.heightUnit, s.heightCm, s.heightFt, s.heightIn]);

  const currentKg = useMemo(
    () => s.weightUnit === "kg" ? (s.currentKg ?? 0) : Math.round(((s.currentKg ?? 0) / 2.2046) * 10) / 10,
    [s.weightUnit, s.currentKg],
  );
  const goalKg = useMemo(
    () => s.weightUnit === "kg" ? (s.goalKg ?? 0) : Math.round(((s.goalKg ?? 0) / 2.2046) * 10) / 10,
    [s.weightUnit, s.goalKg],
  );

  const toLose = Math.max(0, Math.round((currentKg - goalKg) * 10) / 10);
  const weeksToGoal = toLose > 0 ? Math.max(1, Math.round((toLose / 2) * 10) / 10) : 0;

  const next = () => setS((p) => ({ ...p, step: Math.min(TOTAL_STEPS, p.step + 1) }));
  const back = () => setS((p) => ({ ...p, step: Math.max(1, p.step - 1) }));

  const canNext = (() => {
    switch (s.step) {
      case 1:
        return heightCm > 50 && currentKg > 0 && goalKg > 0 && s.sex && s.dob.length >= 4;
      case 4: return !!s.pace;
      case 5: return !!s.bp;
      case 6:
        return s.fullName.trim().length > 1 && /\S+@\S+\.\S+/.test(s.email) && s.phone.replace(/\D/g,"").length >= 10;
      default: return true;
    }
  })();

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    try {
      await submit({
        data: {
          full_name: s.fullName.trim(),
          email: s.email.trim(),
          phone: s.phone.trim(),
          province: s.province || null,
          cedula: s.cedula || null,
          sex: s.sex!,
          date_of_birth: s.dob || null,
          height_cm: heightCm,
          current_weight_kg: currentKg,
          goal_weight_kg: goalKg,
          pace_choice: s.pace,
          conditions: s.conditions,
          medications: s.medications || null,
          allergies: s.allergies || null,
          blood_pressure_range: (s.bp as any) || null,
          pregnant_or_nursing: s.pregnant,
          prior_glp1: s.priorGlp1,
        },
      });
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (e: any) {
      setErr(e?.message || "Error al enviar");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <ThankYou navigate={navigate} />;

  return (
    <div className="min-h-screen bg-background">
      <QuizHeader />
      <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">
        <ProgressBar step={s.step} onBack={s.step > 1 ? back : undefined} />

        {s.step === 1 && (
          <Step1 s={s} set={set} heightCm={heightCm} currentKg={currentKg} goalKg={goalKg} />
        )}
        {s.step === 2 && <Step2 />}
        {s.step === 3 && <Step3 toLose={toLose} weightUnit={s.weightUnit} />}
        {s.step === 4 && <Step4 s={s} set={set} weeks={weeksToGoal} goalKg={goalKg} weightUnit={s.weightUnit} />}
        {s.step === 5 && <Step5 s={s} set={set} />}
        {s.step === 6 && <Step6 s={s} set={set} />}

        {err && <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
          {s.step > 1 && (
            <button onClick={back} className="btn-ghost shrink-0" aria-label="Atrás">
              <ArrowLeft className="size-5" />
            </button>
          )}
          {s.step < TOTAL_STEPS ? (
            <button
              onClick={next}
              disabled={!canNext}
              className="btn-primary w-full text-base"
            >
              Siguiente <ArrowRight className="size-5" />
            </button>
          ) : (
            <button onClick={onSubmit} disabled={!canNext || loading} className="btn-primary w-full text-base">
              {loading ? "Enviando…" : "Enviar mi caso"} <ArrowRight className="size-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <div className="mb-7 flex items-center gap-2">
      <button onClick={onBack} className={`text-muted-foreground ${onBack ? "" : "invisible"}`} aria-label="Atrás">
        <ArrowLeft className="size-5" />
      </button>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-full transition-colors ${
              i + 1 < step ? "bg-primary-soft" :
              i + 1 === step ? "bg-primary" :
              "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

/* ----- STEP COMPONENTS ----- */

function Step1({ s, set, heightCm, currentKg, goalKg }: any) {
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-extrabold sm:text-4xl">
          Alcanza tu peso meta <span className="text-primary">sin dietas restrictivas</span> ni gimnasio.
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cuéntanos lo básico para personalizar tu plan.
        </p>
      </header>

      <Field label="¿Cuál es tu altura?">
        <UnitToggle value={s.heightUnit} onChange={(v) => set("heightUnit", v)} options={[["ft","pies/pulg"],["cm","cm"]]} />
        {s.heightUnit === "ft" ? (
          <div className="mt-2 grid grid-cols-2 gap-3">
            <NumberInput label="Pies" value={s.heightFt} onChange={(v) => set("heightFt", v)} min={3} max={8} />
            <NumberInput label="Pulgadas" value={s.heightIn} onChange={(v) => set("heightIn", v)} min={0} max={11} />
          </div>
        ) : (
          <NumberInput label="cm" value={s.heightCm} onChange={(v) => set("heightCm", v)} min={100} max={250} />
        )}
        {heightCm > 0 && <p className="mt-1 text-xs text-muted-foreground">{heightCm} cm</p>}
      </Field>

      <Field label="¿Cuál es tu peso actual?">
        <UnitToggle value={s.weightUnit} onChange={(v) => set("weightUnit", v)} options={[["lb","libras"],["kg","kilos"]]} />
        <NumberInput
          label={s.weightUnit === "lb" ? "lb" : "kg"}
          value={s.currentKg}
          onChange={(v) => set("currentKg", v)}
          min={30}
          max={500}
        />
        {currentKg > 0 && s.weightUnit === "lb" && (
          <p className="mt-1 text-xs text-muted-foreground">≈ {currentKg} kg</p>
        )}
      </Field>

      <Field label="¿Cuál es tu peso meta?">
        <NumberInput
          label={s.weightUnit === "lb" ? "lb" : "kg"}
          value={s.goalKg}
          onChange={(v) => set("goalKg", v)}
          min={30}
          max={500}
        />
        {goalKg > 0 && s.weightUnit === "lb" && (
          <p className="mt-1 text-xs text-muted-foreground">≈ {goalKg} kg</p>
        )}
      </Field>

      <Field label="¿Cuál es tu sexo biológico?">
        <div className="grid grid-cols-2 gap-3">
          <BigChoice active={s.sex === "male"} onClick={() => set("sex", "male")} icon={Mars} label="Hombre" />
          <BigChoice active={s.sex === "female"} onClick={() => set("sex", "female")} icon={Venus} label="Mujer" />
        </div>
      </Field>

      <Field label="Fecha de nacimiento">
        <input
          type="date"
          value={s.dob}
          onChange={(e) => set("dob", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
        />
      </Field>
    </div>
  );
}

function Step2() {
  return (
    <div className="space-y-7 text-center">
      <h1 className="text-3xl font-extrabold sm:text-4xl">
        "Cuando nada más funcionaba… <span className="text-primary">¡DOKTAP sí!</span>"
      </h1>
      <div className="space-y-5">
        {[testi1, testi2].map((src, i) => (
          <div key={i} className="relative mx-auto aspect-[9/16] w-full max-w-xs overflow-hidden rounded-2xl bg-black shadow-card">
            <img src={src} alt="Testimonio paciente" className="size-full object-cover opacity-90" loading="lazy" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="grid size-16 place-items-center rounded-full bg-white/90 text-primary shadow-lg">
                <Play className="size-7 fill-current" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 rounded-md bg-black/50 px-2 py-0.5 text-xs text-white">
              0:00 / {i === 0 ? "0:44" : "0:59"}
            </div>
          </div>
        ))}
      </div>
      <p className="font-semibold">¿Listo para tu próximo capítulo?</p>
    </div>
  );
}

function Step3({ toLose, weightUnit }: { toLose: number; weightUnit: "kg"|"lb" }) {
  const displayLose = weightUnit === "lb"
    ? Math.round(toLose * 2.2046)
    : toLose;
  const unit = weightUnit === "lb" ? "lb" : "kg";
  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-extrabold sm:text-5xl">¡Perfecto!</h1>
      <div className="h-px bg-border" />
      <p className="text-xl font-medium leading-snug">
        Perder <span className="text-primary font-bold">{displayLose} {unit}</span> es más
        fácil de lo que piensas, y no implica dietas restrictivas.
      </p>
    </div>
  );
}

function Step4({ s, set, weeks, goalKg, weightUnit }: any) {
  const displayGoal = weightUnit === "lb" ? Math.round(goalKg * 2.2046) : goalKg;
  const unit = weightUnit === "lb" ? "lb" : "kg";
  const paceRange = weightUnit === "lb" ? "3.75 a 5 libras" : "1.7 a 2.3 kg";
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl leading-tight">
        Con medicación, perderás{" "}
        <span className="text-primary">{paceRange} por semana</span>.
      </h1>
      <div className="h-px bg-border" />
      <p className="text-lg">
        Te tomará aproximadamente <span className="font-bold">{weeks} semanas</span>{" "}
        alcanzar tu peso meta de <span className="font-bold">{displayGoal} {unit}</span>.
      </p>
      <div className="h-px bg-border" />
      <p className="font-semibold">¿Cómo te parece ese ritmo?</p>
      <div className="space-y-3">
        <PaceCard active={s.pace === "works"} onClick={() => set("pace", "works")}
          icon={<CheckCircle2 className="size-5 text-primary" />} bg="bg-primary-soft"
          label="Me funciona así" />
        <PaceCard active={s.pace === "faster"} onClick={() => set("pace", "faster")}
          icon={<Activity className="size-5 text-[oklch(0.55_0.18_240)]" />} bg="bg-[oklch(0.93_0.05_240)]"
          label="Lo quiero más rápido" />
        <PaceCard active={s.pace === "too_fast"} onClick={() => set("pace", "too_fast")}
          icon={<Gauge className="size-5 text-destructive" />} bg="bg-[oklch(0.95_0.04_27)]"
          label="Es muy rápido" />
      </div>
    </div>
  );
}

function Step5({ s, set }: any) {
  const toggle = (c: string) => {
    const has = s.conditions.includes(c);
    set("conditions", has ? s.conditions.filter((x: string) => x !== c) : [...s.conditions, c]);
  };
  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Tu salud</h1>
        <p className="mt-1 text-muted-foreground">El doctor lo usa para personalizar tu plan.</p>
      </header>

      <Field label="¿Tienes alguna de estas condiciones? (Marca todas las que apliquen)">
        <div className="space-y-2">
          {CONDITIONS.map((c) => {
            const active = s.conditions.includes(c);
            return (
              <button
                type="button"
                key={c}
                onClick={() => toggle(c)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${
                  active ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <span className={`grid size-5 place-items-center rounded-md border ${active ? "border-primary bg-primary text-white" : "border-border"}`}>
                  {active && <CheckCircle2 className="size-4" />}
                </span>
                {c}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="¿Cuál es tu rango de presión arterial?">
        <div className="space-y-2">
          {BP_RANGES.map((b) => {
            const active = s.bp === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => set("bp", b.id)}
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                  active ? "border-primary bg-primary-soft" : "border-border bg-card"
                }`}
              >
                <span className="size-3 rounded-full" style={{ backgroundColor: b.color }} />
                <div className="flex-1">
                  <div className="text-sm font-semibold">{b.label}</div>
                  <div className="text-xs text-muted-foreground">{b.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Medicamentos que tomas actualmente (opcional)">
        <textarea
          value={s.medications}
          onChange={(e) => set("medications", e.target.value)}
          rows={3}
          placeholder="Ej: metformina, losartán…"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
      </Field>

      <Field label="Alergias (opcional)">
        <input
          value={s.allergies}
          onChange={(e) => set("allergies", e.target.value)}
          placeholder="Ej: penicilina"
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
      </Field>

      {s.sex === "female" && (
        <Toggle label="¿Estás embarazada o lactando?" value={s.pregnant} onChange={(v) => set("pregnant", v)} />
      )}
      <Toggle label="¿Has tomado GLP-1 (Ozempic, Wegovy, Mounjaro…) antes?" value={s.priorGlp1} onChange={(v) => set("priorGlp1", v)} />
    </div>
  );
}

function Step6({ s, set }: any) {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-extrabold sm:text-4xl">Casi listo</h1>
        <p className="mt-1 text-muted-foreground">¿A dónde te contactamos? Solo te escribe un doctor de DOKTAP.</p>
      </header>
      <Field label="Nombre completo">
        <input
          value={s.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
          placeholder="Juan Pérez"
        />
      </Field>
      <Field label="Email">
        <input
          type="email"
          value={s.email}
          onChange={(e) => set("email", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
          placeholder="tucorreo@ejemplo.com"
        />
      </Field>
      <Field label="WhatsApp (RD)">
        <input
          inputMode="tel"
          value={s.phone}
          onChange={(e) => set("phone", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
          placeholder="+1 809 000 0000"
        />
      </Field>
      <Field label="Provincia (opcional)">
        <select
          value={s.province}
          onChange={(e) => set("province", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
        >
          <option value="">— Selecciona —</option>
          {RD_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Cédula (opcional, acelera tu receta)">
        <input
          value={s.cedula}
          onChange={(e) => set("cedula", e.target.value)}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none"
          placeholder="000-0000000-0"
        />
      </Field>
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="size-4 text-primary" />
        Tu información es privada y solo la ve nuestro equipo médico.
      </p>
    </div>
  );
}

function ThankYou({ navigate }: { navigate: any }) {
  return (
    <div className="min-h-screen bg-background">
      <QuizHeader />
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto grid size-16 place-items-center rounded-full bg-primary-soft text-primary">
          <CheckCircle2 className="size-8" />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold sm:text-4xl">¡Gracias!</h1>
        <p className="mt-3 text-muted-foreground">
          Recibimos tu caso. Un doctor de DOKTAP te contactará por WhatsApp en las próximas 24 horas
          para revisar tu plan.
        </p>
        <button onClick={() => navigate({ to: "/" })} className="btn-primary mt-8">
          Volver al inicio
        </button>
      </div>
    </div>
  );
}

/* ----- Small UI atoms ----- */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      {children}
    </div>
  );
}

function NumberInput({ label, value, onChange, min, max }: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        min={min}
        max={max}
        className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-14 text-base focus:border-primary focus:outline-none"
      />
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function UnitToggle({ value, onChange, options }: { value: string; onChange: (v: any) => void; options: [string,string][] }) {
  return (
    <div className="mb-2 inline-flex rounded-full bg-muted p-1 text-xs">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1 font-semibold ${value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function BigChoice({ active, onClick, icon: Icon, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-3 rounded-2xl border px-4 py-6 transition ${
        active ? "border-primary bg-primary-soft" : "border-border bg-card"
      }`}
    >
      <Icon className={`size-9 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function PaceCard({ active, onClick, icon, bg, label }: any) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition ${
        active ? "border-primary ring-2 ring-primary-soft" : "border-border"
      } bg-card`}
    >
      <span className={`grid size-10 place-items-center rounded-full ${bg}`}>{icon}</span>
      <span className="font-semibold">{label}</span>
    </button>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`rounded-xl border px-4 py-3 font-semibold transition ${
            value ? "border-primary bg-primary-soft" : "border-border bg-card"
          }`}
        >Sí</button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`rounded-xl border px-4 py-3 font-semibold transition ${
            !value ? "border-primary bg-primary-soft" : "border-border bg-card"
          }`}
        >No</button>
      </div>
    </div>
  );
}
