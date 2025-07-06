#!/usr/bin/env bash
# Create a new service folder with basic scaffolding.

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <service-name>" >&2
  exit 1
fi

NAME=$1
dir="services/$NAME"

mkdir -p "$dir/src"
cat <<'EOS' > "$dir/package.json"
{
  "name": "$NAME",
  "version": "0.1.0",
  "main": "src/index.ts",
  "scripts": {
    "build": "echo building $NAME",
    "lint": "echo linting $NAME",
    "test": "echo testing $NAME"
  }
}
EOS
cat <<'EOS' > "$dir/src/index.ts"
export function handler() {
  console.log('Service $NAME ready');
}
EOS

printf "Created %s" "$dir"
