# Task: Filesystem MCP Implementation and Scoping (Sub-Epic: 06_MCP Tools - Control and Management)

## Covered Requirements
- [3_MCP_DESIGN-REQ-025], [3_MCP_DESIGN-REQ-026], [3_MCP_DESIGN-REQ-NEW-003], [3_MCP_DESIGN-REQ-BR-013], [3_MCP_DESIGN-REQ-BR-014], [3_MCP_DESIGN-REQ-BR-015], [3_MCP_DESIGN-REQ-BR-016], [3_MCP_DESIGN-REQ-BR-017], [3_MCP_DESIGN-REQ-BR-018], [3_MCP_DESIGN-REQ-EC-FS-001], [3_MCP_DESIGN-REQ-EC-FS-002], [3_MCP_DESIGN-REQ-EC-FS-003], [3_MCP_DESIGN-REQ-EC-FS-004], [3_MCP_DESIGN-REQ-EC-FS-005], [3_MCP_DESIGN-REQ-EC-FS-006]

## Dependencies
- depends_on: [none]
- shared_components: [devs-mcp, devs-core]

## 1. Initial Test Written
- [ ] Write integration tests in `crates/devs-mcp/tests/filesystem_tools.rs` for `read_file`, `write_file`, `list_directory`, `search_content`, and `run_command`.
- [ ] Test cases:
    - [ ] Reading a file outside the workspace root should return `invalid_argument:` or `failed_precondition:`.
    - [ ] Writing to a file within a forbidden directory (e.g., `target/`) should return an error.
    - [ ] List directory should support recursive and depth-limited listing.
    - [ ] Search content should return line numbers and surrounding context.
- [ ] Write E2E test in `tests/mcp_fs_e2e.rs` demonstrating an agent editing a file:
    - [ ] Call `read_file` to get original content.
    - [ ] Call `write_file` with a patch or new content.
    - [ ] Verify the change on the actual filesystem.

## 2. Task Implementation
- [ ] Implement `read_file(path, offset, limit)` in `devs-mcp`:
    - [ ] Validate that `path` is within the configured workspace root.
    - [ ] Support range-based reads (offset + limit) for large files.
- [ ] Implement `write_file(path, content, atomic)` in `devs-mcp`:
    - [ ] Validate path scoping (within workspace, not in forbidden targets like `target/` or `.git/`).
    - [ ] If `atomic=true`, use write-to-temp-then-rename strategy.
- [ ] Implement `list_directory(path, recursive, depth)` in `devs-mcp`:
    - [ ] Return list of files/folders with metadata (size, last modified).
- [ ] Implement `search_content(regex, path_glob, context_lines)` in `devs-mcp`:
    - [ ] Use `grep`-like functionality (or `ripgrep` if available) to search files matching the glob.
- [ ] Implement `run_command(command, args, cwd, env)` in `devs-mcp`:
    - [ ] Execute a command in the specified directory.
    - [ ] Ensure `cwd` is within the workspace root.
    - [ ] Capture stdout, stderr, and exit code.
- [ ] Handle error prefixes: `invalid_argument:` for paths outside root, `failed_precondition:` for write protection violations.

## 3. Code Review
- [ ] Verify rigorous path normalization and scoping (prevent directory traversal attacks).
- [ ] Ensure that large file reads and recursive listings have sensible server-side limits.
- [ ] Check that `run_command` is properly sandboxed or at least restricted to the workspace.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-mcp --test filesystem_tools`
- [ ] Run `cargo test --test mcp_fs_e2e`

## 5. Update Documentation
- [ ] Update `crates/devs-mcp/README.md` to document the filesystem tools and their scoping rules.

## 6. Automated Verification
- [ ] Run `./do test` and verify coverage of filesystem tool requirements.
