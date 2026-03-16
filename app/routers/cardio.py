from fastapi import APIRouter, HTTPException
from app.schemas.models import CardioCreate, CardioResponse
from app.repositories.repo import get_or_create_session_id, insert_cardio, fetch_all_cardio, fetch_cardio_for_session, delete_cardio

router = APIRouter(prefix="/cardio", tags=["cardio"])


@router.post("/", response_model=CardioResponse)
def log_cardio(payload: CardioCreate):
    session_id = get_or_create_session_id(payload.date, name="Cardio")
    cardio_id = insert_cardio(session_id, payload.type, payload.duration_min, payload.distance_km)
    return CardioResponse(
        id=cardio_id,
        session_id=session_id,
        date=payload.date,
        type=payload.type,
        duration_min=payload.duration_min,
        distance_km=payload.distance_km,
    )


@router.get("/", response_model=list[CardioResponse])
def get_all_cardio():
    rows = fetch_all_cardio()
    return [CardioResponse(**r) for r in rows]


@router.get("/{session_id}", response_model=list[CardioResponse])
def get_cardio_for_session(session_id: int):
    rows = fetch_cardio_for_session(session_id)
    return [
        CardioResponse(
            id=r["id"],
            session_id=session_id,
            date="",
            type=r["type"],
            duration_min=r["duration_min"],
            distance_km=r["distance_km"],
        )
        for r in rows
    ]


@router.delete("/{cardio_id}")
def remove_cardio(cardio_id: int):
    deleted = delete_cardio(cardio_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Cardio-kirjausta ei löydy")
    return {"ok": True}