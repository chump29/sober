#!/usr/bin/env -S bash -e

export _user=chump29
export _repo=sober

export _frontendPort=89
export _backendPort=5560

getVersion() {
  echo ">=$(echo "$1" | cut -d '=' -f 2)"
}

clear

echo -e "📌 Packages:\n"

for _env in frontend backend; do
  pushd ../$_env > /dev/null

  echo -e "\e[4m${_env^^}\e[0m:\n"

  if [[ $_env == frontend ]]; then
    _bun=$(bun -v)
    export _bun
    echo -e " • Bun: $_bun"

    _mantine=$(jq -r '.dependencies."@mantine/core" // "❓"' package.json)
    _mantine=${_mantine:1}
    export _mantine
    echo -e " • @mantine/core: $_mantine"

    _react=$(jq -r '.dependencies.react // "❓"' package.json)
    _react=${_react:1}
    export _react
    echo -e " • react: $_react"

    _valibot=$(jq -r '.dependencies.valibot // "❓"' package.json)
    _valibot=${_valibot:1}
    export _valibot
    echo -e " • valibot: $_valibot"

    _vite=$(jq -r '.devDependencies.vite // "❓"' package.json)
    _vite=${_vite:1}
    export _vite
    echo -e " • vite: $_vite"

    echo -e "\n🧪 Running $_env tests…"
    bun run --bun test:coverage:silent

    _coverage=0
    if [[ -f tests/coverage/lcov.info ]]; then
      _coverage=$(bun run lcov-total tests/coverage/lcov.info)
    fi
    export _coverage
    echo -e "\n☂️  Coverage: $_coverage%"
  else
    _fastapi=$(yq '[.project.dependencies[] | select(test("^fastapi(\\[.*\\])?[>=<~!]"))] | .[0] // "❓"' pyproject.toml)
    if [[ $_fastapi != "❓" ]]; then
      _fastapi=$(getVersion "$_fastapi")
    fi
    export _fastapi
    echo -e " • fastapi: $_fastapi"

    _peewee=$(yq '[.project.dependencies[] | select(test("^peewee(\\[.*\\])?[>=<~!]"))] | .[0] // "❓"' pyproject.toml)
    if [[ $_peewee != "❓" ]]; then
      _peewee=$(getVersion "$_peewee")
    fi
    export _peewee
    echo -e " • peewee: $_peewee"

    _pydantic=$(yq '[.project.dependencies[] | select(test("^pydantic(\\[.*\\])?[>=<~!]"))] | .[0] // "❓"' pyproject.toml)
    if [[ $_pydantic != "❓" ]]; then
      _pydantic=$(getVersion "$_pydantic")
    fi
    export _pydantic
    echo -e " • pydantic: $_pydantic"

    _name=$(jq -r .name ../frontend/package.json)
    if [[ $HOSTNAME == guru ]]; then
      docker context use nova > /dev/null 2>&1
    fi
    _sqlite=N/A
    if [[ -n $(docker ps -q -f name="$_name") ]]; then
      _sqlite=$(docker exec "$_name" apk list --no-cache sqlite | cut -d " " -f 1)
      _sqlite=${_sqlite#sqlite-}
      _sqlite=${_sqlite%-r*}
    else
      if command -v htmlq > /dev/null; then
        _sqlite=$(curl -s https://pkgs.alpinelinux.org/package/edge/main/x86_64/sqlite | htmlq --text "strong[aria-label='Package up-to-date']")
        _sqlite=${_sqlite#sqlite-}
        _sqlite=${_sqlite%-r*}
      fi
    fi
    docker context use default > /dev/null 2>&1
    export _sqlite
    echo -e " • SQLite: $_sqlite"

    _uv=$(uv self version | grep -Po "[0-9]+\.[0-9]+\.[0-9]+")
    export _uv
    echo -e " • uv: $_uv"

    echo -e "\n🧪 Running $_env tests…"
    ./test.sh -q

    _coverage=0
    if [[ -f coverage/coverage.json ]]; then
      _coverage=$(jq -r .totals.percent_statements_covered_display coverage/coverage.json)
    fi
    export _coverage
    echo -e "\n☂️  Coverage: $_coverage%"
  fi

  popd > /dev/null

  echo -e "\n🛠️  Creating $_env README.md…\n"

  envsubst < README-$_env.template.md > ../$_env/README.md
done

echo -e "🛠️  Creating README.md…\n"

envsubst < README.template.md > ../README.md

echo -e "✔️  Done!\n"
