from typing import Literal
from pydantic import BaseModel

MISSION_STATUSES = ("planned", "in_progress", "completed", "aborted")


class MissionStatusUpdate(BaseModel):
    status: Literal["planned", "in_progress", "completed", "aborted"]
