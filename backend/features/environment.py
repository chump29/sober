#!.venv/bin/python

"""Environment setup"""

from pathlib import Path
from typing import TYPE_CHECKING, Final

# pylint: disable-next=import-error
from api import DB_PATH, SubstanceDTO, User
from faker import Faker

if TYPE_CHECKING:
    from behave.model import Feature
    from behave.runner import Context
else:
    Context = object
    Feature = object

fake: Final[Faker] = Faker()


def get_new_substance() -> SubstanceDTO:
    """Return new SubstanceDTO"""
    return SubstanceDTO(date=fake.future_date(), id=fake.pyint(min_value=1, max_value=100), name=fake.word())


def before_feature(context: Context, _: Feature) -> None:
    """Run before features"""
    User.delete().execute(None)
    context.user_name = fake.first_name()
    assert context.user_name, "Could not set user_name"


def after_feature(_: Context, __: Feature) -> None:
    """Run after features"""
    for filename in Path(DB_PATH).glob("sober.test.*"):
        Path(filename).unlink()
