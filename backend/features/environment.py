#!.venv/bin/python

"""Environment setup"""

from contextlib import ExitStack
from decimal import Decimal
from logging import CRITICAL, getLogger
from pathlib import Path
from typing import TYPE_CHECKING, Final

from fake import fake
from fastapi.testclient import TestClient

# pylint: disable=import-private-name
from api import DB, ROUTER, CostType, StatsType, SubstanceDTO, User, _user_get_or_create, get_substances
from env import env

if TYPE_CHECKING:
    from behave.model import Feature
    from behave.runner import Context

for _logger_name in ("guard_core", "guard"):
    _logger = getLogger(_logger_name)
    _logger.setLevel(CRITICAL)
    _logger.handlers.clear()
    _logger.propagate = False


def get_new_substance() -> SubstanceDTO:
    """Return new SubstanceDTO"""
    show_cost: Final[bool] = fake.boolean()

    return SubstanceDTO(
        cost=(fake.decimal() if show_cost else Decimal()),
        costType=fake.enum_value(CostType),
        date=fake.date_time(),
        id=fake.integer(),
        name=fake.word(),
        showCoin=fake.boolean(),
        showCost=show_cost,
        showDecimals=fake.boolean(),
        showTime=fake.boolean(),
        statsType=fake.enum_value(StatsType),
    )


def before_all(context: Context) -> None:
    """Run before all features"""
    context.exit_stack = ExitStack()

    context.http_client = context.exit_stack.enter_context(TestClient(ROUTER, client=("127.0.0.1", 50000)))


def before_feature(context: Context, _: Feature) -> None:
    """Run before features"""
    User.delete().execute()  # pylint: disable=no-value-for-parameter

    _user_get_or_create.cache_clear()

    get_substances.cache_clear()

    context.user = fake.first_name()
    if not context.user:
        msg = "Could not set user"
        raise ValueError(msg)


def after_all(context: Context) -> None:
    """Run after features"""
    if hasattr(context, "exit_stack"):
        context.exit_stack.close()

    if not DB.is_closed():
        DB.close()

    for filename in Path(env.SOBER_DB_PATH).glob("sober.test.*"):
        filename.unlink(missing_ok=True)
