from fastapi import APIRouter, HTTPException

from app.schemas.models import SessionCreate
from app.repositories import repo


router = APIRouter(tags=["workouts"])


@router.get("/exercises")
def exercises():
    return repo.fetch_exercises()


@router.post("/add-session/")
def add_session(payload: SessionCreate):
    session_id = repo.insert_session_with_items(payload.items)
    return {"status": "Session added", "session_id": session_id}

@router.get("/history/")
def all_sessions():
    return repo.fetch_all_sessions()


@router.get("/history/{session_id}")
def session_detail(session_id: int):
    sets = repo.fetch_sets_for_session(session_id)
    if not sets:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "sets": sets}


@router.delete("/session/{session_id}")
def delete_session(session_id: int):
    deleted = repo.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "session_id": session_id}


@router.delete("/set/{set_id}")
def delete_set(set_id: int):
    deleted = repo.delete_set(set_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Set not found")
    return {"status": "deleted", "set_id": set_id}