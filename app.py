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

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client, Client

app = Flask(__name__)
if CORS:
    CORS(app, origins=[
        "https://scorvio.ai",
        "https://www.scorvio.ai",
        "http://localhost:5173",
    ])

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_KEY = os.environ["SUPABASE_KEY"]
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

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


# ---------------------------------------------------------------------------
# Audit endpoints
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Waitlist / signup
# ---------------------------------------------------------------------------

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

    # Check for duplicate email
    existing = supabase.table("clients") \
        .select("id") \
        .eq("email", data["email"]) \
        .execute()

    if existing.data:
        return jsonify({"error": "An account with this email already exists"}), 409

    hashed_pw = bcrypt.hashpw(data["password"].encode(), bcrypt.gensalt()).decode()
    token = secrets.token_urlsafe(12)

    referred_by_code = data.get("referred_by_code") or None
    referred_by_id = None
    if referred_by_code:
        ref_result = supabase.table("clients") \
            .select("id") \
            .eq("affiliate_code", referred_by_code) \
            .single() \
            .execute()
        if ref_result.data:
            referred_by_id = ref_result.data["id"]
            supabase.table("affiliate_events").insert({
                "affiliate_code": referred_by_code,
                "event_type": "conversion",
            }).execute()

    entry = {
        "token": token,
        "name": data["name"],
        "email": data["email"],
        "password_hash": hashed_pw,
        "business": data["business"],
        "city": data["city"],
        "state": data["state"],
        "plan": plan,
        "referred_by_code": referred_by_code,
        "referred_by_id": referred_by_id,
    }

    result = supabase.table("clients").insert(entry).execute()
    if not result.data:
        return jsonify({"error": "Failed to save signup"}), 500

    if referred_by_code and result.data:
        new_user_id = result.data[0]["id"]
        supabase.table("affiliate_events") \
            .update({"converted_user_id": new_user_id}) \
            .eq("affiliate_code", referred_by_code) \
            .is_("converted_user_id", "null") \
            .execute()

    return jsonify({"ok": True, "token": token}), 201


# ---------------------------------------------------------------------------
# Affiliate endpoints
# ---------------------------------------------------------------------------

@app.post("/api/affiliate/click")
def track_click():
    code = request.args.get("code") or (request.get_json(silent=True) or {}).get("code")
    if not code:
        return jsonify({"error": "missing code"}), 400

    result = supabase.table("clients") \
        .select("id") \
        .eq("affiliate_code", code) \
        .eq("is_affiliate", True) \
        .single() \
        .execute()

    if not result.data:
        return jsonify({"error": "invalid code"}), 404

    supabase.table("affiliate_events").insert({
        "affiliate_code": code,
        "event_type": "click",
    }).execute()

    return jsonify({"ok": True}), 200


@app.get("/api/affiliate/stats/<code>")
def affiliate_stats(code: str):
    result = supabase.table("affiliate_stats") \
        .select("*") \
        .eq("affiliate_code", code) \
        .single() \
        .execute()

    if not result.data:
        return jsonify({"error": "not found"}), 404

    return jsonify(result.data)


# ---------------------------------------------------------------------------
# Admin
# ---------------------------------------------------------------------------

@app.get("/api/admin/users")
def admin_list_users():
    result = supabase.table("clients").select("*").execute()
    return jsonify({"users": result.data})


@app.get("/api/admin/affiliates")
def admin_list_affiliates():
    result = supabase.table("affiliate_stats").select("*").execute()
    return jsonify({"affiliates": result.data})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
