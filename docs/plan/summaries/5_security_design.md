# Summary: Security Design

Normative security specification for the `devs` MVP. All `[SEC-NNN]` tags are mandatory; every `[AC-SEC-N-NNN]` must be covered by an automated test annotated `// Covers: AC-SEC-N-NNN`. MVP is explicitly trusted-network-only; no client auth is enforced.

---

## Key Data Types

| Type | Crate | Purpose |
|---|---|---|
| `Redacted<T>` | `devs-core::security` | Renders as `"[REDACTED]"` in all Debug/Display/Serialize; `.expose()` for access |
| `BoundedString<N>` | `devs-core` | UTF-8 string with compile-time byte-length cap; enforced at serde deserialization |
| `EnvKey` | `devs-core` | Validated env key: `[A-Z_][A-Z0-9_]{0,127}`; prohibits shell-special chars |
| `SsrfError` | `devs-webhook::ssrf` | Returned by `check_ssrf(url, allow_local)` after DNS resolution |

---

## §1 Threat Model & Attack Surface

**[SEC-001]** MVP is trusted-network only; loopback bind (`127.0.0.1`) is the default. Non-loopback → `WARN` with `event_type: "security.misconfiguration"`, `check_id: "SEC-BIND-ADDR"` (non-fatal).
**[SEC-002]** Post-MVP mTLS/bearer-token pathway is forward-compatible; no handler changes required.

**Attack surface entry points:** gRPC `:7890`, MCP HTTP `:7891`, `devs-mcp-bridge` stdio, agent subprocess stdin, `devs.toml`, `projects.toml`, discovery file `~/.config/devs/server.addr`, `.devs/` checkpoint store, outbound webhooks, Docker socket, remote SSH.

**[SEC-ATK-001]** Only two TCP listeners permitted: gRPC and MCP.
**[SEC-ATK-002]** `devs-mcp-bridge` MUST NOT create any TCP listener.
**[SEC-ATK-003]** File modes: discovery `0600`, `projects.toml` `0600`, `~/.config/devs/` `0700`, `.devs/logs/` `0700`, log files `0600`.

### Primary Attack Vectors

- **[SEC-003]** Prompt injection is highest-severity. Mitigated by single-pass template expansion (**[SEC-040]**) and 10,240-byte truncation (**[SEC-042]**).
- **[SEC-004]** API keys (`CLAUDE_API_KEY`, etc.) MUST NOT appear in `tracing` log output.
- **[SEC-005]** Agents run with same OS privileges as server. `tempdir`/`docker`/`remote` execution environments provide primary isolation.
- **[SEC-006]** Template expansion is single-pass; no recursive re-expansion.
- **[SEC-007]** `prompt_file` paths validated against `..` traversal at definition time.
- **[SEC-008]** Corrupted checkpoint → `Unrecoverable`; server continues.
- **[SEC-009]** Webhook SSRF: URL validated post-DNS (DNS-rebinding defense).
- **[SEC-010]** Credentials in `devs.toml` → startup `WARN`; key name only, never value.
- **[SEC-011]** Agent log output written verbatim; ANSI stripped only in TUI render layer.
- **[SEC-012]** Docker/SSH execution environments enlarge blast radius.
- **[SEC-013]** Glass-Box MCP exposure is accepted MVP risk; requires network isolation.

### STRIDE Summary

| Category | Key Threat | Residual Risk | Primary Controls |
|---|---|---|---|
| Spoofing | Client impersonation | HIGH (accepted) | Loopback bind; post-MVP mTLS |
| Tampering | Prompt injection via template vars | MEDIUM | SEC-040, SEC-043 |
| Info Disclosure | Credential via stage stdout | HIGH (accepted) | SEC-093, SEC-089 |
| Info Disclosure | MCP full state exposure | HIGH (accepted) | SEC-013, loopback default |
| DoS | Unbounded stage output | LOW | BoundedBytes<1_048_576> |
| EoP | Agent subprocess control | HIGH (accepted) | docker/remote envs |

**[SEC-RISK-001]** No MVP threat is CRITICAL. New HIGH/CRITICAL risks require spec update + explicit approval.
**[SEC-014]** Developer tooling only. Compliance obligations: secret management, audit trails, supply chain CVE scanning.

---

## §2 Authentication & Authorization

