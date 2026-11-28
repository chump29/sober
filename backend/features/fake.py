#!.venv/bin/python

"""Provides fake data"""

from decimal import Decimal
from typing import TYPE_CHECKING, Final

from mimesis import Development, Numeric, Person, Text, random
from whenever import Instant, ItemizedDateDelta

if TYPE_CHECKING:
    from datetime import datetime
    from enum import Enum


class Fake:
    """Fake data"""

    def __init__(self) -> None:
        """Initialization"""
        self._development = Development()
        self._numeric = Numeric()
        self._random = random.Random()
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
        val = Decimal(str(self._numeric.float_number(start=start, end=end, precision=precision)))

        return val.quantize(Decimal(f"1e-{precision}"))

    def enum_value[E: Enum](self, enum: type[E]) -> E:
        """Get Enum value

        Args:
            enum (Enum): Enum

        Returns:
            Any: Enum value
        """
        return self._random.choice_enum_item(enum)

    def date_time(self, years_ago: int = 5) -> datetime:
        """Get UTC datetime in the past

        Args:
            years_ago (int, optional): Number of years ago. Defaults to 5.

        Returns:
            datetime: Value between five years ago and now
        """
        days_ago: int = (
            ItemizedDateDelta(years=years_ago)
            .in_units(["days"], relative_to=Instant.now().to_tz("UTC").date())
            .get("days")
            or 0
        )

        return Instant.now().subtract(hours=self._numeric.integer_number(1, days_ago * 24)).to_stdlib()

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
