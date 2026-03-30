from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.schemas.models import SessionCreate
from app.repositories.workout_repo import (
    fetch_exercises,
    insert_session_with_items,
    fetch_all_sessions,
    fetch_sets_for_session,
    delete_session,
    update_session_name,
)

router = APIRouter(tags=["workouts"])


class SessionNameUpdate(BaseModel):
    name: str


@router.get("/exercises")
def exercises():
    return fetch_exercises()


@router.post("/add-session/")
def add_session(payload: SessionCreate):
    session_id = insert_session_with_items(payload.items)
    return {"status": "Session added", "session_id": session_id}


@router.get("/history/")
def all_sessions():
    return fetch_all_sessions()


@router.get("/history/{session_id}")
def session_detail(session_id: int):
    sets = fetch_sets_for_session(session_id)
    if not sets:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "sets": sets}


@router.patch("/session/{session_id}/name")
def update_name(session_id: int, payload: SessionNameUpdate):
    updated = update_session_name(session_id, payload.name)
    if not updated:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "updated", "session_id": session_id, "name": payload.name}


@router.delete("/session/{session_id}")
def delete_session_route(session_id: int):
    deleted = delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted", "session_id": session_id}