**[SEC-015]** No client auth at MVP; access control is network-perimeter-based.
**[SEC-016]** `devs-mcp-bridge` inherits trust of spawning process.
**[SEC-017]** Agent roles are software-enforced (env var detection), not cryptographic. Orchestrated agents have `DEVS_MCP_ADDR` injected; observing agents do not.
**[SEC-018]** MCP does NOT enforce tool-level restrictions by caller identity at MVP.

**Business rules:**
- **[SEC-001-BR-002]** Default bind: `127.0.0.1:7890` when no config and no `DEVS_LISTEN`.
- **[SEC-001-BR-004]** Discovery file contains only gRPC address; MCP port obtained via `ServerService.GetInfo`.
- **[SEC-017-BR-003]** `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` stripped from all agent environments.
- **[SEC-017-BR-004]** Stage/workflow `env` MUST NOT declare `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`, or `DEVS_MCP_ADDR` — rejected at validation.

### Filesystem MCP Access Control [SEC-019, SEC-020]

Per-path policy (path canonicalized via `std::fs::canonicalize()` before evaluation):

| Path | Read | Write |
|---|---|---|
| `target/`, `.devs/runs/`, `.devs/logs/` | Allowed | **Denied** |
| `.devs/workflows/`, `.devs/prompts/`, `.devs/agent-state/`, `crates/*/src/`, `tests/`, `proto/` | Allowed | Allowed |
| Outside workspace root | **Denied** | **Denied** |

**[SEC-020-BR-001]** Must use `std::fs::canonicalize()` — no manual `..` string manipulation.
**[SEC-020-BR-002]** Boundary check via `Path::starts_with()` on `PathBuf`, not string prefix.

### Webhook Signing [SEC-021]

HMAC-SHA256 over raw request body bytes. Header: `X-Devs-Signature-256: sha256=<hex>`. Receiver MUST use constant-time comparison (`subtle::ConstantTimeEq`). Key MUST be ≥ 32 bytes. Crates: `hmac` + `sha2` from RustCrypto.

### `devs security-check` CLI [SEC-059]

Runs without a live server; reads `devs.toml` + `projects.toml` directly. All 7 checks run every invocation (no short-circuit). Exit codes: `0`=all pass, `1`=any warn, `3`=parse error.

| Check ID | Pass Condition |
|---|---|
| `SEC-BIND-ADDR` | `server.listen` starts with `127.` |
| `SEC-TOML-CRED` | No `*_API_KEY` or `*_TOKEN` in `devs.toml` |
| `SEC-FILE-PERM-TOML` | `devs.toml` not world-readable |
| `SEC-FILE-PERM-PROJ` | `projects.toml` not world-readable |
| `SEC-WEBHOOK-TLS` | All webhook URLs use `https://` |
| `SEC-LOCAL-WEBHOOK` | `allow_local_webhooks` absent or false |
| `SEC-SSH-HOST-KEY` | No `StrictHostKeyChecking = no` in ssh_config |

JSON output schema: `{ "schema_version": 1, "checked_at": "...", "overall_passed": bool, "checks": [{ "check_id", "description", "status", "detail", "remediation" }] }`.

### Post-MVP Auth [SEC-022]

Reserved stubs: gRPC mTLS via `tonic` interceptor layer, bearer tokens (`Authorization: Bearer`), MCP HTTP header auth. No handler code changes required. **[SEC-022-BR-004]** `[auth]` section in `devs.toml` causes startup failure at MVP.

---

## §3 Data at Rest & In Transit

### Credential Storage [SEC-023–SEC-026]

- **[SEC-023]** API keys MUST be supplied via OS env vars (mandatory preferred).
- **[SEC-024]** TOML fallback: startup `WARN` per credential key found; file perm check.
- **[SEC-025]** Credentials MUST NEVER appear in logs, checkpoints, context files, webhooks.
- **[SEC-026]** `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` stripped from agent env. Credential vars (`*_API_KEY`, `*_TOKEN`) are inherited (intentional).

`Redacted<T>` implementation: `Debug`/`Display` → `"[REDACTED]"`, `serde::Serialize` → `"[REDACTED]"`, inner value via `.expose()` only. Defined in `devs-core/src/redacted.rs`. TOML-sourced credential strings wrapped in `Zeroizing<String>` (from `zeroize` crate) before moving to `Redacted<String>`.

