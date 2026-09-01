#!.venv/bin/python

# pylint: disable=not-callable

"""CRUD tests"""

from datetime import UTC
from json import dumps
from pathlib import Path
from tomllib import loads
from typing import TYPE_CHECKING, Any, Final

# pylint: disable-next=import-error
from api import (
    PORT,
    Substance,
    SubstanceDTO,
    User,
    add_substance,
    clear_cache_stats,
    delete_substance,
    delete_user,
    get_cache_stats,
    get_favicon,
    get_substance,
    get_substances,
    get_user,
    get_user_hash,
    get_version,
    update_substance,
)
from behave import given, then, when
from environment import fake, get_new_substance, log  # pylint: disable=import-error

if TYPE_CHECKING:
    from behave.runner import Context
    from cachetools import _CacheInfo
else:
    Context = object
    _CacheInfo = object

# region Stringify a SubstanceDTO


@given("that a SubstanceDTO should stringify")
def stringify_substance_dto(_: Context) -> None:
    """Stringify a SubstanceDTO"""


@when("a SubstanceDTO is output")
def output_substance_dto(context: Context) -> None:
    """Output a SubstanceDTO"""
    context.substance_dto = str(get_new_substance())
    assert not context.failed, "Unable to set SubstanceDTO"


@then("SubstanceDTO should be a string")
def substance_dto_string(context: Context) -> None:
    """SubstanceDTO should be a string"""
    assert context.substance_dto, "Invalid SubstanceDTO string"
    assert isinstance(context.substance_dto, str), "Invalid SubstanceDTO type"
    if context.config.wip:
        log("SubstanceDTO", context.substance_dto)


# endregion

# region Get cache stats


@given("that a user wants cache stats")
def get_cache(_: Context) -> None:
    """Get cache stats"""


@when("/cache API endpoint is called")  # type: ignore[reportArgumentType]
async def call_cache(context: Context) -> None:
    """Call /cache API"""
    context.stats = await get_cache_stats()
    assert not context.failed, "/cache call failed"


@then("cache stats are returned")
def return_cache_stats(context: Context) -> None:
    """Return cache stats"""
    assert context.stats, "Invalid get_cache_stats results"
    if context.config.wip:
        log("Stats", dumps(context.stats, indent=2))


# endregion

# region Clear cache stats


@given("that a user wants to clear cache stats")
def clear_cache(_: Context) -> None:
    """Clear cache stats"""


@when("/cache/clear API endpoint is called")  # type: ignore[reportArgumentType]
async def call_clear_cache(context: Context) -> None:
    """Call /cache/clear API"""
    context.stats = await clear_cache_stats()
    assert not context.failed, "/cache/clear call failed"


@then("Cache cleared is returned")
def return_cache_cleared(context: Context) -> None:
    """Return cache cleared"""
    assert context.stats == "Cache cleared", "Invalid clear_cache_stats results"


# endregion

# region Get version


@given("a request for the version")
def request_version(context: Context) -> None:
    """Request version"""
    pyproject: Final[dict[str, Any]] = loads(Path("pyproject.toml").read_text(encoding="utf-8"))
    context.real_version = pyproject["project"]["version"]


@when("/version API endpoint is called")
def call_get_version(context: Context) -> None:
    """Call /version API"""
    context.version = get_version()
    assert not context.failed, "/version call failed"


@then("port {port} is used")
def verify_port(_: Context, port: str) -> None:
    """Verify port"""
    assert int(port.replace('"', "")) == PORT, f"Invalid port: {port}"


@then("version is returned")
def version_returned(context: Context) -> None:
    """Return version"""
    assert context.real_version == context.version, "Invalid get_version results"
    if context.config.wip:
        log("Version", context.version)


@then("version is cached")
def verify_cache(_: Context) -> None:
    """Verify cache"""
    cache: Final[_CacheInfo] = get_version.cache_info()
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
    get_user(context.user)
    assert not context.failed, "/user (create) call failed"


@then("user data is created")
def create_user_data(context: Context) -> None:
    """Create user data"""
    user: Final[User | None] = User.get_or_none(user=get_user_hash(context.user))
    assert user, "User not created"
    if context.config.wip:
        log("User", str(user))


# endregion

# region Get user


@given("that a user wants to get a user record from cache")
def get_user_record(_: Context) -> None:
    """Get user from cache"""


@when("/user API endpoint is called (get)")
def call_get_user(context: Context) -> None:
    """Call /user API (get)"""
    get_user(context.user)
    assert not context.failed, "/user (get) call failed"


