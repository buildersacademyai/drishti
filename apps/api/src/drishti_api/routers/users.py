import uuid
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import select

from ..auth import hash_password
from ..config import settings
from ..db import get_db
from ..models.intervention import User

router = APIRouter()


class CreateUserRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    role: str = "fchv"


@router.get("")
def list_users(db: Session = Depends(get_db)):
    rows = db.execute(select(User).order_by(User.created_at.desc())).scalars().all()
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "name": u.name or "",
            "role": u.role,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in rows
    ]


@router.post("", status_code=201)
def create_user(body: CreateUserRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(
        id=uuid.uuid4(),
        tenant_id=settings.seed_tenant_id,
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
        name=body.name,
        locale="en",
    )
    db.add(user)
    db.commit()
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name or "",
        "role": user.role,
    }


@router.delete("/{user_id}", status_code=204)
def delete_user(user_id: uuid.UUID, db: Session = Depends(get_db)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