### Git Checkpoint Store [SEC-027–SEC-029]

- **[SEC-027]** Not encrypted at rest; OS FDE required for encryption.
- **[SEC-028]** Checkpoint branch SHOULD be dedicated `devs/state`.
- **[SEC-029]** Prompt files: mode `0600`; deleted immediately after agent exits; UUID filename (never user-controlled).
- Bare clone at `~/.config/devs/state-repos/<project-id>.git` created with mode `0700`.

### Discovery File [SEC-030]

Mode `0600`; deleted on clean shutdown; atomic overwrite on restart. Contains only gRPC address.

### TLS [SEC-031–SEC-033]

- **[SEC-031]** `rustls` only (`rustls-tls` feature); TLS 1.2 minimum; optional for non-loopback (WARN logged if absent).
- **[SEC-032]** TLS 1.3 suites: `TLS_AES_256_GCM_SHA384`, `TLS_AES_128_GCM_SHA256`, `TLS_CHACHA20_POLY1305_SHA256`. Prohibited: RC4, 3DES, NULL, MD5-based, export-grade.
- **[SEC-033]** Server MUST warn on start without TLS cert on non-loopback bind (`check_id: "SEC-TLS-MISSING"`); server still starts.
- RSA keys < 3072 bits rejected; ECDSA P-256/P-384 accepted.
- Expired cert → refuse to start. Expiry within 30 days → `WARN` only.

### File Permission Model Reference

| Path | Mode | Deleted By |
|---|---|---|
| `~/.config/devs/` | `0700` | Never |
| `~/.config/devs/server.addr` | `0600` | Server on SIGTERM |
| `~/.config/devs/projects.toml` | `0600` | `devs project remove` |
| `~/.config/devs/state-repos/` | `0700` | Never |
| `<working-dir>/` | `0700` | `devs-executor` post-stage |
| `<working-dir>/.devs_prompt_<uuid>` | `0600` | `devs-adapters` after agent exits |
| `<working-dir>/.devs_context.json` | `0600` | Executor with working dir |
| `.devs/runs/<run-id>/checkpoint.json` | `0600` | Retention sweep |
| `.devs/runs/<run-id>/workflow_snapshot.json` | `0600` | Retention sweep |
| `.devs/logs/<run-id>/` | `0700` | Retention sweep |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/stdout.log` | `0600` | Retention sweep |

**[SEC-DAT-022]** All files MUST use explicit `fs::set_permissions()` — never rely on `umask`.

### SSRF Blocklist [SEC-036, SEC-037]

Blocked ranges: `127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`, `::1/128`, `fc00::/7`, `fe80::/10`. Check re-evaluated per delivery attempt (no DNS caching). ALL resolved addresses must pass.

### MCP HTTP Security [SEC-034, SEC-MCP-001–009]

- Max request body: 1 MiB → HTTP 413.
- Required `Content-Type: application/json` → HTTP 415.
- Only `POST /mcp/v1/call` → other methods HTTP 405.
- Max concurrent connections: 64 → HTTP 503.
- `stream_logs follow:true` max lifetime: 30 minutes.
- Security headers on all responses: `X-Content-Type-Options: nosniff`, `Cache-Control: no-store`, `X-Frame-Options: DENY`.
- Tool handler panics → HTTP 500 `{"result":null,"error":"internal: tool handler panicked"}`.

### Webhook Outbound [SEC-035, SEC-WH-001]

- HTTPS required for non-loopback; HTTP → `WARN` per delivery.
- `reqwest` with `.redirect(Policy::none())`, `.timeout(10s)`, `rustls-tls` only, cert validation always enabled.
- Webhook URL max 2048 chars; `file://`, `ftp://`, etc. rejected at config validation.

---

## §4 Application Security Controls

### Injection Prevention

