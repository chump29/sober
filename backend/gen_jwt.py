#!.venv/bin/python

"""Generate unsecure JWT"""

from typing import Annotated

from env import env
from jwt import encode
from typer import Option, run
from whenever import Instant


def main(
    name: Annotated[str, Option(help="User name", prompt="Enter user name")],
    minutes: Annotated[float, Option("--minutes", "-m", help="Valid for", min=1.0, clamp=True)] = 1.0,
) -> None:
    """Create JWT"""
    print(  # noqa: T201
        encode(
            {
                "aud": env.SOBER_JWT_FRONTEND,
                "exp": Instant.now().add(minutes=minutes).timestamp(),
                "iat": Instant.now().timestamp(),
                "iss": env.SOBER_NAME,
                "sub": name,
            },
            key="",
            algorithm="none",
        )
    )


if __name__ == "__main__":
    run(main)
