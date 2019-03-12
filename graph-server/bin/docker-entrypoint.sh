#!/usr/bin/env bash

set -e

# Read environment variables from file and export them.
file_env() {
	while read -r line || [[ -n ${line} ]]; do
		export ${line}
	done < "$1"
}


file_env_wrapper() {
    env_file_count=`ls -1 ${1}/*.env 2>/dev/null | wc -l`
    if  ! [[ -z ${1} ]]; then
        # if mount exists then export environment variables
        if [[ ${env_file_count} != 0 ]]; then
            for FILE in ${1}/*.env; do
                file_env ${FILE}
            done
        fi
    fi
}

file_env_wrapper ${COMMON_DATA_DIRECTORY}
file_env_wrapper ${APPLICATION_DATA_DIRECTORY}

exec "$@"