**[SEC-040]** Template resolution single-pass. Scan pointer advances past substituted value; `{{` in resolved values never re-interpreted.
**[SEC-041]** Stage refs outside `depends_on` closure → `TemplateError::UnreachableStage`.
**[SEC-042]** stdout/stderr in templates truncated to last 10,240 bytes.
**[SEC-043]** Structured output template: scalar only; object/array → `TemplateError::NonScalarField`.
**[SEC-044]** Agent spawn uses `tokio::process::Command::arg()` arrays; no shell interpolation.
**[SEC-045]** Prompt files use generated UUID name; never user-controlled filename.
**[SEC-046]** Env keys validated via `EnvKey` type before subprocess spawn.
**[SEC-047]** All user-supplied paths canonicalized via `std::fs::canonicalize()` before use.
**[SEC-048]** `prompt_file` absolute paths and `..` segments rejected at validation time.
**[SEC-049]** JSON deserialization depth-limited to 128 levels.
**[SEC-050]** `"success"` field MUST be JSON boolean; string `"true"` → `Failed`.

### OWASP Controls

**[SEC-051]** Network-perimeter access control only; no RBAC at MVP.
**[SEC-052]** Filesystem MCP workspace boundary is the only enforced access control.
**[SEC-053]** Prohibited: MD5, SHA-1, DES/3DES, RC4, ECB, RSA<2048, HMAC<128-bit keys.
**[SEC-054]** Webhook HMAC key ≥ 32 bytes; `hmac` + `sha2` crates.
**[SEC-055]** UUID v4 only via `getrandom` OS CSPRNG; no v1/v7.
**[SEC-058]** 7 startup security checks; each emits `WARN` on violation.
**[SEC-060]** `./do lint` includes `cargo audit --deny warnings`; blocks on any advisory.
**[SEC-061]** GitLab CI runs `cargo audit` as separate job on every commit.
**[SEC-062]** `audit.toml` suppressions require justification comment and expiry date; ≤10 suppressions total.
**[SEC-065]** Checkpoint integrity via git SHA-1 content addressing; acceptable for MVP.
**[SEC-066]** Workflow snapshots write-once; overwrite attempt → error in persist layer.
**[SEC-067]** `devs-mcp-bridge` validates JSON before forwarding.
**[SEC-068]** SSRF check post-DNS; re-evaluated per delivery attempt.

### DoS Protections

**[SEC-070]** gRPC limits: `SubmitRun` 1 MiB request, 4 MiB response.
**[SEC-071]** MCP HTTP max 1 MiB body; 413 on violation.
**[SEC-072]** Stage output: `BoundedBytes<1_048_576>`; truncated from beginning.
**[SEC-073]** Context file `.devs_context.json` max 10 MiB; proportional truncation.
**[SEC-074]** Fan-out max 64 sub-agents; max 256 stages per workflow.
**[SEC-075]** gRPC per-client event buffer 256 messages; oldest dropped on overflow.
**[SEC-076]** Webhook delivery: 10s timeout; fire-and-forget via `tokio::spawn`.
**[SEC-070b]** MCP write-lock acquisition timeout: 5s → `resource_exhausted`.

### Input Validation [SEC-077–SEC-080]

13-step validation pipeline; all errors collected before returning. `BoundedString<N>` enforced at serde deserialization. Key field constraints:

