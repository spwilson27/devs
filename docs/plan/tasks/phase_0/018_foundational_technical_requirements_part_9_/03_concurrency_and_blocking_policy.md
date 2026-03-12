# Task: Server Concurrency and Blocking Operations (Sub-Epic: 018_Foundational Technical Requirements (Part 9))

## Covered Requirements
- [2_TAS-REQ-002K], [2_TAS-REQ-002L]

## Dependencies
- depends_on: [none]
- shared_components: [none]

## 1. Initial Test Written
- [ ] Create a unit test (e.g. in `devs-server`) that verifies the Tokio runtime configuration.
- [ ] Implement a test that attempts to run a "blocking" operation (using `std::thread::sleep`) and verifies that it can be offloaded to `spawn_blocking` without stalling a standard async task.
- [ ] Test that multiple `spawn_blocking` tasks can run in parallel, confirming the multi-threaded nature of the runtime.
- [ ] Assert that there is only one Tokio runtime active (use a helper to check thread counts or runtime stats).

## 2. Task Implementation
- [ ] Initialize the server's main entry point using `#[tokio::main]`.
- [ ] Ensure that the runtime is multi-threaded by default [2_TAS-REQ-002K].
- [ ] Provide a standardized internal utility or pattern for wrapping blocking operations (such as `git2` calls, subprocess `wait()`, and synchronous SSH) into `tokio::task::spawn_blocking`.
- [ ] Add a `SAFETY` or `NOTE` comment to all blocking call sites referring to [2_TAS-REQ-002L].
- [ ] Ensure that no blocking operation is called directly on a Tokio worker thread.
- [ ] Implement a basic linter or check (e.g., using `grep`) that identifies potential blocking calls (like `std::fs::read_to_string`, `std::process::Command::wait`, `std::thread::sleep`) inside async blocks without `spawn_blocking`.

## 3. Code Review
- [ ] Verify that only one Tokio runtime is initialized [2_TAS-REQ-002K].
- [ ] Confirm that all known blocking operations (git2, subprocess wait, synchronous SSH) use `spawn_blocking` [2_TAS-REQ-002L].
- [ ] Check for any `std::sync::Mutex` or `std::sync::RwLock` held across `.await` points (which is prohibited).
- [ ] Ensure that the worker thread count matches logical CPUs by default.

## 4. Run Automated Tests to Verify
- [ ] Run the concurrency and blocking tests: `cargo test` in the `devs-server` and other relevant crates.
- [ ] Verify that there are no stalled worker threads during heavy "blocking" load.

## 5. Update Documentation
- [ ] Document the server's concurrency model and the requirement to offload blocking tasks.
- [ ] Record the implementation details in the agent's memory.

## 6. Automated Verification
- [ ] Run `./do test` and confirm 100% coverage for [2_TAS-REQ-002K] and [2_TAS-REQ-002L].
- [ ] Check `target/traceability.json` to ensure the mapping is correct.
