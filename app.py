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
import bcrypt
from datetime import datetime, timezone
from flask import Flask, jsonify, request

try:
    from flask_cors import CORS
except ImportError:
    CORS = None

from supabase import create_client, Client

app = Flask(__name__)
if CORS:
    CORS(app)

# Supabase client — set these as environment variables, never hardcode
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# In-memory audit store (fine for v1)
AUDITS: dict[str, dict] = {}


def run_audit(business: str, city: str, state: str, website: str | None) -> dict:
    """Stub. Replace with real logic later."""
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
        "plan_30_day": [],
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


def redact_for_free_tier(report: dict) -> dict:
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


@app.post("/api/waitlist")
def join_waitlist():
    data = request.get_json(silent=True) or {}
    required = ("name", "email", "password", "business", "city", "state")
    missing = [k for k in required if not data.get(k)]
    if missing:
        return jsonify({"error": f"missing: {', '.join(missing)}"}), 400

    plan = data.get("plan", "free")
    if plan not in ("free", "paid"):
        plan = "free"

    # Hash the password — never store plaintext
    hashed_pw = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()

    token = secrets.token_urlsafe(12)

    entry = {
        "token": token,
        "name": data["name"],
        "email": data["email"],
        "password_hash": hashed_pw,
        "business": data["business"],
        "city": data["city"],
        "state": data["state"],
        "plan": plan,
    }

    # Insert into Supabase
    result = supabase.table("waitlist").insert(entry).execute()

    if not result.data:
        return jsonify({"error": "Failed to save signup"}), 500

    return jsonify({"ok": True, "token": token}), 201


@app.get("/api/admin/users")
def admin_list_users():
    result = supabase.table("waitlist").select("*").execute()
    return jsonify({"users": result.data})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
