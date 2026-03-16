from fastapi import APIRouter, HTTPException
import re

from app.repositories import repo
from app.schemas.models import LogSetRequest
from app.services import parsing

router = APIRouter(tags=["chat"])


def _human_summary(proposal: dict) -> str:
    side = proposal.get("side")
    side_txt = ""
    if side == "right":
        side_txt = " (oikea)"
    elif side == "left":
        side_txt = " (vasen)"

    extra = proposal.get("extra_reps") or 0
    extra_txt = f" (+{extra})" if extra > 0 else ""

    rir = proposal.get("rir")
    rir_txt = f", RIR {rir}" if rir is not None else ""

    match = proposal.get("exercise_match")
    match_txt = ""
    if match == "fuzzy":
        match_txt = f"\nHuom: tulkitsin liikkeeksi '{proposal.get('exercise_saved_as')}'."

    return (
        "Ehdotus tallennettavaksi:\n"
        f"- Päivä: {proposal.get('date')}\n"
        f"- Liike: {proposal.get('exercise_saved_as')}{side_txt}\n"
        f"- Setti: {proposal.get('weight')} kg × {proposal.get('reps')}{extra_txt}{rir_txt}\n"
        f"- Tallentuu setiksi #{proposal.get('set_index')}\n"
        f"{match_txt}\n"
        "Vahvista tallennus kutsumalla POST /confirm/ samalla payloadilla."
    )


@router.post("/chat/")
def chat(payload: LogSetRequest):
    """
    Tulkitsee treenitekstin ehdotukseksi, EI tallenna vielä.
    """
    original = payload.text.strip()

    session_date, t = parsing.parse_date_from_text(original)
    side, t = parsing.parse_side_from_text(t)
    extra, t = parsing.parse_extra_reps(t)
    rir, t = parsing.parse_rir(t)

    try:
        weight, reps, leftover = parsing.parse_weight_reps(t)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    exercise_raw = leftover.strip()
    if not exercise_raw:
        exercise_raw = t.strip()

    exercise_raw = re.sub(r"\bkg\b", "", exercise_raw, flags=re.IGNORECASE).strip()
    exercise_raw = re.sub(r"\s+", " ", exercise_raw).strip()

    existing = repo.fetch_exercises()
    exercise, match_type = parsing.best_match_exercise(exercise_raw, existing)

    session_id = repo.get_or_create_session_id(session_date)
    idx = repo.next_set_index(session_id, exercise)

    proposal = {
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
    }

    return {
        "proposal": proposal,
        "message": _human_summary(proposal)
    }