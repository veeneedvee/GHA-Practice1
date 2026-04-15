# Extending workflow2.yml — Issue Tracker

Quick guide for adding features to `.github/workflows/workflow2.yml`.

## Current structure

```
on: issues [opened, labeled]
  ├── log-issue      → writes markdown table to GITHUB_STEP_SUMMARY
  └── label-check    → emits ::warning:: when "bug" label is added
```

## How to add a new trigger type

Add the event type to the `types` array:

```yaml
on:
  issues:
    types: [opened, labeled, closed]  # ← added "closed"
```

Then update the test in `src/test/workflow2.test.js`:

```js
it('triggers on issues opened, labeled, and closed', () => {
  expect(content).toMatch(/closed/);
});
```

## How to add a new job

Add a new job block at the same level as `log-issue` and `label-check`:

```yaml
  # Job 3 — React to the "help wanted" label
  help-wanted:
    if: github.event.action == 'labeled' && github.event.label.name == 'help wanted'
    runs-on: ubuntu-latest
    steps:
      - name: Help wanted label detected
        run: |
          echo "::notice::Help wanted on issue #${{ github.event.issue.number }}"
```

Then update the runner-count test (it currently expects exactly 2):

```js
it('runs on ubuntu-latest for all jobs', () => {
  const matches = content.match(/runs-on:\s*ubuntu-latest/g);
  expect(matches.length).toBe(3);  // ← was 2
});
```

And add a structural test for the new job:

```js
it('defines the help-wanted job', () => {
  expect(content).toMatch(/help-wanted:/);
  expect(content).toMatch(/help wanted/);
});
```

## How to add a column to the summary table

Add one line inside the heredoc in the `log-issue` job. Use an env var, not direct
`${{ }}` interpolation (see Security section below):

```yaml
        env:
          ISSUE_ASSIGNEE: ${{ github.event.issue.assignee.login || 'unassigned' }}
        run: |
          ...
          | Assignee | @${ISSUE_ASSIGNEE} |
```

No test change needed — existing tests check for `GITHUB_STEP_SUMMARY`, not individual columns.

## Security: preventing script injection

**Rule:** Never use `${{ github.event.issue.title }}` or any user-controlled expression
directly inside a `run:` block. An attacker can craft a malicious issue title to execute
arbitrary commands.

**Safe pattern — use `env:` as a mediator:**

```yaml
      - name: Safe step
        env:
          ISSUE_TITLE: ${{ github.event.issue.title }}
        run: |
          echo "Title: ${ISSUE_TITLE}"
```

**Unsafe pattern — direct interpolation:**

```yaml
      # VULNERABLE — do not do this
      - name: Unsafe step
        run: |
          echo "Title: ${{ github.event.issue.title }}"
```

**Why it matters:** GitHub expands `${{ }}` expressions *before* the shell runs, so the
value is injected directly into the script text. If the title contains `"; rm -rf /; echo "`,
the shell executes it. Environment variables are passed as data, not code.

**Reference:**
[GitHub docs — Security hardening for GitHub Actions](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions#using-an-intermediate-environment-variable)

### User-controlled fields to always pass via env

| Field | Why it's dangerous |
|-------|--------------------|
| `github.event.issue.title` | Set by any user who opens an issue |
| `github.event.issue.body` | Set by any user |
| `github.event.comment.body` | Set by any commenter |
| `github.event.pull_request.title` | Set by PR author |
| `github.event.pull_request.head.ref` | Branch name — set by forker |

Safe fields (not user-controlled): `github.event.issue.number`,
`github.event.action`, `github.event.issue.html_url`.

## How to add a new workflow command

GitHub Actions supports these annotations in `echo`:

| Command | UI effect |
|---------|-----------|
| `::notice::message` | Blue info badge |
| `::warning::message` | Yellow warning badge |
| `::error::message` | Red error badge |

Use them in any step's `run:` block.

## Test checklist after changes

1. Run `npm run test` — all structural tests must pass
2. Push the branch and create/label a GitHub issue to verify live behavior
3. Check the **Actions** tab → job summary for rendered markdown
