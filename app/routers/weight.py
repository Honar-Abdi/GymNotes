from fastapi import APIRouter, HTTPException
from app.schemas.models import WeightCreate, WeightResponse
from app.repositories.weight_repo import (
    upsert_weight,
    fetch_all_weights,
    fetch_latest_weight,
    delete_weight,
)

router = APIRouter(prefix="/weight", tags=["weight"])


@router.post("/", response_model=WeightResponse)
def log_weight(payload: WeightCreate):
    row_id = upsert_weight(payload.date, payload.weight_kg)
    return WeightResponse(id=row_id, date=payload.date, weight_kg=payload.weight_kg)


@router.get("/", response_model=list[WeightResponse])
def get_all_weights():
    rows = fetch_all_weights()
    return [WeightResponse(**r) for r in rows]


@router.get("/latest", response_model=WeightResponse)
def get_latest_weight():
    row = fetch_latest_weight()
    if not row:
        raise HTTPException(status_code=404, detail="Ei painomerkintöjä")
    return WeightResponse(**row)


@router.delete("/{weight_id}")
def remove_weight(weight_id: int):
    deleted = delete_weight(weight_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Merkintää ei löydy")
    return {"ok": True}