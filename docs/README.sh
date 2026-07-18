#!/usr/bin/env -S bash -e

export _user=chump29
export _repo=sober

export _frontendPort=89
export _backendPort=5560

getVersion() {
  echo ">=$(echo "$1" | cut -d '=' -f 2)"
}

clear

for _env in frontend backend; do
  pushd ../$_env > /dev/null

  echo -e "\e[4m${_env^^}\e[0m:\n"

  echo -e "🛈 Info:\n"

  if [[ $_env == "frontend" ]]; then
    _version=$(jq -r '.version // "❓"' package.json)
    export _version
    echo -e " • Version: $_version"

    echo -e " • Port: $_frontendPort"

    echo -e "\n📌 Packages:\n"

    _bun=$(bun --version)
    bun pm pkg set packageManager="bun@$_bun" engines.bun="~$_bun" > /dev/null 2>&1
    _bun=~$_bun
    export _bun
    echo -e " • Bun: $_bun"

    _mantine=$(jq -r '.dependencies."@mantine/core" // "❓"' package.json)
    export _mantine
    echo -e " • @mantine/core: $_mantine"

    _react=$(jq -r '.dependencies.react // "❓"' package.json)
    export _react
    echo -e " • react: $_react"

    _typescript=$(jq -r '.overrides.typescript // "❓"' package.json)
    export _typescript
    echo -e " • typescript: $_typescript"

    _valibot=$(jq -r '.dependencies.valibot // "❓"' package.json)
    export _valibot
    echo -e " • valibot: $_valibot"

    _vite=$(jq -r '.devDependencies.vite // "❓"' package.json)
    export _vite
    echo -e " • vite: $_vite"

    echo -e "\n🧪 Running $_env tests..."
    bun run --bun test:coverage

    _coverage=0
    if [ -f "tests/coverage/lcov.info" ]; then
      _coverage=$(bun run lcov-total tests/coverage/lcov.info)
    fi
    export _coverage
    echo -e "\n☂️  Coverage: $_coverage%"
  else
  _version=$(yq '.project.version // "❓"' pyproject.toml)
    export _version
    echo -e " • Version: $_version"

    echo -e " • Port: $_backendPort"

    echo -e "\n📌 Packages:\n"

    _behave=$(yq '.project.optional-dependencies.dev[0] // "❓"' pyproject.toml)
    if [[ $_behave != "❓" ]]; then
      _behave=$(getVersion "$_behave")
    fi
    export _behave
    echo -e " • behave: $_behave"

    _fastapi=$(yq '.project.dependencies[1] // "❓"' pyproject.toml)
    if [[ $_fastapi != "❓" ]]; then
      _fastapi=$(getVersion "$_fastapi")
    fi
    export _fastapi
    echo -e " • fastapi: $_fastapi"

    _peewee=$(yq '.project.dependencies[3] // "❓"' pyproject.toml)
    if [[ $_peewee != "❓" ]]; then
      _peewee=$(getVersion "$_peewee")
    fi
    export _peewee
    echo -e " • peewee: $_peewee"

    _pydantic=$(yq '.project.dependencies[5] // "❓"' pyproject.toml)
    if [[ $_pydantic != "❓" ]]; then
      _pydantic=$(getVersion "$_pydantic")
    fi
    export _pydantic
    echo -e " • pydantic: $_pydantic"

    _name=$(jq -r .name ../frontend/package.json)
    if [[ "$HOSTNAME" == "guru" ]]; then
      docker context use nova > /dev/null 2>&1
    fi
    if [ "$(docker ps -q -f name="$_name")" ]; then
      _sqlite=$(docker exec "$_name" apk list --no-cache sqlite | cut -d " " -f 1)
      _sqlite=${_sqlite:7:-3}
    else
      _sqlite=3.53.2
      _static=" (*)"
    fi
    docker context use default > /dev/null 2>&1
    export _sqlite
    echo -e " • SQLite: $_sqlite$_static"

    _uv=$(yq '.tool.uv.required-version // "❓"' pyproject.toml)
    export _uv
    echo -e " • uv: $_uv"

    echo -e "\n🧪 Running $_env tests..."
    ./test.sh

    _coverage=0
    if [ -f "coverage/coverage.json" ]; then
      _coverage=$(jq -r .totals.percent_statements_covered_display coverage/coverage.json)
    fi
    export _coverage
    echo -e "\n☂️  Coverage: $_coverage%"

    sed -i "/MD060/d" ../backend/README.md
  fi

  popd > /dev/null

  echo -e "\n🛠️  Creating $_env README.md...\n"

  envsubst < README-$_env.template.md > ../$_env/README.md
done

echo -e "🛠️  Creating README.md...\n"

envsubst < README.template.md > ../README.md

echo -e "✔️  Done!\n"
