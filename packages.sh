#!/usr/bin/env -S bash -e

	_url="https://git.postfmly.com/api/v1/packages/$GITHUB_VAULT_USER/container/sober/"

	_token=$(curl --request GET \
	  --location \
	  --silent \
	  --fail \
	  --url https://vault.postfmly.com/v1/kv/data/github \
	  --header "X-Vault-Token: $GITHUB_VAULT_TOKEN" \
	  | jq -r .data.data.key)

	echo -e "✨ Sᴏʙᴇᴙ Tᴙᴀᴄᴋᴇᴙ Packages ✨\n"

	for _pkg in latest amd64 arm64; do
	  echo -e "   ╰› Deleting ${_pkg^^} package"
	  curl --request DELETE \
	    --location \
	    --silent \
	    --fail \
	    --url "${_url}${_pkg}" \
	    --header "authorization: token $_token" \
	    --output /dev/null

	  echo
	done

	echo -e "✔️  Done"

	unset _frontend_url
	unset _backend_url
	unset _token
