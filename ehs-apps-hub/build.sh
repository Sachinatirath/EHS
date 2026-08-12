#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
HUB_DIR="$(pwd)"

declare -A APPS=(
  [FastAid]="../FastAid/mobile"
  [SafetyViolation]="../SafetyViolation/mobile"
  [SafetyObservation]="../SafetyObservation/mobile"
  [IncidentReport]="../IncidentReport/mobile"
)

for name in "${!APPS[@]}"; do
  dir="${APPS[$name]}"
  echo "=== Building $name ==="
  (cd "$dir" && rm -rf dist .expo && npx expo export --platform web)
  rm -rf "$HUB_DIR/public/$name"
  mkdir -p "$HUB_DIR/public/$name"
  cp -r "$dir/dist/." "$HUB_DIR/public/$name/"
done

echo "=== Done. public/ contents: ==="
ls -la "$HUB_DIR/public"
