from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..models.geo import AdminUnit

router = APIRouter()


@router.get("")
def list_admin_units(db: Session = Depends(get_db)):
    rows = db.execute(select(AdminUnit.id, AdminUnit.name)).all()
    return [{"id": str(id_), "name": name} for id_, name in rows]
