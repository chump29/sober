#!.venv/bin/python

# pylint: disable=not-callable

"""CRUD tests"""

from pathlib import Path
from tomllib import load
from typing import TYPE_CHECKING, Final

# pylint: disable-next=import-error
from api import (
    PORT,
    SubstanceDTO,
    UserDTO,
    add_substance,
    clear_cache_stats,
    delete_substance,
    get_cache_stats,
    get_substance,
    get_substances,
    get_user,
    get_version,
    update_substance,
    update_user,
)
from behave import given, then, when
from box import Box
from environment import get_new_substance
from faker import Faker

if TYPE_CHECKING:
    from behave.runner import Context
    from cachetools import _CacheInfo
else:
    Context = object
    _CacheInfo = object

fake: Final[Faker] = Faker()


# region Get user


@given("that a user wants a user record")
def get_user_record(_: Context) -> None:
    """Get user"""


@when("/user API endpoint is called")
def call_user(context: Context) -> None:
    """Call /user API"""
    context.user = get_user(context.user_name)
    assert not context.failed, "/user call failed"


@then("user data is returned")
def return_user_data(context: Context) -> None:
    """Return user data"""
    assert context.user, "Invalid get_user results"
    user: Final[UserDTO] = context.user
    assert isinstance(user.show_coin, bool), "showCoin not set"
    assert isinstance(user.show_cost, bool), "showCost not set"


# endregion


# region Update user


@given("that a user wants to update a user record")
def update_user_record(_: Context) -> None:
    """Update user"""


@when("/user/update API endpoint is called with data")  # type: ignore[reportArgumentType]
async def call_update_user(context: Context) -> None:
    """Call /user/update API with data"""
    user: Final[UserDTO | None] = get_user(context.user_name)
    assert user, "get_user failed for update"
    user.show_cost = True
    context.user = await update_user(user, context.user_name)
    assert not context.failed, "/user/update call failed"


@then("user data is updated")
def return_updated_user_data(context: Context) -> None:
    """Return updated user data"""
    assert context.user, "Could not update user"
    user: Final[UserDTO] = context.user
    assert isinstance(user.show_cost, bool), "show_cost not a boolean"
    assert user.show_cost, "Could not set show_cost"


# endregion


# region Add substance


@given("that a user wants to add a substance record")
def add_substance_record(_: Context) -> None:
    """Add substance"""


@when("/substances/add API endpoint is called")  # type: ignore[reportArgumentType]
async def call_substance_add(context: Context) -> None:
    """Call /substances/add API"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = await add_substance(substance, context.user_name)
    assert not context.failed, "/substance/add call failed"


@then("new substance is returned")
def return_new_substance(context: Context) -> None:
    """Return new substance"""
    assert context.substance, "Invalid add_substance results"


# endregion


# region Get all substances


@given("that a user wants all substance records")
def get_all_substances(_: Context) -> None:
    """Get all substances"""


@when("/substances API endpoint is called")
def call_substances(context: Context) -> None:
    """Call /substances API"""
    context.substances = get_substances(context.user_name)
    assert not context.failed, "/substances call failed"


@then("all substances are returned")
def return_all_substances(context: Context) -> None:
    """Return all substances"""
    assert context.substances, "Invalid get_all_substances results"
    assert len(context.substances) == 1, "Incorrect get_all_substances length"


# endregion


# region Get substance by ID


@given("that a user wants a substance by ID")  # type: ignore[reportArgumentType]
async def get_substance_by_id(context: Context) -> None:
    """Get substance by ID"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = await add_substance(substance, context.user_name)


@when("/substances/get API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_get_substance(context: Context) -> None:
    """Call /substances/get API"""
    context.substance = await get_substance(context.substance.id, context.user_name)
    assert not context.failed, "/substances/get call failed"


@then("substance is returned")
def return_substance(context: Context) -> None:
    """Return substance"""
    assert context.substance, "Invalid get_substance results"


# endregion


# region Delete substance by ID


@given("that a user wants to delete a substance by ID")  # type: ignore[reportArgumentType]
async def delete_substance_by_id(context: Context) -> None:
    """Delete substance"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = await add_substance(substance, context.user_name)


@when("/substance/delete API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_delete_substance(context: Context) -> None:
    """Call /substance/delete API"""
    context.isDeleted = await delete_substance(pk=context.substance.id, user=context.user_name)
    assert not context.failed, "/substance/delete call failed"


@then("substance is deleted")
def is_deleted(context: Context) -> None:
    """Is deleted"""
    assert context.isDeleted, "Could not delete substance"


# endregion


# region Update substance by ID


@given("that a user wants to update a substance by ID")  # type: ignore[reportArgumentType]
async def update_substance_by_id(context: Context) -> None:
    """Update substance"""
    substance: Final[SubstanceDTO] = get_new_substance()
    context.substance = await add_substance(substance, context.user_name)


@when("/substances/update API endpoint is called with an ID")  # type: ignore[reportArgumentType]
async def call_update_substance(context: Context) -> None:
    """Call /substance/update API"""
    substance: Final[SubstanceDTO | None] = context.substance
    assert substance, "Invalid substance for update"
    context.date = substance.date
    substance.date = fake.future_date("+60d")
    context.substance = await update_substance(pk=context.substance.id, substance=substance, user=context.user_name)
    assert not context.failed, "/substance/update call failed"


@then("updated substance is returned")
def return_updated_substance(context: Context) -> None:
    """Return updated substance"""
    assert context.substance, "Invalid substance from update"
    assert context.substance.date != context.date, "Could not update substance"


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
    with Path("pyproject.toml").open("rb") as pyproject:
        context.real_version = str(Box(load(pyproject), frozen_box=True).project.version)


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


@then("version is cached")
def verify_cache(_: Context) -> None:
    """Verify cache"""
    cache: Final[_CacheInfo] = get_version.cache_info()
    assert cache.hits == 1, "Version not cached (hits)"
    assert cache.misses == 1, "Version not cached (misses)"


# endregion


# region Stringify a UserDTO


@given("that a UserDTO should stringify")
def stringify_user_dto(_: Context) -> None:
    """Stringify a UserDTO"""


@when("a UserDTO is output")
def output_user_dto(context: Context) -> None:
    """Output a UserDTO"""
    context.user_dto = str(
        UserDTO(
            showCoin=fake.boolean(),
            showCost=fake.boolean(),
        )
    )
    assert not context.failed, "Unable to set UserDTO"


@then("UserDTO should be a string")
def user_dto_string(context: Context) -> None:
    """UserDTO should be a string"""
    assert context.user_dto, "Invalid UserDTO string"
    assert isinstance(context.user_dto, str), "Invalid UserDTO type"


# endregion


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


# endregion
