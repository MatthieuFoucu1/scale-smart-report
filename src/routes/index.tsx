import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, BarChart3, Search, Zap, Database } from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "scorvio.ai — The 60-second internet audit that shows you exactly how to grow" },
      { name: "description", content: "Get a brutally honest audit of your business's online presence — and a step-by-step plan to scale. Built for operators who want results, not fluff." },
      { property: "og:title", content: "scorvio.ai — Find the leaks. Fix them. Scale." },
      { property: "og:description", content: "Your free internet audit + scale plan. See what's costing you customers in 60 seconds." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <Link to="/signup">
          <Button variant="ghost" size="sm">Get my audit</Button>
        </Link>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-16 pt-16 text-center sm:pt-24">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Free for the first 100 businesses this month
        </div>
        <h1 className="text-balance text-5xl font-bold tracking-tight sm:text-7xl">
          Find out exactly why your business <span className="text-accent">isn&apos;t scaling</span> — in 60 seconds.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground sm:text-xl">
          We audit your entire online presence, score it against winning competitors, and hand you a step-by-step plan to fix the leaks costing you customers.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button size="lg" className="h-14 px-8 text-base font-semibold">
              Get my free audit <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <span className="text-sm text-muted-foreground">No credit card. 60 seconds.</span>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {["SEO score", "Site speed", "Conversion gaps", "Local presence", "Competitor diff"].map((t) => (
            <div key={t} className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-accent" /> {t}
            </div>
          ))}
        </div>

        <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
          <Database className="h-4 w-4 text-accent" />
          Powered by <span className="font-semibold text-foreground">200M+ businesses</span> of benchmark data
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-20 sm:grid-cols-3">
          {[
            { icon: Search, t: "We crawl everything", d: "Your site, listings, reviews, social, ads, and your top 3 competitors." },
            { icon: BarChart3, t: "We score you 0–100", d: "Against businesses in your city that are eating your lunch." },
            { icon: Zap, t: "We hand you the plan", d: "A prioritized 30-day action list — what to fix first for the biggest revenue lift." },
          ].map(({ icon: Icon, t, d }) => (
            <div key={t}>
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-5xl">
          Stop guessing. Start scaling.
        </h2>
        <p className="mt-4 text-balance text-muted-foreground">
          Every day without an audit is another day you&apos;re losing customers to competitors who already know what you don&apos;t.
        </p>
        <Link to="/signup">
          <Button size="lg" className="mt-8 h-14 px-8 text-base font-semibold">
            Run my audit now <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </Link>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} scorvio.ai — All rights reserved.</span>
          <span className="text-xs">Powered by 200M+ businesses of benchmark data</span>
        </div>
      </footer>
    </div>
  );
}
