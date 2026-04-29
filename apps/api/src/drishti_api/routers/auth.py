import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from ..auth import create_access_token, hash_password, verify_password
from ..config import settings
from ..db import get_db
from ..models.intervention import User

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str


class RegisterRequest(BaseModel):
    email: str
    password: str
    role: str = "fchv"
    name: str = ""


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token(
        subject=str(user.id),
        role=user.role,
        tenant_id=str(user.tenant_id),
    )
    return TokenResponse(access_token=token, role=user.role)


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
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

    token = create_access_token(
        subject=str(user.id),
        role=user.role,
        tenant_id=str(user.tenant_id),
    )
    return TokenResponse(access_token=token, role=user.role)


@router.get("/me")
def me_endpoint(
    credentials=None,
    db: Session = Depends(get_db),
):
    """Public status endpoint — returns auth instructions."""
    return {
        "message": "Send Bearer token in Authorization header",
        "docs": "/docs#/auth",
    }
