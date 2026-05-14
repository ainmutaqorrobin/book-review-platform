#!/bin/sh

set -eu

LOCKFILE="package-lock.json"
STAMP_FILE="node_modules/.package-lock.sha256"

if [ ! -f "$LOCKFILE" ]; then
  echo "Missing $LOCKFILE"
  exit 1
fi

CURRENT_HASH="$(sha256sum "$LOCKFILE" | awk '{ print $1 }')"
SAVED_HASH=""

if [ -f "$STAMP_FILE" ]; then
  SAVED_HASH="$(cat "$STAMP_FILE")"
fi

if [ ! -d "node_modules" ] || [ "$CURRENT_HASH" != "$SAVED_HASH" ]; then
  echo "Installing backend dependencies to match package-lock.json..."
  npm ci
  mkdir -p node_modules
  printf "%s" "$CURRENT_HASH" > "$STAMP_FILE"
fi

exec npm run dev
