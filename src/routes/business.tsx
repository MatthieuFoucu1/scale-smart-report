import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight } from "lucide-react";
import { saveLead, getLead } from "@/lib/lead-store";
import { FormShell } from "./signup";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [{ title: "Your business — ScaleAudit" }],
  }),
  component: BusinessPage,
});

function BusinessPage() {
  const navigate = useNavigate();
  const [business, setBusiness] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!business.trim() || !city.trim() || !state.trim()) return;
    saveLead({ business: business.trim(), city: city.trim(), state: state.trim() });
    navigate({ to: "/waitlist" });
  }

  return (
    <FormShell step={2} title="Tell us about the business." subtitle="So we can audit the right site and benchmark you against local competitors.">
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="business">Business name</Label>
          <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Acme Plumbing Co." autoFocus required className="h-12" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Austin" required className="h-12" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={state} onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))} placeholder="TX" required maxLength={2} className="h-12 uppercase" />
          </div>
        </div>
        <Button type="submit" size="lg" className="h-12 w-full text-base font-semibold">
          Sign up <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          By signing up you join the waitlist. We&apos;ll email you the moment your audit is ready.
        </p>
      </form>
    </FormShell>
  );
}