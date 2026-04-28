#!/usr/bin/env python3
"""Seed DB with one tenant, Nepal admin units, dengue disease, vector_health vertical."""
import uuid
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../apps/api/src"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from drishti_api.config import settings
from drishti_api.models.geo import Tenant, AdminUnit, Disease, Vertical, DataSource

SEED_TENANT_ID = uuid.UUID("00000000-0000-0000-0000-000000000001")
engine = create_engine(settings.database_url)
Session = sessionmaker(bind=engine)


def seed():
    with Session() as db:
        if not db.get(Tenant, SEED_TENANT_ID):
            db.add(Tenant(id=SEED_TENANT_ID, name="Nepal Drishti Pilot",
                          country_code="NP", settings_jsonb={}))
        nepal = AdminUnit(tenant_id=SEED_TENANT_ID, level=0, code="NP",
                          name="Nepal", population=29000000, child_pop_under_15=9000000)
        bagmati = AdminUnit(tenant_id=SEED_TENANT_ID, level=1, code="NP-BA",
                            name="Bagmati Province", population=6084042, child_pop_under_15=1500000)
        chitwan = AdminUnit(tenant_id=SEED_TENANT_ID, level=2, code="NP-BA-3",
                            name="Chitwan", population=579984, child_pop_under_15=148000)
        db.add_all([nepal, bagmati, chitwan])
        db.flush()
        bagmati.parent_id = nepal.id
        chitwan.parent_id = bagmati.id
        if not db.query(Disease).filter_by(code="dengue").first():
            db.add(Disease(code="dengue", name="Dengue Fever",
                           vector_species="Aedes aegypti", incubation_days=7,
                           climate_params_jsonb={"temp_min": 18, "temp_max": 36}))
        if not db.query(Vertical).filter_by(code="vector_health").first():
            db.add(Vertical(code="vector_health", name="Vector-Borne Disease"))
        db.add(DataSource(tenant_id=SEED_TENANT_ID, type="own_drone",
                          name="Drishti Drone Fleet", config_jsonb={}))
        db.commit()
        print("Seed complete.")


if __name__ == "__main__":
    seed()
