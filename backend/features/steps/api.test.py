#!.venv/bin/python

# pylint: disable=not-callable

"""CRUD tests"""

from asyncio import run as run_async
from typing import TYPE_CHECKING, Final

from behave import given, then, when
from box import Box
from environment import get_new_substance
from fake import fake
from fastapi import status
from fastapi.testclient import TestClient
from jwt import encode as jwt_encode
from loadfig import pyproject as load_pyproject
from whenever import Instant

# pylint: disable=import-private-name
from api import (
    ROUTER,
    Substance,
    SubstanceDTO,
    User,
    _get_user_hash,
    _user_get_or_create,
    add_substance,
    clear_cache_stats,
    delete_substance,
    delete_user,
    evict_user,
    get_cache_stats,
    get_favicon,
    get_substance,
    get_substances,
    get_version,
    update_substance,
)
from env import env

if TYPE_CHECKING:
    from behave.runner import Context
    from cachetools import CacheInfo


# region Stringify a SubstanceDTO


@given("that a SubstanceDTO should stringify")
def stringify_substance_dto(_: Context) -> None:
    """Stringify a SubstanceDTO"""


@when("a SubstanceDTO is output")
def output_substance_dto(context: Context) -> None:
    """Output a SubstanceDTO"""
    dto: Final[SubstanceDTO] = get_new_substance()
    context.substance_dto = str(dto)
    assert repr(dto) == context.substance_dto, "Invalid SubstanceDTO repr"

    assert not context.failed, "Unable to set SubstanceDTO"


@then("SubstanceDTO should be a string")
def substance_dto_string(context: Context) -> None:
    """SubstanceDTO should be a string"""
    assert context.substance_dto, "Invalid SubstanceDTO string"

    assert isinstance(context.substance_dto, str), "Invalid SubstanceDTO type"


# endregion

# region Get cache stats


@given("that a user wants cache stats")
def get_cache(_: Context) -> None:
    """Get cache stats"""


@when("/cache API endpoint is called")
def call_cache(context: Context) -> None:
    """Call /cache API"""
    context.stats = run_async(get_cache_stats())

    assert not context.failed, "/cache call failed"


@then("cache stats are returned")
def return_cache_stats(context: Context) -> None:
    """Return cache stats"""
    assert context.stats, "Invalid get_cache_stats results"


# endregion

# region Clear cache stats


@given("that a user wants to clear cache stats")
def clear_cache(_: Context) -> None:
    """Clear cache stats"""


@when("/cache/clear API endpoint is called")
def call_clear_cache(context: Context) -> None:
    """Call /cache/clear API"""
    context.stats = run_async(clear_cache_stats())

    assert not context.failed, "/cache/clear call failed"


@then("Cache cleared is returned")
def return_cache_cleared(context: Context) -> None:
    """Return cache cleared"""
    cache_cleared: Final[str] = "Cache cleared"

    assert context.stats == cache_cleared, "Invalid clear_cache_stats results"


# endregion

# region Get version


@given("a request for the version")
def request_version(context: Context) -> None:
    """Request version"""
    pyproject: Final[Box] = Box(load_pyproject(), frozen_box=True)
    context.real_version = pyproject.project.version


@when("/version API endpoint is called")
def call_get_version(context: Context) -> None:
    """Call /version API"""
    context.version = get_version()

    assert not context.failed, "/version call failed"


@then("port {port} is used")
def verify_port(_: Context, port: str) -> None:
    """Verify port"""
    assert int(port.replace('"', "")) == env.SOBER_API_PORT, f"Invalid port: {port}"


@then("version is returned")
def version_returned(context: Context) -> None:
    """Return version"""
    assert context.real_version == context.version, "Invalid get_version results"


@then("version is cached")
def verify_cache(_: Context) -> None:
    """Verify cache"""
    cache: Final[CacheInfo] = get_version.cache_info()

    assert cache.hits == 1, "Version not cached (hits)"
    assert cache.misses == 1, "Version not cached (misses)"


# endregion

# region Create user


@given("that a user wants to create a user record")
def create_user_record(_: Context) -> None:
    """Create user"""