| Field | Constraint |
|---|---|
| `WorkflowDefinition.name` | `[a-z0-9_-]+`, ≤128 bytes |
| `StageDefinition.name` | unique within workflow, ≤128 bytes |
| `WorkflowDefinition.stages` | 1–256 elements |
| `FanOutConfig.count` | 1–64 |
| `EnvKey` | `[A-Z_][A-Z0-9_]{0,127}`; prohibited: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` |
| `WebhookTarget.secret` | ≥32 bytes if present |
| `AgentPool.max_concurrent` | 1–1024 |
| `WebhookTarget.url` | `http`/`https` scheme; ≤2048 chars |

**[SEC-078]** Run name uniqueness enforced under per-project mutex (TOCTOU prevention).
**[SEC-079]** `Path` inputs NOT resolved at submission; only at execution in isolated env.

### Supply Chain Security [SEC-081–SEC-083]

- Dep version table enforced by `./do lint`; unreviewed deps fail lint.
- `unsafe_code = "deny"` workspace-wide.
- `reqwest` uses `rustls-tls` feature only; `native-tls`/`openssl` prohibited.
- `openssl`, `openssl-sys`, `native-tls`, `md5`, `sha1` MUST NOT appear in production `cargo tree`.

### SSRF Mitigation Algorithm

```rust
async fn check_ssrf(url: &Url, allow_local: bool) -> Result<(), SsrfError>
```
- DNS resolution via `tokio::net::lookup_host` immediately before connection
- All resolved IPs checked via `is_blocked()`
- DNS failure → delivery fails (not treated as SSRF; retried per backoff)
- `allow_local=true` bypasses check; `WARN` logged per use

### Webhook Delivery State Machine

`Enqueued → ResolvingDNS → SSRFCheck → Delivering → Success/Failed/Dropped`

Backoff schedule: attempt 1=0s, 2=5s, 3=15s, N≥4=`min(15×(N-1), 60)s`. Max attempts = `max_retries + 1` (default 4). SSRF-blocked → no retry (permanent failure).

---

## §5 Logging, Monitoring & Audit Trails

### Structured Logging Architecture [SEC-084–SEC-085]

- All logging via `tracing` crate; `println!`/`eprintln!`/`log::` prohibited in library crates.
- Format controlled by `DEVS_LOG_FORMAT` (`json`|`text`; default `text`).
- Verbosity via `RUST_LOG`; DEBUG/TRACE off by default in release.
- Output to `stderr` exclusively; no persistent server log file.
- Stage stdout/stderr to `.devs/logs/` files only — never via `tracing`.

JSON log event schema:
```json
{
  "timestamp": "RFC3339 ms precision",
  "level": "INFO|WARN|ERROR|DEBUG|TRACE",
  "target": "rust::module::path",
  "span": { "run_id": "...", "stage_name": "..." },
  "fields": { "event_type": "stage.dispatched", "message": "..." }
}
```

### Mandatory Audit Events [SEC-086–SEC-087]

20+ event types required. Key ones:

| `event_type` | Level | Required Fields |
|---|---|---|
| `server.started` | INFO | `listen_addr`, `mcp_port`, `version` |
| `run.submitted` | INFO | `run_id`, `slug`, `workflow_name`, `project_id`, `actor` |
| `run.failed` | WARN | `run_id`, `slug`, `failed_stage`, `duration_ms` |
| `stage.dispatched` | INFO | `run_id`, `stage_name`, `attempt`, `agent_tool`, `pool_name`, `execution_env` |
| `stage.failed` | WARN | `run_id`, `stage_name`, `attempt`, `exit_code`, `failure_reason` |
| `webhook.ssrf_blocked` | WARN | `webhook_id`, `url`, `resolved_ip`, `reason` |
| `security.misconfiguration` | WARN | `check_id`, `detail` |
| `checkpoint.corrupt` | ERROR | `run_id`, `error` |

**[SEC-087]** Webhook URLs logged with query params redacted as `?<redacted>`.

Actor field enum: `"grpc_client"`, `"mcp_client"`, `"scheduler"`, `"agent"`, `"system"`, `"executor"`, `"webhook"`.

### Credential Redaction [SEC-088–SEC-089]

- `Redacted<T>` mandatory for fields matching `*_api_key`, `*_token`, `*_secret`, `*_password` (case-insensitive).
- Stage stdout/stderr MUST NOT appear in `tracing` output at any level; log files only.
- `into_inner()` call sites MUST have `// SAFETY: credential exposed to <reason>` comment.

### Log Injection Mitigation [SEC-090–SEC-091]

- Stage output written verbatim (binary-safe) to log files; no parsing.
- `tracing-subscriber` JSON formatter escapes field values; newlines become `\n` in JSON output.
- Log field values > 64 KiB truncated with `" ...[TRUNCATED: N bytes]"` appended.

### Log Retention [SEC-092–SEC-094]

- Same `max_age_days`/`max_size_mb` as checkpoint data (defaults: 30 days, 500 MB).
- Log files mode `0600`; parent dirs mode `0700`.
- Process logs to stderr; operator manages log rotation.
- Active (`Running`/`Paused`) runs NEVER deleted during sweep.
- `delete_run_atomically` removes `.devs/runs/<id>/` and `.devs/logs/<id>/` together as single git tree update.

### Monitoring [SEC-095–SEC-096]

Monitorable conditions (operator-configured alerting on structured log stream):

| Condition | Threshold | Severity |
|---|---|---|
| Repeated stage failures | ≥5 per project in 5-minute window | HIGH |
| Checkpoint write failure | Any occurrence | HIGH |
| Security misconfiguration | Any at startup | HIGH |
| Path traversal attempt | Any occurrence | CRITICAL |
| SSRF webhook attempt | Any occurrence | CRITICAL |

