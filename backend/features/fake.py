#!.venv/bin/python

"""Provides fake data"""

from decimal import Decimal
from typing import TYPE_CHECKING, Final

from api import CostType  # pylint: disable=import-error
from mimesis import Datetime, Development, Numeric, Person, Text, random
from pytz import UTC

if TYPE_CHECKING:
    from datetime import datetime


class Fake:
    """Fake data"""

    def __init__(self) -> None:
        """Initialization"""
        self._development = Development()
        self._numeric = Numeric()
        self._random = random.Random()
        self._datetime = Datetime()
        self._text = Text()
        self._person = Person()

    def boolean(self) -> bool:
        """Get boolean

        Returns:
            bool: `True` or `False`
        """
        return self._development.boolean()

    def decimal(self, start: float = 10.0, end: float = 100.0, precision: int = 2) -> Decimal:
        """Get Decimal

        Args:
            start (float, optional): Starting value. Defaults to 10.
            end (float, optional): Ending value. Default to 100.
            precision (int): Decimal precision. Defaults to 2.

        Returns:
            Decimal: Value between `start` and `end`
        """
        return Decimal(str(self._numeric.float_number(start=start, end=end, precision=precision)))

    def cost_type(self) -> int:
        """Get CostType

        Returns:
            int: CostType value
        """
        return self._random.choice_enum_item(CostType)

    def date_time(self, years_ago: int = 5) -> datetime:
        """Get UTC datetime

        Args:
            years_ago (int, optional): Number of years ago. Defaults to 5.

        Returns:
            datetime: Value between five years ago and now
        """
        return self._datetime.past_datetime(days=years_ago, timezone=str(UTC))

    def integer(self, start: int = 1, end: int = 100) -> int:
        """Get integer

        Args:
            start (int): Starting value. Defaults to 1.
            end (int): Ending value. Defaults to 100.

        Returns:
            int: Integer value
        """
        return self._numeric.integer_number(start=start, end=end)

    def word(self) -> str:
        """Get word

        Returns:
            str: Word
        """
        return self._text.word()

    def first_name(self) -> str:
        """Get first name

        Returns:
            str: First name
        """
        return self._person.first_name()


fake: Final[Fake] = Fake()
