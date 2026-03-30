from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
import re

from app.repositories.workout_repo import (
    fetch_exercises,
    get_or_create_session_id,
    next_set_index,
    insert_set,
)
from app.services import parsing

router = APIRouter(tags=["bulk"])


class BulkProposeRequest(BaseModel):
    lines: List[str]
    date: Optional[str] = None
    name: Optional[str] = None


class BulkConfirmRequest(BaseModel):
    proposals: List[dict]
    name: Optional[str] = None


@router.post("/bulk/propose")
def bulk_propose(payload: BulkProposeRequest):
    session_date = payload.date or date.today().isoformat()
    existing = fetch_exercises()
    session_id = get_or_create_session_id(session_date, payload.name)

    proposals = []
    errors = []
    set_counters = {}

    for i, line in enumerate(payload.lines):
        line = line.strip()
        if not line:
            continue
        try:
            t = line
            side, t = parsing.parse_side_from_text(t)
            extra, t = parsing.parse_extra_reps(t)
            rir, t = parsing.parse_rir(t)
            weight, reps, leftover = parsing.parse_weight_reps(t)

            exercise_raw = leftover.strip()
            if not exercise_raw:
                exercise_raw = t.strip()
            exercise_raw = re.sub(r"\bkg\b", "", exercise_raw, flags=re.IGNORECASE).strip()
            exercise_raw = re.sub(r"\s+", " ", exercise_raw).strip()

            exercise, match_type = parsing.best_match_exercise(exercise_raw, existing)

            key = (session_id, exercise)
            if key not in set_counters:
                set_counters[key] = next_set_index(session_id, exercise)
            idx = set_counters[key]
            set_counters[key] += 1

            proposals.append({
                "line": line,
                "date": session_date,
                "session_id": session_id,
                "exercise_input": exercise_raw,
                "exercise_saved_as": exercise,
                "exercise_match": match_type,
                "set_index": idx,
                "weight": weight,
                "reps": reps,
                "extra_reps": extra if extra > 0 else 0,
                "rir": rir,
                "side": side,
            })
        except Exception as e:
            errors.append({"line": i + 1, "text": line, "error": str(e)})

    return {
        "proposals": proposals,
        "errors": errors,
        "session_id": session_id,
        "date": session_date,
        "name": payload.name,
    }


@router.post("/bulk/confirm")
def bulk_confirm(payload: BulkConfirmRequest):
    saved = 0
    for p in payload.proposals:
        insert_set(
            session_id=int(p["session_id"]),
            exercise=str(p["exercise_saved_as"]),
            set_index=int(p["set_index"]),
            weight=float(p["weight"]),
            reps=int(p["reps"]),
            extra_reps=int(p["extra_reps"]) if p.get("extra_reps") else None,
            rir=p.get("rir"),
            side=p.get("side"),
        )
        saved += 1

    return {
        "status": "ok",
        "saved": saved,
        "session_id": payload.proposals[0]["session_id"],
        "name": payload.name,
    }