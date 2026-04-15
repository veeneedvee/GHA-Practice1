# PR: exercise-11 → main

## Title
Crawl exercises 0–10: workflow hardening, tests, security, observability, and local CI

## Summary
This chain-PR delivers 11 incremental exercises that transform `workflow2.yml` from
a minimal issue-logging stub into a hardened, tested, documented, and observable workflow.
Each exercise was a separate branch merged forward, so the full diff is additive — no
existing production code was modified.

## What changed

| Exercise | Commit | Files changed | What it does |
|----------|--------|---------------|--------------|
| 0 | `ff04021` | scaffolding dirs | Bootstrap `ai-track-docs/` and `.copilot-track/crawl/` |
| 1 | `ab88886` | SYSTEM-OVERVIEW | Repo orientation — languages, entry points, low-risk module selection |
| 2 | `efa1fc5` | workflow2.yml, workflow2.test.js | Add labeled trigger, two jobs, GITHUB_STEP_SUMMARY, 5 structural tests |
| 3 | `c49c13c` | workflow2.yml | Refactor echo lines to heredoc (behavior preserved) |
| 4 | `26008cf` | workflow2.yml, tests, extending guide | Comments/docstrings, extending-workflow2.md |
| 5 | `6c2f6eb` | workflow2.yml, tests | Input validation step + 4 negative tests |
| 6 | `ceaf389` | workflow2.bench.test.js | Micro-benchmarks (file read, regex scan, pipeline timing) |
| 7 | `9ea3622` | package.json, build-test.md | Engine constraints, npm overrides for 4 vulns, dependency docs |
| 8 | `598bc16` | .gitignore, workflow2.yml, tests, guide | Secret patterns, script injection remediation, security tests |
| 9 | `4db9eaf` | workflow2.yml, tests, logging.md | Structured JSON logs (op/status/elapsed_ms) on critical path |
| 10 | `736ecdd` | scripts/run-tests.sh, build-test.md, pr-description.md | Local CI script, PR template |

### File inventory (15 files, +1182 / −120 lines)

| Category | Files |
|----------|-------|
| Workflow | `.github/workflows/workflow2.yml` |
| Tests | `src/test/workflow2.test.js`, `src/test/workflow2.bench.test.js` |
| Scripts | `scripts/run-tests.sh` |
| Config | `package.json`, `package-lock.json`, `.gitignore` |
| Docs | `ai-track-docs/` (6 files), `.copilot-track/crawl/` (2 files) |

## Review focus

1. **Security (exercise 8)** — Script injection was remediated by moving all
   `${{ github.event.issue.* }}` expressions from `run:` blocks to `env:` blocks.
   Two tests enforce this. Review the pattern in workflow2.yml steps "Validate issue
   context" and "Log issue details".

2. **Input validation (exercise 5)** — The `Validate issue context` step guards against
   missing `ISSUE_NUMBER`, `ISSUE_TITLE`, and `ISSUE_AUTHOR`. Fails fast with
   `::error::` annotations. Verify the `-z` checks cover the fields used downstream.

3. **Structured logging (exercise 9)** — JSON log lines use `{"op","status","elapsed_ms"}`
   on both the validation and summary steps. Timing uses `date +%s%N`. Check that the
   fail path also emits a log line before `exit 1`.

4. **Local CI script (exercise 10)** — `scripts/run-tests.sh` runs lint → test → build
   with `set -euo pipefail`. Review the `--skip-install` trade-off (speed vs. reproducibility).

5. **Dependency overrides (exercise 7)** — `package.json` adds `overrides` for 4
   transitive-dep vulnerabilities. Confirm the floor versions match the advisory fixes.

## Evidence

| Check | Result |
|-------|--------|
| Tests | **19/19 pass** (14 structural + 3 benchmark + 2 component) |
| Lint | Clean — zero warnings |
| Build | 44 modules → `dist/` (141 KB JS, 0.71 KB CSS) |
| Local CI script | `run-tests.sh --skip-install` exits 0 |
| Vulnerabilities | 29 → 25 (4 fixed via overrides; remainder need major upgrades) |
| No production code changes | ✓ Only workflow YAML, tests, scripts, config, docs |

## Risk assessment

**Low overall.** All changes are additive — no existing production code or component
behavior was modified.

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Workflow validation too strict (rejects valid events) | Low | Medium | Checks only 3 required fields; labels/URL are optional |
| `date +%s%N` not available on all runners | Very Low | Low | Ubuntu runners (GitHub-hosted) support nanosecond timestamps |
| npm overrides break a transitive dep | Low | Medium | Overrides use `>=` floors, not exact pins; lockfile tested |
| Local CI script diverges from real CI | Low | Medium | Documented as "CI-equivalent"; linked in build-test.md |

## Rollback

```bash
# Revert the entire chain (if merged as a merge commit):
git revert -m 1 <merge-commit-sha>

# Or revert individual exercises:
git revert <commit-sha>   # e.g. revert only exercise-8 security changes
```

**Why this is safe:** All changes are additive files (new tests, new docs, new script)
or config additions (engines, overrides, .gitignore patterns). Reverting any commit
removes only its additions. No database, API, or schema changes to unwind.

## Verification steps

```bash
# 1. Run the local CI script (from repo root):
bash scripts/run-tests.sh --skip-install

# 2. Or run each step individually:
npm run lint
npx vitest run --reporter=verbose
npm run build

# 3. Verify structured log patterns in workflow YAML:
grep '"op"' .github/workflows/workflow2.yml

# 4. Verify security pattern (no direct ${{ }} in shell lines):
grep -n 'echo.*\${{' .github/workflows/workflow2.yml  # should return nothing
```

---

## Proposed commit message improvements

The current commit messages are terse exercise labels. Below are improved messages
following the [Conventional Commits](https://www.conventionalcommits.org/) format
with scope, summary, and body:

| Current | Proposed |
|---------|----------|
| `ghcp(crawl): ex0 bootstrap scaffolding` | `chore(crawl): scaffold ai-track-docs and copilot-track dirs` |
| `ghcp(crawl): ex1 repo orientation + low-risk module` | `docs(crawl): add system overview with languages, entry points, and risk analysis` |
| `ex2: build/test baseline + deterministic test` | `feat(workflow): add issue tracker jobs with GITHUB_STEP_SUMMARY and structural tests` |
| `ex3: small refactor (behavior preserved)` | `refactor(workflow): replace echo lines with heredoc for summary table` |
| `ex4: documentation sync + extending guide` | `docs(workflow): add inline comments and extending-workflow2.md guide` |
| `ex5: input validation + negative test` | `feat(workflow): add input validation step with fail-fast error annotations` |
| `ex6: performance baseline measurement` | `test(bench): add micro-benchmarks for file read, regex scan, and pipeline` |
| `ex7: dependency documentation and pinning` | `fix(deps): add engine constraints and security overrides for 4 vulnerabilities` |
| `ex8: security and secrets hygiene` | `security(workflow): remediate script injection, harden .gitignore for secrets` |
| `ex9: structured logging added` | `feat(workflow): add structured JSON logs with op/status/elapsed_ms fields` |
| `ex10: CI or local test script` | `ci: add local test script (lint → test → build) with skip-install flag` |

### Commit message guidelines

- **Type prefix:** `feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `security`, `chore`
- **Scope:** `(workflow)`, `(deps)`, `(bench)`, `(crawl)` — identifies the subsystem
- **Subject line:** imperative mood, ≤72 chars, no period
- **Body (optional):** wrap at 72 chars; explain *why*, not *what* (the diff shows what)
