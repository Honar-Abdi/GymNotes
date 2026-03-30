from typing import List, Optional
from pydantic import BaseModel, Field


class SetLine(BaseModel):
    weight: float = Field(..., ge=0)  # ge=0 sallii bodyweight (paino=0)
    reps: int = Field(..., gt=0)
    extra_reps: Optional[int] = None
    rir: Optional[int] = None
    side: Optional[str] = None  # "right", "left", None


class ExerciseBlock(BaseModel):
    exercise: str = Field(..., min_length=1)
    sets: List[SetLine]


class SessionCreate(BaseModel):
    items: List[ExerciseBlock]


class LogSetRequest(BaseModel):
    text: str = Field(..., min_length=1)


# --- Cardio ---

class CardioCreate(BaseModel):
    date: str = Field(..., min_length=1)
    type: str = Field(..., min_length=1)
    duration_min: float = Field(..., gt=0)
    distance_km: float = Field(..., gt=0)


class CardioResponse(BaseModel):
    id: int
    session_id: int
    date: str
    type: str
    duration_min: float
    distance_km: float


# --- Kehonpaino ---

class WeightCreate(BaseModel):
    date: str = Field(..., min_length=1)  # "2026-03-30"
    weight_kg: float = Field(..., gt=0)   # esim. 82.5


class WeightResponse(BaseModel):
    id: int
    date: str
    weight_kg: float