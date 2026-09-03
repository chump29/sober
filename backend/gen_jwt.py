#!.venv/bin/python

"""Generate unsecure JWT"""

from argparse import ArgumentDefaultsHelpFormatter, ArgumentParser, Namespace
from datetime import UTC, datetime, timedelta
from typing import Final

from env import env
from jwt import encode

parser: Final[ArgumentParser] = ArgumentParser(
    description="JWT token creator", formatter_class=ArgumentDefaultsHelpFormatter
)
parser.add_argument("name", help="User name")
parser.add_argument("-m", "--minutes", help="Valid for", type=float, default=1)
ARGS: Final[Namespace] = parser.parse_args()

print(  # noqa: T201
    encode(
        {
            "aud": env["SOBER_NAME"],
            "exp": datetime.now(UTC) + timedelta(minutes=ARGS.minutes),
            "iat": datetime.now(UTC),
            "iss": "sober-frontend",
            "sub": ARGS.name,
        },
        key="",
        algorithm="none",
    )
)
