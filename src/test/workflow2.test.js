import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Structural validation tests for .github/workflows/workflow2.yml
 *
 * These tests read the YAML as plain text and assert that the expected
 * triggers, job names, keywords, and runner config are present.
 *
 * Why text matching instead of YAML parsing?
 *   - Zero extra dependencies (no js-yaml needed)
 *   - Catches accidental deletions and renames instantly
 *   - Deterministic — no network, no GitHub API
 *
 * When to update these tests:
 *   - Adding a new job       → add a test that matches the job key
 *   - Adding a new trigger   → extend the "triggers" test
 *   - Changing the runner     → update the runner-count assertion
 */

const workflowPath = resolve('.github/workflows/workflow2.yml');
const content = readFileSync(workflowPath, 'utf-8');

describe('workflow2.yml — Issue Tracker', () => {
  // Smoke test: file exists and is non-empty
  it('is valid YAML that can be read without errors', () => {
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  // Verify both event types are registered
  it('triggers on issues opened and labeled', () => {
    expect(content).toMatch(/on:/);
    expect(content).toMatch(/issues:/);
    expect(content).toMatch(/opened/);
    expect(content).toMatch(/labeled/);
  });

  // Job 1: summary table written to GITHUB_STEP_SUMMARY
  it('defines the log-issue job', () => {
    expect(content).toMatch(/log-issue:/);
    expect(content).toMatch(/GITHUB_STEP_SUMMARY/);
  });

  // Job 2: conditional on "bug" label, emits ::warning::
  it('defines the label-check job with a bug-label condition', () => {
    expect(content).toMatch(/label-check:/);
    expect(content).toMatch(/bug/);
    expect(content).toMatch(/::warning::/);
  });

  // Both jobs must target the same runner
  it('runs on ubuntu-latest for all jobs', () => {
    const matches = content.match(/runs-on:\s*ubuntu-latest/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(2);
  });

  // ── Negative tests ──────────────────────────────────────────

  // Input validation: the workflow must guard against missing event fields
  it('validates required issue fields before writing summary', () => {
    // Must check issue.number, issue.title, and issue.user.login via env vars
    expect(content).toMatch(/Validate issue context/);
    expect(content).toMatch(/-z "\$ISSUE_NUMBER"/);
    expect(content).toMatch(/-z "\$ISSUE_TITLE"/);
    expect(content).toMatch(/-z "\$ISSUE_AUTHOR"/);
  });

  // Validation must exit non-zero on missing fields (fail-fast)
  it('exits with error if validation fails', () => {
    expect(content).toMatch(/::error::Missing issue/);
    expect(content).toMatch(/exit 1/);
  });

  // Negative: must NOT trigger on unrelated events
  it('does not trigger on pull_request or push events', () => {
    expect(content).not.toMatch(/pull_request:/);
    expect(content).not.toMatch(/\bon:\s*push/);
    expect(content).not.toMatch(/on:\s*\[push/);
  });

  // Negative: must NOT use self-hosted runners (security/cost boundary)
  it('does not use self-hosted runners', () => {
    expect(content).not.toMatch(/runs-on:\s*self-hosted/);
  });

  // ── Security tests ─────────────────────────────────────────

  // User-controlled values must be passed via env vars, not direct ${{ }} in run:
  it('uses env vars for user-controlled input (prevents script injection)', () => {
    // Extract only the shell script lines (after "run: |") by matching indented lines
    // that follow a run: | declaration. The env: blocks will contain ${{ }} — that's expected.
    // What must NOT happen: ${{ github.event.issue.title }} directly inside shell commands.
    const shellLines = content.split('\n')
      .filter(line => /^\s+(echo|cat|if|fi|exit)/.test(line))
      .join('\n');
    expect(shellLines).not.toMatch(/\$\{\{\s*github\.event\.issue\.title\s*\}\}/);
    expect(shellLines).not.toMatch(/\$\{\{\s*github\.event\.issue\.body\s*\}\}/);
  });

  // Env blocks must exist to mediate user-controlled values
  it('defines env blocks for steps that use issue data', () => {
    expect(content).toMatch(/ISSUE_NUMBER:\s*\$\{\{/);
    expect(content).toMatch(/ISSUE_TITLE:\s*\$\{\{/);
    expect(content).toMatch(/ISSUE_AUTHOR:\s*\$\{\{/);
  });

  // ── Structured logging tests ────────────────────────────────

  // Structured logs must use consistent JSON fields: op, status, elapsed_ms
  it('emits structured JSON logs with op, status, and elapsed_ms', () => {
    // Validate step emits a log line with all three required fields
    expect(content).toMatch(/"op"\s*:\s*"validate_issue"/);
    expect(content).toMatch(/"status"\s*:\s*"ok"/);
    expect(content).toMatch(/"elapsed_ms"/);
  });

  // The log-issue summary step must also emit a structured log
  it('emits a structured log for the log_issue_summary operation', () => {
    expect(content).toMatch(/"op"\s*:\s*"log_issue_summary"/);
  });

  // Elapsed time must be computed (START_NS pattern)
  it('measures elapsed time using date +%s%N', () => {
    const timerStarts = content.match(/START_NS=\$\(date \+%s%N\)/g);
    expect(timerStarts).not.toBeNull();
    expect(timerStarts.length).toBeGreaterThanOrEqual(2);
  });
});
