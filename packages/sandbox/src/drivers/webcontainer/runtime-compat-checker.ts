import { RUNTIME_COMPAT_MATRIX } from './runtime-compat-matrix';

export class RuntimeCompatibilityChecker {
  isRuntimeSupported(runtime: string): boolean {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    return Boolean(entry && entry.supported === true);
  }

  getUnsupportedReason(runtime: string): string | null {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    if (!entry) return `Runtime ${runtime} not supported in WebContainerDriver.`;
    return entry.supported ? null : entry.reason ?? `Runtime ${runtime} is not supported in WebContainerDriver.`;
  }

  getFallbackDriver(runtime: string): 'docker' | null {
    const entry = RUNTIME_COMPAT_MATRIX[runtime];
    return entry ? (entry.fallbackDriver ?? null) : null;
  }
}
