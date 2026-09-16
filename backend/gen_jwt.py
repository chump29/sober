#!.venv/bin/python

"""Generate unsecure JWT"""

from datetime import UTC, datetime, timedelta
from pathlib import Path
from tomllib import loads
from typing import Annotated, Final

from box import Box
from env import env
from jwt import encode
from typer import Option, run

pyproject: Final[Box] = Box(loads(Path("pyproject.toml").read_text(encoding="utf-8")), frozen_box=True)


def main(
    name: Annotated[str, Option(help="User name", prompt="Enter user name")],
    minutes: Annotated[float, Option("--minutes", "-m", help="Valid for", min=1.0, clamp=True)] = 1.0,
) -> None:
    """Create JWT"""
    print(  # noqa: T201
        encode(
            {
                "aud": env.SOBER_JWT_AUDIENCE,
                "exp": datetime.now(UTC) + timedelta(minutes=minutes),
                "iat": datetime.now(UTC),
                "iss": env.SOBER_NAME,
                "sub": name,
            },
            key="",
            algorithm="none",
        )
    )


if __name__ == "__main__":
    run(main)