@when("/user API endpoint is called (create)")
def call_create_user(context: Context) -> None:
    """Call /user API (create)"""
    _user_get_or_create(_get_user_hash(context.user), {})

    assert not context.failed, "/user (create) call failed"


@then("user data is created")
def create_user_data(context: Context) -> None:
    """Create user data"""
    user: Final[User | None] = User.get_or_none(User.user == _get_user_hash(context.user))

    assert user, "User not created"


# endregion

# region Get user


@given("that a user wants to get a user record from cache")
def get_user_record(_: Context) -> None:
    """Get user from cache"""


@when("/user API endpoint is called (get)")
def call_get_user(context: Context) -> None:
    """Call /user API (get)"""
    _user_get_or_create(_get_user_hash(context.user), {})

    assert not context.failed, "/user (get) call failed"


@then("user data is found in cache")
def verify_user_cache(_: Context) -> None:
    """Verify user cache"""
    cache: Final[CacheInfo] = _user_get_or_create.cache_info()

    assert cache.hits == 1, "User not cached (hits)"
    assert cache.misses == 1, "User not cached (misses)"


# endregion

# region Evict user


@given("that a user is evicted from cache")
def evict_user_record(_: Context) -> None:
    """Evict user from cache"""


@when("/user/evict API endpoint is called")
def call_evict_user(context: Context) -> None:
    """Call /user/evict API"""
    run_async(evict_user(context.user))


@then("user data is not found in cache")
def verify_not_in_user_cache(context: Context) -> None:
    """Verify not in user cache"""
    key: Final[tuple[str]] = _user_get_or_create.cache_key(_get_user_hash(context.user))

    assert key not in _user_get_or_create.cache


# endregion


# region Delete user


@given("that a user wants to delete a user record by ID")
def delete_user_record(_: Context) -> None:
    """Delete user"""


@when("/user/delete API endpoint is called with an ID")
def call_delete_user(context: Context) -> None:
    """Call /user/delete API"""
    delete_user(context.user)

    assert not context.failed, "/user/delete call failed"


@then("user data is deleted")
def user_is_deleted(context: Context) -> None:
    """User deleted"""
    user: Final[User | None] = User.get_or_none(User.user == _get_user_hash(context.user))

    assert not user, "Could not delete user"


# endregion

# region Add substance


@given("that a user wants to add a substance record")
def add_substance_record(context: Context) -> None:
    """Add substance"""
    _user_get_or_create(_get_user_hash(context.user), {})  # create


