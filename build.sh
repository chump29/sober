#!/usr/bin/env -S bash -e

EOL="\e[0m"
GREEN="\e[1;32m"
RED="\e[1;4;31m"
YELLOW="\e[1;33m"

clear

echo -e "${RED}=> Soʙᴇᴙ Tᴙᴀcᴋᴇᴙ <=${EOL}\n"

echo -e "${GREEN}=> Installing dependencies...${EOL}\n"
pnpm install --frozen-lockfile

echo -e "\n${GREEN}=> Linting...${EOL}"
pnpm run lint

echo -e "\n${GREEN}=> Running tests...${EOL}"
pnpm run test

echo -e "${GREEN}=> Creating image...${EOL}\n"
docker build --tag=nfld-frontend .

echo -e "\n${YELLOW}=> Done!${EOL}\n"

unset EOL
unset GREEN
unset RED
unset YELLOW

# shellcheck disable=SC2162
read -p "Run Docker Compose (Y/n)? " answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ] || [ -z "$answer" ]; then
    docker compose up -d
fi

echo -e "\n"
