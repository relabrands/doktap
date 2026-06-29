import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, ShieldCheck, Stethoscope, Truck, Star } from "lucide-react";
import { Wordmark, TrustBadge } from "@/components/Brand";
import heroTirzepatide from "@/assets/hero-tirzepatide.png";
import testi1 from "@/assets/testimonial-1.jpg";
import testi2 from "@/assets/testimonial-2.jpg";
import testi3 from "@/assets/testimonial-3.jpg";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DOKTAP — Pierde peso con GLP-1 en República Dominicana" },
      { name: "description", content: "Atención médica personalizada y medicación GLP-1, entregada en tu casa. Evaluación gratis en 3 minutos." },
      { property: "og:title", content: "DOKTAP — GLP-1 en RD" },
      { property: "og:description", content: "Pierde 1.7 a 2.3 kg por semana con cuidado médico real. Sin dietas restrictivas." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <Hero />
      <Strip />
      <Testimonials />
      <Brand />
      <Stats />
      <HowItWorks />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Wordmark />
        <div className="flex items-center gap-3">
          <TrustBadge />
          <Link to="/quiz" className="btn-primary hidden text-sm sm:inline-flex">
            Empezar
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 md:grid-cols-2 md:py-20">
        <div>
          <span className="chip-soft">Para adultos en República Dominicana</span>
          <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] sm:text-5xl md:text-6xl">
            Por fin, en serio.{" "}
            <span className="text-primary">Pierde peso</span> con{" "}
            <span style={{ color: "#7c3aed" }}>Tirzepatide</span> y cuidado médico real.
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            <strong>Tirzepatide</strong> — el agonista dual GIP/GLP-1 más avanzado para pérdida de peso.
            Evaluación gratis en 3 minutos. Un doctor licenciado revisa tu caso y te lo envía a casa.
          </p>
          <div className="mt-7">
            <Link to="/quiz" className="btn-primary text-base">
              Empieza tu evaluación gratis <ArrowRight className="size-5" />
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>⏱️ ~3 minutos</span>
              <span className="text-gray-300">|</span>
              <span>🩺 Revisión médica</span>
              <span className="text-gray-300">|</span>
              <span>🇩🇴 Entrega nacional</span>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Cuidado médico licenciado
            </div>
            <div className="flex items-center gap-1.5">
              <Truck className="size-4 text-primary" /> Envíos en RD
            </div>
            <div className="flex items-center gap-1.5">
              <Star className="size-4 text-primary" /> 4.8/5 promedio
            </div>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-8 -z-10 rounded-[3rem] bg-primary-soft/60 blur-2xl" />
          <img
            src={heroTirzepatide}
            alt="Pluma de Tirzepatide — medicamento GLP-1 para pérdida de peso"
            width={1024}
            height={1024}
            className="mx-auto aspect-square w-full max-w-md rounded-3xl object-cover shadow-card"
          />
          <p className="mt-2 text-center text-[11px] text-gray-400 italic">
            Imagen de referencia — el producto puede variar según la presentación asignada por su médico.
          </p>
        </div>
      </div>
    </section>
  );
}

