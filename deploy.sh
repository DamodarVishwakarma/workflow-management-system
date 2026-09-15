#!/usr/bin/env bash

set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ec2-user/flowboard-frontend}"
WEB_ROOT="${WEB_ROOT:-/var/www/flowboard}"
BUILD_ARCHIVE="${BUILD_ARCHIVE:-}"
REPOSITORY_URL="${REPOSITORY_URL:-}"
BRANCH="${BRANCH:-main}"

if [[ -n "$BUILD_ARCHIVE" ]]; then
  if [[ ! -f "$BUILD_ARCHIVE" ]]; then
    echo "Build archive not found: $BUILD_ARCHIVE" >&2
    exit 1
  fi
elif [[ ! -d "$APP_DIR/.git" ]]; then
  if [[ -z "$REPOSITORY_URL" ]]; then
    echo "APP_DIR is not a Git checkout and REPOSITORY_URL was not provided." >&2
    exit 1
  fi

  mkdir -p "$(dirname "$APP_DIR")"
  git clone --branch "$BRANCH" "$REPOSITORY_URL" "$APP_DIR"
else
  git -C "$APP_DIR" fetch origin "$BRANCH"
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" reset --hard "origin/$BRANCH"
fi

sudo mkdir -p "$WEB_ROOT"

if [[ -n "$BUILD_ARCHIVE" ]]; then
  TEMP_BUILD_DIR="$(mktemp -d)"
  trap 'rm -rf "$TEMP_BUILD_DIR"' EXIT
  tar --extract --gzip --file "$BUILD_ARCHIVE" --directory "$TEMP_BUILD_DIR"
  sudo rsync --delete -a "$TEMP_BUILD_DIR/" "$WEB_ROOT/"
else
  cd "$APP_DIR"
  npm ci
  npm run build
  sudo rsync --delete -a build/ "$WEB_ROOT/"
fi

if command -v systemctl >/dev/null 2>&1 && systemctl list-unit-files nginx.service >/dev/null 2>&1; then
  sudo systemctl reload nginx
fi

echo "FlowBoard deployed to $WEB_ROOT"