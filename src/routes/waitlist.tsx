import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Mail } from "lucide-react";
import { getLead, type Lead } from "@/lib/lead-store";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [{ title: "You're on the list — scorvio.ai" }],
  }),
  component: WaitlistPage,
});

function WaitlistPage() {
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);

  useEffect(() => {
    const l = getLead();
    if (!l?.business) {
      navigate({ to: "/signup" });
      return;
    }
    setLead(l);
  }, [navigate]);

  if (!lead) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/login">
          <Button variant="ghost" size="sm">Log in</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20 pt-8 text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          You&apos;re on the list, {lead.name.split(" ")[0]}.
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">
          We&apos;ll email <span className="font-semibold text-foreground">{lead.email}</span> the moment your audit for{" "}
          <span className="font-semibold text-foreground">{lead.business}</span> ({lead.city}, {lead.state}) is ready.
        </p>

        <div className="mt-10 grid gap-4 text-left sm:grid-cols-2">
          <PlanCard
            name="Free"
            price="$0"
            tagline="The basic audit when we launch."
            features={["Overall Scale Score", "Top 3 issues visible", "Rest of the report locked"]}
            badge="You're here"
          />
          <PlanCard
            name="Pro"
            price="$50"
            tagline="Full audit + 30-day scale plan."
            features={["Full unblurred report", "Prioritized 30-day plan", "Competitor benchmark", "1:1 strategy call"]}
            badge="Skip the line"
            highlight
          />
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Mail className="h-4 w-4 text-accent" />
          You&apos;ll be able to upgrade to Pro from your account at launch.
        </div>
      </main>
    </div>
  );
}

function PlanCard({
  name,
  price,
  tagline,
  features,
  badge,
  highlight,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        highlight ? "border-accent bg-card shadow-lg" : "border-border bg-card"
      }`}
    >
      {badge && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="h-3 w-3" /> {badge}
        </div>
      )}
      <div className="flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">{name}</h3>
        <span className="text-2xl font-bold">{price}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{tagline}</p>
      <ul className="mt-5 space-y-2 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}