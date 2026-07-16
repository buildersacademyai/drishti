#!/usr/bin/env python3
"""Seed AdminUnit rows from the real Nepal districts geojson used by the frontend map.

Usage: python3 scripts/seed_admin_units.py DISTRICT_NAME [DISTRICT_NAME ...]
       python3 scripts/seed_admin_units.py --all
"""
import json
import sys

sys.path.insert(0, __file__.rsplit("/scripts", 1)[0] + "/src")

from shapely.geometry import shape
from geoalchemy2.shape import from_shape

from drishti_api.db import SessionLocal
from drishti_api.config import settings
from drishti_api.models.geo import AdminUnit

GEOJSON_PATH = __file__.rsplit("/apps/api", 1)[0] + "/apps/web/public/nepal-districts.geojson"


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    with open(GEOJSON_PATH) as f:
        geojson = json.load(f)

    want_all = sys.argv[1] == "--all"
    wanted = None if want_all else {n.upper() for n in sys.argv[1:]}

    db = SessionLocal()
    try:
        created = 0
        for feature in geojson["features"]:
            name = feature["properties"]["DISTRICT"]
            if not want_all and name.upper() not in wanted:
                continue

            existing = db.query(AdminUnit).filter(
                AdminUnit.tenant_id == settings.seed_tenant_id,
                AdminUnit.name == name.title(),
            ).first()
            if existing:
                print(f"{name.title()} already seeded (id={existing.id})")
                continue

            geom = from_shape(shape(feature["geometry"]), srid=4326)
            unit = AdminUnit(
                tenant_id=settings.seed_tenant_id, level=2,
                code=f"NP-{name[:6].upper()}", name=name.title(),
                population=0, child_pop_under_15=0, geometry=geom,
            )
            db.add(unit)
            db.flush()
            print(f"Seeded {name.title()} (id={unit.id})")
            created += 1

        db.commit()
        print(f"Done. {created} district(s) created.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
