#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${QCLI_API_URL:-}" ]]; then
    echo "Definí QCLI_API_URL (por ejemplo: https://api.tudominio.com/api)" >&2
    exit 1
fi

if [[ -n "${ANDROID_BUILD_JSON:-}" || -n "${ANDROID_KEYSTORE:-}" ]]; then
    if [[ -z "${ANDROID_BUILD_JSON:-}" || -z "${ANDROID_KEYSTORE:-}" ]]; then
        echo "Para firmar necesitás ANDROID_BUILD_JSON y ANDROID_KEYSTORE juntos." >&2
        exit 1
    fi
fi

PACKAGE_TYPE="${ANDROID_PACKAGE_TYPE:-bundle}"
BUILD_TYPE="${ANDROID_BUILD_TYPE:-release}"
OUTPUT_DIR="${OUTPUT_DIR:-dist-mobile}"

args=(
    build
    --platform linux/amd64
    --build-arg "QCLI_API_URL=${QCLI_API_URL}"
    --build-arg "ANDROID_BUILD_TYPE=${BUILD_TYPE}"
    --build-arg "ANDROID_PACKAGE_TYPE=${PACKAGE_TYPE}"
    --target export
    --output "type=local,dest=${OUTPUT_DIR}"
)

if [[ -n "${ANDROID_BUILD_JSON:-}" ]]; then
    args+=(--secret "id=android_build_json,src=${ANDROID_BUILD_JSON}")
    args+=(--secret "id=android_keystore,src=${ANDROID_KEYSTORE}")
fi

docker "${args[@]}" .
