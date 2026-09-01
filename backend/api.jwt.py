#!.venv/bin/python

# ruff: noqa: T201

"""Generate unsecure JWT"""

from datetime import UTC, datetime, timedelta
from sys import argv
from typing import Final

from env import env
from jwt import encode

try:
    NAME: Final[str] = argv[1].strip()
except IndexError as e:
    print("❌ Invalid argument for NAME")
    raise SystemExit(1) from e

print(
    encode(
        {
            "aud": env["SOBER_NAME"],
            "exp": datetime.now(UTC) + timedelta(minutes=5),
            "iat": datetime.now(UTC),
            "iss": "sober-frontend",
            "sub": NAME,
        },
        key="",
        algorithm="none",
    )
)
