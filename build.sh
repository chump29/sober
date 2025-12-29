#!/usr/bin/env -S bash -e

for img in backend frontend; do
    pushd $img > /dev/null || exit
    ./build.sh
    popd > /dev/null || exit
done

# shellcheck disable=SC2162
read -p "Run Docker Compose (Y/n)? " answer
if [ "$answer" == "y" ] || [ "$answer" == "Y" ] || [ -z "$answer" ]; then
    docker compose up -d
fi

echo -e "\n"
