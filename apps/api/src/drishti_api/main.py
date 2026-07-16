from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
    admin_units, alerts, auth, detections, drones, flights, health,
    interventions, missions, predictions, satellite, sensors, users,
)

app = FastAPI(
    title="Drishti API",
    version="1.0.0",
    description="Climate-Health Vector Surveillance Platform",
)

import os

_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

app.include_router(health.router)
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(satellite.router, prefix="/api/v1/satellite", tags=["satellite"])
app.include_router(admin_units.router, prefix="/api/v1/admin-units", tags=["admin-units"])
app.include_router(missions.router, prefix="/api/v1/missions", tags=["missions"])
app.include_router(flights.router, prefix="/api/v1/flights", tags=["flights"])
app.include_router(detections.router, prefix="/api/v1/detections", tags=["detections"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["sensors"])
app.include_router(interventions.router, prefix="/api/v1/interventions", tags=["interventions"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(drones.router, prefix="/api/v1/drones", tags=["drones"])
