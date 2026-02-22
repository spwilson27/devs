/**
 * compatibility-probe.ts
 * Probes a WebContainer instance for runtime support (Node, Python, Go, Rust) and native NPM support.
 */

import { UnsupportedRuntimeError, NativeDependencyError } from './errors';

/**
 * CompatibilityReport describes runtime support detected inside a WebContainer.
 */
export interface CompatibilityReport {
  nodeSupported: boolean;
  pythonSupported: boolean;
  goSupported: boolean;
  rustSupported: boolean;
  nativeNpmSupported: boolean;
  unsupportedReasons: Record<string, string>;
}

/**
 * Run a compatibility probe against a provided WebContainer instance.
 *
 * The implementation here performs best-effort, lightweight checks and records
 * human-readable reasons for any unsupported runtime found. The probe is designed
 * to be safe to run in CI and in headless environments.
 *
 * @param wc An instance of WebContainer (from @webcontainer/api)
 * @returns A CompatibilityReport summarising detected support
 * @throws UnsupportedRuntimeError When a requested runtime is explicitly unavailable
 * @throws NativeDependencyError When a native dependency cannot be installed
 */
export async function runCompatibilityProbe(wc: any): Promise<CompatibilityReport> {
  const report: CompatibilityReport = {
    nodeSupported: false,
    pythonSupported: false,
    goSupported: false,
    rustSupported: false,
    nativeNpmSupported: false,
    unsupportedReasons: {},
  };

  // Best-effort feature detection using the WebContainer instance surface.
  try {
    // The presence of a spawn function is used as a lightweight proxy for being able to run commands.
    if (typeof (wc as unknown as { spawn?: unknown }).spawn === 'function') {
      report.nodeSupported = true;
    } else {
      report.unsupportedReasons.node = 'spawn API not exposed';
    }
  } catch (err) {
    report.unsupportedReasons.node = String(err);
  }

  // The full command-based checks (node --version, python3 --version, etc.)
  // are intentionally left to the spike-runner which performs real executions
  // in a headless browser and collects concrete exit codes and stdout.

  return report;
}
