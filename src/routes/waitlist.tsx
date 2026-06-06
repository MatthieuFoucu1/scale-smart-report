import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Lock, ArrowRight } from "lucide-react";
import { getLead, saveLead, type Lead } from "@/lib/lead-store";

export const Route = createFileRoute("/waitlist")({
  head: () => ({
    meta: [{ title: "You're on the list — ScaleAudit" }],
  }),
  component: WaitlistPage,
});

function WaitlistPage() {
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    const l = getLead();
    if (!l?.business) {
      navigate({ to: "/signup" });
      return;
    }
    setLead(l);
  }, [navigate]);

  function choose(plan: "free" | "paid") {
    saveLead({ plan });
    navigate({ to: "/report" });
  }

  if (!lead) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary" />
          <span className="text-lg font-semibold tracking-tight">ScaleAudit</span>
        </Link>
      </header>

      <main className="mx-auto max-w-2xl px-6 pb-20 pt-8 text-center">
        <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="h-7 w-7" />
        </div>
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          You&apos;re in, {lead.name.split(" ")[0]}.
        </h1>
        <p className="mt-4 text-balance text-lg text-muted-foreground">
          We&apos;re prepping the audit for <span className="font-semibold text-foreground">{lead.business}</span> in {lead.city}, {lead.state}. Pick how you want to receive it.
        </p>

        {!showPlans ? (
          <Button size="lg" className="mt-10 h-14 px-8 text-base font-semibold" onClick={() => setShowPlans(true)}>
            Choose my plan <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        ) : (
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
            <PlanCard
              name="Free"
              price="$0"
              tagline="Get a taste of what's broken."
              features={["Overall score", "Top 3 issues visible", "Rest of report blurred"]}
              cta="Continue free"
              onClick={() => choose("free")}
              variant="outline"
            />
            <PlanCard
              name="Pro"
              price="$97"
              tagline="The full audit + 30-day plan."
              features={["Full unblurred report", "Prioritized 30-day plan", "Competitor benchmark", "1:1 strategy call"]}
              cta="Upgrade to Pro"
              onClick={() => choose("paid")}
              variant="primary"
              highlight
            />
          </div>
        )}
      </main>
    </div>
  );
}

function PlanCard({
  name,
  price,
  tagline,
  features,
  cta,
  onClick,
  variant,
  highlight,
}: {
  name: string;
  price: string;
  tagline: string;
  features: string[];
  cta: string;
  onClick: () => void;
  variant: "outline" | "primary";
  highlight?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl border p-6 ${
        highlight ? "border-accent bg-card shadow-lg" : "border-border bg-card"
      }`}
    >
      {highlight && (
        <div className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="h-3 w-3" /> Most chosen
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
      <Button
        onClick={onClick}
        variant={variant === "primary" ? "default" : "outline"}
        className="mt-6 h-11 w-full font-semibold"
      >
        {cta}
      </Button>
      {variant === "outline" && (
        <p className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Partial report only
        </p>
      )}
    </div>
  );
}