# System Overview — GHA-Practice1

## Purpose

A React + Vite practice repository for learning GitHub Actions (GHA) workflows.
The project serves as a sandbox for experimenting with CI/CD pipelines, linting,
testing, and build automation.

## Languages & Frameworks

| Language | Files | Purpose |
|----------|-------|---------|
| JavaScript / JSX | 7 | React components, config, entry point |
| CSS | 3 | Global styles (`src/index.css`) + component styles |
| YAML | 2 | GitHub Actions workflow definitions |
| HTML | 1 | Vite entry point (`index.html`) |
| JSON | 3 | `package.json`, `.eslintrc.json`, `package-lock.json` |

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| UI          | React 18 (JSX)           |
| Bundler     | Vite 3                   |
| Test runner | Vitest + Testing Library |
| Linter      | ESLint                   |
| CI/CD       | GitHub Actions           |

## Repository Layout

```
GHA-Practice1/
├── .github/workflows/         # GHA workflow definitions
│   ├── workflow1.yml          # CI pipeline: lint → test → build
│   └── workflow2.yml          # Issue-opened event logger
├── ai-track-docs/             # AI-track documentation (this folder)
├── .copilot-track/crawl/      # Copilot Crawl tracking metadata
├── public/                    # Static assets served by Vite
├── src/
│   ├── assets/images/         # Logo and image assets
│   │   └── logo.png
│   ├── components/            # React components
│   │   ├── HelpArea.jsx       # Renders list of HelpBox cards
│   │   ├── HelpArea.css
│   │   ├── HelpBox.jsx        # Leaf presentational card component
│   │   ├── HelpBox.css
│   │   ├── MainContent.jsx    # Toggle button + conditional HelpArea
│   │   └── MainContent.test.jsx  # Only test file in the project
│   ├── test/
│   │   └── setup.js           # Loads @testing-library/jest-dom globally
│   ├── App.jsx                # Root component (logo + MainContent)
│   ├── index.css              # Global styles
│   └── main.jsx               # React DOM bootstrap
├── index.html                 # Vite HTML entry (loads src/main.jsx)
├── vite.config.js             # Vite + Vitest + ESLint plugin config
├── .eslintrc.json             # ESLint rules for React/JSX
└── package.json               # Dependencies and npm scripts
```

## Entry Points

| Entry point | Path | Description |
|-------------|------|-------------|
| **App** | `index.html` → `src/main.jsx` → `src/App.jsx` | Vite loads HTML, which bootstraps React into `#root` |
| **CI pipeline** | `.github/workflows/workflow1.yml` | Triggers on push to `main`; runs lint → test → build sequentially |
| **Issue automation** | `.github/workflows/workflow2.yml` | Triggers on issue-opened; logs issue number, creator, and title |

### Component dependency chain

```
src/main.jsx
  └── src/App.jsx
        └── src/components/MainContent.jsx   (stateful: toggle visibility)
              └── src/components/HelpArea.jsx  (stateless: maps help items)
                    └── src/components/HelpBox.jsx  (leaf: renders title + text)
```

## Test Approach

- **Runner:** Vitest with jsdom environment (configured in `vite.config.js`)
- **Library:** React Testing Library + `@testing-library/jest-dom` matchers
- **Setup:** `src/test/setup.js` loads jest-dom globally so no per-file imports needed
- **Existing tests:** `src/components/MainContent.test.jsx` — two tests:
  1. Renders a "Help" toggle button on initial mount
  2. Shows the `HelpArea` section after button click
- **Coverage gaps:** `HelpBox.jsx`, `HelpArea.jsx`, and `App.jsx` have no direct test files
- **CI integration:** Tests run as the second job in `workflow1.yml` (after lint, before build)

## Key Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start Vite dev server              |
| `npm run build`  | Production build → `dist/`         |
| `npm run test`   | Run Vitest test suite              |
| `npm run lint`   | ESLint check and auto-fix (`src/`) |
| `npm run preview`| Preview production build locally   |

## Low-Risk Modules for Safe Modification

| # | Module | Path | Risk | Rationale |
|---|--------|------|------|-----------|
| 1 | **HelpBox** | `src/components/HelpBox.jsx` | Very low | Leaf component — takes props, renders HTML. No state, no side effects. |
| 2 | **HelpArea** | `src/components/HelpArea.jsx` | Low | Stateless, data-driven. Owns the help-items array. Adding content is isolated. |
| 3 | **Global CSS** | `src/index.css` | Very low | Pure styling. No logic, no JS imports. Visual-only changes. |

### Recommended: `src/components/HelpBox.jsx`

**Why it is the safest choice:**

1. **Leaf node** — only `HelpArea.jsx` depends on it, and only passes `title` and `text` props
2. **No state** — pure presentational component; changes cannot break data flow
3. **Already indirectly tested** — `MainContent.test.jsx` renders HelpArea → HelpBox, so regressions are caught
4. **Small surface area** — 18 lines, one `prop-types` import
5. **Easy to extend** — good candidate for adding a new prop, writing a focused unit test, or extending the UI

## Assumptions

These assumptions were made during analysis. Verify if in doubt:

| Assumption | How to verify |
|------------|---------------|
| `npm ci` installs all deps without errors | Run `npm ci` locally |
| Vitest tests pass on the current branch | Run `npm run test` |
| `workflow1.yml` triggers only on push to `main` | Read the `on:` block in the YAML |
| No other test files exist outside `src/components/` | Run `find src -name "*.test.*"` |
| `logo.png` is the only asset in `src/assets/` | Check `src/assets/images/` |

## Branching Strategy

This repo uses **chain-PRs** (Crawl methodology):

- `main` — stable baseline
- `exercise-0` — scaffolding and documentation
- `exercise-N` — each subsequent exercise branches from the previous one

Each PR contains evidence of AI-assisted work and links to the Crawl prompt that drove it.
