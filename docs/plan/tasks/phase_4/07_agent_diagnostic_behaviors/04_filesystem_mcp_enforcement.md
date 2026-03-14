# Task: Implement Filesystem MCP Enforcement for Source Code Operations (Sub-Epic: 07_Agent Diagnostic Behaviors)

## Covered Requirements
- [3_MCP_DESIGN-REQ-027]

## Dependencies
- depends_on: []
- shared_components: [devs-mcp, devs-grpc]

## 1. Initial Test Written
- [ ] Write an integration test in `crates/devs-mcp/tests/filesystem_enforcement_tests.rs` that verifies the following behaviors:
    1. **Test 1.1 - File Read via MCP**: Create a test source file in the workspace, then verify that reading it through the filesystem MCP server (`read_file` tool) succeeds and returns the correct content.
    2. **Test 1.2 - File Write via MCP**: Verify that writing a source file through the filesystem MCP server (`write_file` tool) succeeds and the file exists on disk with correct content.
    3. **Test 1.3 - File Existence Check via MCP**: Verify that checking file existence through the filesystem MCP server (`list_directory` or `search_files` tool) returns accurate results.
    4. **Test 1.4 - Shell Execution Blocked for Source Files**: Create a mock agent session that attempts to read a source file using shell execution (e.g., `cat src/lib.rs` via `exec_shell` tool). Verify this is either blocked or produces a warning that filesystem MCP should be used instead.
    5. **Test 1.5 - Shell Execution Allowed for ./do Commands**: Verify that shell execution succeeds for `./do` commands (e.g., `./do test`, `./do build`) as these are explicitly allowed per the requirement.
- [ ] Use a mock MCP server fixture that records all tool calls and their parameters.
- [ ] Assert that source file operations (`.rs`, `.toml`, `.md` files in `src/`, `crates/`, `docs/`) use filesystem MCP tools, not shell execution.
- [ ] Verify the workspace root scoping: attempts to read/write files outside the workspace root are denied.

## 2. Task Implementation
- [ ] Implement the filesystem MCP server wrapper in `crates/devs-mcp/src/filesystem.rs` with the following methods:
    - `read_file(&self, path: &str) -> Result<String>` - reads file content with UTF-8 encoding
    - `write_file(&self, path: &str, content: &str) -> Result<()>` - writes file content atomically
    - `file_exists(&self, path: &str) -> Result<bool>` - checks file existence without reading
    - `list_directory(&self, path: &str) -> Result<Vec<String>>` - lists directory contents
    - `search_files(&self, pattern: &str) -> Result<Vec<String>>` - glob pattern search
    - `search_content(&self, regex: &str, glob: Option<&str>) -> Result<Vec<MatchInfo>>` - regex search in files
- [ ] Implement workspace root scoping:
    - Resolve all paths relative to the workspace root (directory containing `Cargo.toml` at project root)
    - Deny any path traversal that escapes the workspace root (e.g., `../../../etc/passwd`)
    - Explicitly deny write access to `target/` directory (build artifacts are produced by toolchain)
- [ ] Implement the shell execution guard in `crates/devs-mcp/src/shell_guard.rs`:
    - Maintain a whitelist of allowed shell commands: `./do`, `cargo`, `git` (for version info only)
    - For file-read operations via shell (e.g., `cat`, `head`, `tail`, `less`), emit a warning: `WARN: Use filesystem MCP server for source file reads instead of shell execution`
    - Log all shell executions to a session audit log for traceability
- [ ] Implement path validation utility in `crates/devs-core/src/path_utils.rs`:
    - `is_workspace_relative(path: &str, workspace_root: &Path) -> bool`
    - `is_target_directory(path: &str) -> bool` - returns true if path is under `target/`
    - `normalize_path(path: &str) -> String` - converts to canonical workspace-relative form
- [ ] Ensure all MCP tool responses include structured errors with stable prefixes (e.g., `PATH_ERROR:`, `PERMISSION_DENIED:`) per [3_MCP_DESIGN-REQ-045].

## 3. Code Review
- [ ] Verify that no source file operations bypass the filesystem MCP server.
- [ ] Check that workspace root scoping is enforced consistently across all filesystem MCP tools.
- [ ] Ensure the `target/` directory write protection is correctly implemented.
- [ ] Verify that shell execution warnings are informative and point developers to the correct MCP tool.
- [ ] Confirm that all file paths in MCP responses are workspace-relative (not absolute paths).
- [ ] Check that error messages use stable prefixes for automated parsing.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test --package devs-mcp --test filesystem_enforcement_tests` to verify all enforcement behaviors.
- [ ] Run `cargo test --package devs-core --lib path_utils` to verify path validation utilities.
- [ ] Run `./do test --package devs-mcp` and ensure all tests pass.

## 5. Update Documentation
- [ ] Update `docs/agent_development.md` with the following sections:
    - "Filesystem MCP Server Usage" - explain when and how to use filesystem MCP tools
    - "Shell Execution Guidelines" - clarify that `./do` commands use shell, but source file operations use MCP
    - "Workspace Root Scoping" - document the workspace boundary and `target/` write protection
- [ ] Add code examples showing correct usage:
    ```rust
    // Correct: Use filesystem MCP to read source file
    let content = mcp.read_file("src/lib.rs").await?;
    
    // Correct: Use shell for ./do commands
    let output = shell_exec("./do test").await?;
    
    // Incorrect: Don't use shell to read source files
    // let content = shell_exec("cat src/lib.rs").await?; // WRONG
    ```

## 6. Automated Verification
- [ ] Run `./do presubmit` and verify all tests pass including the new filesystem enforcement tests.
- [ ] Run `./do lint` and verify no clippy warnings or formatting issues in the new code.
- [ ] Verify traceability: ensure all new test functions have `// Covers: 3_MCP_DESIGN-REQ-027` annotation.
- [ ] Run `./do coverage` and verify the new code achieves ≥90% unit coverage.
