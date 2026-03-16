from collections import defaultdict
from datetime import date, datetime, timedelta
from app.db import get_connection
from app.services.progress import epley_e1rm


def get_week_range():
    today = date.today()
    start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    return start.isoformat(), end.isoformat()


def get_week_start(d: date) -> str:
    return (d - timedelta(days=d.weekday())).isoformat()


def build_dashboard_response():
    conn = get_connection()
    cur = conn.cursor()

    sessions = cur.execute("""
        SELECT ws.id, ws.date, ws.name, se.exercise, se.weight, se.reps, se.extra_reps
        FROM workout_session ws
        JOIN set_entry se ON se.session_id = ws.id
        ORDER BY ws.date ASC
    """).fetchall()
    conn.close()

    if not sessions:
        return {"empty": True}

    rows = [dict(r) for r in sessions]

    # --- Viikon sessiot ---
    week_start, week_end = get_week_range()
    week_dates = sorted(set(
        r["date"] for r in rows
        if week_start <= r["date"] <= week_end
    ))

    # --- Viimeisin sessio ---
    last_date = max(r["date"] for r in rows)
    last_rows = [r for r in rows if r["date"] == last_date]
    last_exercises = list(dict.fromkeys(r["exercise"] for r in last_rows))
    last_name = last_rows[0]["name"] if last_rows else None

    best_last = max(
        last_rows,
        key=lambda r: epley_e1rm(float(r["weight"] or 0), int(r["reps"]))
    )

    last_set_count = len(last_rows)
    last_volume = sum(
        float(r["weight"] or 0) * int(r["reps"])
        for r in last_rows
        if float(r["weight"] or 0) > 0
    )

    # --- PR per liike — paras oikea paino ---
    exercise_bests = defaultdict(lambda: {"weight": 0, "reps": 0, "date": ""})
    exercise_history = defaultdict(list)
    recent_cutoff = (date.today() - timedelta(days=14)).isoformat()

    for r in rows:
        weight = float(r["weight"] or 0)
        reps = int(r["reps"])
        if weight <= 0:
            continue
        ex = r["exercise"]

        exercise_history[ex].append({"date": r["date"], "weight": weight})

        if weight > exercise_bests[ex]["weight"]:
            exercise_bests[ex] = {
                "exercise": ex,
                "weight": weight,
                "reps": reps,
                "date": r["date"],
                "is_recent": r["date"] >= recent_cutoff
            }

    prs = []
    for ex, best in exercise_bests.items():
        daily = defaultdict(float)
        for h in exercise_history[ex]:
            if h["weight"] > daily[h["date"]]:
                daily[h["date"]] = h["weight"]
        sparkline = [{"date": d, "weight": v} for d, v in sorted(daily.items())]
        prs.append({**best, "sparkline": sparkline})

    prs = sorted(prs, key=lambda x: x["weight"], reverse=True)[:6]

    # --- Kaikki sessiot ---
    all_sessions = []
    seen = {}
    for r in rows:
        d = r["date"]
        if d not in seen:
            seen[d] = {"date": d, "name": r["name"]}
            all_sessions.append(seen[d])

    all_dates = sorted(seen.keys())

    # --- Treenijako tässä kuussa ---
    this_month = date.today().strftime("%Y-%m")
    month_sessions = [s for s in all_sessions if s["date"].startswith(this_month)]

    session_type_counts = defaultdict(int)
    for s in month_sessions:
        label = s["name"] or "Muu"
        session_type_counts[label] += 1

    training_split = [
        {"name": k, "count": v}
        for k, v in sorted(session_type_counts.items(), key=lambda x: -x[1])
    ]

    # --- Settimäärä per viikko (viimeiset 6 viikkoa) ---
    weekly_sets = defaultdict(int)
    for r in rows:
        d = datetime.strptime(r["date"], "%Y-%m-%d").date()
        wk = get_week_start(d)
        weekly_sets[wk] += 1

    sorted_weeks = sorted(weekly_sets.keys())[-6:]
    weekly_volume_data = [
        {"week": wk, "sets": weekly_sets[wk]}
        for wk in sorted_weeks
    ]

    # --- 4 viikon kalenteri ---
    today = date.today()
    calendar_start = today - timedelta(days=27)
    calendar_days = []
    for i in range(28):
        d = calendar_start + timedelta(days=i)
        iso = d.isoformat()
        session = seen.get(iso)
        calendar_days.append({
            "date": iso,
            "trained": iso in seen,
            "name": session["name"] if session else None,
            "is_today": iso == today.isoformat(),
        })

    # --- Streak / frekvenssi ---
    sessions_this_month = len(month_sessions)

    avg_days = None
    if len(all_dates) >= 2:
        parsed = [datetime.strptime(d, "%Y-%m-%d") for d in all_dates]
        gaps = [(parsed[i+1] - parsed[i]).days for i in range(len(parsed)-1)]
        avg_days = round(sum(gaps) / len(gaps), 1)

    return {
        "empty": False,
        "week": {
            "sessions_this_week": len(week_dates),
            "session_dates": week_dates,
            "week_start": week_start,
        },
        "last_session": {
            "date": last_date,
            "name": last_name,
            "exercises": last_exercises,
            "set_count": last_set_count,
            "volume": round(last_volume, 0),
            "best_set": {
                "exercise": best_last["exercise"],
                "weight": float(best_last["weight"]),
                "reps": int(best_last["reps"]),
            }
        },
        "prs": prs,
        "training_split": training_split,
        "weekly_volume": weekly_volume_data,
        "calendar": calendar_days,
        "streak": {
            "sessions_this_month": sessions_this_month,
            "sessions_this_week": len(week_dates),
            "total_sessions": len(all_dates),
            "avg_days_between": avg_days,
        }
    }