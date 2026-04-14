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
| `workflow2.yml`  | Secondary / supplemental checks |

Workflows trigger on push and pull request events. See each YAML file for details.
