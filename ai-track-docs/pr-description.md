# PR: exercise-10 → exercise-9

## Title
Add local CI script and structured PR template for review efficiency

## Summary
This PR adds a local test script (`scripts/run-tests.sh`) that mirrors what a CI
pipeline would run (install → lint → test → build), so contributors can validate
changes before pushing. The build-test guide is updated to document it.

## What changed

| File | Change |
|------|--------|
| `scripts/run-tests.sh` | New — local CI-equivalent script (install, lint, test, build) |
| `ai-track-docs/build-test.md` | Added "Local CI script" section under CI/CD |

## Review focus
1. **`scripts/run-tests.sh`** — Does the step ordering (install → lint → test → build)
   match what you'd expect from CI? Is `set -euo pipefail` + per-step error reporting
   sufficient for failure diagnosis?
2. **`--skip-install` flag** — Useful for rapid iteration. Acceptable trade-off vs.
   always forcing a clean install?
3. **Documentation** — Does the new section in `build-test.md` give enough context
   for a new contributor to run the script without help?

## Evidence
- **19/19 tests pass** (14 workflow structural tests + 3 benchmarks + 2 component tests)
- Local test script validated via `bash scripts/run-tests.sh --skip-install`
- No changes to production code, workflow YAML, or existing tests
- Zero test regressions from exercise-9 baseline

## Risk assessment
**Low.** This PR adds a new script and documentation only. No changes to workflow
behavior, dependencies, or existing tests.

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Script fails on non-bash shells | Low | Low | Shebang specifies `bash`; documented in build-test.md |
| Step ordering diverges from real CI | Low | Medium | Script mirrors the workflow; update both together |

## Rollback
```bash
git revert <merge-commit-sha>
```
This is safe because the PR only adds a new file and a docs section. Reverting removes
both without affecting any other functionality. No database migrations, config changes,
or dependency updates to unwind.

## Testing instructions
```bash
# Full pipeline (from repo root):
bash scripts/run-tests.sh

# Skip install if node_modules is already up to date:
bash scripts/run-tests.sh --skip-install
```
