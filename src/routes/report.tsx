import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { getLead, type Lead } from "@/lib/lead-store";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/report")({
  head: () => ({
    meta: [{ title: "Your audit — scorvio.ai" }],
  }),
  component: ReportPage,
});

const SECTIONS = [
  { title: "SEO & Discoverability", score: 42, status: "warn", summary: "Missing meta descriptions on 14 pages. Slow indexing on key money pages." },
  { title: "Site Speed & UX", score: 58, status: "warn", summary: "LCP 4.1s on mobile. Hero image 2.3MB. Bounce rate 64% on the pricing page." },
  { title: "Local Presence", score: 71, status: "ok", summary: "Google Business solid. Missing Apple Maps + 3 directory listings." },
  { title: "Reviews & Reputation", score: 34, status: "bad", summary: "4.1★ avg but 6 unanswered 1-star reviews in last 90 days." },
  { title: "Conversion & Funnel", score: 29, status: "bad", summary: "No clear CTA above the fold. Contact form has 9 fields (industry avg: 4)." },
  { title: "Competitor Gap", score: 51, status: "warn", summary: "Top 3 local competitors rank for 47 keywords you don't. Est. lost traffic: 1,800/mo." },
];

function ReportPage() {
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    const l = getLead();
    if (!l?.plan) {
      navigate({ to: "/waitlist" });
      return;
    }
    setLead(l);
  }, [navigate]);

  if (!lead) return null;

  const isPaid = lead.plan === "paid";
  const overall = 48;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/"><Logo /></Link>
          {!isPaid && (
            <Button size="sm" className="font-semibold">Unlock full report — $97</Button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-2 text-sm font-medium text-muted-foreground">Audit report for</div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{lead.business}</h1>
        <p className="text-muted-foreground">{lead.city}, {lead.state}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center rounded-2xl border border-border bg-card p-8">
          <ScoreRing score={overall} />
          <div>
            <div className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overall Scale Score</div>
            <h2 className="mt-1 text-2xl font-bold">You&apos;re leaving money on the table.</h2>
            <p className="mt-2 text-muted-foreground">
              Your business scores below the local average of <span className="font-semibold text-foreground">67</span>. We found <span className="font-semibold text-foreground">12 high-impact fixes</span> projected to lift inbound leads by ~38% in 30 days.
            </p>
          </div>
        </div>

        <div className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="text-2xl font-bold tracking-tight">Breakdown</h2>
            {!isPaid && (
              <p className="text-sm text-muted-foreground">Showing 2 of 6 sections</p>
            )}
          </div>

          <div className="grid gap-4">
            {SECTIONS.map((s, i) => {
              const blurred = isPaid ? false : i >= 2;
              return (
                <ReportSection key={s.title} section={s} blurred={blurred} />
              );
            })}
          </div>
        </div>

        {!isPaid && (
          <div className="mt-12 rounded-2xl border border-accent/40 bg-card p-8 text-center">
            <Lock className="mx-auto h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-bold">Want the rest of the report + your 30-day plan?</h3>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              Unlock all 6 sections, prioritized fixes, competitor breakdown, and a 1:1 strategy call.
            </p>
            <Button size="lg" className="mt-6 h-14 px-8 text-base font-semibold">
              Upgrade to Pro — $97
            </Button>
          </div>
        )}

        {isPaid && (
          <div className="mt-12 rounded-2xl border border-accent/40 bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-8 w-8 text-accent" />
            <h3 className="mt-4 text-2xl font-bold">Your 30-day plan is being generated.</h3>
            <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
              We&apos;ll email it to {lead.email} within 24 hours, plus a link to book your strategy call.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={r} stroke="var(--color-muted)" strokeWidth="10" fill="none" />
        <circle
          cx="60" cy="60" r={r}
          stroke="var(--color-accent)"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold">{score}</span>
        <span className="text-xs font-medium text-muted-foreground">/ 100</span>
      </div>
    </div>
  );
}

function ReportSection({
  section,
  blurred,
}: {
  section: (typeof SECTIONS)[number];
  blurred: boolean;
}) {
  const Icon =
    section.status === "bad" ? AlertTriangle : section.status === "warn" ? TrendingUp : CheckCircle2;
  const color =
    section.status === "bad" ? "text-destructive" : section.status === "warn" ? "text-accent" : "text-emerald-600";

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-6">
      <div className={blurred ? "select-none blur-md" : ""}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Icon className={`mt-0.5 h-5 w-5 ${color}`} />
            <div>
              <h3 className="font-semibold">{section.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{section.summary}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{section.score}</div>
            <div className="text-xs text-muted-foreground">/ 100</div>
          </div>
        </div>
      </div>
      {blurred && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/40">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium shadow-sm">
            <Lock className="h-4 w-4" /> Locked
          </div>
        </div>
      )}
    </div>
  );
}