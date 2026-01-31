#!/usr/bin/env -S bash -e

_red="\e[4;91m"
_green="\e[4;92m"
_yellow="\e[4;93m"
_nc="\e[0m"
_title=✨
_build=📦
_start="▶️ "
_error=❗
_done="✔️ "

clear

echo -e "${_title} ${_red}Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ${_nc} ${_title}\n"

echo -e "${_build} ${_yellow}Building${_nc}:\n"
./Dockerfile

if docker images --format json --filter reference=sober | grep -q sober; then
  echo -e "\n${_start} ${_yellow}Starting${_nc}:\n"
  docker rm -f sober > /dev/null 2>&1
  docker run --name sober --publish 89:80 --env TZ=America/Chicago --detach sober
else
  echo -e "${_error} ${_red}Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ image not found!${_nc}\n"
fi

echo -e "\n${_done} ${_green}Done${_nc}!\n"

unset _red
unset _green
unset _yellow
unset _nc
unset _title
unset _build
unset _start
unset _error
unset _done
