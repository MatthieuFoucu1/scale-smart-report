export type Lead = {
  name: string;
  email: string;
  password?: string;
  business?: string;
  city?: string;
  state?: string;
  plan?: "free" | "paid";
  createdAt: string;
};

const KEY = "scaleaudit_lead";

export function saveLead(patch: Partial<Lead>) {
  if (typeof window === "undefined") return;
  const existing = getLead() ?? { name: "", email: "", createdAt: new Date().toISOString() };
  const next: Lead = { ...existing, ...patch };
  localStorage.setItem(KEY, JSON.stringify(next));
}

export function getLead(): Lead | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Lead;
  } catch {
    return null;
  }
}

export function clearLead() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}