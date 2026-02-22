import { describe, it, expect } from 'vitest';
import { RuntimeCompatibilityChecker } from '../runtime-compat-checker';
import { NativeDependencyChecker } from '../native-dependency-checker';

describe('RuntimeCompatibilityChecker', () => {
  const checker = new RuntimeCompatibilityChecker();

  it("isRuntimeSupported('node') returns true", () => {
    expect(checker.isRuntimeSupported('node')).toBe(true);
  });

  it("isRuntimeSupported('python3') returns false", () => {
    expect(checker.isRuntimeSupported('python3')).toBe(false);
  });

  it("isRuntimeSupported('go') returns false", () => {
    expect(checker.isRuntimeSupported('go')).toBe(false);
  });

  it("isRuntimeSupported('rustc') returns false", () => {
    expect(checker.isRuntimeSupported('rustc')).toBe(false);
  });

  it("getUnsupportedReason('python3') returns a non-empty string", () => {
    const reason = checker.getUnsupportedReason('python3');
    expect(typeof reason === 'string' && reason.length > 0).toBe(true);
  });

  it("getFallbackDriver('python3') returns 'docker'", () => {
    expect(checker.getFallbackDriver('python3')).toBe('docker');
  });

  it("getFallbackDriver('node') returns null", () => {
    expect(checker.getFallbackDriver('node')).toBeNull();
  });
});

describe('NativeDependencyChecker', () => {
  const ndc = new NativeDependencyChecker();

  it("requiresNativeCompilation('better-sqlite3') returns true", () => {
    expect(ndc.requiresNativeCompilation('better-sqlite3')).toBe(true);
  });

  it("requiresNativeCompilation('lodash') returns false", () => {
    expect(ndc.requiresNativeCompilation('lodash')).toBe(false);
  });

  it("requiresNativeCompilation('sharp') returns true", () => {
    expect(ndc.requiresNativeCompilation('sharp')).toBe(true);
  });

  it("getAlternative('better-sqlite3') returns 'sql.js'", () => {
    expect(ndc.getAlternative('better-sqlite3')).toBe('sql.js');
  });

  it("getAlternative('sharp') returns null", () => {
    expect(ndc.getAlternative('sharp')).toBeNull();
  });
});
