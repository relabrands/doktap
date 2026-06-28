import { Link } from "@tanstack/react-router";
import { Star } from "lucide-react";

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <Link
      to="/"
      className={`font-display text-2xl font-extrabold tracking-tight text-ink ${className}`}
      aria-label="DOKTAP inicio"
    >
      DOK<span className="text-primary">TAP</span>
    </Link>
  );
}

export function TrustBadge() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="font-semibold text-ink">Excelente 4.8</span>
      <span className="flex items-center gap-0.5 rounded-md bg-[oklch(0.7_0.18_150)] px-1.5 py-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star key={i} className="size-3 fill-white text-white" strokeWidth={0} />
        ))}
      </span>
    </div>
  );
}

export function QuizHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Wordmark />
        <TrustBadge />
      </div>
    </header>
  );
}
