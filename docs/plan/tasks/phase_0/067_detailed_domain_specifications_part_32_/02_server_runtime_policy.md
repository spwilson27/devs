# Task: Server Runtime and Blocking I/O Policy (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-410], [2_TAS-REQ-411]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create an integration test that attempts to:
    - Instantiate a second Tokio runtime (`tokio::runtime::Runtime::new()`) in a context where the server is expected to run.
    - Execute a blocking I/O operation (e.g., `std::thread::sleep(Duration::from_secs(2))`) directly on a Tokio worker thread.
- [ ] Write a test runner script (added to `./do test`) that verifies these operations are either:
    - Blocked by a runtime check.
    - Identified as violations by a linter (e.g., `clippy::disallowed_methods`).

## 2. Task Implementation
- [ ] Implement a foundational runtime module (e.g., `devs-common::runtime`) that provides:
    - A standard `#[tokio::main]` entry point for the server, enforcing a single runtime.
    - A wrapper or helper for `tokio::task::spawn_blocking` that should be used for all synchronous operations like `git2` and subprocess `wait()`.
- [ ] Add a `clippy.toml` configuration to disallow direct use of `tokio::runtime::Builder` or `Runtime::new` outside of the main server module.
- [ ] Update the `./do lint` script to enforce that all `std::process::Command::spawn` calls are wrapped or followed by non-blocking wait logic, or run within `spawn_blocking`.
- [ ] Provide documentation and code examples of the correct pattern for `spawn_blocking`.

## 3. Code Review
- [ ] Ensure that only ONE Tokio runtime is created across the whole process.
- [ ] Verify that no synchronous I/O blocks a worker thread.
- [ ] Check for clear error messages when the runtime policy is violated.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` to ensure no runtime violations exist.
- [ ] Run the integration tests that verify single-runtime enforcement.

## 5. Update Documentation
- [ ] Add a section on "Concurrency and I/O Patterns" to the developer guide, referencing [2_TAS-REQ-410] and [2_TAS-REQ-411].
- [ ] Update the `devs-common` or library README to reflect the runtime and blocking I/O policy.

## 6. Automated Verification
- [ ] Use `grep -r "Runtime::new" .` (or equivalent) to verify no unauthorized runtimes are being created.
- [ ] Validate that all `std::fs` operations in the core or server are replaced by `tokio::fs` or run in `spawn_blocking`.
