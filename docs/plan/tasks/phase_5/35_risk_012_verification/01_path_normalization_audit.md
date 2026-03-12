# Task: Implement Path Normalization Audit (Sub-Epic: 35_Risk 012 Verification)

## Covered Requirements
- [RISK-012-BR-002]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core, devs-proto, devs-checkpoint]

## 1. Initial Test Written
- [ ] Create a cross-platform integration test in `tests/e2e/path_normalization_test.rs` that submits a run on both Linux and (mocked) Windows environments.
- [ ] Assert that paths in the `SubmitRunResponse`, `GetRunResponse`, `checkpoint.json`, and the `server.addr` discovery file use forward-slashes (`/`) even when the underlying OS uses backslashes (`\`).
- [ ] Add unit tests to `devs-core` for `normalize_path_display()` utility function, covering:
    - `C:\Users\dev\project` -> `C:/Users/dev/project`
    - `C:\Users\dev\\project` -> `C:/Users/dev/project` (collapse double slashes)
    - `//server/share` -> `//server/share` (preserve leading double slash for UNC paths)

## 2. Task Implementation
- [ ] Implement `normalize_path_display(p: &Path) -> String` in `devs-core/src/utils.rs` (or equivalent utility module).
- [ ] Audit all gRPC service implementations in `devs-server` and ensure any path returned in a message is wrapped in `normalize_path_display()`.
- [ ] Audit all MCP tool handlers in `devs-mcp` and ensure any path returned in a JSON response is normalized.
- [ ] Modify `devs-checkpoint` to use normalized paths when writing `checkpoint.json` and `workflow_snapshot.json`.
- [ ] Update the server discovery file writing logic to apply normalization before writing to `~/.config/devs/server.addr`.

## 3. Code Review
- [ ] Verify that no `PathBuf::display().to_string()` or `Path::to_string_lossy()` calls exist in serialization code paths without being wrapped by `normalize_path_display()`.
- [ ] Ensure `normalize_path_display()` handles UNC paths correctly on Windows if applicable.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib utils::tests::test_normalize_path_display`.
- [ ] Run `cargo test --test path_normalization_test`.

## 5. Update Documentation
- [ ] Update `GEMINI.md` to reflect that all serialized paths are now normalized to forward-slashes for cross-platform consistency.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `RISK-012-BR-002` is marked as covered in `target/traceability.json`.
