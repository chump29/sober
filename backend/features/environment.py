#!.venv/bin/python

"""Environment setup"""

from decimal import Decimal
from pathlib import Path
from typing import TYPE_CHECKING, Final

from fake import fake
from rich.console import Console

from api import CostType, StatsType, SubstanceDTO, User
from env import env

if TYPE_CHECKING:
    from behave.model import Feature
    from behave.runner import Context

CONSOLE: Final[Console] = Console()


def log(what: str, obj: str) -> None:
    """Log message"""
    CONSOLE.print(f"💡 [bold yellow]{what}:[/bold yellow] [blue]{obj}[/blue]")


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


def before_feature(context: Context, _: Feature) -> None:
    """Run before features"""
    User.delete().execute()  # pylint: disable=no-value-for-parameter

    context.user = fake.first_name()
    assert context.user, "Could not set user"


def after_feature(_: Context, __: Feature) -> None:
    """Run after features"""
    for filename in Path(env.SOBER_DB_PATH).glob("sober.test.*"):
        Path(filename).unlink()
