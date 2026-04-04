#!/usr/bin/env -S bash -e

export _uiPort=http://localhost:89
export _user=chump29
export _repo=sober

clear

mkdir dist

echo "🛠️  Creating README file"
envsubst < README.template.md > dist/README.md

cd dist || exit 1

echo "⿻ Moving README file"

mv README.md ../../

cd .. || exit 1

rm -rf dist
