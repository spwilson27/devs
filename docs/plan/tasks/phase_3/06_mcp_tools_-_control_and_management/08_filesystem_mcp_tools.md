# Task: Implement Filesystem MCP Tools (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-NEW-003], [3_MCP_DESIGN-REQ-BR-013], [3_MCP_DESIGN-REQ-BR-014], [3_MCP_DESIGN-REQ-BR-015], [3_MCP_DESIGN-REQ-BR-016], [3_MCP_DESIGN-REQ-BR-017], [3_MCP_DESIGN-REQ-EC-FS-001], [3_MCP_DESIGN-REQ-EC-FS-002], [3_MCP_DESIGN-REQ-EC-FS-003], [3_MCP_DESIGN-REQ-EC-FS-004], [3_MCP_DESIGN-REQ-EC-FS-005], [3_MCP_DESIGN-REQ-EC-FS-006]

## Dependencies
- depends_on: []
- shared_components: ["devs-core (consumer — path validation utilities)"]

## 1. Initial Test Written
- [ ] Create `crates/devs-mcp/src/tools/filesystem/fs_tests.rs`
- [ ] **Test: `test_read_file_success`** — Call `read_file(path: "src/main.rs")`. Assert file content returned. Covers [3_MCP_DESIGN-REQ-NEW-003].
- [ ] **Test: `test_read_file_relative_paths_only`** — Call with absolute path `/etc/passwd`. Assert `invalid_argument` error — all paths must be relative to project root. Covers [3_MCP_DESIGN-REQ-BR-013].
- [ ] **Test: `test_read_file_on_directory`** — Call `read_file(path: "src/")` (a directory, not a file). Assert `invalid_argument: path is a directory` error. Covers [3_MCP_DESIGN-REQ-EC-FS-001].
- [ ] **Test: `test_path_traversal_blocked`** — Call `read_file(path: "../../etc/passwd")` with `..` escaping project root. Assert `permission_denied: path traversal blocked` error. Covers [3_MCP_DESIGN-REQ-BR-015].
- [ ] **Test: `test_path_dotdot_within_bounds`** — Call `read_file(path: "src/../Cargo.toml")` where `..` resolves within project root. Assert file content returned successfully. Covers [3_MCP_DESIGN-REQ-EC-FS-002].
- [ ] **Test: `test_target_directory_read_only`** — Call `write_file(path: "target/foo.txt", content: "x")`. Assert `permission_denied: target/ is read-only` error. Then call `read_file(path: "target/debug/something")`. Assert read succeeds (read-only, not read-blocked). Covers [3_MCP_DESIGN-REQ-BR-014].
- [ ] **Test: `test_write_to_devs_runs_rejected`** — Call `write_file(path: ".devs/runs/foo.json", content: "{}")`. Assert `permission_denied` error — `.devs/runs/` is server-managed. Covers [3_MCP_DESIGN-REQ-BR-017], [3_MCP_DESIGN-REQ-EC-FS-006].
- [ ] **Test: `test_write_to_devs_agent_state_allowed`** — Call `write_file(path: ".devs/agent-state/session.json", content: "{}")`. Assert success — `.devs/agent-state/` is agent-writable. Covers [3_MCP_DESIGN-REQ-BR-017].
- [ ] **Test: `test_search_content_with_regex`** — Call `search_content(pattern: "fn main", path: "src/")`. Assert results returned using Rust `regex` crate. Covers [3_MCP_DESIGN-REQ-BR-016].
- [ ] **Test: `test_search_content_exceeds_max_results`** — Search with pattern matching >1000 results. Assert results truncated to `max_results` (default 100). Covers [3_MCP_DESIGN-REQ-EC-FS-004].
- [ ] **Test: `test_list_directory_success`** — Call `list_directory(path: "src/")`. Assert directory entries returned. Covers [3_MCP_DESIGN-REQ-NEW-003].
- [ ] **Test: `test_list_directory_nonexistent`** — Call `list_directory(path: "nonexistent/")`. Assert `not_found` error. Covers [3_MCP_DESIGN-REQ-EC-FS-005].
- [ ] **Test: `test_write_file_disk_full`** — Simulate disk full during atomic write (temp file + rename). Assert error returned and no partial file left behind. Covers [3_MCP_DESIGN-REQ-EC-FS-003].

## 2. Task Implementation
- [ ] Create `crates/devs-mcp/src/tools/filesystem/mod.rs` with submodules for each operation
- [ ] Implement `handle_read_file`, `handle_write_file`, `handle_list_directory`, `handle_search_content`
- [ ] **Path validation layer** (shared across all filesystem tools):
  - Reject absolute paths (must be relative to project root)
  - Canonicalize and verify resolved path is within project root (block traversal)
  - `target/` directory: read-only (reject writes)
  - `.devs/runs/`: server-managed, reject agent writes
  - `.devs/workflows/`, `.devs/prompts/`, `.devs/agent-state/`: agent-readable and writable
- [ ] `search_content`: use `regex::Regex` crate for pattern matching, enforce `max_results` limit (default 100)
- [ ] `write_file`: atomic write via temp file in same directory + `std::fs::rename`
- [ ] Register tools: `"read_file"`, `"write_file"`, `"list_directory"`, `"search_content"`

## 3. Code Review
- [ ] Verify path canonicalization prevents all traversal attacks (symlink-aware if possible)
- [ ] Verify `.devs/runs/` is unconditionally blocked for writes
- [ ] Verify `target/` is blocked for writes but allowed for reads
- [ ] Verify search uses Rust `regex` crate (not shell grep)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --lib tools::filesystem::fs_tests`

## 5. Update Documentation
- [ ] Doc comments on path security model, read-only directories, and server-managed paths

## 6. Automated Verification
- [ ] Run `./do test` — all filesystem tests pass
- [ ] Run `./do lint` — zero warnings
