from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.db import init_db
from app.routers.workouts import router as workouts_router
from app.routers.analytics import router as analytics_router
from app.routers.chat import router as chat_router
from app.routers.confirm import router as confirm_router
from app.routers.bulk import router as bulk_router
from app.routers.dashboard import router as dashboard_router

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts_router)
app.include_router(analytics_router)
app.include_router(chat_router)
app.include_router(confirm_router)
app.include_router(bulk_router)
app.include_router(dashboard_router)

@app.get("/")
def read_root():
    return {"message": "Gym Agent is running"}