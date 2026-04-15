#!/usr/bin/env bash
# ------------------------------------------------------------
# run-tests.sh — Local CI-equivalent test script
#
# Runs the same checks a CI pipeline would, in order:
#   1. Install dependencies
#   2. Lint
#   3. Test
#   4. Build
#
# Usage:
#   bash scripts/run-tests.sh          # full pipeline
#   bash scripts/run-tests.sh --skip-install  # skip npm install
#
# Exit codes:
#   0  All steps passed
#   1  A step failed (name printed to stderr)
# ------------------------------------------------------------
set -euo pipefail

SKIP_INSTALL=false
for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=true ;;
  esac
done

step() {
  local name="$1"; shift
  echo ""
  echo "══════════════════════════════════════════"
  echo "  STEP: $name"
  echo "══════════════════════════════════════════"
  if "$@"; then
    echo "  ✓ $name passed"
  else
    echo "  ✗ $name FAILED" >&2
    exit 1
  fi
}

# 1. Install
if [ "$SKIP_INSTALL" = false ]; then
  step "npm install" npm install
fi

# 2. Lint
step "lint" npm run lint

# 3. Test
step "test" npx vitest run --reporter=verbose

# 4. Build
step "build" npm run build

echo ""
echo "══════════════════════════════════════════"
echo "  ALL STEPS PASSED ✓"
echo "══════════════════════════════════════════"
