#!/usr/bin/env -S bash -e

export SOBER_DB_FILE=sober.test.db

_quiet=false

while getopts "q" flag; do
  case ${flag} in
    q)
      _quiet=true
      ;;
    *)
      echo "Usage: $0 [-q]" >&2
      exit 1
      ;;
  esac
done

if $_quiet; then
  uv run --module behave --stop --format null --no-summary
else
  rm -f .coverage*

  uv run coverage run --module behave --stop
  echo
  uv run coverage report
  uv run coverage json
fi
