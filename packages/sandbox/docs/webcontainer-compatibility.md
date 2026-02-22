# WebContainer Compatibility

<!-- run spike-runner.ts to populate -->

## Decision matrix

- Python: <!-- choose: (a) support via WASM shim | (b) refuse with user-facing error | (c) defer to DockerDriver -->
- Go: <!-- choose: (a) support via WASM shim | (b) refuse with user-facing error | (c) defer to DockerDriver -->
- Rust: <!-- choose: (a) support via WASM shim | (b) refuse with user-facing error | (c) defer to DockerDriver -->

## Known-incompatible native npm packages

- better-sqlite3 — may require native compilation; consider alternatives such as sqlite3 (JS bindings) or deferring to DockerDriver.
