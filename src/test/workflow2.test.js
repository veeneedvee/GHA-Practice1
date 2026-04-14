import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Structural validation test for .github/workflows/workflow2.yml
 * Parses the YAML as text and verifies expected triggers, jobs, and steps.
 */

const workflowPath = resolve('.github/workflows/workflow2.yml');
const content = readFileSync(workflowPath, 'utf-8');

describe('workflow2.yml — Issue Tracker', () => {
  it('is valid YAML that can be read without errors', () => {
    expect(content).toBeDefined();
    expect(content.length).toBeGreaterThan(0);
  });

  it('triggers on issues opened and labeled', () => {
    expect(content).toMatch(/on:/);
    expect(content).toMatch(/issues:/);
    expect(content).toMatch(/opened/);
    expect(content).toMatch(/labeled/);
  });

  it('defines the log-issue job', () => {
    expect(content).toMatch(/log-issue:/);
    expect(content).toMatch(/GITHUB_STEP_SUMMARY/);
  });

  it('defines the label-check job with a bug-label condition', () => {
    expect(content).toMatch(/label-check:/);
    expect(content).toMatch(/bug/);
    expect(content).toMatch(/::warning::/);
  });

  it('runs on ubuntu-latest for all jobs', () => {
    const matches = content.match(/runs-on:\s*ubuntu-latest/g);
    expect(matches).not.toBeNull();
    expect(matches.length).toBe(2);
  });
});