@then("user data is found in cache")
def verify_user_cache(_: Context) -> None:
    """Verify user cache"""
    cache: Final[_CacheInfo] = get_user.cache_info()
    assert cache.hits == 1, "User not cached (hits)"
    assert cache.misses == 1, "User not cached (misses)"


# endregion

# region Delete user


@given("that a user wants to delete a user record by ID")
def delete_user_record(_: Context) -> None:
    """Delete user"""


@when("/user/delete API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_delete_user(context: Context) -> None:
    """Call /user/delete API"""
    await delete_user(get_user_hash(context.user))
    assert not context.failed, "/user/delete call failed"


@then("user data is deleted")
def user_is_deleted(context: Context) -> None:
    """User deleted"""
    user: Final[User | None] = User.get_or_none(user=get_user_hash(context.user))
    assert not user, "Could not delete user"


# endregion

# region Add substance


@given("that a user wants to add a substance record")
def add_substance_record(context: Context) -> None:
    """Add substance"""
    get_user(context.user)  # create


@when("/substances/add API endpoint is called")  # type: ignore[reportArgumentType]
async def call_substance_add(context: Context) -> None:
    """Call /substances/add API"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = await add_substance(substance, context.user)
    assert not context.failed, "/substance/add call failed"


@then("new substance is returned")
def return_new_substance(context: Context) -> None:
    """Return new substance"""
    assert context.substance, "Invalid add_substance results"
    if context.config.wip:
        log("SubstanceDTO", context.substance)


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
    cache: Final[_CacheInfo] = get_substances.cache_info()
    assert cache.hits == 1, "Substances not cached (hits)"
    assert cache.misses == 1, "Substances not cached (misses)"


# endregion

# ! context lost

# region Get substance by ID


@given("that a user wants a substance by ID")
def get_substance_by_id(context: Context) -> None:
    """Get substance by ID"""
    context.substances = get_substances(context.user)
    assert context.substances, "Could not get substances"


@when("/substances/get API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_get_substance(context: Context) -> None:
    """Call /substances/get API"""
    context.substance = await get_substance(context.substances[0].id, context.user)
    assert not context.failed, "/substances/get call failed"


@then("substance is returned")
def return_substance(context: Context) -> None:
    """Return substance"""
    assert context.substance, "Invalid get_substance results"


# endregion

# ! context lost

# region Update substance by ID


@given("that a user wants to update a substance by ID")
def update_substance_by_id(context: Context) -> None:
    """Update substance"""
    context.substances = get_substances(context.user)
    assert context.substances, "Could not get substances"


@when("/substances/update API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_update_substance(context: Context) -> None:
    """Call /substance/update API"""
    substance: Final[SubstanceDTO] = context.substances[0]
    assert substance, "Invalid substance"
    context.date = substance.date
    substance.date = fake.past_datetime(tzinfo=UTC)
    user: Final[User | None] = User.get_or_none(user=get_user_hash(context.user))
    assert user, "Invalid user"
    context.substance = await update_substance(pk=user.id, substance=substance, user=context.user)
    assert not context.failed, "/substance/update call failed"


@then("updated substance is returned")
def return_updated_substance(context: Context) -> None:
    """Return updated substance"""
    assert context.substance, "Invalid substance from update"
    assert context.substance.date != context.date, "Could not update substance"
    if context.config.wip:
        log("SubstanceDTO", context.substance)


# endregion

# ! context lost

# region Delete substance by ID


@given("that a user wants to delete a substance by ID")
def delete_substance_by_id(context: Context) -> None:
    """Delete substance"""
    substance: Final[list[Substance]] = list(Substance.select())
    assert substance, "Could not get Substance"
    context.substance_id = substance[0].id


@when("/substance/delete API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_delete_substance(context: Context) -> None:
    """Call /substance/delete API"""
    context.isDeleted = await delete_substance(pk=context.substance_id, user=context.user)
    assert not context.failed, "/substance/delete call failed"


@then("substance is deleted")
def is_deleted(context: Context) -> None:
    """Is deleted"""
    assert context.isDeleted, "Could not delete substance"


# endregion

# ! context lost

# region Get favicon


@given("that a browser makes a request for favicon")
def request_favicon(_: Context) -> None:
    """Request favicon"""


@when("/favicon.ico API endpoint is called")  # type: ignore[reportArgumentType]
async def call_favicon(context: Context) -> None:
    """Call /favicon API"""
    context.favicon = await get_favicon()
    assert not context.failed, "/favicon call failed"


@then("Nothing is returned")
def favicon_return(context: Context) -> None:
    """Nothing is returned"""
    assert not context.favicon, "Invalid /favicon results"


# endregion
