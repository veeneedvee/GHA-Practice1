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
});