@when("/substances/add API endpoint is called")
def call_substance_add(context: Context) -> None:
    """Call /substances/add API"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = add_substance(substance, context.user)

    assert not context.failed, "/substance/add call failed"


@then("new substance is returned")
def return_new_substance(context: Context) -> None:
    """Return new substance"""
    assert context.substance, "Invalid add_substance results"


# endregion

# region Get substances


@given("that a user wants substance records")
def get_all_substances(_: Context) -> None:
    """Get substances"""


@when("/substances API endpoint is called")
def call_substances(context: Context) -> None:
    """Call /substances API"""
    context.substances = get_substances(context.user)

    assert not context.failed, "/substances call failed"


@then("substances are returned")
def return_substances(context: Context) -> None:
    """Return substances"""
    assert context.substances, "Invalid get_substances results"
    assert len(context.substances) == 1, "Incorrect get_substances length"

    get_substances(context.user)  # cache


@then("substances are cached")
def verify_substances_cache(_: Context) -> None:
    """Verify substances cache"""
    cache: Final[CacheInfo] = get_substances.cache_info()

    assert cache.hits == 1, "Substances not cached (hits)"
    assert cache.misses == 1, "Substances not cached (misses)"


# endregion

# region Get substance by ID


@given("that a user wants a substance by ID")
def get_substance_by_id(context: Context) -> None:
    """Get substance by ID"""
    context.substances = get_substances(context.user)

    assert context.substances, "Could not get substances"


@when("/substances/get API endpoint is called with an ID")
def call_get_substance(context: Context) -> None:
    """Call /substances/get API"""
    substance_id: Final[int | None] = context.substances[0].id
    assert substance_id is not None, "Invalid substance ID"

    context.substance = get_substance(substance_id, context.user)

    assert not context.failed, "/substances/get call failed"


@then("substance is returned")
def return_substance(context: Context) -> None:
    """Return substance"""
    assert context.substance, "Invalid get_substance results"


# endregion

# region Update substance by ID


@given("that a user wants to update a substance by ID")
def update_substance_by_id(context: Context) -> None:
    """Update substance"""
    context.substances = get_substances(context.user)

    assert context.substances, "Could not get substances"


@when("/substances/update API endpoint is called with an ID")
def call_update_substance(context: Context) -> None:
    """Call /substance/update API"""
    original: Final[SubstanceDTO] = context.substances[0]
    assert original.id is not None, "Invalid substance ID"

    context.date = original.date

    updated: Final[SubstanceDTO] = original.model_copy(update={"date": fake.date_time()})

    context.substance = update_substance(pk=original.id, substance=updated, user=context.user)

    assert not context.failed, "/substance/update call failed"


@then("updated substance is returned")
def return_updated_substance(context: Context) -> None:
    """Return updated substance"""
    assert context.substance, "Invalid substance from update"

    assert context.substance.date != context.date, "Could not update substance"


# endregion

# region Delete substance by ID


@given("that a user wants to delete a substance by ID")
def delete_substance_by_id(context: Context) -> None:
    """Delete substance"""
    substance: Final[list[Substance]] = list(Substance.select())

    assert substance, "Could not get Substance"

    context.substance_id = substance[0].id


@when("/substance/delete API endpoint is called with an ID")
def call_delete_substance(context: Context) -> None:
    """Call /substance/delete API"""
    delete_substance(pk=context.substance_id, user=context.user)

    assert not context.failed, "/substance/delete call failed"


@then("substance is deleted")
def is_deleted(context: Context) -> None:
    """Is deleted"""
    assert Substance.get_or_none(Substance.id == context.substance_id) is None, "Could not delete substance"


# endregion

# region Get favicon


@given("that a browser makes a request for favicon")
def request_favicon(_: Context) -> None:
    """Request favicon"""


@when("/favicon.ico API endpoint is called")
def call_favicon(context: Context) -> None:
    """Call /favicon API"""
    context.favicon = run_async(get_favicon())

    assert not context.failed, "/favicon call failed"


@then("Nothing is returned")
def favicon_return(context: Context) -> None:
    """Nothing is returned"""
    assert not context.favicon, "Invalid /favicon results"


# endregion

# region HTTP endpoints & middleware


def _make_token(subject: str) -> str:
    """Create unsecured JWT matching frontend format"""
    now: Final[int] = Instant.now().timestamp()

    return jwt_encode(
        payload={
            "aud": env.SOBER_NAME,
            "exp": now + 60,
            "iat": now,
            "iss": env.SOBER_JWT_FRONTEND,
            "sub": subject,
        },
        key="",
        algorithm="none",
    )


def _auth_headers(subject: str) -> dict[str, str]:
    """Return Bearer headers"""
    return {"Authorization": f"Bearer {_make_token(subject)}"}


@given("an HTTP test client")
def setup_http_client(context: Context) -> None:
    """Setup HTTP test client"""
    if not hasattr(context, "http_client"):
        context.http_client = TestClient(ROUTER, client=("127.0.0.1", 50000))


@when("/api/user is called without a token")
def http_user_no_token(context: Context) -> None:
    """Call /api/user without Authorization header"""
    context.response = context.http_client.get("/api/user")


@when("/api/user is called with an invalid token")
def http_user_invalid_token(context: Context) -> None:
    """Call /api/user with malformed token"""
    context.response = context.http_client.get("/api/user", headers={"Authorization": "Bearer invalid.token.here"})


@when("/api/user is called via HTTP (first time)")
def http_user_first(context: Context) -> None:
    """Call /api/user to create user"""
    context.http_user = fake.first_name()
    context.response = context.http_client.get("/api/user", headers=_auth_headers(context.http_user))


@when("/api/user is called via HTTP (second time)")
def http_user_second(context: Context) -> None:
    """Call /api/user for existing user"""
    context.response = context.http_client.get("/api/user", headers=_auth_headers(context.http_user))


@when("a substance is added via HTTP")
def http_add_substance(context: Context) -> None:
    """Add substance via HTTP"""
    context.http_user = fake.first_name()
    context.other_user = f"{context.http_user}_other"
    payload: Final[SubstanceDTO] = get_new_substance()
    context.http_payload = payload.model_dump(mode="json")
    context.http_client.get("/api/user", headers=_auth_headers(context.http_user))
    context.http_client.get("/api/user", headers=_auth_headers(context.other_user))

    context.response = context.http_client.post(
        "/api/substances/add",
        headers=_auth_headers(context.http_user),
        json=context.http_payload,
    )
    if context.response.status_code == status.HTTP_201_CREATED:
        context.created_substance = context.response.json()


@when("the same substance name is added again for the same user via HTTP")
def http_add_duplicate_substance(context: Context) -> None:
    """Attempt duplicate substance name for same user"""
    context.response = context.http_client.post(
        "/api/substances/add",
        headers=_auth_headers(context.http_user),
        json=context.http_payload,
    )


@when("the same substance name is added for another user via HTTP")
def http_add_same_name_other_user(context: Context) -> None:
    """Add substance with same name for a different user"""
    context.response = context.http_client.post(
        "/api/substances/add",
        headers=_auth_headers(context.other_user),
        json=context.http_payload,
    )


@when("a substance with a future date is added via HTTP")
def http_add_future_substance(context: Context) -> None:
    """Attempt adding substance with future date"""
    future_payload: Final[dict[str, object]] = {
        **context.http_payload,
        "date": Instant.now().add(hours=24).to_stdlib().isoformat(),
        "name": fake.word(),
    }
    context.response = context.http_client.post(
        "/api/substances/add",
        headers=_auth_headers(context.http_user),
        json=future_payload,
    )


@when("another user requests the created substance via HTTP")
def http_other_user_get(context: Context) -> None:
    """Attempt GET on another user's substance"""
    pk: Final[int] = context.created_substance["id"]
    context.response = context.http_client.get(
        f"/api/substances/get/{pk}",
        headers=_auth_headers(context.other_user),
    )


