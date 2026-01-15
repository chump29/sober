#!/usr/bin/env -S bash -e

_red="\e[4;91m"
_green="\e[4;92m"
_yellow="\e[4;93m"
_nc="\e[0m"
_title=✨
_task="🛠️ "
_lint=🔍
_test=🧪
_image=📦
_done="✔️ "

clear

echo -e "${_title} ${_red}Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ${_nc} ${_title}\n"

echo -e "${_task} ${_green}Installing dependencies${_nc}:\n"
pnpm install --frozen-lockfile

echo -e "\n${_lint} ${_green}Linting${_nc}:"
pnpm run lint

echo -e "\n${_test} ${_green}Testing${_nc}:"
pnpm run test

echo -e "${_image} ${_green}Creating image${_nc}:\n"
docker build --tag=sober .

echo -e "\n${_done} ${_yellow}Done${_nc}!\n"

unset _red
unset _green
unset _yellow
unset _nc
unset _title
unset _task
unset _lint
unset _test
unset _image
unset _done

# shellcheck disable=SC2162
read -p "Run Docker Compose (Y/n)? " answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ] || [ -z "$answer" ]; then
    docker compose up -d
fi

echo -e "\n"
