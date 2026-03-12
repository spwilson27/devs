# Task: Scheduling Latency and Isolation Foundation (Sub-Epic: 011_Foundational Technical Requirements (Part 2))

## Covered Requirements
- [2_PRD-BR-004], [2_PRD-BR-005]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Create a foundational test file `tests/foundation/performance_isolation.rs`.
- [ ] Write a test `test_scheduling_latency` that:
    - Spawns 10 concurrent tasks using `tokio::spawn`.
    - Captures the `Instant::now()` before spawning and the `Instant::now()` inside each task.
    - Asserts that the delta between the first spawn and the last task start is < 100 ms.
- [ ] Write a test `test_filesystem_isolation` that:
    - Spawns 2 concurrent tasks.
    - Each task creates its own `tempfile::tempdir()`.
    - Each task writes a unique file to its directory.
    - Each task asserts that its directory does not contain the file created by the other task.
    - Asserts that the directory paths are distinct.

## 2. Task Implementation
- [ ] Ensure `tokio` and `tempfile` are correctly configured in `Cargo.toml` as per Layer 0 requirements [2_TAS-REQ-005].
- [ ] Implement the `test_scheduling_latency` logic to account for standard OS scheduler variance (e.g., warm up the runtime if necessary).
- [ ] Implement `test_filesystem_isolation` to use `tempfile::TempDir` correctly, ensuring cleanup on drop.
- [ ] Add the `#[test]` attribute and coverage annotations `// Covers: 2_PRD-BR-004`, `// Covers: 2_PRD-BR-005`.

## 3. Code Review
- [ ] Verify that the latency test uses high-resolution timers (`std::time::Instant`).
- [ ] Ensure that the isolation test genuinely proves no sharing of namespace (e.g., by using unique filenames or checking PWD).
- [ ] Check that these tests pass on all target OSes (Linux, macOS, Windows) as per Layer 0 consistency requirements.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --test performance_isolation` and ensure all tests pass.
- [ ] Verify that the 100ms constraint is reliably met on the current development machine.

## 5. Update Documentation
- [ ] Document the baseline performance and isolation guarantees in `docs/plan/specs/2_tas.md` or a similar technical specification.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure [2_PRD-BR-004] and [2_PRD-BR-005] are correctly mapped to these tests.
