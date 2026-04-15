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

Add one line inside the heredoc in the `log-issue` job:

```yaml
          | Assignee | @${{ github.event.issue.assignee.login || 'unassigned' }} |
```

No test change needed — existing tests check for `GITHUB_STEP_SUMMARY`, not individual columns.

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
