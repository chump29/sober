#!.venv/bin/python

"""Environment setup"""

from decimal import Decimal
from pathlib import Path
from typing import TYPE_CHECKING, Final

from api import DB_PATH, CostType, SubstanceDTO, User  # pylint: disable=import-error
from faker import Faker
from rich.console import Console
from substances import SUBSTANCES  # pyright: ignore[reportMissingImports]

if TYPE_CHECKING:
    from behave.model import Feature
    from behave.runner import Context
else:
    Context = object
    Feature = object

CONSOLE: Final[Console] = Console()

fake: Final[Faker] = Faker()


def log(what: str, obj: str) -> None:
    """Log message"""
    CONSOLE.print(f"💡 [bold yellow]{what}:[/bold yellow] [blue]{obj}[/blue]")


def get_new_substance() -> SubstanceDTO:
    """Return new SubstanceDTO"""
    show_cost: Final[bool] = fake.boolean()
    return SubstanceDTO(
        cost=(
            fake.pydecimal(left_digits=fake.random_int(min=2, max=3), right_digits=2, positive=True)
            if show_cost
            else Decimal()
        ),
        costType=fake.enum(CostType),
        date=fake.date_this_decade(),
        id=fake.pyint(min_value=1, max_value=100),
        name=fake.random_element(SUBSTANCES),
        showCoin=fake.boolean(),
        showCost=show_cost,
        showDecimals=fake.boolean(),
    )


def before_feature(context: Context, _: Feature) -> None:
    """Run before features"""
    User.delete().execute(None)
    context.user = fake.first_name()
    assert context.user, "Could not set user"
    if context.config.wip:
        log("User", context.user)


def after_feature(_: Context, __: Feature) -> None:
    """Run after features"""
    for filename in Path(DB_PATH).glob("sober.test.*"):
        Path(filename).unlink()
