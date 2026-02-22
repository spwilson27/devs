import { RUNTIME_COMPAT_MATRIX } from './runtime-compat-matrix';

export class RuntimeCompatibilityChecker {
  isRuntimeSupported(runtime: string): boolean {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    // If a runtime is not present in the compatibility matrix, assume it's supported
    // by default to keep the WebContainerDriver permissive for simple commands
    // (echo, sleep, custom binaries, etc.). Explicit matrix entries can mark
    // specific runtimes as unsupported.
    return entry ? Boolean(entry.supported === true) : true;
  }

  getUnsupportedReason(runtime: string): string | null {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    if (!entry) return null;
    return entry.supported ? null : entry.reason ?? `Runtime ${runtime} is not supported in WebContainerDriver.`;
  }

  getFallbackDriver(runtime: string): 'docker' | null {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    return entry ? (entry.fallbackDriver ?? null) : null;
  }
}
