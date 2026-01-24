#!/usr/bin/env -S bash -e

_red="\e[4;91m"
_green="\e[4;92m"
_yellow="\e[4;93m"
_nc="\e[0m"
_title=✨
_task="🛠️ "
_lint=🔍
_test=🧪
_build=📦
_done="✔️ "

clear

echo -e "${_title} ${_red}Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ${_nc} ${_title}\n"

echo -e "${_task} ${_green}Installing dependencies${_nc}:\n"
pnpm install --frozen-lockfile

echo -e "\n${_lint} ${_green}Linting${_nc}:"
pnpm run lint

echo -e "\n${_test} ${_green}Testing${_nc}:"
pnpm run test

echo -e "\n${_build} ${_green}Building image${_nc}:\n"
docker login git.postfmly.com
if ! docker buildx | grep -q builder; then
    docker buildx create --use --name builder --platform linux/amd64,linux/arm64
fi
docker buildx build --platform linux/amd64,linux/arm64 --tag git.postfmly.com/admin/sober --push .
docker container stop buildx_buildkit_builder0 > /dev/null
docker container rm buildx_buildkit_builder0 > /dev/null

echo -e "\n${_done} ${_yellow}Done${_nc}!\n"

unset _red
unset _green
unset _yellow
unset _nc
unset _title
unset _task
unset _lint
unset _test
unset _build
unset _done

# shellcheck disable=SC2162
read -p "Run Docker Compose (Y/n)? " answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ] || [ -z "$answer" ]; then
    docker compose up -d
fi

echo -e "\n"
