#!/usr/bin/env -S bash -e

export _user=chump29
export _repo=sober

export _uiPort=89


clear

pushd .. > /dev/null

echo -e "🛈 Info:\n"

_version=$(jq -r '.version // "❓"' package.json)
export _version
echo -e " • Version: $_version"

echo -e " • Port: $_uiPort"

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

_tailwind=$(jq -r '.devDependencies.tailwindcss // "❓"' package.json)
export _tailwind
echo -e " • tailwindcss: $_tailwind"

_vite=$(jq -r '.devDependencies.vite // "❓"' package.json)
export _vite
echo -e " • vite: $_vite"

_coverage=0
if [ -f "coverage/lcov.info" ]; then
  _coverage=$(bun run lcov-total coverage/lcov.info)
fi
export _coverage
echo -e "\n☂️  Coverage: $_coverage%"

popd > /dev/null

echo -e "\n🛠️  Creating README.md...\n"

envsubst < README.template.md > ../README.md

echo -e "✔️  Done!\n"
