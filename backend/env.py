#!.venv/bin/python

"""Handle environment variables"""

from os import environ
from pathlib import Path
from tomllib import load
from typing import Final

from box import Box
from rich.console import Console
from rich.traceback import install as catch_exceptions

CONSOLE: Final[Console] = Console()
catch_exceptions()


def set_env_vars() -> None:
    """Set environment variables"""
    try:
        with Path("pyproject.toml").open("rb") as pyproject:
            fields: Final[Box] = Box(load(pyproject), frozen_box=True)
            environ["_NAME"] = str(fields.project.name)
            environ["_VERSION"] = str(fields.project.version)
    except Exception:  # pylint: disable=broad-exception-caught
        CONSOLE.print_exception()
