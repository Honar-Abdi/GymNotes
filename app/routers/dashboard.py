from fastapi import APIRouter
from app.services.dashboard import build_dashboard_response

router = APIRouter(tags=["dashboard"])

@router.get("/dashboard")
def dashboard():
    return build_dashboard_response()