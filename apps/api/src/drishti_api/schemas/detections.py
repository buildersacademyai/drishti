from pydantic import BaseModel


class DetectionClassify(BaseModel):
    positive: bool
