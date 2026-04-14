# System Overview — GHA-Practice1

## Purpose

A React + Vite practice repository for learning GitHub Actions (GHA) workflows.
The project serves as a sandbox for experimenting with CI/CD pipelines, linting,
testing, and build automation.

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
├── .github/workflows/   # GHA workflow definitions
│   ├── workflow1.yml
│   └── workflow2.yml
├── ai-track-docs/       # AI-track documentation (this folder)
├── .copilot-track/      # Copilot Crawl tracking metadata
├── public/              # Static assets served by Vite
├── src/
│   ├── components/      # React components
│   ├── test/            # Test setup and test files
│   ├── App.jsx          # Root component
│   └── main.jsx         # Entry point
├── index.html           # Vite HTML entry
├── vite.config.js       # Vite + Vitest configuration
└── package.json         # Dependencies and scripts
```

## Key Scripts

| Command          | Description                        |
|------------------|------------------------------------|
| `npm run dev`    | Start Vite dev server              |
| `npm run build`  | Production build                   |
| `npm run test`   | Run Vitest test suite              |
| `npm run lint`   | ESLint check and auto-fix (`src/`) |
| `npm run preview`| Preview production build locally   |

## Branching Strategy

This repo uses **chain-PRs** (Crawl methodology):

- `main` — stable baseline
- `exercise-0` — scaffolding and documentation (current)
- `exercise-N` — each subsequent exercise branches from the previous one

Each PR contains evidence of AI-assisted work and links to the Crawl prompt that drove it.
