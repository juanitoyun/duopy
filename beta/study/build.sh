#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
if [ ! -d _extensions/r-wasm/live ]; then
  quarto add r-wasm/quarto-live --no-prompt
fi
quarto render memoria.qmd --to live-revealjs
