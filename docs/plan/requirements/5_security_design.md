# Requirements: Security Design

**Extracted From:** `docs/plan/specs/5_security_design.md`
**Document ID:** 5_SECURITY_DESIGN
**Status:** Authoritative

---

### **[5_SECURITY_DESIGN-REQ-001]** The `devs` server is explicitly designed for **local or trusted-network deployment only** at MVP. ([SEC-001])
- **Type:** Security
- **Description:** The `devs` server is explicitly designed for **local or trusted-network deployment only** at MVP. No client authentication is enforced on the gRPC or MCP interfaces. Any process that can reach the gRPC port (`:7890`) or MCP port (`:7891`) can read and control all workflow runs and internal state. Operators MUST restrict network access to these ports via OS firewall rules or network segmentation. Binding to `127.0.0.1` (loopback) is the default and MUST NOT be changed to `0.0.0.0` in untrusted network environments.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-002]** Post-MVP client authentication will be implemented as a gRPC interceptor using mutual TLS (mTLS) or bearer tokens without requiring changes to service logic. ([SEC-002])
- **Type:** Security
- **Description:** Post-MVP client authentication will be implemented as a gRPC interceptor using mutual TLS (mTLS) or bearer tokens without requiring changes to service logic. The current design is forward-compatible with this addition.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-003]** The highest-severity attack vector. ([SEC-003])
- **Type:** Security
- **Description:** The highest-severity attack vector. Stage prompts accept `{{template}}` variables resolved from prior stage outputs (stdout, stderr, structured JSON fields). A malicious or compromised upstream stage can inject instructions into a downstream agent's prompt, causing it to exfiltrate secrets, modify source code, or call unintended MCP tools. This is an inherent risk of chaining AI agent outputs.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-004]** Agent CLI API keys (`CLAUDE_API_KEY`, `GEMINI_API_KEY`, etc. ([SEC-004])
- **Type:** Security
- **Description:** Agent CLI API keys (`CLAUDE_API_KEY`, `GEMINI_API_KEY`, etc.) are high-value secrets stored in the server process environment or in `devs.toml`. Attack paths include: log scraping (keys inadvertently logged), checkpoint file inclusion (keys written to `.devs/`), environment inheritance to agent subprocesses (intentional but must be controlled), and TOML file exfiltration.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-005]** Spawned agent subprocesses execute with the same OS user privileges as the `devs` server. ([SEC-005])
- **Type:** Security
- **Description:** Spawned agent subprocesses execute with the same OS user privileges as the `devs` server. A compromised agent process (e.g., via a malicious model response directing the CLI tool to execute shell commands) can access the full filesystem and network available to the server process. The execution environment (`tempdir`, `docker`, `remote`) provides the primary isolation layer.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-006]** The `{{stage. ([SEC-006])
- **Type:** Security
- **Description:** The `{{stage.<name>.output.<field>}}` template resolution reads JSON fields from agent-produced `.devs_output.json`. A malicious agent could craft structured output containing `{{...}}` sequences that are then re-expanded in a subsequent stage's prompt resolution, creating a second-order injection. Template expansion MUST be single-pass with no recursive re-expansion.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-007]** The `prompt_file` stage field accepts a filesystem path resolved at execution time. ([SEC-007])
- **Type:** Security
- **Description:** The `prompt_file` stage field accepts a filesystem path resolved at execution time. If user-provided paths (via workflow inputs) are interpolated into `prompt_file` values without validation, an attacker-controlled input could read arbitrary files on the server (e.g., `../../.ssh/id_rsa`, `devs.toml`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-008]** Checkpoint data written to the project's git repository (`. ([SEC-008])
- **Type:** Security
- **Description:** Checkpoint data written to the project's git repository (`.devs/` directory, checkpoint branch) is under partial control of agent subprocesses (via auto-collect commits). A malicious agent could write crafted checkpoint files that corrupt state on recovery, trigger arbitrary state transitions, or smuggle data into the repository.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-009]** Outbound webhook URLs are configured per-project. ([SEC-009])
- **Type:** Security
- **Description:** Outbound webhook URLs are configured per-project. An attacker who can register or modify project configuration can direct `devs` to send POST requests to internal network addresses (`http://169.254.169.254/`, `http://localhost/`, RFC-1918 ranges), potentially accessing internal services or cloud metadata endpoints.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-010]** Storing API keys directly in `devs. ([SEC-010])
- **Type:** Security
- **Description:** Storing API keys directly in `devs.toml` under `[credentials]` is a documented anti-pattern. The file may be committed to source control, accessible to all local users, or readable by agent processes with filesystem MCP access. The Filesystem MCP explicitly permits read access to configuration files in the workspace unless restricted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-011]** Agent stdout and stderr are stored verbatim in `. ([SEC-011])
- **Type:** Security
- **Description:** Agent stdout and stderr are stored verbatim in `.devs/logs/`. Malformed ANSI escape sequences or newline injection in log content can corrupt log display in the TUI or downstream log consumers. Structured log injection (crafted JSON log lines) can confuse log aggregation tools.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-012]** The `docker` execution environment respects the `DOCKER_HOST` environment variable, and the `remote` environment uses `ssh2` for connections. ([SEC-012])
- **Type:** Security
- **Description:** The `docker` execution environment respects the `DOCKER_HOST` environment variable, and the `remote` environment uses `ssh2` for connections. A misconfigured `DOCKER_HOST` pointing to a remote daemon, or SSH credentials to a shared host, expands the blast radius of a compromised stage to that external system.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-013]** The MCP server exposes full internal state including stage outputs, structured data, workflow definitions, pool configurations, and checkpoint records. ([SEC-013])
- **Type:** Security
- **Description:** The MCP server exposes full internal state including stage outputs, structured data, workflow definitions, pool configurations, and checkpoint records. Any process reaching `:7891` can read all secrets that flow through stage outputs (e.g., an agent printing an API key to stdout for debugging). This is an accepted MVP risk; operators must ensure network isolation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-014]** `devs` is developer tooling, not a consumer-facing service. ([SEC-014])
- **Type:** Security
- **Description:** `devs` is developer tooling, not a consumer-facing service. At MVP, no PII is processed by `devs` itself (PII may flow through agent outputs depending on user workloads — outside scope). The primary compliance obligations are:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-015]** At MVP, neither the gRPC service nor the MCP HTTP server performs client authentication. ([SEC-015])
- **Type:** Security
- **Description:** At MVP, neither the gRPC service nor the MCP HTTP server performs client authentication. The access control model is network-perimeter-based:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-016]** The `devs-mcp-bridge` (stdio→MCP proxy) inherits the trust level of the process that spawns it. ([SEC-016])
- **Type:** Security
- **Description:** The `devs-mcp-bridge` (stdio→MCP proxy) inherits the trust level of the process that spawns it. When spawned by an orchestrated agent via `DEVS_MCP_ADDR`, the bridge MUST NOT require additional authentication beyond network reachability. This is an accepted design constraint of the Glass-Box architecture.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-017]** ) | MEDIUM — not enforced cryptographically at MVP | ([SEC-017])
- **Type:** Security
- **Description:** ) | MEDIUM — not enforced cryptographically at MVP |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-018]** The MCP server MUST NOT enforce tool-level restrictions based on caller identity at MVP (documented in `[FEAT-BR-011]`). ([SEC-018])
- **Type:** Security
- **Description:** The MCP server MUST NOT enforce tool-level restrictions based on caller identity at MVP (documented in `[FEAT-BR-011]`). Tool-level authorization is a post-MVP capability. Any process that reaches `:7891` over the network can invoke all control tools. Operators must ensure network isolation is in place.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-019]** ); `devs. ([SEC-019])
- **Type:** Security
- **Description:** ); `devs.toml` outside workspace root | LOW — workspace boundary blocks access |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-020]** ) | LOW — enforced at multiple layers | ([SEC-020])
- **Type:** Security
- **Description:** ) | LOW — enforced at multiple layers |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-021]** Outbound webhooks carrying a configured `secret` MUST be signed using HMAC-SHA256. ([SEC-021])
- **Type:** Security
- **Description:** Outbound webhooks carrying a configured `secret` MUST be signed using HMAC-SHA256. The signature is computed over the raw request body bytes (UTF-8 encoded JSON payload) using the secret as the key. The signature header format is:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-022]** The following authentication architecture is reserved for post-MVP implementation. ([SEC-022])
- **Type:** Security
- **Description:** The following authentication architecture is reserved for post-MVP implementation. The MVP codebase is designed to be forward-compatible with these additions: no service handler signatures change, no wire format changes are required, and the additions are isolated to interceptor/middleware layers.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-023]** API keys and tokens MUST be supplied to the server via OS environment variables. ([SEC-023])
- **Type:** Security
- **Description:** API keys and tokens MUST be supplied to the server via OS environment variables. This is the **mandatory preferred mechanism**. Environment variables are not persisted to disk by the Rust process and are not inherited by child processes beyond what is explicitly configured.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-024]** When credentials are stored in `devs. ([SEC-024])
- **Type:** Security
- **Description:** When credentials are stored in `devs.toml` (fallback mechanism), the following controls apply:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-025]** Credentials MUST NEVER appear in: ([SEC-025])
- **Type:** Security
- **Description:** Credentials MUST NEVER appear in:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-026]** The environment variable inheritance chain for agent subprocesses is: server env → workflow default_env → stage env (later overrides earlier). ([SEC-026])
- **Type:** Security
- **Description:** The environment variable inheritance chain for agent subprocesses is: server env → workflow default_env → stage env (later overrides earlier). The following variables are explicitly **stripped** from the agent environment before subprocess spawn, regardless of the inheritance chain: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`. Credential variables (`*_API_KEY`, `*_TOKEN`) are inherited by agents unless explicitly overridden — this is intentional, as agents require their own API keys.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-027]** The git checkpoint store at `~/. ([SEC-027])
- **Type:** Security
- **Description:** The git checkpoint store at `~/.config/devs/state-repos/<project-id>.git` (bare clone) and project `.devs/` directory are not encrypted at rest. Stage outputs (stdout/stderr) committed to the checkpoint branch may contain sensitive data printed by agent processes. Operators requiring encryption at rest MUST use full-disk encryption (e.g., LUKS, FileVault, BitLocker) at the OS level.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-028]** The checkpoint branch (default: `devs/state`) SHOULD be a separate, dedicated branch isolated from the main project branch to reduce the risk of sensitive checkpoint data appearing in normal code review workflows. ([SEC-028])
- **Type:** Security
- **Description:** The checkpoint branch (default: `devs/state`) SHOULD be a separate, dedicated branch isolated from the main project branch to reduce the risk of sensitive checkpoint data appearing in normal code review workflows. The `devs project add` command MUST default to `devs/state` and document this rationale.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-029]** Prompt files written to disk for file-based agent adapters are stored at `<working_dir>/. ([SEC-029])
- **Type:** Security
- **Description:** Prompt files written to disk for file-based agent adapters are stored at `<working_dir>/.devs_prompt_<uuid>`. These files MUST be:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-030]** The server address discovery file at `~/. ([SEC-030])
- **Type:** Security
- **Description:** The server address discovery file at `~/.config/devs/server.addr` (or `DEVS_DISCOVERY_FILE`) contains the gRPC listen address in plaintext. This file MUST be created with mode `0600` on Unix systems and deleted on clean shutdown (`SIGTERM`) per **[2_TAS-REQ-002a]**.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-031]** ). ([SEC-031])
- **Type:** Security
- **Description:** ).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-032]** Cipher suite restrictions (rustls enforced defaults, no configuration override allowed): ([SEC-032])
- **Type:** Security
- **Description:** Cipher suite restrictions (rustls enforced defaults, no configuration override allowed):
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-033]** ) | ([SEC-033])
- **Type:** Security
- **Description:** ) |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-034]** The MCP HTTP server MUST apply the same TLS configuration as the gRPC server when operating over non-loopback interfaces. ([SEC-034])
- **Type:** Security
- **Description:** The MCP HTTP server MUST apply the same TLS configuration as the gRPC server when operating over non-loopback interfaces. Specifically:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-035]** Outbound webhook delivery MUST use HTTPS for all non-loopback URLs. ([SEC-035])
- **Type:** Security
- **Description:** Outbound webhook delivery MUST use HTTPS for all non-loopback URLs. HTTP (non-TLS) webhook targets MUST log a `WARN` on every delivery attempt: `"SECURITY WARNING: Delivering webhook to non-TLS URL '<url>'. Payload may be intercepted."`. HTTP webhook targets are permitted at MVP to support local testing (e.g., `http://localhost:8080/hook`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-036]** Webhook SSRF mitigation: Before delivering any webhook, the resolved IP addresses of the target URL's hostname MUST be checked against a blocklist. ([SEC-036])
- **Type:** Security
- **Description:** Webhook SSRF mitigation: Before delivering any webhook, the resolved IP addresses of the target URL's hostname MUST be checked against a blocklist. The following IP ranges MUST be rejected with a `WARN` log and no delivery attempt:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-037]** Webhook URL length MUST NOT exceed 2048 characters. ([SEC-037])
- **Type:** Security
- **Description:** Webhook URL length MUST NOT exceed 2048 characters. URLs with non-`http`/`https` schemes (e.g., `file://`, `ftp://`, `gopher://`) MUST be rejected at configuration validation time before any delivery.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-038]** SSH remote execution (via `ssh2` crate) MUST: ([SEC-038])
- **Type:** Security
- **Description:** SSH remote execution (via `ssh2` crate) MUST:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-039]** Docker remote execution MUST validate the `DOCKER_HOST` TLS certificate when using a TCP-based Docker daemon (`tcp://` or `https://` scheme). ([SEC-039])
- **Type:** Security
- **Description:** Docker remote execution MUST validate the `DOCKER_HOST` TLS certificate when using a TCP-based Docker daemon (`tcp://` or `https://` scheme). Unix socket connections (`unix://`) are permitted for local Docker daemons without TLS. Unverified TLS connections to remote Docker daemons (`DOCKER_TLS_VERIFY=0`) MUST log a `WARN` and are not permitted in production configurations.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-040]** (template sanitization) and **[SEC-042]** (output size limits). ([SEC-040])
- **Type:** Security
- **Description:** (template sanitization) and **[SEC-042]** (output size limits).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-041]** Template variable names that reference stages not in the current stage's transitive `depends_on` closure MUST cause an immediate stage failure with `TemplateError::UnreachableStage` before any agent spawn. ([SEC-041])
- **Type:** Security
- **Description:** Template variable names that reference stages not in the current stage's transitive `depends_on` closure MUST cause an immediate stage failure with `TemplateError::UnreachableStage` before any agent spawn. This prevents lateral movement across the DAG via template references.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-042]** (output size limits). ([SEC-042])
- **Type:** Security
- **Description:** (output size limits).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-043]** ); 10KiB truncation (**[SEC-042]**) | MEDIUM — inherent to AI chaining; human review recommended | ([SEC-043])
- **Type:** Security
- **Description:** ); 10KiB truncation (**[SEC-042]**) | MEDIUM — inherent to AI chaining; human review recommended |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-044]** Agent subprocess invocation MUST use `tokio::process::Command` with separate argument arrays — never shell string interpolation. ([SEC-044])
- **Type:** Security
- **Description:** Agent subprocess invocation MUST use `tokio::process::Command` with separate argument arrays — never shell string interpolation. The prompt string, prompt file path, and all flags MUST be passed as discrete `arg()` entries, not concatenated into a single shell command string. This prevents shell metacharacter injection (`; rm -rf`, `$(...)`, backtick execution) from appearing in prompts or file paths.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-045]** Prompt files written to disk for file-based adapters (opencode, copilot) MUST use a generated UUID filename (`<working_dir>/. ([SEC-045])
- **Type:** Security
- **Description:** Prompt files written to disk for file-based adapters (opencode, copilot) MUST use a generated UUID filename (`<working_dir>/.devs_prompt_<uuid4>`) — not any user-provided or stage-derived filename. The path passed to the agent adapter is the generated path, never a user-controlled value.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-046]** Environment variable keys injected into agent processes MUST match the regex `[A-Z_][A-Z0-9_]{0,127}` (enforced by the `EnvKey` type in `devs-core`). ([SEC-046])
- **Type:** Security
- **Description:** Environment variable keys injected into agent processes MUST match the regex `[A-Z_][A-Z0-9_]{0,127}` (enforced by the `EnvKey` type in `devs-core`). This prevents injection of keys with shell-special characters. Environment variable values are passed verbatim with no escaping; implementors must ensure no shell interpolation occurs in the subprocess spawn path.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-047]** , **[SEC-020]**) | LOW — enforced at multiple layers | ([SEC-047])
- **Type:** Security
- **Description:** , **[SEC-020]**) | LOW — enforced at multiple layers |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-048]** The `prompt_file` field in stage definitions is resolved at execution time relative to the project's workflow search directories. ([SEC-048])
- **Type:** Security
- **Description:** The `prompt_file` field in stage definitions is resolved at execution time relative to the project's workflow search directories. Path components that are absolute (begin with `/` or a drive letter on Windows) or contain `..` segments MUST be rejected at workflow validation time, not only at execution time.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-049]** Structured output parsing (`. ([SEC-049])
- **Type:** Security
- **Description:** Structured output parsing (`.devs_output.json` and stdout JSON) MUST use `serde_json`'s safe deserialization with a depth limit of 128 nested levels. JSON with deeper nesting MUST cause stage failure with `structured_output_parse_error`. This prevents stack overflow attacks via deeply nested JSON.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-050]** The `"success"` field in `. ([SEC-050])
- **Type:** Security
- **Description:** The `"success"` field in `.devs_output.json` MUST be a JSON boolean literal. String values (`"true"`, `"false"`, `"1"`, `"0"`) and numeric values (`1`, `0`) MUST cause stage failure with `Failed` status and log message `"structured_output: 'success' must be a boolean; got <actual_type>"`. This prevents type confusion attacks.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-051]** MVP access control is network-perimeter-based (see §2. ([SEC-051])
- **Type:** Security
- **Description:** MVP access control is network-perimeter-based (see §2.1). Within the network perimeter, all authenticated connections have equivalent access. There is no role-based or resource-based access control on gRPC or MCP endpoints at MVP. This is a documented and accepted risk. Operators MUST restrict network access.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-052]** The Filesystem MCP enforces workspace-boundary access control (see **[SEC-019]** and **[SEC-020]**). ([SEC-052])
- **Type:** Security
- **Description:** The Filesystem MCP enforces workspace-boundary access control (see **[SEC-019]** and **[SEC-020]**). This is the only enforced access control policy at MVP.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-053]** The following cryptographic primitives are **prohibited** in all `devs` crates: ([SEC-053])
- **Type:** Security
- **Description:** The following cryptographic primitives are **prohibited** in all `devs` crates:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-054]** ). ([SEC-054])
- **Type:** Security
- **Description:** ).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-055]** UUID generation (run IDs, delivery IDs, session IDs) MUST use UUID v4 (random). ([SEC-055])
- **Type:** Security
- **Description:** UUID generation (run IDs, delivery IDs, session IDs) MUST use UUID v4 (random). The UUID `v4` feature of the `uuid` crate uses the `getrandom` crate, which sources entropy from the OS CSPRNG. No UUID generation in security-relevant contexts (session IDs, delivery IDs) may use sequential or timestamp-based UUIDs (v1, v7).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-056]** All injection controls are defined in §4. ([SEC-056])
- **Type:** Security
- **Description:** All injection controls are defined in §4.1 above. Key summary:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-057]** The Glass-Box MCP architecture is a deliberate design choice that trades confidentiality for observability. ([SEC-057])
- **Type:** Security
- **Description:** The Glass-Box MCP architecture is a deliberate design choice that trades confidentiality for observability. This is acceptable for the primary persona (sole developer using trusted AI agents on a local machine). Operators hosting `devs` for multiple users or in shared environments must treat this as a high-risk configuration at MVP and defer deployment until post-MVP authentication is available.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-058]** The `devs` server MUST perform the following security checks on startup and log `WARN` for each viol ([SEC-058])
- **Type:** Security
- **Description:** The `devs` server MUST perform the following security checks on startup and log `WARN` for each violated condition:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-060]** The `. ([SEC-060])
- **Type:** Security
- **Description:** The `./do lint` script MUST include execution of `cargo audit --deny warnings` against the RustSec Advisory Database. Any `cargo audit` finding at `WARN` or higher severity MUST cause `./do lint` to exit non-zero, blocking `./do presubmit`. The `cargo audit` tool MUST be installed by `./do setup` (pinned to a specific version in the authoritative dependency table).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-061]** The GitLab CI pipeline MUST run `cargo audit` as a separate job that runs on every commit, independent of the main `presubmit` job. ([SEC-061])
- **Type:** Security
- **Description:** The GitLab CI pipeline MUST run `cargo audit` as a separate job that runs on every commit, independent of the main `presubmit` job. This job MUST fail the pipeline on any new advisory, even if `./do presubmit` would otherwise pass.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-062]** Known false-positive or acceptable advisories MAY be suppressed via an `audit. ([SEC-062])
- **Type:** Security
- **Description:** Known false-positive or acceptable advisories MAY be suppressed via an `audit.toml` file at the repository root. Each suppressed advisory MUST include a comment documenting the justification and an expiry date. Suppression entries with expired dates MUST cause `cargo audit` to fail.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-063]** At MVP, there are no authentication credentials to protect (no client accounts, no session tokens). ([SEC-063])
- **Type:** Security
- **Description:** At MVP, there are no authentication credentials to protect (no client accounts, no session tokens). The API keys stored in server environment are credentials for upstream AI provider services, not for `devs` itself. Authentication failure handling is therefore not applicable to MVP client interactions.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-064]** Webhook `secret` values used for HMAC-SHA256 signing MUST be treated as credentials: subject to the same logging prohibition (**[SEC-025]**), stored as `Option<String>` in the `WebhookTarget` struct, and NEVER serialized into checkpoint files or log output. ([SEC-064])
- **Type:** Security
- **Description:** Webhook `secret` values used for HMAC-SHA256 signing MUST be treated as credentials: subject to the same logging prohibition (**[SEC-025]**), stored as `Option<String>` in the `WebhookTarget` struct, and NEVER serialized into checkpoint files or log output.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-065]** Checkpoint files (`checkpoint. ([SEC-065])
- **Type:** Security
- **Description:** Checkpoint files (`checkpoint.json`, `workflow_snapshot.json`) are committed to git with SHA-1 content-addressed history. While SHA-1 is deprecated for cryptographic purposes, git's use of it for content addressing (with collision resistance improvements in modern git) is an acceptable integrity mechanism for checkpoint data. No additional integrity signing of checkpoint files is required at MVP.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-066]** ) | LOW — file mode `0600`; git history provides evidence | ([SEC-066])
- **Type:** Security
- **Description:** ) | LOW — file mode `0600`; git history provides evidence |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-067]** The `devs-mcp-bridge` stdin-to-HTTP forwarding proxy MUST validate that every forwarded request body is valid JSON before transmitting to the MCP server. ([SEC-067])
- **Type:** Security
- **Description:** The `devs-mcp-bridge` stdin-to-HTTP forwarding proxy MUST validate that every forwarded request body is valid JSON before transmitting to the MCP server. Malformed JSON on stdin MUST produce a structured error to stdout (`{"result":null,"error":"invalid_argument: malformed JSON input","fatal":false}`) and discard the request, rather than forwarding garbage to the MCP server.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-068]** SSRF mitigations for outbound webhooks are defined in **[SEC-036]** and **[SEC-037]**. ([SEC-068])
- **Type:** Security
- **Description:** SSRF mitigations for outbound webhooks are defined in **[SEC-036]** and **[SEC-037]**. The blocklist check MUST be performed after DNS resolution (to catch DNS rebinding attacks) and MUST be re-evaluated on each delivery attempt (not cached). This is implemented by resolving the hostname to IP addresses immediately before the HTTP connection is established, not at configuration validation time.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-069]** The `ssh2`-based remote execution does not perform outbound HTTP requests to user-controlled addresses. ([SEC-069])
- **Type:** Security
- **Description:** The `ssh2`-based remote execution does not perform outbound HTTP requests to user-controlled addresses. SSH connection targets are configured in `devs.toml` and are operator-controlled, not user-controlled (users submit workflow runs, not SSH connection parameters). No additional SSRF mitigation is required for the SSH execution environment.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-070]** gRPC request size limits are enforced at the `tonic` layer: ([SEC-070])
- **Type:** Security
- **Description:** gRPC request size limits are enforced at the `tonic` layer:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-071]** MCP HTTP server enforces a 1 MiB maximum request body size (`Content-Length` or chunked transfer). ([SEC-071])
- **Type:** Security
- **Description:** MCP HTTP server enforces a 1 MiB maximum request body size (`Content-Length` or chunked transfer). Requests exceeding this limit MUST receive HTTP 413 with body `{"result":null,"error":"invalid_argument: request body exceeds 1 MiB limit"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-072]** ) | LOW — hard limit enforced at type level | ([SEC-072])
- **Type:** Security
- **Description:** ) | LOW — hard limit enforced at type level |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-073]** The context file (`. ([SEC-073])
- **Type:** Security
- **Description:** The context file (`.devs_context.json`) has a maximum size of 10 MiB. If the accumulated stage outputs exceed this limit, stdout/stderr of each included stage are truncated proportionally. This limits the total size of data passed between stages.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-074]** ); max 256 stages per workflow | LOW — validation-time rejection | ([SEC-074])
- **Type:** Security
- **Description:** ); max 256 stages per workflow | LOW — validation-time rejection |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-075]** The gRPC per-client event buffer is capped at 256 messages. ([SEC-075])
- **Type:** Security
- **Description:** The gRPC per-client event buffer is capped at 256 messages. On overflow, the oldest message is dropped (not the client connection). This prevents a slow or unresponsive client from blocking the scheduler's event dispatch.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-076]** ) | LOW — isolated async task | ([SEC-076])
- **Type:** Security
- **Description:** ) | LOW — isolated async task |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-077]** All workflow definition inputs (TOML, YAML, Rust builder API) MUST be validated through the 13-step validation pipeline (as defined in `[FEAT-BR-016]`) before any stage is dispatched. ([SEC-077])
- **Type:** Security
- **Description:** All workflow definition inputs (TOML, YAML, Rust builder API) MUST be validated through the 13-step validation pipeline (as defined in `[FEAT-BR-016]`) before any stage is dispatched. Validation collects all errors before returning; no short-circuit. Invalid definitions are rejected entirely.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-078]** Run name and slug uniqueness is enforced under a per-project mutex (**[2_TAS-BR-016]**, **[2_TAS-BR-025]**) to prevent time-of-check/time-of-use (TOCTOU) races in duplicate name detection. ([SEC-078])
- **Type:** Security
- **Description:** Run name and slug uniqueness is enforced under a per-project mutex (**[2_TAS-BR-016]**, **[2_TAS-BR-025]**) to prevent time-of-check/time-of-use (TOCTOU) races in duplicate name detection.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-079]** Workflow input parameters of type `Path` MUST NOT be resolved to absolute filesystem paths at submission time. ([SEC-079])
- **Type:** Security
- **Description:** Workflow input parameters of type `Path` MUST NOT be resolved to absolute filesystem paths at submission time. Resolution occurs at execution time within the stage's isolated working directory. This prevents path-based SSRF or local file inclusion via submitted inputs.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-080]** `BoundedString<N>` type constraints MUST be enforced at deserialization time using `serde` custom deserializers, not only at explicit validation call sites. ([SEC-080])
- **Type:** Security
- **Description:** `BoundedString<N>` type constraints MUST be enforced at deserialization time using `serde` custom deserializers, not only at explicit validation call sites. This ensures constraints are applied to all code paths that accept user input, including MCP tool calls and gRPC requests.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-081]** The authoritative dependency version table in the TAS (§2. ([SEC-081])
- **Type:** Security
- **Description:** The authoritative dependency version table in the TAS (§2.2) is enforced by `./do lint`. Any dependency not in the authoritative table, or at a different version, MUST cause lint failure. This prevents silent introduction of unreviewed transitive dependencies.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-082]** `unsafe_code = "deny"` is enforced workspace-wide via the workspace lint table (**[2_TAS-REQ-004b]**). ([SEC-082])
- **Type:** Security
- **Description:** `unsafe_code = "deny"` is enforced workspace-wide via the workspace lint table (**[2_TAS-REQ-004b]**). No `unsafe` blocks are permitted in authored code. This eliminates a large class of memory safety vulnerabilities (buffer overflows, use-after-free, data races) inherent to unsafe Rust.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-083]** The `reqwest` crate MUST be compiled with the `rustls-tls` feature only. ([SEC-083])
- **Type:** Security
- **Description:** The `reqwest` crate MUST be compiled with the `rustls-tls` feature only. The `native-tls` or `openssl` features MUST NOT be enabled. This ensures all outbound HTTP (webhooks, any future HTTP clients) uses the audited `rustls` stack, not platform-specific TLS implementations with varying security postures.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-084]** All logging MUST use the `tracing` crate with structured key-value fields. ([SEC-084])
- **Type:** Security
- **Description:** All logging MUST use the `tracing` crate with structured key-value fields. `println!`, `eprintln!`, and `log::` macros are prohibited in library crates (**[ARCH-BR-008]**). Log output is formatted as newline-delimited JSON (`tracing-subscriber` with `json` format) for machine consumption, or human-readable text for interactive use. The output format is controlled by the `DEVS_LOG_FORMAT` environment variable (`json` or `text`; default `text`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-085]** Log verbosity is controlled by `RUST_LOG` environment variable using `tracing-subscriber`'s `env-filter`. ([SEC-085])
- **Type:** Security
- **Description:** Log verbosity is controlled by `RUST_LOG` environment variable using `tracing-subscriber`'s `env-filter`. Default production log level: `INFO`. The `DEBUG` and `TRACE` levels MUST NOT produce output in release builds by default, as they may include sensitive data (template variable values, stage outputs) for debugging purposes.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-086]** ) | LOW — structured audit trail persisted | ([SEC-086])
- **Type:** Security
- **Description:** ) | LOW — structured audit trail persisted |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-087]** Webhook URLs logged in audit events MUST have query parameters redacted. ([SEC-087])
- **Type:** Security
- **Description:** Webhook URLs logged in audit events MUST have query parameters redacted. The URL is logged as `<scheme>://<host><path>?<redacted>`. This prevents logging of API keys or tokens accidentally placed in webhook query strings by operators. If the URL has no query parameters, it is logged as-is.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-088]** Log fields containing credential values MUST be redacted. ([SEC-088])
- **Type:** Security
- **Description:** Log fields containing credential values MUST be redacted. Implementors MUST use a custom `tracing` field type `Redacted<T>` (defined in `devs-core/src/redacted.rs`) that implements `fmt::Debug` and `fmt::Display` as `"[REDACTED]"`. This type MUST be applied to:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-089]** ) | HIGH — operator must rotate exposed keys | ([SEC-089])
- **Type:** Security
- **Description:** ) | HIGH — operator must rotate exposed keys |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-090]** When writing stage stdout/stderr to log files, content MUST be written verbatim (binary-safe) to the log file without any parsing or interpretation. ([SEC-090])
- **Type:** Security
- **Description:** When writing stage stdout/stderr to log files, content MUST be written verbatim (binary-safe) to the log file without any parsing or interpretation. ANSI escape sequences are NOT stripped from raw log files; stripping occurs only in the TUI display layer. This preserves full forensic fidelity while preventing log injection from interfering with the log pipeline.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-091]** JSON-formatted structured logs from `tracing-subscriber` inherently prevent log injection by serializing all field values as JSON strings with proper escaping of `"`, `\n`, `\r`, and control characters. ([SEC-091])
- **Type:** Security
- **Description:** JSON-formatted structured logs from `tracing-subscriber` inherently prevent log injection by serializing all field values as JSON strings with proper escaping of `"`, `\n`, `\r`, and control characters. Newlines within a single log event MUST be escaped as `\n` in the JSON output, never emitted as literal newlines that would split a log record. This is guaranteed by the `tracing-subscriber` JSON formatter without additional intervention.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-092]** Stage log files in `. ([SEC-092])
- **Type:** Security
- **Description:** Stage log files in `.devs/logs/` are subject to the same retention policy as checkpoint data: `max_age_days` (default 30) and `max_size_mb` (default 500). Retention sweeps occur at startup (after checkpoint recovery) and on a 24-hour periodic timer. Logs of active (`Running` or `Paused`) runs MUST NOT be deleted during a sweep.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-093]** ); MUST NOT appear in `tracing` logs (**[SEC-089]**) | HIGH — operator must rotate exposed keys | ([SEC-093])
- **Type:** Security
- **Description:** ); MUST NOT appear in `tracing` logs (**[SEC-089]**) | HIGH — operator must rotate exposed keys |
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-094]** The `tracing` process-level log output (server operational logs) is written to `stderr` by default. ([SEC-094])
- **Type:** Security
- **Description:** The `tracing` process-level log output (server operational logs) is written to `stderr` by default. Operators SHOULD redirect `stderr` to a log aggregation system in production. Log rotation of stage output files is handled by the retention sweep; process-level log rotation is the operator's responsibility.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-095]** The following conditions MUST be detectable from the structured log stream and SHOULD trigger operator alerts in production environments. ([SEC-095])
- **Type:** Security
- **Description:** The following conditions MUST be detectable from the structured log stream and SHOULD trigger operator alerts in production environments. The `devs` server does not implement a built-in alerting engine; operators use external log aggregation systems (Grafana Loki, Elasticsearch, Datadog, etc.) that consume the structured JSON log stream.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-096]** The outbound webhook system provides a native monitoring integration: operators MAY configure a `state. ([SEC-096])
- **Type:** Security
- **Description:** The outbound webhook system provides a native monitoring integration: operators MAY configure a `state.changed` webhook target pointing to their alerting system to receive all state transitions in real time. The webhook payload is signed with HMAC-SHA256 (**[SEC-021]**) allowing the receiver to verify event origin. This approach delivers events with lower latency than polling a log aggregation system and is the recommended production monitoring integration.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-097]** Every security control in this document that is enforced in code MUST have at least one automated test annotated `// Covers: SEC-NNN`. ([SEC-097])
- **Type:** Security
- **Description:** Every security control in this document that is enforced in code MUST have at least one automated test annotated `// Covers: SEC-NNN`. The following controls MUST have dedicated E2E tests (not unit tests) to satisfy QG-003/004/005.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-098]** The `tracing-subscriber` is initialized exactly once at server startup and MUST NOT be re-initialized at runtime. ([SEC-098])
- **Type:** Security
- **Description:** The `tracing-subscriber` is initialized exactly once at server startup and MUST NOT be re-initialized at runtime. Log level and format changes require a server restart. The subscriber MUST be configured with: `env-filter` driven by `RUST_LOG` (default: `info`), the formatter selected by `DEVS_LOG_FORMAT`, all output directed to `stderr`, and timestamps in RFC 3339 format with millisecond precision.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-099]** Log output is written to `stderr` exclusively. ([SEC-099])
- **Type:** Security
- **Description:** Log output is written to `stderr` exclusively. The server MUST NOT write operational log output to any file path. Stage output (agent stdout/stderr) is written to dedicated log files at `.devs/logs/`. These are distinct streams that MUST NOT be mixed.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-100]** ). ([SEC-100])
- **Type:** Security
- **Description:** ).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-101]** The `event_type` field MUST use only the values from the registry table above. ([SEC-101])
- **Type:** Security
- **Description:** The `event_type` field MUST use only the values from the registry table above. Custom `event_type` values are prohibited in `devs` production code. Internal diagnostic `tracing` events not in the registry MUST use `level: "DEBUG"` or `level: "TRACE"` so they are suppressed in production by default.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-102]** `Redacted<T>` MUST implement `serde::Serialize` as the literal string `"[REDACTED]"`. ([SEC-102])
- **Type:** Security
- **Description:** `Redacted<T>` MUST implement `serde::Serialize` as the literal string `"[REDACTED]"`. This ensures that if a `Redacted<T>` value is accidentally included in a JSON-serialized response (webhook payload, MCP result, checkpoint JSON), it produces `"[REDACTED]"` instead of the underlying value. The inner value MUST NOT be reachable through the `Serialize` implementation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-103]** Log field values that exceed 64 KiB in a single `tracing` event field are truncated to 64 KiB with `" . ([SEC-103])
- **Type:** Security
- **Description:** Log field values that exceed 64 KiB in a single `tracing` event field are truncated to 64 KiB with `" ...[TRUNCATED: N bytes]"` appended. Stage output is always referenced via a `log_path` field (never inlined), so this limit primarily constrains error message strings and validation error arrays.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-104]** Tracing span context MUST NOT include any user-controlled string that has not been validated against a known-safe character set. ([SEC-104])
- **Type:** Security
- **Description:** Tracing span context MUST NOT include any user-controlled string that has not been validated against a known-safe character set. Fields used in span context and their validated character sets:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-105]** On server startup, if `. ([SEC-105])
- **Type:** Security
- **Description:** On server startup, if `.devs/` exists with a mode that does not include `0700`, `devs` MUST attempt `chmod 0700` before proceeding. If `chmod` fails (e.g., owned by a different user), the server logs `WARN` with `event_type: "security.misconfiguration"` and `check_id: "SEC-FILE-PERM"` and proceeds anyway (to allow crash recovery of in-flight runs).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-106]** The disk write MUST NOT be blocked by the in-memory buffer write and vice versa. ([SEC-106])
- **Type:** Security
- **Description:** The disk write MUST NOT be blocked by the in-memory buffer write and vice versa. If the disk write fails (disk full), the in-memory buffer continues; the stage does not fail solely due to a log write error. If the in-memory buffer is full (1 MiB exceeded), only the buffer evicts data; the disk file continues receiving all output.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-107]** On retry (attempt N > 1), a new `attempt_<N>/` directory is created with new empty log files. ([SEC-107])
- **Type:** Security
- **Description:** On retry (attempt N > 1), a new `attempt_<N>/` directory is created with new empty log files. The previous attempt's log files MUST NOT be overwritten. Both remain independently accessible via `get_stage_output(run_id, stage_name, attempt=N)`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-108]** Every gRPC unary response MUST include a `request_id` field (UUID4, lowercase-hyphenated) in its response proto message. ([SEC-108])
- **Type:** Security
- **Description:** Every gRPC unary response MUST include a `request_id` field (UUID4, lowercase-hyphenated) in its response proto message. Every MCP tool call response MUST include `"request_id": "<uuid>"` in the `result` JSON object. All `tracing` log events emitted within the scope of that request handler carry this `request_id` in the enclosing `grpc_request` or `mcp_request` span.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-109]** Log events emitted outside any run span (startup, retention sweep, responses to `list_runs`) have an empty `span` object `{}`. ([SEC-109])
- **Type:** Security
- **Description:** Log events emitted outside any run span (startup, retention sweep, responses to `list_runs`) have an empty `span` object `{}`. This is not an error; these events are identifiable by their `event_type` prefix (`server.*`, `retention.*`, `project.*`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-110]** The `list_checkpoints` MCP tool returns `commit_sha` values for each checkpoint commit. ([SEC-110])
- **Type:** Security
- **Description:** The `list_checkpoints` MCP tool returns `commit_sha` values for each checkpoint commit. These SHAs can be used with the Filesystem MCP `read_file` to read the exact `checkpoint.json` state at any historical point, providing a time-series view of state transitions that complements the structured log stream.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-111]** The `pool. ([SEC-111])
- **Type:** Security
- **Description:** The `pool.exhausted` event fires at most once per exhaustion episode (**[3_PRD-BR-026]**, **[2_TAS-BR-WH-003]**). An exhaustion episode begins when all agents in a pool are simultaneously unavailable and ends when at least one becomes available again (signalled by `pool.recovered`). This prevents alert floods during prolonged pool unavailability. Operators SHOULD use `pool.recovered` to auto-resolve pool exhaustion alerts.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-112]** Test annotations MUST correspond to genuine behavioral coverage. ([SEC-112])
- **Type:** Security
- **Description:** Test annotations MUST correspond to genuine behavioral coverage. A test that calls `Redacted::new()` and asserts `Debug` output covers **[SEC-088]**. A test that merely imports `Redacted` without asserting behavior at an interface boundary does NOT satisfy the coverage requirement.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-113]** File permission tests (**[SEC-093]**) MUST run on all three CI platforms. ([SEC-113])
- **Type:** Security
- **Description:** File permission tests (**[SEC-093]**) MUST run on all three CI platforms. On Windows, the test asserts that the file is created and the test documents that mode `0o600` is not enforced, emitting a `WARN` log: `"file permission enforcement not supported on Windows; .devs/ directory security relies on OS-level ACLs"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-201]** Server logs `WARN` with `event_type: "security. ([AC-SEC-1-001])
- **Type:** Security
- **Description:** Server logs `WARN` with `event_type: "security.misconfiguration"`, `check_id: "SEC-BIND-ADDR"`, and `check_id: "SEC-TLS-MISSING"` on startup when `server.listen` binds to a non-loopback address without TLS configured. The server MUST still start (not abort).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-202]** A process connecting to `:7890` on the loopback interface can call `SubmitRun` without providing any credentials; the call succeeds (not rejected with an auth error). ([AC-SEC-1-002])
- **Type:** Security
- **Description:** A process connecting to `:7890` on the loopback interface can call `SubmitRun` without providing any credentials; the call succeeds (not rejected with an auth error).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-203]** A process connecting to `:7891` on the loopback interface can call `get_run` without authentication; the call succeeds with the expected JSON response. ([AC-SEC-1-003])
- **Type:** Security
- **Description:** A process connecting to `:7891` on the loopback interface can call `get_run` without authentication; the call succeeds with the expected JSON response.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-204]** Stage output containing the literal string `{{stage. ([AC-SEC-1-004])
- **Type:** Security
- **Description:** Stage output containing the literal string `{{stage.other.stdout}}` passed as a template variable to a downstream stage does NOT trigger recursive template expansion; the literal string is emitted verbatim in the generated prompt without modification.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-205]** `CLAUDE_API_KEY` value does NOT appear in any `tracing`-generated log line (stdout or stderr of the server process) at any log level during a complete workflow run that includes agent subprocess invocation. ([AC-SEC-1-005])
- **Type:** Security
- **Description:** `CLAUDE_API_KEY` value does NOT appear in any `tracing`-generated log line (stdout or stderr of the server process) at any log level during a complete workflow run that includes agent subprocess invocation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-206]** A webhook URL that resolves to `169. ([AC-SEC-1-006])
- **Type:** Security
- **Description:** A webhook URL that resolves to `169.254.169.254` at delivery time (simulated via a test DNS stub) is blocked. A `WARN` log entry with `event_type: "security.ssrf_blocked"` is emitted. Zero HTTP requests are made to that address.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-207]** An unconfigured server (no `devs. ([AC-SEC-1-007])
- **Type:** Security
- **Description:** An unconfigured server (no `devs.toml`, no `DEVS_LISTEN` env var) binds only to `127.0.0.1:7890` for gRPC and `127.0.0.1:7891` for MCP. Verified by `netstat`/`ss` or equivalent in the test environment.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-208]** The discovery file written by the server contains exactly one line in `<host>:<port>` format. ([AC-SEC-1-008])
- **Type:** Security
- **Description:** The discovery file written by the server contains exactly one line in `<host>:<port>` format. The file MUST NOT contain the MCP port number or any other content.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-209]** The discovery file is written atomically (write-to-tmp → `rename(2)`). ([AC-SEC-1-009])
- **Type:** Security
- **Description:** The discovery file is written atomically (write-to-tmp → `rename(2)`). A test that reads the discovery file concurrently with server startup MUST never observe a partial write (empty file or partial address).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-210]** The discovery file has Unix mode `0600` immediately after creation. ([AC-SEC-1-010])
- **Type:** Security
- **Description:** The discovery file has Unix mode `0600` immediately after creation. Verified by `fs::metadata().permissions()` in the test.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-211]** A structured output field containing `{{workflow. ([AC-SEC-1-011])
- **Type:** Security
- **Description:** A structured output field containing `{{workflow.input.secret}}` is extracted as a plain string and placed verbatim in the downstream prompt. The downstream prompt MUST NOT contain the expanded value of `workflow.input.secret`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-212]** A fan-out item value containing `}}{{` boundary sequences is placed verbatim into the generated prompt. ([AC-SEC-1-012])
- **Type:** Security
- **Description:** A fan-out item value containing `}}{{` boundary sequences is placed verbatim into the generated prompt. No partial template token from the boundary sequence is evaluated.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-213]** A workflow `default_env` key that matches the pattern `*_API_KEY` triggers a `WARN` log event with `event_type: "security. ([AC-SEC-1-013])
- **Type:** Security
- **Description:** A workflow `default_env` key that matches the pattern `*_API_KEY` triggers a `WARN` log event with `event_type: "security.credential_in_config"` at workflow load time. The key NAME is logged; the key VALUE is NOT logged.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-214]** `devs. ([AC-SEC-1-014])
- **Type:** Security
- **Description:** `devs.toml` with a credential key under `[credentials]` causes a `WARN` log event with `event_type: "security.credential_in_config"` and `key_name: "<KEYNAME>"` at startup. The credential value MUST NOT appear in the log event.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-215]** Two parallel fan-out sub-agents (fan_out. ([AC-SEC-1-015])
- **Type:** Security
- **Description:** Two parallel fan-out sub-agents (fan_out.count = 2) write to paths within their respective working directories. The path `<os-tempdir>/devs-<run-id>-<stage>-0/repo/` and `<os-tempdir>/devs-<run-id>-<stage>-1/repo/` are distinct directories. Neither sub-agent's writes appear in the other's working directory.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-216]** After a stage completes (success or failure), the working directory `<os-tempdir>/devs-<run-id>-<stage>/` is deleted. ([AC-SEC-1-016])
- **Type:** Security
- **Description:** After a stage completes (success or failure), the working directory `<os-tempdir>/devs-<run-id>-<stage>/` is deleted. Verified by asserting the path does not exist on disk after the stage transitions to a terminal state.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-217]** A workflow definition with `prompt_file = ". ([AC-SEC-1-017])
- **Type:** Security
- **Description:** A workflow definition with `prompt_file = "../../etc/passwd"` is rejected at validation time with `INVALID_ARGUMENT` containing `"invalid_argument: path traversal"`. No file read is attempted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-218]** A `prompt_file` that is a symlink resolving to a path outside the workflow directory is rejected at execution time with `"invalid_argument: path traversal detected"`. ([AC-SEC-1-018])
- **Type:** Security
- **Description:** A `prompt_file` that is a symlink resolving to a path outside the workflow directory is rejected at execution time with `"invalid_argument: path traversal detected"`. The stage transitions to `Failed` without spawning the agent subprocess.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-219]** A `checkpoint. ([AC-SEC-1-019])
- **Type:** Security
- **Description:** A `checkpoint.json` with schema version other than `1` found on recovery is skipped; the corresponding run is marked `Unrecoverable` in the in-memory state; the server continues processing other projects normally.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-220]** A `workflow_snapshot. ([AC-SEC-1-020])
- **Type:** Security
- **Description:** A `workflow_snapshot.json` file that already exists for a run MUST NOT be overwritten by a second write attempt. The persist layer returns an error that is logged at `ERROR` level; the server does not crash.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-221]** A webhook URL using the literal IPv6 loopback address `http://[::1]:9999/hook` is blocked with `event_type: "security. ([AC-SEC-1-021])
- **Type:** Security
- **Description:** A webhook URL using the literal IPv6 loopback address `http://[::1]:9999/hook` is blocked with `event_type: "security.ssrf_blocked"` without making any network connection.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-222]** A webhook URL using a private RFC-1918 address (e. ([AC-SEC-1-022])
- **Type:** Security
- **Description:** A webhook URL using a private RFC-1918 address (e.g., `http://10.0.0.1/hook`) is blocked with `event_type: "security.ssrf_blocked"`. The check is performed after DNS resolution so that DNS rebinding attacks (where a hostname resolves to a private IP) are also blocked.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-223]** `get_stage_output` called on a stage with `status: "running"` returns a response with `"error": null`, `"exit_code": null`, and partial stdout/stderr content collected up to that point. ([AC-SEC-1-023])
- **Type:** Security
- **Description:** `get_stage_output` called on a stage with `status: "running"` returns a response with `"error": null`, `"exit_code": null`, and partial stdout/stderr content collected up to that point. The call MUST NOT return an error.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-224]** `stream_logs(follow: true)` called after a stage has already completed returns all buffered log lines followed by a terminal chunk `{"done": true}`. ([AC-SEC-1-024])
- **Type:** Security
- **Description:** `stream_logs(follow: true)` called after a stage has already completed returns all buffered log lines followed by a terminal chunk `{"done": true}`. The connection closes with HTTP 200; no error is returned.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-225]** `cargo audit --deny warnings` exits with code 0 when run against the unmodified repository. ([AC-SEC-1-025])
- **Type:** Security
- **Description:** `cargo audit --deny warnings` exits with code 0 when run against the unmodified repository. This criterion MUST remain passing on every commit to main.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-226]** Every `SubmitRun` call (via CLI `devs submit` or MCP `submit_run`) produces a structured log event at `INFO` level containing `event_type: "run. ([AC-SEC-1-026])
- **Type:** Security
- **Description:** Every `SubmitRun` call (via CLI `devs submit` or MCP `submit_run`) produces a structured log event at `INFO` level containing `event_type: "run.submitted"`, `run_id`, `workflow_name`, and `project_id`. Verified by scanning the server's structured log output in an E2E test.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-227]** A `write_file` request to the Filesystem MCP targeting `. ([AC-SEC-2-003])
- **Type:** Security
- **Description:** A `write_file` request to the Filesystem MCP targeting `.devs/runs/<uuid>/checkpoint.json` returns HTTP 200 with `{"result": null, "error": "permission_denied: writes to .devs/runs/ are not permitted"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-228]** A webhook with a `secret` of 31 bytes is rejected at `devs project add` with exit code 4 and error message containing `"webhook secret must be at least 32 bytes"`. ([AC-SEC-2-004])
- **Type:** Security
- **Description:** A webhook with a `secret` of 31 bytes is rejected at `devs project add` with exit code 4 and error message containing `"webhook secret must be at least 32 bytes"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-229]** Server startup with `server. ([AC-SEC-2-005])
- **Type:** Security
- **Description:** Server startup with `server.listen = "0.0.0.0:7890"` logs a `WARN` entry containing `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-230]** `DEVS_MCP_ADDR` is present in the environment of every agent subprocess spawned by `devs-executor`, regardless of adapter type (verified for claude, gemini, opencode, qwen, and copilot adapters individually). ([AC-SEC-2-007])
- **Type:** Security
- **Description:** `DEVS_MCP_ADDR` is present in the environment of every agent subprocess spawned by `devs-executor`, regardless of adapter type (verified for claude, gemini, opencode, qwen, and copilot adapters individually).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-231]** `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` are absent from the environment of every agent subprocess even when all three variables are set in the server process environment before startup. ([AC-SEC-2-008])
- **Type:** Security
- **Description:** `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` are absent from the environment of every agent subprocess even when all three variables are set in the server process environment before startup.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-232]** A Filesystem MCP `read_file` request with path `. ([AC-SEC-2-009])
- **Type:** Security
- **Description:** A Filesystem MCP `read_file` request with path `../../etc/passwd` returns HTTP 200 with `{"result": null, "error": "permission_denied: path traversal detected: path resolves outside workspace root"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-233]** A Filesystem MCP `read_file` request with a path containing a null byte returns HTTP 200 with `{"result": null, "error": "invalid_argument: path contains null byte"}`. ([AC-SEC-2-010])
- **Type:** Security
- **Description:** A Filesystem MCP `read_file` request with a path containing a null byte returns HTTP 200 with `{"result": null, "error": "invalid_argument: path contains null byte"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-234]** A symlink inside the workspace that resolves to a path outside the workspace root is rejected by Filesystem MCP `read_file` with `"permission_denied: path traversal detected"` (rejection occurs after `canonicalize()`, not on the raw path string). ([AC-SEC-2-011])
- **Type:** Security
- **Description:** A symlink inside the workspace that resolves to a path outside the workspace root is rejected by Filesystem MCP `read_file` with `"permission_denied: path traversal detected"` (rejection occurs after `canonicalize()`, not on the raw path string).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-235]** A webhook HTTP POST includes `X-Devs-Signature-256: sha256=<hex>` when `secret` is configured; the header is completely absent when no `secret` is configured on the webhook target. ([AC-SEC-2-012])
- **Type:** Security
- **Description:** A webhook HTTP POST includes `X-Devs-Signature-256: sha256=<hex>` when `secret` is configured; the header is completely absent when no `secret` is configured on the webhook target.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-236]** The HMAC signature on a webhook delivery is computed over the exact bytes of the HTTP request body; a test receiver computing `HMAC-SHA256(secret, body)` over those same bytes produces an identical digest, confirming correct signing. ([AC-SEC-2-013])
- **Type:** Security
- **Description:** The HMAC signature on a webhook delivery is computed over the exact bytes of the HTTP request body; a test receiver computing `HMAC-SHA256(secret, body)` over those same bytes produces an identical digest, confirming correct signing.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-237]** Two concurrent `signal_completion` calls for the same `stage_run_id` result in exactly one successful state transition; the second caller receives `{"result": null, "error": "failed_precondition: signal_completion already called for this stage"}`. ([AC-SEC-2-015])
- **Type:** Security
- **Description:** Two concurrent `signal_completion` calls for the same `stage_run_id` result in exactly one successful state transition; the second caller receives `{"result": null, "error": "failed_precondition: signal_completion already called for this stage"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-238]** A stage definition with `env = { DEVS_LISTEN = "127. ([AC-SEC-2-016])
- **Type:** Security
- **Description:** A stage definition with `env = { DEVS_LISTEN = "127.0.0.1:9999" }` is rejected at workflow validation with `"invalid_argument: env key 'DEVS_LISTEN' is reserved and may not be set in workflow definitions"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-239]** A stage definition with `env = { DEVS_MCP_ADDR = "http://evil. ([AC-SEC-2-017])
- **Type:** Security
- **Description:** A stage definition with `env = { DEVS_MCP_ADDR = "http://evil.com" }` is rejected at workflow validation with `"invalid_argument: env key 'DEVS_MCP_ADDR' is reserved and may not be set in workflow definitions"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-240]** Server startup with an `[auth]` section present in `devs. ([AC-SEC-2-018])
- **Type:** Security
- **Description:** Server startup with an `[auth]` section present in `devs.toml` fails before port binding with `"invalid_argument: [auth] section is not supported at MVP; remove it from devs.toml"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-241]** Every accepted TCP connection on the gRPC and MCP ports produces a `ConnectionContext` record; the `connection_id` (UUID4) appears in both the connection-open and connection-close audit log entries, enabling log correlation. ([AC-SEC-2-020])
- **Type:** Security
- **Description:** Every accepted TCP connection on the gRPC and MCP ports produces a `ConnectionContext` record; the `connection_id` (UUID4) appears in both the connection-open and connection-close audit log entries, enabling log correlation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-242]** Server configured with `server. ([AC-SEC-2-021])
- **Type:** Security
- **Description:** Server configured with `server.listen` port equal to `mcp_port` (both set to 7890) fails at config validation before any port binding with `"invalid_argument: server.listen and server.mcp_port must be different"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-243]** A remote SSH stage with no `server. ([AC-SEC-2-023])
- **Type:** Security
- **Description:** A remote SSH stage with no `server.external_addr` configured fails before subprocess spawn with `"invalid_argument: server.external_addr required for remote SSH execution but not configured"`; the stage transitions to `Failed` without spawning any process.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-244]** A `devs-mcp-bridge` process that loses its HTTP connection to the MCP server writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 without hanging. ([AC-SEC-2-024])
- **Type:** Security
- **Description:** A `devs-mcp-bridge` process that loses its HTTP connection to the MCP server writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 without hanging.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-245]** Starting the server with `server. ([AC-SEC-3-001])
- **Type:** Security
- **Description:** Starting the server with `server.listen = "0.0.0.0:7890"` and no `[server.tls]` section in `devs.toml` causes the server to log a `WARN` with `check_id: "SEC-TLS-MISSING"` and `detail: "plaintext gRPC on non-loopback address; configure [server.tls] to suppress"`, and the server MUST still start successfully (exit 0 when subsequently shut down cleanly).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-246]** A prompt file for a file-based adapter is created with mode `0600` on Linux and is absent after the agent process exits (path no longer exists). ([AC-SEC-3-002])
- **Type:** Security
- **Description:** A prompt file for a file-based adapter is created with mode `0600` on Linux and is absent after the agent process exits (path no longer exists).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-247]** Configuring a webhook target with URL `http://169. ([AC-SEC-3-003])
- **Type:** Security
- **Description:** Configuring a webhook target with URL `http://169.254.169.254/metadata` and triggering a `run.started` event results in: no HTTP request to that URL, and a `WARN` log entry with `event_type: "security.ssrf_blocked"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-248]** Configuring a webhook target with a `secret` shorter than 32 bytes is rejected at `devs project add` time with exit code 4. ([AC-SEC-3-004])
- **Type:** Security
- **Description:** Configuring a webhook target with a `secret` shorter than 32 bytes is rejected at `devs project add` time with exit code 4.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-249]** The `devs. ([AC-SEC-3-005])
- **Type:** Security
- **Description:** The `devs.toml` file is checked for world-readable permissions at server startup; if world-readable, a `WARN` log entry with `check_id: "SEC-FILE-PERM-TOML"` is emitted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-250]** A webhook redirect (HTTP 301) to a private IP address does NOT result in an HTTP request to the private IP; the delivery is treated as failed. ([AC-SEC-3-006])
- **Type:** Security
- **Description:** A webhook redirect (HTTP 301) to a private IP address does NOT result in an HTTP request to the private IP; the delivery is treated as failed.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-251]** A `WorkflowRun`'s `definition_snapshot` field returned by the `get_run` MCP tool MUST NOT contain any raw `*_API_KEY` or `*_TOKEN` string values; such values appear as `"[REDACTED]"`. ([AC-SEC-3-020])
- **Type:** Security
- **Description:** A `WorkflowRun`'s `definition_snapshot` field returned by the `get_run` MCP tool MUST NOT contain any raw `*_API_KEY` or `*_TOKEN` string values; such values appear as `"[REDACTED]"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-252]** A `checkpoint. ([AC-SEC-3-021])
- **Type:** Security
- **Description:** A `checkpoint.json` file written to disk MUST NOT contain any string matching the pattern `sk-[a-zA-Z0-9]{10,}`. Verified by running a stage that prints `$CLAUDE_API_KEY` to stdout and asserting the checkpoint file does not contain the value.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-253]** The file `. ([AC-SEC-3-022])
- **Type:** Security
- **Description:** The file `.devs/logs/<run-id>/<stage>/attempt_1/stdout.log` is created with mode `0600` on Linux (verified by `fs::metadata(path)?.permissions().mode() & 0o777 == 0o600`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-254]** When `devs. ([AC-SEC-3-023])
- **Type:** Security
- **Description:** When `devs.toml` contains `claude_api_key = "sk-test-xxx"`, the server logs a WARN matching `"Credential 'claude_api_key' found in devs.toml"` and the log message does NOT contain `"sk-test-xxx"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-255]** When `devs. ([AC-SEC-3-024])
- **Type:** Security
- **Description:** When `devs.toml` is world-readable (`chmod o+r`), the server logs a WARN matching `"devs.toml is world-readable"` at startup.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-256]** `Redacted<String>::serialize()` via `serde_json::to_string()` produces the literal `"[REDACTED]"` regardless of the inner value. ([AC-SEC-3-025])
- **Type:** Security
- **Description:** `Redacted<String>::serialize()` via `serde_json::to_string()` produces the literal `"[REDACTED]"` regardless of the inner value.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-257]** `format!("{:?}", Redacted::new("secret"))` produces `"[REDACTED]"`. ([AC-SEC-3-026])
- **Type:** Security
- **Description:** `format!("{:?}", Redacted::new("secret"))` produces `"[REDACTED]"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-258]** The `~/. ([AC-SEC-3-027])
- **Type:** Security
- **Description:** The `~/.config/devs/state-repos/` directory is created with mode `0700` on Linux.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-259]** The `checkpoint. ([AC-SEC-3-028])
- **Type:** Security
- **Description:** The `checkpoint.json` file within `.devs/runs/<run-id>/` is created with mode `0600` on Linux.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-260]** The discovery file is created with mode `0600` on Linux; verified by `fs::metadata(path)?. ([AC-SEC-3-029])
- **Type:** Security
- **Description:** The discovery file is created with mode `0600` on Linux; verified by `fs::metadata(path)?.permissions().mode() & 0o777 == 0o600`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-261]** The discovery file is absent after a clean server shutdown triggered by SIGTERM. ([AC-SEC-3-030])
- **Type:** Security
- **Description:** The discovery file is absent after a clean server shutdown triggered by SIGTERM.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-262]** The `. ([AC-SEC-3-031])
- **Type:** Security
- **Description:** The `.devs_context.json` file is created with mode `0600` before the agent is spawned; it is absent after the stage working directory is cleaned up.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-263]** A `. ([AC-SEC-3-032])
- **Type:** Security
- **Description:** A `.devs_output.json` file exceeding 4 MiB causes the stage to transition to `Failed` with an error message containing `"structured_output: file exceeds 4 MiB limit"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-264]** A TLS certificate that has already expired at server startup causes the server to exit non-zero with an error containing `"TLS cert expired"`. ([AC-SEC-3-033])
- **Type:** Security
- **Description:** A TLS certificate that has already expired at server startup causes the server to exit non-zero with an error containing `"TLS cert expired"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-265]** A TLS certificate expiring within 30 days causes a `WARN` log at startup containing `"TLS certificate expires in"` but does NOT prevent the server from starting. ([AC-SEC-3-034])
- **Type:** Security
- **Description:** A TLS certificate expiring within 30 days causes a `WARN` log at startup containing `"TLS certificate expires in"` but does NOT prevent the server from starting.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-266]** A TLS private key with RSA < 3072 bits is rejected at config validation with an error containing `"TLS key is too weak"`. ([AC-SEC-3-035])
- **Type:** Security
- **Description:** A TLS private key with RSA < 3072 bits is rejected at config validation with an error containing `"TLS key is too weak"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-267]** A TLS private key that does not match the certificate is rejected at config validation with an error containing `"TLS key does not match certificate"`. ([AC-SEC-3-036])
- **Type:** Security
- **Description:** A TLS private key that does not match the certificate is rejected at config validation with an error containing `"TLS key does not match certificate"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-268]** A client connecting with TLS 1. ([AC-SEC-3-037])
- **Type:** Security
- **Description:** A client connecting with TLS 1.1 is rejected by the server; the server does not crash; the client receives a TLS protocol alert.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-269]** A POST to `/mcp/v1/call` with `Content-Type: text/plain` returns HTTP 415 with body `{"result": null, "error": "Content-Type must be application/json"}`. ([AC-SEC-3-038])
- **Type:** Security
- **Description:** A POST to `/mcp/v1/call` with `Content-Type: text/plain` returns HTTP 415 with body `{"result": null, "error": "Content-Type must be application/json"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-270]** A POST to `/mcp/v1/call` with a body of exactly 1,048,577 bytes returns HTTP 413. ([AC-SEC-3-039])
- **Type:** Security
- **Description:** A POST to `/mcp/v1/call` with a body of exactly 1,048,577 bytes returns HTTP 413.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-271]** A GET request to `/mcp/v1/call` returns HTTP 405 with an `Allow: POST` header. ([AC-SEC-3-040])
- **Type:** Security
- **Description:** A GET request to `/mcp/v1/call` returns HTTP 405 with an `Allow: POST` header.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-272]** A POST to an unknown path (e. ([AC-SEC-3-041])
- **Type:** Security
- **Description:** A POST to an unknown path (e.g., `/wrong/path`) returns HTTP 404 with body `{"result": null, "error": "not_found: ..."}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-273]** MCP HTTP responses include `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` headers on ALL response codes (200, 400, 404, 405, 413, 415, 500). ([AC-SEC-3-042])
- **Type:** Security
- **Description:** MCP HTTP responses include `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` headers on ALL response codes (200, 400, 404, 405, 413, 415, 500).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-274]** A tool handler that panics returns HTTP 500 with body `{"result": null, "error": "internal: tool handler panicked"}` and the server continues to serve subsequent requests normally. ([AC-SEC-3-043])
- **Type:** Security
- **Description:** A tool handler that panics returns HTTP 500 with body `{"result": null, "error": "internal: tool handler panicked"}` and the server continues to serve subsequent requests normally.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-275]** A webhook URL `http://10. ([AC-SEC-3-044])
- **Type:** Security
- **Description:** A webhook URL `http://10.0.0.1/hook` is blocked; `WARN` logged; no HTTP request made.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-276]** A webhook URL `http://[::1]/hook` (IPv6 loopback) is blocked. ([AC-SEC-3-045])
- **Type:** Security
- **Description:** A webhook URL `http://[::1]/hook` (IPv6 loopback) is blocked.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-277]** A webhook URL `file:///etc/passwd` is rejected at `devs project add` configuration validation time with exit code 4. ([AC-SEC-3-046])
- **Type:** Security
- **Description:** A webhook URL `file:///etc/passwd` is rejected at `devs project add` configuration validation time with exit code 4.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-278]** A webhook hostname resolving to both `8. ([AC-SEC-3-047])
- **Type:** Security
- **Description:** A webhook hostname resolving to both `8.8.8.8` (public) and `192.168.1.1` (private) results in delivery being blocked (any private IP in the resolved set triggers the block).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-279]** An SSH connection attempt to a host not in known_hosts (with `StrictHostKeyChecking` not disabled) causes the stage to fail with an error containing `"SSH host key"`. ([AC-SEC-3-048])
- **Type:** Security
- **Description:** An SSH connection attempt to a host not in known_hosts (with `StrictHostKeyChecking` not disabled) causes the stage to fail with an error containing `"SSH host key"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-280]** An SSH RSA key with fewer than 2048 bits is rejected with an error containing `"SSH key too weak"`. ([AC-SEC-3-049])
- **Type:** Security
- **Description:** An SSH RSA key with fewer than 2048 bits is rejected with an error containing `"SSH key too weak"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-281]** When `devs-mcp-bridge` cannot locate the devs server (discovery file absent), it exits with code 1 and writes `{"result": null, "error": "server_unreachable: . ([AC-SEC-3-050])
- **Type:** Security
- **Description:** When `devs-mcp-bridge` cannot locate the devs server (discovery file absent), it exits with code 1 and writes `{"result": null, "error": "server_unreachable: ...", "fatal": true}` to stdout.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-282]** When the MCP server returns HTTP 413 for an oversized request forwarded by the bridge, the bridge writes `{"result": null, "error": "request body exceeds 1 MiB limit"}` to stdout and continues operating (does not exit). ([AC-SEC-3-051])
- **Type:** Security
- **Description:** When the MCP server returns HTTP 413 for an oversized request forwarded by the bridge, the bridge writes `{"result": null, "error": "request body exceeds 1 MiB limit"}` to stdout and continues operating (does not exit).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-283]** `devs-server` attempts `setrlimit(RLIMIT_CORE, 0)` on Linux at startup; if the call fails, a `WARN` log is emitted but startup continues normally. ([AC-SEC-3-052])
- **Type:** Security
- **Description:** `devs-server` attempts `setrlimit(RLIMIT_CORE, 0)` on Linux at startup; if the call fails, a `WARN` log is emitted but startup continues normally.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-284]** A `Redacted<String>` serialized to JSON via `serde_json::to_string()` produces `"\"[REDACTED]\""` and NOT the actual credential value. ([AC-SEC-3-053])
- **Type:** Security
- **Description:** A `Redacted<String>` serialized to JSON via `serde_json::to_string()` produces `"\"[REDACTED]\""` and NOT the actual credential value.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-285]** A stage prompt containing `{{stage. ([AC-SEC-4-001])
- **Type:** Security
- **Description:** A stage prompt containing `{{stage.upstream.stdout}}` where `upstream` produces output with the literal string `{{workflow.input.secret}}`: the downstream agent receives `{{workflow.input.secret}}` verbatim, not the value of `workflow.input.secret`. Single-pass expansion verified by inspecting the prompt file or `--print` argument passed to the agent.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-286]** An agent subprocess spawned by the `claude` adapter with a prompt containing `; cat /etc/passwd` receives the full string as the value of the `--print` argument; no shell execution occurs. ([AC-SEC-4-002])
- **Type:** Security
- **Description:** An agent subprocess spawned by the `claude` adapter with a prompt containing `; cat /etc/passwd` receives the full string as the value of the `--print` argument; no shell execution occurs. Verified by asserting the `tokio::process::Command` `args` list contains the exact prompt string as a single element.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-287]** A template variable referencing `{{stage. ([AC-SEC-4-003])
- **Type:** Security
- **Description:** A template variable referencing `{{stage.X.stdout}}` where stage X is not in the current stage's transitive `depends_on` closure causes the stage to transition to `Failed` with `TemplateError::UnreachableStage`; no agent subprocess is spawned.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-288]** A template variable referencing `{{stage. ([AC-SEC-4-004])
- **Type:** Security
- **Description:** A template variable referencing `{{stage.X.output.nested_field}}` where `nested_field` is a JSON object (not a scalar) causes the stage to transition to `Failed` with `TemplateError::NonScalarField`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-289]** A `prompt_file` value of `". ([AC-SEC-4-005])
- **Type:** Security
- **Description:** A `prompt_file` value of `"../../etc/hosts"` is rejected at workflow validation with `invalid_argument: prompt_file path contains '..' segment`; no file read occurs.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-290]** A prompt containing `{{stage. ([AC-SEC-4-006])
- **Type:** Security
- **Description:** A prompt containing `{{stage.X.stdout}}` where X's stdout is 20,000 bytes results in the downstream prompt containing only the last 10,240 bytes of X's stdout; a `WARN` log event with `event_type: "template.truncated"` is emitted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-291]** `. ([AC-SEC-4-007])
- **Type:** Security
- **Description:** `.devs_output.json` with `{"success": "true"}` (string, not boolean) causes the stage to transition to `Failed`; `get_stage_output` returns `structured` containing the parsed object and `exit_code` from the process.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-292]** `. ([AC-SEC-4-008])
- **Type:** Security
- **Description:** `.devs_output.json` with 129 levels of JSON nesting causes `structured_output_parse_error: nesting depth limit exceeded`; stage transitions to `Failed`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-293]** A stage env key of `DEVS_LISTEN` is rejected at workflow validation with `invalid_argument: env key 'DEVS_LISTEN' is reserved`. ([AC-SEC-4-009])
- **Type:** Security
- **Description:** A stage env key of `DEVS_LISTEN` is rejected at workflow validation with `invalid_argument: env key 'DEVS_LISTEN' is reserved`. A stage env key of `FOO=BAR` is rejected with `invalid_argument: env key 'FOO=BAR' contains invalid characters`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-294]** On server startup with `server. ([AC-SEC-4-010])
- **Type:** Security
- **Description:** On server startup with `server.listen = "0.0.0.0:7890"`, a `WARN` log event is emitted with message containing `"server.listen"` and `"non-loopback"`. The server starts normally; the warning does not abort startup.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-295]** On server startup with a `devs. ([AC-SEC-4-011])
- **Type:** Security
- **Description:** On server startup with a `devs.toml` containing `MY_API_KEY = "sk-..."`, a `WARN` log event is emitted with message containing `"API key"` or `"token"`. The key value itself is NOT present in the log output.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-296]** `cargo audit --deny warnings` exits 0 on the unmodified repository (no known advisories in current dependency set at build time). ([AC-SEC-4-013])
- **Type:** Security
- **Description:** `cargo audit --deny warnings` exits 0 on the unmodified repository (no known advisories in current dependency set at build time).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-297]** `. ([AC-SEC-4-014])
- **Type:** Security
- **Description:** `./do lint` exits non-zero when `cargo audit` reports any advisory at `WARN` or higher severity. When `audit.toml` contains a suppression entry with an expired `expires` date, `cargo audit` exits non-zero.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-298]** `cargo tree -p devs-core --edges normal` output does not contain `tokio`, `git2`, `reqwest`, or `tonic` — verifying the zero-I/O-dependency invariant of `devs-core` (**[ARCH-AC-009]**). ([AC-SEC-4-015])
- **Type:** Security
- **Description:** `cargo tree -p devs-core --edges normal` output does not contain `tokio`, `git2`, `reqwest`, or `tonic` — verifying the zero-I/O-dependency invariant of `devs-core` (**[ARCH-AC-009]**).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-299]** `cargo tree` output for a production build does not contain `openssl`, `openssl-sys`, or `native-tls` as crate names. ([AC-SEC-4-016])
- **Type:** Security
- **Description:** `cargo tree` output for a production build does not contain `openssl`, `openssl-sys`, or `native-tls` as crate names.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-300]** `workflow_snapshot. ([AC-SEC-4-017])
- **Type:** Security
- **Description:** `workflow_snapshot.json` is written exactly once per run (before first stage transition). Attempting to write it again (e.g., via a second concurrent `submit_run` with the same `run_id`) returns an error from `devs-checkpoint`; the original file is not overwritten.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-301]** An MCP HTTP request with `Content-Length: 1048577` (1 MiB + 1 byte) receives HTTP 413 with body `{"result":null,"error":"invalid_argument: request body exceeds 1 MiB limit"}`. ([AC-SEC-4-018])
- **Type:** Security
- **Description:** An MCP HTTP request with `Content-Length: 1048577` (1 MiB + 1 byte) receives HTTP 413 with body `{"result":null,"error":"invalid_argument: request body exceeds 1 MiB limit"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-302]** A workflow submitted with 257 stages is rejected with `invalid_argument` before any run is created; `list_runs` shows no new run. ([AC-SEC-4-019])
- **Type:** Security
- **Description:** A workflow submitted with 257 stages is rejected with `invalid_argument` before any run is created; `list_runs` shows no new run.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-303]** A fan-out stage with `count = 65` is rejected at validation with `invalid_argument: fan_out. ([AC-SEC-4-020])
- **Type:** Security
- **Description:** A fan-out stage with `count = 65` is rejected at validation with `invalid_argument: fan_out.count must be between 1 and 64; got 65`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-304]** When 64 concurrent MCP HTTP requests are active simultaneously, a 65th request is accepted (not refused); it may block on lock acquisition for up to 5 seconds before returning a response. ([AC-SEC-4-021])
- **Type:** Security
- **Description:** When 64 concurrent MCP HTTP requests are active simultaneously, a 65th request is accepted (not refused); it may block on lock acquisition for up to 5 seconds before returning a response.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-305]** A `StreamRunEvents` gRPC stream that is not consuming events (slow client) does not block the DAG scheduler from advancing; the oldest buffered event is silently dropped when the 257th event is enqueued for that client. ([AC-SEC-4-022])
- **Type:** Security
- **Description:** A `StreamRunEvents` gRPC stream that is not consuming events (slow client) does not block the DAG scheduler from advancing; the oldest buffered event is silently dropped when the 257th event is enqueued for that client.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-306]** A `BoundedString<128>` field submitted with 129 UTF-8 bytes is rejected at MCP `submit_run` with HTTP 200 and `"error": "invalid_argument: . ([AC-SEC-4-023])
- **Type:** Security
- **Description:** A `BoundedString<128>` field submitted with 129 UTF-8 bytes is rejected at MCP `submit_run` with HTTP 200 and `"error": "invalid_argument: ..."` before any run is created; `list_runs` shows no new run.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-307]** `submit_run` with an extra input key not declared in the workflow returns `invalid_argument: unknown input key '<name>'`; no run is created. ([AC-SEC-4-024])
- **Type:** Security
- **Description:** `submit_run` with an extra input key not declared in the workflow returns `invalid_argument: unknown input key '<name>'`; no run is created.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-308]** `submit_run` with a `boolean` input value of the string `"1"` returns `invalid_argument: cannot coerce '1' to boolean`; values `"true"` and `"false"` (lowercase strings) are accepted. ([AC-SEC-4-025])
- **Type:** Security
- **Description:** `submit_run` with a `boolean` input value of the string `"1"` returns `invalid_argument: cannot coerce '1' to boolean`; values `"true"` and `"false"` (lowercase strings) are accepted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-309]** A webhook `secret` shorter than 32 bytes is rejected at project registration with `invalid_argument: webhook secret must be at least 32 bytes`. ([AC-SEC-4-026])
- **Type:** Security
- **Description:** A webhook `secret` shorter than 32 bytes is rejected at project registration with `invalid_argument: webhook secret must be at least 32 bytes`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-310]** A project registered with `weight = 0` is rejected with `invalid_argument: project weight must be at least 1`. ([AC-SEC-4-027])
- **Type:** Security
- **Description:** A project registered with `weight = 0` is rejected with `invalid_argument: project weight must be at least 1`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-311]** An `AgentPool` configured with `max_concurrent = 1025` is rejected at server startup config validation with a clear error before any port is bound. ([AC-SEC-4-028])
- **Type:** Security
- **Description:** An `AgentPool` configured with `max_concurrent = 1025` is rejected at server startup config validation with a clear error before any port is bound.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-312]** `. ([AC-SEC-4-029])
- **Type:** Security
- **Description:** `./do lint` exits non-zero when a `Cargo.toml` in the workspace declares a dependency not present in the TAS authoritative version table; the error message names the specific crate and version.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-313]** `. ([AC-SEC-4-030])
- **Type:** Security
- **Description:** `./do lint` exits non-zero when `reqwest` is found with `native-tls` feature enabled; exits 0 when `reqwest` is `rustls-tls` only.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-314]** `audit. ([AC-SEC-4-031])
- **Type:** Security
- **Description:** `audit.toml` with an `expires` date in the past causes `./do lint` to exit non-zero with a message referencing the specific advisory ID and the expired date.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-315]** `cargo grep unsafe` (or equivalent) across all workspace `. ([AC-SEC-4-032])
- **Type:** Security
- **Description:** `cargo grep unsafe` (or equivalent) across all workspace `.rs` files returns zero matches (no `unsafe` blocks in authored code).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-316]** `Redacted<String>` formats as `"[REDACTED]"` in both `{:?}` (Debug) and `{}` (Display) format specifiers. ([AC-SEC-4-033])
- **Type:** Security
- **Description:** `Redacted<String>` formats as `"[REDACTED]"` in both `{:?}` (Debug) and `{}` (Display) format specifiers. Unit test: `assert_eq!(format!("{:?}", Redacted("secret")), "[REDACTED]")`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-317]** When a webhook delivery event is logged at `WARN` with the `secret` field, the JSON log output contains `"secret": "[REDACTED]"`, not the actual secret value. ([AC-SEC-4-034])
- **Type:** Security
- **Description:** When a webhook delivery event is logged at `WARN` with the `secret` field, the JSON log output contains `"secret": "[REDACTED]"`, not the actual secret value.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-318]** When the server starts with an `ANTHROPIC_API_KEY` environment variable set, that value does NOT appear in any log line at any level, including `DEBUG` and `TRACE`. ([AC-SEC-4-035])
- **Type:** Security
- **Description:** When the server starts with an `ANTHROPIC_API_KEY` environment variable set, that value does NOT appear in any log line at any level, including `DEBUG` and `TRACE`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-319]** A webhook configured with URL `http://192. ([AC-SEC-4-036])
- **Type:** Security
- **Description:** A webhook configured with URL `http://192.168.1.1/hook` is NOT delivered; `WARN` log event is emitted with `"ssrf"` in the message and reason `"private network (RFC 1918)"`; no retry is attempted (blocked at SSRF check, not delivery failure).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-320]** A webhook configured with URL `http://localhost/hook` is NOT delivered; blocked with reason `"loopback (127. ([AC-SEC-4-037])
- **Type:** Security
- **Description:** A webhook configured with URL `http://localhost/hook` is NOT delivered; blocked with reason `"loopback (127.0.0.0/8)"`. With `server.allow_local_webhooks = true`, delivery IS attempted and a `WARN` log is emitted indicating the SSRF check was bypassed.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-321]** Each webhook delivery attempt performs a fresh DNS resolution; a hostname that resolves to different IPs on successive calls is re-checked on each retry. ([AC-SEC-4-038])
- **Type:** Security
- **Description:** Each webhook delivery attempt performs a fresh DNS resolution; a hostname that resolves to different IPs on successive calls is re-checked on each retry. (Verified by mocking DNS to return a private IP on the second resolution; second delivery attempt is blocked.)
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-322]** A webhook URL whose hostname resolves to both a public IP and `10. ([AC-SEC-4-039])
- **Type:** Security
- **Description:** A webhook URL whose hostname resolves to both a public IP and `10.0.0.1` is blocked; the `SsrfError::BlockedAddress` error identifies the specific blocked IP and its range classification.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-323]** Every `tracing` log event in JSON format (`DEVS_LOG_FORMAT=json`) contains top-level fields `timestamp`, `level`, `target`, `span`, and `fields`. ([AC-SEC-5-001])
- **Type:** Security
- **Description:** Every `tracing` log event in JSON format (`DEVS_LOG_FORMAT=json`) contains top-level fields `timestamp`, `level`, `target`, `span`, and `fields`. The `fields` object contains `event_type` (non-null string) and `message` (non-null string). Verified by running a standard workflow run and parsing every line of server `stderr` output as JSON with no parse errors.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-324]** When `devs. ([AC-SEC-5-002])
- **Type:** Security
- **Description:** When `devs.toml` contains `CLAUDE_API_KEY = "test"`, server startup emits a `WARN` log entry with `event_type: "security.misconfiguration"` and `check_id: "SEC-TOML-CRED"`. The string `"test"` does NOT appear anywhere in the server's `stderr` output. Verified by grep on captured stderr after startup.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-325]** Stage `stdout. ([AC-SEC-5-003])
- **Type:** Security
- **Description:** Stage `stdout.log` and `stderr.log` files are created with Unix permissions `0o600`. Verified by `fs::metadata(path).permissions().mode() & 0o777 == 0o600` in an integration test after a stage completes.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-326]** The parent directory `. ([AC-SEC-5-004])
- **Type:** Security
- **Description:** The parent directory `.devs/logs/` and all intermediate directories up to `attempt_<N>/` are created with Unix permissions `0o700`. Verified by the same mechanism as AC-SEC-5-003.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-327]** An agent that prints `CLAUDE_API_KEY=sk-ant-secret` to stdout: the string `sk-ant-secret` appears in `. ([AC-SEC-5-005])
- **Type:** Security
- **Description:** An agent that prints `CLAUDE_API_KEY=sk-ant-secret` to stdout: the string `sk-ant-secret` appears in `.devs/logs/<run-id>/<stage>/attempt_1/stdout.log` AND does NOT appear in any line of the server's `tracing` log output. Verified by grep on both the log file and captured server `stderr`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-328]** After running `. ([AC-SEC-5-006])
- **Type:** Security
- **Description:** After running `./do test`, `target/traceability.json` contains `covered: true` entries for `SEC-036`, `SEC-040`, `SEC-044`, `SEC-050`, `SEC-060`, `SEC-088`, `SEC-091`, `SEC-108`. Verified by parsing `target/traceability.json`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-329]** A webhook URL `https://example. ([AC-SEC-5-007])
- **Type:** Security
- **Description:** A webhook URL `https://example.com/hook?token=secret` is logged in all audit events referencing that webhook as `https://example.com/hook?<redacted>`. The string `"secret"` does NOT appear in any log line. Verified by configuring such a webhook, triggering a delivery, and grepping server `stderr` output.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-330]** Retention sweep at startup deletes all runs whose `completed_at` is older than `max_age_days` but does NOT delete any run currently in `Running` or `Paused` status. ([AC-SEC-5-008])
- **Type:** Security
- **Description:** Retention sweep at startup deletes all runs whose `completed_at` is older than `max_age_days` but does NOT delete any run currently in `Running` or `Paused` status. Verified by a test that: (a) starts a run, (b) stops the server, (c) manually ages `completed_at` in checkpoint JSON for other terminal runs, (d) restarts the server, (e) confirms only the aged runs are absent.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-331]** `format!("{:?}", Redacted("test"))` returns `"[REDACTED]"`. ([AC-SEC-5-009])
- **Type:** Security
- **Description:** `format!("{:?}", Redacted("test"))` returns `"[REDACTED]"`. `format!("{}", Redacted("test"))` returns `"[REDACTED]"`. `serde_json::to_string(&Redacted("test")).unwrap()` returns `"\"[REDACTED]\""`. All three assertions pass in a dedicated unit test annotated `// Covers: SEC-088`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-332]** Every gRPC unary response proto contains a non-null `request_id` field in UUID4 lowercase-hyphenated format. ([AC-SEC-5-010])
- **Type:** Security
- **Description:** Every gRPC unary response proto contains a non-null `request_id` field in UUID4 lowercase-hyphenated format. `devs submit --format json` output contains `"request_id"` matching the regex `[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`. Verified in a CLI E2E test annotated `// Covers: SEC-108`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-333]** A workflow with two stages dispatched concurrently produces log events where (a) both `stage. ([AC-SEC-5-011])
- **Type:** Security
- **Description:** A workflow with two stages dispatched concurrently produces log events where (a) both `stage.dispatched` events carry the same `run_id` in their `span` object, (b) each carries a distinct `stage_name`, and (c) each carries `attempt: 1`. Verified by parsing JSON log output from a parallel-stage workflow E2E test.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-334]** `DEVS_LOG_FORMAT=invalid` causes the server to write an error to `stderr` and exit non-zero before binding any TCP ports. ([AC-SEC-5-012])
- **Type:** Security
- **Description:** `DEVS_LOG_FORMAT=invalid` causes the server to write an error to `stderr` and exit non-zero before binding any TCP ports. Verified by spawning the server binary with this env var and asserting: exit code is non-zero AND the `~/.config/devs/server.addr` discovery file does NOT exist.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-335]** A stage that produces 1,048,577 bytes of stdout output has `StageOutput. ([AC-SEC-5-013])
- **Type:** Security
- **Description:** A stage that produces 1,048,577 bytes of stdout output has `StageOutput.truncated == true` and `StageOutput.stdout.len() == 1_048_576` (in-memory cap), while the on-disk `stdout.log` file has size ≥ 1,048,577 bytes. Verified in an integration test using a mock agent binary that writes a controlled byte count.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-336]** After a `cancel_run`, no `stage. ([AC-SEC-5-014])
- **Type:** Security
- **Description:** After a `cancel_run`, no `stage.dispatched`, `stage.completed`, or `stage.failed` audit events appear in the log for stages that were in `Waiting` or `Eligible` state at the time of cancellation. Verified by parsing the complete JSON log stream in a CLI E2E test that cancels a multi-stage run mid-flight.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-337]** `. ([AC-SEC-5-015])
- **Type:** Security
- **Description:** `./do lint` exits non-zero if any source file in `crates/devs-{core,config,checkpoint,adapters,pool,executor,scheduler,webhook,grpc,mcp}/src/` contains an invocation of `println!` or `eprintln!`. Verified by injecting `println!("test");` into `devs-core/src/lib.rs`, running `./do lint`, and asserting exit code is non-zero with the offending file and line reported on `stderr`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-338]** A `stream_logs(follow: true)` HTTP client that disconnects mid-stream causes the server to release all associated resources (`broadcast::Receiver`, log file read handle) within 500ms of disconnect detection. ([AC-SEC-5-016])
- **Type:** Security
- **Description:** A `stream_logs(follow: true)` HTTP client that disconnects mid-stream causes the server to release all associated resources (`broadcast::Receiver`, log file read handle) within 500ms of disconnect detection. Verified by an integration test that connects, reads one line, drops the connection, and then asserts that a per-connection resource counter decrements within the 500ms window.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-339]** When `server. ([SEC-001-BR-001])
- **Type:** Security
- **Description:** When `server.listen` binds to any address other than `127.0.0.1` or `::1`, the server MUST emit a `WARN`-level structured log event with `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"` before accepting any connection. The server continues starting — this is a warning, not a fatal error.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-340]** The built-in default for `server. ([SEC-001-BR-002])
- **Type:** Security
- **Description:** The built-in default for `server.listen` MUST resolve to `"127.0.0.1:7890"` when no configuration file and no `DEVS_LISTEN` environment variable are present. An unconfigured server MUST bind only to loopback.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-341]** The MCP HTTP server MUST bind to the same IP address as `server. ([SEC-001-BR-003])
- **Type:** Security
- **Description:** The MCP HTTP server MUST bind to the same IP address as `server.listen`. If `server.listen = "0.0.0.0:7890"`, the MCP server MUST also bind `0.0.0.0:7891`. The MCP port MUST NOT bind to a more permissive network scope than the gRPC port.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-342]** The discovery file MUST contain only the gRPC listen address in `<host>:<port>` plain UTF-8 format. ([SEC-001-BR-004])
- **Type:** Security
- **Description:** The discovery file MUST contain only the gRPC listen address in `<host>:<port>` plain UTF-8 format. The MCP port MUST NOT appear in the discovery file. Clients obtain the MCP port exclusively via the `ServerService.GetInfo` RPC. This ensures that locating the gRPC service does not automatically expose the MCP attack surface.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-343]** Both gRPC and MCP ports MUST be fully bound before the discovery file is written. ([SEC-001-BR-005])
- **Type:** Security
- **Description:** Both gRPC and MCP ports MUST be fully bound before the discovery file is written. Clients that read the discovery file and successfully connect to the gRPC port MUST be guaranteed that the MCP port is also accepting connections.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-344]** No authentication call sites MUST exist inside any gRPC service handler module (`WorkflowServiceImpl`, `RunServiceImpl`, `StageServiceImpl`, `LogServiceImpl`, `PoolServiceImpl`, `ProjectServiceImpl`) at MVP. ([SEC-002-BR-001])
- **Type:** Security
- **Description:** No authentication call sites MUST exist inside any gRPC service handler module (`WorkflowServiceImpl`, `RunServiceImpl`, `StageServiceImpl`, `LogServiceImpl`, `PoolServiceImpl`, `ProjectServiceImpl`) at MVP. Post-MVP authentication MUST be implementable as a standalone `tonic` `Layer` (interceptor) applied at the router level, without modifying any service handler code.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-345]** The audit trail MUST be complete: every `SubmitRun`, `CancelRun`, `PauseRun`, `ResumeRun`, `write_workflow_definition`, and stage terminal transition MUST produce a structured log event at `INFO` level or higher with the mandatory fields defined in §5. ([SEC-014-BR-001])
- **Type:** Security
- **Description:** The audit trail MUST be complete: every `SubmitRun`, `CancelRun`, `PauseRun`, `ResumeRun`, `write_workflow_definition`, and stage terminal transition MUST produce a structured log event at `INFO` level or higher with the mandatory fields defined in §5.3 (`timestamp`, `level`, `target`, `fields.event_type`).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-346]** `cargo audit --deny warnings` MUST exit with code 0 on the unmodified repository at any point in the development lifecycle. ([SEC-014-BR-002])
- **Type:** Security
- **Description:** `cargo audit --deny warnings` MUST exit with code 0 on the unmodified repository at any point in the development lifecycle. Any advisory that cannot be immediately resolved MUST have a corresponding `audit.toml` suppression entry with a human-readable justification comment and an ISO 8601 expiry date (see SEC-062).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-347]** `devs` MUST NOT introduce any dependency that initiates outbound network connections to third-party telemetry, analytics, license validation, or crash-reporting endpoints. ([SEC-014-BR-003])
- **Type:** Security
- **Description:** `devs` MUST NOT introduce any dependency that initiates outbound network connections to third-party telemetry, analytics, license validation, or crash-reporting endpoints. All outbound network I/O from the `devs-server` process MUST be one of: agent subprocess invocation (to AI provider APIs), webhook delivery (to operator-configured URLs), or git push/fetch (to the project repository). This MUST be verifiable by a `cargo tree` audit of all non-dev dependencies.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-348]** The default gRPC bind address is `127. ([SEC-015-BR-001])
- **Type:** Security
- **Description:** The default gRPC bind address is `127.0.0.1:7890`. The default MCP bind address is `127.0.0.1:7891`. Both defaults appear in the built-in default configuration and MUST NOT require any `devs.toml` entry to take effect.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-349]** When `server. ([SEC-015-BR-002])
- **Type:** Security
- **Description:** When `server.listen` is changed to any non-loopback address (any address where the leading octet is not `127`), the startup security check `SEC-BIND-ADDR` MUST emit a `WARN`-level log. This warning is non-fatal; the server proceeds to bind.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-350]** When `server. ([SEC-015-BR-003])
- **Type:** Security
- **Description:** When `server.listen` is changed to `0.0.0.0` (all interfaces), the `WARN` log MUST include the machine's resolved non-loopback IP addresses so the operator is fully aware of the network exposure surface.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-351]** Both gRPC and MCP ports MUST always be bound simultaneously. ([SEC-015-BR-004])
- **Type:** Security
- **Description:** Both gRPC and MCP ports MUST always be bound simultaneously. There is no configuration option to disable either port individually at MVP.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-352]** If gRPC and MCP are configured to the same port number, startup MUST fail during config validation — before any port binding — with error: `"invalid_argument: server. ([SEC-015-BR-005])
- **Type:** Security
- **Description:** If gRPC and MCP are configured to the same port number, startup MUST fail during config validation — before any port binding — with error: `"invalid_argument: server.listen and server.mcp_port must be different"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-353]** The server MUST NOT bind to port 0 (OS-assigned ephemeral port) except in test contexts identified by the presence of the `DEVS_TEST_MODE=1` environment variable paired with an isolated `DEVS_DISCOVERY_FILE` path. ([SEC-015-BR-006])
- **Type:** Security
- **Description:** The server MUST NOT bind to port 0 (OS-assigned ephemeral port) except in test contexts identified by the presence of the `DEVS_TEST_MODE=1` environment variable paired with an isolated `DEVS_DISCOVERY_FILE` path. Ephemeral-port binding outside test contexts is rejected at config validation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-354]** `devs-mcp-bridge` MUST forward the remote socket identity of its spawning process via the `X-Forwarded-For` HTTP header on every proxied request, enabling the MCP server's audit log to record the originating client. ([SEC-016-BR-001])
- **Type:** Security
- **Description:** `devs-mcp-bridge` MUST forward the remote socket identity of its spawning process via the `X-Forwarded-For` HTTP header on every proxied request, enabling the MCP server's audit log to record the originating client.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-355]** If `devs-mcp-bridge` starts and the MCP address from the discovery file is not reachable (connection refused), it MUST exit with code 1 immediately and write `{"result":null,"error":"server_unreachable: MCP server not reachable at <addr>","fatal":true}` to stdout before attempting to forward any requests. ([SEC-016-BR-002])
- **Type:** Security
- **Description:** If `devs-mcp-bridge` starts and the MCP address from the discovery file is not reachable (connection refused), it MUST exit with code 1 immediately and write `{"result":null,"error":"server_unreachable: MCP server not reachable at <addr>","fatal":true}` to stdout before attempting to forward any requests.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-356]** /// [SEC-017-BR-001]: DEVS_MCP_ADDR MUST be injected into every stage. ([SEC-017-BR-001])
- **Type:** Security
- **Description:** /// [SEC-017-BR-001]: DEVS_MCP_ADDR MUST be injected into every stage.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-357]** The value injected for `DEVS_MCP_ADDR` MUST be a valid HTTP URL in the format `http://<host>:<port>`. ([SEC-017-BR-002])
- **Type:** Security
- **Description:** The value injected for `DEVS_MCP_ADDR` MUST be a valid HTTP URL in the format `http://<host>:<port>`. The host component depends on the execution environment: loopback for local, `host-gateway` or `host.docker.internal` for Docker, and `server.external_addr` for SSH remote stages. If `server.external_addr` is required but not configured, the stage MUST fail before subprocess spawn with `"invalid_argument: server.external_addr required for remote SSH execution but not configured"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-358]** /// [SEC-017-BR-003]: DEVS_LISTEN, DEVS_MCP_PORT, DEVS_DISCOVERY_FILE MUST be stripped. ([SEC-017-BR-003])
- **Type:** Security
- **Description:** /// [SEC-017-BR-003]: DEVS_LISTEN, DEVS_MCP_PORT, DEVS_DISCOVERY_FILE MUST be stripped.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-359]** /// [SEC-017-BR-004]: Stage env MUST NOT reintroduce stripped variables. ([SEC-017-BR-004])
- **Type:** Security
- **Description:** /// [SEC-017-BR-004]: Stage env MUST NOT reintroduce stripped variables.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-360]** At MVP, the MCP server processes all 17 tool calls identically regardless of which process invokes them. ([SEC-018-BR-001])
- **Type:** Security
- **Description:** At MVP, the MCP server processes all 17 tool calls identically regardless of which process invokes them. No `ConnectionContext` attribute is checked against a tool allowlist. This is a documented known limitation contingent on network-perimeter isolation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-361]** The `report_progress`, `signal_completion`, and `report_rate_limit` tools require a `stage_run_id` parameter matching an active `StageRun`. ([SEC-018-BR-002])
- **Type:** Security
- **Description:** The `report_progress`, `signal_completion`, and `report_rate_limit` tools require a `stage_run_id` parameter matching an active `StageRun`. While this is not an authentication mechanism, it functions as implicit scoping: an agent can only signal completion for a stage whose `stage_run_id` it obtained from `.devs_context.json`, which is written exclusively by `devs-executor`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-362]** `stage_run_id` is a UUID4 generated by `devs` at stage dispatch time. ([SEC-018-BR-003])
- **Type:** Security
- **Description:** `stage_run_id` is a UUID4 generated by `devs` at stage dispatch time. It is included in `.devs_context.json` and in audit log events and is visible via `get_run`. It is not treated as a secret, but it is not publicly guessable for a newly dispatched stage.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-363]** /// [SEC-020-BR-001]: uses std::fs::canonicalize(); no manual string manipulation. ([SEC-020-BR-001])
- **Type:** Security
- **Description:** /// [SEC-020-BR-001]: uses std::fs::canonicalize(); no manual string manipulation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-364]** /// [SEC-020-BR-002]: uses Path::starts_with(); no string prefix matching. ([SEC-020-BR-002])
- **Type:** Security
- **Description:** /// [SEC-020-BR-002]: uses Path::starts_with(); no string prefix matching.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-365]** On Windows, path separators are normalized: both `\` and `/` are accepted as input and normalized to forward-slash for policy evaluation. ([SEC-020-BR-003])
- **Type:** Security
- **Description:** On Windows, path separators are normalized: both `\` and `/` are accepted as input and normalized to forward-slash for policy evaluation. Drive letter prefixes (e.g., `C:\`) are preserved during canonicalization. The workspace boundary check uses case-insensitive comparison on Windows because NTFS is case-insensitive by default.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-366]** Glob patterns used in `search_files` MUST be evaluated within the workspace boundary. ([SEC-020-BR-004])
- **Type:** Security
- **Description:** Glob patterns used in `search_files` MUST be evaluated within the workspace boundary. The glob expansion engine MUST NOT follow symlinks that would resolve outside the workspace root. Any glob match that — after resolution — falls outside the workspace root is silently excluded from results (not an error).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-367]** The regex engine used in `search_content` MUST be the `regex` crate (or an equivalent with guaranteed linear-time complexity). ([SEC-020-BR-005])
- **Type:** Security
- **Description:** The regex engine used in `search_content` MUST be the `regex` crate (or an equivalent with guaranteed linear-time complexity). Backtracking regex engines that allow catastrophic backtracking (e.g., `"(?s).{10000000}"`) are PROHIBITED. A per-query timeout of 5 seconds MUST be enforced regardless of the engine's complexity guarantees.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-368]** /// [SEC-021-BR-001]: No KDF applied; secret used directly as HMAC key. ([SEC-021-BR-001])
- **Type:** Security
- **Description:** /// [SEC-021-BR-001]: No KDF applied; secret used directly as HMAC key.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-369]** /// [SEC-021-BR-002]: Signature computed over the exact bytes sent as the HTTP body. ([SEC-021-BR-002])
- **Type:** Security
- **Description:** /// [SEC-021-BR-002]: Signature computed over the exact bytes sent as the HTTP body.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-370]** The `X-Devs-Signature-256` header MUST be present in every POST request when a `secret` is configured. ([SEC-021-BR-003])
- **Type:** Security
- **Description:** The `X-Devs-Signature-256` header MUST be present in every POST request when a `secret` is configured. It MUST be absent entirely when no `secret` is configured. Receivers MUST NOT receive an empty or zero-value signature header.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-371]** /// [SEC-021-BR-004]: Constant-time comparison is mandatory. ([SEC-021-BR-004])
- **Type:** Security
- **Description:** /// [SEC-021-BR-004]: Constant-time comparison is mandatory.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-372]** The `secret` value MUST NOT appear in any log entry, audit event, checkpoint file, webhook payload, or error message. ([SEC-021-BR-005])
- **Type:** Security
- **Description:** The `secret` value MUST NOT appear in any log entry, audit event, checkpoint file, webhook payload, or error message. Only the boolean outcome of HMAC computation (the resulting hex digest) is ever emitted externally.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-373]** All gRPC service handler methods receive a `tonic::Request<T>` which carries request metadata. ([SEC-022-BR-001])
- **Type:** Security
- **Description:** All gRPC service handler methods receive a `tonic::Request<T>` which carries request metadata. A future auth interceptor can examine `request.metadata().get("authorization")` without modifying handler signatures. No handler inspects the `authorization` metadata field at MVP.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-374]** The `ConnectionContext` struct (§2. ([SEC-022-BR-002])
- **Type:** Security
- **Description:** The `ConnectionContext` struct (§2.1.1) includes the `authenticated_as: Option<String>` field, which is always `None` at MVP but emitted as `null` in audit log entries. Post-MVP authentication layers populate this field; all existing log consumers treat `null` as anonymous access.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-375]** The MCP HTTP handler is implemented as a composable `tower::Service`. ([SEC-022-BR-003])
- **Type:** Security
- **Description:** The MCP HTTP handler is implemented as a composable `tower::Service`. A post-MVP auth middleware can wrap the service at the server builder level without modifying any MCP tool dispatch logic.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-376]** No auth-related configuration keys are valid in `devs. ([SEC-022-BR-004])
- **Type:** Security
- **Description:** No auth-related configuration keys are valid in `devs.toml` at MVP. If an `[auth]` section appears in `devs.toml`, startup MUST fail before port binding with `"invalid_argument: [auth] section is not supported at MVP; remove it from devs.toml"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-377]** The gRPC and MCP ports MUST be the only two TCP listening sockets created by the `devs-server` process. ([SEC-ATK-001])
- **Type:** Security
- **Description:** The gRPC and MCP ports MUST be the only two TCP listening sockets created by the `devs-server` process. No additional listening sockets are permitted. This is structurally enforced by `[ARCH-BR-001]`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-378]** The `devs-mcp-bridge` binary MUST NOT create any TCP listening socket. ([SEC-ATK-002])
- **Type:** Security
- **Description:** The `devs-mcp-bridge` binary MUST NOT create any TCP listening socket. It operates exclusively via stdin/stdout OS pipes and outbound HTTP to the configured MCP port.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-379]** On Unix systems, the following file permission modes MUST be applied at creation time: discovery file `0600`; `projects. ([SEC-ATK-003])
- **Type:** Security
- **Description:** On Unix systems, the following file permission modes MUST be applied at creation time: discovery file `0600`; `projects.toml` `0600`; `~/.config/devs/` directory `0700`; `.devs/logs/` directory `0700`; individual log files `0600`. On Windows, equivalent ACLs restricted to the server process owner apply per `[FEAT-BR-001]`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-380]** Any addition to the above entry-point table requires updating this document section before the change is merged to main. ([SEC-ATK-004])
- **Type:** Security
- **Description:** Any addition to the above entry-point table requires updating this document section before the change is merged to main.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-381]** The `devs-mcp-bridge` discovers the MCP server address by reading the discovery file (via `DEVS_DISCOVERY_FILE` or `~/. ([SEC-BRIDGE-001])
- **Type:** Security
- **Description:** The `devs-mcp-bridge` discovers the MCP server address by reading the discovery file (via `DEVS_DISCOVERY_FILE` or `~/.config/devs/server.addr`) to obtain the gRPC address, then calling `ServerService.GetInfo` to retrieve the MCP port. This discovery MUST happen at bridge startup. If discovery fails, the bridge exits with code 1 and writes `{"result": null, "error": "server_unreachable: could not locate devs MCP server", "fatal": true}` to stdout.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-382]** The bridge connects to the MCP HTTP endpoint at `http://<host>:<mcp_port>/mcp/v1/call`. ([SEC-BRIDGE-002])
- **Type:** Security
- **Description:** The bridge connects to the MCP HTTP endpoint at `http://<host>:<mcp_port>/mcp/v1/call`. If the discovered gRPC host is non-loopback, the bridge MUST use `https://` instead of `http://`. The bridge uses `rustls` for HTTPS connections (same library as the main server) and validates the server's TLS certificate against the system trust store. Self-signed certificates require explicit configuration via `DEVS_BRIDGE_CA_CERT` environment variable (path to a PEM CA cert bundle).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-383]** The `devs-mcp-bridge` MUST NOT buffer requests. ([SEC-BRIDGE-003])
- **Type:** Security
- **Description:** The `devs-mcp-bridge` MUST NOT buffer requests. Each JSON-RPC request received on stdin (one per line) is forwarded immediately to the MCP HTTP server. The response from the server is written to stdout immediately (one JSON object per line) with no buffering. This prevents request pipelining and reduces the window for in-memory sensitive data accumulation.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-384]** The bridge MUST NOT log stdin or stdout content (which may contain workflow definitions, tool outputs, or sensitive data). ([SEC-BRIDGE-004])
- **Type:** Security
- **Description:** The bridge MUST NOT log stdin or stdout content (which may contain workflow definitions, tool outputs, or sensitive data). Only connection lifecycle events are logged: `"devs-mcp-bridge: connected to <host>:<port>"`, `"devs-mcp-bridge: server connection lost; exiting"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-385]** After one failed reconnect attempt (1-second delay), the bridge exits with code 1 and emits: `{"result": null, "error": "internal: server connection lost", "fatal": true}`. ([SEC-BRIDGE-005])
- **Type:** Security
- **Description:** After one failed reconnect attempt (1-second delay), the bridge exits with code 1 and emits: `{"result": null, "error": "internal: server connection lost", "fatal": true}`. The bridge does NOT attempt indefinite reconnection, as this would cause the AI agent using it to block indefinitely. Per **[MCP-057]**, the agent MUST handle this fatal error and write `task_state.json` before terminating.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-386]** Every file written by `devs` to a stage working directory MUST be created before the agent subprocess is spawned and cleaned up after the subprocess exits, regardless of exit code. ([SEC-DAT-001])
- **Type:** Security
- **Description:** Every file written by `devs` to a stage working directory MUST be created before the agent subprocess is spawned and cleaned up after the subprocess exits, regardless of exit code.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-387]** Sensitive in-memory values (API keys loaded from TOML, TLS private key bytes) MUST NOT be copied into any string that is logged via `tracing` at any level, serialized into a checkpoint file, or transmitted in any gRPC or MCP response. ([SEC-DAT-002])
- **Type:** Security
- **Description:** Sensitive in-memory values (API keys loaded from TOML, TLS private key bytes) MUST NOT be copied into any string that is logged via `tracing` at any level, serialized into a checkpoint file, or transmitted in any gRPC or MCP response.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-388]** The `Redacted<T>` wrapper type (defined in `devs-core/src/redacted. ([SEC-DAT-003])
- **Type:** Security
- **Description:** The `Redacted<T>` wrapper type (defined in `devs-core/src/redacted.rs`) MUST be used for all fields in config structs that hold credential values, ensuring they are `Debug`-printed as `[REDACTED]` and serialized to JSON as the literal string `"[REDACTED]"`. The actual value is accessible only through the `.expose()` method.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-389]** The `Redacted<T>` type MUST implement `serde::Serialize` to emit the literal string `"[REDACTED]"` when serialized to JSON or TOML. ([SEC-DAT-004])
- **Type:** Security
- **Description:** The `Redacted<T>` type MUST implement `serde::Serialize` to emit the literal string `"[REDACTED]"` when serialized to JSON or TOML. It MUST implement `std::fmt::Debug` to emit `[REDACTED]` in debug output. The actual value is accessible only through the `.expose()` method, which is `#[must_use]`. This is defined in `devs-core/src/redacted.rs`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-390]** At startup, after loading `devs. ([SEC-DAT-005])
- **Type:** Security
- **Description:** At startup, after loading `devs.toml`, the server MUST zeroize all TOML-sourced credential strings from the intermediate parsed TOML representation before the buffer goes out of scope. This is achieved by using the `zeroize` crate's `Zeroizing<String>` wrapper on the raw string buffer after extraction into `Redacted<String>` fields.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-391]** The bare clone directory `~/. ([SEC-DAT-006])
- **Type:** Security
- **Description:** The bare clone directory `~/.config/devs/state-repos/<project-id>.git` MUST be created with mode `0700` (owner only). The parent `~/.config/devs/` directory MUST be created with mode `0700` if it does not already exist.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-392]** Git commit objects in the checkpoint branch contain stage stdout and stderr (up to 1 MiB each). ([SEC-DAT-007])
- **Type:** Security
- **Description:** Git commit objects in the checkpoint branch contain stage stdout and stderr (up to 1 MiB each). If an agent prints a credential to stdout, it will appear in the checkpoint git history. The `devs project add` command MUST emit: `"NOTE: Stage stdout/stderr is committed to the git checkpoint branch. Avoid printing credentials in agent outputs."`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-393]** The `devs-checkpoint` crate MUST NOT expose the `git2::Repository` handle outside the crate. ([SEC-DAT-008])
- **Type:** Security
- **Description:** The `devs-checkpoint` crate MUST NOT expose the `git2::Repository` handle outside the crate. All interactions with the checkpoint store go through the `CheckpointStore` trait interface to prevent callers from bypassing security controls.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-394]** On Unix systems, the server MUST verify after writing the discovery file that the resulting file mode is `0600`. ([SEC-DAT-009])
- **Type:** Security
- **Description:** On Unix systems, the server MUST verify after writing the discovery file that the resulting file mode is `0600`. If the process `umask` causes a different mode, the server MUST call `fs::set_permissions()` explicitly. If `set_permissions` fails, the server MUST log `ERROR` and exit non-zero — a world-readable discovery file exposes the gRPC address to all local users.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-395]** On Windows, the discovery file is written to `%APPDATA%\devs\server. ([SEC-DAT-010])
- **Type:** Security
- **Description:** On Windows, the discovery file is written to `%APPDATA%\devs\server.addr`. Windows ACL-level restrictions are not programmatically enforced at MVP (the directory is user-owned by default). A `WARN` is logged at startup: `"Discovery file Windows ACL enforcement is not implemented; ensure %APPDATA%\\devs is not shared."`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-396]** The `. ([SEC-DAT-011])
- **Type:** Security
- **Description:** The `.devs_context.json` file written by `devs-executor` before agent spawn MUST be created with mode `0600`. Its content includes `stdout` and `stderr` from all completed dependent stages (up to the 10 MiB total cap), which may contain sensitive information printed by prior agents.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-397]** The `. ([SEC-DAT-012])
- **Type:** Security
- **Description:** The `.devs_output.json` file written by the agent (in `structured_output` completion mode) is read by `devs-executor` after the agent exits. The executor MUST validate that the file size does not exceed **4 MiB** before reading. Files exceeding this limit are rejected; the stage transitions to `Failed` with `"structured_output: file exceeds 4 MiB limit"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-398]** Neither `. ([SEC-DAT-013])
- **Type:** Security
- **Description:** Neither `.devs_context.json` nor `.devs_output.json` are persisted to the checkpoint git store as raw files. They exist only in the stage's isolated working directory and are deleted during cleanup. The executor copies the parsed structured output value into the in-memory `StageOutput.structured` field and the git-committed `stages/<name>/attempt_<N>/structured_output.json` before deleting the working directory.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-399]** Working directory paths are: ([SEC-DAT-014])
- **Type:** Security
- **Description:** Working directory paths are:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-400]** The stage working directory MUST be deleted recursively after the stage completes, regardless of success or failure. ([SEC-DAT-015])
- **Type:** Security
- **Description:** The stage working directory MUST be deleted recursively after the stage completes, regardless of success or failure. If deletion fails (e.g., the agent left locked files on Windows), the failure MUST be logged at `WARN` and execution continues. The failed deletion does not affect the stage's `StageStatus`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-401]** For tempdir execution, the project repository is cloned into `<os-tempdir>/devs-<run-id>-<stage-name>/repo/` (a subdirectory of the working dir). ([SEC-DAT-016])
- **Type:** Security
- **Description:** For tempdir execution, the project repository is cloned into `<os-tempdir>/devs-<run-id>-<stage-name>/repo/` (a subdirectory of the working dir). Git clone credentials (SSH key or HTTPS token) MUST NOT be written to the working directory; they are passed via `git2` in-memory configuration only.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-402]** The working directory MUST NOT be created inside the project's own repository tree. ([SEC-DAT-017])
- **Type:** Security
- **Description:** The working directory MUST NOT be created inside the project's own repository tree. Creating the working directory within the repo would risk the agent committing working files as project changes. The executor MUST verify that the resolved absolute path of the working directory does not share a prefix with the project `repo_path`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-403]** Log files written to `. ([SEC-DAT-018])
- **Type:** Security
- **Description:** Log files written to `.devs/logs/<run-id>/<stage-name>/attempt_<N>/stdout.log` and `stderr.log` MUST be created with mode `0600`. Parent directories MUST be created with mode `0700`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-404]** Log files are written incrementally as the agent produces output (streaming write). ([SEC-DAT-019])
- **Type:** Security
- **Description:** Log files are written incrementally as the agent produces output (streaming write). If a single log line exceeds **32 KiB**, the line is truncated at 32 KiB and the truncation is appended as `[TRUNCATED]`. This prevents a pathological agent from consuming unbounded disk space with a single output line.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-405]** Log retention is controlled by `retention. ([SEC-DAT-020])
- **Type:** Security
- **Description:** Log retention is controlled by `retention.max_age_days` (default 30) and `retention.max_size_mb` (default 500). The retention sweep deletes entire run directories atomically; partial deletion within a run is not permitted.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-406]** Log files MUST NOT be served via the gRPC `StreamLogs` or MCP `stream_logs` APIs with more than **1 MiB** of content per request. ([SEC-DAT-021])
- **Type:** Security
- **Description:** Log files MUST NOT be served via the gRPC `StreamLogs` or MCP `stream_logs` APIs with more than **1 MiB** of content per request. Clients requesting full logs for stages with > 1 MiB of output receive the most recent 1 MiB with `"truncated": true`. The full content remains on disk and in the git checkpoint.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-407]** On Unix, after creating any file or directory in the above table, `devs` MUST call `fs::set_permissions()` explicitly rather than relying on the process `umask`. ([SEC-DAT-022])
- **Type:** Security
- **Description:** On Unix, after creating any file or directory in the above table, `devs` MUST call `fs::set_permissions()` explicitly rather than relying on the process `umask`. This ensures the intended mode is always applied regardless of the operator's shell environment.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-408]** On Windows, `devs` MUST create files using `OpenOptions::new(). ([SEC-DAT-023])
- **Type:** Security
- **Description:** On Windows, `devs` MUST create files using `OpenOptions::new().create_new(true)` where atomic creation is required. Windows ACL manipulation is not implemented at MVP. A startup `INFO` log is emitted on Windows: `"File permission enforcement limited to creation flags on Windows; use NTFS ACLs for additional isolation."`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-409]** All MCP HTTP responses MUST include the following security headers regardless of whether TLS is in u ([SEC-MCP-001])
- **Type:** Security
- **Description:** All MCP HTTP responses MUST include the following security headers regardless of whether TLS is in use:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-410]** The MCP server MUST enforce a maximum request body size of **1 MiB** (1,048,576 bytes). ([SEC-MCP-002])
- **Type:** Security
- **Description:** The MCP server MUST enforce a maximum request body size of **1 MiB** (1,048,576 bytes). Requests exceeding this limit MUST be rejected without reading the full body with HTTP 413 `{"result": null, "error": "request body exceeds 1 MiB limit"}`. The `Content-Length` header is checked first; if absent, the body is read up to 1 MiB + 1 byte; if the extra byte is present, the request is rejected.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-411]** The MCP server MUST reject requests with `Content-Type` other than `application/json` with HTTP 415 `{"result": null, "error": "Content-Type must be application/json"}`. ([SEC-MCP-003])
- **Type:** Security
- **Description:** The MCP server MUST reject requests with `Content-Type` other than `application/json` with HTTP 415 `{"result": null, "error": "Content-Type must be application/json"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-412]** The MCP server MUST NOT handle `GET`, `PUT`, `DELETE`, `PATCH`, or `HEAD` methods. ([SEC-MCP-004])
- **Type:** Security
- **Description:** The MCP server MUST NOT handle `GET`, `PUT`, `DELETE`, `PATCH`, or `HEAD` methods. Only `POST` is accepted at `/mcp/v1/call`. Other methods return HTTP 405 with `Allow: POST` header and `{"result": null, "error": "method not allowed; use POST"}`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-413]** The MCP port MUST be different from the gRPC port. ([SEC-MCP-005])
- **Type:** Security
- **Description:** The MCP port MUST be different from the gRPC port. If they are configured to be equal, config validation MUST report `invalid_argument: gRPC port and MCP port must be different` before any binding attempt.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-414]** The MCP server MUST handle panics in tool handler functions without crashing the server. ([SEC-MCP-006])
- **Type:** Security
- **Description:** The MCP server MUST handle panics in tool handler functions without crashing the server. A panic in any tool handler MUST be caught by a `catch_unwind` boundary in the HTTP request dispatcher and returned as HTTP 500 `{"result": null, "error": "internal: tool handler panicked"}`. The panic backtrace is logged at `ERROR` but NOT included in the HTTP response.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-415]** The MCP server MUST limit concurrent connections to **64** per **[MCP-BR-042]**. ([SEC-MCP-007])
- **Type:** Security
- **Description:** The MCP server MUST limit concurrent connections to **64** per **[MCP-BR-042]**. New connections beyond this limit receive HTTP 503 `{"result": null, "error": "resource_exhausted: max concurrent connections reached"}` and are immediately closed.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-416]** For `stream_logs` with `follow: true`, the HTTP response uses chunked transfer encoding. ([SEC-MCP-008])
- **Type:** Security
- **Description:** For `stream_logs` with `follow: true`, the HTTP response uses chunked transfer encoding. The streaming connection is subject to a **30-minute maximum lifetime** per stream. After 30 minutes, the server sends the terminal chunk `{"done": true, "truncated": false, "total_lines": <N>}` and closes the connection. Clients requiring a longer stream MUST reconnect using `from_sequence` to resume.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-417]** The MCP server MUST NOT log request bodies (which may contain workflow definitions, stage outputs, or sensitive data). ([SEC-MCP-009])
- **Type:** Security
- **Description:** The MCP server MUST NOT log request bodies (which may contain workflow definitions, stage outputs, or sensitive data). Only the JSON-RPC `method` name and request `id` fields are logged at `DEBUG` level.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-418]** API key strings loaded from `devs. ([SEC-MEM-001])
- **Type:** Security
- **Description:** API key strings loaded from `devs.toml` MUST be zeroized (overwritten with zeros) when the intermediate TOML parse buffer goes out of scope. This is implemented by wrapping the raw TOML credential string in a `Zeroizing<String>` buffer (from the `zeroize` crate) before the value is moved into a `Redacted<String>`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-419]** TLS private key bytes MUST be held in `zeroize::Zeroizing<Vec<u8>>` until they are consumed by `rustls::PrivateKey::from()`. ([SEC-MEM-002])
- **Type:** Security
- **Description:** TLS private key bytes MUST be held in `zeroize::Zeroizing<Vec<u8>>` until they are consumed by `rustls::PrivateKey::from()`. After the `rustls` key object is constructed, the raw bytes buffer is dropped and zeroed. The constructed `rustls::PrivateKey` is held in a `Redacted<rustls::PrivateKey>` wrapper for the lifetime of the server.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-420]** Webhook secret strings (HMAC-SHA256 keys) MUST be stored as `Redacted<String>` in `WebhookTarget. ([SEC-MEM-003])
- **Type:** Security
- **Description:** Webhook secret strings (HMAC-SHA256 keys) MUST be stored as `Redacted<String>` in `WebhookTarget.secret`. The HMAC computation reads the key via `.expose()` only for the duration of the hash computation and does not retain a reference after the result is produced.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-421]** On Linux, the server MUST attempt to disable core dumps at startup by calling `setrlimit(RLIMIT_CORE, {rlim_cur: 0, rlim_max: 0})` via `libc`. ([SEC-MEM-004])
- **Type:** Security
- **Description:** On Linux, the server MUST attempt to disable core dumps at startup by calling `setrlimit(RLIMIT_CORE, {rlim_cur: 0, rlim_max: 0})` via `libc`. If this call fails (e.g., running in a container without `CAP_SYS_RESOURCE`), a `WARN` is logged but the server continues: `"WARN: Could not disable core dumps; process credentials may be exposed in crash dumps."`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-422]** On macOS, `ptrace(PT_DENY_ATTACH, 0, 0, 0)` is attempted to prevent debugger attachment to the server process. ([SEC-MEM-005])
- **Type:** Security
- **Description:** On macOS, `ptrace(PT_DENY_ATTACH, 0, 0, 0)` is attempted to prevent debugger attachment to the server process. Failure (common in containerized environments) is logged at `DEBUG` and does not prevent startup.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-423]** On Windows, core dump prevention is not implemented at MVP. ([SEC-MEM-006])
- **Type:** Security
- **Description:** On Windows, core dump prevention is not implemented at MVP. The server logs a startup `INFO`: `"Core dump prevention not implemented on Windows; use Windows Error Reporting settings to restrict dump capture."`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-424]** The server MUST call `mlockall(MCL_CURRENT | MCL_FUTURE)` on Linux if and only if running as root or with `CAP_IPC_LOCK`. ([SEC-MEM-007])
- **Type:** Security
- **Description:** The server MUST call `mlockall(MCL_CURRENT | MCL_FUTURE)` on Linux if and only if running as root or with `CAP_IPC_LOCK`. If the call succeeds, a startup `INFO` is logged: `"Memory locked; credentials will not be swapped to disk."`. If the call fails for a non-privileged process, no `WARN` is emitted (non-root operation is the common case).
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-425]** Agent subprocesses MUST NOT inherit the server process's file descriptors beyond `stdin`, `stdout`, and `stderr`. ([SEC-MEM-008])
- **Type:** Security
- **Description:** Agent subprocesses MUST NOT inherit the server process's file descriptors beyond `stdin`, `stdout`, and `stderr`. All other file descriptors (gRPC server sockets, MCP server socket, git2 handles, log file handles) MUST be closed in the child process before `exec`. This is achieved by setting `O_CLOEXEC` on all file descriptors opened by the server.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-426]** On Unix, the server MUST set `O_CLOEXEC` (`FD_CLOEXEC`) on every file descriptor it opens (server sockets, log files, git repo handles). ([SEC-MEM-009])
- **Type:** Security
- **Description:** On Unix, the server MUST set `O_CLOEXEC` (`FD_CLOEXEC`) on every file descriptor it opens (server sockets, log files, git repo handles). In Rust, `std::fs::File` and `std::net::TcpListener` set `O_CLOEXEC` by default on Linux 2.6.23+ and macOS 10.12+; this default MUST NOT be overridden.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-427]** The `portable-pty` crate used for PTY allocation MUST be configured to not leak non-PTY file descriptors to child processes. ([SEC-MEM-010])
- **Type:** Security
- **Description:** The `portable-pty` crate used for PTY allocation MUST be configured to not leak non-PTY file descriptors to child processes. Verify that the `portable-pty` version in use does not inadvertently clear `O_CLOEXEC` on the pty master fd before forking.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-428]** No threat in the MVP STRIDE analysis is rated **CRITICAL**. ([SEC-RISK-001])
- **Type:** Security
- **Description:** No threat in the MVP STRIDE analysis is rated **CRITICAL**. The implementation MUST NOT introduce any new residual risk rated **HIGH** or **CRITICAL** without updating §1.4 in this document and obtaining explicit design approval. Approval MUST be recorded as a commit to this specification file, not as a code comment.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-429]** The STRIDE analysis in §1. ([SEC-RISK-002])
- **Type:** Security
- **Description:** The STRIDE analysis in §1.4 MUST be reviewed and updated whenever any of the following changes are made to the implementation:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-430]** Each threat rated **HIGH** with "accepted MVP risk" MUST have a corresponding audit log event emitted when the threat condition is triggered or detected. ([SEC-RISK-003])
- **Type:** Security
- **Description:** Each threat rated **HIGH** with "accepted MVP risk" MUST have a corresponding audit log event emitted when the threat condition is triggered or detected. The `event_type` values for these events are defined in §5.2 and include `security.misconfiguration`, `security.ssrf_blocked`, and `security.credential_in_config`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-431]** The SSH known-hosts file path used by `devs-executor` is resolved in this order: ([SEC-SSH-001])
- **Type:** Security
- **Description:** The SSH known-hosts file path used by `devs-executor` is resolved in this order:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-432]** SSH private key files used for `RemoteSshExecutor` connections MUST have mode `0600` (owner read only) on Unix. ([SEC-SSH-002])
- **Type:** Security
- **Description:** SSH private key files used for `RemoteSshExecutor` connections MUST have mode `0600` (owner read only) on Unix. If the key file is more permissive (e.g., `0644`), the `ssh2` crate will typically reject the key. `devs-executor` additionally checks permissions before attempting connection and logs `WARN` if the file is group- or world-readable.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-433]** The `x-devs-client-version` gRPC metadata header MUST be verified on every RPC call after TLS establishment. ([SEC-TLS-001])
- **Type:** Security
- **Description:** The `x-devs-client-version` gRPC metadata header MUST be verified on every RPC call after TLS establishment. A missing header returns `FAILED_PRECONDITION: "x-devs-client-version header is required"`. A major version mismatch returns `FAILED_PRECONDITION: "client major version <N> is incompatible with server major version <M>"`.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-434]** The TLS private key file MUST be read only once at startup during config validation. ([SEC-TLS-002])
- **Type:** Security
- **Description:** The TLS private key file MUST be read only once at startup during config validation. The parsed key bytes are held in memory for the server's lifetime. The file path MUST be wrapped in `Redacted<PathBuf>` in `TlsConfig` to prevent path leakage in debug output.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-435]** Both gRPC (default port 7890) and MCP HTTP (default port 7891) MUST use the same `[server. ([SEC-TLS-003])
- **Type:** Security
- **Description:** Both gRPC (default port 7890) and MCP HTTP (default port 7891) MUST use the same `[server.tls]` configuration when TLS is enabled. There is no separate TLS config per port. The same certificate and key are used for both listeners.
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-436]** Webhook delivery MUST use `reqwest` with the `rustls-tls` feature. ([SEC-WH-001])
- **Type:** Security
- **Description:** Webhook delivery MUST use `reqwest` with the `rustls-tls` feature. The `reqwest::Client` used for webhook delivery MUST be constructed with:
- **Source:** Security Design (docs/plan/specs/5_security_design.md)
- **Dependencies:** None

## Referenced and Placeholder Tags

The following tags are mentioned in the source document as references or placeholders and are listed here for traceability.

- [2_TAS-BR-015]
- [2_TAS-BR-016]
- [2_TAS-BR-022]
- [2_TAS-BR-025]
- [2_TAS-BR-WH-003]
- [2_TAS-REQ-144]
- [3_PRD-BR-026]
- [3_PRD-BR-031]
- [A-Z0-9_]
- [A-Z_]
- [AC-SEC-N-NNN]
- [ARCH-AC-009]
- [ARCH-BR-001]
- [ARCH-BR-008]
- [FEAT-BR-001]
- [FEAT-BR-011]
- [FEAT-BR-016]
- [MCP-057]
- [MCP-075]
- [MCP-BR-004]
- [MCP-BR-040]
- [MCP-BR-042]
- [MCP-BR-043]
- [MCP-DBG-BR-005]
- [SEC-NNN]
