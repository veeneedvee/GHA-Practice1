# Crawl — Chain-PR Workflow

This repository follows the **Crawl** methodology for AI-assisted learning exercises.

## What is Crawl?

Crawl is a structured approach where each exercise builds on the previous one through
a chain of pull requests. Each PR is self-contained, reviewable, and includes evidence
of how AI (GitHub Copilot) was used.

## Chain-PR Pattern

```
main ← exercise-0 ← exercise-1 ← exercise-2 ← ...
```

Each branch targets the **previous exercise branch** (not `main`), forming a chain:

1. `exercise-0` → PR into `main` (scaffolding)
2. `exercise-1` → PR into `exercise-0`
3. `exercise-2` → PR into `exercise-1`
4. …and so on

This keeps diffs small and focused. Each PR shows only the incremental work for that
exercise.

## Evidence in PRs

Every pull request must include:

- **What changed** — brief summary of files added/modified
- **Prompt used** — the AI prompt or instruction that drove the change
- **AI tool** — which tool was used (e.g., GitHub Copilot Chat, Agent mode)
- **Verification** — how you confirmed the output is correct (test run, manual check)

### Example PR description

```markdown
## Exercise 0 — Scaffolding

### What changed
- Added `ai-track-docs/` with system overview, build guide, and architecture diagram
- Added `.copilot-track/crawl/` tracking metadata

### Prompt used
> Create ai-track-docs/ and .copilot-track/crawl/ scaffolding. Add SYSTEM-OVERVIEW.md,
> build-test.md, architecture.mmd. Add a Crawl README explaining chain-PRs.

### AI tool
GitHub Copilot Chat (Agent mode) in VS Code

### Verification
- Confirmed all files created with correct content
- No existing files modified
- No submodules or vendor folders touched
```

## Prompt Usage Tips

- Be specific about what you want created, modified, or deleted
- Include acceptance criteria when possible
- Reference file paths explicitly
- Ask for the smallest safe change that meets the criteria
- Review AI output before committing — you own the code

## Directory Structure

```
.copilot-track/crawl/   # Exercise tracking metadata
ai-track-docs/          # AI-track documentation
├── SYSTEM-OVERVIEW.md  # Project purpose, tech stack, layout
├── build-test.md       # How to build, test, lint, and run
└── architecture.mmd    # Mermaid architecture diagram
```
