#!.venv/bin/python

"""Handle environment variables"""

from os import environ
from pathlib import Path
from tomllib import loads
from typing import Final

from box import Box
from venvalid import bool_, int_, str_, venvalid
from venvalid.dotenv import load_env_file

load_env_file(".env")
load_env_file(".env.local", override=True)

pyproject: Box = Box(loads(Path("pyproject.toml").read_text(encoding="utf-8")), frozen_box=True)
environ["SOBER_NAME"] = pyproject.project.name
environ["SOBER_VERSION"] = pyproject.project.version

MIN_PORT: Final[int] = 1024
MAX_PORT: Final[int] = 65_535

env: Final[Box] = Box(
    venvalid(
        {
            "SOBER_API_PORT": int_(default=5560, validate=lambda i: MIN_PORT <= i <= MAX_PORT),
            "SOBER_DB_FILE": str_(default="sober.db"),
            "SOBER_DB_PATH": str_(default="./db"),
            "SOBER_DEBUG": bool_(default=False),
            "SOBER_JWT_AUDIENCE": str_(default="sober-frontend"),
            "SOBER_NAME": str_(),
            "SOBER_VERSION": str_(),
        },
        pretty=True,
    ),
    frozen_box=True,
)
