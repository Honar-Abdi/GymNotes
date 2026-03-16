from typing import Optional, Dict, Any, List
from collections import defaultdict


def epley_e1rm(weight: float, reps: int) -> float:
    if weight <= 0:
        return 0.0
    return weight * (1 + reps / 30.0)


def pct_change(new: float, old: float) -> Optional[float]:
    if old <= 0:
        return None
    return (new - old) / old * 100.0


def detect_plateau(timeline: List[dict], window: int = 3) -> dict:
    if len(timeline) < window:
        return {"plateau": False, "reason": "not_enough_data"}
    recent = [s["best_e1rm"] for s in timeline[-window:]]
    if max(recent) <= recent[0]:
        return {"plateau": True, "window": window, "e1rms": recent}
    return {"plateau": False, "window": window, "e1rms": recent}


def is_bodyweight_exercise(sets: list) -> bool:
    zero = sum(1 for s in sets if float(s["weight"] or 0) <= 0)
    return zero > len(sets) / 2


def build_progress_response(exercise_name: str, rows) -> Dict[str, Any]:
    if not rows:
        return {"message": "No data found", "exercise": exercise_name}

    all_sets = [dict(r) for r in rows]
    is_bw = is_bodyweight_exercise(all_sets)

    sessions = defaultdict(list)
    for r in all_sets:
        sessions[r["date"]].append(r)

    timeline = []
    all_time_best_e1rm = None
    all_time_best_set = None
    all_time_best_weight = None
    all_time_best_reps = None

    side_best = {"right": None, "left": None}

    for d in sorted(sessions.keys()):
        sets = sessions[d]

        enriched = []
        total_volume = 0.0
        rir_values = []
        max_weight_today = None
        max_reps_today = None

        for s in sets:
            weight = float(s["weight"] or 0)
            reps = int(s["reps"])
            extra = int(s["extra_reps"]) if s["extra_reps"] else 0
            rir = s["rir"]
            side = s["side"]

            e1rm = epley_e1rm(weight, reps)
            volume = weight * (reps + extra) if weight > 0 else (reps + extra)
            total_volume += volume

            if rir is not None:
                rir_values.append(int(rir))

            if weight > 0:
                if max_weight_today is None or weight > max_weight_today:
                    max_weight_today = weight
                if all_time_best_weight is None or weight > all_time_best_weight:
                    all_time_best_weight = weight

            if is_bw:
                total_reps = reps + extra
                if max_reps_today is None or total_reps > max_reps_today:
                    max_reps_today = total_reps
                if all_time_best_reps is None or total_reps > all_time_best_reps:
                    all_time_best_reps = total_reps

            if side in ("right", "left") and weight > 0:
                if side_best[side] is None or weight > side_best[side]["weight"]:
                    side_best[side] = {"weight": weight, "reps": reps, "date": d}

            item = {
                "weight": weight,
                "reps": reps,
                "extra_reps": extra,
                "rir": rir,
                "side": side,
                "e1rm": round(e1rm, 2),
                "set_index": int(s["set_index"]),
            }
            enriched.append(item)

            if not is_bw:
                if all_time_best_e1rm is None or e1rm > all_time_best_e1rm:
                    all_time_best_e1rm = e1rm
                    all_time_best_set = {"date": d, **item}

        best_today = (
            max(enriched, key=lambda x: x["reps"] + x["extra_reps"])
            if is_bw
            else max(enriched, key=lambda x: x["e1rm"])
        )

        timeline.append({
            "date": d,
            "best_set_by_e1rm": best_today,
            "best_e1rm": best_today["e1rm"] if not is_bw else 0,
            "best_weight": max_weight_today,
            "best_reps": max_reps_today,
            "total_volume": round(total_volume, 2),
            "set_count": len(enriched),
            "avg_rir": round(sum(rir_values) / len(rir_values), 1) if rir_values else None,
            "sets": enriched,
        })

    last = timeline[-1]
    prev = timeline[-2] if len(timeline) >= 2 else None

    change_vs_prev_pct = None
    if prev and not is_bw:
        change_vs_prev_pct = pct_change(last["best_e1rm"], prev["best_e1rm"])
        if change_vs_prev_pct is not None:
            change_vs_prev_pct = round(change_vs_prev_pct, 2)

    volume_trend = None
    if len(timeline) >= 2:
        vol_change = pct_change(last["total_volume"], timeline[-2]["total_volume"])
        volume_trend = round(vol_change, 2) if vol_change is not None else None

    avg_days_between = None
    if len(timeline) >= 2:
        from datetime import datetime
        parsed = [datetime.strptime(d["date"], "%Y-%m-%d") for d in timeline]
        gaps = [(parsed[i+1] - parsed[i]).days for i in range(len(parsed)-1)]
        avg_days_between = round(sum(gaps) / len(gaps), 1)

    summary = {
        "exercise": exercise_name,
        "is_bodyweight": is_bw,
        "last_date": last["date"],
        "last_best_e1rm": last["best_e1rm"] if not is_bw else None,
        "last_best_weight": last["best_weight"],
        "last_best_reps": last["best_reps"],
        "last_volume": last["total_volume"],
        "last_avg_rir": last["avg_rir"],
        "prev_date": prev["date"] if prev else None,
        "prev_best_e1rm": prev["best_e1rm"] if prev and not is_bw else None,
        "prev_volume": prev["total_volume"] if prev else None,
        "change_vs_prev_pct": change_vs_prev_pct,
        "volume_trend_pct": volume_trend,
        "all_time_best_e1rm": round(all_time_best_e1rm, 2) if all_time_best_e1rm else None,
        "all_time_best_set": all_time_best_set,
        "all_time_best_weight": all_time_best_weight,
        "all_time_best_reps": all_time_best_reps,
        "avg_days_between_sessions": avg_days_between,
        "total_sessions": len(timeline),
        "side_best": side_best,
        "plateau": detect_plateau(timeline) if not is_bw else {"plateau": False, "reason": "bodyweight"},
    }

    return {"summary": summary, "timeline": timeline}