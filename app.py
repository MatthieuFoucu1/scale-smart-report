"""
ScaleAudit backend (Flask).

This is a generic stub for the audit/report engine. The frontend (TanStack
Start React app) collects lead info and calls these endpoints to generate
and fetch the audit report.

Run locally:
    pip install flask flask-cors
    python app.py

Endpoints:
    POST /api/audit       -> kick off an audit, returns a token
    GET  /api/report/:token -> fetch the report for a given token
    GET  /healthz

Token model: a short opaque string the frontend stores after signup.
The free tier returns a partial report; the paid tier returns the full one.
"""
from __future__ import annotations

import os
import secrets
from datetime import datetime
from flask import Flask, jsonify, request

try:
    from flask_cors import CORS
except ImportError:  # CORS is optional in dev
    CORS = None

app = Flask(__name__)
if CORS:
    CORS(app)

# In-memory store. Replace with a real DB (Postgres, Supabase, etc).
AUDITS: dict[str, dict] = {}


# ---------------------------------------------------------------------------
# TODO: implement the real audit logic here.
# Inputs: business name, website (optional), city, state, plan tier.
# Outputs: overall score, section scores, prioritized fixes, competitor diff.
# ---------------------------------------------------------------------------
def run_audit(business: str, city: str, state: str, website: str | None) -> dict:
    """Stub. Replace with real crawlers / scoring / LLM logic."""
    return {
        "business": business,
        "city": city,
        "state": state,
        "website": website,
        "overall_score": 48,
        "sections": [
            {"key": "seo",        "title": "SEO & Discoverability", "score": 42, "summary": "..."},
            {"key": "speed",      "title": "Site Speed & UX",        "score": 58, "summary": "..."},
            {"key": "local",      "title": "Local Presence",         "score": 71, "summary": "..."},
            {"key": "reviews",    "title": "Reviews & Reputation",   "score": 34, "summary": "..."},
            {"key": "conversion", "title": "Conversion & Funnel",    "score": 29, "summary": "..."},
            {"key": "competitor", "title": "Competitor Gap",         "score": 51, "summary": "..."},
        ],
        "plan_30_day": [
            # populated by paid tier
        ],
        "generated_at": datetime.utcnow().isoformat() + "Z",
    }


def redact_for_free_tier(report: dict) -> dict:
    """Return a partial report: keep overall + first 2 sections, blur the rest."""
    sections = report["sections"]
    return {
        **report,
        "sections": sections[:2] + [
            {"key": s["key"], "title": s["title"], "locked": True} for s in sections[2:]
        ],
        "plan_30_day": [],
    }


@app.post("/api/audit")
def create_audit():
    data = request.get_json(silent=True) or {}
    required = ("name", "email", "business", "city", "state")
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"missing: {', '.join(missing)}"}), 400

    plan = data.get("plan", "free")
    if plan not in ("free", "paid"):
        return jsonify({"error": "plan must be 'free' or 'paid'"}), 400

    token = secrets.token_urlsafe(16)
    report = run_audit(
        business=data["business"],
        city=data["city"],
        state=data["state"],
        website=data.get("website"),
    )
    AUDITS[token] = {
        "lead": {k: data[k] for k in required},
        "plan": plan,
        "report": report,
    }
    return jsonify({"token": token, "plan": plan}), 201


@app.get("/api/report/<token>")
def get_report(token: str):
    record = AUDITS.get(token)
    if not record:
        return jsonify({"error": "not found"}), 404
    report = record["report"]
    if record["plan"] == "free":
        report = redact_for_free_tier(report)
    return jsonify({
        "lead": record["lead"],
        "plan": record["plan"],
        "report": report,
    })


@app.get("/healthz")
def healthz():
    return {"ok": True}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)