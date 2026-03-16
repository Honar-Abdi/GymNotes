from typing import List, Optional
from pydantic import BaseModel, Field


class SetLine(BaseModel):
    weight: float = Field(..., gt=0)
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