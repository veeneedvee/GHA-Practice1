# Structured Logging — workflow2.yml

## Log format

Every log line is a single JSON object with these required fields:

| Field | Type | Description |
|-------|------|-------------|
| `op` | string | Operation name (e.g. `validate_issue`, `log_issue_summary`) |
| `status` | string | Outcome: `ok` or `fail` |
| `elapsed_ms` | number | Wall-clock milliseconds for the operation |

Optional fields may be added per operation (e.g. `issue` for the issue number).

### Example output

```json
{"op":"validate_issue","status":"ok","elapsed_ms":2}
{"op":"log_issue_summary","status":"ok","issue":42,"elapsed_ms":5}
```

## Where logs are emitted

Structured logs are written to **stdout** inside each step's `run:` block.
GitHub Actions captures stdout and stores it in the workflow run log.

## How to view logs

1. **GitHub UI** — Go to **Actions** → select the workflow run → expand the
   **log-issue** job → click a step name to see its stdout, including JSON lines.

2. **GitHub CLI** — Download the full log archive:
   ```bash
   gh run view <run-id> --log
   ```
   Then filter for structured lines:
   ```bash
   gh run view <run-id> --log | grep '"op":'
   ```

3. **REST API** — Fetch logs programmatically:
   ```bash
   curl -L -H "Authorization: Bearer $GITHUB_TOKEN" \
     "https://api.github.com/repos/OWNER/REPO/actions/runs/<run-id>/logs" \
     -o logs.zip
   ```

## Adding a new structured log

Use the same three required fields. Capture start time with `date +%s%N`,
compute elapsed after the work, and echo a JSON object:

```bash
START_NS=$(date +%s%N)
# ... do work ...
ELAPSED_MS=$(( ( $(date +%s%N) - START_NS ) / 1000000 ))
echo '{"op":"my_operation","status":"ok","elapsed_ms":'"$ELAPSED_MS"'}'
```

Keep `op` values snake_case and unique within the workflow.
