from drishti_api.models.geo import Tenant, AdminUnit, Disease, Vertical


def test_tenant_has_id(db):
    tenant = Tenant(name="Nepal Health", settings_jsonb={})
    db.add(tenant)
    db.flush()
    assert tenant.id is not None


def test_admin_unit_recursive_parent(db):
    tenant = Tenant(name="T", settings_jsonb={})
    db.add(tenant)
    db.flush()
    country = AdminUnit(tenant_id=tenant.id, level=0, code="NP",
                        name="Nepal", population=29000000, child_pop_under_15=9000000)
    db.add(country)
    db.flush()
    district = AdminUnit(tenant_id=tenant.id, parent_id=country.id, level=2,
                         code="NP-BA-3", name="Chitwan",
                         population=579984, child_pop_under_15=148000)
    db.add(district)
    db.flush()
    assert district.parent_id == country.id


def test_disease_and_vertical(db):
    disease = Disease(code="dengue", name="Dengue", vector_species="Aedes aegypti",
                      incubation_days=7, climate_params_jsonb={"temp_min": 18})
    vertical = Vertical(code="vector_health", name="Vector-Borne Disease")
    db.add_all([disease, vertical])
    db.flush()
    assert disease.id is not None
    assert vertical.id is not None
