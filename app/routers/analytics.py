from fastapi import APIRouter
from app.repositories.workout_repo import fetch_sets_for_exercise
from app.services.progress import build_progress_response

router = APIRouter(tags=["analytics"])


@router.get("/progress/{exercise_name}")
def progress(exercise_name: str):
    rows = fetch_sets_for_exercise(exercise_name)
    return build_progress_response(exercise_name, rows)