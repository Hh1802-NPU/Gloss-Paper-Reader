#!/bin/sh
set -eu
cd "$(dirname "$0")"
runtime="${DSH_HOME:-$HOME/.dsh}/dsh-runtimes/dsh-primary-runtime/dependencies"
node="$runtime/node/bin/node"
if [ ! -x "$node" ]; then
  node=$(command -v node || true)
fi
if [ -z "$node" ]; then
  printf '%s\n' 'Start DeepSeek Harness once, then retry or use the Node path in README.md.' >&2
  exit 1
fi
if [ "$#" -eq 0 ]; then set -- --install; fi
exec "$node" setup.mjs "$@"
