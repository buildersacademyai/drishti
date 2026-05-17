#!/usr/bin/env python3
"""One-off: create the initial admin user."""
import sys
import uuid
sys.path.insert(0, __file__.rsplit("/scripts", 1)[0] + "/src")

from drishti_api.db import SessionLocal
from drishti_api.auth import hash_password
from drishti_api.config import settings
from drishti_api.models.intervention import User

EMAIL    = "admin@drishti.io"
PASSWORD = "T@st1#g123"
NAME     = "Drishti Admin"
ROLE     = "admin"

db = SessionLocal()
try:
    existing = db.query(User).filter(User.email == EMAIL).first()
    if existing:
        print(f"User {EMAIL} already exists (id={existing.id})")
        sys.exit(0)

    user = User(
        id=uuid.uuid4(),
        tenant_id=settings.seed_tenant_id,
        email=EMAIL,
        password_hash=hash_password(PASSWORD),
        name=NAME,
        role=ROLE,
        locale="en",
    )
    db.add(user)
    db.commit()
    print(f"Created admin: {EMAIL}  (id={user.id})")
finally:
    db.close()