**[SEC-096]** `state.changed` webhook provides native monitoring integration.

### Test Coverage Requirements [SEC-097]

Every code-enforced security control MUST have `// Covers: SEC-NNN` test annotation. Required E2E tests:

| Control | Test Type |
|---|---|
| SEC-036 SSRF blocklist | MCP E2E |
| SEC-040 Single-pass template | MCP E2E |
| SEC-044 No shell interpolation | Unit (adapter) |
| SEC-050 String `"success"` rejected | MCP E2E |
| SEC-060 `cargo audit` in lint | Integration |
| SEC-088 Credential redaction | Unit (3 assertions) |
| SEC-093 Log file permissions | Integration |
| SEC-019 Filesystem MCP write denial | MCP E2E |
| SEC-091 JSON log newline escaping | Unit |
| SEC-108 `request_id` in responses | CLI E2E |
| SEC-084 No `println!` in libs | CI lint |

`target/traceability.json` MUST cover `SEC-036`, `SEC-040`, `SEC-044`, `SEC-050`, `SEC-060`, `SEC-088`, `SEC-091`, `SEC-108`.

---

## Quick-Reference: All [SEC-NNN] Rules

| ID | Rule Summary |
|---|---|
| SEC-001 | MVP trusted-network only; loopback default |
| SEC-002 | Post-MVP mTLS forward-compatible |
| SEC-003 | Prompt injection is highest-severity vector |
| SEC-004 | API keys MUST NOT appear in `tracing` output |
| SEC-005 | Agents run with same OS privileges as server |
| SEC-006 | Template expansion single-pass; no recursive re-expansion |
| SEC-007 | `prompt_file` validated against traversal at definition time |
| SEC-008 | Corrupted checkpoint → `Unrecoverable`; server continues |
| SEC-009 | Webhook SSRF: URL validated post-DNS |
| SEC-010 | Credentials in `devs.toml` → startup WARN (key name only) |
| SEC-011 | Agent log written verbatim; ANSI stripped in TUI only |
| SEC-012 | Docker/SSH enlarge blast radius |
| SEC-013 | Glass-Box MCP exposure accepted MVP risk |
| SEC-014 | Developer tooling; audit trail + supply chain obligations only |
| SEC-015 | No client auth at MVP; network-perimeter only |
| SEC-016 | `devs-mcp-bridge` inherits spawning process trust |
| SEC-017 | Agent roles software-enforced (env var), not cryptographic |
| SEC-018 | MCP does NOT enforce tool-level restrictions at MVP |
| SEC-019 | Filesystem MCP: per-path read/write policy table |
| SEC-020 | Path canonicalization before access control; traversal → `permission_denied:` |
| SEC-021 | Webhook signing: HMAC-SHA256; `X-Devs-Signature-256: sha256=<hex>` |
| SEC-022 | Post-MVP auth: gRPC mTLS, bearer tokens, MCP header auth |
| SEC-023 | API keys MUST be supplied via OS env vars |
| SEC-024 | TOML credential fallback: startup WARN + file perm check |
| SEC-025 | Credentials MUST NEVER appear in logs/checkpoints/webhooks |
| SEC-026 | Strip `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` from agent env |
| SEC-027 | Checkpoint store not encrypted; OS FDE required for at-rest encryption |
| SEC-028 | Checkpoint branch SHOULD be dedicated `devs/state` |
| SEC-029 | Prompt files: mode `0600`; deleted after agent exits; isolated working dir |
| SEC-030 | Discovery file: mode `0600`; deleted on clean shutdown |
| SEC-031 | TLS optional for non-loopback gRPC (WARN if absent); `rustls` only; TLS 1.2 minimum when used |
| SEC-032 | Cipher suites: rustls defaults; RC4/3DES/NULL/MD5 prohibited |
| SEC-033 | Server MUST warn on start without TLS cert on non-loopback bind; server still starts |
| SEC-036 | SSRF blocklist: loopback, RFC-1918, link-local, IPv6 ULA all blocked |
| SEC-037 | SSRF check re-evaluated per delivery; DNS not cached |
| SEC-040 | Template resolution single-pass; resolved values NOT re-scanned |
| SEC-041 | Stage refs outside `depends_on` closure → `TemplateError::UnreachableStage` |
| SEC-042 | stdout/stderr in templates truncated to last 10,240 bytes |
| SEC-043 | Structured output template: scalar only; object/array → `NonScalarField` |
| SEC-044 | Agent spawn uses `tokio::process::Command` arg arrays; no shell interpolation |
| SEC-045 | Prompt files use generated UUID name; never user-controlled filename |
| SEC-046 | Env keys validated via `EnvKey` before subprocess spawn |
| SEC-047 | All user-supplied paths canonicalized before use |
| SEC-048 | `prompt_file` absolute paths and `..` segments rejected at validation time |
| SEC-049 | JSON deserialization depth-limited to 128 levels |
| SEC-050 | `"success"` field MUST be JSON boolean; string `"true"` → `Failed` |
| SEC-051 | MVP access control: network-perimeter only; no RBAC |
| SEC-052 | Filesystem MCP workspace boundary is the only enforced access control |
| SEC-053 | Prohibited crypto: MD5, SHA-1, DES, RC4, ECB, RSA<2048 |
| SEC-054 | Webhook HMAC key ≥ 32 bytes; `hmac` + `sha2` crates |
| SEC-055 | UUID v4 only; OS CSPRNG via `getrandom` |
| SEC-058 | 7 startup security checks; each emits WARN on violation |
| SEC-059 | `devs security-check` CLI runs checks without live server |
| SEC-060 | `./do lint` includes `cargo audit --deny warnings` |
| SEC-061 | GitLab CI runs `cargo audit` as separate job on every commit |
| SEC-062 | `audit.toml` suppressions require justification comment + expiry date; ≤10 total |
| SEC-065 | Checkpoint integrity via git SHA-1 content addressing |
| SEC-066 | Workflow snapshots write-once; overwrite → error in persist layer |
| SEC-067 | `devs-mcp-bridge` validates JSON before forwarding |
| SEC-068 | SSRF check post-DNS; re-evaluated per delivery |
| SEC-070 | gRPC request limits: 1 MiB default, 4 MiB response |
| SEC-071 | MCP HTTP max 1 MiB body; 413 on violation |
| SEC-072 | Stage output: `BoundedBytes<1_048_576>`; truncated from beginning |
| SEC-073 | Context file max 10 MiB; proportional truncation |
| SEC-074 | Fan-out max 64 sub-agents; max 256 stages per workflow |
| SEC-075 | gRPC per-client event buffer 256 messages; oldest dropped on overflow |
| SEC-076 | Webhook delivery: 10s timeout; fire-and-forget |
| SEC-077 | All workflow inputs run 13-step validation; all errors collected |
| SEC-078 | Run name uniqueness enforced under per-project mutex (TOCTOU prevention) |
| SEC-079 | `Path` inputs NOT resolved at submission; only at execution |
| SEC-080 | `BoundedString<N>` enforced at deserialization via serde |
| SEC-081 | Dep version table enforced by `./do lint` |
| SEC-082 | `unsafe_code = "deny"` workspace-wide |
| SEC-083 | `reqwest` uses `rustls-tls` feature only |
| SEC-084 | All logging via `tracing`; `println!`/`eprintln!`/`log::` prohibited in libs |
| SEC-085 | Log verbosity via `RUST_LOG`; DEBUG/TRACE off by default in release |
| SEC-086 | Mandatory audit events: 20+ event types at INFO/WARN/ERROR |
| SEC-087 | Webhook URLs in logs: query params redacted as `?<redacted>` |
| SEC-088 | Credential fields in `tracing` MUST use `Redacted<T>` wrapper |
| SEC-089 | Stage stdout/stderr MUST NOT appear in `tracing` output |
| SEC-090 | Log file writes are binary-safe verbatim |
| SEC-091 | JSON log formatter escapes field values; newlines become `\n` |
| SEC-092 | Log retention: same `max_age_days`/`max_size_mb` as checkpoint data |
| SEC-093 | Log files mode `0600`; parent dirs mode `0700` |
| SEC-094 | Process logs to stderr; operator manages log rotation |
| SEC-095 | Monitorable conditions with severity ratings |
| SEC-096 | `state.changed` webhook provides native monitoring integration |
| SEC-097 | Every code-enforced control MUST have `// Covers: SEC-NNN` test |
| SEC-100 | `Redacted<T>` defined in `devs-core::security`; imported by all crates |
