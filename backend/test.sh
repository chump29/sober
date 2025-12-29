#!/usr/bin/env -S bash -e

source .venv/bin/activate

behave --stop

deactivate
