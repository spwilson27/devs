# Task: Cross-Platform Compatibility and Path Handling (Sub-Epic: 07_TUI Framework and Navigation)

## Covered Requirements
- [6_UI_UX_ARCHITECTURE-REQ-015], [6_UI_UX_ARCHITECTURE-REQ-016], [6_UI_UX_ARCHITECTURE-REQ-017], [6_UI_UX_ARCHITECTURE-REQ-018], [6_UI_UX_ARCHITECTURE-REQ-019], [6_UI_UX_ARCHITECTURE-REQ-020], [6_UI_UX_ARCHITECTURE-REQ-026], [6_UI_UX_ARCHITECTURE-REQ-027], [6_UI_UX_ARCHITECTURE-REQ-028], [6_UI_UX_ARCHITECTURE-REQ-030], [6_UI_UX_ARCHITECTURE-REQ-031], [6_UI_UX_ARCHITECTURE-REQ-032], [6_UI_UX_ARCHITECTURE-REQ-333], [6_UI_UX_ARCHITECTURE-REQ-334], [6_UI_UX_ARCHITECTURE-REQ-338], [6_UI_UX_ARCHITECTURE-REQ-339], [6_UI_UX_ARCHITECTURE-REQ-396], [6_UI_UX_ARCHITECTURE-REQ-397], [6_UI_UX_ARCHITECTURE-REQ-398], [6_UI_UX_ARCHITECTURE-REQ-399], [6_UI_UX_ARCHITECTURE-REQ-400], [6_UI_UX_ARCHITECTURE-REQ-401], [6_UI_UX_ARCHITECTURE-REQ-402], [6_UI_UX_ARCHITECTURE-REQ-403], [6_UI_UX_ARCHITECTURE-REQ-404], [6_UI_UX_ARCHITECTURE-REQ-405], [6_UI_UX_ARCHITECTURE-REQ-438]

## Dependencies
- depends_on: ["01_tui_crate_scaffold_and_event_loop.md", "03_grpc_client_and_discovery.md"]
- shared_components: [devs-core (consumer)]

## 1. Initial Test Written
- [ ] Write test for path normalization: backslashes converted to forward slashes on all platforms (REQ-333)
- [ ] Write test for CLI text output using native OS line endings; JSON output always `\n` (REQ-338)
- [ ] Write test for snapshot file normalization: `\r\n` → `\n` before comparison (REQ-339)
- [ ] Write test for identical exit codes on Linux, macOS, Windows (REQ-019)
- [ ] Write test that `crossterm` backend is used (Windows console API, no UNIX termios) (REQ-016)
- [ ] Write test for discovery directory: Linux/macOS `~/.config`, Windows `%APPDATA%` (REQ-017)
- [ ] Write test that no API keys or credentials are stored in client binaries (REQ-026)
- [ ] Write test that sensitive data in JSON output shows as `"[REDACTED]"` (REQ-027)
- [ ] Write test that MCP bridge has no TCP listener — stdin/stdout only + outbound HTTP (REQ-028)
- [ ] Write test that TUI tests use TestBackend at 200×50 (REQ-401)
- [ ] Write test that snapshot files are plain UTF-8, character-by-character comparison (REQ-402)
- [ ] Write test that TUI tests use programmatic AppState, no running server (REQ-403)

## 2. Task Implementation
- [ ] Implement `normalize_path(path: &str) -> String` converting `\` to `/` (REQ-333)
- [ ] Implement platform-aware discovery directory resolution using `dirs` crate (REQ-017)
- [ ] Implement platform-aware line ending handling: `native_line_ending()` for text, `\n` for JSON (REQ-338)
- [ ] Implement `Redacted<T>` display wrapper for sensitive values in JSON output (REQ-027) — consume from devs-core shared component
- [ ] Ensure `crossterm` is the only terminal backend dependency (REQ-016)
- [ ] Add `#[cfg(target_os = "windows")]` guards where platform-specific behavior is needed (REQ-015)
- [ ] Configure snapshot test files with `git eol=lf` in `.gitattributes` (REQ-339)
- [ ] Ensure exit codes are consistent: 0, 1, 2, 3, 4 (REQ-019, REQ-438)
- [ ] Verify no TCP listener in MCP bridge crate (REQ-028)

## 3. Code Review
- [ ] Verify path normalization is applied at all discovery file reads (REQ-333)
- [ ] Verify no platform-specific exit code divergence (REQ-019)
- [ ] Verify Redacted wrapper is used for all sensitive output (REQ-027)

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui -- platform` and `cargo test -p devs-tui -- path`

## 5. Update Documentation
- [ ] Add doc comments explaining platform-specific behavior

## 6. Automated Verification
- [ ] Run `cargo test -p devs-tui 2>&1 | tail -5` and confirm `test result: ok`
- [ ] Run `cargo check -p devs-tui --target x86_64-pc-windows-msvc` if cross-compilation toolchain available
