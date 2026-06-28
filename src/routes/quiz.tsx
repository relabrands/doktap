import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Star,
  ChevronDown,
  User,
  Check,
  Zap,
  Clock,
  Package,
  Activity,
} from "lucide-react";
import { submitPatient } from "@/lib/patients.functions";
import { RD_PROVINCES } from "@/lib/rd-data";

export const Route = createFileRoute("/quiz")({
  head: () => ({
    meta: [
      { title: "Evaluación gratis — DOKTAP" },
      {
        name: "description",
        content:
          "Completa tu evaluación en 3 minutos. Un médico revisa tu caso en 24 horas.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Quiz,
});

/* ─────────────────────────── types ─────────────────────────── */
type QuizState = {
  step: number;
  // Step 1 – weight goal
  sex: "male" | "female" | null;
  heightFt: number;
  heightIn: number;
  weightLb: number | null;
  goalLb: number | null;
  dob: string;
  // Step 2 – prior GLP-1 last 4 weeks
  priorGlp1Weeks: "glp1" | "other" | "no" | null;
  // Step 3 – weight programs
  weightProgram: "yes" | "no" | null;
  // Step 4 – conditions (multi)
  conditions: string[];
  // Step 5 – blood pressure
  bp: string | null;
  // Step 6 – medications
  medications: string;
  allergies: string;
  pregnant: boolean;
  // Step 7 – personalization interests (multi)
  interests: string[];
  // Step 8 – additional info for medical team
  hasAdditionalInfo: "yes" | "no" | null;
  additionalInfo: string;
  // Step 9 – summary / name / state
  firstName: string;
  lastName: string;
  shipState: string;
  // Step 10 – contact
  email: string;
  phone: string;
  termsAccepted: boolean;
  // Step 11 – plan selection
  treatment: "semaglutide" | "tirzepatide" | null;
  plan: "1m" | "3m" | "6m" | "12m" | null;
};

const STORAGE_KEY = "doktap_quiz_v2";

const init: QuizState = {
  step: 1,
  sex: null,
  heightFt: 5,
  heightIn: 6,
  weightLb: null,
  goalLb: null,
  dob: "",
  priorGlp1Weeks: null,
  weightProgram: null,
  conditions: [],
  bp: null,
  medications: "",
  allergies: "",
  pregnant: false,
  interests: [],
  hasAdditionalInfo: null,
  additionalInfo: "",
  firstName: "",
  lastName: "",
  shipState: "",
  email: "",
  phone: "",
  termsAccepted: true,
  treatment: null,
  plan: null,
};

const TOTAL_STEPS = 11;

const CONDITIONS = [
  "Diabetes tipo 1",
  "Diabetes tipo 2",
  "Hipertensión arterial",
  "Enfermedad cardíaca",
  "Enfermedad de la tiroides",
  "Cáncer (actual o previo)",
  "Pancreatitis",
  "Cálculos biliares",
  "Enfermedad renal",
  "Enfermedad hepática",
  "Trastorno alimentario",
  "Depresión o ansiedad",
  "Reflujo (ERGE) severo",
  "Ninguna de las anteriores",
];

const BP_RANGES = [
  { id: "normal", label: "Normal", desc: "Menos de 120/80", color: "#2d9e6b" },
  { id: "elevated", label: "Elevada", desc: "120–129 / menos de 80", color: "#e0a832" },
  { id: "high1", label: "Alta — Etapa 1", desc: "130–139 / 80–89", color: "#e07832" },
  { id: "high2", label: "Alta — Etapa 2", desc: "140+ / 90+", color: "#d93025" },
  { id: "unknown", label: "No lo sé", desc: "Está bien, lo revisamos juntos", color: "#6b7280" },
];

const INTERESTS = [
  "Mantener la masa muscular mientras pierdo peso.",
  "Preferiría no inyectarme.",
  "Manejo de posibles efectos secundarios como náuseas/vómitos.",
  "Ayuda a combatir el envejecimiento y a promover la longevidad.",
  "Mejorar la función cognitiva y la claridad mental.",
  "Mejorar los niveles de energía.",
  "Regulación de la menstruación y del estado hormonal.",
  "Mejorar la calidad del sueño.",
  "No estoy seguro; me gustaría hablar sobre las opciones con un médico.",
];

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada",
  "New Hampshire","New Jersey","New Mexico","New York","North Carolina",
  "North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island",
  "South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont",
  "Virginia","Washington","West Virginia","Wisconsin","Wyoming",
];

/* ─────────────────────────── component ─────────────────────── */
function Quiz() {
  const navigate = useNavigate();
  const [s, setS] = useState<QuizState>(init);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const submit = useServerFn(submitPatient);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setS({ ...init, ...JSON.parse(raw), step: 1 });
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch {}
  }, [s]);

  const set = <K extends keyof QuizState>(k: K, v: QuizState[K]) =>
    setS((p) => ({ ...p, [k]: v }));

  const heightCm = Math.round((s.heightFt * 12 + s.heightIn) * 2.54);
  const currentKg = s.weightLb ? Math.round((s.weightLb / 2.2046) * 10) / 10 : 0;
  const goalKg = s.goalLb ? Math.round((s.goalLb / 2.2046) * 10) / 10 : 0;
  const bmi = heightCm > 0 && currentKg > 0
    ? Math.round(((currentKg / ((heightCm / 100) ** 2)) * 10) / 10)
    : 0;
  const toLoseKg = Math.max(0, currentKg - goalKg);
  const weeksToGoal = toLoseKg > 0 ? Math.max(1, Math.round((toLoseKg / 0.9) * 10) / 10) : 0;
  const successPct = bmi >= 30 ? 94 : bmi >= 27 ? 88 : 82;

  const canNext = (() => {
    switch (s.step) {
      case 1:
        return !!s.sex && !!s.weightLb && !!s.goalLb && s.dob.length >= 8 && s.heightFt > 0;
      case 2: return !!s.priorGlp1Weeks;
      case 3: return !!s.weightProgram;
      case 4: return s.conditions.length > 0;
      case 5: return !!s.bp;
      case 6: return true;
      case 7: return s.interests.length > 0;
      case 8:
        return !!s.hasAdditionalInfo;
      case 9:
        return s.firstName.trim().length > 0 && s.lastName.trim().length > 0 && s.shipState.length > 0;
      case 10:
        return /\S+@\S+\.\S+/.test(s.email) && s.phone.replace(/\D/g, "").length >= 10 && s.termsAccepted;
      case 11: return !!s.treatment && !!s.plan;
      default: return true;
    }
  })();

  const next = () => setS((p) => ({ ...p, step: Math.min(TOTAL_STEPS, p.step + 1) }));
  const back = () => setS((p) => ({ ...p, step: Math.max(1, p.step - 1) }));

  const onSubmit = async () => {
    setErr(null);
    setLoading(true);
    try {
      await submit({
        data: {
          full_name: `${s.firstName} ${s.lastName}`.trim(),
          email: s.email.trim(),
          phone: s.phone.trim(),
          province: s.shipState || null,
          cedula: null,
          sex: s.sex!,
          date_of_birth: s.dob || null,
          height_cm: heightCm,
          current_weight_kg: currentKg,
          goal_weight_kg: goalKg,
          pace_choice: null,
          conditions: s.conditions,
          medications: s.medications || null,
          allergies: s.allergies || null,
          blood_pressure_range: (s.bp as any) || null,
          pregnant_or_nursing: s.pregnant,
          prior_glp1: s.priorGlp1Weeks === "glp1",
        },
      });
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (e: any) {
      setErr(e?.message || "Error al enviar. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) return <ThankYou navigate={navigate} />;

  // Step 9 is the "summary" screen — no floating Next button, it has its own inline button
  const isInlineStep = s.step === 9 || s.step === 11;

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <span className="font-display text-2xl font-extrabold tracking-tight" style={{ color: "#1a1a2e" }}>
            DOK<span style={{ color: "#2d9e6b" }}>TAP</span>
          </span>
          <TrustBadge />
        </div>
      </header>

      {/* Progress bar */}
      <div className="mx-auto max-w-lg px-4 pt-5">
        <ProgressBar step={s.step} onBack={s.step > 1 ? back : undefined} />
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-lg px-4 pb-36 pt-4">
        {s.step === 1 && <Step1 s={s} set={set} />}
        {s.step === 2 && <Step2 s={s} set={set} />}
        {s.step === 3 && <Step3 s={s} set={set} />}
        {s.step === 4 && <Step4 s={s} set={set} />}
        {s.step === 5 && <Step5 s={s} set={set} />}
        {s.step === 6 && <Step6 s={s} set={set} />}
        {s.step === 7 && <Step7 s={s} set={set} />}
        {s.step === 8 && <Step8 s={s} set={set} />}
        {s.step === 9 && (
          <Step9
            s={s}
            set={set}
            bmi={bmi}
            currentKg={currentKg}
            goalKg={goalKg}
            weeksToGoal={weeksToGoal}
            successPct={successPct}
            canNext={canNext}
            onNext={next}
          />
        )}
        {s.step === 10 && <Step10 s={s} set={set} firstName={s.firstName} />}
        {s.step === 11 && (
          <Step11
            s={s}
            set={set}
            loading={loading}
            canSubmit={canNext}
            onSubmit={onSubmit}
          />
        )}

        {err && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600 border border-red-200">
            {err}
          </p>
        )}
      </div>

      {/* Floating Next button — hidden on inline-button steps */}
      {!isInlineStep && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto max-w-lg px-4 py-4">
            <button
              onClick={s.step === 10 ? next : next}
              disabled={!canNext}
              className="quiz-btn-primary w-full"
              id={`quiz-next-step-${s.step}`}
            >
              Siguiente <ArrowRight className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Progress Bar ── */
function ProgressBar({ step, onBack }: { step: number; onBack?: () => void }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <button
        onClick={onBack}
        className={`text-gray-500 hover:text-gray-700 transition ${onBack ? "" : "invisible"}`}
        aria-label="Atrás"
      >
        <ArrowLeft className="size-5" />
      </button>
      <div className="flex flex-1 gap-1.5">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => {
          const pct = i + 1;
          const done = pct < step;
          const current = pct === step;
          return (
            <div
              key={i}
              className="h-2 flex-1 rounded-full transition-all duration-300"
              style={{
                backgroundColor: done
                  ? "#2d9e6b"
                  : current
                  ? "#5cc490"
                  : "#e5e7eb",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ── Trust Badge ── */
function TrustBadge() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-gray-700">Excelente 4.8</span>
      <div className="flex items-center gap-0.5 rounded px-1.5 py-1" style={{ backgroundColor: "#2d9e6b" }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-3 fill-white text-white" strokeWidth={0} />
        ))}
      </div>
    </div>
  );
}

/* ── Radio Option ── */
function RadioOption({
  selected,
  onClick,
  label,
  id,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      className="quiz-radio-option"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.875rem",
        width: "100%",
        border: selected ? "2px solid #3b82f6" : "1.5px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "0.875rem 1rem",
        backgroundColor: selected ? "#eff6ff" : "white",
        cursor: "pointer",
        transition: "all 120ms ease",
        textAlign: "left",
        marginBottom: "0.625rem",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "20px",
          height: "20px",
          borderRadius: "50%",
          border: selected ? "6px solid #3b82f6" : "2px solid #d1d5db",
          backgroundColor: "white",
          transition: "all 120ms ease",
        }}
      />
      <span style={{ fontSize: "0.9375rem", color: "#1a1a2e", fontWeight: 400 }}>
        {label}
      </span>
    </button>
  );
}

/* ── Checkbox Option ── */
function CheckboxOption({
  checked,
  onClick,
  label,
  id,
}: {
  checked: boolean;
  onClick: () => void;
  label: string;
  id: string;
}) {
  return (
    <button
      id={id}
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        width: "100%",
        border: checked ? "2px solid #2d9e6b" : "1.5px solid #e5e7eb",
        borderRadius: "0.75rem",
        padding: "0.875rem 1rem",
        backgroundColor: checked ? "#f0faf5" : "white",
        cursor: "pointer",
        transition: "all 120ms ease",
        textAlign: "left",
        marginBottom: "0.5rem",
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: "20px",
          height: "20px",
          borderRadius: "4px",
          border: checked ? "none" : "2px solid #d1d5db",
          backgroundColor: checked ? "#2d9e6b" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "1px",
        }}
      >
        {checked && <Check className="size-3 text-white" strokeWidth={3} />}
      </span>
      <span style={{ fontSize: "0.9375rem", color: "#1a1a2e", lineHeight: 1.4 }}>
        {label}
      </span>
    </button>
  );
}

/* ── Step 1: Basic info ── */
function Step1({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-7">
      <h1 className="text-3xl font-extrabold leading-tight" style={{ color: "#1a1a2e" }}>
        Alcanza tu peso meta{" "}
        <span style={{ color: "#2d9e6b" }}>sin dietas restrictivas</span>{" "}
        ni ejercicio.
      </h1>

      {/* Sex */}
      <div>
        <p className="mb-3 font-semibold text-gray-800">¿Cuál es tu sexo biológico?</p>
        <div className="grid grid-cols-2 gap-3">
          {(["male", "female"] as const).map((v) => (
            <button
              key={v}
              id={`sex-${v}`}
              type="button"
              onClick={() => set("sex", v)}
              style={{
                border: s.sex === v ? "2px solid #2d9e6b" : "1.5px solid #e5e7eb",
                borderRadius: "0.75rem",
                padding: "1rem",
                backgroundColor: s.sex === v ? "#f0faf5" : "white",
                fontWeight: 600,
                fontSize: "0.9375rem",
                color: "#1a1a2e",
                cursor: "pointer",
                transition: "all 120ms",
              }}
            >
              {v === "male" ? "♂ Hombre" : "♀ Mujer"}
            </button>
          ))}
        </div>
      </div>

      {/* Height */}
      <div>
        <p className="mb-2 font-semibold text-gray-800">¿Cuál es tu altura?</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Pies</label>
            <input
              id="height-ft"
              type="number"
              inputMode="numeric"
              value={s.heightFt}
              onChange={(e) => set("heightFt", Number(e.target.value))}
              min={3} max={8}
              className="quiz-input w-full"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">Pulgadas</label>
            <input
              id="height-in"
              type="number"
              inputMode="numeric"
              value={s.heightIn}
              onChange={(e) => set("heightIn", Number(e.target.value))}
              min={0} max={11}
              className="quiz-input w-full"
            />
          </div>
        </div>
      </div>

      {/* Current weight */}
      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Peso actual <span className="font-normal text-gray-500">(libras)</span>
        </label>
        <input
          id="weight-current"
          type="number"
          inputMode="numeric"
          value={s.weightLb ?? ""}
          onChange={(e) => set("weightLb", e.target.value === "" ? null : Number(e.target.value))}
          placeholder="Ej: 220"
          min={80} max={600}
          className="quiz-input w-full"
        />
      </div>

      {/* Goal weight */}
      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Peso meta <span className="font-normal text-gray-500">(libras)</span>
        </label>
        <input
          id="weight-goal"
          type="number"
          inputMode="numeric"
          value={s.goalLb ?? ""}
          onChange={(e) => set("goalLb", e.target.value === "" ? null : Number(e.target.value))}
          placeholder="Ej: 160"
          min={80} max={600}
          className="quiz-input w-full"
        />
      </div>

      {/* DOB */}
      <div>
        <label className="mb-2 block font-semibold text-gray-800">Fecha de nacimiento</label>
        <input
          id="dob"
          type="date"
          value={s.dob}
          onChange={(e) => set("dob", e.target.value)}
          className="quiz-input w-full"
        />
      </div>
    </div>
  );
}

/* ── Step 2: Prior GLP-1 in past 4 weeks ── */
function Step2({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        ¿Has tomado algún medicamento para bajar de peso en las últimas 4 semanas?
      </h1>
      {(
        [
          { v: "glp1", label: "Sí, he tomado medicación GLP-1" },
          { v: "other", label: "Sí, he tomado un medicamento diferente para bajar de peso" },
          { v: "no", label: "No" },
        ] as const
      ).map(({ v, label }) => (
        <RadioOption
          key={v}
          id={`prior-glp1-${v}`}
          selected={s.priorGlp1Weeks === v}
          onClick={() => set("priorGlp1Weeks", v)}
          label={label}
        />
      ))}
    </div>
  );
}

/* ── Step 3: Weight loss program ── */
function Step3({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        ¿Alguna vez has intentado bajar de peso en un programa de manejo de peso (Jenny Craig, Weight Watchers, etc.)?
      </h1>
      {(
        [
          { v: "yes", label: "Sí" },
          { v: "no", label: "No" },
        ] as const
      ).map(({ v, label }) => (
        <RadioOption
          key={v}
          id={`weight-program-${v}`}
          selected={s.weightProgram === v}
          onClick={() => set("weightProgram", v)}
          label={label}
        />
      ))}
    </div>
  );
}

/* ── Step 4: Conditions (multi-select) ── */
function Step4({ s, set }: { s: QuizState; set: any }) {
  const toggle = (c: string) => {
    if (c === "Ninguna de las anteriores") {
      set("conditions", ["Ninguna de las anteriores"]);
      return;
    }
    const without = s.conditions.filter((x) => x !== "Ninguna de las anteriores");
    const has = without.includes(c);
    set("conditions", has ? without.filter((x) => x !== c) : [...without, c]);
  };
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        ¿Tienes alguna de estas condiciones?
      </h1>
      <p className="text-sm text-gray-500">Marca todas las que apliquen.</p>
      {CONDITIONS.map((c) => (
        <CheckboxOption
          key={c}
          id={`condition-${c.replace(/\s+/g, "-")}`}
          checked={s.conditions.includes(c)}
          onClick={() => toggle(c)}
          label={c}
        />
      ))}
    </div>
  );
}

/* ── Step 5: Blood pressure ── */
function Step5({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        ¿Cuál es tu rango de presión arterial?
      </h1>
      {BP_RANGES.map((b) => (
        <button
          key={b.id}
          id={`bp-${b.id}`}
          type="button"
          onClick={() => set("bp", b.id)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            width: "100%",
            border: s.bp === b.id ? "2px solid #2d9e6b" : "1.5px solid #e5e7eb",
            borderRadius: "0.75rem",
            padding: "0.875rem 1rem",
            backgroundColor: s.bp === b.id ? "#f0faf5" : "white",
            cursor: "pointer",
            transition: "all 120ms",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              flexShrink: 0,
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: b.color,
            }}
          />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "#1a1a2e" }}>
              {b.label}
            </div>
            <div style={{ fontSize: "0.8125rem", color: "#6b7280" }}>{b.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );
}

/* ── Step 6: Medications, allergies, pregnancy ── */
function Step6({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        Un poco más sobre tu salud
      </h1>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Medicamentos actuales <span className="font-normal text-gray-500">(opcional)</span>
        </label>
        <textarea
          id="medications"
          value={s.medications}
          onChange={(e) => set("medications", e.target.value)}
          rows={3}
          placeholder="Ej: metformina, losartán…"
          className="quiz-input w-full"
          style={{ resize: "none" }}
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">
          Alergias <span className="font-normal text-gray-500">(opcional)</span>
        </label>
        <input
          id="allergies"
          value={s.allergies}
          onChange={(e) => set("allergies", e.target.value)}
          placeholder="Ej: penicilina"
          className="quiz-input w-full"
        />
      </div>

      {s.sex === "female" && (
        <div>
          <p className="mb-3 font-semibold text-gray-800">
            ¿Estás embarazada o lactando?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { v: true, label: "Sí" },
              { v: false, label: "No" },
            ].map(({ v, label }) => (
              <button
                key={String(v)}
                id={`pregnant-${v}`}
                type="button"
                onClick={() => set("pregnant", v)}
                style={{
                  border: s.pregnant === v ? "2px solid #2d9e6b" : "1.5px solid #e5e7eb",
                  borderRadius: "0.75rem",
                  padding: "0.875rem",
                  backgroundColor: s.pregnant === v ? "#f0faf5" : "white",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 120ms",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 7: Personalization interests ── */
function Step7({ s, set }: { s: QuizState; set: any }) {
  const toggle = (interest: string) => {
    const has = s.interests.includes(interest);
    set("interests", has ? s.interests.filter((x: string) => x !== interest) : [...s.interests, interest]);
  };
  return (
    <div className="space-y-4">
      <div
        style={{
          background: "linear-gradient(135deg, #2d9e6b 0%, #1a7a50 100%)",
          borderRadius: "1rem",
          padding: "1.25rem",
          marginBottom: "1rem",
        }}
      >
        <h1 className="text-xl font-extrabold text-white leading-snug">
          ¡Tus necesidades son únicas, y tu medicamento también debería serlo!
        </h1>
        <p className="mt-1 text-sm text-green-100">
          Su medicación GLP-1 se personaliza según sus necesidades específicas.
        </p>
      </div>
      <p className="font-semibold text-gray-800">
        Por favor, seleccione las opciones que le interesen:
      </p>
      {INTERESTS.map((interest) => (
        <CheckboxOption
          key={interest}
          id={`interest-${interest.slice(0, 20).replace(/\s+/g, "-")}`}
          checked={s.interests.includes(interest)}
          onClick={() => toggle(interest)}
          label={interest}
        />
      ))}
    </div>
  );
}

/* ── Step 8: Additional info ── */
function Step8({ s, set }: { s: QuizState; set: any }) {
  return (
    <div className="space-y-5">
      <div
        style={{
          background: "#f0faf5",
          borderRadius: "0.75rem",
          padding: "1rem",
          borderLeft: "4px solid #2d9e6b",
        }}
      >
        <p className="text-sm text-gray-700 font-medium">
          Los proveedores médicos de DOKTAP revisan cada formulario en un plazo de 24 horas.
        </p>
      </div>
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        ¿Tiene alguna otra información que le gustaría que nuestro equipo médico supiera?
      </h1>
      {(
        [
          { v: "yes", label: "Sí" },
          { v: "no", label: "No" },
        ] as const
      ).map(({ v, label }) => (
        <RadioOption
          key={v}
          id={`additional-info-${v}`}
          selected={s.hasAdditionalInfo === v}
          onClick={() => set("hasAdditionalInfo", v)}
          label={label}
        />
      ))}
      {s.hasAdditionalInfo === "yes" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">
            Comparte lo que necesites:
          </label>
          <textarea
            id="additional-info-text"
            value={s.additionalInfo}
            onChange={(e) => set("additionalInfo", e.target.value)}
            rows={4}
            placeholder="Escribe aquí cualquier información adicional…"
            className="quiz-input w-full"
            style={{ resize: "none" }}
          />
        </div>
      )}
    </div>
  );
}

/* ── Step 9: Medical review summary + name/state form ── */
function Step9({
  s,
  set,
  bmi,
  currentKg,
  goalKg,
  weeksToGoal,
  successPct,
  canNext,
  onNext,
}: {
  s: QuizState;
  set: any;
  bmi: number;
  currentKg: number;
  goalKg: number;
  weeksToGoal: number;
  successPct: number;
  canNext: boolean;
  onNext: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Completion badge */}
      <div
        style={{
          background: "#f0faf5",
          border: "1px solid #bbf0d6",
          borderRadius: "0.75rem",
          padding: "0.875rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}
      >
        <CheckCircle2 className="size-5 text-green-600 shrink-0" />
        <div>
          <p className="font-semibold text-green-800 text-sm">Evaluación completada</p>
          <p className="text-xs text-green-700">
            ¡Felicidades! Eres un buen candidato para un tratamiento médico de pérdida de peso.
          </p>
        </div>
      </div>

      {/* Medical review card */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "1.25rem",
          backgroundColor: "white",
        }}
      >
        <h2 className="text-center font-bold text-lg mb-4" style={{ color: "#1a1a2e" }}>
          Su revisión médica
        </h2>

        {/* Success rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-gray-600">Probabilidad de éxito</span>
            <span className="font-bold text-lg" style={{ color: "#2d9e6b" }}>
              {successPct}%
            </span>
          </div>
          <div
            style={{
              height: "8px",
              borderRadius: "9999px",
              backgroundColor: "#e5e7eb",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${successPct}%`,
                backgroundColor: "#2d9e6b",
                borderRadius: "9999px",
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            border: "1px solid #e5e7eb",
            borderRadius: "0.75rem",
            overflow: "hidden",
          }}
        >
          {[
            { icon: "🏃", label: "IMC", value: bmi.toFixed(1) },
            { icon: "⚖️", label: "Peso actual", value: `${s.weightLb} libras` },
            {
              icon: "🎯",
              label: "Peso objetivo",
              value: `${s.goalLb} libras en ${weeksToGoal} semanas`,
            },
          ].map((item, i, arr) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.75rem 1rem",
                borderBottom: i < arr.length - 1 ? "1px solid #e5e7eb" : "none",
              }}
            >
              <span style={{ fontSize: "1.125rem" }}>{item.icon}</span>
              <div style={{ flex: 1 }}>
                <span className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>
                  {item.label}:
                </span>{" "}
                <span className="text-sm text-gray-700">{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-sm">
          <span className="font-bold" style={{ color: "#2d9e6b" }}>
            Usted es un buen candidato
          </span>{" "}
          para un tratamiento médico de pérdida de peso.
        </p>
      </div>

      {/* Name + state form */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "1rem",
          padding: "1.25rem",
          backgroundColor: "white",
        }}
      >
        <h2 className="font-bold text-base mb-4" style={{ color: "#1a1a2e" }}>
          Procedamos a comprobar si cumple los requisitos.
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="mb-1 block text-sm text-gray-600">Nombre de pila</label>
            <input
              id="first-name"
              value={s.firstName}
              onChange={(e) => set("firstName", e.target.value)}
              className="quiz-input w-full"
              placeholder="Juan"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-600">Apellido</label>
            <input
              id="last-name"
              value={s.lastName}
              onChange={(e) => set("lastName", e.target.value)}
              className="quiz-input w-full"
              placeholder="Pérez"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm text-gray-600">
            ¿A qué estado se enviarán sus medicamentos?
          </label>
          <div className="relative">
            <select
              id="ship-state"
              value={s.shipState}
              onChange={(e) => set("shipState", e.target.value)}
              className="quiz-input w-full appearance-none pr-10"
              style={{ color: s.shipState ? "#1a1a2e" : "#9ca3af" }}
            >
              <option value="">Seleccione un estado...</option>
              {US_STATES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
              {RD_PROVINCES.map((p) => (
                <option key={p} value={p}>{p} (RD)</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
          <ShieldCheck className="size-4 shrink-0" style={{ color: "#2d9e6b" }} />
          Su información nunca se comparte y está protegida por la ley HIPAA.
        </div>

        <button
          onClick={onNext}
          disabled={!canNext}
          className="quiz-btn-primary w-full"
          id="summary-next"
        >
          Siguiente <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}

/* ── Step 10: Contact info ── */
function Step10({ s, set, firstName }: { s: QuizState; set: any; firstName: string }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold leading-snug" style={{ color: "#1a1a2e" }}>
        {firstName ? (
          <>
            <span style={{ color: "#2d9e6b" }}>{firstName}</span>,{" "}
          </>
        ) : null}
        ¿cómo podemos contactarte si es necesario?
      </h1>
      <p className="text-sm text-gray-500">
        Nuestro equipo médico y farmacia usan email y teléfono para comunicarse contigo.
      </p>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">Email</label>
        <input
          id="email"
          type="email"
          inputMode="email"
          value={s.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="hola@ejemplo.com"
          className="quiz-input w-full"
        />
      </div>

      <div>
        <label className="mb-2 block font-semibold text-gray-800">Número de teléfono</label>
        <input
          id="phone"
          type="tel"
          inputMode="tel"
          value={s.phone}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="+1 (555) 555-5555"
          className="quiz-input w-full"
        />
      </div>

      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.75rem",
          cursor: "pointer",
        }}
      >
        <input
          id="terms"
          type="checkbox"
          checked={s.termsAccepted}
          onChange={(e) => set("termsAccepted", e.target.checked)}
          style={{ marginTop: "2px", accentColor: "#2d9e6b", flexShrink: 0 }}
        />
        <span className="text-xs text-gray-600 leading-relaxed">
          Entiendo que mi información nunca se comparte, está protegida por HIPAA y acepto los{" "}
          <strong>términos</strong> y <strong>políticas de privacidad</strong>, y a ser
          contactado por DOKTAP y sus socios médicos según sea necesario y puedo cancelar en
          cualquier momento.
        </span>
      </label>

      {/* Trustpilot badge */}
      <div className="flex items-center justify-center gap-2 pt-2">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 1rem",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
          }}
        >
          <span className="text-sm font-bold text-gray-700">Trustpilot</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Star key={i} className="size-3.5 fill-green-500 text-green-500" strokeWidth={0} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Step 11: Treatment & Plan selection ── */
function Step11({
  s,
  set,
  loading,
  canSubmit,
  onSubmit,
}: {
  s: QuizState;
  set: any;
  loading: boolean;
  canSubmit: boolean;
  onSubmit: () => void;
}) {
  const plans = [
    {
      id: "1m",
      label: "Plan Mensual",
      weeks: "4 Semanas de suministro",
      price: 399,
      originalPrice: 446,
      savings: null,
      badge: null,
      installments: false,
      highlight: false,
    },
    {
      id: "3m",
      label: "Plan 3 Meses",
      weeks: "12 Semanas de suministro",
      price: 289,
      originalPrice: 446,
      savings: 287,
      badge: "Más Popular",
      badgeColor: "#3b82f6",
      installments: true,
      highlight: true,
    },
    {
      id: "6m",
      label: "Plan 6 Meses",
      weeks: "24 Semanas de suministro",
      price: 259,
      originalPrice: 446,
      savings: 773,
      badge: null,
      installments: true,
      highlight: false,
    },
    {
      id: "12m",
      label: "Plan 12 Meses",
      weeks: "48 Semanas de suministro",
      price: 249,
      originalPrice: 446,
      savings: 1548,
      badge: "Mejor Oferta",
      badgeColor: "#ef4444",
      installments: true,
      highlight: true,
    },
  ] as const;

  const features = [
    "Medicación GLP-1 incluida",
    "Sin seguro requerido",
    "Revisión de médico certificado",
    "Asesoramiento gratuito",
    "Consulta virtual ilimitada",
    "11 meses de garantía",
  ];

  return (
    <div className="space-y-5">
      {/* Timer */}
      <div
        style={{
          background: "linear-gradient(135deg, #2d9e6b 0%, #1a7a50 100%)",
          borderRadius: "0.75rem",
          padding: "0.75rem 1rem",
          textAlign: "center",
        }}
      >
        <p className="text-white text-sm font-semibold">
          Su lugar está reservado por 10:11 ⏱
        </p>
      </div>

      <div className="text-center">
        <h1 className="text-xl font-extrabold" style={{ color: "#1a1a2e" }}>
          Mismo Precio. Todos los Niveles de Dosis.
        </h1>
        <p className="text-xs text-gray-500 mt-1">Sin cargos ocultos. Todo incluido.</p>
      </div>

      {/* Step 1 – Treatment */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Paso 1 — Seleccionar Tratamiento
        </p>
        {[
          {
            id: "semaglutide",
            name: "Semaglutide Verano",
            desc: "Probado, efectivo, más asequible.",
            tag: "Más Asequible",
            tagColor: "#2d9e6b",
          },
          {
            id: "tirzepatide",
            name: "Tirzepatide Verano",
            desc: "Más rápido, más efectivo, mejores resultados.",
            tag: "Resultados más Rápidos",
            tagColor: "#7c3aed",
          },
        ].map((t) => (
          <button
            key={t.id}
            id={`treatment-${t.id}`}
            type="button"
            onClick={() => set("treatment", t.id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.875rem",
              width: "100%",
              border: s.treatment === t.id ? "2px solid #2d9e6b" : "1.5px solid #e5e7eb",
              borderRadius: "0.75rem",
              padding: "0.875rem 1rem",
              backgroundColor: s.treatment === t.id ? "#f0faf5" : "white",
              cursor: "pointer",
              transition: "all 120ms",
              marginBottom: "0.5rem",
              textAlign: "left",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "0.5rem",
                background: "#e5e7eb",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
              }}
            >
              💉
            </div>
            <div style={{ flex: 1 }}>
              <p className="font-semibold text-sm" style={{ color: "#1a1a2e" }}>
                {t.name}
              </p>
              <p className="text-xs text-gray-500">{t.desc}</p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "0.25rem",
                  fontSize: "0.6875rem",
                  fontWeight: 600,
                  color: t.tagColor,
                  backgroundColor: `${t.tagColor}15`,
                  borderRadius: "9999px",
                  padding: "0.125rem 0.5rem",
                }}
              >
                {t.tag}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Step 2 – Plan */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
          Paso 2 — Seleccionar Plan
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Seleccionando plan a largo plazo con nuestros socios, puedes financiar o pagar en su totalidad con tu plan.
        </p>

        {plans.map((plan) => (
          <button
            key={plan.id}
            id={`plan-${plan.id}`}
            type="button"
            onClick={() => set("plan", plan.id)}
            style={{
              display: "block",
              width: "100%",
              border: s.plan === plan.id
                ? "2px solid #2d9e6b"
                : plan.highlight
                ? "2px solid #d1d5db"
                : "1.5px solid #e5e7eb",
              borderRadius: "0.875rem",
              padding: "1rem",
              backgroundColor: s.plan === plan.id ? "#f0faf5" : "white",
              cursor: "pointer",
              transition: "all 120ms",
              marginBottom: "0.625rem",
              textAlign: "left",
              position: "relative",
            }}
          >
            {plan.badge && (
              <span
                style={{
                  position: "absolute",
                  top: "-1px",
                  right: "1rem",
                  backgroundColor: (plan as any).badgeColor || "#2d9e6b",
                  color: "white",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  padding: "0.2rem 0.625rem",
                  borderRadius: "0 0 0.5rem 0.5rem",
                }}
              >
                {plan.badge}
              </span>
            )}
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-sm" style={{ color: "#1a1a2e" }}>
                  {plan.label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{plan.weeks}</p>
                {plan.installments && (
                  <p className="text-xs mt-0.5" style={{ color: "#2d9e6b" }}>
                    ✓ Cuotas mensuales fáciles de 0%
                  </p>
                )}
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  className="font-extrabold text-base"
                  style={{ color: "#1a1a2e" }}
                >
                  ${plan.price}/mes
                </p>
                <p className="text-xs line-through text-gray-400">
                  ${plan.originalPrice}
                </p>
              </div>
            </div>
            {plan.savings && (
              <div
                style={{
                  marginTop: "0.5rem",
                  backgroundColor: "#f0faf5",
                  borderRadius: "0.375rem",
                  padding: "0.25rem 0.5rem",
                  fontSize: "0.75rem",
                  color: "#2d9e6b",
                  fontWeight: 600,
                }}
              >
                ✓ Estás ahorrando ${plan.savings}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Features */}
      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.875rem",
          padding: "1rem",
        }}
      >
        <p className="font-semibold text-sm mb-3" style={{ color: "#1a1a2e" }}>
          Todos los planes incluyen:
        </p>
        <div className="space-y-2">
          {features.map((f) => (
            <div key={f} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 shrink-0" style={{ color: "#2d9e6b" }} />
              <span className="text-sm text-gray-700">{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div>
        <p className="font-bold text-sm mb-2" style={{ color: "#1a1a2e" }}>
          Cómo funciona:
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Cada mes recibirás una dosis para un mes. Tu proveedor ajustará tu dosis mensualmente para
          asegurarse de que estás en la dosis correcta para ti, ayudándote a perder peso de forma
          segura y eficaz.
        </p>
      </div>

      {/* HSA badge */}
      <div className="flex items-center gap-2">
        <CheckCircle2 className="size-4 text-green-500" />
        <span className="text-sm font-semibold text-gray-700">Elegible para HSA/FSA</span>
      </div>

      {/* Payment logos */}
      <div>
        <p className="text-xs text-gray-500 mb-2">
          Se aceptan todas las principales tarjetas de crédito:
        </p>
        <div className="flex gap-2 flex-wrap">
          {["VISA", "MC", "AMEX", "Discover"].map((card) => (
            <span
              key={card}
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "0.375rem",
                padding: "0.25rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#374151",
              }}
            >
              {card}
            </span>
          ))}
        </div>
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className="quiz-btn-primary w-full"
        id="quiz-submit"
        style={{ marginTop: "1rem" }}
      >
        {loading ? (
          "Enviando…"
        ) : (
          <>
            <User className="size-5" />
            Verificar elegibilidad
          </>
        )}
      </button>

      <p className="text-center text-xs text-gray-400">
        Comprar ahora, pagar después:{" "}
        <span className="font-bold text-gray-600">Klarna</span>
      </p>
    </div>
  );
}

/* ── Thank You ── */
function ThankYou({ navigate }: { navigate: any }) {
  return (
    <div className="min-h-screen bg-white font-sans">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-lg items-center justify-between">
          <span className="font-display text-2xl font-extrabold tracking-tight" style={{ color: "#1a1a2e" }}>
            DOK<span style={{ color: "#2d9e6b" }}>TAP</span>
          </span>
          <TrustBadge />
        </div>
      </header>
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "#f0faf5",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto",
          }}
        >
          <CheckCircle2 className="size-8" style={{ color: "#2d9e6b" }} />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold" style={{ color: "#1a1a2e" }}>
          ¡Gracias!
        </h1>
        <p className="mt-3 text-gray-500">
          Recibimos tu evaluación. Un médico de DOKTAP revisará tu caso en las próximas{" "}
          <strong>24 horas</strong> y te contactará por email o teléfono.
        </p>
        <button
          onClick={() => navigate({ to: "/" })}
          className="quiz-btn-primary mt-8"
          id="thankyou-home"
        >
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
