from fastapi import APIRouter

from app.repositories import repo

router = APIRouter(tags=["chat"])


@router.post("/confirm/")
def confirm(payload: dict):
    """
    Tallentaa /chat/ palauttaman proposalin tietokantaan.
    """
    proposal = payload.get("proposal") if isinstance(payload, dict) else None
    if proposal is None:
        # sallitaan myös että käyttäjä lähettää suoraan proposal-objektin
        proposal = payload

    session_id = int(proposal["session_id"])
    exercise = str(proposal["exercise_saved_as"])
    set_index = int(proposal["set_index"])

    weight = float(proposal["weight"])
    reps = int(proposal["reps"])
    extra = int(proposal.get("extra_reps") or 0)
    rir = proposal.get("rir")
    side = proposal.get("side")

    repo.insert_set(
        session_id=session_id,
        exercise=exercise,
        set_index=set_index,
        weight=weight,
        reps=reps,
        extra_reps=extra if extra > 0 else None,
        rir=rir,
        side=side,
    )

    extra_txt = f" (+{extra})" if extra > 0 else ""
    side_txt = f" ({'oikea' if side == 'right' else 'vasen'})" if side in ("right", "left") else ""

    return {
        "status": "Saved",
        "message": f"Tallennettu: {exercise}{side_txt} {weight} kg × {reps}{extra_txt} (setti #{set_index})"
    }