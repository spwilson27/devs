# Task: Discovery File Write Protocol (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-140]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core (consumer — discovery path resolution), Server Discovery Protocol (consumer — implements the write side of this protocol)]

## 1. Initial Test Written
- [ ] Create module `crates/devs-core/src/discovery.rs` and register it in `lib.rs`. (Discovery logic belongs in devs-core since both server and clients need path resolution; the write/delete functions are the server-side implementation of the shared protocol.)
- [ ] Write these unit tests (all fail-first):
  - `test_write_creates_file_with_correct_content`: Create a temp dir. Call `write_discovery_file(path, addr)` with `addr = "127.0.0.1:50051"`. Read the file back. Assert content is exactly `"127.0.0.1:50051"` (no trailing newline, no extra whitespace).
  - `test_write_is_atomic_via_rename`: Create a temp dir. Call `write_discovery_file`. Assert that no `.tmp` file remains after the call. Assert the final file exists.
  - `test_write_overwrites_stale_file`: Write `"old:1234"` to the discovery path manually. Call `write_discovery_file` with a new address. Read back. Assert content matches the new address (stale file overwritten).
  - `test_write_creates_parent_directories`: Use a path like `tmpdir/nested/dir/server.addr`. Call `write_discovery_file`. Assert the file exists (parent dirs were created).
  - `test_delete_removes_file`: Write a discovery file first. Call `delete_discovery_file(path)`. Assert the file no longer exists.
  - `test_delete_nonexistent_is_ok`: Call `delete_discovery_file` on a path that doesn't exist. Assert `Ok(())` — no error for missing file.
  - `test_resolve_path_env_override`: Set env var `DEVS_DISCOVERY_FILE=/tmp/test_disc.addr`. Call `resolve_discovery_path()`. Assert it returns `/tmp/test_disc.addr`. Unset the env var afterward.
  - `test_resolve_path_default`: With no env var set, call `resolve_discovery_path()`. Assert it returns `~/.config/devs/server.addr` (expanded).
- [ ] Tag each test with `// Covers: 2_TAS-REQ-140`.

## 2. Task Implementation
- [ ] Implement `pub fn resolve_discovery_path() -> PathBuf`:
  - Check `std::env::var("DEVS_DISCOVERY_FILE")`. If set and non-empty, return that path.
  - Otherwise, return `dirs::config_dir().unwrap_or(home/.config)/devs/server.addr`.
- [ ] Implement `pub async fn write_discovery_file(path: &Path, addr: &str) -> std::io::Result<()>`:
  1. Create parent directories: `tokio::fs::create_dir_all(path.parent().unwrap()).await?`.
  2. Compute tmp path: `let tmp = path.with_extension("addr.tmp")` (or append `.tmp` to filename).
  3. Write content: `tokio::fs::write(&tmp, addr.as_bytes()).await?`.
  4. Atomic rename: `tokio::fs::rename(&tmp, path).await?`.
  - This matches REQ-140 steps 1-3 and step 6 (overwrite stale file via atomic rename).
- [ ] Implement `pub async fn delete_discovery_file(path: &Path) -> std::io::Result<()>`:
  - `tokio::fs::remove_file(path).await`. If error is `NotFound`, return `Ok(())`.
  - This satisfies REQ-140 step 5 (SIGTERM cleanup).
- [ ] Add `/// Covers: 2_TAS-REQ-140` doc comments on all three functions.
- [ ] Note on REQ-140 step 4 ("written ONLY after both ports bound"): This is enforced by the caller (server startup sequence in task 04), not by this function. Add a doc comment noting this precondition.

## 3. Code Review
- [ ] Verify atomic rename pattern: write to `.tmp`, then `rename`. No direct write to final path.
- [ ] Verify `delete_discovery_file` tolerates missing file (no error on `NotFound`).
- [ ] Verify `resolve_discovery_path` checks `DEVS_DISCOVERY_FILE` env var first, then falls back to default.
- [ ] Verify content is plain `<host>:<port>` string — no JSON, no trailing newline.
- [ ] Verify parent directory creation happens before write.
- [ ] No `unwrap()` or `panic!()` outside tests (the `path.parent().unwrap()` is acceptable since all valid file paths have a parent; add a comment explaining this).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- discovery` and ensure all 8 test cases pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add `pub mod discovery;` to `crates/devs-core/src/lib.rs`.
- [ ] Module-level doc comment describing the discovery file protocol, referencing REQ-140 and the shared Server Discovery Protocol component.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass.
- [ ] Run `./do test` — must pass; verify `discovery` tests appear in output.
- [ ] Grep for `// Covers: 2_TAS-REQ-140` to confirm traceability.
