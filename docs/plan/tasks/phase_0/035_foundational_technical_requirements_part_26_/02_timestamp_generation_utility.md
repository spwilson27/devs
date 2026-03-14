# Task: Timestamp Generation Utility and Clock Policy Enforcement (Sub-Epic: 035_Foundational Technical Requirements (Part 26))

## Covered Requirements
- [2_TAS-REQ-086L]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] In `crates/devs-core/src/time.rs` (or `crates/devs-core/tests/time_policy.rs`), write the following tests **before** implementation:
  - `test_now_returns_utc`: Call `devs_core::time::now()`, assert that the returned `DateTime<Utc>` is within 1 second of `chrono::Utc::now()`. This verifies the function delegates to wall-clock UTC.
  - `test_now_is_not_local`: Call `devs_core::time::now()`, confirm the timezone offset is exactly `+00:00` (UTC). This guards against accidental use of `chrono::Local`.
  - `test_elapsed_returns_duration`: Call `devs_core::time::elapsed_since(start: std::time::Instant)` after a `std::thread::sleep(Duration::from_millis(50))`, assert the returned `Duration` is >= 50ms and < 200ms. This confirms monotonic clock usage for elapsed measurements.
  - `test_elapsed_ms_u64_conversion`: Call `devs_core::time::elapsed_ms(start: std::time::Instant)`, assert it returns a `u64` value representing milliseconds, consistent with `elapsed_ms` fields in proto messages.
  - `test_now_monotonically_nondecreasing`: Call `devs_core::time::now()` twice in sequence, assert `t2 >= t1`. Note: wall clocks can go backwards due to NTP, but this test is a basic sanity check.

## 2. Task Implementation
- [ ] Create `crates/devs-core/src/time.rs` with the following public API:
  - `pub fn now() -> chrono::DateTime<chrono::Utc>` — wraps `chrono::Utc::now()`. All server code that needs a wall-clock timestamp must call this function instead of `chrono::Utc::now()` directly. This indirection enables future testability (injectable clock).
  - `pub fn elapsed_since(start: std::time::Instant) -> std::time::Duration` — wraps `start.elapsed()`. Used for elapsed-time measurements in `elapsed_ms` fields.
  - `pub fn elapsed_ms(start: std::time::Instant) -> u64` — convenience: `start.elapsed().as_millis() as u64`. Returns the value that goes into proto `elapsed_ms` fields.
- [ ] Add `pub mod time;` to `crates/devs-core/src/lib.rs`.
- [ ] Add a `#![doc]` comment at the top of `time.rs` explaining the project clock policy:
  - Wall-clock UTC (`chrono::Utc::now()` via `devs_core::time::now()`) for all stored timestamps: checkpoint files, webhook payloads, proto timestamp fields, CLI output.
  - Monotonic clock (`std::time::Instant`) only for elapsed-time/duration measurements reported in `elapsed_ms` fields.
  - `chrono::Local` is forbidden project-wide.
- [ ] Add a lint check to `./do lint`: `grep -rn "chrono::Local" crates/ --include="*.rs"` must return zero results. If any matches are found, `./do lint` must fail with a message: `"ERROR: chrono::Local is forbidden — use devs_core::time::now() for UTC timestamps"`.

## 3. Code Review
- [ ] Verify the `time` module has no dependencies beyond `chrono` and `std` — it must remain lightweight.
- [ ] Verify the function signatures match exactly what was specified (return types, parameter types).
- [ ] Verify the `./do lint` grep check is wired in and actually runs.
- [ ] Verify no existing code in the workspace calls `chrono::Utc::now()` directly (all should go through `devs_core::time::now()`). If existing code exists, it should be migrated as part of this task.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- time` to verify all timestamp utility tests pass.
- [ ] Run `./do lint` to verify the `chrono::Local` ban is enforced.

## 5. Update Documentation
- [ ] Add doc comments on each public function in `time.rs` referencing [2_TAS-REQ-086L].
- [ ] Ensure the module-level doc comment clearly states the policy for future contributors.

## 6. Automated Verification
- [ ] Run `./do test` and confirm zero failures.
- [ ] Run `./do lint` and confirm zero warnings.
- [ ] Run `grep -rn "chrono::Local" crates/ --include="*.rs" | wc -l` and confirm output is `0`.
- [ ] Run `grep -rn "chrono::Utc::now()" crates/ --include="*.rs" | grep -v "devs-core/src/time.rs" | wc -l` and confirm output is `0` (no direct calls outside the utility module).
