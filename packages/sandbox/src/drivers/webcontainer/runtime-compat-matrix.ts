// Sourced from docs/webcontainer-compatibility.md findings (spike task 01)
export const RUNTIME_COMPAT_MATRIX: Record<string, { supported: boolean; reason?: string; fallbackDriver?: 'docker' | null }> = {
  node:    { supported: true },
  npm:     { supported: true },
  npx:     { supported: true },
  python3: { supported: false, reason: 'WebContainers lack POSIX syscalls required by CPython interpreter (clone, execve, fork). Use DockerDriver for Python workloads.', fallbackDriver: 'docker' },
  python:  { supported: false, reason: 'Alias of python3. Same limitation applies.', fallbackDriver: 'docker' },
  go:      { supported: false, reason: 'Go runtime requires Linux syscalls (clone3, mmap) unavailable in browser sandbox.', fallbackDriver: 'docker' },
  rustc:   { supported: false, reason: 'Rust compiler requires fork/exec and filesystem mounts unavailable in WebContainers.', fallbackDriver: 'docker' },
  cargo:   { supported: false, reason: 'Cargo depends on rustc. Same limitation applies.', fallbackDriver: 'docker' },
};
