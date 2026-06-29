import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Wordmark } from "@/components/Brand";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Portal médico — DOKTAP" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate({ to: "/dashboard" });
      }
    });
    return () => unsub();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, pwd);
        navigate({ to: "/dashboard" });
      } else {
        await createUserWithEmailAndPassword(auth, email, pwd);
        setInfo("Cuenta creada. Pídele a un admin que te asigne el rol de doctor o administrador.");
      }
    } catch (e: any) {
      setErr(e.message || "Error de autenticación");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Wordmark />
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Inicio</Link>
        </div>
      </header>
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="card-soft p-6">
          <h1 className="text-2xl font-extrabold">Portal médico</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "login" ? "Inicia sesión para acceder al dashboard." : "Crea tu cuenta."}
          </p>
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-sm font-semibold">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold">Contraseña</label>
              <input type="password" required minLength={6} value={pwd} onChange={(e) => setPwd(e.target.value)}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-base focus:border-primary focus:outline-none" />
            </div>
            {err && <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{err}</p>}
            {info && <p className="rounded-md bg-primary-soft p-3 text-sm">{info}</p>}
            <button disabled={loading} className="btn-primary w-full">
              {loading ? "…" : mode === "login" ? "Entrar" : "Crear cuenta"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="mt-4 text-sm text-primary hover:underline"
          >
            {mode === "login" ? "¿Eres nuevo? Crea tu cuenta" : "Ya tengo cuenta"}
          </button>
        </div>
      </div>
    </div>
  );
}
