#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
quarto add r-wasm/quarto-live --no-prompt
quarto render memoria.qmd --to revealjs
