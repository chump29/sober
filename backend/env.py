#!.venv/bin/python

"""Handle environment variables"""

from typing import Final

from box import Box
from loadfig import pyproject as load_pyproject
from venvalid import bool_, int_, list_, str_, venvalid
from venvalid.dotenv import load_env_file

load_env_file(".env.local", override=True)

pyproject: Final[Box] = Box(load_pyproject(), frozen_box=True)

MIN_PORT: Final[int] = 1024
MAX_PORT: Final[int] = 65_535

env: Final[Box] = Box(
    venvalid(
        {
            "SOBER_API_PORT": int_(default=5560, validate=lambda i: MIN_PORT <= i <= MAX_PORT),
            "SOBER_DB_FILE": str_(default="sober.db"),
            "SOBER_DB_PATH": str_(default="./db"),
            "SOBER_DEBUG": bool_(default=False),
            "SOBER_JWT_FRONTEND": str_(default="sober-frontend"),
            "SOBER_NAME": str_(default=pyproject.project.name),
            "SOBER_URLS": list_(default=[]),
            "SOBER_VERSION": str_(default=pyproject.project.version),
        }
    ),
    frozen_box=True,
)

if __name__ == "__main__":
    from rich import print as show
    from rich.json import JSON
    from rich.panel import Panel

    show(Panel(JSON(env.to_json()), title="[bold red]Default Values[/bold red]", expand=False))
