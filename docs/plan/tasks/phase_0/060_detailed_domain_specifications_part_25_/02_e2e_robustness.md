# Task: E2E Test Server Cleanup and Random Port Infrastructure (Sub-Epic: 060_Detailed Domain Specifications (Part 25))

## Covered Requirements
- [2_TAS-REQ-255], [2_TAS-REQ-256]

## Dependencies
- depends_on: []
- shared_components: ["Traceability & Coverage Infrastructure", "./do Entrypoint Script & CI Pipeline"]

## 1. Initial Test Written
- [ ] In a test utilities crate or module (e.g., `crates/devs-test-harness/src/lib.rs` or `crates/devs-core/src/test_utils.rs`), write the following tests FIRST:
  - **Test 1 — `random_available_port` returns non-zero port**: Call a `random_available_port() -> u16` function and assert the returned port is > 0. Call it twice and assert the two ports are different (probabilistically; bind both simultaneously to guarantee).
    ```rust
    #[test]
    fn test_random_port_is_nonzero() {
        let port = random_available_port();
        assert!(port > 0);
    }
    ```
  - **Test 2 — `random_available_port` does not collide under concurrent use**: Spawn 10 threads, each calling `random_available_port()` while holding the `TcpListener` open. Collect all ports into a `HashSet` and assert `set.len() == 10` (all unique).
    ```rust
    #[test]
    fn test_random_ports_no_collision() {
        let ports: HashSet<u16> = (0..10)
            .into_par_iter() // or threads
            .map(|_| random_available_port())
            .collect();
        assert_eq!(ports.len(), 10);
    }
    ```
  - **Test 3 — `TestServerGuard` kills subprocess on drop**: Create a `TestServerGuard` that spawns a long-running subprocess (e.g., `sleep 3600`). Assert the child PID is alive. Drop the guard. Assert the child PID is no longer alive (use `kill(pid, 0)` or `waitpid` with `WNOHANG`).
    ```rust
    #[test]
    fn test_server_guard_kills_on_drop() {
        let guard = TestServerGuard::spawn_dummy();
        let pid = guard.pid();
        assert!(process_is_alive(pid));
        drop(guard);
        std::thread::sleep(Duration::from_millis(100));
        assert!(!process_is_alive(pid));
    }
    ```
  - **Test 4 — `TestServerGuard` sets `DEVS_DISCOVERY_FILE` to unique temp path**: Each guard instance must create a unique temporary file path for discovery isolation. Assert two guards produce different paths.
  - **Test 5 — Port-in-use detection**: Bind a `TcpListener` to a port, then attempt to start a `TestServerGuard` on that same port (bypassing random assignment). Assert the guard returns an error indicating address-in-use, not a hang.

## 2. Task Implementation
- [ ] Implement `random_available_port() -> u16` function:
  ```rust
  pub fn random_available_port() -> u16 {
      let listener = std::net::TcpListener::bind("127.0.0.1:0").expect("bind to port 0");
      listener.local_addr().expect("local_addr").port()
  }
  ```
  This uses OS-assigned port 0 to guarantee no collisions ([2_TAS-REQ-256]).
- [ ] Implement `TestServerGuard` struct with the following contract:
  - `spawn(command: &str, args: &[&str], port: u16) -> Result<Self, StartupError>` — starts a subprocess, waits briefly for it to bind, returns error if process exits immediately (e.g., `EADDRINUSE`).
  - `pid(&self) -> u32` — returns the child process ID.
  - `port(&self) -> u16` — returns the bound port.
  - `discovery_file(&self) -> &Path` — returns the unique `DEVS_DISCOVERY_FILE` path.
  - `impl Drop for TestServerGuard` — sends `SIGTERM` then `SIGKILL` after 2-second grace period. Removes the discovery temp file. This satisfies [2_TAS-REQ-255]: E2E test frameworks MUST use explicit cleanup in `Drop` impls for any spawned server processes.
- [ ] Set `DEVS_DISCOVERY_FILE` environment variable for each spawned process to `std::env::temp_dir().join(format!("devs-test-{}.addr", uuid::Uuid::new_v4()))`.
- [ ] Ensure `TestServerGuard::Drop` logs a warning to stderr if the kill fails, rather than panicking.
- [ ] Add `#[cfg(test)]` gating so this utility is only compiled in test builds (or place in a `-test-harness` crate with `[dev-dependencies]` usage).

## 3. Code Review
- [ ] Verify `Drop` impl sends `SIGTERM` first, waits up to 2 seconds, then escalates to `SIGKILL` — never leaves orphan processes.
- [ ] Verify `random_available_port` binds and immediately drops the listener — the port may be reused between drop and actual server bind, but this is the standard pattern and is acceptable.
- [ ] Verify no `unwrap()` or `expect()` calls in `Drop` — only logging on failure.
- [ ] Verify the discovery file temp path includes sufficient entropy (UUID or similar) to prevent collisions across parallel test processes.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p <crate>` for the crate containing the test utilities.
- [ ] Run the tests 5 times in sequence to check for flakiness: `for i in $(seq 5); do cargo test -p <crate> || exit 1; done`
- [ ] After tests complete, run `ps aux | grep sleep` (or equivalent) to verify no zombie `sleep 3600` processes remain from Test 3.

## 5. Update Documentation
- [ ] Add `// Covers: 2_TAS-REQ-255` annotation on the `Drop` impl and kill-on-drop tests.
- [ ] Add `// Covers: 2_TAS-REQ-256` annotation on the `random_available_port` function and port collision tests.
- [ ] Add doc comments to `TestServerGuard` and `random_available_port` explaining their purpose and the requirements they satisfy.

## 6. Automated Verification
- [ ] Run `cargo test -p <crate> -- --test-threads=4` to verify tests pass under parallel execution.
- [ ] Run `cargo test -p <crate> 2>&1 | grep -c 'test result: ok'` — must be at least 1.
- [ ] After test run, verify no orphan processes: `pgrep -f 'sleep 3600' && exit 1 || echo PASS`.
