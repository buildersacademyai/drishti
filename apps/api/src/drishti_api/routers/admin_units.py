import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_db
from ..dependencies import get_current_user, CurrentUser
from ..models.geo import AdminUnit

router = APIRouter()


@router.get("")
def list_admin_units(db: Session = Depends(get_db), user: CurrentUser = Depends(get_current_user)):
    rows = db.execute(
        select(AdminUnit.id, AdminUnit.name).where(AdminUnit.tenant_id == uuid.UUID(user.tenant_id))
    ).all()
    return [{"id": str(id_), "name": name} for id_, name in rows]
