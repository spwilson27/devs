# Task: Single Tokio Runtime Enforcement and spawn_blocking Policy (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002K], [2_TAS-REQ-002L]

## Dependencies
- depends_on: [none]
- shared_components: [Shared State & Concurrency Patterns (consumer — implements the single-runtime and spawn_blocking patterns defined there)]

## 1. Initial Test Written
- [ ] In `crates/devs-server/src/runtime.rs` (or `crates/devs-core/src/concurrency.rs` if server crate doesn't exist yet), write the following tests **before implementation**:
- [ ] **`test_single_runtime_no_nested_runtime`**: Inside an `#[tokio::test]` context, call `tokio::runtime::Handle::try_current()`. Assert it returns `Ok`. Then attempt to build a second `tokio::runtime::Runtime` using `Runtime::new()` — this should succeed (Tokio allows it), but assert via a project-level helper or convention check that no code path in the server does this. This test documents the invariant. Annotate with `// Covers: 2_TAS-REQ-002K`.
- [ ] **`test_spawn_blocking_does_not_block_async_tasks`**: In an `#[tokio::test]` context, spawn a `spawn_blocking` task that sleeps for 200ms. Simultaneously spawn an async task that completes a trivial operation. Assert the async task completes in under 50ms (not blocked by the sleeping task). Annotate with `// Covers: 2_TAS-REQ-002L`.
- [ ] **`test_spawn_blocking_runs_closure_to_completion`**: Wrap a simulated blocking call (`std::thread::sleep(Duration::from_millis(50))` followed by returning a value) in `spawn_blocking`. Assert the returned value is correct and the future resolves. Annotate with `// Covers: 2_TAS-REQ-002L`.
- [ ] **`test_blocking_wrapper_helper`**: If a `run_blocking` helper is provided, test that `run_blocking(|| expensive_sync_op()).await` returns the correct result and does not panic. Annotate with `// Covers: 2_TAS-REQ-002L`.

## 2. Task Implementation
- [ ] In the server binary entry point (`crates/devs-server/src/main.rs` or equivalent), use exactly:
  ```rust
  #[tokio::main]
  async fn main() -> Result<()> {
      // ...
  }
  ```
  This gives a multi-threaded runtime with worker threads = logical CPUs (the Tokio default). Do NOT pass `flavor = "current_thread"` or manually configure `worker_threads`. [2_TAS-REQ-002K]
- [ ] Create a `run_blocking` helper function in `devs-core` (or the appropriate utility location):
  ```rust
  /// Dispatch a blocking closure to the Tokio blocking thread pool.
  ///
  /// All blocking operations (git2 calls, subprocess wait(), synchronous SSH)
  /// MUST use this function instead of calling directly on a worker thread.
  /// See [2_TAS-REQ-002L].
  pub async fn run_blocking<F, T>(f: F) -> Result<T, tokio::task::JoinError>
  where
      F: FnOnce() -> T + Send + 'static,
      T: Send + 'static,
  {
      tokio::task::spawn_blocking(f).await
  }
  ```
- [ ] Add a clippy-level lint configuration or a custom `./do lint` check that searches for known blocking patterns in async contexts without `spawn_blocking`:
  - Pattern: `git2::Repository::` calls not inside a `spawn_blocking` closure.
  - Pattern: `std::process::Command` `.wait()` or `.output()` calls not inside `spawn_blocking`.
  - Pattern: `std::thread::sleep` inside async functions (outside of tests).
  - Implement as a grep-based check in `./do lint` that scans `src/` directories (excluding `test` modules) and fails if matches are found without an adjacent `spawn_blocking` wrapper.
- [ ] Add `// BLOCKING: see 2_TAS-REQ-002L` comments at each call site where `run_blocking` is used (as call sites are added in later phases — for now, document the convention).

## 3. Code Review
- [ ] Verify the server uses `#[tokio::main]` with no custom runtime builder overrides [2_TAS-REQ-002K].
- [ ] Verify no other `tokio::runtime::Runtime::new()` or `Builder::new_multi_thread().build()` calls exist in the codebase [2_TAS-REQ-002K].
- [ ] Verify the `run_blocking` helper exists and is the canonical way to dispatch blocking work [2_TAS-REQ-002L].
- [ ] Verify the lint check catches at least: `git2::Repository::open`, `Command::new(...).output()`, `std::thread::sleep` in async contexts.
- [ ] Verify no `std::sync::Mutex` or `std::sync::RwLock` is held across `.await` points (related concurrency safety).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-server` (or the crate hosting runtime tests) and confirm all pass.
- [ ] Run `cargo test -p devs-core` if the `run_blocking` helper lives there.
- [ ] Run `./do lint` and confirm the blocking-call check passes on the current codebase.

## 5. Update Documentation
- [ ] Add doc comments to `run_blocking` explaining when and why it must be used.
- [ ] Add a "Concurrency Policy" section to `crates/devs-core/src/lib.rs` module docs (or equivalent) summarizing: single runtime, spawn_blocking for blocking ops, no nested runtimes.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `// Covers: 2_TAS-REQ-002K` and `// Covers: 2_TAS-REQ-002L` annotations appear in `target/traceability.json`.
- [ ] Run `./do lint` and confirm the blocking-pattern scanner passes.
- [ ] Run `./do presubmit` for full validation.
