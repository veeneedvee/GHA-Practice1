# Backlog — Exercise 12

Generated from repo analysis on 2026-04-15. Items are prioritized by risk × effort.

---

## BACKLOG-1: Add PR trigger to workflow1.yml CI pipeline

**Priority:** High  
**Effort:** Small (< 30 min)  
**Source:** [.github/workflows/workflow1.yml](.github/workflows/workflow1.yml#L3-L5) — CI only triggers on `push` to `main`, so PRs are never validated before merge.

### Description
The CI pipeline (lint → test → build) runs only on `push: branches: [main]`. Pull
requests are merged without automated checks, defeating the purpose of CI.

### Acceptance Criteria
- [ ] `workflow1.yml` triggers on `pull_request` targeting `main` in addition to `push`
- [ ] The three jobs (lint, test, build) run on PR branches
- [ ] A test in `workflow2.test.js` (or a new `workflow1.test.js`) asserts the `pull_request` trigger exists
- [ ] Existing 19 tests still pass

### Code Links
- [workflow1.yml L3-5](.github/workflows/workflow1.yml#L3-L5) — current trigger block

---

## BACKLOG-2: Eliminate duplicate `npm ci` calls in workflow1.yml

**Priority:** Medium  
**Effort:** Small (< 30 min)  
**Source:** [.github/workflows/workflow1.yml](.github/workflows/workflow1.yml#L22-L65) — `npm ci` runs 3 times (once per job) because there is no dependency caching or shared artifact.

### Description
Each of the three jobs (lint, test, build) independently checks out the repo and runs
`npm ci`. This triples install time. Use `actions/cache` for the npm cache, or collapse
into fewer jobs.

### Acceptance Criteria
- [ ] `npm ci` install time is reduced (cache hit on second+ jobs, or single install)
- [ ] Add `actions/cache@v4` with `path: ~/.npm` and `key: ${{ runner.os }}-node-${{ hashFiles('package-lock.json') }}`
- [ ] CI still passes lint, test, and build steps
- [ ] Document the caching strategy in `build-test.md`

### Code Links
- [workflow1.yml L22](.github/workflows/workflow1.yml#L22) — lint job install
- [workflow1.yml L40](.github/workflows/workflow1.yml#L40) — test job install
- [workflow1.yml L58](.github/workflows/workflow1.yml#L58) — build job install

---

## BACKLOG-3: Add structured logging to workflow1.yml

**Priority:** Medium  
**Effort:** Medium (1–2 hrs)  
**Source:** [.github/workflows/workflow1.yml](.github/workflows/workflow1.yml) vs [.github/workflows/workflow2.yml](.github/workflows/workflow2.yml#L38-L55) — workflow2 has structured JSON logs; workflow1 has none.

### Description
The observability pattern (`{"op","status","elapsed_ms"}`) established in workflow2
(exercise 9) is absent from workflow1. The CI pipeline is the more critical workflow
but has no timing or status telemetry.

### Acceptance Criteria
- [ ] Each job in workflow1.yml emits at least one structured JSON log line with `op`, `status`, `elapsed_ms`
- [ ] Log `op` values: `ci_lint`, `ci_test`, `ci_build`
- [ ] `logging.md` updated with the new `op` values table
- [ ] Structured log tests cover workflow1 patterns

### Code Links
- [workflow2.yml L38-55](.github/workflows/workflow2.yml#L38-L55) — existing log pattern to replicate
- [ai-track-docs/logging.md](ai-track-docs/logging.md) — logging documentation

---

## BACKLOG-4: Remediate remaining 25 npm audit vulnerabilities

**Priority:** High  
**Effort:** Large (2–4 hrs, requires major version evaluation)  
**Source:** `npm audit` output — 25 vulnerabilities (2 critical, 10 high, 10 moderate, 3 low). Current overrides (exercise 7) fixed 4; the rest require major-version dependency upgrades.

### Description
Key vulnerable transitive dependencies: `nth-check` (critical, via `css-select`),
`postcss` (moderate, via `vite`), `rollup` (high, via `vite`), `@adobe/css-tools`
(moderate, via `@testing-library/jest-dom`). Most are blocked by Vite 3 → Vite 5+
and testing-library upgrades.

### Acceptance Criteria
- [ ] Evaluate Vite 5+ upgrade on a feature branch — document breaking changes
- [ ] Evaluate `@testing-library/jest-dom` ≥6 upgrade — document impact on test setup
- [ ] Apply safe upgrades (direct `npm audit fix` for non-breaking changes)
- [ ] Update the vulnerability table in `build-test.md` with new counts
- [ ] All 19 tests still pass after each upgrade step

### Code Links
- [package.json L38-43](package.json#L38-L43) — current overrides
- [ai-track-docs/build-test.md](ai-track-docs/build-test.md#L107) — vulnerability documentation

---

## BACKLOG-5: Add `label-check` job coverage to workflow2 tests

**Priority:** Low  
**Effort:** Small (< 30 min)  
**Source:** [src/test/workflow2.test.js](src/test/workflow2.test.js#L53-L58) — the `label-check` job test only checks for the key name and `bug` keyword, but doesn't verify the `if:` conditional syntax or the env-var security pattern.

### Description
The `label-check` job was hardened in exercise 8 (env vars for script injection), but
the test only asserts that `label-check:`, `bug`, and `::warning::` appear somewhere
in the file. It doesn't verify the `if:` condition is correct or that the step uses
env vars rather than direct `${{ }}` in the `run:` block.

### Acceptance Criteria
- [ ] Test asserts the `if:` condition matches `github.event.action == 'labeled' && github.event.label.name == 'bug'`
- [ ] Test asserts `label-check` job's `run:` block uses `$ISSUE_NUMBER` / `$ISSUE_TITLE` (env vars), not `${{ }}`
- [ ] Test asserts `label-check` has an `env:` block defining `ISSUE_NUMBER` and `ISSUE_TITLE`
- [ ] All tests pass (expected: 19 + new assertions = 19, or 21 if new `it()` blocks added)

### Code Links
- [workflow2.test.js L53-58](src/test/workflow2.test.js#L53-L58) — current label-check test
- [workflow2.yml L89-100](.github/workflows/workflow2.yml#L89-L100) — label-check job implementation
