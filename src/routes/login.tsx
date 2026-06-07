import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Log in — scorvio.ai" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Login is intentionally disabled until launch.
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link to="/"><Logo /></Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 inline h-4 w-4" /> Back
        </Link>
      </header>

      <main className="mx-auto max-w-md px-6 pb-16 pt-8">
        <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Lock className="h-5 w-5" />
        </div>
        <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">Log in to scorvio.ai</h1>
        <p className="mt-3 text-balance text-muted-foreground">
          Accounts open the day we launch. Get on the waitlist now and we&apos;ll email you the moment your login is live.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 opacity-70">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@business.com" className="h-12" disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-12" disabled />
          </div>
          <Button type="submit" size="lg" disabled className="h-12 w-full text-base font-semibold">
            Log in — opens at launch
          </Button>
        </form>

        <div className="mt-8 rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Don&apos;t have an account yet?</p>
          <Link to="/signup">
            <Button className="mt-3 h-11 w-full font-semibold">Join the waitlist</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}