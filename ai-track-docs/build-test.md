# Build & Test Guide

## Prerequisites

- Node.js 16+ (LTS recommended)
- npm 8+

## Install

```bash
npm install
```

## Build

```bash
npm run build
```

Output lands in `dist/`. Vite bundles the React app with tree-shaking and minification.

## Test

```bash
npm run test
```

Runs Vitest with jsdom environment. Tests live under `src/test/`.

### Test configuration

Vitest is configured in `vite.config.js`:

- **globals**: `true` — no need to import `describe`/`it`/`expect`
- **environment**: `jsdom` — DOM simulation for React components
- **setupFiles**: `./src/test/setup.js` — Testing Library matchers

## Lint

```bash
npm run lint
```

Runs ESLint on `src/**/*.jsx` with auto-fix enabled.

## Dev Server

```bash
npm run dev
```

Starts the Vite hot-reload server (default: `http://localhost:5173`).

## CI/CD

GitHub Actions workflows are in `.github/workflows/`:

| Workflow         | Purpose                         |
|------------------|---------------------------------|
| `workflow1.yml`  | Primary CI pipeline             |
| `workflow2.yml`  | Issue tracker / supplemental    |

Workflows trigger on push and pull request events. See each YAML file for details.

### Local CI script

When GitHub Actions isn't available (offline, no push access), use the local test
script to run the same checks a CI pipeline would:

```bash
bash scripts/run-tests.sh            # full pipeline: install → lint → test → build
bash scripts/run-tests.sh --skip-install   # skip npm install (already installed)
```

The script runs steps sequentially and exits on first failure. Exit code 0 means
all checks passed.

---

## Dependency Notes

### Critical dependencies

These are the packages the app directly relies on at runtime or build time. A breakage
in any of these blocks the build, tests, or user-facing functionality.

| Package | Pinned range | Installed | Role | Risk if broken |
|---------|-------------|-----------|------|----------------|
| `react` | `^18.2.0` | 18.2.0 | UI framework | App won't render |
| `react-dom` | `^18.2.0` | 18.2.0 | DOM renderer | App won't mount |
| `vite` | `^3.0.7` | 3.0.9 | Bundler + dev server | Build fails |
| `vitest` | `^0.22.1` | 0.22.1 | Test runner | Tests fail |
| `jsdom` | `^20.0.0` | 20.0.0 | DOM simulation for tests | Tests fail |
| `eslint` | `^8.23.0` | 8.23.0 | Linter | Lint step fails |

### Non-critical dependencies

| Package | Role | Impact if removed |
|---------|------|-------------------|
| `prop-types` | Runtime prop validation | Dev warnings disappear; app still works |
| `@types/react`, `@types/react-dom` | TypeScript type hints | No runtime impact (IDE support only) |
| `vite-plugin-eslint` | Lint overlay in dev server | Lint still works via CLI; dev server loses overlay |

### Engine constraints (added in exercise-7)

```json
"engines": {
  "node": ">=16.0.0 <25.0.0",
  "npm": ">=8.0.0"
}
```

- **Why Node >=16**: Vite 3 requires Node 14.18+; we pin to 16 for LTS stability.
- **Why Node <25**: Prevents untested major versions from silently breaking CI.
- **Why npm >=8**: `npm ci` lockfile format compatibility.

### Security overrides (added in exercise-7)

```json
"overrides": {
  "semver": ">=6.3.1",
  "tough-cookie": ">=4.1.3",
  "word-wrap": ">=1.2.4",
  "ws": ">=8.17.1"
}
```

These force patched versions of transitive dependencies without upgrading direct
dependencies. Each override addresses a known vulnerability:

| Package | Vulnerability | Severity | Fix |
|---------|--------------|----------|-----|
| `semver` | ReDoS (GHSA-c2qf-rxjj-qqgw) | Moderate | >=6.3.1 |
| `tough-cookie` | Prototype pollution (GHSA-72xf-g2v4-qvf3) | Moderate | >=4.1.3 |
| `word-wrap` | ReDoS (GHSA-j8xg-fqg3-53r7) | Moderate | >=1.2.4 |
| `ws` | DoS via HTTP headers (GHSA-3h5v-q93c-6h6q) | High | >=8.17.1 |

### Pinning strategy

- **Direct dependencies** use `^` (caret) ranges — allows patch and minor updates
  within the same major version. This is the npm default and safe for a learning repo.
- **No exact pinning** (`=`) on direct deps — avoids lockfile churn on every patch.
- **Overrides** use `>=` floor constraints — forces minimum patched versions for
  transitive deps without blocking future updates.
- **`package-lock.json`** is the true pin — `npm ci` reproduces exact versions.
  Always commit the lockfile.

### When to upgrade

| Signal | Action |
|--------|--------|
| `npm audit` shows new critical/high | Add an override or bump the dep |
| Vite or React major version released | Evaluate on a separate branch; don't auto-upgrade |
| Node.js LTS changes | Update `engines.node` range |
| CI failures after `npm ci` | Check if a transitive dep published a breaking patch |
