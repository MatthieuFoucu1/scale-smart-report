import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { saveLead, getLead } from "@/lib/lead-store";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Start your audit — scorvio.ai" },
      { name: "description", content: "Tell us who you are so we can build your audit." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    ref: (search.ref as string) || "",
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { ref } = useSearch({ from: "/signup" });
  const existing = getLead();
  const [name, setName] = useState(existing?.name ?? "");
  const [email, setEmail] = useState(existing?.email ?? "");
  const [password, setPassword] = useState("");
  const [affiliateCode, setAffiliateCode] = useState(existing?.affiliateCode ?? ref ?? "");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) return;
    saveLead({ name: name.trim(), email: email.trim(), password, affiliateCode: affiliateCode.trim() || undefined, createdAt: new Date().toISOString() });
    navigate({ to: "/business" });
  }

  return (
    <FormShell step={1} title="First — who's getting this audit?" subtitle="We'll send your report and 30-day plan straight to your inbox.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Your name</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Smith" autoFocus required className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@business.com" required className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6} className="h-12" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="affiliateCode">Affiliate code (optional)</Label>
          <Input id="affiliateCode" value={affiliateCode} onChange={(e) => setAffiliateCode(e.target.value)} placeholder="Enter your affiliate code" className="h-12" />
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
          Continue <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
        </p>
      </form>
    </FormShell>
  );
}

export function FormShell({
  step,
  title,
  subtitle,
  children,
}: {
  step: 1 | 2;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Back
        </Link>
      </header>
      <main className="mx-auto max-w-md px-6 pb-16 pt-8">
        <div className="mb-8 flex items-center gap-2">
          {[1, 2].map((n) => (
            <div
              key={n}
              className={`h-1 flex-1 rounded-full ${n <= step ? "bg-accent" : "bg-muted"}`}
            />
          ))}
        </div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Step {step} of 2</p>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-balance text-muted-foreground">{subtitle}</p>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}