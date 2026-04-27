from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routers import (
    alerts, detections, flights, health,
    interventions, missions, predictions, satellite, sensors,
)

app = FastAPI(
    title="Drishti API",
    version="1.0.0",
    description="Climate-Health Vector Surveillance Platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(satellite.router, prefix="/api/v1/satellite", tags=["satellite"])
app.include_router(missions.router, prefix="/api/v1/missions", tags=["missions"])
app.include_router(flights.router, prefix="/api/v1/flights", tags=["flights"])
app.include_router(detections.router, prefix="/api/v1/detections", tags=["detections"])
app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["predictions"])
app.include_router(sensors.router, prefix="/api/v1/sensors", tags=["sensors"])
app.include_router(interventions.router, prefix="/api/v1/interventions", tags=["interventions"])
app.include_router(alerts.router, prefix="/api/v1/alerts", tags=["alerts"])
