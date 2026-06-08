import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { saveLead, getLead } from "@/lib/lead-store";
import { FormShell } from "./signup";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [{ title: "Your business — scorvio.ai" }],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const lead = getLead();
    if (!lead?.email) {
      navigate({ to: "/signup" });
      return;
    }
    setBusiness(lead.business ?? "");
    setCity(lead.city ?? "");
    setState(lead.state ?? "");
  }, [navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!business.trim() || !city.trim() || !state.trim()) return;
    setSubmitting(true);
    setError(null);
    const lead = getLead();
    saveLead({ business: business.trim(), city: city.trim(), state: state.trim(), plan: "free" });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: lead?.name,
          email: lead?.email,
          password: lead?.password,
          business: business.trim(),
          city: city.trim(),
          state: state.trim(),
          plan: "free",
          referred_by_code: lead?.affiliateCode ?? null,
        }),
      });

      if (res.status === 409) {
        const body = await res.json();
        setError(body.error);
        setSubmitting(false);
        return;
      }

      if (!res.ok) {
        setError("Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Waitlist signup failed:", err);
      setError("Something went wrong. Please try again.");
      setSubmitting(false);
      return;
    }

    navigate({ to: "/waitlist" });
  }

  return (
    <FormShell step={2} title="Tell us about the business." subtitle="So we can audit the right site and benchmark you against local competitors.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="business">Business name</Label>
          <Input
            id="business"
            value={business}
            onChange={(e) => setBusiness(e.target.value)}
            placeholder="Acme Plumbing Co."
            autoFocus
            required
            className="h-12"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Austin"
              required
              className="h-12"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
              placeholder="TX"
              required
              maxLength={2}
              className="h-12 uppercase"
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full text-base font-semibold">
          {submitting ? "Joining waitlist…" : "Join the waitlist"} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you join the waitlist. We&apos;ll email you the moment your audit is ready. Already have an account?{" "}
          <Link to="/login" className="font-semibold text-accent hover:underline">Log in</Link>
        </p>
      </form>
    </FormShell>
  );
}