function Strip() {
  const items = [
    { label: "Plan Mensual", sub: "1 mes de suministro", icon: "💉", color: "#2d9e6b" },
    { label: "Plan Trimestral", sub: "3 meses de suministro", icon: "📅", color: "#7c3aed" },
    { label: "Plan Semestral", sub: "6 meses de suministro", icon: "🏆", color: "#d97706" },
    { label: "Plan Anual", sub: "12 meses + seguimiento", icon: "⭐", color: "#dc2626" },
  ];
  return (
    <section className="border-y border-border bg-background py-10">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Planes de Tirzepatide disponibles
        </h2>
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          {items.map((i) => (
            <div key={i.label} className="card-soft p-4 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-gray-50 text-2xl">{i.icon}</div>
              <div className="font-bold text-sm" style={{ color: i.color }}>{i.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{i.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    { img: testi1, name: "María, 42", text: "Bajé 14 kg en 4 meses. Mi doctora me escribió por WhatsApp todas las semanas." },
    { img: testi2, name: "Rafael, 51", text: "Probé todo y nada me funcionaba. Con DOKTAP la balanza por fin se movió." },
    { img: testi3, name: "Yulissa, 35", text: "Sin pasar hambre. Lo más cómodo: me llega a casa en Santo Domingo." },
  ];
  return (
    <section className="bg-cream py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
          Pacientes reales en RD
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
          Resultados promediados a los 3–6 meses con cuidado médico continuo.
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {items.map((t) => (
            <figure key={t.name} className="card-soft overflow-hidden">
              <img src={t.img} alt={t.name} width={768} height={960} loading="lazy" className="aspect-[4/5] w-full object-cover" />
              <figcaption className="p-5">
                <div className="flex items-center gap-1 text-primary">
                  {[0,1,2,3,4].map(i => <Star key={i} className="size-4 fill-current" strokeWidth={0} />)}
                </div>
                <p className="mt-2 text-sm">"{t.text}"</p>
                <p className="mt-3 text-xs font-semibold text-muted-foreground">{t.name}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Brand() {
  return (
    <section className="bg-background py-20 text-center">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-3xl font-extrabold leading-tight sm:text-5xl">
          "Cuando nada más funcionaba…{" "}
          <span className="text-primary">¡DOKTAP sí!</span>"
        </p>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { v: "18%", l: "peso perdido promedio" },
    { v: "9/10", l: "lo recomiendan" },
    { v: "6.5", l: "meses al peso meta" },
    { v: "93%", l: "satisfacción" },
  ];
  return (
    <section className="bg-primary-soft/40 py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.v} className="rounded-2xl bg-card p-5 text-center shadow-soft">
            <div className="font-display text-3xl font-extrabold text-primary">{s.v}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Stethoscope, t: "Evaluación gratis", d: "3 minutos. Cuéntanos tu salud y meta." },
    { icon: CheckCircle2, t: "Receta médica", d: "Un doctor revisa tu caso y aprueba el plan." },
    { icon: Truck, t: "Entrega en RD", d: "Recibe la medicación en tu casa cada mes." },
  ];
  return (
    <section className="bg-background py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Cómo funciona</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="card-soft p-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary">
                  <s.icon className="size-5" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Paso {i + 1}</span>
              </div>
              <h3 className="mt-3 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/quiz" className="btn-primary">Empezar mi evaluación <ArrowRight className="size-5" /></Link>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "¿Qué es el Tirzepatide?", a: "Tirzepatide es el medicamento GLP-1/GIP de última generación para pérdida de peso. Es un agonista dual aprobado internacionalmente que actúa sobre dos receptores hormonales, logrando mejores resultados que las generaciones anteriores. En DOKTAP siempre lo receta un doctor licenciado tras revisar tu historial." },
    { q: "¿Cuánto cuesta?", a: "El precio depende del plan y dosis. Después de tu evaluación gratis te enviamos opciones. No pagas nada por la evaluación." },
    { q: "¿Necesito ir a un consultorio?", a: "No. Todo es por video o WhatsApp. El Tirzepatide llega a tu casa en cualquier provincia de RD." },
    { q: "¿Cuánto peso voy a perder?", a: "En estudios clínicos, Tirzepatide logró hasta un 22% de reducción de peso corporal. Tu doctor ajusta el plan según tu progreso." },
    { q: "¿Hay efectos secundarios?", a: "Los más comunes son náuseas leves al inicio. Tu doctor te explica cómo manejarlos y ajusta la dosis si es necesario." },
  ];
  return (
    <section className="bg-cream py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">Preguntas frecuentes</h2>
        <Accordion type="single" collapsible className="mt-8">
          {items.map((it, i) => (
            <AccordionItem key={i} value={`it-${i}`} className="rounded-xl border border-border bg-card px-4 my-2">
              <AccordionTrigger className="text-left text-base font-semibold">{it.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{it.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-extrabold sm:text-4xl">¿Listo para empezar?</h2>
        <p className="mt-3 opacity-90">Tu evaluación es gratis y solo toma 3 minutos.</p>
        <Link to="/quiz" className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 font-bold text-primary shadow-soft hover:brightness-95">
          Empieza ahora <ArrowRight className="size-5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-background text-sm text-muted-foreground">
      {/* Licensed doctors + CDB trust band */}
      <div
        style={{
          background: "linear-gradient(135deg, #f0faf5 0%, #e8f7f1 100%)",
          borderBottom: "1px solid #d1ead8",
          padding: "1.25rem 1rem",
        }}
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 md:flex-row md:items-center md:justify-between">
          {/* Licensed doctors badge */}
          <div className="flex items-center gap-3">
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "#2d9e6b",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <ShieldCheck className="size-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm" style={{ color: "#1a1a2e" }}>
                Medicación asignada por doctores con licencia
              </p>
              <p className="text-xs" style={{ color: "#4b7a5e" }}>
                Cada prescripción es revisada y firmada por un médico certificado
                antes de ser enviada.
              </p>
            </div>
          </div>

          {/* CDB Partner */}
          <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <p className="text-xs font-semibold" style={{ color: "#4b7a5e" }}>
                Operamos bajo la confianza de
              </p>
            </div>
            <a
              href="https://centrodiagnosticobonaire.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Centro Diagnóstico Bonaire"
            >
              <img
                src="https://centrodiagnosticobonaire.com/wp-content/uploads/2024/01/logo-cdb-copy.png"
                alt="Centro Diagnóstico Bonaire"
                style={{ height: "40px", width: "auto", objectFit: "contain" }}
                loading="lazy"
              />
            </a>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-8 md:flex-row md:items-center md:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 max-w-md text-xs">
            DOKTAP no es un servicio de emergencia. Si presentas una emergencia
            médica, llama al 9-1-1. Información solo educativa, no sustituye una
            consulta médica.
          </p>
        </div>
        <div className="flex gap-5 text-xs">
          <a href="#" className="hover:text-foreground">Privacidad</a>
          <a href="#" className="hover:text-foreground">Términos</a>
          <Link to="/auth" className="hover:text-foreground">Portal médico</Link>
        </div>
      </div>
    </footer>
  );
}