@when("another user updates the created substance via HTTP")
def http_other_user_update(context: Context) -> None:
    """Attempt PUT on another user's substance"""
    pk: Final[int] = context.created_substance["id"]
    context.response = context.http_client.put(
        f"/api/substances/update/{pk}",
        headers=_auth_headers(context.other_user),
        json=context.created_substance,
    )


@when("another user deletes the created substance via HTTP")
def http_other_user_delete(context: Context) -> None:
    """Attempt DELETE on another user's substance"""
    pk: Final[int] = context.created_substance["id"]
    context.response = context.http_client.delete(
        f"/api/substances/delete/{pk}",
        headers=_auth_headers(context.other_user),
    )


@then("HTTP status {code:d} is returned")
def verify_http_status(context: Context, code: int) -> None:
    """Verify HTTP response status code"""
    assert context.response.status_code == code, (
        f"Expected HTTP {code}, got {context.response.status_code}: {context.response.text}"
    )


@when("/api/substances is called via HTTP for a user with no substances")
def http_get_empty_substances(context: Context) -> None:
    """Call /api/substances for a user without substances"""
    empty_user: Final[str] = f"{fake.first_name()}_empty"
    context.response = context.http_client.get("/api/substances", headers=_auth_headers(empty_user))


@then("JSON response is null")
def verify_json_null(context: Context) -> None:
    """Verify JSON response body is null"""
    assert context.response.json() is None, f"Expected null JSON, got: {context.response.text}"


@when("/api/user/delete is called via HTTP for a nonexistent user")
def http_delete_missing_user(context: Context) -> None:
    """Attempt DELETE /api/user/delete for unknown user"""
    missing_user: Final[str] = f"{fake.first_name()}_missing"
    context.response = context.http_client.delete(
        f"/api/user/delete/{missing_user}",
        headers=_auth_headers(missing_user),
    )


@when("/api/user/delete is called via HTTP for that user")
def http_delete_existing_user(context: Context) -> None:
    """DELETE /api/user/delete for created user"""
    context.response = context.http_client.delete(
        f"/api/user/delete/{context.http_user}",
        headers=_auth_headers(context.http_user),
    )


# endregion
