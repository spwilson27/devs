# UI/UX Architecture Requirements

### **[6_UI_UX_ARCHITECTURE-REQ-001]** A GUI is explicitly out of scope for MVP. No web framework crate (`axum`, `warp`, `actix-web`, etc.) may appear in any production dependency.
- **Type:** Technical
- **Description:** A GUI is explicitly out of scope for MVP. No web framework crate (`axum`, `warp`, `actix-web`, etc.) may appear in any production dependency.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-002]** All three interface crates are binary crates in the single Cargo workspace. They may depend on `devs-core` for domain types and `devs-proto` for gRPC generated types, but MUST NOT import engine-layer crates (`devs-scheduler`, `devs-pool`, `devs-executor`, etc.) directly.
- **Type:** Technical
- **Description:** All three interface crates are binary crates in the single Cargo workspace. They may depend on `devs-core` for domain types and `devs-proto` for gRPC generated types, but MUST NOT import engine-layer crates (`devs-scheduler`, `devs-pool`, `devs-executor`, etc.) directly.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-003]** `devs-tui` and `devs-cli` connect to the server exclusively over gRPC (`tonic 0.12`). They hold no in-process server state. `devs-mcp-bridge` connects to the server exclusively over MCP HTTP/JSON-RPC.
- **Type:** Technical
- **Description:** `devs-tui` and `devs-cli` connect to the server exclusively over gRPC (`tonic 0.12`). They hold no in-process server state. `devs-mcp-bridge` connects to the server exclusively over MCP HTTP/JSON-RPC.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-004]** Each interface binary is independently deployable on Linux, macOS, and Windows Git Bash, producing identical exit codes and output formats on all three platforms.
- **Type:** Technical
- **Description:** Each interface binary is independently deployable on Linux, macOS, and Windows Git Bash, producing identical exit codes and output formats on all three platforms.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-005]** `cargo tree -p devs-tui --edges normal` MUST NOT list any of: `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`. Verified by `./do lint`.
- **Type:** Technical
- **Description:** `cargo tree -p devs-tui --edges normal` MUST NOT list any of: `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`. Verified by `./do lint`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-006]** `cargo tree -p devs-mcp-bridge --edges normal` MUST NOT list `tonic` or `devs-proto`. The bridge communicates with the MCP HTTP port, not the gRPC port. Verified by `./do lint`.
- **Type:** Technical
- **Description:** `cargo tree -p devs-mcp-bridge --edges normal` MUST NOT list `tonic` or `devs-proto`. The bridge communicates with the MCP HTTP port, not the gRPC port. Verified by `./do lint`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-007]** `devs-core` MUST remain free of I/O dependencies (`tokio`, `git2`, `reqwest`, `tonic`). Interface crates depend on it only for domain types and the `StateMachine` trait. Verified by `cargo tree -p devs-core --edges normal` containing none of the prohibited crates.
- **Type:** Technical
- **Description:** `devs-core` MUST remain free of I/O dependencies (`tokio`, `git2`, `reqwest`, `tonic`). Interface crates depend on it only for domain types and the `StateMachine` trait. Verified by `cargo tree -p devs-core --edges normal` containing none of the prohibited crates.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-008]** The discovery file contains only the gRPC address. The MCP port is obtained exclusively via `ServerService.GetInfo`. Clients MUST NOT assume `mcp_port = grpc_port + 1`.
- **Type:** Technical
- **Description:** The discovery file contains only the gRPC address. The MCP port is obtained exclusively via `ServerService.GetInfo`. Clients MUST NOT assume `mcp_port = grpc_port + 1`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-009]** Discovery file path resolves `~` using the platform home directory (`$HOME` on Linux/macOS; `USERPROFILE` or `HOMEDRIVE`+`HOMEPATH` on Windows). The `~` expansion is performed at use time, not stored as a literal path.
- **Type:** Technical
- **Description:** Discovery file path resolves `~` using the platform home directory (`$HOME` on Linux/macOS; `USERPROFILE` or `HOMEDRIVE`+`HOMEPATH` on Windows). The `~` expansion is performed at use time, not stored as a literal path.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-010]** When `DEVS_DISCOVERY_FILE` is set, it takes precedence over `~/.config/devs/server.addr`. This mechanism allows parallel test server instances to use isolated discovery files and MUST be respected by all client binaries without exception.
- **Type:** Technical
- **Description:** When `DEVS_DISCOVERY_FILE` is set, it takes precedence over `~/.config/devs/server.addr`. This mechanism allows parallel test server instances to use isolated discovery files and MUST be respected by all client binaries without exception.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-011]** Discovery errors MUST produce exit code 3 in the CLI. In the TUI, discovery failure is displayed in the `StatusBar` as `"DISCONNECTED: <reason>"` and the TUI enters the reconnect loop. In `devs-mcp-bridge`, discovery failure at startup writes `{"result":null,"error":"server_unreachable: <reason>","fatal":true}` to stdout and exits with code 1.
- **Type:** Technical
- **Description:** Discovery errors MUST produce exit code 3 in the CLI. In the TUI, discovery failure is displayed in the `StatusBar` as `"DISCONNECTED: <reason>"` and the TUI enters the reconnect loop. In `devs-mcp-bridge`, discovery failure at startup writes `{"result":null,"error":"server_unreachable: <reason>","fatal":true}` to stdout and exits with code 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-012]** `devs-tui` MUST restore the terminal to its original state (disable raw mode, show cursor, disable alternate screen) on any exit path including panics. A `scopeguard` or `Drop` impl on a terminal guard struct MUST be used to guarantee cleanup even when the process receives SIGTERM or panics.
- **Type:** Technical
- **Description:** `devs-tui` MUST restore the terminal to its original state (disable raw mode, show cursor, disable alternate screen) on any exit path including panics. A `scopeguard` or `Drop` impl on a terminal guard struct MUST be used to guarantee cleanup even when the process receives SIGTERM or panics.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-013]** `devs-cli` connects the gRPC channel lazily: the channel is not dialed until the first RPC call. Connection timeout is 5 seconds. If the first RPC returns `UNAVAILABLE` or the dial times out, the CLI reports `"server_unreachable: <addr>"` and exits with code 3.
- **Type:** Technical
- **Description:** `devs-cli` connects the gRPC channel lazily: the channel is not dialed until the first RPC call. Connection timeout is 5 seconds. If the first RPC returns `UNAVAILABLE` or the dial times out, the CLI reports `"server_unreachable: <addr>"` and exits with code 3.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-014]** `devs-mcp-bridge` attempts exactly one reconnect (after a 1-second delay) when the MCP HTTP connection is lost during a request. If the reconnect attempt also fails, it writes the fatal JSON error to stdout and exits 1. It MUST NOT enter an infinite reconnect loop.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` attempts exactly one reconnect (after a 1-second delay) when the MCP HTTP connection is lost during a request. If the reconnect attempt also fails, it writes the fatal JSON error to stdout and exits 1. It MUST NOT enter an infinite reconnect loop.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-015]** On Windows, `devs-tui` uses `crossterm`'s Windows console API backend. No UNIX-specific terminal calls (`termios`, `ioctl`) are used in authored code. `crossterm 0.28` abstracts these differences; the authored code MUST be platform-agnostic.
- **Type:** Technical
- **Description:** On Windows, `devs-tui` uses `crossterm`'s Windows console API backend. No UNIX-specific terminal calls (`termios`, `ioctl`) are used in authored code. `crossterm 0.28` abstracts these differences; the authored code MUST be platform-agnostic.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-016]** On Windows Git Bash (MSYS2), the CLI is invoked as `devs.exe`. All path arguments use forward-slash normalization: backslashes in user-supplied paths are normalized to forward slashes before storage or transmission. This normalization occurs in `connection.rs` before constructing any gRPC message.
- **Type:** Technical
- **Description:** On Windows Git Bash (MSYS2), the CLI is invoked as `devs.exe`. All path arguments use forward-slash normalization: backslashes in user-supplied paths are normalized to forward slashes before storage or transmission. This normalization occurs in `connection.rs` before constructing any gRPC message.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-017]** `./do` is written in POSIX `sh` only. It is executed as `sh ./do <command>` on all platforms. No bash-specific syntax (`[[`, `(( ))`, `$BASHPID`, process substitution) is permitted. Git Bash on Windows ships a POSIX-compatible `sh`.
- **Type:** Technical
- **Description:** `./do` is written in POSIX `sh` only. It is executed as `sh ./do <command>` on all platforms. No bash-specific syntax (`[[`, `(( ))`, `$BASHPID`, process substitution) is permitted. Git Bash on Windows ships a POSIX-compatible `sh`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-018]** The discovery file home directory expansion uses `dirs::home_dir()` (from the `dirs` crate) rather than reading `$HOME` directly, to ensure correct behavior on Windows where the home directory is obtained from the registry, not a single environment variable.
- **Type:** Technical
- **Description:** The discovery file home directory expansion uses `dirs::home_dir()` (from the `dirs` crate) rather than reading `$HOME` directly, to ensure correct behavior on Windows where the home directory is obtained from the registry, not a single environment variable.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-019]** Exit codes are identical across all three platforms: `0`=success, `1`=general error, `2`=not found, `3`=server unreachable, `4`=validation error. The `devs-tui` binary exits `0` on clean quit, `1` on disconnect timeout.
- **Type:** Technical
- **Description:** Exit codes are identical across all three platforms: `0`=success, `1`=general error, `2`=not found, `3`=server unreachable, `4`=validation error. The `devs-tui` binary exits `0` on clean quit, `1` on disconnect timeout.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-020]** The config directory is resolved via `dirs::config_dir()` on all platforms, not by hardcoding `~/.config`. On Linux/macOS this resolves to `~/.config`; on Windows to `%APPDATA%`. All references to `~/.config/devs/` in this specification are logical and map to the platform-specific config directory at runtime.
- **Type:** Technical
- **Description:** The config directory is resolved via `dirs::config_dir()` on all platforms, not by hardcoding `~/.config`. On Linux/macOS this resolves to `~/.config`; on Windows to `%APPDATA%`. All references to `~/.config/devs/` in this specification are logical and map to the platform-specific config directory at runtime.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-021]** `DiscoveryError` maps to exit code 3 for the CLI, to a `DISCONNECTED` status for the TUI, and to a fatal JSON error for the bridge. The mapping is performed in each binary's main module; `DiscoveryError` itself carries no exit code.
- **Type:** Technical
- **Description:** `DiscoveryError` maps to exit code 3 for the CLI, to a `DISCONNECTED` status for the TUI, and to a fatal JSON error for the bridge. The mapping is performed in each binary's main module; `DiscoveryError` itself carries no exit code.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-022]** All user-visible string literals that appear in CLI output or TUI displays MUST be defined in a `strings.rs` module within the respective crate (not inline). This separates string management for future internationalisation. String keys are `const &str` values; the module contains no logic.
- **Type:** Technical
- **Description:** All user-visible string literals that appear in CLI output or TUI displays MUST be defined in a `strings.rs` module within the respective crate (not inline). This separates string management for future internationalisation. String keys are `const &str` values; the module contains no logic.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-023]** The client version string is embedded at compile time using the `env!("CARGO_PKG_VERSION")` macro in `devs-core/src/version.rs`. Both TUI and CLI read this constant; they MUST NOT hardcode a version string.
- **Type:** Technical
- **Description:** The client version string is embedded at compile time using the `env!("CARGO_PKG_VERSION")` macro in `devs-core/src/version.rs`. Both TUI and CLI read this constant; they MUST NOT hardcode a version string.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-024]** When the server returns `FAILED_PRECONDITION` due to version mismatch, the CLI MUST display: `"failed_precondition: client version <client_ver> is incompatible with server version <server_ver>"` and exit with code 1. The TUI MUST display the same message in the `StatusBar` and stop all further RPC calls.
- **Type:** Technical
- **Description:** When the server returns `FAILED_PRECONDITION` due to version mismatch, the CLI MUST display: `"failed_precondition: client version <client_ver> is incompatible with server version <server_ver>"` and exit with code 1. The TUI MUST display the same message in the `StatusBar` and stop all further RPC calls.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-025]** `devs-mcp-bridge` does NOT carry a version header in MCP HTTP calls. MCP tool calls are not version-gated at MVP.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` does NOT carry a version header in MCP HTTP calls. MCP tool calls are not version-gated at MVP.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-026]** No client binary stores or transmits API keys. Credentials (e.g., `CLAUDE_API_KEY`) are environment variables on the server process. Clients never see them.
- **Type:** Technical
- **Description:** No client binary stores or transmits API keys. Credentials (e.g., `CLAUDE_API_KEY`) are environment variables on the server process. Clients never see them.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-027]** `devs-mcp-bridge` MUST NOT create any TCP listener. It communicates only via stdin/stdout and outbound HTTP to the MCP port.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` MUST NOT create any TCP listener. It communicates only via stdin/stdout and outbound HTTP to the MCP port.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-028]** When the CLI uses `--format json`, sensitive values (e.g., webhook secrets) that the server returns MUST appear as `"[REDACTED]"` in JSON output. The server sends `Redacted<T>` serialized values; the client writes them verbatim without attempting to decode or expand them.
- **Type:** Technical
- **Description:** When the CLI uses `--format json`, sensitive values (e.g., webhook secrets) that the server returns MUST appear as `"[REDACTED]"` in JSON output. The server sends `Redacted<T>` serialized values; the client writes them verbatim without attempting to decode or expand them.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-029]** The TUI MUST strip ANSI escape sequences from agent log output before rendering log lines in `LogPane`. Agent stdout/stderr can contain arbitrary escape codes; rendering them unstripped could corrupt the terminal display. Stripping is performed in `log_pane.rs` using a simple state machine that removes `ESC[...m` sequences and other CSI codes. This is the only place in the codebase where ANSI stripping occurs (agent log files on disk are written verbatim).
- **Type:** Technical
- **Description:** The TUI MUST strip ANSI escape sequences from agent log output before rendering log lines in `LogPane`. Agent stdout/stderr can contain arbitrary escape codes; rendering them unstripped could corrupt the terminal display. Stripping is performed in `log_pane.rs` using a simple state machine that removes `ESC[...m` sequences and other CSI codes. This is the only place in the codebase where ANSI stripping occurs (agent log files on disk are written verbatim).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-030]** -  `cargo tree -p devs-tui --edges normal` output does not contain any of: `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`. (lint gate)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-030]** `cargo tree -p devs-tui --edges normal` output does not contain any of: `devs-scheduler`, `devs-pool`, `devs-executor`, `devs-adapters`, `devs-checkpoint`, `devs-webhook`, `devs-grpc`, `devs-mcp`. (lint gate)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-031]** -  `cargo tree -p devs-mcp-bridge --edges normal` output does not contain `tonic` or `devs-proto`. (lint gate)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-031]** `cargo tree -p devs-mcp-bridge --edges normal` output does not contain `tonic` or `devs-proto`. (lint gate)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-032]** -  `cargo tree -p devs-core --edges normal` output does not contain `tokio`, `git2`, `reqwest`, or `tonic`. (lint gate)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-032]** `cargo tree -p devs-core --edges normal` output does not contain `tokio`, `git2`, `reqwest`, or `tonic`. (lint gate)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-033]** -  CLI with a stale/absent discovery file and no `--server` flag exits with code 3 and prints a message beginning with `"server_unreachable:"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-033]** CLI with a stale/absent discovery file and no `--server` flag exits with code 3 and prints a message beginning with `"server_unreachable:"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-034]** -  CLI `--format json` with a discovery error prints `{"error":"server_unreachable:...","code":3}` to stdout and nothing to stderr. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-034]** CLI `--format json` with a discovery error prints `{"error":"server_unreachable:...","code":3}` to stdout and nothing to stderr. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-035]** -  `devs-mcp-bridge` exits with code 1 and writes `{"result":null,"error":"server_unreachable:...","fatal":true}` to stdout when no server is reachable. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-035]** `devs-mcp-bridge` exits with code 1 and writes `{"result":null,"error":"server_unreachable:...","fatal":true}` to stdout when no server is reachable. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-036]** -  `devs-mcp-bridge` does NOT exit when it receives an invalid-JSON line on stdin; it writes an error response and continues reading. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-036]** `devs-mcp-bridge` does NOT exit when it receives an invalid-JSON line on stdin; it writes an error response and continues reading. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-037]** -  All gRPC requests from the CLI carry `x-devs-client-version` metadata; server-side test asserts the header is present. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-037]** All gRPC requests from the CLI carry `x-devs-client-version` metadata; server-side test asserts the header is present. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-038]** -  Server returning `FAILED_PRECONDITION` for version mismatch causes CLI to exit code 1 with a message containing `"failed_precondition"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-038]** Server returning `FAILED_PRECONDITION` for version mismatch causes CLI to exit code 1 with a message containing `"failed_precondition"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-039]** -  TUI exits code 1 with message `"Disconnected from server. Exiting."` after 30 seconds of failed reconnect + 5-second grace. (TUI E2E, TestBackend)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-039]** TUI exits code 1 with message `"Disconnected from server. Exiting."` after 30 seconds of failed reconnect + 5-second grace. (TUI E2E, TestBackend)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-040]** -  TUI `StatusBar` displays `"RECONNECTING"` when the gRPC stream is interrupted. (TUI E2E, TestBackend snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-040]** TUI `StatusBar` displays `"RECONNECTING"` when the gRPC stream is interrupted. (TUI E2E, TestBackend snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-041]** -  TUI renders `"Terminal too small: 80x24 minimum required (current: WxH)"` when terminal is resized below 80×24. (TUI E2E, TestBackend)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-041]** TUI renders `"Terminal too small: 80x24 minimum required (current: WxH)"` when terminal is resized below 80×24. (TUI E2E, TestBackend)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-042]** -  `NO_COLOR` environment variable suppresses all ANSI codes from CLI text output. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-042]** `NO_COLOR` environment variable suppresses all ANSI codes from CLI text output. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-043]** -  TUI restores terminal state on SIGTERM; post-exit terminal is not left in raw mode. (TUI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-043]** TUI restores terminal state on SIGTERM; post-exit terminal is not left in raw mode. (TUI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-044]** -  Discovery file `DEVS_DISCOVERY_FILE` is respected by all three binaries; each uses the override path instead of `~/.config/devs/server.addr`. (CLI E2E, MCP E2E, TUI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-044]** Discovery file `DEVS_DISCOVERY_FILE` is respected by all three binaries; each uses the override path instead of `~/.config/devs/server.addr`. (CLI E2E, MCP E2E, TUI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-045]** -  `devs-mcp-bridge` calls `ServerService.GetInfo` at startup and uses the returned `mcp_port`; hardcoded port 7891 is not used when `GetInfo` returns a different value. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-045]** `devs-mcp-bridge` calls `ServerService.GetInfo` at startup and uses the returned `mcp_port`; hardcoded port 7891 is not used when `GetInfo` returns a different value. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-046]** -  On Windows, paths supplied as CLI arguments with backslashes are normalized to forward slashes in the gRPC request body. (unit test in `connection.rs`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-046]** On Windows, paths supplied as CLI arguments with backslashes are normalized to forward slashes in the gRPC request body. (unit test in `connection.rs`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-047]** -  `Redacted<T>` values from the server appear as `"[REDACTED]"` in `--format json` CLI output and are never decoded by the client. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-047]** `Redacted<T>` values from the server appear as `"[REDACTED]"` in `--format json` CLI output and are never decoded by the client. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-048]** -  TUI `LogPane` strips ANSI escape sequences from agent log lines before rendering; a log line containing `\x1b[31mERROR\x1b[0m` is displayed as `ERROR` in the snapshot. (TUI E2E, TestBackend snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-048]** TUI `LogPane` strips ANSI escape sequences from agent log lines before rendering; a log line containing `\x1b[31mERROR\x1b[0m` is displayed as `ERROR` in the snapshot. (TUI E2E, TestBackend snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-049]** -  All user-visible strings in CLI output are defined in `strings.rs`; no string literal matching user-visible patterns appears outside `strings.rs` in `devs-cli/src/`. (lint gate via regex scan)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-049]** All user-visible strings in CLI output are defined in `strings.rs`; no string literal matching user-visible patterns appears outside `strings.rs` in `devs-cli/src/`. (lint gate via regex scan)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-050]** Each tab is a distinct struct implementing `ratatui::widgets::Widget`. Tabs MUST NOT share mutable state directly; all shared state flows through `AppState`.
- **Type:** Technical
- **Description:** Each tab is a distinct struct implementing `ratatui::widgets::Widget`. Tabs MUST NOT share mutable state directly; all shared state flows through `AppState`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-051]** `DagView` renders the workflow DAG using ASCII characters only (`-`, `|`, `+`, `>`, space). It MUST NOT use Unicode box-drawing characters. Stage boxes use the format `[ stage-name | STATUS | M:SS ]` where stage name is truncated to 20 characters with a trailing `~` if it exceeds that length.
- **Type:** Technical
- **Description:** `DagView` renders the workflow DAG using ASCII characters only (`-`, `|`, `+`, `>`, space). It MUST NOT use Unicode box-drawing characters. Stage boxes use the format `[ stage-name | STATUS | M:SS ]` where stage name is truncated to 20 characters with a trailing `~` if it exceeds that length.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-052]** Stage status labels are exactly 4 uppercase ASCII characters as follows:
- **Type:** Technical
- **Description:** Stage status labels are exactly 4 uppercase ASCII characters as follows:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-053]** `DagView` renders dependency arrows as `──►` connecting stage boxes at the same horizontal tier. Stages with no shared dependencies run in the same tier (same column depth). Tier calculation uses the longest path from any root stage.
- **Type:** Technical
- **Description:** `DagView` renders dependency arrows as `──►` connecting stage boxes at the same horizontal tier. Stages with no shared dependencies run in the same tier (same column depth). Tier calculation uses the longest path from any root stage.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-054]** `LogTail` in `DashboardTab` shows the last N lines of the currently selected stage's log stream. `LogPane` in `LogsTab` maintains a buffer of at most 10,000 lines per stage using a ring buffer (FIFO eviction of oldest lines). Full logs remain on disk.
- **Type:** Technical
- **Description:** `LogTail` in `DashboardTab` shows the last N lines of the currently selected stage's log stream. `LogPane` in `LogsTab` maintains a buffer of at most 10,000 lines per stage using a ring buffer (FIFO eviction of oldest lines). Full logs remain on disk.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-055]** `HelpOverlay` renders a keybinding reference table when the user presses `?`. It is rendered as an overlay on top of the active tab and dismissed by any keypress. It is a stateless widget instantiated on demand.
- **Type:** Technical
- **Description:** `HelpOverlay` renders a keybinding reference table when the user presses `?`. It is rendered as an overlay on top of the active tab and dismissed by any keypress. It is a stateless widget instantiated on demand.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-056]** `StatusBar` occupies the bottom row of the terminal and displays: connection status (`CONNECTED`/`RECONNECTING`/`DISCONNECTED`), server address, and the active run count.
- **Type:** Technical
- **Description:** `StatusBar` occupies the bottom row of the terminal and displays: connection status (`CONNECTED`/`RECONNECTING`/`DISCONNECTED`), server address, and the active run count.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-057]** No widget struct contains `Arc`, `Mutex`, `RwLock`, `tokio::sync`, or any async primitive. Widget structs are either zero-sized or carry only rendering hints (e.g., scroll offsets, column width overrides). They are created by `App::render()` on every frame and dropped after rendering.
- **Type:** Technical
- **Description:** No widget struct contains `Arc`, `Mutex`, `RwLock`, `tokio::sync`, or any async primitive. Widget structs are either zero-sized or carry only rendering hints (e.g., scroll offsets, column width overrides). They are created by `App::render()` on every frame and dropped after rendering.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-058]** Widget `render()` calls MUST complete in under 16 milliseconds (60 fps budget). Widgets MUST NOT perform I/O, syscalls, memory allocation proportional to data set size, or any blocking operation. All values are pre-computed in `AppState` before render.
- **Type:** Technical
- **Description:** Widget `render()` calls MUST complete in under 16 milliseconds (60 fps budget). Widgets MUST NOT perform I/O, syscalls, memory allocation proportional to data set size, or any blocking operation. All values are pre-computed in `AppState` before render.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-059]** The `App` struct is the sole owner of `AppState`. No reference to `AppState` escapes beyond the scope of a single `handle_event()` or `render()` call. There is no shared ownership of `AppState` within the TUI binary.
- **Type:** Technical
- **Description:** The `App` struct is the sole owner of `AppState`. No reference to `AppState` escapes beyond the scope of a single `handle_event()` or `render()` call. There is no shared ownership of `AppState` within the TUI binary.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-060]** `StageRunDisplay.elapsed_display` is formatted as `M:SS` where M is total elapsed minutes (no upper bound) and SS is seconds within the current minute, zero-padded. A stage that has not started renders `--:--`. A stage running for 70 minutes 5 seconds renders `70:05`. Maximum rendered elapsed width is always 5 characters.
- **Type:** Technical
- **Description:** `StageRunDisplay.elapsed_display` is formatted as `M:SS` where M is total elapsed minutes (no upper bound) and SS is seconds within the current minute, zero-padded. A stage that has not started renders `--:--`. A stage running for 70 minutes 5 seconds renders `70:05`. Maximum rendered elapsed width is always 5 characters.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-061]** `RunSummary.stage_count`, `completed_stage_count`, and `failed_stage_count` are derived from the `stage_runs` array in the `RunEvent` snapshot. Fan-out sub-agents are NOT counted as individual stage records in these summary counts; only the parent fan-out stage is counted.
- **Type:** Technical
- **Description:** `RunSummary.stage_count`, `completed_stage_count`, and `failed_stage_count` are derived from the `stage_runs` array in the `RunEvent` snapshot. Fan-out sub-agents are NOT counted as individual stage records in these summary counts; only the parent fan-out stage is counted.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-062]** `dag_tiers` in `RunDetail` is precomputed when the `RunEvent` is processed in `App::handle_event()`, not during render. Tier assignment algorithm:
- **Type:** Technical
- **Description:** `dag_tiers` in `RunDetail` is precomputed when the `RunEvent` is processed in `App::handle_event()`, not during render. Tier assignment algorithm:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-063]** `DagView` renders tier columns as vertical stacks. Within a tier, stages are ordered alphabetically. Dependency arrows connect each stage box to all its dependents in the adjacent tier. When a stage has multiple dependents, arrows branch from a single horizontal trunk.
- **Type:** Technical
- **Description:** `DagView` renders tier columns as vertical stacks. Within a tier, stages are ordered alphabetically. Dependency arrows connect each stage box to all its dependents in the adjacent tier. When a stage has multiple dependents, arrows branch from a single horizontal trunk.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-064]** If the total rendered DAG width (number of tiers × 44 chars per tier-plus-gutter) exceeds the available pane width, `DagView` enables horizontal scrolling. The horizontal scroll offset is stored in `AppState::dag_scroll_offset: usize` (column index of leftmost visible tier). Arrow keys `←`/`→` update the scroll offset when Dashboard tab is active. The scroll indicator `< >` appears at the bottom of `DagView` when overflow exists.
- **Type:** Technical
- **Description:** If the total rendered DAG width (number of tiers × 44 chars per tier-plus-gutter) exceeds the available pane width, `DagView` enables horizontal scrolling. The horizontal scroll offset is stored in `AppState::dag_scroll_offset: usize` (column index of leftmost visible tier). Arrow keys `←`/`→` update the scroll offset when Dashboard tab is active. The scroll indicator `< >` appears at the bottom of `DagView` when overflow exists.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-065]** Fan-out stages are rendered as a single box in `DagView`. A sub-agent indicator `(×N)` is appended to the stage name before truncation. Example: `implement-all(×4)` truncates to `implement-all(×4)~` if over 20 chars. Fan-out sub-agents are NOT rendered as individual boxes in `DagView`; they appear in `StageList` as indented sub-rows under the parent stage.
- **Type:** Technical
- **Description:** Fan-out stages are rendered as a single box in `DagView`. A sub-agent indicator `(×N)` is appended to the stage name before truncation. Example: `implement-all(×4)` truncates to `implement-all(×4)~` if over 20 chars. Fan-out sub-agents are NOT rendered as individual boxes in `DagView`; they appear in `StageList` as indented sub-rows under the parent stage.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-066]** `LogPane` strips ANSI escape sequences from `LogLine.content` before rendering. The stripping is performed by `render_utils::strip_ansi()`, which implements a three-state machine:
- **Type:** Technical
- **Description:** `LogPane` strips ANSI escape sequences from `LogLine.content` before rendering. The stripping is performed by `render_utils::strip_ansi()`, which implements a three-state machine:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-067]** `LogLine.raw_content` preserves verbatim log content (with ANSI codes intact) for future export or copy-paste features. At MVP, only `LogLine.content` (ANSI-stripped) is rendered. `raw_content` is stored but not displayed.
- **Type:** Technical
- **Description:** `LogLine.raw_content` preserves verbatim log content (with ANSI codes intact) for future export or copy-paste features. At MVP, only `LogLine.content` (ANSI-stripped) is rendered. `raw_content` is stored but not displayed.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-068]** Every CLI subcommand accepts `--server <host:port>` (overrides server discovery) and `--format json|text` (default `text`). These flags are defined as global arguments in the `clap` root `Command` and inherited by all subcommands.
- **Type:** Technical
- **Description:** Every CLI subcommand accepts `--server <host:port>` (overrides server discovery) and `--format json|text` (default `text`). These flags are defined as global arguments in the `clap` root `Command` and inherited by all subcommands.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-069]** In `--format json` mode, all output (including errors) is written to stdout as JSON. Nothing is written to stderr. Error format: `{"error": "<prefix>: <detail>", "code": <n>}`.
- **Type:** Technical
- **Description:** In `--format json` mode, all output (including errors) is written to stdout as JSON. Nothing is written to stderr. Error format: `{"error": "<prefix>: <detail>", "code": <n>}`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-070]** Each CLI subcommand is implemented as a separate async function in a dedicated module under `crates/devs-cli/src/commands/`. The module structure is:
- **Type:** Technical
- **Description:** Each CLI subcommand is implemented as a separate async function in a dedicated module under `crates/devs-cli/src/commands/`. The module structure is:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-071]** CLI output formatting is implemented in `output.rs` as a `Formatter` trait with two implementations: `TextFormatter` and `JsonFormatter`. All subcommand handlers accept a `&dyn Formatter` parameter and are agnostic to the selected format.
- **Type:** Technical
- **Description:** CLI output formatting is implemented in `output.rs` as a `Formatter` trait with two implementations: `TextFormatter` and `JsonFormatter`. All subcommand handlers accept a `&dyn Formatter` parameter and are agnostic to the selected format.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-072]** `devs submit --input key=value` splits on the first `=` only. A value containing `=` characters is preserved intact. `--input expr=a=b` sets key `expr` to value `a=b`.
- **Type:** Technical
- **Description:** `devs submit --input key=value` splits on the first `=` only. A value containing `=` characters is preserved intact. `--input expr=a=b` sets key `expr` to value `a=b`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-073]** `devs submit` without `--project` when CWD resolves to exactly one registered project uses that project automatically. If CWD matches zero or two or more registered projects, the command exits with code 4 and message `"invalid_argument: --project required: CWD matches <n> registered projects"`.
- **Type:** Technical
- **Description:** `devs submit` without `--project` when CWD resolves to exactly one registered project uses that project automatically. If CWD matches zero or two or more registered projects, the command exits with code 4 and message `"invalid_argument: --project required: CWD matches <n> registered projects"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-074]** Run identifier resolution is performed in `connection.rs` for all commands accepting a `<run-id>`: if the argument matches UUID4 format (8-4-4-4-12 hex), it is resolved as `run_id`; otherwise it is resolved as a `slug`. UUID format takes precedence if both match a run.
- **Type:** Technical
- **Description:** Run identifier resolution is performed in `connection.rs` for all commands accepting a `<run-id>`: if the argument matches UUID4 format (8-4-4-4-12 hex), it is resolved as `run_id`; otherwise it is resolved as a `slug`. UUID format takes precedence if both match a run.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-075]** `devs logs --follow` exits code 0 when the run reaches `Completed`, exits code 1 when it reaches `Failed` or `Cancelled`. If the server connection drops during streaming and cannot be recovered within 5 seconds, it exits code 3.
- **Type:** Technical
- **Description:** `devs logs --follow` exits code 0 when the run reaches `Completed`, exits code 1 when it reaches `Failed` or `Cancelled`. If the server connection drops during streaming and cannot be recovered within 5 seconds, it exits code 3.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-076]** `devs list --limit <n>` where n > 1000 is silently clamped to 1000 and proceeds. `--limit 0` is a validation error (exit code 4) with message `"invalid_argument: --limit must be at least 1"`.
- **Type:** Technical
- **Description:** `devs list --limit <n>` where n > 1000 is silently clamped to 1000 and proceeds. `--limit 0` is a validation error (exit code 4) with message `"invalid_argument: --limit must be at least 1"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-077]** In `--format json` mode, the `--stage` argument to `devs logs` filters output to lines from the named stage only. In text mode without `--stage`, multi-stage output lines are prefixed as `[stage-name:stdout] <content>` or `[stage-name:stderr] <content>`.
- **Type:** Technical
- **Description:** In `--format json` mode, the `--stage` argument to `devs logs` filters output to lines from the named stage only. In text mode without `--stage`, multi-stage output lines are prefixed as `[stage-name:stdout] <content>` or `[stage-name:stderr] <content>`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-078]** `devs project add <repo-path>` resolves the path via `std::fs::canonicalize()` before sending to the server. Relative paths are resolved relative to CWD. The canonical absolute path is stored in `projects.toml`.
- **Type:** Technical
- **Description:** `devs project add <repo-path>` resolves the path via `std::fs::canonicalize()` before sending to the server. Relative paths are resolved relative to CWD. The canonical absolute path is stored in `projects.toml`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-079]** `devs-mcp-bridge` is a thin proxy. It reads one JSON-RPC request per line from stdin, validates the JSON, forwards via HTTP POST to `/mcp/v1/call`, writes the response as a single line to stdout. It MUST NOT buffer, transform, or interpret tool call semantics.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` is a thin proxy. It reads one JSON-RPC request per line from stdin, validates the JSON, forwards via HTTP POST to `/mcp/v1/call`, writes the response as a single line to stdout. It MUST NOT buffer, transform, or interpret tool call semantics.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-080]** `devs-mcp-bridge` performs server discovery once at startup. It reads `DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`), calls `ServerService.GetInfo` to obtain the MCP port, then constructs the `http://<host>:<mcp_port>/mcp/v1/call` endpoint URL. This URL is NOT re-derived until bridge restart.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` performs server discovery once at startup. It reads `DEVS_DISCOVERY_FILE` (or `~/.config/devs/server.addr`), calls `ServerService.GetInfo` to obtain the MCP port, then constructs the `http://<host>:<mcp_port>/mcp/v1/call` endpoint URL. This URL is NOT re-derived until bridge restart.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-081]** On connection loss, `devs-mcp-bridge` attempts exactly one reconnect after 1 second. If the reconnect fails, it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1.
- **Type:** Technical
- **Description:** On connection loss, `devs-mcp-bridge` attempts exactly one reconnect after 1 second. If the reconnect fails, it writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-082]** The bridge MUST preserve the `id` field from the request in every response. If the request is not parseable JSON (no `id` available), the response uses `"id": null`. This ensures the consumer can match responses to requests.
- **Type:** Technical
- **Description:** The bridge MUST preserve the `id` field from the request in every response. If the request is not parseable JSON (no `id` available), the response uses `"id": null`. This ensures the consumer can match responses to requests.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-083]** The `method` field in requests is forwarded to the HTTP endpoint without validation or transformation. The bridge does NOT enforce a list of valid method names; tool routing is entirely handled by the MCP HTTP server.
- **Type:** Technical
- **Description:** The `method` field in requests is forwarded to the HTTP endpoint without validation or transformation. The bridge does NOT enforce a list of valid method names; tool routing is entirely handled by the MCP HTTP server.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-084]** `devs-mcp-bridge` validates each stdin line by attempting `serde_json::from_str::<serde_json::Value>()`. If parsing succeeds but the result is not a JSON object (e.g., a bare array `[1,2]` or a string), the bridge responds with a JSON-RPC `-32600` invalid-request error and continues reading. It MUST NOT exit on per-request errors.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` validates each stdin line by attempting `serde_json::from_str::<serde_json::Value>()`. If parsing succeeds but the result is not a JSON object (e.g., a bare array `[1,2]` or a string), the bridge responds with a JSON-RPC `-32600` invalid-request error and continues reading. It MUST NOT exit on per-request errors.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-085]** For streaming responses the bridge MUST NOT buffer the complete response before writing to stdout. Each chunk MUST be written and flushed to stdout immediately upon receipt. Buffering defeats the purpose of streaming for consuming AI agents.
- **Type:** Technical
- **Description:** For streaming responses the bridge MUST NOT buffer the complete response before writing to stdout. Each chunk MUST be written and flushed to stdout immediately upon receipt. Buffering defeats the purpose of streaming for consuming AI agents.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-086]** Non-streaming responses (all tools except `stream_logs follow:true`) are written as a single stdout line. The bridge reads the complete HTTP response body, then writes one line to stdout and flushes.
- **Type:** Technical
- **Description:** Non-streaming responses (all tools except `stream_logs follow:true`) are written as a single stdout line. The bridge reads the complete HTTP response body, then writes one line to stdout and flushes.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-087]** `devs-mcp-bridge` flushes stdout after every line write using `std::io::Write::flush()`. Unflushed output will cause the consuming AI agent to block indefinitely waiting for data.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` flushes stdout after every line write using `std::io::Write::flush()`. Unflushed output will cause the consuming AI agent to block indefinitely waiting for data.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-088]** All reusable widget structs are defined in `crates/devs-tui/src/widgets/`. Widget modules MUST NOT import tab modules (`tabs::*`). Tab modules MAY import widget modules. This prevents circular dependencies within the crate.
- **Type:** Technical
- **Description:** All reusable widget structs are defined in `crates/devs-tui/src/widgets/`. Widget modules MUST NOT import tab modules (`tabs::*`). Tab modules MAY import widget modules. This prevents circular dependencies within the crate.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-089]** All reusable widget constructors use a fluent builder pattern. Mandatory fields are constructor parameters; optional rendering hints are setter methods that return `Self` (builder chain).
- **Type:** Technical
- **Description:** All reusable widget constructors use a fluent builder pattern. Mandatory fields are constructor parameters; optional rendering hints are setter methods that return `Self` (builder chain).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-090]** `StageList` renders stage rows with fixed column widths. Row format: `<stage-name-padded-20> | <STATUS> | <ATTEMPT> | <ELAPSED>`. Column separator is ` | ` (3 chars). Alternating row background highlighting is applied when rendering with `ratatui` style modifiers. Fan-out sub-stages are indented two spaces under their parent row.
- **Type:** Technical
- **Description:** `StageList` renders stage rows with fixed column widths. Row format: `<stage-name-padded-20> | <STATUS> | <ATTEMPT> | <ELAPSED>`. Column separator is ` | ` (3 chars). Alternating row background highlighting is applied when rendering with `ratatui` style modifiers. Fan-out sub-stages are indented two spaces under their parent row.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-091]** `RunList` renders run rows as: `<STATUS> <slug-padded-30> <workflow-padded-20> <created-date>`. The status prefix uses the `RunStatus` label (4 chars; `RunStatus::Running` → `RUN `, `RunStatus::Completed` → `DONE`, etc., following the same 4-char pattern as `StageStatus`). The selected row is highlighted with `Style::default().add_modifier(Modifier::REVERSED)`.
- **Type:** Technical
- **Description:** `RunList` renders run rows as: `<STATUS> <slug-padded-30> <workflow-padded-20> <created-date>`. The status prefix uses the `RunStatus` label (4 chars; `RunStatus::Running` → `RUN `, `RunStatus::Completed` → `DONE`, etc., following the same 4-char pattern as `StageStatus`). The selected row is highlighted with `Style::default().add_modifier(Modifier::REVERSED)`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-092]** `render_utils::strip_ansi` is the single authoritative ANSI stripping implementation in the TUI crate. It MUST be used by `LogPane` and every future widget that renders log content. Duplicate implementations of ANSI stripping in any widget module are a lint violation (enforced by a `./do lint` regex scan).
- **Type:** Technical
- **Description:** `render_utils::strip_ansi` is the single authoritative ANSI stripping implementation in the TUI crate. It MUST be used by `LogPane` and every future widget that renders log content. Duplicate implementations of ANSI stripping in any widget module are a lint violation (enforced by a `./do lint` regex scan).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-093]** Display models (`RunSummary`, `RunDetail`, `StageRunDisplay`, `LogBuffer`, `PoolSummary`, `AgentStatus`) are derived from gRPC proto message types in `crates/devs-tui/src/convert.rs`. The `convert.rs` module is the only place where proto types from `devs-proto` are referenced in the TUI crate. `state.rs` types MUST NOT reference `devs_proto` types.
- **Type:** Technical
- **Description:** Display models (`RunSummary`, `RunDetail`, `StageRunDisplay`, `LogBuffer`, `PoolSummary`, `AgentStatus`) are derived from gRPC proto message types in `crates/devs-tui/src/convert.rs`. The `convert.rs` module is the only place where proto types from `devs-proto` are referenced in the TUI crate. `state.rs` types MUST NOT reference `devs_proto` types.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-094]** `LogBuffer` is keyed in `AppState::log_buffers: HashMap<(Uuid, String), LogBuffer>` by `(run_id, stage_name)`. A new `LogBuffer` with capacity 10,000 is created when a `StageRun` transitions to `Running`. When a run reaches a terminal state and remains non-selected for more than 30 minutes, its `LogBuffer` entries are evicted from `AppState::log_buffers` in `App::handle_event()` (not during render) to prevent unbounded memory growth.
- **Type:** Technical
- **Description:** `LogBuffer` is keyed in `AppState::log_buffers: HashMap<(Uuid, String), LogBuffer>` by `(run_id, stage_name)`. A new `LogBuffer` with capacity 10,000 is created when a `StageRun` transitions to `Running`. When a run reaches a terminal state and remains non-selected for more than 30 minutes, its `LogBuffer` entries are evicted from `AppState::log_buffers` in `App::handle_event()` (not during render) to prevent unbounded memory growth.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-095]** `RunDetail.dag_tiers` is precomputed immediately after a `RunEvent` is applied to `AppState`. The tier computation runs in `App::handle_event()` using Kahn's topological sort over the `StageRunDisplay.depends_on` adjacency list. The computation result is stored in `RunDetail.dag_tiers` and reused across all subsequent render calls until a new `RunEvent` invalidates it.
- **Type:** Technical
- **Description:** `RunDetail.dag_tiers` is precomputed immediately after a `RunEvent` is applied to `AppState`. The tier computation runs in `App::handle_event()` using Kahn's topological sort over the `StageRunDisplay.depends_on` adjacency list. The computation result is stored in `RunDetail.dag_tiers` and reused across all subsequent render calls until a new `RunEvent` invalidates it.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-096]** When the TUI reconnects after a `StreamRunEvents` interruption, the first message received is a full snapshot (`event_type = "run.snapshot"`). On receipt, `AppState::runs` and `AppState::run_details` are fully replaced with fresh data. Stale `LogBuffer` entries are preserved (not cleared) since they represent log history that may not be re-delivered by the stream.
- **Type:** Technical
- **Description:** When the TUI reconnects after a `StreamRunEvents` interruption, the first message received is a full snapshot (`event_type = "run.snapshot"`). On receipt, `AppState::runs` and `AppState::run_details` are fully replaced with fresh data. Stale `LogBuffer` entries are preserved (not cleared) since they represent log history that may not be re-delivered by the stream.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-097]** When `ConnectionStatus` transitions to `Reconnecting`, all widgets retain their last-known values. The `StatusBar` shows `RECONNECTING` and the elapsed time since the last successful connection. No data is cleared on entry to `Reconnecting`; stale data remains visible until fresh data arrives after reconnection.
- **Type:** Technical
- **Description:** When `ConnectionStatus` transitions to `Reconnecting`, all widgets retain their last-known values. The `StatusBar` shows `RECONNECTING` and the elapsed time since the last successful connection. No data is cleared on entry to `Reconnecting`; stale data remains visible until fresh data arrives after reconnection.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-098]** The reconnect backoff sequence is: 1s → 2s → 4s → 8s → 16s → 30s (cap). Total reconnect budget before declaring `Disconnected` is 30 seconds cumulative. After the budget is exhausted, the TUI waits an additional 5-second grace period then exits with code 1 and the message `"Disconnected from server. Exiting."` written to the terminal.
- **Type:** Technical
- **Description:** The reconnect backoff sequence is: 1s → 2s → 4s → 8s → 16s → 30s (cap). Total reconnect budget before declaring `Disconnected` is 30 seconds cumulative. After the budget is exhausted, the TUI waits an additional 5-second grace period then exits with code 1 and the message `"Disconnected from server. Exiting."` written to the terminal.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-099]** `RunDetail` in `AppState::run_details` is populated from `StreamRunEvents` snapshot messages. The TUI does not issue separate `GetRun` gRPC calls; all run detail data arrives via the streaming channel. When a run is selected in `RunList`, if `AppState::run_details` already contains the run (from a prior snapshot), it is displayed immediately with no loading delay.
- **Type:** Technical
- **Description:** `RunDetail` in `AppState::run_details` is populated from `StreamRunEvents` snapshot messages. The TUI does not issue separate `GetRun` gRPC calls; all run detail data arrives via the streaming channel. When a run is selected in `RunList`, if `AppState::run_details` already contains the run (from a prior snapshot), it is displayed immediately with no loading delay.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-100]** -  `render_utils::format_elapsed(None)` returns `"--:--"` (exactly 5 characters). (unit test in `render_utils.rs`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-100]** `render_utils::format_elapsed(None)` returns `"--:--"` (exactly 5 characters). (unit test in `render_utils.rs`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-101]** -  `render_utils::format_elapsed(Some(4_205_000))` returns `"70:05"`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-101]** `render_utils::format_elapsed(Some(4_205_000))` returns `"70:05"`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-102]** -  `render_utils::format_elapsed(Some(0))` returns `"0:00"`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-102]** `render_utils::format_elapsed(Some(0))` returns `"0:00"`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-103]** -  `render_utils::truncate_with_tilde("twenty-one-char-stagename", 20)` returns a 20-character string ending with `~`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-103]** `render_utils::truncate_with_tilde("twenty-one-char-stagename", 20)` returns a 20-character string ending with `~`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-104]** -  `render_utils::truncate_with_tilde("short", 20)` returns `"short"` unchanged (no padding, no tilde). (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-104]** `render_utils::truncate_with_tilde("short", 20)` returns `"short"` unchanged (no padding, no tilde). (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-105]** -  `render_utils::stage_status_label(s)` returns exactly 4 characters for every variant of `StageStatus`. (unit test with exhaustive match)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-105]** `render_utils::stage_status_label(s)` returns exactly 4 characters for every variant of `StageStatus`. (unit test with exhaustive match)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-106]** -  `render_utils::strip_ansi("\x1b[31mRED\x1b[0m")` returns `"RED"`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-106]** `render_utils::strip_ansi("\x1b[31mRED\x1b[0m")` returns `"RED"`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-107]** -  `render_utils::strip_ansi("no ansi here")` returns `"no ansi here"` unchanged. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-107]** `render_utils::strip_ansi("no ansi here")` returns `"no ansi here"` unchanged. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-108]** -  `LogBuffer::new(10_000)` evicts the oldest entry when a 10,001st entry is inserted; `total_received` becomes 10,001 and `lines.len()` remains 10,000. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-108]** `LogBuffer::new(10_000)` evicts the oldest entry when a 10,001st entry is inserted; `total_received` becomes 10,001 and `lines.len()` remains 10,000. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-109]** -  `DagView` renders stage boxes with the exact format `[ <name-20-chars> | <STAT> | <M:SS> ]` (38 characters per box). (TUI E2E, `TestBackend` snapshot at 200×50)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-109]** `DagView` renders stage boxes with the exact format `[ <name-20-chars> | <STAT> | <M:SS> ]` (38 characters per box). (TUI E2E, `TestBackend` snapshot at 200×50)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-110]** -  A stage name of exactly 20 characters renders without truncation in `DagView`. A stage name of 21 characters renders as 19 original chars + `~`. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-110]** A stage name of exactly 20 characters renders without truncation in `DagView`. A stage name of 21 characters renders as 19 original chars + `~`. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-111]** -  `DagView` renders `──►` arrows between stage boxes in adjacent tiers for a workflow with `depends_on` edges. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-111]** `DagView` renders `──►` arrows between stage boxes in adjacent tiers for a workflow with `depends_on` edges. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-112]** -  `HelpOverlay` is shown when `?` is pressed and the overlay is dismissed when any subsequent key is pressed; the underlying tab content is restored. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-112]** `HelpOverlay` is shown when `?` is pressed and the overlay is dismissed when any subsequent key is pressed; the underlying tab content is restored. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-113]** -  `StatusBar` renders `RECONNECTING` when `ConnectionStatus::Reconnecting` is set in `AppState`. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-113]** `StatusBar` renders `RECONNECTING` when `ConnectionStatus::Reconnecting` is set in `AppState`. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-114]** -  `dag_tiers` for a linear A→B→C workflow computes to `[["A"], ["B"], ["C"]]`. (unit test in `convert.rs`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-114]** `dag_tiers` for a linear A→B→C workflow computes to `[["A"], ["B"], ["C"]]`. (unit test in `convert.rs`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-115]** -  `dag_tiers` for a diamond A→{B,C}→D computes to `[["A"], ["B", "C"], ["D"]]` (inner vecs sorted alphabetically). (unit test in `convert.rs`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-115]** `dag_tiers` for a diamond A→{B,C}→D computes to `[["A"], ["B", "C"], ["D"]]` (inner vecs sorted alphabetically). (unit test in `convert.rs`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-116]** -  `devs submit --input key=a=b` sends `key` → `"a=b"` to the server (splits on first `=` only). (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-116]** `devs submit --input key=a=b` sends `key` → `"a=b"` to the server (splits on first `=` only). (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-117]** -  `devs list --format json` returns a JSON object with a `"runs"` array field and a `"total"` integer field. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-117]** `devs list --format json` returns a JSON object with a `"runs"` array field and a `"total"` integer field. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-118]** -  `devs status <unknown-id> --format json` exits code 2 and prints a JSON object with `"error"` beginning `"not_found:"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-118]** `devs status <unknown-id> --format json` exits code 2 and prints a JSON object with `"error"` beginning `"not_found:"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-119]** -  `devs logs --follow` exits code 0 when the watched run reaches `Completed` and exits code 1 when it reaches `Failed`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-119]** `devs logs --follow` exits code 0 when the watched run reaches `Completed` and exits code 1 when it reaches `Failed`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-120]** -  `devs cancel` on an already-cancelled run exits code 1 with a message beginning `"failed_precondition:"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-120]** `devs cancel` on an already-cancelled run exits code 1 with a message beginning `"failed_precondition:"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-121]** -  `devs list --limit 0` exits code 4 with a message beginning `"invalid_argument:"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-121]** `devs list --limit 0` exits code 4 with a message beginning `"invalid_argument:"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-122]** -  `devs-mcp-bridge` writes each `stream_logs follow:true` response chunk to stdout as a separate line immediately upon receipt, before the complete stream ends. Verified by timing: first line arrives before the stream is complete. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-122]** `devs-mcp-bridge` writes each `stream_logs follow:true` response chunk to stdout as a separate line immediately upon receipt, before the complete stream ends. Verified by timing: first line arrives before the stream is complete. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-123]** -  `devs-mcp-bridge` responds with a JSON-RPC error and continues when it receives a non-object JSON line `[1,2,3]` on stdin; subsequent valid requests are still processed correctly. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-123]** `devs-mcp-bridge` responds with a JSON-RPC error and continues when it receives a non-object JSON line `[1,2,3]` on stdin; subsequent valid requests are still processed correctly. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-124]** -  `devs-mcp-bridge` preserves the `"id"` field value from the request in every response (string, integer, and null variants). (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-124]** `devs-mcp-bridge` preserves the `"id"` field value from the request in every response (string, integer, and null variants). (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-125]** -  `TUI::LogPane` renders `"RED"` (not `"\x1b[31mRED\x1b[0m"`) for a log line containing ANSI color codes. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-125]** `TUI::LogPane` renders `"RED"` (not `"\x1b[31mRED\x1b[0m"`) for a log line containing ANSI color codes. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-126]** -  All structs in `crates/devs-tui/src/widgets/` implement `ratatui::widgets::Widget`. Verified via compile-time assertion: `fn assert_widget<W: Widget>() {}` called for each widget type in a test. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-126]** All structs in `crates/devs-tui/src/widgets/` implement `ratatui::widgets::Widget`. Verified via compile-time assertion: `fn assert_widget<W: Widget>() {}` called for each widget type in a test. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-127]** -  `devs project add <path>` with a path that is not a git repository exits code 4 with a message beginning `"invalid_argument:"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-127]** `devs project add <path>` with a path that is not a git repository exits code 4 with a message beginning `"invalid_argument:"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-128]** -  `AppState::log_buffers` does not grow unboundedly: entries for non-selected runs older than 30 minutes are evicted; after processing 1,000 synthetic `RunEvent` messages for distinct runs, total `log_buffers` entries ≤ 100. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-128]** `AppState::log_buffers` does not grow unboundedly: entries for non-selected runs older than 30 minutes are evicted; after processing 1,000 synthetic `RunEvent` messages for distinct runs, total `log_buffers` entries ≤ 100. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-129]** -  `convert.rs` maps every variant of proto `StageStatus` enum to a `StageRunDisplay.status_label` without panicking. Verified by an exhaustive unit test iterating all proto enum values. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-129]** `convert.rs` maps every variant of proto `StageStatus` enum to a `StageRunDisplay.status_label` without panicking. Verified by an exhaustive unit test iterating all proto enum values. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-130]** All mutable TUI state is owned by a single `AppState` struct defined in `crates/devs-tui/src/state.rs`. No component owns state independently; components receive shared references to `AppState` at render time.
- **Type:** Technical
- **Description:** All mutable TUI state is owned by a single `AppState` struct defined in `crates/devs-tui/src/state.rs`. No component owns state independently; components receive shared references to `AppState` at render time.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-131]** `AppState` is the canonical owner of all display-layer state. All fields are plain owned Rust types; no `Arc`, `Mutex`, `RwLock`, or any async primitives appear in `AppState` itself. `App` owns `AppState` exclusively and all access is single-threaded within the render/event loop.
- **Type:** Technical
- **Description:** `AppState` is the canonical owner of all display-layer state. All fields are plain owned Rust types; no `Arc`, `Mutex`, `RwLock`, or any async primitives appear in `AppState` itself. `App` owns `AppState` exclusively and all access is single-threaded within the render/event loop.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-132]** `AppState::default()` returns a well-defined initial value. Every field has a documented initial value (see §3.2). `App::new()` calls `AppState::default()` before the first event is processed. There is no invalid initial state.
- **Type:** Technical
- **Description:** `AppState::default()` returns a well-defined initial value. Every field has a documented initial value (see §3.2). `App::new()` calls `AppState::default()` before the first event is processed. There is no invalid initial state.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-133]** State updates arrive from three sources: (a) gRPC `StreamRunEvents` push notifications, (b) gRPC `WatchPoolState` push notifications, and (c) crossterm keyboard/resize events. All three are unified into the `TuiEvent` enum and processed sequentially in `App::handle_event()`. There is no concurrent mutation of `AppState`.
- **Type:** Technical
- **Description:** State updates arrive from three sources: (a) gRPC `StreamRunEvents` push notifications, (b) gRPC `WatchPoolState` push notifications, and (c) crossterm keyboard/resize events. All three are unified into the `TuiEvent` enum and processed sequentially in `App::handle_event()`. There is no concurrent mutation of `AppState`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-134]** The event loop cycle is:
- **Type:** Technical
- **Description:** The event loop cycle is:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-135]** gRPC `StreamRunEvents` is consumed in a dedicated `tokio::task` that forwards `RunEvent` messages into an `mpsc::Sender<TuiEvent>`. Similarly, `WatchPoolState` is consumed in a dedicated task that forwards `PoolStateEvent` messages into the same sender. The main event loop reads from the corresponding `mpsc::Receiver<TuiEvent>`.
- **Type:** Technical
- **Description:** gRPC `StreamRunEvents` is consumed in a dedicated `tokio::task` that forwards `RunEvent` messages into an `mpsc::Sender<TuiEvent>`. Similarly, `WatchPoolState` is consumed in a dedicated task that forwards `PoolStateEvent` messages into the same sender. The main event loop reads from the corresponding `mpsc::Receiver<TuiEvent>`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-136]** `LogBuffer` is a fixed-capacity ring buffer with a maximum of 10,000 entries. When the buffer is at capacity and a new entry is inserted, the oldest entry is evicted. `total_received` is incremented on every insertion regardless of eviction. `LogBuffer` is keyed by `(run_id, stage_name)` in `AppState::log_buffers`.
- **Type:** Technical
- **Description:** `LogBuffer` is a fixed-capacity ring buffer with a maximum of 10,000 entries. When the buffer is at capacity and a new entry is inserted, the oldest entry is evicted. `total_received` is incremented on every insertion regardless of eviction. `LogBuffer` is keyed by `(run_id, stage_name)` in `AppState::log_buffers`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-137]** `ConnectionStatus` has three variants:
- **Type:** Technical
- **Description:** `ConnectionStatus` has three variants:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-138]** A `TuiEvent::Tick` is generated every 1 second from a `tokio::time::interval(Duration::from_secs(1))` task. On `Tick`, `App::handle_event()` updates `elapsed_display` in all `StageRunDisplay` records whose status is `Running` or `Paused` (by recomputing from `started_at` and `Utc::now()`). `Tick` events also drive the reconnect sleep mechanism: on each `Tick`, the elapsed reconnect time is checked against the budget. `Tick` processing MUST complete in under 1 ms.
- **Type:** Technical
- **Description:** A `TuiEvent::Tick` is generated every 1 second from a `tokio::time::interval(Duration::from_secs(1))` task. On `Tick`, `App::handle_event()` updates `elapsed_display` in all `StageRunDisplay` records whose status is `Running` or `Paused` (by recomputing from `started_at` and `Utc::now()`). `Tick` events also drive the reconnect sleep mechanism: on each `Tick`, the elapsed reconnect time is checked against the budget. `Tick` processing MUST complete in under 1 ms.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-139]** When `selected_run_id` is `Some(id)` and a `RunEvent::Snapshot` arrives that does not contain `id`, `selected_run_id` is cleared to `None`. This prevents a dangling selection pointing at a removed run.
- **Type:** Technical
- **Description:** When `selected_run_id` is `Some(id)` and a `RunEvent::Snapshot` arrives that does not contain `id`, `selected_run_id` is cleared to `None`. This prevents a dangling selection pointing at a removed run.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-140]** `dag_scroll_offset` is reset to `0` whenever `selected_run_id` changes (user selects a different run). Retaining the old offset for a new run would produce an incorrect render.
- **Type:** Technical
- **Description:** `dag_scroll_offset` is reset to `0` whenever `selected_run_id` changes (user selects a different run). Retaining the old offset for a new run would produce an incorrect render.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-141]** `log_scroll_offset` entries for a `(run_id, stage_name)` pair are removed when the corresponding `LogBuffer` is evicted from `AppState::log_buffers`. This prevents scroll offsets from consuming memory after the underlying buffer is gone.
- **Type:** Technical
- **Description:** `log_scroll_offset` entries for a `(run_id, stage_name)` pair are removed when the corresponding `LogBuffer` is evicted from `AppState::log_buffers`. This prevents scroll offsets from consuming memory after the underlying buffer is gone.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-142]** `AppState::runs` is sorted by `created_at` descending on every `RunEvent::Snapshot` or `RunEvent::Delta` mutation. The sort key is `created_at`; ties are broken by `run_id` lexicographic order. Sorting happens in `App::handle_event()` after applying the event, never during render.
- **Type:** Technical
- **Description:** `AppState::runs` is sorted by `created_at` descending on every `RunEvent::Snapshot` or `RunEvent::Delta` mutation. The sort key is `created_at`; ties are broken by `run_id` lexicographic order. Sorting happens in `App::handle_event()` after applying the event, never during render.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-143]** `selected_stage_name` is cleared to `None` on every tab switch away from `LogsTab` and `DebugTab`. Retaining a stage selection across unrelated tabs produces confusing UX.
- **Type:** Technical
- **Description:** `selected_stage_name` is cleared to `None` on every tab switch away from `LogsTab` and `DebugTab`. Retaining a stage selection across unrelated tabs produces confusing UX.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-144]** `TuiEvent` variants are produced exclusively by the sources shown in the following table. No other code may push `TuiEvent` messages into the channel.
- **Type:** Technical
- **Description:** `TuiEvent` variants are produced exclusively by the sources shown in the following table. No other code may push `TuiEvent` messages into the channel.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-145]** Each background task sends events into the same `mpsc::Sender<TuiEvent>`. The `tokio::select!` in the main loop polls from the corresponding `mpsc::Receiver<TuiEvent>`. If the receiver is full (buffer overflow), the background task applies backpressure (blocks on `send().await`). The main event loop MUST drain the channel within 50 ms of each event to prevent backpressure from stalling server-side streaming.
- **Type:** Technical
- **Description:** Each background task sends events into the same `mpsc::Sender<TuiEvent>`. The `tokio::select!` in the main loop polls from the corresponding `mpsc::Receiver<TuiEvent>`. If the receiver is full (buffer overflow), the background task applies backpressure (blocks on `send().await`). The main event loop MUST drain the channel within 50 ms of each event to prevent backpressure from stalling server-side streaming.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-146]** Mutation is atomic per event. Either the full mutation for an event completes or none of it does. Partial mutations (e.g., updating `runs` but failing before updating `run_details`) leave `AppState` in an inconsistent state. If an event processing function returns an error, `AppState` MUST be rolled back to its pre-mutation value. In practice this means mutations are applied to local variables first, then committed to `AppState` in a single assignment block.
- **Type:** Technical
- **Description:** Mutation is atomic per event. Either the full mutation for an event completes or none of it does. Partial mutations (e.g., updating `runs` but failing before updating `run_details`) leave `AppState` in an inconsistent state. If an event processing function returns an error, `AppState` MUST be rolled back to its pre-mutation value. In practice this means mutations are applied to local variables first, then committed to `AppState` in a single assignment block.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-147]** `render()` MUST NOT mutate `AppState`. The function signature is `fn render(&self, frame: &mut Frame)` — it receives `&self`, not `&mut self`. Any value that would need to be computed during render (e.g., elapsed times, tier layouts) is precomputed in `handle_event()` and stored in `AppState`. If a render function cannot compute a value without mutation, that is a design defect, not a reason to take `&mut self`.
- **Type:** Technical
- **Description:** `render()` MUST NOT mutate `AppState`. The function signature is `fn render(&self, frame: &mut Frame)` — it receives `&self`, not `&mut self`. Any value that would need to be computed during render (e.g., elapsed times, tier layouts) is precomputed in `handle_event()` and stored in `AppState`. If a render function cannot compute a value without mutation, that is a design defect, not a reason to take `&mut self`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-148]** `AppState` MUST remain internally consistent after every event. The key consistency invariants are:
- **Type:** Technical
- **Description:** `AppState` MUST remain internally consistent after every event. The key consistency invariants are:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-149]** When a `RunSnapshot` event is received (on initial connect or reconnect), `AppState::runs` and `AppState::run_details` are fully replaced with the snapshot data. `LogBuffer` entries are NOT cleared; they represent log history that may not be re-delivered by the stream. After replacement, consistency invariants (BR-010) are re-evaluated and `selected_run_id`/`selected_stage_name` are cleared if they refer to runs/stages no longer in the snapshot.
- **Type:** Technical
- **Description:** When a `RunSnapshot` event is received (on initial connect or reconnect), `AppState::runs` and `AppState::run_details` are fully replaced with the snapshot data. `LogBuffer` entries are NOT cleared; they represent log history that may not be re-delivered by the stream. After replacement, consistency invariants (BR-010) are re-evaluated and `selected_run_id`/`selected_stage_name` are cleared if they refer to runs/stages no longer in the snapshot.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-150]** Run upsert logic for `RunDelta` events:
- **Type:** Technical
- **Description:** Run upsert logic for `RunDelta` events:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-151]** `dag_tiers` in `RunDetail` MUST be recomputed immediately when `run_details` is mutated by a `RunDelta` or `RunSnapshot` event. It MUST NOT be deferred to render time. The `dag_tiers` value is the result of Kahn's topological sort over the updated `stage_runs` adjacency list. This computation runs synchronously in `handle_event()`; its worst-case complexity is O(V + E) where V is stage count (≤ 256) and E is dependency count.
- **Type:** Technical
- **Description:** `dag_tiers` in `RunDetail` MUST be recomputed immediately when `run_details` is mutated by a `RunDelta` or `RunSnapshot` event. It MUST NOT be deferred to render time. The `dag_tiers` value is the result of Kahn's topological sort over the updated `stage_runs` adjacency list. This computation runs synchronously in `handle_event()`; its worst-case complexity is O(V + E) where V is stage count (≤ 256) and E is dependency count.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-152]** `log_scroll_offset` for a stage is initialized to `0` when the `LogBuffer` for that stage is first created. When a new `LogLine` is appended to a buffer and the Logs tab is displaying that stage with scroll offset at the tail position, the offset is incremented by 1 to follow the tail. "Tail position" means `scroll_offset + visible_rows ≥ buffer.len()` before the insertion.
- **Type:** Technical
- **Description:** `log_scroll_offset` for a stage is initialized to `0` when the `LogBuffer` for that stage is first created. When a new `LogLine` is appended to a buffer and the Logs tab is displaying that stage with scroll offset at the tail position, the offset is incremented by 1 to follow the tail. "Tail position" means `scroll_offset + visible_rows ≥ buffer.len()` before the insertion.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-153]** The reconnect budget is 30,000 ms cumulative, tracked in `AppState::reconnect_elapsed_ms`. This counter is incremented by 1,000 ms on every `Tick` while `connection_status` is `Reconnecting`. When `reconnect_elapsed_ms` reaches 30,000 ms, the connection module starts a final 5-second grace timer. If the connection is not re-established within the grace period, `TuiEvent::ReconnectBudgetExceeded` is sent.
- **Type:** Technical
- **Description:** The reconnect budget is 30,000 ms cumulative, tracked in `AppState::reconnect_elapsed_ms`. This counter is incremented by 1,000 ms on every `Tick` while `connection_status` is `Reconnecting`. When `reconnect_elapsed_ms` reaches 30,000 ms, the connection module starts a final 5-second grace timer. If the connection is not re-established within the grace period, `TuiEvent::ReconnectBudgetExceeded` is sent.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-154]** `reconnect_elapsed_ms` is reset to `0` whenever `TuiEvent::Connected` is received. A successful reconnect fully resets the budget; it does not carry over elapsed time from previous reconnect attempts.
- **Type:** Technical
- **Description:** `reconnect_elapsed_ms` is reset to `0` whenever `TuiEvent::Connected` is received. A successful reconnect fully resets the budget; it does not carry over elapsed time from previous reconnect attempts.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-155]** While `ConnectionStatus` is `Reconnecting`, all TUI widgets remain visible with stale data. The `StatusBar` displays `RECONNECTING (attempt <n>, <elapsed>s elapsed)`. No data is cleared. This allows operators to see the last-known state while the server is temporarily unreachable.
- **Type:** Technical
- **Description:** While `ConnectionStatus` is `Reconnecting`, all TUI widgets remain visible with stale data. The `StatusBar` displays `RECONNECTING (attempt <n>, <elapsed>s elapsed)`. No data is cleared. This allows operators to see the last-known state while the server is temporarily unreachable.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-156]** While `ConnectionStatus` is `Reconnecting`, keyboard events (tab switching, scrolling, `?`, `q`) MUST still be processed. The TUI is not frozen during reconnect. Only actions that require a live server connection (cancel/pause/resume via `c`/`p`/`r`) display an error instead of issuing a gRPC call.
- **Type:** Technical
- **Description:** While `ConnectionStatus` is `Reconnecting`, keyboard events (tab switching, scrolling, `?`, `q`) MUST still be processed. The TUI is not frozen during reconnect. Only actions that require a live server connection (cancel/pause/resume via `c`/`p`/`r`) display an error instead of issuing a gRPC call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-157]** On receipt of `TuiEvent::Connected`, the connection module immediately subscribes to `StreamRunEvents` and `WatchPoolState`. The first messages received are full snapshots (`event_type = "run.snapshot"` and the initial `WatchPoolState` response). The TUI processes `RunSnapshot` and `PoolSnapshot` events before rendering the first frame after reconnect.
- **Type:** Technical
- **Description:** On receipt of `TuiEvent::Connected`, the connection module immediately subscribes to `StreamRunEvents` and `WatchPoolState`. The first messages received are full snapshots (`event_type = "run.snapshot"` and the initial `WatchPoolState` response). The TUI processes `RunSnapshot` and `PoolSnapshot` events before rendering the first frame after reconnect.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-158]** Any transition not in the table above is illegal. `App::handle_event()` MUST `assert!` or return an error if an illegal transition is attempted. In debug builds this is a `panic!`; in release builds it logs `ERROR` and retains the current state unchanged.
- **Type:** Technical
- **Description:** Any transition not in the table above is illegal. `App::handle_event()` MUST `assert!` or return an error if an illegal transition is attempted. In debug builds this is a `panic!`; in release builds it logs `ERROR` and retains the current state unchanged.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-159]** Creation rule (): A `LogBuffer` is created in `AppState::log_buffers` when a `RunDelta` or `RunSnapshot` event contains a `StageRun` with `status = Running` for a `(run_id, stage_name)` pair that does not yet have a buffer. The buffer is created with `max_capacity = 10_000`, `total_received = 0`, `truncated = false`.
- **Type:** Technical
- **Description:** **Creation rule ([6_UI_UX_ARCHITECTURE-REQ-159]):** A `LogBuffer` is created in `AppState::log_buffers` when a `RunDelta` or `RunSnapshot` event contains a `StageRun` with `status = Running` for a `(run_id, stage_name)` pair that does not yet have a buffer. The buffer is created with `max_capacity = 10_000`, `total_received = 0`, `truncated = false`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-160]** Eviction rules (): On every `Tick`, `App::handle_event()` scans `AppState::log_buffers` for buffers that satisfy ALL of the following conditions simultaneously:
- **Type:** Technical
- **Description:** **Eviction rules ([6_UI_UX_ARCHITECTURE-REQ-160]):** On every `Tick`, `App::handle_event()` scans `AppState::log_buffers` for buffers that satisfy ALL of the following conditions simultaneously:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-161]** Capacity enforcement (): When `LogBuffer::append(line)` is called and `lines.len() == max_capacity`, the front of the `VecDeque` is popped before the new line is pushed to the back. `total_received` is incremented regardless. The `LogBuffer` never exceeds `max_capacity` entries.
- **Type:** Technical
- **Description:** **Capacity enforcement ([6_UI_UX_ARCHITECTURE-REQ-161]):** When `LogBuffer::append(line)` is called and `lines.len() == max_capacity`, the front of the `VecDeque` is popped before the new line is pushed to the back. `total_received` is incremented regardless. The `LogBuffer` never exceeds `max_capacity` entries.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-162]** Scroll offset clamping (): After appending a `LogLine`, if the Logs tab is currently displaying this buffer and the user is NOT at the tail (i.e., `scroll_offset + visible_rows < buffer.len() before insertion`), the scroll offset is left unchanged (the view stays where it was, showing earlier content). If the user IS at the tail, the scroll offset is incremented by 1 so the view follows new output. This is sometimes called "auto-scroll" or "tail follow" behavior.
- **Type:** Technical
- **Description:** **Scroll offset clamping ([6_UI_UX_ARCHITECTURE-REQ-162]):** After appending a `LogLine`, if the Logs tab is currently displaying this buffer and the user is NOT at the tail (i.e., `scroll_offset + visible_rows < buffer.len() before insertion`), the scroll offset is left unchanged (the view stays where it was, showing earlier content). If the user IS at the tail, the scroll offset is incremented by 1 so the view follows new output. This is sometimes called "auto-scroll" or "tail follow" behavior.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-163]** The CLI is stateless between invocations. No session files, cookies, or persistent state are written by any CLI command. Each invocation is completely independent.
- **Type:** Technical
- **Description:** The CLI is stateless between invocations. No session files, cookies, or persistent state are written by any CLI command. Each invocation is completely independent.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-164]** `GlobalArgs` is parsed exactly once at the start of `main()` using `clap`. After parsing, it is immutable. No subcommand handler mutates `GlobalArgs`.
- **Type:** Technical
- **Description:** `GlobalArgs` is parsed exactly once at the start of `main()` using `clap`. After parsing, it is immutable. No subcommand handler mutates `GlobalArgs`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-165]** The `Formatter` is selected once based on `GlobalArgs::format` and is passed by `&dyn Formatter` reference to all subcommand handlers. It is never re-selected mid-invocation.
- **Type:** Technical
- **Description:** The `Formatter` is selected once based on `GlobalArgs::format` and is passed by `&dyn Formatter` reference to all subcommand handlers. It is never re-selected mid-invocation.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-166]** The gRPC channel is constructed lazily in `connection::connect()` using `Channel::connect_lazy()`. It is not dialed until the first RPC call. Connection timeout is 5 seconds. Only one channel is created per invocation; all subcommand handlers share the same channel.
- **Type:** Technical
- **Description:** The gRPC channel is constructed lazily in `connection::connect()` using `Channel::connect_lazy()`. It is not dialed until the first RPC call. Connection timeout is 5 seconds. Only one channel is created per invocation; all subcommand handlers share the same channel.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-167]** UUID format check uses the regex `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$` (strict UUID v4 format with version and variant bits). A string that looks like a UUID but fails this check (e.g., version `3` UUID) is treated as a slug. UUID resolution takes precedence: if the string is a valid UUID, the slug path is never tried.
- **Type:** Technical
- **Description:** UUID format check uses the regex `^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$` (strict UUID v4 format with version and variant bits). A string that looks like a UUID but fails this check (e.g., version `3` UUID) is treated as a slug. UUID resolution takes precedence: if the string is a valid UUID, the slug path is never tried.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-168]** `LogsStreamState.last_sequence` is checked on every received chunk. If `chunk.sequence != last_sequence + 1`, the CLI prints a warning to stderr: `"warning: log sequence gap detected: expected <n>, got <m>"`. This is informational only; the stream continues. (The server guarantees no gaps; this check is a client-side sanity assertion.)
- **Type:** Technical
- **Description:** `LogsStreamState.last_sequence` is checked on every received chunk. If `chunk.sequence != last_sequence + 1`, the CLI prints a warning to stderr: `"warning: log sequence gap detected: expected <n>, got <m>"`. This is informational only; the stream continues. (The server guarantees no gaps; this check is a client-side sanity assertion.)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-169]** `devs logs --follow` exits when `seen_done = true`. On receipt of the terminal chunk `{"done": true, ...}`, `seen_done` is set, the terminal chunk is written to stdout, and the process exits. The exit code is determined by the run's final status (0 for `Completed`, 1 for `Failed`/`Cancelled`). If the gRPC stream closes before `seen_done`, the CLI treats it as a disconnection and exits with code 3.
- **Type:** Technical
- **Description:** `devs logs --follow` exits when `seen_done = true`. On receipt of the terminal chunk `{"done": true, ...}`, `seen_done` is set, the terminal chunk is written to stdout, and the process exits. The exit code is determined by the run's final status (0 for `Completed`, 1 for `Failed`/`Cancelled`). If the gRPC stream closes before `seen_done`, the CLI treats it as a disconnection and exits with code 3.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-170]** `devs-mcp-bridge` maintains the MCP endpoint URL derived at startup as its sole persistent state. Per-request state (`InFlightRequest`) exists only for the duration of a single request-response cycle.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` maintains the MCP endpoint URL derived at startup as its sole persistent state. Per-request state (`InFlightRequest`) exists only for the duration of a single request-response cycle.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-171]** The bridge processes requests sequentially: exactly one `InFlightRequest` exists at any time. The async stdin reader buffers the next line while a request is in-flight; it does not begin processing the buffered line until the current request completes and a response is written to stdout. This ensures ordered request-response pairing.
- **Type:** Technical
- **Description:** The bridge processes requests sequentially: exactly one `InFlightRequest` exists at any time. The async stdin reader buffers the next line while a request is in-flight; it does not begin processing the buffered line until the current request completes and a response is written to stdout. This ensures ordered request-response pairing.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-172]** On HTTP connection error during a request, the bridge:
- **Type:** Technical
- **Description:** On HTTP connection error during a request, the bridge:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-173]** For `stream_logs follow:true`, the bridge detects the streaming nature of the response from the HTTP `Transfer-Encoding: chunked` response header. If this header is absent on a `stream_logs follow:true` response, the bridge treats the entire response body as a single non-streaming response and writes one stdout line. This ensures the bridge degrades gracefully if the server sends a non-chunked response.
- **Type:** Technical
- **Description:** For `stream_logs follow:true`, the bridge detects the streaming nature of the response from the HTTP `Transfer-Encoding: chunked` response header. If this header is absent on a `stream_logs follow:true` response, the bridge treats the entire response body as a single non-streaming response and writes one stdout line. This ensures the bridge degrades gracefully if the server sends a non-chunked response.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-174]** stdout is flushed after every line write (`std::io::Write::flush()`). This applies to both streaming chunks and single-response lines. An unflushed write causes the consuming AI agent process to block indefinitely on its stdin reader.
- **Type:** Technical
- **Description:** stdout is flushed after every line write (`std::io::Write::flush()`). This applies to both streaming chunks and single-response lines. An unflushed write causes the consuming AI agent process to block indefinitely on its stdin reader.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-175]** The bridge MUST NOT buffer or aggregate stdin lines. Each line read from stdin is processed immediately before reading the next. The stdin reader uses a `tokio::io::AsyncBufReadExt::lines()` stream; each `next()` call blocks until a complete line is available.
- **Type:** Technical
- **Description:** The bridge MUST NOT buffer or aggregate stdin lines. Each line read from stdin is processed immediately before reading the next. The stdin reader uses a `tokio::io::AsyncBufReadExt::lines()` stream; each `next()` call blocks until a complete line is available.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-176]** The first event received after establishing `StreamRunEvents` is always a full snapshot (`event_type = "run.snapshot"`). This is guaranteed by the server (per gRPC spec). The TUI MUST handle the case where the first message is NOT a snapshot (e.g., if the connection was established mid-session on an older server version) by treating any non-snapshot `RunEvent` as a delta on an empty initial state, then displaying a `StatusBar` warning: `"WARNING: missed run snapshot; data may be incomplete"`.
- **Type:** Technical
- **Description:** The first event received after establishing `StreamRunEvents` is always a full snapshot (`event_type = "run.snapshot"`). This is guaranteed by the server (per gRPC spec). The TUI MUST handle the case where the first message is NOT a snapshot (e.g., if the connection was established mid-session on an older server version) by treating any non-snapshot `RunEvent` as a delta on an empty initial state, then displaying a `StatusBar` warning: `"WARNING: missed run snapshot; data may be incomplete"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-177]** Between receiving a `TuiEvent` and completing `App::handle_event()`, no render occurs. Between completing `handle_event()` and completing `terminal.draw()`, no new events are processed. This single-threaded linearization means `AppState` is always in a consistent state when `render()` reads it.
- **Type:** Technical
- **Description:** Between receiving a `TuiEvent` and completing `App::handle_event()`, no render occurs. Between completing `handle_event()` and completing `terminal.draw()`, no new events are processed. This single-threaded linearization means `AppState` is always in a consistent state when `render()` reads it.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-178]** `LogLine` events for a stage that has no `LogBuffer` (because the stage was never seen as `Running`) are silently discarded. This can happen if the TUI connects mid-stage after the `Running` transition was already emitted. The bridge, once connected, will catch up via the `LogLine` events but the `LogBuffer` creation trigger (seeing `status = Running`) may have been missed. To handle this case: if a `LogLine` arrives for `(run_id, stage_name)` with no corresponding buffer, a new buffer is created with `total_received = 0` and the line is appended. The `StreamRunEvents` snapshot always includes the current stage status, so the buffer will be populated when the next `RunDelta` or reconnect snapshot arrives.
- **Type:** Technical
- **Description:** `LogLine` events for a stage that has no `LogBuffer` (because the stage was never seen as `Running`) are silently discarded. This can happen if the TUI connects mid-stage after the `Running` transition was already emitted. The bridge, once connected, will catch up via the `LogLine` events but the `LogBuffer` creation trigger (seeing `status = Running`) may have been missed. To handle this case: if a `LogLine` arrives for `(run_id, stage_name)` with no corresponding buffer, a new buffer is created with `total_received = 0` and the line is appended. The `StreamRunEvents` snapshot always includes the current stage status, so the buffer will be populated when the next `RunDelta` or reconnect snapshot arrives.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-179]** `devs logs --follow` is the exception: it holds a `StreamLogs` gRPC streaming RPC open for the duration of the run. Log chunks arrive in sequence-number order. If a chunk arrives with `sequence < expected`, the CLI discards it as a duplicate (this should not happen given the server guarantees, but is handled defensively). If a chunk arrives with `sequence > expected + 1`, the CLI emits a warning line on stderr and continues.
- **Type:** Technical
- **Description:** `devs logs --follow` is the exception: it holds a `StreamLogs` gRPC streaming RPC open for the duration of the run. Log chunks arrive in sequence-number order. If a chunk arrives with `sequence < expected`, the CLI discards it as a duplicate (this should not happen given the server guarantees, but is handled defensively). If a chunk arrives with `sequence > expected + 1`, the CLI emits a warning line on stderr and continues.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-180]** -  `AppState::default()` produces a value where `active_tab = Dashboard`, `runs = []`, `selected_run_id = None`, `connection_status = Reconnecting { attempt: 0, ... }`, `help_visible = false`. (unit test in `state.rs`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-180]** `AppState::default()` produces a value where `active_tab = Dashboard`, `runs = []`, `selected_run_id = None`, `connection_status = Reconnecting { attempt: 0, ... }`, `help_visible = false`. (unit test in `state.rs`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-181]** -  `App::handle_event(RunSnapshot([run_A, run_B], details))` replaces `AppState::runs` with exactly `[run_A, run_B]` sorted by `created_at` descending; no other run entries remain. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-181]** `App::handle_event(RunSnapshot([run_A, run_B], details))` replaces `AppState::runs` with exactly `[run_A, run_B]` sorted by `created_at` descending; no other run entries remain. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-182]** -  `App::handle_event(RunSnapshot([run_A], details))` when `AppState::selected_run_id = Some(run_B_id)` (not in snapshot) clears `selected_run_id` to `None`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-182]** `App::handle_event(RunSnapshot([run_A], details))` when `AppState::selected_run_id = Some(run_B_id)` (not in snapshot) clears `selected_run_id` to `None`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-183]** -  `App::handle_event(RunDelta(run_A_updated, detail))` when `run_A` already exists in `AppState::runs` replaces the entry in-place and re-sorts; the resulting `runs` list has the same length as before. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-183]** `App::handle_event(RunDelta(run_A_updated, detail))` when `run_A` already exists in `AppState::runs` replaces the entry in-place and re-sorts; the resulting `runs` list has the same length as before. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-184]** -  `App::handle_event(RunDelta(run_new, detail))` when `run_new.run_id` is not in `AppState::runs` inserts the run and re-sorts; `runs.len()` increases by 1. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-184]** `App::handle_event(RunDelta(run_new, detail))` when `run_new.run_id` is not in `AppState::runs` inserts the run and re-sorts; `runs.len()` increases by 1. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-185]** -  After `App::handle_event(RunDelta(run, detail))` with a 3-stage workflow `A → B → C`, `AppState::run_details[run_id].dag_tiers` equals `[["A"], ["B"], ["C"]]`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-185]** After `App::handle_event(RunDelta(run, detail))` with a 3-stage workflow `A → B → C`, `AppState::run_details[run_id].dag_tiers` equals `[["A"], ["B"], ["C"]]`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-186]** -  `App::handle_event(LogLine { run_id, stage_name, line })` for a `(run_id, stage_name)` with no existing buffer creates a new `LogBuffer`, appends the line, and sets `total_received = 1`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-186]** `App::handle_event(LogLine { run_id, stage_name, line })` for a `(run_id, stage_name)` with no existing buffer creates a new `LogBuffer`, appends the line, and sets `total_received = 1`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-187]** -  `LogBuffer` at capacity (10,000 entries) after one more `append()` has `lines.len() == 10_000` and `total_received == 10_001`; the front entry is the second-oldest original entry. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-187]** `LogBuffer` at capacity (10,000 entries) after one more `append()` has `lines.len() == 10_000` and `total_received == 10_001`; the front entry is the second-oldest original entry. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-188]** -  Auto-scroll: after appending a `LogLine` when scroll offset is at tail position, `log_scroll_offset` is incremented by 1. After appending when scroll offset is below tail, `log_scroll_offset` is unchanged. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-188]** Auto-scroll: after appending a `LogLine` when scroll offset is at tail position, `log_scroll_offset` is incremented by 1. After appending when scroll offset is below tail, `log_scroll_offset` is unchanged. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-189]** -  Idle eviction: a terminal-run buffer with `last_appended_at > 30 minutes ago` AND `(run_id, stage_name) != (selected_run_id, selected_stage_name)` is removed from `log_buffers` on `Tick`. (unit test, using `Instant::now() - Duration::from_secs(1801)` mock)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-189]** Idle eviction: a terminal-run buffer with `last_appended_at > 30 minutes ago` AND `(run_id, stage_name) != (selected_run_id, selected_stage_name)` is removed from `log_buffers` on `Tick`. (unit test, using `Instant::now() - Duration::from_secs(1801)` mock)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-190]** -  Non-terminal-run buffer is NOT evicted regardless of `last_appended_at` age. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-190]** Non-terminal-run buffer is NOT evicted regardless of `last_appended_at` age. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-191]** -  `App::handle_event(Connected { server_addr })` transitions `connection_status` to `Connected` and resets `reconnect_elapsed_ms` to `0`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-191]** `App::handle_event(Connected { server_addr })` transitions `connection_status` to `Connected` and resets `reconnect_elapsed_ms` to `0`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-192]** -  `App::handle_event(StreamError { reason })` transitions `connection_status` from `Connected` to `Reconnecting { attempt: 1, ... }`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-192]** `App::handle_event(StreamError { reason })` transitions `connection_status` from `Connected` to `Reconnecting { attempt: 1, ... }`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-193]** -  `App::handle_event(ReconnectBudgetExceeded)` transitions `connection_status` to `Disconnected`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-193]** `App::handle_event(ReconnectBudgetExceeded)` transitions `connection_status` to `Disconnected`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-194]** -  When `connection_status = Reconnecting`, the `StatusBar` widget renders `"RECONNECTING"` in a `TestBackend` snapshot at 200×50. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-194]** When `connection_status = Reconnecting`, the `StatusBar` widget renders `"RECONNECTING"` in a `TestBackend` snapshot at 200×50. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-195]** -  `App::handle_event(Resize(60, 20))` sets `terminal_size = (60, 20)` and the next render shows `"Terminal too small: 80x24 minimum required (current: 60x20)"`. (TUI E2E, `TestBackend` snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-195]** `App::handle_event(Resize(60, 20))` sets `terminal_size = (60, 20)` and the next render shows `"Terminal too small: 80x24 minimum required (current: 60x20)"`. (TUI E2E, `TestBackend` snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-196]** -  `App::handle_event(Key(Tab))` cycles `active_tab` through `Dashboard → Logs → Debug → Pools → Dashboard`. (unit test, 5 key events)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-196]** `App::handle_event(Key(Tab))` cycles `active_tab` through `Dashboard → Logs → Debug → Pools → Dashboard`. (unit test, 5 key events)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-197]** -  `App::handle_event(Key('3'))` sets `active_tab = Debug` regardless of current tab. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-197]** `App::handle_event(Key('3'))` sets `active_tab = Debug` regardless of current tab. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-198]** -  `App::handle_event(Key('?'))` toggles `help_visible` from `false` to `true`; a second `Key('?')` toggles it back to `false`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-198]** `App::handle_event(Key('?'))` toggles `help_visible` from `false` to `true`; a second `Key('?')` toggles it back to `false`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-199]** -  `selected_stage_name` is cleared to `None` when `active_tab` changes from `Logs` to `Dashboard`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-199]** `selected_stage_name` is cleared to `None` when `active_tab` changes from `Logs` to `Dashboard`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-200]** -  `dag_scroll_offset` is reset to `0` when `selected_run_id` changes via a `Key(↓)` event in the Dashboard run list. (unit test with AppState containing ≥2 runs)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-200]** `dag_scroll_offset` is reset to `0` when `selected_run_id` changes via a `Key(↓)` event in the Dashboard run list. (unit test with AppState containing ≥2 runs)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-201]** -  `render()` on `App` does not mutate `AppState`; calling `app.render(frame)` twice in succession produces identical frames and leaves `AppState` unchanged. (unit test: render twice, assert state equality before and after)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-201]** `render()` on `App` does not mutate `AppState`; calling `app.render(frame)` twice in succession produces identical frames and leaves `AppState` unchanged. (unit test: render twice, assert state equality before and after)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-202]** -  CLI `devs status <uuid>` where uuid matches a `run_id` resolves via UUID path (not slug path); a mock gRPC server verifying the request uses `run_id` field, not `slug` field. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-202]** CLI `devs status <uuid>` where uuid matches a `run_id` resolves via UUID path (not slug path); a mock gRPC server verifying the request uses `run_id` field, not `slug` field. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-203]** -  CLI `devs status <non-uuid-string>` resolves via slug path; mock gRPC server verifies the request uses `slug` field. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-203]** CLI `devs status <non-uuid-string>` resolves via slug path; mock gRPC server verifies the request uses `slug` field. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-204]** -  `devs logs --follow` exits code 0 when `{"done": true}` is received and the run status is `Completed`; exits code 1 when run status is `Failed`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-204]** `devs logs --follow` exits code 0 when `{"done": true}` is received and the run status is `Completed`; exits code 1 when run status is `Failed`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-205]** -  `devs-mcp-bridge` processes a second request after a streaming `stream_logs follow:true` response has completed (the streaming response wrote its `{"done":true}` chunk). (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-205]** `devs-mcp-bridge` processes a second request after a streaming `stream_logs follow:true` response has completed (the streaming response wrote its `{"done":true}` chunk). (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-206]** -  `devs-mcp-bridge` writes each `stream_logs` chunk to stdout and flushes immediately; a test consuming bridge stdout observes the first chunk before the stream terminates. (MCP E2E, timing assertion)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-206]** `devs-mcp-bridge` writes each `stream_logs` chunk to stdout and flushes immediately; a test consuming bridge stdout observes the first chunk before the stream terminates. (MCP E2E, timing assertion)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-207]** -  `devs-mcp-bridge` processes exactly one reconnect attempt on HTTP connection failure; if the reconnect also fails, it writes `fatal:true` to stdout and exits 1. (MCP E2E with simulated connection drop)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-207]** `devs-mcp-bridge` processes exactly one reconnect attempt on HTTP connection failure; if the reconnect also fails, it writes `fatal:true` to stdout and exits 1. (MCP E2E with simulated connection drop)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-208]** -  Concurrent `RunSnapshot` and `PoolSnapshot` events processed sequentially leave `AppState` consistent: both `runs` and `pool_state` are updated and `selected_run_id`/`selected_pool_name` validity is re-checked after each mutation. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-208]** Concurrent `RunSnapshot` and `PoolSnapshot` events processed sequentially leave `AppState` consistent: both `runs` and `pool_state` are updated and `selected_run_id`/`selected_pool_name` validity is re-checked after each mutation. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-209]** -  `LogBuffer` scroll offset for a non-selected stage is unaffected by `LogLine` events for a different stage. Inserting 100 lines into stage A's buffer does not change `log_scroll_offset` for stage B. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-209]** `LogBuffer` scroll offset for a non-selected stage is unaffected by `LogLine` events for a different stage. Inserting 100 lines into stage A's buffer does not change `log_scroll_offset` for stage B. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-210]** The TUI uses a tab-based navigation model. There are exactly four tabs, identified by the `Tab` enum:
- **Type:** Technical
- **Description:** The TUI uses a tab-based navigation model. There are exactly four tabs, identified by the `Tab` enum:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-211]** Tab navigation keybindings (normative):
- **Type:** Technical
- **Description:** Tab navigation keybindings (normative):
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-212]** Tab switching is handled in `App::handle_key_event()`. The active tab index is stored in `AppState::active_tab`. No network requests are issued on tab switch; all data is pre-loaded in `AppState`.
- **Type:** Technical
- **Description:** Tab switching is handled in `App::handle_key_event()`. The active tab index is stored in `AppState::active_tab`. No network requests are issued on tab switch; all data is pre-loaded in `AppState`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-213]** When the terminal is smaller than 80 columns × 24 rows, the TUI MUST render only the message: `"Terminal too small: 80x24 minimum required (current: WxH)"` centered in the available space. No other content is rendered. This check runs at every render call.
- **Type:** Technical
- **Description:** When the terminal is smaller than 80 columns × 24 rows, the TUI MUST render only the message: `"Terminal too small: 80x24 minimum required (current: WxH)"` centered in the available space. No other content is rendered. This check runs at every render call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-214]** `NavigationState` is the single source of truth for all cursor positions. Widgets MUST read their scroll and selection state exclusively from `NavigationState`; they MUST NOT maintain private cursor state.
- **Type:** Technical
- **Description:** `NavigationState` is the single source of truth for all cursor positions. Widgets MUST read their scroll and selection state exclusively from `NavigationState`; they MUST NOT maintain private cursor state.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-215]** When `selected_run_index` is `Some(i)` and the run list shrinks (e.g., due to a server-pushed deletion), `selected_run_index` is clamped to `min(i, new_len - 1)`. If the list becomes empty, it is set to `None`.
- **Type:** Technical
- **Description:** When `selected_run_index` is `Some(i)` and the run list shrinks (e.g., due to a server-pushed deletion), `selected_run_index` is clamped to `min(i, new_len - 1)`. If the list becomes empty, it is set to `None`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-216]** `selected_stage_index` is reset to `None` whenever `selected_run_index` changes. The previously selected stage is not remembered across run selection changes.
- **Type:** Technical
- **Description:** `selected_stage_index` is reset to `None` whenever `selected_run_index` changes. The previously selected stage is not remembered across run selection changes.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-217]** `log_scroll_offset` and `dag_scroll_col` are reset to `0` whenever `selected_stage_index` or `selected_run_index` changes. Users always begin at the most recent log output when navigating to a new stage.
- **Type:** Technical
- **Description:** `log_scroll_offset` and `dag_scroll_col` are reset to `0` whenever `selected_stage_index` or `selected_run_index` changes. Users always begin at the most recent log output when navigating to a new stage.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-218]** The `c`, `p`, `r` run control keys are only dispatched to their handlers when the active tab is `Dashboard` or (for `p`/`r`) `Debug`. On all other tabs these keys are silently ignored. No error is displayed.
- **Type:** Technical
- **Description:** The `c`, `p`, `r` run control keys are only dispatched to their handlers when the active tab is `Dashboard` or (for `p`/`r`) `Debug`. On all other tabs these keys are silently ignored. No error is displayed.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-219]** `Tab` key cycles in order: `Dashboard → Logs → Debug → Pools → Dashboard`. It MUST wrap at `Pools` back to `Dashboard`.
- **Type:** Technical
- **Description:** `Tab` key cycles in order: `Dashboard → Logs → Debug → Pools → Dashboard`. It MUST wrap at `Pools` back to `Dashboard`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-220]** The help overlay is a modal layer. While `help_visible == true`, all key events except `?`, `Esc`, `q`, and `Ctrl+C` are consumed by the overlay and MUST NOT reach the tab handler beneath it.
- **Type:** Technical
- **Description:** The help overlay is a modal layer. While `help_visible == true`, all key events except `?`, `Esc`, `q`, and `Ctrl+C` are consumed by the overlay and MUST NOT reach the tab handler beneath it.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-221]** Server discovery for CLI commands follows this precedence order (highest to lowest):
- **Type:** Technical
- **Description:** Server discovery for CLI commands follows this precedence order (highest to lowest):
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-222]** `devs logs --follow` is the only CLI command that holds a long-lived gRPC streaming connection. It exits with code 0 when the run reaches `Completed` status, and code 1 when it reaches `Failed` or `Cancelled`. It exits with code 3 if the server connection drops during streaming.
- **Type:** Technical
- **Description:** `devs logs --follow` is the only CLI command that holds a long-lived gRPC streaming connection. It exits with code 0 when the run reaches `Completed` status, and code 1 when it reaches `Failed` or `Cancelled`. It exits with code 3 if the server connection drops during streaming.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-223]** `devs security-check` MUST NOT open a gRPC channel. It reads `devs.toml` and `projects.toml` directly from disk. If no config files are found, it applies built-in defaults and reports results against those defaults.
- **Type:** Technical
- **Description:** `devs security-check` MUST NOT open a gRPC channel. It reads `devs.toml` and `projects.toml` directly from disk. If no config files are found, it applies built-in defaults and reports results against those defaults.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-224]** `devs pause --stage <name>` and `devs resume --stage <name>` route to `StageService.PauseStage` / `StageService.ResumeStage` respectively. When `--stage` is omitted, they route to `RunService.PauseRun` / `RunService.ResumeRun`.
- **Type:** Technical
- **Description:** `devs pause --stage <name>` and `devs resume --stage <name>` route to `StageService.PauseStage` / `StageService.ResumeStage` respectively. When `--stage` is omitted, they route to `RunService.PauseRun` / `RunService.ResumeRun`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-225]** When `--format json` is active, ALL output (both success and error) is written to `stdout` as JSON. Nothing is written to `stderr`. The JSON error format is `{"error": "<prefix>: <detail>", "code": <n>}`.
- **Type:** Technical
- **Description:** When `--format json` is active, ALL output (both success and error) is written to `stdout` as JSON. Nothing is written to `stderr`. The JSON error format is `{"error": "<prefix>: <detail>", "code": <n>}`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-226]** When `--format text` is active, errors are written to `stderr` with the machine-stable prefix followed by a human-readable description. The exit code is always set regardless of format.
- **Type:** Technical
- **Description:** When `--format text` is active, errors are written to `stderr` with the machine-stable prefix followed by a human-readable description. The exit code is always set regardless of format.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-227]** The exit code is independent of the output format. Both `text` and `json` formats produce the same exit codes for the same conditions:
- **Type:** Technical
- **Description:** The exit code is independent of the output format. Both `text` and `json` formats produce the same exit codes for the same conditions:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-228]** `devs submit` without `--project` when the current working directory resolves to exactly one registered project uses that project automatically. When the CWD resolves to zero or two-or-more projects, the command exits with code 4 and the error `"invalid_argument: --project required: CWD matches <N> projects"`.
- **Type:** Technical
- **Description:** `devs submit` without `--project` when the current working directory resolves to exactly one registered project uses that project automatically. When the CWD resolves to zero or two-or-more projects, the command exits with code 4 and the error `"invalid_argument: --project required: CWD matches <N> projects"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-229]** The `--name` flag value is passed verbatim to `SubmitRun.run_name`. If omitted, the server auto-generates a slug. Name format constraints (max 128 chars, `[a-z0-9-]+`) are enforced by the server, not the CLI; a violation produces a `INVALID_ARGUMENT` gRPC error which the CLI surfaces as exit code 4.
- **Type:** Technical
- **Description:** The `--name` flag value is passed verbatim to `SubmitRun.run_name`. If omitted, the server auto-generates a slug. Name format constraints (max 128 chars, `[a-z0-9-]+`) are enforced by the server, not the CLI; a violation produces a `INVALID_ARGUMENT` gRPC error which the CLI surfaces as exit code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-230]** When `<stage>` is omitted and `--follow` is not set, `devs logs` fetches stdout and stderr for all stages of the run, printing them in dependency order (stages with no dependencies first, then each dependent stage in topological order). Stages at the same dependency depth are printed in the order they appear in the workflow definition.
- **Type:** Technical
- **Description:** When `<stage>` is omitted and `--follow` is not set, `devs logs` fetches stdout and stderr for all stages of the run, printing them in dependency order (stages with no dependencies first, then each dependent stage in topological order). Stages at the same dependency depth are printed in the order they appear in the workflow definition.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-231]** When `--follow` is active and no `<stage>` is specified, the stream tracks the entire run: log lines from any stage are printed as they arrive, prefixed with `[<stage-name>] ` (stage name padded to 20 chars, truncated with `~` if longer).
- **Type:** Technical
- **Description:** When `--follow` is active and no `<stage>` is specified, the stream tracks the entire run: log lines from any stage are printed as they arrive, prefixed with `[<stage-name>] ` (stage name padded to 20 chars, truncated with `~` if longer).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-232]** `devs-mcp-bridge` routes all requests to a single endpoint: `POST http://<host>:<mcp_port>/mcp/v1/call`. There is no per-tool routing in the bridge; the tool name is embedded in the JSON-RPC request body and is opaque to the bridge.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` routes all requests to a single endpoint: `POST http://<host>:<mcp_port>/mcp/v1/call`. There is no per-tool routing in the bridge; the tool name is embedded in the JSON-RPC request body and is opaque to the bridge.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-233]** For `stream_logs` with `follow: true`, the bridge forwards the HTTP chunked response line-by-line to stdout as each chunk arrives. It MUST NOT buffer the entire response before writing.
- **Type:** Technical
- **Description:** For `stream_logs` with `follow: true`, the bridge forwards the HTTP chunked response line-by-line to stdout as each chunk arrives. It MUST NOT buffer the entire response before writing.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-234]** The bridge processes requests sequentially: it reads one line from stdin, forwards it, waits for the complete response (or all chunks for streaming), writes the output, then reads the next line. It MUST NOT issue concurrent HTTP requests.
- **Type:** Technical
- **Description:** The bridge processes requests sequentially: it reads one line from stdin, forwards it, waits for the complete response (or all chunks for streaming), writes the output, then reads the next line. It MUST NOT issue concurrent HTTP requests.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-235]** The bridge performs JSON syntax validation on each stdin line before forwarding. An unparseable line (invalid JSON) causes the bridge to write `{"result":null,"error":"invalid_argument: malformed JSON-RPC request"}` to stdout and read the next line. The bridge MUST NOT exit on a single malformed request.
- **Type:** Technical
- **Description:** The bridge performs JSON syntax validation on each stdin line before forwarding. An unparseable line (invalid JSON) causes the bridge to write `{"result":null,"error":"invalid_argument: malformed JSON-RPC request"}` to stdout and read the next line. The bridge MUST NOT exit on a single malformed request.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-236]** The bridge MUST NOT interpret or transform the `params` field of any JSON-RPC request. The `params` value is forwarded verbatim in the HTTP request body.
- **Type:** Technical
- **Description:** The bridge MUST NOT interpret or transform the `params` field of any JSON-RPC request. The `params` value is forwarded verbatim in the HTTP request body.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-237]** The bridge writes a fatal error and exits with code 1 on any HTTP transport error (connection refused, connection reset, read timeout). The fatal error format is:
- **Type:** Technical
- **Description:** The bridge writes a fatal error and exits with code 1 on any HTTP transport error (connection refused, connection reset, read timeout). The fatal error format is:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-238]** The bridge does NOT attempt to reconnect after a connection error. AI agents that need reconnection must restart the bridge process.
- **Type:** Technical
- **Description:** The bridge does NOT attempt to reconnect after a connection error. AI agents that need reconnection must restart the bridge process.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-239]** When stdin reaches EOF, the bridge exits with code 0 regardless of any in-flight request state.
- **Type:** Technical
- **Description:** When stdin reaches EOF, the bridge exits with code 0 regardless of any in-flight request state.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-240]** The bridge MUST forward stream chunks in order. It MUST NOT reorder or merge chunks.
- **Type:** Technical
- **Description:** The bridge MUST forward stream chunks in order. It MUST NOT reorder or merge chunks.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-241]** The bridge reads the HTTP response as a byte stream, scanning for `\n` delimiters. It forwards each complete line (without the trailing newline) as a standalone JSON line followed by a newline on stdout.
- **Type:** Technical
- **Description:** The bridge reads the HTTP response as a byte stream, scanning for `\n` delimiters. It forwards each complete line (without the trailing newline) as a standalone JSON line followed by a newline on stdout.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-242]** If the HTTP connection is closed by the server mid-stream (before `{"done":true}` is received), the bridge writes `{"result":null,"error":"server_unreachable: stream terminated unexpectedly","fatal":true}` to stdout and exits with code 1.
- **Type:** Technical
- **Description:** If the HTTP connection is closed by the server mid-stream (before `{"done":true}` is received), the bridge writes `{"result":null,"error":"server_unreachable: stream terminated unexpectedly","fatal":true}` to stdout and exits with code 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-243]** The bridge does NOT validate the JSON-RPC `method`, `id`, or `params` fields beyond syntactic JSON validity. Semantic validation is delegated entirely to the MCP server.
- **Type:** Technical
- **Description:** The bridge does NOT validate the JSON-RPC `method`, `id`, or `params` fields beyond syntactic JSON validity. Semantic validation is delegated entirely to the MCP server.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-244]** The "primary list widget" for each tab is the widget that receives `↑`/`↓` key events. When no run is selected, `RunList` always receives `↑`/`↓`. Once a run is selected (via `Enter` on `RunList`), the primary focus shifts to the stage list for that tab, and `↑`/`↓` operates on the stage list.
- **Type:** Technical
- **Description:** The "primary list widget" for each tab is the widget that receives `↑`/`↓` key events. When no run is selected, `RunList` always receives `↑`/`↓`. Once a run is selected (via `Enter` on `RunList`), the primary focus shifts to the stage list for that tab, and `↑`/`↓` operates on the stage list.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-245]** `Esc` from the stage list deselects the current stage and returns focus to `RunList`. `Esc` from `RunList` deselects the current run.
- **Type:** Technical
- **Description:** `Esc` from the stage list deselects the current stage and returns focus to `RunList`. `Esc` from `RunList` deselects the current run.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-246]** The `PgUp`/`PgDn`/`Home`/`End` keys always operate on the scrollable log or diff widget, regardless of focus. These keys are not consumed by list widgets.
- **Type:** Technical
- **Description:** The `PgUp`/`PgDn`/`Home`/`End` keys always operate on the scrollable log or diff widget, regardless of focus. These keys are not consumed by list widgets.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-247]** Step 5 (silent consumption) applies to all unrecognised keys in all contexts. The TUI MUST NOT write any error output for unrecognised keystrokes.
- **Type:** Technical
- **Description:** Step 5 (silent consumption) applies to all unrecognised keys in all contexts. The TUI MUST NOT write any error output for unrecognised keystrokes.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-248]** The `c`, `p`, `r` keys are dispatched only when `selected_run_index` is `Some(i)`. If no run is selected (`None`), these keys are silently consumed.
- **Type:** Technical
- **Description:** The `c`, `p`, `r` keys are dispatched only when `selected_run_index` is `Some(i)`. If no run is selected (`None`), these keys are silently consumed.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-249]** UUID format detection is performed by attempting `Uuid::parse_str(input)`. Any string that parses successfully as a UUID is resolved via `GetRun(run_id)`; all other strings are resolved via `ListRuns(slug_filter)`.
- **Type:** Technical
- **Description:** UUID format detection is performed by attempting `Uuid::parse_str(input)`. Any string that parses successfully as a UUID is resolved via `GetRun(run_id)`; all other strings are resolved via `ListRuns(slug_filter)`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-250]** UUID takes precedence over slug on collision: if a slug happens to be a valid UUID string and a run exists with that exact `run_id`, the UUID path is taken. The slug path is only taken for inputs that do not parse as a UUID.
- **Type:** Technical
- **Description:** UUID takes precedence over slug on collision: if a slug happens to be a valid UUID string and a run exists with that exact `run_id`, the UUID path is taken. The slug path is only taken for inputs that do not parse as a UUID.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-251]** In the TUI, run identifier resolution is not exposed to the user — the TUI always operates on `run_id` values taken directly from the in-memory `RunSummary` list. Resolution is only relevant for CLI commands.
- **Type:** Technical
- **Description:** In the TUI, run identifier resolution is not exposed to the user — the TUI always operates on `run_id` values taken directly from the in-memory `RunSummary` list. Resolution is only relevant for CLI commands.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-252]** The ambiguous-slug error uses exit code `2` (not found) rather than `4` (validation error) because the identifier is syntactically valid but the server cannot uniquely resolve it. The user must supply a `run_id` instead.
- **Type:** Technical
- **Description:** The ambiguous-slug error uses exit code `2` (not found) rather than `4` (validation error) because the identifier is syntactically valid but the server cannot uniquely resolve it. The user must supply a `run_id` instead.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-253]** The TUI opens the `StreamRunEvents` gRPC streaming call immediately after the channel is established. This stream is the sole source of push-based state updates. The TUI MUST NOT poll the server; all state updates are event-driven.
- **Type:** Technical
- **Description:** The TUI opens the `StreamRunEvents` gRPC streaming call immediately after the channel is established. This stream is the sole source of push-based state updates. The TUI MUST NOT poll the server; all state updates are event-driven.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-254]** When the TUI initiates a control action (`cancel`, `pause`, `resume`) it issues a unary gRPC RPC call on the same channel. The call is fire-and-result: the TUI waits for the response (success or error) and updates the `StatusBar` accordingly. It does NOT pre-emptively update `AppState` before the server confirms the transition.
- **Type:** Technical
- **Description:** When the TUI initiates a control action (`cancel`, `pause`, `resume`) it issues a unary gRPC RPC call on the same channel. The call is fire-and-result: the TUI waits for the response (success or error) and updates the `StatusBar` accordingly. It does NOT pre-emptively update `AppState` before the server confirms the transition.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-255]** The TUI reconnect backoff sequence is: 1s → 2s → 4s → 8s → 16s → 30s (cap at 30s). After total elapsed reconnect time exceeds 30 seconds, the TUI waits an additional 5 seconds then exits with code 1.
- **Type:** Technical
- **Description:** The TUI reconnect backoff sequence is: 1s → 2s → 4s → 8s → 16s → 30s (cap at 30s). After total elapsed reconnect time exceeds 30 seconds, the TUI waits an additional 5 seconds then exits with code 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-256]** During the reconnect interval, the TUI renders the `StatusBar` as `"RECONNECTING: attempt <N> in <Xs>..."`. The rest of the UI remains frozen at the last known state. The user may still press `q` to exit during reconnect.
- **Type:** Technical
- **Description:** During the reconnect interval, the TUI renders the `StatusBar` as `"RECONNECTING: attempt <N> in <Xs>..."`. The rest of the UI remains frozen at the last known state. The user may still press `q` to exit during reconnect.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-257]** The gRPC channel is created with a 5-second connection timeout. If the channel cannot be established within 5 seconds, the command exits with code 3 and the error `"server_unreachable: connection timeout after 5s"`.
- **Type:** Technical
- **Description:** The gRPC channel is created with a 5-second connection timeout. If the channel cannot be established within 5 seconds, the command exits with code 3 and the error `"server_unreachable: connection timeout after 5s"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-258]** For `devs logs --follow`, if the gRPC stream is interrupted by a network error after it has started delivering log lines, the CLI exits with code 3 and prints `"server_unreachable: log stream disconnected"`. It does NOT attempt to resume the stream.
- **Type:** Technical
- **Description:** For `devs logs --follow`, if the gRPC stream is interrupted by a network error after it has started delivering log lines, the CLI exits with code 3 and prints `"server_unreachable: log stream disconnected"`. It does NOT attempt to resume the stream.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-259]** The HTTP client is configured with: `timeout(10s)`, `connection_verbose(false)`, `redirect(Policy::none())`, `rustls-tls` only.
- **Type:** Technical
- **Description:** The HTTP client is configured with: `timeout(10s)`, `connection_verbose(false)`, `redirect(Policy::none())`, `rustls-tls` only.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-260]** Each bridge request creates a new HTTP request; the underlying `reqwest` client may reuse TCP connections from its internal pool. The bridge does not directly manage connection pooling.
- **Type:** Technical
- **Description:** Each bridge request creates a new HTTP request; the underlying `reqwest` client may reuse TCP connections from its internal pool. The bridge does not directly manage connection pooling.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-261]** -  Pressing keys `1`, `2`, `3`, `4` switches `NavigationState.active_tab` to `Dashboard`, `Logs`, `Debug`, `Pools` respectively regardless of current tab. (TUI E2E / unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-261]** Pressing keys `1`, `2`, `3`, `4` switches `NavigationState.active_tab` to `Dashboard`, `Logs`, `Debug`, `Pools` respectively regardless of current tab. (TUI E2E / unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-262]** -  Pressing `Tab` from `Pools` tab sets `active_tab` to `Dashboard`. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-262]** Pressing `Tab` from `Pools` tab sets `active_tab` to `Dashboard`. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-263]** -  Pressing `c` while `active_tab == Logs` issues no gRPC call and produces no error output. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-263]** Pressing `c` while `active_tab == Logs` issues no gRPC call and produces no error output. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-264]** -  `help_visible == true` blocks all key events except `?`, `Esc`, `q`, and `Ctrl+C` from reaching the tab handler. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-264]** `help_visible == true` blocks all key events except `?`, `Esc`, `q`, and `Ctrl+C` from reaching the tab handler. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-265]** -  `selected_stage_index` resets to `None` when `selected_run_index` changes value. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-265]** `selected_stage_index` resets to `None` when `selected_run_index` changes value. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-266]** -  `log_scroll_offset` resets to `0` when `selected_stage_index` changes value. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-266]** `log_scroll_offset` resets to `0` when `selected_stage_index` changes value. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-267]** -  Terminal smaller than 80×24 renders exactly `"Terminal too small: 80x24 minimum required (current: WxH)"` and nothing else. (TUI E2E snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-267]** Terminal smaller than 80×24 renders exactly `"Terminal too small: 80x24 minimum required (current: WxH)"` and nothing else. (TUI E2E snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-268]** -  `devs status <uuid>` issues `GetRun(run_id=uuid)` and never calls `ListRuns`. (CLI unit / E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-268]** `devs status <uuid>` issues `GetRun(run_id=uuid)` and never calls `ListRuns`. (CLI unit / E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-269]** -  `devs status <slug>` issues `ListRuns(slug_filter=slug)` and never calls `GetRun` first. (CLI unit / E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-269]** `devs status <slug>` issues `ListRuns(slug_filter=slug)` and never calls `GetRun` first. (CLI unit / E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-270]** -  `devs status` on a non-existent UUID exits with code 2 and output `"not_found: run <uuid> does not exist"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-270]** `devs status` on a non-existent UUID exits with code 2 and output `"not_found: run <uuid> does not exist"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-271]** -  `devs status` on an ambiguous slug (matching 2 runs) exits with code 2 and output `"not_found: slug '<slug>' matches 2 runs; use run_id to disambiguate"`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-271]** `devs status` on an ambiguous slug (matching 2 runs) exits with code 2 and output `"not_found: slug '<slug>' matches 2 runs; use run_id to disambiguate"`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-272]** -  `devs submit --input expr=a=b` passes key `expr`, value `"a=b"` to the server (splits on first `=` only). (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-272]** `devs submit --input expr=a=b` passes key `expr`, value `"a=b"` to the server (splits on first `=` only). (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-273]** -  `devs submit` with CWD matching 2 projects exits with code 4. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-273]** `devs submit` with CWD matching 2 projects exits with code 4. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-274]** -  `--format json` routes all output (errors and success) to stdout as JSON; nothing written to stderr. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-274]** `--format json` routes all output (errors and success) to stdout as JSON; nothing written to stderr. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-275]** -  `devs logs --follow` exits with code 0 when run reaches `Completed`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-275]** `devs logs --follow` exits with code 0 when run reaches `Completed`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-276]** -  `devs logs --follow` exits with code 1 when run reaches `Failed`. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-276]** `devs logs --follow` exits with code 1 when run reaches `Failed`. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-277]** -  `devs logs --follow` exits with code 3 when server connection drops mid-stream. (CLI E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-277]** `devs logs --follow` exits with code 3 when server connection drops mid-stream. (CLI E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-278]** -  `devs security-check` does NOT open a gRPC channel; `cargo tree -p devs-cli` shows it calls config parsing directly. (unit test of security_check module)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-278]** `devs security-check` does NOT open a gRPC channel; `cargo tree -p devs-cli` shows it calls config parsing directly. (unit test of security_check module)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-279]** -  `devs-mcp-bridge` writes a fatal error and exits 1 when the MCP HTTP server is unreachable after startup. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-279]** `devs-mcp-bridge` writes a fatal error and exits 1 when the MCP HTTP server is unreachable after startup. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-280]** -  `devs-mcp-bridge` writes an error line to stdout and continues reading stdin when given an invalid JSON line (does NOT exit). (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-280]** `devs-mcp-bridge` writes an error line to stdout and continues reading stdin when given an invalid JSON line (does NOT exit). (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-281]** -  `devs-mcp-bridge` forwards streaming chunks immediately (does not buffer entire response before writing). (MCP E2E: observe stdout interleaved with server sends)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-281]** `devs-mcp-bridge` forwards streaming chunks immediately (does not buffer entire response before writing). (MCP E2E: observe stdout interleaved with server sends)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-282]** -  `devs-mcp-bridge` exits with code 0 on stdin EOF. (MCP E2E)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-282]** `devs-mcp-bridge` exits with code 0 on stdin EOF. (MCP E2E)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-283]** -  TUI reconnect sequence follows the 1→2→4→8→16→30s backoff; after >30s total it exits with code 1. (TUI E2E with mock server that drops connections)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-283]** TUI reconnect sequence follows the 1→2→4→8→16→30s backoff; after >30s total it exits with code 1. (TUI E2E with mock server that drops connections)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-284]** -  TUI StatusBar shows `"RECONNECTING: attempt <N> in <Xs>..."` during reconnect intervals. (TUI E2E snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-284]** TUI StatusBar shows `"RECONNECTING: attempt <N> in <Xs>..."` during reconnect intervals. (TUI E2E snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-285]** -  `devs pause --stage <name>` routes to `StageService.PauseStage`; `devs pause` (no `--stage`) routes to `RunService.PauseRun`. (CLI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-285]** `devs pause --stage <name>` routes to `StageService.PauseStage`; `devs pause` (no `--stage`) routes to `RunService.PauseRun`. (CLI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-286]** -  `NavigationState.selected_run_index` is clamped to `new_len - 1` when the run list shrinks below the current selection. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-286]** `NavigationState.selected_run_index` is clamped to `new_len - 1` when the run list shrinks below the current selection. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-287]** -  `↑` at top of a list does not wrap around; selection remains at index 0. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-287]** `↑` at top of a list does not wrap around; selection remains at index 0. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-288]** -  `↓` at bottom of a list does not wrap around; selection remains at last index. (TUI unit)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-288]** `↓` at bottom of a list does not wrap around; selection remains at last index. (TUI unit)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-289]** Color is used as a secondary indicator only. Every status, state, and structural element MUST be distinguishable without color. When the `NO_COLOR` environment variable is set to any non-empty value, all ANSI color codes MUST be suppressed; `ColorMode` is set to `Monochrome`. The TUI uses `ratatui::style::Color` only when `ColorMode::Color`.
- **Type:** Technical
- **Description:** Color is used as a secondary indicator only. Every status, state, and structural element MUST be distinguishable without color. When the `NO_COLOR` environment variable is set to any non-empty value, all ANSI color codes MUST be suppressed; `ColorMode` is set to `Monochrome`. The TUI uses `ratatui::style::Color` only when `ColorMode::Color`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-290]** `Theme::from_env()` MUST be the only call site that reads `std::env::var("NO_COLOR")`. No widget, handler, or module may read this variable directly. Violation is a lint error enforced by a test that searches for `env::var("NO_COLOR")` outside `theme.rs`.
- **Type:** Technical
- **Description:** `Theme::from_env()` MUST be the only call site that reads `std::env::var("NO_COLOR")`. No widget, handler, or module may read this variable directly. Violation is a lint error enforced by a test that searches for `env::var("NO_COLOR")` outside `theme.rs`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-291]** In `Monochrome` mode, the only permitted text modifier for structural UI elements is `Modifier::REVERSED` (for selected rows). `Modifier::BOLD` is permitted for the active tab label in both modes. `Modifier::ITALIC`, `Modifier::UNDERLINED`, and `Modifier::BLINK` are prohibited entirely in structural positions (log content is rendered verbatim and exempt).
- **Type:** Technical
- **Description:** In `Monochrome` mode, the only permitted text modifier for structural UI elements is `Modifier::REVERSED` (for selected rows). `Modifier::BOLD` is permitted for the active tab label in both modes. `Modifier::ITALIC`, `Modifier::UNDERLINED`, and `Modifier::BLINK` are prohibited entirely in structural positions (log content is rendered verbatim and exempt).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-292]** The following color assignments apply when `ColorMode::Color`. These are normative for the production build; test snapshots are generated in `Monochrome` mode via `Theme { color_mode: ColorMode::Monochrome, .. }`.
- **Type:** Technical
- **Description:** The following color assignments apply when `ColorMode::Color`. These are normative for the production build; test snapshots are generated in `Monochrome` mode via `Theme { color_mode: ColorMode::Monochrome, .. }`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-293]** `Color::Reset` and `Color::Indexed(_)` are prohibited; only named `Color` variants or `Color::Rgb(r,g,b)` for future theme extension. This constraint is enforced by a `clippy` lint.
- **Type:** Technical
- **Description:** `Color::Reset` and `Color::Indexed(_)` are prohibited; only named `Color` variants or `Color::Rgb(r,g,b)` for future theme extension. This constraint is enforced by a `clippy` lint.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-294]** All structural TUI characters are from the ASCII range U+0020–U+007E. The exhaustive list of permitted structural characters for borders, arrows, separators, and labels:
- **Type:** Technical
- **Description:** All structural TUI characters are from the ASCII range U+0020–U+007E. The exhaustive list of permitted structural characters for borders, arrows, separators, and labels:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-295]** Stage log content (lines from `LogBuffer`) is rendered verbatim using `ratatui::widgets::Paragraph` with wrapping disabled. Log lines may contain any valid UTF-8, including Unicode, ANSI escape sequences (rendered as text in non-raw mode), and binary-escaped characters. ANSI sequences in log output are NOT stripped; they appear as literal text in the TUI log view.
- **Type:** Technical
- **Description:** Stage log content (lines from `LogBuffer`) is rendered verbatim using `ratatui::widgets::Paragraph` with wrapping disabled. Log lines may contain any valid UTF-8, including Unicode, ANSI escape sequences (rendered as text in non-raw mode), and binary-escaped characters. ANSI sequences in log output are NOT stripped; they appear as literal text in the TUI log view.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-296]** The active (focused) pane has its border drawn with `Modifier::BOLD`. Unfocused panes use the default style. There is no color difference between focused and unfocused panes, ensuring clarity in `Monochrome` mode.
- **Type:** Technical
- **Description:** The active (focused) pane has its border drawn with `Modifier::BOLD`. Unfocused panes use the default style. There is no color difference between focused and unfocused panes, ensuring clarity in `Monochrome` mode.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-297]** Selected rows in `RunList`, `LogsTab` stage selector, and `PoolsTab` agent list use `Theme::selected_row_style()`. In `Color` mode this is black-on-white. In `Monochrome` mode this is `Modifier::REVERSED` on the entire row width.
- **Type:** Technical
- **Description:** Selected rows in `RunList`, `LogsTab` stage selector, and `PoolsTab` agent list use `Theme::selected_row_style()`. In `Color` mode this is black-on-white. In `Monochrome` mode this is `Modifier::REVERSED` on the entire row width.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-298]** Cursor position (the `>` indicator in tables and lists) is an ASCII `>` character (U+003E) in column 0 of the selected row, followed by a space. This is used in addition to the reversed-video selection style so that selection is unambiguous in monochrome terminals and in snapshot assertions.
- **Type:** Technical
- **Description:** Cursor position (the `>` indicator in tables and lists) is an ASCII `>` character (U+003E) in column 0 of the selected row, followed by a space. This is used in addition to the reversed-video selection style so that selection is unambiguous in monochrome terminals and in snapshot assertions.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-299]** Machine-stable error message prefixes MUST appear verbatim in all error output (TUI status bar, CLI stderr/stdout, MCP bridge error responses):
- **Type:** Technical
- **Description:** Machine-stable error message prefixes MUST appear verbatim in all error output (TUI status bar, CLI stderr/stdout, MCP bridge error responses):
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-300]** Error strings stored in `strings.rs` MUST begin with exactly one of the prefixes in the table above, followed by a space and a human-readable detail. Example: `"not_found: run with id {run_id} does not exist"`. The prefix is machine-stable and tested; the detail is informational only.
- **Type:** Technical
- **Description:** Error strings stored in `strings.rs` MUST begin with exactly one of the prefixes in the table above, followed by a space and a human-readable detail. Example: `"not_found: run with id {run_id} does not exist"`. The prefix is machine-stable and tested; the detail is informational only.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-301]** The TUI status bar MUST display the full error string including prefix. It MUST NOT strip or abbreviate the prefix. If the error string exceeds the available status bar width, truncate from the right with `~`.
- **Type:** Technical
- **Description:** The TUI status bar MUST display the full error string including prefix. It MUST NOT strip or abbreviate the prefix. If the error string exceeds the available status bar width, truncate from the right with `~`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-302]** The TUI layout is computed dynamically at every render pass based on `terminal_size()`. No fixed pixel dimensions are used. The top-level layout algorithm is:
- **Type:** Technical
- **Description:** The TUI layout is computed dynamically at every render pass based on `terminal_size()`. No fixed pixel dimensions are used. The top-level layout algorithm is:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-303]** If the terminal is smaller than 80 columns × 24 rows, the TUI clears the screen and renders exactly one line:
- **Type:** Technical
- **Description:** If the terminal is smaller than 80 columns × 24 rows, the TUI clears the screen and renders exactly one line:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-304]** Terminal resize events (`TuiEvent::Resize`) trigger an immediate re-layout and re-render within one event loop tick. The `AppState::terminal_size` field is updated before any widget render function is called.
- **Type:** Technical
- **Description:** Terminal resize events (`TuiEvent::Resize`) trigger an immediate re-layout and re-render within one event loop tick. The `AppState::terminal_size` field is updated before any widget render function is called.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-305]** Within `DashboardTab`, the layout is a horizontal split:
- **Type:** Technical
- **Description:** Within `DashboardTab`, the layout is a horizontal split:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-306]** The `LogsTab` layout is a vertical split:
- **Type:** Technical
- **Description:** The `LogsTab` layout is a vertical split:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-307]** The `DebugTab` layout is three vertical sections:
- **Type:** Technical
- **Description:** The `DebugTab` layout is three vertical sections:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-308]** The `PoolsTab` layout is a single vertically-scrollable list:
- **Type:** Technical
- **Description:** The `PoolsTab` layout is a single vertically-scrollable list:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-309]** Within `DagView`, stage boxes are laid out in tiers. Each tier is a column of stages at the same dependency depth. Tiers are separated by a fixed 5-column gutter containing the `-->` arrow. If the DAG is wider than the available columns, horizontal scrolling is enabled; scroll position is tracked in `AppState::dag_scroll_x`.
- **Type:** Technical
- **Description:** Within `DagView`, stage boxes are laid out in tiers. Each tier is a column of stages at the same dependency depth. Tiers are separated by a fixed 5-column gutter containing the `-->` arrow. If the DAG is wider than the available columns, horizontal scrolling is enabled; scroll position is tracked in `AppState::dag_scroll_x`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-310]** Stage box fixed width: `41` columns, computed as:
- **Type:** Technical
- **Description:** Stage box fixed width: `41` columns, computed as:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-311]** Elapsed time format: `M:SS` where `M` is total minutes (not bounded to single digit; `119:59` is valid). The field is right-justified in a 5-character field: values ≤ `9:59` are rendered as ` M:SS` (leading space); values ≥ `10:00` fill all 5 chars. Values ≥ `100:00` overflow to 6+ chars; in this case the elapsed field is rendered without padding and the box width expands by the overflow amount.
- **Type:** Technical
- **Description:** Elapsed time format: `M:SS` where `M` is total minutes (not bounded to single digit; `119:59` is valid). The field is right-justified in a 5-character field: values ≤ `9:59` are rendered as ` M:SS` (leading space); values ≥ `10:00` fill all 5 chars. Values ≥ `100:00` overflow to 6+ chars; in this case the elapsed field is rendered without padding and the box width expands by the overflow amount.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-312]** Tier gutter is exactly 5 columns. Columns 1–2 are spaces, column 3 is `-`, column 4 is `-`, column 5 is `>`. This forms the `  -->` pattern (2 leading spaces + `-->`). The `-->` characters are drawn at the vertical midpoint row of the taller of the two adjacent tiers.
- **Type:** Technical
- **Description:** Tier gutter is exactly 5 columns. Columns 1–2 are spaces, column 3 is `-`, column 4 is `-`, column 5 is `>`. This forms the `  -->` pattern (2 leading spaces + `-->`). The `-->` characters are drawn at the vertical midpoint row of the taller of the two adjacent tiers.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-313]** If a stage depends on multiple stages from the previous tier, a single `-->` is drawn from the center of the last dependency in the prior tier to the left edge of this stage box. No multi-line arrows are drawn; fan-in and fan-out are represented by the tier position alone.
- **Type:** Technical
- **Description:** If a stage depends on multiple stages from the previous tier, a single `-->` is drawn from the center of the last dependency in the prior tier to the left edge of this stage box. No multi-line arrows are drawn; fan-in and fan-out are represented by the tier position alone.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-314]** Horizontal scroll is bounded: `dag_scroll_x` ∈ `[0, max(0, total_dag_width − available_cols)]`. Scrolling past either bound is a no-op.
- **Type:** Technical
- **Description:** Horizontal scroll is bounded: `dag_scroll_x` ∈ `[0, max(0, total_dag_width − available_cols)]`. Scrolling past either bound is a no-op.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-315]** `RunDetail` is hidden only when `terminal_cols < 24 + 42 + 1` (pane separator). In this case `RunList` takes full width and `RunDetail` is not rendered. A status bar message `"Terminal too narrow for detail view"` is shown.
- **Type:** Technical
- **Description:** `RunDetail` is hidden only when `terminal_cols < 24 + 42 + 1` (pane separator). In this case `RunList` takes full width and `RunDetail` is not rendered. A status bar message `"Terminal too narrow for detail view"` is shown.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-316]** All user-visible strings in `devs-tui` and `devs-cli` are defined in a dedicated `strings.rs` module within each crate. No string literals for user-visible messages appear inline in widget or command handler code. This is an i18n preparation requirement; English is the only locale at MVP.
- **Type:** Technical
- **Description:** All user-visible strings in `devs-tui` and `devs-cli` are defined in a dedicated `strings.rs` module within each crate. No string literals for user-visible messages appear inline in widget or command handler code. This is an i18n preparation requirement; English is the only locale at MVP.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-317]** Naming convention for string constants:
- **Type:** Technical
- **Description:** Naming convention for string constants:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-318]** Required string constants for `devs-tui/src/strings.rs`:
- **Type:** Technical
- **Description:** Required string constants for `devs-tui/src/strings.rs`:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-319]** Required string constants for `devs-cli/src/strings.rs`:
- **Type:** Technical
- **Description:** Required string constants for `devs-cli/src/strings.rs`:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-320]** A lint test in `devs-tui/tests/` and `devs-cli/tests/` scans all `.rs` source files for string literals matching the patterns `"(not_found|invalid_argument|already_exists|failed_precondition|resource_exhausted|server_unreachable|internal|cancelled|timeout|permission_denied):"` outside of `strings.rs`. Any match fails the test. This ensures that error prefixes are never duplicated inline.
- **Type:** Technical
- **Description:** A lint test in `devs-tui/tests/` and `devs-cli/tests/` scans all `.rs` source files for string literals matching the patterns `"(not_found|invalid_argument|already_exists|failed_precondition|resource_exhausted|server_unreachable|internal|cancelled|timeout|permission_denied):"` outside of `strings.rs`. Any match fails the test. This ensures that error prefixes are never duplicated inline.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-321]** Status label constants (`STATUS_PENDING` through `STATUS_CANCELLED`) MUST each be exactly 4 bytes long. A compile-time assertion enforces this:
- **Type:** Technical
- **Description:** Status label constants (`STATUS_PENDING` through `STATUS_CANCELLED`) MUST each be exactly 4 bytes long. A compile-time assertion enforces this:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-322]** `devs-tui` and `devs-cli` have no static assets (images, fonts, CSS, icons). All visual output is generated programmatically from Rust code at runtime. No `include_bytes!`, `include_str!`, or build-script-copied asset files are used in production code paths.
- **Type:** Technical
- **Description:** `devs-tui` and `devs-cli` have no static assets (images, fonts, CSS, icons). All visual output is generated programmatically from Rust code at runtime. No `include_bytes!`, `include_str!`, or build-script-copied asset files are used in production code paths.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-323]** `devs-mcp-bridge` has no assets. Its single output artefact is the JSON-RPC response written to stdout.
- **Type:** Technical
- **Description:** `devs-mcp-bridge` has no assets. Its single output artefact is the JSON-RPC response written to stdout.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-324]** TUI snapshot test fixtures are stored as plain UTF-8 text files in `crates/devs-tui/tests/snapshots/*.txt`. They are generated and reviewed using the `insta 1.40` crate with the `ratatui::backend::TestBackend` at a fixed terminal size of 200 columns × 50 rows. Pixel comparison is prohibited; only text content is compared.
- **Type:** Technical
- **Description:** TUI snapshot test fixtures are stored as plain UTF-8 text files in `crates/devs-tui/tests/snapshots/*.txt`. They are generated and reviewed using the `insta 1.40` crate with the `ratatui::backend::TestBackend` at a fixed terminal size of **200 columns × 50 rows**. Pixel comparison is prohibited; only text content is compared.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-325]** Snapshot file naming convention:
- **Type:** Technical
- **Description:** Snapshot file naming convention:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-326]** All snapshot tests set `ColorMode::Monochrome` explicitly via `Theme { color_mode: ColorMode::Monochrome, .. Theme::default() }`. No ANSI color codes appear in snapshot files. This ensures snapshot comparison is not sensitive to terminal color capability.
- **Type:** Technical
- **Description:** All snapshot tests set `ColorMode::Monochrome` explicitly via `Theme { color_mode: ColorMode::Monochrome, .. Theme::default() }`. No ANSI color codes appear in snapshot files. This ensures snapshot comparison is not sensitive to terminal color capability.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-327]** Snapshot test terminal size is fixed at 200×50. Tests that exercise minimum-size behavior use a second `TestBackend` constructed with the specific small size (e.g. 79×23 for the "too small" test, 80×24 for the minimum boundary).
- **Type:** Technical
- **Description:** Snapshot test terminal size is fixed at 200×50. Tests that exercise minimum-size behavior use a second `TestBackend` constructed with the specific small size (e.g. 79×23 for the "too small" test, 80×24 for the minimum boundary).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-328]** When a snapshot diverges, `insta` writes the new output to `<snapshot>.txt.new`. The test fails and CI reports the diff. Snapshot updates MUST be reviewed by running `cargo insta review` and explicitly approving each change. Auto-approval (`INSTA_UPDATE=always`) is prohibited in CI; the `CI` environment variable is detected and `INSTA_UPDATE` defaults to `unsaved` (fail on any divergence).
- **Type:** Technical
- **Description:** When a snapshot diverges, `insta` writes the new output to `<snapshot>.txt.new`. The test fails and CI reports the diff. Snapshot updates MUST be reviewed by running `cargo insta review` and explicitly approving each change. Auto-approval (`INSTA_UPDATE=always`) is prohibited in CI; the `CI` environment variable is detected and `INSTA_UPDATE` defaults to `unsaved` (fail on any divergence).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-329]** Snapshot files are committed to source control and MUST be kept up-to-date with the implementation. A diverging snapshot is a test failure, not a warning. The presence of any `.txt.new` file in `crates/devs-tui/tests/snapshots/` at test completion causes `./do test` to exit non-zero.
- **Type:** Technical
- **Description:** Snapshot files are committed to source control and MUST be kept up-to-date with the implementation. A diverging snapshot is a test failure, not a warning. The presence of any `.txt.new` file in `crates/devs-tui/tests/snapshots/` at test completion causes `./do test` to exit non-zero.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-330]** Minimum required snapshot coverage. Each of the following scenarios MUST have at least one snapshot:
- **Type:** Technical
- **Description:** Minimum required snapshot coverage. Each of the following scenarios MUST have at least one snapshot:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-331]** `AppState::test_default()` is a test-only constructor that produces a fully-populated, deterministic `AppState` with no gRPC dependencies. All fields are populated with static test data (fixed UUIDs, fixed timestamps set to `2026-01-01T00:00:00Z`, fixed run slugs). This function MUST NOT be reachable in production builds; it is gated behind `#[cfg(test)]`.
- **Type:** Technical
- **Description:** `AppState::test_default()` is a test-only constructor that produces a fully-populated, deterministic `AppState` with no gRPC dependencies. All fields are populated with static test data (fixed UUIDs, fixed timestamps set to `2026-01-01T00:00:00Z`, fixed run slugs). This function MUST NOT be reachable in production builds; it is gated behind `#[cfg(test)]`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-332]** `buffer_to_string(buffer: &Buffer) -> String` converts a `ratatui::backend::TestBackend` buffer to a plain UTF-8 string, one line per row, padded to exactly `cols` characters with spaces, joined by newlines, with no trailing newline. This is the only permitted method for converting a `TestBackend` buffer to a string for assertion.
- **Type:** Technical
- **Description:** `buffer_to_string(buffer: &Buffer) -> String` converts a `ratatui::backend::TestBackend` buffer to a plain UTF-8 string, one line per row, padded to exactly `cols` characters with spaces, joined by newlines, with no trailing newline. This is the only permitted method for converting a `TestBackend` buffer to a string for assertion.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-333]** All file paths in TUI display and CLI output are normalized to forward-slash notation regardless of the host OS. Backslash paths received from the server are normalized before display. The `~` home-directory shorthand is expanded at use time via `dirs::home_dir()`, not stored.
- **Type:** Technical
- **Description:** All file paths in TUI display and CLI output are normalized to forward-slash notation regardless of the host OS. Backslash paths received from the server are normalized before display. The `~` home-directory shorthand is expanded at use time via `dirs::home_dir()`, not stored.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-334]** Path normalization algorithm applied to every path string before display or storage in CLI/TUI local state:
- **Type:** Technical
- **Description:** Path normalization algorithm applied to every path string before display or storage in CLI/TUI local state:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-335]** `~` expansion rules:
- **Type:** Technical
- **Description:** `~` expansion rules:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-336]** Windows-specific behavior:
- **Type:** Technical
- **Description:** Windows-specific behavior:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-337]** Log content received from the server via `stream_logs` may contain `\r\n` (Windows) or `\n` (Unix) line endings. Before inserting a log line into `LogBuffer`, all `\r\n` sequences are normalized to `\n`. Bare `\r` (carriage return without newline) is preserved verbatim as it may carry terminal control semantics.
- **Type:** Technical
- **Description:** Log content received from the server via `stream_logs` may contain `\r\n` (Windows) or `\n` (Unix) line endings. Before inserting a log line into `LogBuffer`, all `\r\n` sequences are normalized to `\n`. Bare `\r` (carriage return without newline) is preserved verbatim as it may carry terminal control semantics.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-338]** CLI text-mode output (`--format text`) uses the native OS line separator (`\n` on Linux/macOS; `\r\n` on Windows Git Bash). CLI JSON-mode output (`--format json`) always uses `\n` regardless of OS, ensuring consistent pipe behavior.
- **Type:** Technical
- **Description:** CLI text-mode output (`--format text`) uses the native OS line separator (`\n` on Linux/macOS; `\r\n` on Windows Git Bash). CLI JSON-mode output (`--format json`) always uses `\n` regardless of OS, ensuring consistent pipe behavior.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-339]** Snapshot test fixtures always use `\n` line endings, stored in git with `text=auto eol=lf` gitattribute. If a snapshot file contains `\r\n`, `./do test` normalizes it before comparison and emits a `WARN` log indicating the file should be re-committed with LF endings.
- **Type:** Technical
- **Description:** Snapshot test fixtures always use `\n` line endings, stored in git with `text=auto eol=lf` gitattribute. If a snapshot file contains `\r\n`, `./do test` normalizes it before comparison and emits a `WARN` log indicating the file should be re-committed with LF endings.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-340]** The `./do` entrypoint script is written in POSIX `sh` only. No bash-specific syntax (`[[`, `$((`, `local`, function-scoped `local` variables, process substitution `<()`, arrays `arr=()`) is permitted. This ensures identical behavior on Linux (`/bin/sh` = dash), macOS (`/bin/sh` = bash in POSIX mode), and Windows Git Bash.
- **Type:** Technical
- **Description:** The `./do` entrypoint script is written in POSIX `sh` only. No bash-specific syntax (`[[`, `$((`, `local`, function-scoped `local` variables, process substitution `<()`, arrays `arr=()`) is permitted. This ensures identical behavior on Linux (`/bin/sh` = dash), macOS (`/bin/sh` = bash in POSIX mode), and Windows Git Bash.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-341]** Prohibited `./do` patterns:
- **Type:** Technical
- **Description:** Prohibited `./do` patterns:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-342]** `./do` produces identical exit codes and output on Linux, macOS, and Windows Git Bash. This is verified in CI by the three-platform GitLab pipeline (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`). Any `./do` step that exits non-zero on one platform and zero on another is a CI failure.
- **Type:** Technical
- **Description:** `./do` produces identical exit codes and output on Linux, macOS, and Windows Git Bash. This is verified in CI by the three-platform GitLab pipeline (`presubmit-linux`, `presubmit-macos`, `presubmit-windows`). Any `./do` step that exits non-zero on one platform and zero on another is a CI failure.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-343]** -  When `NO_COLOR` is set to any non-empty string, `Theme::from_env()` returns `ColorMode::Monochrome`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-343]** When `NO_COLOR` is set to any non-empty string, `Theme::from_env()` returns `ColorMode::Monochrome`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-344]** -  When `NO_COLOR` is not set or is empty, `Theme::from_env()` returns `ColorMode::Color`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-344]** When `NO_COLOR` is not set or is empty, `Theme::from_env()` returns `ColorMode::Color`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-345]** -  `Theme::stage_status_style(StageStatus::Running)` in `Monochrome` mode returns `Style::default()` (no color). (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-345]** `Theme::stage_status_style(StageStatus::Running)` in `Monochrome` mode returns `Style::default()` (no color). (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-346]** -  `Theme::stage_status_style(StageStatus::Running)` in `Color` mode returns a style with `fg = Color::Yellow`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-346]** `Theme::stage_status_style(StageStatus::Running)` in `Color` mode returns a style with `fg = Color::Yellow`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-347]** -  Every `STATUS_*` constant in `devs-tui/src/strings.rs` has exactly 4 bytes. (compile-time assert)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-347]** Every `STATUS_*` constant in `devs-tui/src/strings.rs` has exactly 4 bytes. (compile-time assert)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-348]** -  No file in `crates/devs-tui/src/` (except `strings.rs`) contains a string literal matching `"(not_found|invalid_argument|failed_precondition):"`; test scans source. (lint test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-348]** No file in `crates/devs-tui/src/` (except `strings.rs`) contains a string literal matching `"(not_found|invalid_argument|failed_precondition):"`; test scans source. (lint test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-349]** -  No file in `crates/devs-cli/src/` (except `strings.rs`) contains a string literal matching the error prefix pattern. (lint test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-349]** No file in `crates/devs-cli/src/` (except `strings.rs`) contains a string literal matching the error prefix pattern. (lint test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-350]** -  Rendering `DashboardTab` with a stage name of 21 characters produces a stage box with the name truncated to 19 chars + `~`. (TUI unit test with snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-350]** Rendering `DashboardTab` with a stage name of 21 characters produces a stage box with the name truncated to 19 chars + `~`. (TUI unit test with snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-351]** -  Rendering `DashboardTab` with a stage name of 20 characters produces a stage box with the name rendered without truncation. (TUI unit test with snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-351]** Rendering `DashboardTab` with a stage name of 20 characters produces a stage box with the name rendered without truncation. (TUI unit test with snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-352]** -  Stage box total width is exactly 41 columns for any stage name ≤ 20 chars and elapsed time ≤ 99 minutes. (TUI unit test, measured via `buffer_to_string`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-352]** Stage box total width is exactly 41 columns for any stage name ≤ 20 chars and elapsed time ≤ 99 minutes. (TUI unit test, measured via `buffer_to_string`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-353]** -  When terminal is 79×50, the TUI renders the "Terminal too small" message and nothing else. (TUI unit test with `TestBackend::new(79, 50)` + snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-353]** When terminal is 79×50, the TUI renders the "Terminal too small" message and nothing else. (TUI unit test with `TestBackend::new(79, 50)` + snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-354]** -  When terminal is 80×24, the TUI renders normal content (no "too small" message). (TUI unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-354]** When terminal is 80×24, the TUI renders normal content (no "too small" message). (TUI unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-355]** -  When terminal is 80×23, the TUI renders the "too small" message. (TUI unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-355]** When terminal is 80×23, the TUI renders the "too small" message. (TUI unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-356]** -  The "too small" message matches `FMT_TERMINAL_TOO_SMALL` with current terminal dimensions substituted. (TUI unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-356]** The "too small" message matches `FMT_TERMINAL_TOO_SMALL` with current terminal dimensions substituted. (TUI unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-357]** -  `RunList` pane minimum width is 24 columns; when terminal is exactly 80 columns wide, `RunList` gets `max(24, floor(80 * 0.30)) = 24` columns. (TUI unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-357]** `RunList` pane minimum width is 24 columns; when terminal is exactly 80 columns wide, `RunList` gets `max(24, floor(80 * 0.30)) = 24` columns. (TUI unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-358]** -  All 11 required snapshots listed in §5.4.2 exist in `crates/devs-tui/tests/snapshots/`. (filesystem check in `./do test`)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-358]** All 11 required snapshots listed in §5.4.2 exist in `crates/devs-tui/tests/snapshots/`. (filesystem check in `./do test`)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-359]** -  No snapshot file contains `\r\n` line endings. (`./do test` checks and fails with WARN if present)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-359]** No snapshot file contains `\r\n` line endings. (`./do test` checks and fails with WARN if present)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-360]** -  Running `./do test` with a diverged snapshot exits non-zero. (CI enforced; `INSTA_UPDATE` is not `always` in CI)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-360]** Running `./do test` with a diverged snapshot exits non-zero. (CI enforced; `INSTA_UPDATE` is not `always` in CI)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-361]** -  `normalize_path_display("C:\\Users\\dev\\project")` returns `"C:/Users/dev/project"`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-361]** `normalize_path_display("C:\\Users\\dev\\project")` returns `"C:/Users/dev/project"`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-362]** -  `normalize_path_display("C:\\Users\\dev\\\\project")` returns `"C:/Users/dev/project"` (double slash collapsed). (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-362]** `normalize_path_display("C:\\Users\\dev\\\\project")` returns `"C:/Users/dev/project"` (double slash collapsed). (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-363]** -  `normalize_path_display("//server/share")` preserves the leading `//`. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-363]** `normalize_path_display("//server/share")` preserves the leading `//`. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-364]** -  CLI JSON-mode output always uses `\n` line endings on all platforms. (CLI E2E test, platform: Windows)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-364]** CLI JSON-mode output always uses `\n` line endings on all platforms. (CLI E2E test, platform: Windows)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-365]** -  `./do` script contains no bash-specific syntax; verified by running it under `dash` or `sh --posix` in CI Linux job. (CI lint step)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-365]** `./do` script contains no bash-specific syntax; verified by running it under `dash` or `sh --posix` in CI Linux job. (CI lint step)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-366]** -  `./do presubmit` exits with identical code on Linux, macOS, and Windows CI jobs for a clean repository. (GitLab CI matrix)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-366]** `./do presubmit` exits with identical code on Linux, macOS, and Windows CI jobs for a clean repository. (GitLab CI matrix)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-367]** -  `buffer_to_string()` returns a string where every line is padded to exactly 200 chars with trailing spaces, and the total line count is exactly 50. (unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-367]** `buffer_to_string()` returns a string where every line is padded to exactly 200 chars with trailing spaces, and the total line count is exactly 50. (unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-368]** -  `AppState::test_default()` is not reachable in `--release` builds; verified by `cargo build --release` completing without error after `#[cfg(test)]` gate. (CI build check)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-368]** `AppState::test_default()` is not reachable in `--release` builds; verified by `cargo build --release` completing without error after `#[cfg(test)]` gate. (CI build check)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-369]** -  In `Monochrome` mode, selected rows use `Modifier::REVERSED` and the cursor `>` character in column 0; no color is applied. (TUI unit test with snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-369]** In `Monochrome` mode, selected rows use `Modifier::REVERSED` and the cursor `>` character in column 0; no color is applied. (TUI unit test with snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-370]** -  The active tab label has `Modifier::BOLD` in both `Color` and `Monochrome` modes. (TUI unit test)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-370]** The active tab label has `Modifier::BOLD` in both `Color` and `Monochrome` modes. (TUI unit test)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-371]** -  Log lines containing ANSI escape sequences (e.g. `\x1b[32m`) are rendered as literal text in `LogView`, not interpreted as colors. (TUI unit test with snapshot)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-371]** Log lines containing ANSI escape sequences (e.g. `\x1b[32m`) are rendered as literal text in `LogView`, not interpreted as colors. (TUI unit test with snapshot)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-372]** -  Elapsed time `0:05` is displayed as ` 0:05` (leading space for 5-char field). Elapsed time `10:00` is displayed as `10:00`. Elapsed time `100:00` causes the stage box to expand by 1 column. (TUI unit tests)
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-372]** Elapsed time `0:05` is displayed as ` 0:05` (leading space for 5-char field). Elapsed time `10:00` is displayed as `10:00`. Elapsed time `100:00` causes the stage box to expand by 1 column. (TUI unit tests)
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-373]** `RunSummary` MUST NOT embed `stage_runs`. `stage_runs` are loaded separately into `AppState::run_details` only when a run is selected.
- **Type:** Technical
- **Description:** `RunSummary` MUST NOT embed `stage_runs`. `stage_runs` are loaded separately into `AppState::run_details` only when a run is selected.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-374]** `dag_layout` is computed once when `RunDetail` is first loaded or when `stage_runs` changes. It is NOT recomputed on every render frame.
- **Type:** Technical
- **Description:** `dag_layout` is computed once when `RunDetail` is first loaded or when `stage_runs` changes. It is NOT recomputed on every render frame.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-375]** `LogBuffer` is indexed in `AppState::log_buffers` by `(run_id: Uuid, stage_name: String)`. When the buffer reaches capacity, the oldest `LogEntry` (lowest sequence number) is evicted. The `total_received` counter still increments so the TUI can display `"Showing last 10000 of N lines"`.
- **Type:** Technical
- **Description:** `LogBuffer` is indexed in `AppState::log_buffers` by `(run_id: Uuid, stage_name: String)`. When the buffer reaches capacity, the oldest `LogEntry` (lowest sequence number) is evicted. The `total_received` counter still increments so the TUI can display `"Showing last 10000 of N lines"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-376]** Tier depth is computed using longest-path-from-root algorithm:
- **Type:** Technical
- **Description:** Tier depth is computed using longest-path-from-root algorithm:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-377]** Each stage box renders as: `[ stage-name | STAT | M:SS ]`
- **Type:** Technical
- **Description:** Each stage box renders as: `[ stage-name | STAT | M:SS ]`
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-378]** Arrows between tiers render as `──►` (3 chars: `-->`  in ASCII: `\x2d\x2d\x3e`). The gutter between tiers is 5 columns wide. Arrows originate from the right edge of a source stage box and terminate at the left edge of the dependent stage box in the next tier.
- **Type:** Technical
- **Description:** Arrows between tiers render as `──►` (3 chars: `-->`  in ASCII: `\x2d\x2d\x3e`). The gutter between tiers is 5 columns wide. Arrows originate from the right edge of a source stage box and terminate at the left edge of the dependent stage box in the next tier.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-379]** `TuiEvent` is the sole input to the `App::handle_event(&mut AppState, TuiEvent)` function. All state mutations go through this function. Render is called exactly once after each `handle_event` call.
- **Type:** Technical
- **Description:** `TuiEvent` is the sole input to the `App::handle_event(&mut AppState, TuiEvent)` function. All state mutations go through this function. Render is called exactly once after each `handle_event` call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-380]** The reconnect backoff schedule for `ConnectionStatus::Reconnecting` is:
- **Type:** Technical
- **Description:** The reconnect backoff schedule for `ConnectionStatus::Reconnecting` is:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-381]** `--input key=value` splits on the FIRST `=` only. `--input expr=a=b` sets input `expr` to the string `"a=b"`. If `key` contains no `=`, the CLI exits with code 4.
- **Type:** Technical
- **Description:** `--input key=value` splits on the FIRST `=` only. `--input expr=a=b` sets input `expr` to the string `"a=b"`. If `key` contains no `=`, the CLI exits with code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-382]** When `--wait` is specified, the CLI subscribes to `RunService.StreamRunEvents` after submission and blocks until the run reaches a terminal state (`Completed`, `Failed`, `Cancelled`). Exit code: 0 for `Completed`, 1 for `Failed`/`Cancelled`.
- **Type:** Technical
- **Description:** When `--wait` is specified, the CLI subscribes to `RunService.StreamRunEvents` after submission and blocks until the run reaches a terminal state (`Completed`, `Failed`, `Cancelled`). Exit code: 0 for `Completed`, 1 for `Failed`/`Cancelled`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-383]** `devs list` returns at most 100 results sorted by `created_at` descending. `stage_runs` are NOT included. `--limit` values above 100 are silently capped to 100.
- **Type:** Technical
- **Description:** `devs list` returns at most 100 results sorted by `created_at` descending. `stage_runs` are NOT included. `--limit` values above 100 are silently capped to 100.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-384]** When `--follow` is used on a stage that has not yet started (status `Pending`, `Waiting`, or `Eligible`), the CLI holds the connection open until the stage starts. If the run is cancelled before the stage starts, the final output is empty and exit code is 1.
- **Type:** Technical
- **Description:** When `--follow` is used on a stage that has not yet started (status `Pending`, `Waiting`, or `Eligible`), the CLI holds the connection open until the stage starts. If the run is cancelled before the stage starts, the final output is empty and exit code is 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-385]** Pausing a run sends `devs:pause\n` to all currently Running stages and holds all Eligible/Waiting stages from dispatch. Stages that are already Completed, Failed, or Cancelled are unaffected.
- **Type:** Technical
- **Description:** Pausing a run sends `devs:pause\n` to all currently Running stages and holds all Eligible/Waiting stages from dispatch. Stages that are already Completed, Failed, or Cancelled are unaffected.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-386]** Resuming a run sends `devs:resume\n` to all Paused stages and releases all held Eligible stages for dispatch.
- **Type:** Technical
- **Description:** Resuming a run sends `devs:resume\n` to all Paused stages and releases all held Eligible stages for dispatch.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-387]** `devs project add` rejects `--weight 0` with exit code 4 and message `invalid_argument: weight must be at least 1`.
- **Type:** Technical
- **Description:** `devs project add` rejects `--weight 0` with exit code 4 and message `invalid_argument: weight must be at least 1`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-388]** The `<path>` argument is resolved to an absolute canonical path on the client before sending to the server. The server stores the canonical path.
- **Type:** Technical
- **Description:** The `<path>` argument is resolved to an absolute canonical path on the client before sending to the server. The server stores the canonical path.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-389]** Without `--force`, if the project has any `Running` or `Paused` runs, the command exits with code 4 and message `failed_precondition: project has N active runs; use --force to remove anyway`.
- **Type:** Technical
- **Description:** Without `--force`, if the project has any `Running` or `Paused` runs, the command exits with code 4 and message `failed_precondition: project has N active runs; use --force to remove anyway`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-390]** `devs security-check` does NOT connect to the server. It reads `devs.toml` and `projects.toml` directly from disk. It MUST NOT require a running `devs` server process.
- **Type:** Technical
- **Description:** `devs security-check` does NOT connect to the server. It reads `devs.toml` and `projects.toml` directly from disk. It MUST NOT require a running `devs` server process.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-391]** -  This check runs at the start of every render call, before any layout computation.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-391]** This check runs at the start of every render call, before any layout computation.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-392]** -  Scroll offset MUST NOT exceed `max(0, total_width - available_columns)`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-392]** Scroll offset MUST NOT exceed `max(0, total_width - available_columns)`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-393]** -  The on-disk log file is never affected by TUI buffer eviction.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-393]** The on-disk log file is never affected by TUI buffer eviction.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-394]** The 35-second reconnect window (30s backoff + 5s grace) is measured as a wall-clock `Instant` captured at the first `StreamDisconnected` event. Each retry attempt checks `now > timeout_deadline` before scheduling the next attempt.
- **Type:** Technical
- **Description:** The 35-second reconnect window (30s backoff + 5s grace) is measured as a wall-clock `Instant` captured at the first `StreamDisconnected` event. Each retry attempt checks `now > timeout_deadline` before scheduling the next attempt.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-395]** When transitioning `Reconnecting → Connected`, the TUI MUST:
- **Type:** Technical
- **Description:** When transitioning `Reconnecting → Connected`, the TUI MUST:
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-396]** The `ConfirmCancel` state requires explicit user confirmation before issuing a destructive gRPC call. A confirmation prompt renders in place of the normal StatusBar content: `"Cancel run 'slug'? [Enter] to confirm, [Esc] to abort"`.
- **Type:** Technical
- **Description:** The `ConfirmCancel` state requires explicit user confirmation before issuing a destructive gRPC call. A confirmation prompt renders in place of the normal StatusBar content: `"Cancel run 'slug'? [Enter] to confirm, [Esc] to abort"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-397]** Pause (`p`) and resume (`r`) keys do NOT require confirmation. They issue the gRPC call immediately on keypress when a run is selected.
- **Type:** Technical
- **Description:** Pause (`p`) and resume (`r`) keys do NOT require confirmation. They issue the gRPC call immediately on keypress when a run is selected.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-398]** If the workflow definition contains a cycle (which should have been rejected at submission, but may occur in a recovered malformed checkpoint), the tier calculation MUST detect the cycle (unreached stages after Kahn's traversal) and render those stages in a final tier labeled `[CYCLE DETECTED]`. The TUI MUST NOT panic.
- **Type:** Technical
- **Description:** If the workflow definition contains a cycle (which should have been rejected at submission, but may occur in a recovered malformed checkpoint), the tier calculation MUST detect the cycle (unreached stages after Kahn's traversal) and render those stages in a final tier labeled `[CYCLE DETECTED]`. The TUI MUST NOT panic.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-399]** The CLI does NOT attempt to reconnect during `devs logs --follow`. A dropped connection is a terminal error (exit code 3). The user must re-run the command to resume streaming.
- **Type:** Technical
- **Description:** The CLI does NOT attempt to reconnect during `devs logs --follow`. A dropped connection is a terminal error (exit code 3). The user must re-run the command to resume streaming.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-400]** The bridge processes requests sequentially (one at a time). It does NOT multiplex concurrent requests. A slow `stream_logs` request blocks subsequent requests until the stream completes. This is consistent with the stdio transport model.
- **Type:** Technical
- **Description:** The bridge processes requests sequentially (one at a time). It does NOT multiplex concurrent requests. A slow `stream_logs` request blocks subsequent requests until the stream completes. This is consistent with the stdio transport model.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-401]** All TUI tests use `ratatui::backend::TestBackend` at a fixed size of 200 columns × 50 rows. Pixel-level rendering comparison is prohibited. Tests compare the rendered text buffer character-by-character using `insta 1.40` snapshot assertions.
- **Type:** Technical
- **Description:** All TUI tests use `ratatui::backend::TestBackend` at a fixed size of 200 columns × 50 rows. Pixel-level rendering comparison is prohibited. Tests compare the rendered text buffer character-by-character using `insta 1.40` snapshot assertions.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-402]** Snapshot files are stored at `crates/devs-tui/tests/snapshots/<test_name>.txt`. Each snapshot is a plain UTF-8 file containing the exact rendered terminal output. Snapshot updates require explicit review (`cargo insta review`); auto-approval is prohibited.
- **Type:** Technical
- **Description:** Snapshot files are stored at `crates/devs-tui/tests/snapshots/<test_name>.txt`. Each snapshot is a plain UTF-8 file containing the exact rendered terminal output. Snapshot updates require explicit review (`cargo insta review`); auto-approval is prohibited.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-403]** Each TUI test sets up an `AppState` programmatically, renders through a `TestBackend`, and asserts on the rendered output. Tests do NOT require a running server. gRPC calls are mocked via `mockall`.
- **Type:** Technical
- **Description:** Each TUI test sets up an `AppState` programmatically, renders through a `TestBackend`, and asserts on the rendered output. Tests do NOT require a running server. gRPC calls are mocked via `mockall`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-404]** TUI tests MUST assert on specific text content, not just "no panic". Every test MUST include at least one `insta::assert_snapshot!` call.
- **Type:** Technical
- **Description:** TUI tests MUST assert on specific text content, not just "no panic". Every test MUST include at least one `insta::assert_snapshot!` call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-405]** Tests for `ConnectionStatus` transitions do not require snapshot tests; they use plain Rust `assert_eq!` assertions on the `AppState::connection_status` field.
- **Type:** Technical
- **Description:** Tests for `ConnectionStatus` transitions do not require snapshot tests; they use plain Rust `assert_eq!` assertions on the `AppState::connection_status` field.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-406]** CLI E2E tests use `assert_cmd 2.0` to invoke the `devs` binary as a subprocess. Tests start a real `devs` server on a random ephemeral port, set `DEVS_DISCOVERY_FILE` to a unique temp path, and exercise all CLI commands via binary invocation.
- **Type:** Technical
- **Description:** CLI E2E tests use `assert_cmd 2.0` to invoke the `devs` binary as a subprocess. Tests start a real `devs` server on a random ephemeral port, set `DEVS_DISCOVERY_FILE` to a unique temp path, and exercise all CLI commands via binary invocation.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-407]** Each CLI E2E test function sets a unique `DEVS_DISCOVERY_FILE` path in a temporary directory to prevent address conflicts between parallel test instances.
- **Type:** Technical
- **Description:** Each CLI E2E test function sets a unique `DEVS_DISCOVERY_FILE` path in a temporary directory to prevent address conflicts between parallel test instances.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-408]** Every CLI E2E test is annotated `// Covers: <REQ-ID>` for at least one requirement in the specification. This annotation feeds `target/traceability.json`.
- **Type:** Technical
- **Description:** Every CLI E2E test is annotated `// Covers: <REQ-ID>` for at least one requirement in the specification. This annotation feeds `target/traceability.json`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-409]** MCP bridge E2E tests invoke `devs-mcp-bridge` as a subprocess, write JSON-RPC requests to its stdin, and read responses from its stdout. A real `devs` server runs in the background.
- **Type:** Technical
- **Description:** MCP bridge E2E tests invoke `devs-mcp-bridge` as a subprocess, write JSON-RPC requests to its stdin, and read responses from its stdout. A real `devs` server runs in the background.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-410]** MCP bridge tests MUST use `POST /mcp/v1/call` via the bridge binary, never via direct HTTP calls. This ensures the E2E coverage gate (QG-005) counts lines executed through the actual bridge code path.
- **Type:** Technical
- **Description:** MCP bridge tests MUST use `POST /mcp/v1/call` via the bridge binary, never via direct HTTP calls. This ensures the E2E coverage gate (QG-005) counts lines executed through the actual bridge code path.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-411]** Coverage gate QG-003 (CLI E2E ≥ 50%) is satisfied exclusively by tests that invoke the `devs` CLI binary as a subprocess via `assert_cmd`. Unit tests of CLI helper functions do NOT count toward this gate.
- **Type:** Technical
- **Description:** Coverage gate QG-003 (CLI E2E ≥ 50%) is satisfied exclusively by tests that invoke the `devs` CLI binary as a subprocess via `assert_cmd`. Unit tests of CLI helper functions do NOT count toward this gate.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-412]** Coverage gate QG-004 (TUI E2E ≥ 50%) is satisfied by tests using `ratatui::backend::TestBackend` that exercise the full `App::handle_event → render` cycle. Tests that call internal TUI widget functions without going through the render cycle do NOT count toward this gate.
- **Type:** Technical
- **Description:** Coverage gate QG-004 (TUI E2E ≥ 50%) is satisfied by tests using `ratatui::backend::TestBackend` that exercise the full `App::handle_event → render` cycle. Tests that call internal TUI widget functions without going through the render cycle do NOT count toward this gate.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-413]** Coverage gate QG-005 (MCP E2E ≥ 50%) is satisfied by tests that POST to `/mcp/v1/call` via the running MCP server. Tests calling MCP tool handler functions directly as Rust functions do NOT count toward this gate.
- **Type:** Technical
- **Description:** Coverage gate QG-005 (MCP E2E ≥ 50%) is satisfied by tests that POST to `/mcp/v1/call` via the running MCP server. Tests calling MCP tool handler functions directly as Rust functions do NOT count toward this gate.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-414]** -  `cargo tree -p devs-tui --edges normal` contains no references to `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-414]** `cargo tree -p devs-tui --edges normal` contains no references to `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-415]** -  `cargo tree -p devs-cli --edges normal` contains no references to `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-415]** `cargo tree -p devs-cli --edges normal` contains no references to `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-416]** -  `cargo tree -p devs-mcp-bridge --edges normal` contains no references to `devs-grpc`, `devs-mcp`, `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-416]** `cargo tree -p devs-mcp-bridge --edges normal` contains no references to `devs-grpc`, `devs-mcp`, `devs-scheduler`, `devs-pool`, `devs-executor`, or `devs-adapters`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-417]** -  When `AppState::terminal_size` is `(79, 24)`, the rendered output is exactly `"Terminal too small: 80x24 minimum required (current: 79x24)"` and no other content.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-417]** When `AppState::terminal_size` is `(79, 24)`, the rendered output is exactly `"Terminal too small: 80x24 minimum required (current: 79x24)"` and no other content.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-418]** -  When `AppState::terminal_size` is `(80, 23)`, the rendered output contains `"current: 80x23"`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-418]** When `AppState::terminal_size` is `(80, 23)`, the rendered output contains `"current: 80x23"`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-419]** -  Stage name `"a-very-long-stage-name-exceeding-twenty"` renders as `"a-very-long-stage-name~"` in `DagView`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-419]** Stage name `"a-very-long-stage-name-exceeding-twenty"` renders as `"a-very-long-stage-name~"` in `DagView`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-420]** -  A stage with `StageStatus::Running` renders with the label `"RUN "` (4 chars, trailing space) in `DagView`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-420]** A stage with `StageStatus::Running` renders with the label `"RUN "` (4 chars, trailing space) in `DagView`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-421]** -  All 9 `StageStatus` variants render as the corresponding 4-char label from the normative table in §2.1.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-421]** All 9 `StageStatus` variants render as the corresponding 4-char label from the normative table in §2.1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-422]** -  `DagView` uses only ASCII characters in the range U+0020–U+007E for structural elements (arrows, borders, box characters).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-422]** `DagView` uses only ASCII characters in the range U+0020–U+007E for structural elements (arrows, borders, box characters).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-423]** -  When `NO_COLOR` environment variable is set to any non-empty value, no ANSI escape sequences (`\x1b[`) appear in the rendered output.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-423]** When `NO_COLOR` environment variable is set to any non-empty value, no ANSI escape sequences (`\x1b[`) appear in the rendered output.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-424]** -  The `HelpOverlay` renders when `?` is pressed and is dismissed by any subsequent keypress.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-424]** The `HelpOverlay` renders when `?` is pressed and is dismissed by any subsequent keypress.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-425]** -  `StatusBar` shows exactly `"CONNECTED"` when `ConnectionStatus::Connected`, `"RECONNECTING"` when `ConnectionStatus::Reconnecting`, and `"DISCONNECTED"` when `ConnectionStatus::Disconnected`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-425]** `StatusBar` shows exactly `"CONNECTED"` when `ConnectionStatus::Connected`, `"RECONNECTING"` when `ConnectionStatus::Reconnecting`, and `"DISCONNECTED"` when `ConnectionStatus::Disconnected`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-426]** -  When `AppState::runs` is empty, `RunList` renders the empty-state message.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-426]** When `AppState::runs` is empty, `RunList` renders the empty-state message.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-427]** -  `LogBuffer::push` on a full buffer (10,000 entries) evicts the entry with the lowest sequence number and increments `total_received`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-427]** `LogBuffer::push` on a full buffer (10,000 entries) evicts the entry with the lowest sequence number and increments `total_received`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-428]** -  `LogPane` renders the truncation message `"[Log truncated"` when `LogBuffer::truncated == true`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-428]** `LogPane` renders the truncation message `"[Log truncated"` when `LogBuffer::truncated == true`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-429]** -  DAG stage boxes render with the format `[ name | STAT | M:SS ]`, and the elapsed column renders `"--:--"` when `started_at` is `None`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-429]** DAG stage boxes render with the format `[ name | STAT | M:SS ]`, and the elapsed column renders `"--:--"` when `started_at` is `None`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-430]** -  Two stages at the same tier depth are rendered in the same column of the DAG.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-430]** Two stages at the same tier depth are rendered in the same column of the DAG.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-431]** -  When `DagLayout::total_width > available_columns`, a scroll indicator `"< scroll >"` is visible in the DAG pane.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-431]** When `DagLayout::total_width > available_columns`, a scroll indicator `"< scroll >"` is visible in the DAG pane.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-432]** -  TUI re-renders within 50ms of receiving a `RunEvent` from the gRPC stream (tested with a mock event injected into the channel).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-432]** TUI re-renders within 50ms of receiving a `RunEvent` from the gRPC stream (tested with a mock event injected into the channel).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-433]** -  All TUI snapshot tests pass with `cargo insta test` on a clean checkout with no pending snapshot updates.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-433]** All TUI snapshot tests pass with `cargo insta test` on a clean checkout with no pending snapshot updates.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-434]** -  After `StreamDisconnected`, `ConnectionStatus` transitions to `Reconnecting`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-434]** After `StreamDisconnected`, `ConnectionStatus` transitions to `Reconnecting`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-435]** -  After 35 seconds of cumulative reconnect time without success, the TUI exits with code 1.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-435]** After 35 seconds of cumulative reconnect time without success, the TUI exits with code 1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-436]** -  On successful reconnect, `ConnectionStatus` transitions to `Connected` and the `"[Reconnecting]"` banner disappears.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-436]** On successful reconnect, `ConnectionStatus` transitions to `Connected` and the `"[Reconnecting]"` banner disappears.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-437]** -  Reconnect backoff follows the schedule 1s→2s→4s→8s→16s→30s(cap), verifiable from `ConnectionStatus::Reconnecting::next_retry_at` values.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-437]** Reconnect backoff follows the schedule 1s→2s→4s→8s→16s→30s(cap), verifiable from `ConnectionStatus::Reconnecting::next_retry_at` values.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-438]** -  Pressing `q` exits the TUI with code 0 regardless of connection status.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-438]** Pressing `q` exits the TUI with code 0 regardless of connection status.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-439]** -  `devs status <unknown-id>` exits with code 2.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-439]** `devs status <unknown-id>` exits with code 2.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-440]** -  `devs submit` with server not running exits with code 3.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-440]** `devs submit` with server not running exits with code 3.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-441]** -  `devs submit` with missing required input exits with code 4.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-441]** `devs submit` with missing required input exits with code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-442]** -  `devs submit` with duplicate run name exits with code 4.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-442]** `devs submit` with duplicate run name exits with code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-443]** -  `devs cancel` on a completed run exits with code 4.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-443]** `devs cancel` on a completed run exits with code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-444]** -  A successful `devs submit` exits with code 0.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-444]** A successful `devs submit` exits with code 0.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-445]** -  `devs logs --follow` exits code 0 when the monitored run completes.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-445]** `devs logs --follow` exits code 0 when the monitored run completes.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-446]** -  `devs logs --follow` exits code 1 when the monitored run fails.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-446]** `devs logs --follow` exits code 1 when the monitored run fails.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-447]** -  `devs list --format json` produces valid JSON parseable as `{"runs": [...], "total": n}`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-447]** `devs list --format json` produces valid JSON parseable as `{"runs": [...], "total": n}`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-448]** -  `devs status --format json` produces valid JSON parseable as `RunStatusOutput`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-448]** `devs status --format json` produces valid JSON parseable as `RunStatusOutput`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-449]** -  `devs submit --format json` on failure produces `{"error": "<prefix>: <detail>", "code": n}` to stdout (not stderr).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-449]** `devs submit --format json` on failure produces `{"error": "<prefix>: <detail>", "code": n}` to stdout (not stderr).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-450]** -  In `--format json` mode, stderr is empty for all commands (errors go to stdout as JSON).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-450]** In `--format json` mode, stderr is empty for all commands (errors go to stdout as JSON).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-451]** -  Error messages in all modes begin with one of the 10 machine-stable prefixes from §5.1.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-451]** Error messages in all modes begin with one of the 10 machine-stable prefixes from §5.1.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-452]** -  `devs submit --input expr=a=b` sets input key `expr` to value `"a=b"` (splits on first `=` only).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-452]** `devs submit --input expr=a=b` sets input key `expr` to value `"a=b"` (splits on first `=` only).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-453]** -  `devs submit --input badvalue` (no `=`) exits with code 4.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-453]** `devs submit --input badvalue` (no `=`) exits with code 4.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-454]** -  Server discovery uses `--server` flag before `DEVS_SERVER` env before discovery file.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-454]** Server discovery uses `--server` flag before `DEVS_SERVER` env before discovery file.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-455]** -  `devs security-check` exits 0 with default config when all 7 checks pass.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-455]** `devs security-check` exits 0 with default config when all 7 checks pass.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-456]** -  `devs security-check` exits 1 when any check produces a warning.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-456]** `devs security-check` exits 1 when any check produces a warning.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-457]** -  `devs security-check` operates without a running server (does NOT connect to gRPC).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-457]** `devs security-check` operates without a running server (does NOT connect to gRPC).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-458]** -  `devs project add --weight 0` exits with code 4 and error `invalid_argument: weight must be at least 1`.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-458]** `devs project add --weight 0` exits with code 4 and error `invalid_argument: weight must be at least 1`.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-459]** -  `devs-mcp-bridge` forwards a valid `list_runs` JSON-RPC request and returns a valid JSON response on stdout.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-459]** `devs-mcp-bridge` forwards a valid `list_runs` JSON-RPC request and returns a valid JSON response on stdout.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-460]** -  Sending non-JSON to bridge stdin returns `{"result":null,"error":"invalid_argument: request is not valid JSON"}` and the bridge continues processing subsequent lines.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-460]** Sending non-JSON to bridge stdin returns `{"result":null,"error":"invalid_argument: request is not valid JSON"}` and the bridge continues processing subsequent lines.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-461]** -  When discovery file is absent, bridge exits with code 1 and `"fatal":true` in output.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-461]** When discovery file is absent, bridge exits with code 1 and `"fatal":true` in output.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-462]** -  Bridge does NOT create any TCP listener (verified by checking open file descriptors after startup).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-462]** Bridge does NOT create any TCP listener (verified by checking open file descriptors after startup).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-463]** -  `stream_logs follow:true` chunked response is forwarded line-by-line (first chunk appears on stdout before stream ends).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-463]** `stream_logs follow:true` chunked response is forwarded line-by-line (first chunk appears on stdout before stream ends).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-464]** -  `devs list` produces identical exit codes on Linux, macOS, and Windows Git Bash CI runners.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-464]** `devs list` produces identical exit codes on Linux, macOS, and Windows Git Bash CI runners.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-465]** -  `./do` script passes `sh -n` (POSIX `sh` syntax check) with no errors.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-465]** `./do` script passes `sh -n` (POSIX `sh` syntax check) with no errors.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-466]** -  All file paths in CLI output use forward-slash notation on all platforms.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-466]** All file paths in CLI output use forward-slash notation on all platforms.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-467]** -  No string literal for a user-visible message appears outside of `strings.rs` in `devs-tui` or `devs-cli` (enforced by a `grep` in `./do lint`).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-467]** No string literal for a user-visible message appears outside of `strings.rs` in `devs-tui` or `devs-cli` (enforced by a `grep` in `./do lint`).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-468]** -  `cargo test -p devs-tui` completes without any snapshot mismatches (no `.new` snapshot files remain after the run).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-468]** `cargo test -p devs-tui` completes without any snapshot mismatches (no `.new` snapshot files remain after the run).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-469]** -  TUI test binary does not make any real network connections (verified by `mockall`-based gRPC mocking).
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-469]** TUI test binary does not make any real network connections (verified by `mockall`-based gRPC mocking).
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-470]** -  Pressing `c` in `DashboardTab` renders a confirmation prompt before issuing `CancelRun` gRPC call.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-470]** Pressing `c` in `DashboardTab` renders a confirmation prompt before issuing `CancelRun` gRPC call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-471]** -  Pressing `Esc` during the confirmation prompt cancels the action and returns to normal view without issuing any gRPC call.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-471]** Pressing `Esc` during the confirmation prompt cancels the action and returns to normal view without issuing any gRPC call.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-472]** -  `./do test` generates `target/traceability.json` with `overall_passed: true` when all AC-UI-NNN criteria have at least one covering test.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-472]** `./do test` generates `target/traceability.json` with `overall_passed: true` when all AC-UI-NNN criteria have at least one covering test.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

### **[6_UI_UX_ARCHITECTURE-REQ-473]** -  `./do coverage` produces a QG-003 gate with `actual_pct ≥ 50.0` computed exclusively from CLI E2E tests invoked via binary subprocess.
- **Type:** Technical
- **Description:** - **[6_UI_UX_ARCHITECTURE-REQ-473]** `./do coverage` produces a QG-003 gate with `actual_pct ≥ 50.0` computed exclusively from CLI E2E tests invoked via binary subprocess.
- **Source:** UI/UX Architecture (docs/plan/specs/6_ui_ux_architecture.md)
- **Dependencies:** None

