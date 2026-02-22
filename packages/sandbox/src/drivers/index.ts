// Drivers barrel for concrete driver implementations (process, container, etc.).
// Expose webcontainer-specific probes and driver errors so consumers can import
// CompatibilityReport and the related error types from the package root.
export * from './webcontainer/compatibility-probe';
export * from './webcontainer/errors';
// Export concrete drivers here.
export { DockerDriver } from './DockerDriver';
export type { DockerDriverConfig } from './DockerDriver';
export { WebContainerDriver } from './WebContainerDriver';
export type { WebContainerDriverConfig } from './WebContainerDriver';

// Runtime & native compatibility helpers
export { RuntimeCompatibilityChecker } from './webcontainer/runtime-compat-checker';
export { RUNTIME_COMPAT_MATRIX } from './webcontainer/runtime-compat-matrix';
export { NativeDependencyChecker, NATIVE_PACKAGES } from './webcontainer/native-dependency-checker';
