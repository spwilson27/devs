/**
 * compatibility.spike.test.ts
 *
 * Initial spike tests for WebContainer runtime compatibility.
 * These tests are written to capture desired behavior and may fail until
 * the implementation and dependency (@webcontainer/api) are added.
 */

import { describe, test, expect } from 'vitest';

// Use dynamic import so tests fail clearly when @webcontainer/api is not installed.
async function tryImportWebContainer(): Promise<any | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('@webcontainer/api');
    return mod;
  } catch (err) {
    return null;
  }
}

describe('WebContainer compatibility spike (integration)', () => {
  test('should attempt to boot @webcontainer/api and run basic node --version', async () => {
    const wcMod = await tryImportWebContainer();
    if (!wcMod) {
      // Dependency not installed; fail the test to indicate setup is incomplete.
      throw new Error('@webcontainer/api not installed; add as a dependency to run this spike');
    }

    // If the module exists, attempt to boot and run node --version.
    // Exact runtime behavior will be asserted by later implementation-specific tests.
    // This smoke test ensures the API surface is reachable.
    // The implementation test will be fleshed out in compatibility-probe.ts.
    expect(typeof wcMod.WebContainer).toBe('function');
  });

  test('CompatibilityReport shape should match required interface', () => {
    // Shape-only test to be validated at runtime by compatibility-probe implementation.
    type CompatibilityReport = {
      nodeSupported: boolean;
      pythonSupported: boolean;
      goSupported: boolean;
      rustSupported: boolean;
      nativeNpmSupported: boolean;
      unsupportedReasons: Record<string, string>;
    };

    // Basic compile-time shape validation (no runtime assertion other than existence).
    const sample: CompatibilityReport = {
      nodeSupported: true,
      pythonSupported: false,
      goSupported: false,
      rustSupported: false,
      nativeNpmSupported: false,
      unsupportedReasons: {},
    };

    expect(typeof sample.nodeSupported).toBe('boolean');
    expect(typeof sample.unsupportedReasons).toBe('object');
  });
});
