# Task: Enforce Non-blocking I/O and Single Tokio Runtime Policy (Sub-Epic: 067_Detailed Domain Specifications (Part 32))

## Covered Requirements
- [2_TAS-REQ-410], [2_TAS-REQ-411]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script & CI Pipeline, Shared State & Concurrency Patterns]

## 1. Initial Test Written
- [ ] Create `tests/runtime_policy_tests.rs` (or in an appropriate integration test location) with the following tests:
    - `test_single_runtime_enforcement`: Write a test that uses `tokio::runtime::Handle::try_current()` inside a `#[tokio::test]` to confirm a runtime exists, then attempts `tokio::runtime::Runtime::new()` inside the same context. Assert that the code is structured to prevent this — the test verifies that the project's lint or architectural rules catch double-runtime creation.
    - `test_spawn_blocking_wrapper_exists`: Write a test that calls the project's `spawn_blocking` helper (e.g., `devs_common::blocking::run`) with a closure that performs `std::thread::sleep(Duration::from_millis(10))` and confirm it completes without blocking the Tokio worker thread. Use `tokio::time::timeout` to wrap the call — if the worker were blocked, other tasks would stall.
    - `test_git2_operations_use_spawn_blocking`: Write a test that greps the codebase for `git2::Repository` usage and asserts that every call site is wrapped in `spawn_blocking` or an equivalent helper. This is a static analysis test.
- [ ] Create a lint test in `./do lint` that:
    - Searches for `Runtime::new()` and `Builder::new_multi_thread()` outside of the server's main entrypoint (`main.rs`). Any match is a [2_TAS-REQ-411] violation.
    - Searches for direct `std::fs::` calls in async functions within server/library crates (these should use `tokio::fs` or `spawn_blocking`) per [2_TAS-REQ-410].

## 2. Task Implementation
- [ ] Create a `blocking` module (e.g., in a shared crate like `devs-common` or within the server crate) providing:
    ```rust
    /// Run a blocking closure on the spawn_blocking pool.
    /// All synchronous I/O (git2, subprocess wait, SSH) MUST use this.
    pub async fn run_blocking<F, T>(f: F) -> T
    where
        F: FnOnce() -> T + Send + 'static,
        T: Send + 'static,
    {
        tokio::task::spawn_blocking(f).await.expect("blocking task panicked")
    }
    ```
- [ ] In the server's `main.rs`, use `#[tokio::main]` as the single runtime entry point. Add a comment: `// [2_TAS-REQ-411] Single Tokio runtime — do not create additional runtimes`.
- [ ] Add a `./do lint` check that greps for `Runtime::new`, `Builder::new_multi_thread`, and `Builder::new_current_thread` outside of `main.rs` and test files. Exit non-zero if found.
- [ ] Add a `./do lint` check that greps async `.rs` files in server/library crates for direct `std::fs::read`, `std::fs::write`, `std::fs::remove_file`, etc. These must use `tokio::fs` or `spawn_blocking`. Exclude test code.
- [ ] Add `clippy::disallowed_methods` configuration (in `clippy.toml` or workspace `Cargo.toml`) to flag `tokio::runtime::Runtime::new` and `tokio::runtime::Builder::new_multi_thread` as disallowed outside the main module.

## 3. Code Review
- [ ] Verify that the `run_blocking` helper is the canonical way to run blocking I/O and that it's documented.
- [ ] Confirm no code path in library crates creates a Tokio runtime.
- [ ] Check that all `git2` call sites use `spawn_blocking` or the `run_blocking` wrapper.
- [ ] Verify the lint checks produce clear, actionable error messages with file paths and line numbers.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test` for the runtime policy tests and confirm all pass.
- [ ] Run `./do lint` and confirm exit code 0.
- [ ] Temporarily add `let _rt = tokio::runtime::Runtime::new().unwrap();` to a library crate, run `./do lint`, confirm failure, then revert.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-410` to the spawn_blocking enforcement test.
- [ ] Add `// Covers: 2_TAS-REQ-411` to the single-runtime enforcement test.
- [ ] Document the `run_blocking` helper with a doc comment explaining its purpose and when to use it.

## 6. Automated Verification
- [ ] Run `./do lint` and capture exit code — must be 0.
- [ ] Run `grep -rn 'Runtime::new\|Builder::new_multi_thread\|Builder::new_current_thread' --include='*.rs' crates/` (excluding `main.rs` and test files) and confirm zero matches.
- [ ] Run `./do test` and confirm all runtime policy tests pass.
