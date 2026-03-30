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


def _sparkline_trend(sparkline: list) -> str:
    if len(sparkline) < 2:
        return 'flat'

    one_month_ago = (date.today() - timedelta(days=30)).isoformat()

    weights = [p["weight"] for p in sparkline]
    latest = weights[-1]
    prev = weights[-2]

    recent_points = [p for p in sparkline if p["date"] >= one_month_ago]
    recent_peak = max(p["weight"] for p in recent_points) if recent_points else latest
    all_time_peak = max(weights)

    if latest >= recent_peak and latest > prev:
        return 'up'

    if latest < all_time_peak * 0.95:
        return 'down'

    return 'flat'


def build_dashboard_response():
    conn = get_connection()
    cur = conn.cursor()

    sessions = cur.execute("""
        SELECT ws.id, ws.date, ws.name, se.exercise, se.weight, se.reps, se.extra_reps
        FROM workout_session ws
        JOIN set_entry se ON se.session_id = ws.id
        ORDER BY ws.date ASC
    """).fetchall()

    cardio_sessions = cur.execute("""
        SELECT ws.id, ws.date, ce.duration_min, ce.distance_km
        FROM workout_session ws
        JOIN cardio_entry ce ON ce.session_id = ws.id
        ORDER BY ws.date ASC
    """).fetchall()

    conn.close()

    if not sessions and not cardio_sessions:
        return {"empty": True}

    rows = [dict(r) for r in sessions]
    cardio_rows = [dict(r) for r in cardio_sessions]

    # --- Viikon sessiot (treeni + cardio) ---
    week_start, week_end = get_week_range()
    week_dates = sorted(set(
        r["date"] for r in rows + cardio_rows
        if week_start <= r["date"] <= week_end
    ))

    # --- Viimeisin treeni-sessio ---
    last_date = max(r["date"] for r in rows) if rows else None
    last_rows = [r for r in rows if r["date"] == last_date] if last_date else []
    last_exercises = list(dict.fromkeys(r["exercise"] for r in last_rows))
    last_name = last_rows[0]["name"] if last_rows else None

    best_last = max(
        last_rows,
        key=lambda r: epley_e1rm(float(r["weight"] or 0), int(r["reps"]))
    ) if last_rows else None

    last_set_count = len(last_rows)
    last_volume = sum(
        float(r["weight"] or 0) * int(r["reps"])
        for r in last_rows
        if float(r["weight"] or 0) > 0
    )

    # --- Edellinen sama treenityyppi volyymi ---
    prev_same_volume = None
    if last_name and last_date:
        same_type_dates = sorted(set(
            r["date"] for r in rows
            if r["name"] == last_name and r["date"] < last_date
        ), reverse=True)
        if same_type_dates:
            prev_date = same_type_dates[0]
            prev_rows = [r for r in rows if r["date"] == prev_date]
            prev_vol = sum(
                float(r["weight"] or 0) * int(r["reps"])
                for r in prev_rows
                if float(r["weight"] or 0) > 0
            )
            if prev_vol > 0:
                change = round((last_volume - prev_vol) / prev_vol * 100, 1)
                prev_same_volume = {"date": prev_date, "volume": round(prev_vol, 0), "change_pct": change}

    # --- PR per liike ---
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
        trend = _sparkline_trend(sparkline)
        prs.append({**best, "sparkline": sparkline, "trend": trend})

    trend_order = {"up": 0, "flat": 1, "down": 2}
    prs_sorted = sorted(prs, key=lambda x: (trend_order[x["trend"]], -x["weight"]))

    rising = [p for p in prs_sorted if p["trend"] == "up"]
    flat = [p for p in prs_sorted if p["trend"] == "flat"]
    down = [p for p in prs_sorted if p["trend"] == "down"]

    final_prs = (rising + flat + down)[:6]

    # --- Kaikki treeni-sessiot ---
    seen_training = {}
    for r in rows:
        d = r["date"]
        if d not in seen_training:
            seen_training[d] = {"date": d, "name": r["name"], "type": "treeni"}

    # --- Kaikki cardio-sessiot ---
    seen_cardio = {}
    for r in cardio_rows:
        d = r["date"]
        if d not in seen_cardio:
            seen_cardio[d] = {"date": d, "name": "Aerobinen", "type": "cardio"}

    seen_all = {}
    for d, s in seen_training.items():
        seen_all[d] = s
    for d, s in seen_cardio.items():
        if d not in seen_all:
            seen_all[d] = s

    all_dates = sorted(seen_all.keys())

    # --- Treenijako tässä kuussa ---
    this_month = date.today().strftime("%Y-%m")
    month_sessions_training = [s for s in seen_training.values() if s["date"].startswith(this_month)]
    month_sessions_cardio = [s for s in seen_cardio.values() if s["date"].startswith(this_month)]

    session_type_counts = defaultdict(int)
    for s in month_sessions_training:
        label = s["name"] or "Muu"
        session_type_counts[label] += 1
    for s in month_sessions_cardio:
        session_type_counts["Aerobinen"] += 1

    training_split = [
        {"name": k, "count": v}
        for k, v in sorted(session_type_counts.items(), key=lambda x: -x[1])
    ]

    # --- Settimäärä per viikko ---
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
        session = seen_all.get(iso)
        calendar_days.append({
            "date": iso,
            "trained": iso in seen_all,
            "name": session["name"] if session else None,
            "type": session["type"] if session else None,
            "is_today": iso == today.isoformat(),
        })

    # --- Streak / frekvenssi ---
    sessions_this_month = len(month_sessions_training) + len(month_sessions_cardio)

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
            } if best_last else None,
            "prev_same_volume": prev_same_volume,
        },
        "prs": final_prs,
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