# Security Design: `devs` AI Agent Workflow Orchestrator

**Version:** 1.0
**Status:** Normative
**Scope:** MVP release — headless gRPC server, TUI/CLI/MCP clients, agent subprocess execution

---

## Table of Contents

### Document Purpose & Reading Guide

This document is the normative security specification for the `devs` MVP release. It is the authoritative source for all security-relevant decisions, constraints, and controls. Every `[SEC-NNN]` tag is normative; implementors MUST follow the tagged rule without deviation. Acceptance criteria prefixed `[AC-SEC-N-NNN]` must each be covered by at least one automated test annotated `// Covers: AC-SEC-N-NNN`.

**Who should read this document:**
- **Implementors** — use §1 for attack-surface context, §4 for concrete code-level controls, §5 for logging requirements
- **AI agent developers working on `devs` itself** — use §2.3 for Filesystem MCP boundaries, §1.3 for prompt-injection mitigations, §4.6 for the `Redacted<T>` type contract
- **Operators** — use §2.1 for network isolation requirements, §3.3 for TLS configuration

**Key data models defined in this document:**

| Type | Defined In | Purpose |
|---|---|---|
| `Redacted<T>` | §4.6 | Wraps secret values; renders as `"[REDACTED]"` in all log output |
| `BoundedString<N>` | §4.4 | UTF-8 string with compile-time byte-length cap; enforced at deserialization |
| `EnvKey` | §4.1.2 | Validated env var key: `[A-Z_][A-Z0-9_]{0,127}`; prohibits shell-special chars |
| SSRF blocklist check | §4.7 | `check_ssrf(url, allow_local)` — resolves DNS then validates against blocked IP ranges |
| Audit log event | §5.3 | Schema: `timestamp`, `level`, `target`, `fields.event_type` + conditional fields |

**State diagrams in this document:**

| Diagram | Location | Description |
|---|---|---|
| Security startup sequence | §2.6 | Mermaid `stateDiagram-v2` — security checks integrated with port binding |
| Webhook delivery state machine | §4.8 | Mermaid `stateDiagram-v2` — DNS → SSRF check → delivery → retry → drop |

**Quick-reference index of normative `[SEC-NNN]` rules:**

| SEC ID | Section | One-line summary |
|---|---|---|
| SEC-001 | §1.2 | MVP is trusted-network only; loopback bind is the default |
| SEC-002 | §1.2 | Post-MVP mTLS pathway is forward-compatible |
| SEC-003 | §1.3.1 | Prompt injection is the highest-severity attack vector |
| SEC-004 | §1.3.2 | API keys MUST NOT appear in `tracing` log output |
| SEC-005 | §1.3.3 | Agents run with the same OS privileges as the server |
| SEC-006 | §1.3.4 | Template expansion is single-pass; no recursive re-expansion |
| SEC-007 | §1.3.5 | `prompt_file` paths must be validated against traversal at definition time |
| SEC-008 | §1.3.6 | Corrupted checkpoint → `Unrecoverable`; server continues |
| SEC-009 | §1.3.7 | Webhook SSRF: URL validated post-DNS to block DNS-rebinding |
| SEC-010 | §1.3.8 | Credentials in `devs.toml` → startup `WARN`; key name only, never value |
| SEC-011 | §1.3.9 | Agent log output written verbatim; ANSI stripped only in TUI render layer |
| SEC-012 | §1.3.10 | Docker/SSH execution environments enlarge blast radius |
| SEC-013 | §1.3.11 | Glass-Box MCP exposure is accepted MVP risk; requires network isolation |
| SEC-014 | §1.6 | `devs` is developer tooling; audit trail and supply-chain obligations only |
| SEC-015 | §2.1 | No client auth at MVP; access control is network-perimeter-based |
| SEC-016 | §2.1 | `devs-mcp-bridge` inherits trust of spawning process |
| SEC-017 | §2.2 | Agent roles are software-enforced (env var detection), not cryptographic |
| SEC-018 | §2.2 | MCP does NOT enforce tool-level restrictions by caller identity at MVP |
| SEC-019 | §2.3 | Filesystem MCP: per-path read/write policy table |
| SEC-020 | §2.3 | Path canonicalization before access control; traversal → `permission_denied:` |
| SEC-021 | §2.4 | Webhook signing: HMAC-SHA256; `X-Devs-Signature-256: sha256=<hex>` |
| SEC-022 | §2.5 | Post-MVP auth: gRPC mTLS, bearer tokens, MCP header auth |
| SEC-023 | §3.2.1 | API keys MUST be supplied via OS env vars (mandatory preferred) |
| SEC-024 | §3.2.1 | TOML credential fallback: startup `WARN`, file perm check |
| SEC-025 | §3.2.1 | Credentials MUST NEVER appear in logs, checkpoints, context files, webhooks |
| SEC-026 | §3.2.1 | Agent env inheritance: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` stripped |
| SEC-027 | §3.2.2 | Checkpoint store not encrypted; OS FDE required for encryption at rest |
| SEC-028 | §3.2.2 | Checkpoint branch SHOULD be dedicated `devs/state` |
| SEC-029 | §3.2.2 | Prompt files: mode `0600`; deleted after agent exits; isolated working dir |
| SEC-030 | §3.2.3 | Discovery file: mode `0600`; deleted on clean shutdown |
| SEC-031 | §3.3.1 | TLS *optional* for non-loopback gRPC; TLS 1.2 minimum when used |
| SEC-032 | §3.3.1 | Cipher suites: rustls defaults; RC4/3DES/NULL/MD5 explicitly prohibited |
| SEC-033 | §3.3.1 | Server MUST warn on start without TLS cert on non-loopback bind |
| SEC-036 | §3.3 | SSRF blocklist: loopback, RFC-1918, link-local, IPv6 ULA all blocked |
| SEC-037 | §3.3 | SSRF check re-evaluated on each delivery attempt; DNS not cached |
| SEC-040 | §4.1.1 | Template resolution is single-pass; resolved values NOT re-scanned |
| SEC-041 | §4.1.1 | Stage refs outside `depends_on` closure → `TemplateError::UnreachableStage` |
| SEC-042 | §4.1.1 | stdout/stderr in templates truncated to last 10,240 bytes |
| SEC-043 | §4.1.1 | Structured output template: scalar only; object/array → `NonScalarField` |
| SEC-044 | §4.1.2 | Agent spawn uses `tokio::process::Command` arg arrays; no shell interpolation |
| SEC-045 | §4.1.2 | Prompt files use generated UUID name; never user-controlled filename |
| SEC-046 | §4.1.2 | Env keys validated via `EnvKey` type before subprocess spawn |
| SEC-047 | §4.1.3 | All user-supplied paths canonicalized before use |
| SEC-048 | §4.1.3 | `prompt_file` absolute paths and `..` segments rejected at validation time |
| SEC-049 | §4.1.4 | JSON deserialization depth-limited to 128 levels |
| SEC-050 | §4.1.4 | `"success"` field MUST be JSON boolean; string `"true"` → `Failed` |
| SEC-051 | §4.2 | MVP access control: network-perimeter only; no RBAC |
| SEC-052 | §4.2 | Filesystem MCP workspace boundary is the only enforced access control |
| SEC-053 | §4.2 | Prohibited cryptographic primitives: MD5, SHA-1, DES, RC4, ECB, RSA<2048 |
| SEC-054 | §4.2 | Webhook HMAC key ≥ 32 bytes; `hmac` + `sha2` crates from RustCrypto |
| SEC-055 | §4.2 | UUID generation: v4 only; uses OS CSPRNG via `getrandom` |
| SEC-056 | §4.2 | Injection summary: single-pass template, no shell, canonicalize, depth-limit |
| SEC-057 | §4.2 | Glass-Box architecture accepted risk; post-MVP auth required for multi-user |
| SEC-058 | §4.2 | 7 startup security checks; each emits `WARN` on violation |
| SEC-060 | §4.2 | `./do lint` includes `cargo audit --deny warnings`; blocks on any advisory |
| SEC-061 | §4.2 | GitLab CI runs `cargo audit` as a separate job on every commit |
| SEC-062 | §4.2 | `audit.toml` suppressions require justification comment and expiry date |
| SEC-063 | §4.2 | No auth credentials for `devs` itself at MVP; AI provider keys only |
| SEC-064 | §4.2 | Webhook `secret` treated as credential; never in checkpoints or logs |
| SEC-065 | §4.2 | Checkpoint integrity via git SHA-1 content addressing; acceptable for MVP |
| SEC-066 | §4.2 | Workflow snapshots write-once; overwrite attempt → error in persist layer |
| SEC-067 | §4.2 | `devs-mcp-bridge` validates JSON before forwarding; malformed → structured error |
| SEC-068 | §4.2 | SSRF check post-DNS; re-evaluated per delivery attempt |
| SEC-069 | §4.2 | SSH remote execution targets are operator-controlled; no SSRF risk |
| SEC-070 | §4.3 | gRPC request size limits at `tonic` layer: 1 MiB default, 4 MiB response |
| SEC-071 | §4.3 | MCP HTTP max 1 MiB body; 413 on violation |
| SEC-072 | §4.3 | Stage output: `BoundedBytes<1_048_576>`; truncated from beginning |
| SEC-073 | §4.3 | Context file `.devs_context.json` max 10 MiB; proportional truncation |
| SEC-074 | §4.3 | Fan-out max 64 sub-agents; max 256 stages per workflow |
| SEC-075 | §4.3 | gRPC per-client event buffer 256 messages; oldest dropped on overflow |
| SEC-076 | §4.3 | Webhook delivery: 10s timeout; fire-and-forget; never blocks scheduler |
| SEC-077 | §4.4 | All workflow inputs run 13-step validation; all errors collected |
| SEC-078 | §4.4 | Run name uniqueness enforced under per-project mutex (TOCTOU prevention) |
| SEC-079 | §4.4 | `Path` inputs NOT resolved at submission; only at execution in isolated env |
| SEC-080 | §4.4 | `BoundedString<N>` enforced at deserialization time via serde |
| SEC-081 | §4.5 | Dep version table enforced by `./do lint`; unreviewed deps fail lint |
| SEC-082 | §4.5 | `unsafe_code = "deny"` workspace-wide; no `unsafe` blocks |
| SEC-083 | §4.5 | `reqwest` uses `rustls-tls` feature only; `native-tls`/`openssl` prohibited |
| SEC-084 | §5.1 | All logging via `tracing`; `println!`/`eprintln!`/`log::` prohibited in libs |
| SEC-085 | §5.1 | Log verbosity via `RUST_LOG`; DEBUG/TRACE off by default in release |
| SEC-086 | §5.2 | Mandatory audit events table: 20+ event types at INFO/WARN/ERROR |
| SEC-087 | §5.2 | Webhook URLs in logs: query params redacted as `?<redacted>` |
| SEC-088 | §5.4 | Credential fields in `tracing` MUST use `Redacted<T>` wrapper |
| SEC-089 | §5.4 | Stage stdout/stderr MUST NOT appear in `tracing` output; log files only |
| SEC-090 | §5.5 | Log file writes are binary-safe verbatim; no parsing or interpretation |
| SEC-091 | §5.5 | JSON log formatter escapes field values; newlines become `\n` in JSON |
| SEC-092 | §5.6 | Log retention: same `max_age_days` / `max_size_mb` as checkpoint data |
| SEC-093 | §5.6 | Log files: mode `0600`; parent dirs: mode `0700` |
| SEC-094 | §5.6 | Process logs to stderr; operator manages log rotation |
| SEC-095 | §5.7 | Monitorable conditions table: stage failure rate, pool exhaustion, SSRF |
| SEC-096 | §5.7 | `state.changed` webhook provides native monitoring integration |
| SEC-097 | §5.8 | Every code-enforced security control MUST have `// Covers: SEC-NNN` test |
| SEC-100 | §4.6 | `Redacted<T>` defined in `devs-core::security`; imported by all crates |

---

**Acceptance criteria quick-reference:**

| AC ID | Section | Verifiable assertion |
|---|---|---|
| AC-SEC-1-001 | §1.7 | Non-loopback bind without TLS → `WARN` with `event_type: "security.misconfiguration"` |
| AC-SEC-1-002 | §1.7 | Loopback `SubmitRun` without credentials → accepted |
| AC-SEC-1-003 | §1.7 | Loopback `get_run` without credentials → accepted |
| AC-SEC-1-004 | §1.7 | Second-order template marker in stage output → verbatim in downstream prompt |
| AC-SEC-1-005 | §1.7 | `CLAUDE_API_KEY` value absent from all `tracing` log lines |
| AC-SEC-1-006 | §1.7 | Webhook to `169.254.169.254` blocked; `webhook.ssrf_blocked` logged; no HTTP request |
| AC-SEC-2-003 | §2.8 | Filesystem MCP `write_file` to `.devs/runs/*/` → `permission_denied:` error |
| AC-SEC-2-004 | §2.8 | Webhook `secret` < 32 bytes → rejected at project add, exit code 4 |
| AC-SEC-2-005 | §2.8 | `server.listen = "0.0.0.0:7890"` → `WARN` with `check_id: "SEC-BIND-ADDR"` |
| AC-SEC-3-002 | §3.X | Prompt file created at mode `0600`; deleted within 1s of agent exit |
| AC-SEC-3-003 | §3.X | `server.addr` discovery file created at mode `0600` |
| AC-SEC-3-004 | §3.X | Webhook `secret` < 32 bytes rejected at project add, exit code 4 |
| AC-SEC-3-005 | §3.X | World-readable `devs.toml` → `WARN` with `check_id: "SEC-FILE-PERM-TOML"` |
| AC-SEC-3-006 | §3.X | Webhook redirect to private IP → no request to private IP; delivery fails |
| AC-SEC-4-001 | §4.9 | Single-pass template expansion verified: second-order marker passes verbatim |
| AC-SEC-4-002 | §4.9 | Shell metachar in prompt → passed as `--print` arg; no shell execution |
| AC-SEC-4-003 | §4.9 | `BoundedString<128>` with 129 bytes → rejected with `invalid_argument:` |
| AC-SEC-4-004 | §4.9 | `.devs_output.json` with `"success": "true"` (string) → stage `Failed` |
| AC-SEC-4-005 | §4.9 | `./do lint` fails on dependency not in TAS authoritative version table |
| AC-SEC-4-006 | §4.9 | Prompt file at `0600` after creation; absent after agent exit |
| AC-SEC-4-007 | §4.9 | `Redacted<String>` formats as `"[REDACTED]"` in `{:?}` and `{}` |
| AC-SEC-4-008 | §4.9 | `cargo audit --deny warnings` exits 0 on unmodified repository |
| AC-SEC-5-001 | §5.10 | All JSON log events contain `timestamp`, `level`, `target`, `fields.event_type` |
| AC-SEC-5-002 | §5.10 | TOML credential `WARN` logged; value DOES NOT appear in any log line |
| AC-SEC-5-003 | §5.10 | `stdout.log` and `stderr.log` created with Unix mode `0o600` |
| AC-SEC-5-004 | §5.10 | `.devs/logs/` directory created with Unix mode `0o700` |
| AC-SEC-5-005 | §5.10 | Agent-printed key appears in stage log file; DOES NOT appear in server stderr |
| AC-SEC-5-006 | §5.10 | `target/traceability.json` covers `SEC-036`, `SEC-040`, `SEC-044`, `SEC-050`, `SEC-060`, `SEC-088` |
| AC-SEC-5-007 | §5.10 | Webhook URL with query params logged with query as `?<redacted>` |
| AC-SEC-5-008 | §5.10 | Retention sweep deletes old runs; skips `Running`/`Paused` runs |

---

**Section dependency map:**

```mermaid
graph TD
    S1["§1 Threat Model"] --> S2["§2 Auth & AuthZ"]
    S1 --> S4["§4 Application Controls"]
    S2 --> S3["§3 Encryption"]
    S2 --> S4
    S3 --> S4
    S4 --> S5["§5 Logging & Audit"]
    S1 --> S5

    S4 -->|"Redacted<T> type"| CORE["devs-core"]
    S4 -->|"BoundedString<N> type"| CORE
    S4 -->|"EnvKey type"| CORE
    S2 -->|"file perm checks"| CONFIG["devs-config"]
    S3 -->|"TLS config"| CONFIG
    S4 -->|"SSRF check"| WEBHOOK["devs-webhook"]
    S4 -->|"HMAC signing"| WEBHOOK
    S2 -->|"path traversal"| MCP["devs-mcp"]
    S5 -->|"log file mode"| PERSIST["devs-checkpoint"]
    S4 -->|"prompt file isolation"| ADAPTERS["devs-adapters"]
    S4 -->|"working dir isolation"| EXECUTOR["devs-executor"]
```

---

### Section List

1. [Threat Model & Attack Surface](#1-threat-model--attack-surface)
   - [1.1 System Trust Boundaries](#11-system-trust-boundaries) — trust zone diagram: Trusted / Semi-Trusted (agent subprocesses) / Untrusted (Docker, SSH, webhooks, AI providers)
   - [1.2 MVP Trust Model Boundary](#12-mvp-trust-model-boundary) — loopback-only default; `[SEC-001]`–`[SEC-002]`
   - [1.3 Primary Attack Vectors](#13-primary-attack-vectors) — 11 attack vectors with edge-case tables:
     - [1.3.1 Prompt Injection](#131-prompt-injection) — `[SEC-003]`; EC-SEC-001–005
     - [1.3.2 Credential Exposure](#132-credential-exposure) — `[SEC-004]`; EC-SEC-006–009
     - [1.3.3 Agent Subprocess Isolation Failure](#133-agent-subprocess-isolation-failure) — `[SEC-005]`; EC-SEC-010–012
     - [1.3.4 Template Variable Injection via Structured Output](#134-template-variable-injection-via-structured-output) — `[SEC-006]`; EC-SEC-013–015
     - [1.3.5 Path Traversal via `prompt_file`](#135-path-traversal-via-prompt_file) — `[SEC-007]`; EC-SEC-016–018
     - [1.3.6 Git Repository Poisoning](#136-git-repository-poisoning) — `[SEC-008]`; EC-SEC-019–021
     - [1.3.7 Server-Side Request Forgery (SSRF) via Webhooks](#137-server-side-request-forgery-ssrf-via-webhooks) — `[SEC-009]`; EC-SEC-022–024
     - [1.3.8 Secrets in TOML Configuration](#138-secrets-in-toml-configuration) — `[SEC-010]`; EC-SEC-025–027
     - [1.3.9 Log Injection](#139-log-injection) — `[SEC-011]`; EC-SEC-028–030
     - [1.3.10 Docker/SSH Remote Execution Surface](#1310-dockerssh-remote-execution-surface) — `[SEC-012]`; EC-SEC-031–033
     - [1.3.11 MCP Glass-Box State Exposure](#1311-mcp-glass-box-state-exposure) — `[SEC-013]`; EC-SEC-034–036
   - [1.4 STRIDE Threat Analysis](#14-stride-threat-analysis) — STRIDE table: 14 threats mapped to mitigations and residual risk ratings
   - [1.5 Asset Inventory & Sensitivity Classification](#15-asset-inventory--sensitivity-classification) — 11 assets: Critical / High / Medium / Low sensitivity
   - [1.6 Regulatory & Compliance Scope](#16-regulatory--compliance-scope) — `[SEC-014]`; secret management, audit trails, supply chain
   - [1.7 Section 1 Acceptance Criteria](#17-section-1-acceptance-criteria) — AC-SEC-1-001–006

2. [Authentication & Authorization Policies](#2-authentication--authorization-policies)
   - [2.1 MVP Trust Model (No Client Authentication)](#21-mvp-trust-model-no-client-authentication) — `[SEC-015]`–`[SEC-016]`; loopback bind, firewall enforcement, remote TLS requirement
   - [2.2 Agent Role Separation (Software-Enforced)](#22-agent-role-separation-software-enforced-not-cryptographic) — `[SEC-017]`–`[SEC-018]`; Orchestrated vs Observing/Controlling; env-var detection
   - [2.3 Filesystem MCP Access Control](#23-filesystem-mcp-access-control) — `[SEC-019]`–`[SEC-020]`; per-path read/write policy table; path canonicalization; EC-SEC-037–041
   - [2.4 Webhook Signing](#24-webhook-signing) — `[SEC-021]`; HMAC-SHA256; `X-Devs-Signature-256`; signing algorithm in Rust pseudocode; EC-SEC-042–045; minimum 32-byte secret
   - [2.5 Post-MVP Authentication Pathway](#25-post-mvp-authentication-pathway) — `[SEC-022]`; gRPC mTLS, bearer tokens, MCP header auth — reserved stubs
   - [2.6 Security Startup Sequence](#26-security-startup-sequence) — Mermaid state diagram: security check chain integrated with port binding
   - [2.8 Section 2 Acceptance Criteria](#28-section-2-acceptance-criteria)

3. [Data at Rest & Data in Transit Encryption](#3-data-at-rest--data-in-transit-encryption)
   - [3.1 Data Classification](#31-data-classification) — 8 data classes: Critical / High / Medium / Low; encryption posture per class
   - [3.2 Data at Rest](#32-data-at-rest)
     - [3.2.1 Credential Storage](#321-credential-storage) — `[SEC-023]`–`[SEC-026]`; env var preferred; TOML fallback controls; inheritance chain; EC-SEC-046–049
     - [3.2.2 Git Checkpoint Store](#322-git-checkpoint-store) — `[SEC-027]`–`[SEC-029]`; no encryption; OS FDE recommended; prompt file lifecycle; EC-SEC-050–053
     - [3.2.3 Discovery File](#323-discovery-file) — `[SEC-030]`; mode `0600`; atomic overwrite on restart; EC-SEC-054–056
   - [3.3 Data in Transit](#33-data-in-transit)
     - [3.3.1 gRPC Transport (TLS)](#331-grpc-transport-tls) — `[SEC-031]`–`[SEC-033]`; `rustls` only; TLS 1.2 minimum; cipher suite table; TLS config TOML schema; non-loopback enforcement
   - Section 3 Acceptance Criteria — AC-SEC-3-001–006

4. [Application Security Controls](#4-application-security-controls)
   - [4.1 Injection Prevention](#41-injection-prevention)
     - [4.1.1 Template Injection (Prompt Injection)](#411-template-injection-prompt-injection) — `[SEC-040]`–`[SEC-043]`; single-pass; 10,240-byte truncation; scalar-only extraction; EC-SEC-069–073
     - [4.1.2 Command Injection (Agent Adapter Layer)](#412-command-injection-agent-adapter-layer) — `[SEC-044]`–`[SEC-046]`; `Command::arg()` array; UUID prompt filenames; `EnvKey` validation; EC-SEC-074–076
     - [4.1.3 Path Traversal](#413-path-traversal) — `[SEC-047]`–`[SEC-048]`; `canonicalize()` before use; validation-time `..` rejection; EC-SEC-077–079
     - [4.1.4 JSON Injection in Structured Output](#414-json-injection-in-structured-output) — `[SEC-049]`–`[SEC-050]`; depth limit 128; boolean-only `"success"`; 10 MiB file size cap; EC-SEC-080–083
   - [4.2 OWASP Top 10 Mitigations](#42-owasp-top-10-mitigations) — A01–A10 addressed; `[SEC-051]`–`[SEC-069]`; prohibited cryptographic primitives; UUID v4 only; `cargo audit` CI integration
   - [4.3 Denial of Service Protections](#43-denial-of-service-protections) — `[SEC-070]`–`[SEC-076]`; gRPC/MCP size limits; `BoundedBytes<1_048_576>`; fan-out cap 64; webhook fire-and-forget; EC-SEC-084–088
   - [4.4 Input Validation](#44-input-validation) — `[SEC-077]`–`[SEC-080]`; 13-step validation; TOCTOU-safe run name uniqueness; `Path` inputs deferred; `BoundedString<N>` serde enforcement with Rust code sample; EC-SEC-089–092
   - [4.5 Supply Chain Security](#45-supply-chain-security) — `[SEC-081]`–`[SEC-083]`; dep version table enforcement; `unsafe_code = "deny"`; `rustls-tls` only
   - [4.6 `Redacted<T>` Type Definition](#46-redactedt-type-definition) — `[SEC-100]`; Rust `impl Debug + Display + tracing::Value`; usage requirements; EC-SEC-093–095
   - [4.7 SSRF Mitigation Algorithm](#47-ssrf-mitigation-algorithm) — `check_ssrf()` Rust pseudocode; `is_blocked()` per IP family; DNS-at-delivery-time invariants
   - [4.8 Webhook Delivery State Machine](#48-webhook-delivery-state-machine) — Mermaid state diagram: Enqueued → ResolvingDNS → SSRFCheck → Delivering → Success/Failed/Dropped; backoff schedule table
   - [4.9 Section 4 Acceptance Criteria](#49-section-4-acceptance-criteria) — AC-SEC-4-001–008

5. [Logging, Monitoring & Audit Trails](#5-logging-monitoring--audit-trails)
   - [5.1 Structured Logging Architecture](#51-structured-logging-architecture) — `[SEC-084]`–`[SEC-085]`; `tracing` + JSON format; `DEVS_LOG_FORMAT`; `RUST_LOG` verbosity; DEBUG/TRACE off in release
   - [5.2 Mandatory Audit Events](#52-mandatory-audit-events) — `[SEC-086]`–`[SEC-087]`; 20-event table with required fields and levels; query-param redaction in webhook URLs
   - [5.3 Audit Log Entry Schema](#53-audit-log-entry-schema) — JSON schema with annotated example; required top-level fields table; conditional fields by event type; exhaustive `event_type` registry (21 event types)
   - [5.4 Credential Redaction in Logs](#54-credential-redaction-in-logs) — `[SEC-088]`–`[SEC-089]`; `Redacted<T>` mandatory; stage stdout/stderr to log files only, never `tracing`
   - [5.5 Log Injection Mitigation](#55-log-injection-mitigation) — `[SEC-090]`–`[SEC-091]`; verbatim binary-safe writes; JSON formatter escaping; EC-SEC-096–099
   - [5.6 Log Retention and Access](#56-log-retention-and-access) — `[SEC-092]`–`[SEC-094]`; same retention policy as checkpoints; mode `0600`/`0700`; operator log rotation; EC-SEC-100–102
   - [5.7 Monitoring and Alerting](#57-monitoring-and-alerting) — `[SEC-095]`–`[SEC-096]`; 9 monitorable conditions with severity ratings; `state.changed` webhook as native monitoring
   - [5.8 Test Coverage Requirements for Security Controls](#58-test-coverage-requirements-for-security-controls) — `[SEC-097]`; 8 mandatory E2E tests for named security controls; `// Covers: SEC-NNN` annotation requirement
   - [5.9 Component Dependencies](#59-component-dependencies) — bidirectional dependency table: 8 upstream components + 4 downstream consumers
   - [5.10 Section 5 Acceptance Criteria](#510-section-5-acceptance-criteria) — AC-SEC-5-001–008

---

## 1. Threat Model & Attack Surface

### 1.1 System Trust Boundaries

```mermaid
graph TD
    subgraph TRUSTED["Trusted Zone (local machine / private network)"]
        DEV["Human Developer"]
        TUI["devs-tui (TUI client)"]
        CLI["devs-cli (CLI client)"]
        BRIDGE["devs-mcp-bridge (stdio)"]
        SERVER["devs-server (gRPC :7890)"]
        MCP["devs-mcp (HTTP :7891)"]
        STATE["SchedulerState (Arc<RwLock<>>)"]
        GITREPO[".devs/ Git Checkpoint Store"]
        CONFIG["devs.toml / projects.toml"]
        ENVVARS["Process Environment (API Keys)"]
    end

    subgraph SEMI["Semi-Trusted Zone (spawned subprocesses)"]
        AGENT_CLAUDE["claude subprocess"]
        AGENT_GEMINI["gemini subprocess"]
        AGENT_OC["opencode subprocess"]
        AGENT_QWEN["qwen subprocess"]
        AGENT_COPILOT["copilot subprocess"]
    end

    subgraph UNTRUSTED["Untrusted Zone (external)"]
        DOCKER["Docker daemon / remote container"]
        SSH["Remote SSH host"]
        WEBHOOK["Webhook receiver (HTTP/S)"]
        AI_PROVIDER["AI Provider APIs (rate limits, responses)"]
        REPO["Project Git repository"]
    end

    DEV --> TUI
    DEV --> CLI
    TUI -->|"gRPC (TLS)"| SERVER
    CLI -->|"gRPC (TLS)"| SERVER
    BRIDGE -->|"HTTP JSON-RPC"| MCP
    SERVER --- STATE
    MCP --- STATE
    SERVER --> GITREPO
    SERVER --> CONFIG
    SERVER --> ENVVARS
    SERVER -->|"spawn subprocess"| AGENT_CLAUDE
    SERVER -->|"spawn subprocess"| AGENT_GEMINI
    SERVER -->|"spawn subprocess"| AGENT_OC
    AGENT_CLAUDE -->|"DEVS_MCP_ADDR"| MCP
    AGENT_CLAUDE -->|"DOCKER_HOST / ssh2"| DOCKER
    AGENT_CLAUDE -->|"DOCKER_HOST / ssh2"| SSH
    SERVER -->|"HTTP POST"| WEBHOOK
    AGENT_CLAUDE --> AI_PROVIDER
    SERVER --> REPO
```

### 1.1.1 Attack Surface Entry Points

All externally reachable network interfaces and significant filesystem surfaces that constitute the `devs` MVP attack surface are enumerated below. This table is the normative definition of the entry point set. Any new interface requires a corresponding addition to this table and a security review before merge.

| Entry Point | Interface Type | Protocol | Default Bind Address | Authentication (MVP) | Operator-Enforced Trust |
|---|---|---|---|---|---|
| gRPC service | TCP listen socket | gRPC/HTTP2, optionally TLS | `127.0.0.1:7890` | None | Loopback bind or OS firewall |
| MCP HTTP server | TCP listen socket | HTTP/1.1 JSON-RPC | `127.0.0.1:7891` | None | Loopback bind or OS firewall |
| `devs-mcp-bridge` stdin | OS pipe | Newline-delimited JSON | Process stdin | Inherits spawning process trust | Spawning process OS isolation |
| Agent subprocess stdin | OS pipe | Text control tokens (`devs:cancel\n` etc.) | Process stdin (server→agent only) | N/A — unidirectional | OS process isolation |
| Agent → MCP callback | TCP (outbound from agent) | HTTP/1.1 JSON-RPC | `DEVS_MCP_ADDR` (loopback) | None | Same loopback isolation as MCP port |
| `devs.toml` | Filesystem file | Read on startup | Operator-defined path | OS file permissions | Mode `0600` required |
| `projects.toml` | Filesystem file | Read/write on registry operations | `~/.config/devs/projects.toml` | OS file permissions | Mode `0600`; parent dir `0700` |
| Discovery file | Filesystem file | Write on startup; read by clients | `~/.config/devs/server.addr` | OS file permissions | Mode `0600`; deleted on clean shutdown |
| `.devs/` checkpoint store | Filesystem + git | `git2` library I/O | Project repository path | OS file permissions | Files `0600`; dirs `0700` |
| Outbound webhooks | TCP (outbound) | HTTP/1.1 POST | Operator-configured URLs | HMAC-SHA256 (optional per target) | Network egress firewall; SSRF blocklist |
| Docker daemon socket | OS socket or TCP | Docker HTTP API | `DOCKER_HOST` env var | Docker daemon configuration | Operator-managed Docker ACLs |
| Remote SSH host | TCP (outbound) | SSH protocol via `ssh2` crate | Per `ssh_config` | SSH host key + private key | Operator-managed SSH access controls |
| AI provider APIs | TCP (outbound) | HTTPS | Provider HTTPS endpoints | API key (Bearer token) | Key rotation policy; key stored in env |

**Attack surface reduction rules:**

- **[SEC-ATK-001]** The gRPC and MCP ports MUST be the only two TCP listening sockets created by the `devs-server` process. No additional listening sockets are permitted. This is structurally enforced by `[ARCH-BR-001]`.
- **[SEC-ATK-002]** The `devs-mcp-bridge` binary MUST NOT create any TCP listening socket. It operates exclusively via stdin/stdout OS pipes and outbound HTTP to the configured MCP port.
- **[SEC-ATK-003]** On Unix systems, the following file permission modes MUST be applied at creation time: discovery file `0600`; `projects.toml` `0600`; `~/.config/devs/` directory `0700`; `.devs/logs/` directory `0700`; individual log files `0600`. On Windows, equivalent ACLs restricted to the server process owner apply per `[FEAT-BR-001]`.
- **[SEC-ATK-004]** Any addition to the above entry-point table requires updating this document section before the change is merged to main.

**Cross-references to other sections:**

- §2.1 defines the access control policy for gRPC and MCP entry points
- §3.3.1 defines TLS configuration requirements for non-loopback gRPC
- §4.7 defines the SSRF blocklist applied to outbound webhook delivery
- §2.3 defines the path-based access control policy for the Filesystem MCP workspace surface

### 1.2 MVP Trust Model Boundary

**[SEC-001]** The `devs` server is explicitly designed for **local or trusted-network deployment only** at MVP. No client authentication is enforced on the gRPC or MCP interfaces. Any process that can reach the gRPC port (`:7890`) or MCP port (`:7891`) can read and control all workflow runs and internal state. Operators MUST restrict network access to these ports via OS firewall rules or network segmentation. Binding to `127.0.0.1` (loopback) is the default and MUST NOT be changed to `0.0.0.0` in untrusted network environments.

**[SEC-002]** Post-MVP client authentication will be implemented as a gRPC interceptor using mutual TLS (mTLS) or bearer tokens without requiring changes to service logic. The current design is forward-compatible with this addition.

#### 1.2.1 MVP Trust Model — Formal Business Rules

The following rules are testable assertions that MUST be verified by automated tests. Each rule ID corresponds to a `// Covers:` annotation in the test suite.

- **[SEC-001-BR-001]** When `server.listen` binds to any address other than `127.0.0.1` or `::1`, the server MUST emit a `WARN`-level structured log event with `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"` before accepting any connection. The server continues starting — this is a warning, not a fatal error.
- **[SEC-001-BR-002]** The built-in default for `server.listen` MUST resolve to `"127.0.0.1:7890"` when no configuration file and no `DEVS_LISTEN` environment variable are present. An unconfigured server MUST bind only to loopback.
- **[SEC-001-BR-003]** The MCP HTTP server MUST bind to the same IP address as `server.listen`. If `server.listen = "0.0.0.0:7890"`, the MCP server MUST also bind `0.0.0.0:7891`. The MCP port MUST NOT bind to a more permissive network scope than the gRPC port.
- **[SEC-001-BR-004]** The discovery file MUST contain only the gRPC listen address in `<host>:<port>` plain UTF-8 format. The MCP port MUST NOT appear in the discovery file. Clients obtain the MCP port exclusively via the `ServerService.GetInfo` RPC. This ensures that locating the gRPC service does not automatically expose the MCP attack surface.
- **[SEC-001-BR-005]** Both gRPC and MCP ports MUST be fully bound before the discovery file is written. Clients that read the discovery file and successfully connect to the gRPC port MUST be guaranteed that the MCP port is also accepting connections.
- **[SEC-002-BR-001]** No authentication call sites MUST exist inside any gRPC service handler module (`WorkflowServiceImpl`, `RunServiceImpl`, `StageServiceImpl`, `LogServiceImpl`, `PoolServiceImpl`, `ProjectServiceImpl`) at MVP. Post-MVP authentication MUST be implementable as a standalone `tonic` `Layer` (interceptor) applied at the router level, without modifying any service handler code.

**Deployment Preconditions:**

The following conditions are operator responsibilities not enforced by `devs` software. Violations do not cause `devs` to malfunction but increase the effective attack surface beyond the MVP design assumptions:

| Precondition | Recommended Verification | Risk if Violated |
|---|---|---|
| gRPC/MCP ports firewalled from untrusted hosts | `netstat -tlnp` + firewall ruleset audit | Any network host can read all state and control all workflows |
| `devs.toml` not committed to project version control | `.gitignore` entry verified | API keys present in repository history; requires key rotation |
| `devs.toml` file permissions are mode `0600` | `stat devs.toml \| grep Uid` | Co-located local users can read API keys from config file |
| API keys provided via environment variables, not TOML | Startup `WARN` check (SEC-010) | TOML file exfiltration or VCS commit exposes live credentials |
| Project workspace isolated from other users' home directories | OS user account controls | Agent subprocesses can access shared project files or secrets |
| `~/.config/devs/` directory permissions are mode `0700` | `stat ~/.config/devs` | Other local users can read the discovery file and project registry |

### 1.3 Primary Attack Vectors

#### 1.3.1 Prompt Injection

**[SEC-003]** The highest-severity attack vector. Stage prompts accept `{{template}}` variables resolved from prior stage outputs (stdout, stderr, structured JSON fields). A malicious or compromised upstream stage can inject instructions into a downstream agent's prompt, causing it to exfiltrate secrets, modify source code, or call unintended MCP tools. This is an inherent risk of chaining AI agent outputs.

Mitigation strategy: see **[SEC-040]** (template sanitization) and **[SEC-042]** (output size limits).

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-001 | Stage output contains literal `{{stage.other.stdout}}` | Template expansion is single-pass; the literal string is passed verbatim to the downstream prompt, not re-expanded |
| EC-SEC-002 | Stage output contains `}}{{` boundary sequences | Treated as literal text in the resolved value; no partial template token is evaluated |
| EC-SEC-003 | Structured output field value contains `{{workflow.input.secret}}` | Field value extracted as a plain string; no recursive template evaluation applied to the extracted value |
| EC-SEC-004 | Fan-out `{{fan_out.item}}` value contains template markers | Resolved once at fan-out expansion; the item value is not re-scanned for template tokens |
| EC-SEC-005 | Prompt file loaded from disk contains `{{...}}` markers | Prompt file content IS subject to template expansion; this is intentional and documented |

#### 1.3.2 Credential Exposure

**[SEC-004]** Agent CLI API keys (`CLAUDE_API_KEY`, `GEMINI_API_KEY`, etc.) are high-value secrets stored in the server process environment or in `devs.toml`. Attack paths include: log scraping (keys inadvertently logged), checkpoint file inclusion (keys written to `.devs/`), environment inheritance to agent subprocesses (intentional but must be controlled), and TOML file exfiltration.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-006 | Agent prints `CLAUDE_API_KEY` to stdout | Logged verbatim to `.devs/logs/` file; MUST NOT appear in `tracing` structured logs; operator must rotate key |
| EC-SEC-007 | Workflow `default_env` key name matches `CLAUDE_API_KEY` | User-supplied env override takes effect; server logs `WARN` that a credential-named env var was set in workflow config |
| EC-SEC-008 | `devs.toml` is group-readable but not world-readable on Unix | Server logs `WARN` only for world-readable (`o+r`); group-readable is permitted but operator-discretion warning SHOULD be logged |
| EC-SEC-009 | API key environment variable is an empty string | Passed as empty string to agent subprocess; server does not validate credential values, only their presence as keys |

#### 1.3.3 Agent Subprocess Isolation Failure

**[SEC-005]** Spawned agent subprocesses execute with the same OS user privileges as the `devs` server. A compromised agent process (e.g., via a malicious model response directing the CLI tool to execute shell commands) can access the full filesystem and network available to the server process. The execution environment (`tempdir`, `docker`, `remote`) provides the primary isolation layer.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-010 | Agent subprocess spawns its own child processes | Child processes are not tracked by `devs`; on stage cancellation, SIGTERM is sent to the direct child only; orphan children become OS responsibility |
| EC-SEC-011 | Agent modifies files outside its assigned working directory | The `tempdir` execution environment does not enforce filesystem sandboxing; agents with `tempdir` execution can write to any path the server user can access |
| EC-SEC-012 | Two parallel fan-out sub-agents write to the same path in their working directories | Each sub-agent has an isolated working directory (`devs-<run-id>-<stage>-<fan_out_index>/`); path collision is impossible within the working directory but not on shared mounts |

#### 1.3.4 Template Variable Injection via Structured Output

**[SEC-006]** The `{{stage.<name>.output.<field>}}` template resolution reads JSON fields from agent-produced `.devs_output.json`. A malicious agent could craft structured output containing `{{...}}` sequences that are then re-expanded in a subsequent stage's prompt resolution, creating a second-order injection. Template expansion MUST be single-pass with no recursive re-expansion.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-013 | Structured output field is a JSON object, not a scalar | `TemplateError::NonScalarField` — stage fails before agent spawn; object is not serialized into the prompt |
| EC-SEC-014 | Structured output field is a JSON array | Same as EC-SEC-013: `NonScalarField` error; arrays are not flattened into the prompt |
| EC-SEC-015 | Structured output `output` key is missing entirely | `TemplateError::UnknownVariable` — stage referencing that field fails; the overall run continues its branch logic |

#### 1.3.5 Path Traversal via `prompt_file`

**[SEC-007]** The `prompt_file` stage field accepts a filesystem path resolved at execution time. If user-provided paths (via workflow inputs) are interpolated into `prompt_file` values without validation, an attacker-controlled input could read arbitrary files on the server (e.g., `../../.ssh/id_rsa`, `devs.toml`).

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-016 | `prompt_file = "../../etc/passwd"` | Rejected at workflow validation time (step 8: `..` component detected); `INVALID_ARGUMENT` returned |
| EC-SEC-017 | `prompt_file` is a symlink pointing outside the workflow directory | Symlink resolved via `canonicalize()`; if resolved path escapes workflow root → `invalid_argument: path traversal detected` at execution time |
| EC-SEC-018 | `prompt_file` uses Windows drive letter on Linux (`C:\secrets`) | Path component is not `..` but is absolute; rejected at validation as an absolute path |

#### 1.3.6 Git Repository Poisoning

**[SEC-008]** Checkpoint data written to the project's git repository (`.devs/` directory, checkpoint branch) is under partial control of agent subprocesses (via auto-collect commits). A malicious agent could write crafted checkpoint files that corrupt state on recovery, trigger arbitrary state transitions, or smuggle data into the repository.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-019 | Agent writes a crafted `checkpoint.json` in its working directory before auto-collect | Auto-collect uses `git add -A` on the working directory; only changes in the project repo are committed; `checkpoint.json` is in `.devs/` which is excluded from agent working directory |
| EC-SEC-020 | Corrupt `checkpoint.json` read on recovery | Logged as `ERROR`; run marked `Unrecoverable`; server continues without attempting state restoration |
| EC-SEC-021 | Agent auto-collect pushes a file named `.devs/runs/<run-id>/checkpoint.json` | Auto-collect pushes to the checkpoint branch only; the `.devs/` directory in the working directory is the agent's working copy, not the server's state store |

#### 1.3.7 Server-Side Request Forgery (SSRF) via Webhooks

**[SEC-009]** Outbound webhook URLs are configured per-project. An attacker who can register or modify project configuration can direct `devs` to send POST requests to internal network addresses (`http://169.254.169.254/`, `http://localhost/`, RFC-1918 ranges), potentially accessing internal services or cloud metadata endpoints.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-022 | Webhook hostname resolves to `169.254.169.254` at delivery time (DNS rebinding) | SSRF check performed after DNS resolution at delivery time; blocked with `WARN` log `security.ssrf_blocked` |
| EC-SEC-023 | Webhook URL uses IPv6 loopback `http://[::1]/hook` | IPv6 loopback `::1/128` is in the blocklist; rejected |
| EC-SEC-024 | `server.allow_local_webhooks = true` is set | Loopback/RFC-1918 targets permitted; `WARN` logged on startup and on each delivery to a local target |

#### 1.3.8 Secrets in TOML Configuration

**[SEC-010]** Storing API keys directly in `devs.toml` under `[credentials]` is a documented anti-pattern. The file may be committed to source control, accessible to all local users, or readable by agent processes with filesystem MCP access. The Filesystem MCP explicitly permits read access to configuration files in the workspace unless restricted.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-025 | `devs.toml` contains `CLAUDE_API_KEY = "sk-ant-..."` | `WARN` logged at startup: key name only, never value; value used for agent spawning |
| EC-SEC-026 | Filesystem MCP `read_file` targets `devs.toml` | `devs.toml` is outside the workspace root; Filesystem MCP workspace-boundary check rejects the read |
| EC-SEC-027 | `devs.toml` path is inside the workspace root (unusual configuration) | If `devs.toml` is within the Filesystem MCP workspace, reads are permitted; operators MUST NOT place `devs.toml` inside the project workspace |

#### 1.3.9 Log Injection

**[SEC-011]** Agent stdout and stderr are stored verbatim in `.devs/logs/`. Malformed ANSI escape sequences or newline injection in log content can corrupt log display in the TUI or downstream log consumers. Structured log injection (crafted JSON log lines) can confuse log aggregation tools.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-028 | Agent stdout contains `\r\n` (CRLF) sequences | Written verbatim to log file; TUI display layer normalizes to `\n` for rendering; the raw log file preserves CRLF |
| EC-SEC-029 | Agent stderr contains ANSI OSC escape sequences (e.g., `\x1b]8;url\x07`) | Written verbatim to log file; TUI strips ANSI sequences using the `strip-ansi-escapes` crate or equivalent before rendering |
| EC-SEC-030 | Agent stdout contains a line that is valid JSON matching `tracing` log format | Written to stage log file only; MUST NOT be emitted via `tracing` macros; no confusion with server operational logs |

#### 1.3.10 Docker/SSH Remote Execution Surface

**[SEC-012]** The `docker` execution environment respects the `DOCKER_HOST` environment variable, and the `remote` environment uses `ssh2` for connections. A misconfigured `DOCKER_HOST` pointing to a remote daemon, or SSH credentials to a shared host, expands the blast radius of a compromised stage to that external system.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-031 | `DOCKER_HOST` is unset; Docker socket at default path is absent | `DockerExecutor` fails at `prepare()` with `not_found: docker socket not available`; stage fails immediately, no retry |
| EC-SEC-032 | Remote SSH host key changes between runs | `ssh2` host key validation fails; stage fails with `failed_precondition: SSH host key mismatch for <host>`; operator intervention required |
| EC-SEC-033 | SSH connection drops mid-stage | `RemoteSshExecutor` detects connection loss during `wait()`; stage transitions to `Failed`; no retry unless `retry.max_attempts > 1` |

#### 1.3.11 MCP Glass-Box State Exposure

**[SEC-013]** The MCP server exposes full internal state including stage outputs, structured data, workflow definitions, pool configurations, and checkpoint records. Any process reaching `:7891` can read all secrets that flow through stage outputs (e.g., an agent printing an API key to stdout for debugging). This is an accepted MVP risk; operators must ensure network isolation.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-034 | `get_stage_output` called on a running stage | Returns partial stdout/stderr collected so far; `exit_code: null`; `status: "running"` — not an error |
| EC-SEC-035 | `stream_logs(follow:true)` called by a process after the stage completes | Returns all buffered lines then `{"done":true}`; connection closes cleanly |
| EC-SEC-036 | Two concurrent `signal_completion` calls for the same stage | Per-run mutex serializes calls; first call succeeds; second call returns `failed_precondition: stage already in terminal state` |

### 1.4 STRIDE Threat Analysis

The following table maps STRIDE threat categories to specific attack vectors and their mitigations for the MVP attack surface. Residual risks are documented with the accepted risk rationale.

| STRIDE Category | Threat | Component | Mitigation | Residual Risk |
|---|---|---|---|---|
| **Spoofing** | Client impersonation on gRPC/MCP | gRPC `:7890`, MCP `:7891` | Network perimeter (loopback bind); post-MVP: mTLS | HIGH — accepted MVP risk; no auth |
| **Spoofing** | Agent spoofs `signal_completion` for another run | MCP `signal_completion` | `run_id` + `stage_name` required; per-run mutex | LOW — caller must know valid `run_id`; loopback-only |
| **Tampering** | Workflow snapshot modified after run starts | `.devs/runs/<id>/workflow_snapshot.json` | Write-once check at persist layer (**[SEC-066]**) | LOW — file mode `0600`; git history provides evidence |
| **Tampering** | Checkpoint state corrupted by malicious file write | `checkpoint.json` | Atomic write (tmp→rename); schema version check; corrupt → `Unrecoverable` | MEDIUM — OS-level attacker with same-user privileges can corrupt |
| **Tampering** | Prompt injection via stage output template vars | `TemplateResolver` | Single-pass expansion (**[SEC-040]**); scalar-only extraction (**[SEC-043]**); 10KiB truncation (**[SEC-042]**) | MEDIUM — inherent to AI chaining; human review recommended |
| **Repudiation** | Deny submitting a workflow run | gRPC `SubmitRun` | Audit log with `run_id`, `slug`, `workflow_name`, `actor` (**[SEC-086]**) | LOW — structured audit trail persisted |
| **Information Disclosure** | Credential leaked via stage stdout | Stage output log files | Log files at `0600` (**[SEC-093]**); MUST NOT appear in `tracing` logs (**[SEC-089]**) | HIGH — operator must rotate exposed keys |
| **Information Disclosure** | `devs.toml` read via Filesystem MCP | Filesystem MCP | Workspace boundary enforcement (**[SEC-019]**); `devs.toml` outside workspace root | LOW — workspace boundary blocks access |
| **Information Disclosure** | MCP exposes full internal state | MCP `:7891` | Loopback-only bind (default); TLS optional for non-loopback (WARN logged if absent) | HIGH — accepted MVP Glass-Box design |
| **Denial of Service** | Unbounded stage output exhausts memory | Stage executor | `BoundedBytes<1_048_576>` cap; truncation (**[SEC-072]**) | LOW — hard limit enforced at type level |
| **Denial of Service** | Fan-out combinatorial explosion | DAG Scheduler | Max 64 sub-agents per stage (**[SEC-074]**); max 256 stages per workflow | LOW — validation-time rejection |
| **Denial of Service** | Slow webhook receiver blocks scheduler | Webhook dispatcher | Fire-and-forget via `tokio::spawn`; 10s timeout per attempt (**[SEC-076]**) | LOW — isolated async task |
| **Elevation of Privilege** | Agent subprocess gains server-level control | Agent adapter | No privilege separation at MVP; same OS user | HIGH — accepted risk; `docker`/`remote` envs provide partial isolation |
| **Elevation of Privilege** | MCP control tool called by orchestrated agent | MCP server | Software role separation; orchestrated agents should only call allowed tools (**[SEC-017]**) | MEDIUM — not enforced cryptographically at MVP |
| **Elevation of Privilege** | Path traversal reads server config/keys | `prompt_file`, Filesystem MCP | Canonicalize + boundary check (**[SEC-047]**, **[SEC-020]**) | LOW — enforced at multiple layers |

#### 1.4.1 Threat Severity Classification Schema

Residual risk ratings in the STRIDE table above use the following four-level scale. This schema is applied consistently throughout this document and is used when evaluating new threats during future development.

| Rating | Criteria | Example Threat | Required Operator Action |
|---|---|---|---|
| **CRITICAL** | Exploitable by any unauthenticated network-reachable attacker without preconditions; yields direct secret exfiltration or full system compromise | Remote code execution via publicly reachable port with no auth | MVP blocked; threat MUST be eliminated before any deployment |
| **HIGH** | Exploitable with local access or operator misconfiguration; significant impact (credential exposure, data integrity loss); accepted at MVP only with documented operator controls | API key value appearing in `tracing` log output forwarded to a log aggregator | Document operator controls in §1.2.1; verify via §5 audit events; rotate affected keys |
| **MEDIUM** | Requires a compromised component or a specific workflow misconfiguration; limited blast radius; partially mitigated by defense-in-depth controls | Second-order prompt injection via crafted structured output from a compromised upstream stage | Implement mitigations in §4; emit audit event on detection; recommend human review in documentation |
| **LOW** | Requires substantial attacker capability and yields limited-impact access; multiple independent mitigations are already effective | ANSI escape injection in log files causing display corruption | No additional action required; existing mitigation sufficient |

**[SEC-RISK-001]** No threat in the MVP STRIDE analysis is rated **CRITICAL**. The implementation MUST NOT introduce any new residual risk rated **HIGH** or **CRITICAL** without updating §1.4 in this document and obtaining explicit design approval. Approval MUST be recorded as a commit to this specification file, not as a code comment.

**[SEC-RISK-002]** The STRIDE analysis in §1.4 MUST be reviewed and updated whenever any of the following changes are made to the implementation:
- A new network-accessible interface is added (see §1.1.1 entry-point table)
- A new agent adapter is added beyond the 5 MVP adapters (`claude`, `gemini`, `opencode`, `qwen`, `copilot`)
- The execution environment set is expanded beyond `{tempdir, docker, remote}`
- The MCP tool set is expanded beyond the 17 MVP tools
- Any crate that handles credential data (API keys, HMAC secrets, SSH keys) is added or changed

**[SEC-RISK-003]** Each threat rated **HIGH** with "accepted MVP risk" MUST have a corresponding audit log event emitted when the threat condition is triggered or detected. The `event_type` values for these events are defined in §5.2 and include `security.misconfiguration`, `security.ssrf_blocked`, and `security.credential_in_config`.

#### 1.4.2 Attack Vector to Control Mapping

The following table cross-references each §1.3 attack vector to its implementing SEC controls, the crates responsible for enforcement, and the acceptance criteria that verify correctness. An implementation is incomplete until all referenced acceptance criteria pass.

| Attack Vector (§1.3) | Residual Risk | Primary SEC Controls | Implementing Crate(s) | Verification (AC / EC) |
|---|---|---|---|---|
| 1.3.1 Prompt injection | MEDIUM | SEC-003, SEC-040, SEC-042, SEC-043, SEC-006 | `devs-core` (`TemplateResolver`) | AC-SEC-1-004, AC-SEC-4-001 |
| 1.3.2 Credential exposure | HIGH (accepted) | SEC-004, SEC-023–026, SEC-088, SEC-089 | `devs-core` (`Redacted<T>`), `devs-config` | AC-SEC-1-005, AC-SEC-5-002, AC-SEC-4-007 |
| 1.3.3 Subprocess isolation failure | HIGH (accepted) | SEC-005, SEC-027–029, SEC-044, SEC-045 | `devs-executor`, `devs-adapters` | AC-SEC-3-002, AC-SEC-4-006 |
| 1.3.4 Structured-output template injection | MEDIUM | SEC-006, SEC-040–043 | `devs-core` (`TemplateResolver`) | AC-SEC-4-001, AC-SEC-4-004 |
| 1.3.5 Path traversal via `prompt_file` | LOW | SEC-007, SEC-047, SEC-048 | `devs-adapters`, `devs-scheduler` (validation) | AC-SEC-4-002, AC-SEC-4-003 |
| 1.3.6 Git repository poisoning | LOW | SEC-008, SEC-065, SEC-066 | `devs-checkpoint` | EC-SEC-019, EC-SEC-020 |
| 1.3.7 SSRF via webhooks | LOW | SEC-009, SEC-036, SEC-037, SEC-068 | `devs-webhook` (`check_ssrf`) | AC-SEC-1-006, AC-SEC-3-006 |
| 1.3.8 Secrets in TOML configuration | MEDIUM | SEC-010, SEC-024 | `devs-config` | AC-SEC-2-002, AC-SEC-5-002 |
| 1.3.9 Log injection | LOW | SEC-011, SEC-090, SEC-091 | `devs-executor` (log writer), `devs-tui` | AC-SEC-5-005, AC-SEC-5-007 |
| 1.3.10 Docker/SSH blast radius | HIGH (accepted) | SEC-012, SEC-027, SEC-031 | `devs-executor` | AC-SEC-3-001 |
| 1.3.11 MCP Glass-Box state exposure | HIGH (accepted) | SEC-013, SEC-051, SEC-057 | `devs-mcp` | AC-SEC-1-003 |

### 1.5 Asset Inventory & Sensitivity Classification

| Asset | Location | Sensitivity | Primary Risk |
|---|---|---|---|
| AI Provider API keys | Server process environment, `devs.toml` | **Critical** | Credential leakage, financial fraud |
| Webhook signing secrets | `projects.toml` (in-memory) | **Critical** | Payload forgery, receiver bypass |
| SSH private keys | `devs.toml` `ssh_config` or agent system | **Critical** | Remote host compromise |
| Stage stdout/stderr | `.devs/logs/<run-id>/...` | **High** | May contain printed secrets, PII from agent workloads |
| Workflow definitions | `.devs/workflows/`, `checkpoint.json` | **High** | Proprietary business logic, prompt engineering IP |
| `checkpoint.json` | `.devs/runs/<run-id>/` | **High** | Full run state including structured outputs |
| `devs.toml` (non-credential) | Operator-managed path | **Medium** | Pool/project configuration, internal addresses |
| `projects.toml` | `~/.config/devs/` | **Medium** | Project paths, webhook URLs |
| Server operational logs | stderr (process) | **Medium** | Internal addresses, error details |
| Discovery file | `~/.config/devs/server.addr` | **Low** | Server listen address |
| TUI/CLI display output | Terminal stdout | **Low** | Run status, stage names, elapsed times |

#### 1.5.1 Asset-to-Threat Mapping

The following table maps each sensitive asset to its primary threat vectors and the controls that protect it. The full control definitions are in §4.

| Asset | Primary Threat Vector | Primary SEC Control | Secondary SEC Control |
|---|---|---|---|
| AI provider API keys | §1.3.2 credential exposure; §1.3.8 TOML config read | `Redacted<T>` in all log output (SEC-088); env var preferred over TOML (SEC-023) | `devs.toml` outside Filesystem MCP workspace (SEC-019); file mode `0600` (SEC-024) |
| Webhook signing secrets | Network interception; receiver impersonation | HMAC-SHA256 signing (SEC-021); 32-byte minimum key length (SEC-054) | `Redacted<T>` wrapper; never written to checkpoints or logs (SEC-064) |
| SSH private keys | Filesystem exposure; agent subprocess theft via same-user process | Not managed by `devs`; operator OS responsibility | Agent working directory isolation per run (SEC-029); `devs.toml` file mode `0600` |
| Stage stdout/stderr | §1.3.2 credential printing by agent; §1.3.9 log injection | Log files at mode `0600` (SEC-093); never emitted via `tracing` macros (SEC-089) | MCP `get_stage_output` output capped at 1 MiB (SEC-072); TUI ANSI stripping (SEC-011) |
| Workflow definitions | Intellectual property theft; prompt engineering IP exfiltration | Filesystem MCP write policy (SEC-019); checkpoint branch isolation (SEC-028) | Snapshot write-once enforced at persist layer (SEC-066) |
| `checkpoint.json` | §1.3.6 git repository poisoning; unauthorized state read | Atomic write-rename protocol (SEC-037); schema version check on load (SEC-008) | git SHA-1 content addressing as integrity check (SEC-065); file mode `0600` |
| `devs.toml` (non-credential) | Unauthorized read via Filesystem MCP path traversal | Workspace boundary enforcement keeps `devs.toml` outside agent workspace (SEC-019) | File mode `0600`; startup file permission check (SEC-058) |
| `projects.toml` | Unauthorized modification; webhook URL injection by co-located user | OS file permissions; atomic write (tmp→rename) on all registry updates | Registry modified only by `devs project add/remove` CLI; no direct file writes |
| Server operational logs | Log scraping for internal addresses, gRPC port discovery | Written to stderr only; no persistent server log file at MVP (SEC-094) | No stage stdout/stderr in `tracing` output (SEC-089) |
| Discovery file | Pivot to gRPC/MCP attack surface by non-privileged local user | File mode `0600` (SEC-030); deleted on clean shutdown | Contains only gRPC address; MCP address obtained only via `GetInfo` RPC |
| TUI/CLI display output | §1.3.9 ANSI escape injection causing TUI display corruption | ANSI escape stripping applied before TUI rendering (SEC-011) | Stage log files (separate from TUI ring buffer) preserve raw output |

### 1.6 Regulatory & Compliance Scope

**[SEC-014]** `devs` is developer tooling, not a consumer-facing service. At MVP, no PII is processed by `devs` itself (PII may flow through agent outputs depending on user workloads — outside scope). The primary compliance obligations are:

- **Secret management**: API keys handled per industry standards (env vars preferred, no plaintext logging)
- **Audit trails**: all workflow submissions, state transitions, and control operations logged
- **Supply chain**: Rust dependency audit against known CVEs via `cargo audit`

#### 1.6.1 Compliance Obligation Detail

| Obligation | Category | Implementing Mechanism | Verification |
|---|---|---|---|
| API key secrecy in logs | Secret management | `Redacted<T>` wrapper on all credential fields (SEC-088); stage stdout/stderr to log files only, never `tracing` (SEC-089) | AC-SEC-1-005; `CLAUDE_API_KEY` value absent from all `tracing` log lines in a standard run |
| API key secrecy at rest | Secret management | Env var preferred (SEC-023); TOML fallback with `WARN` (SEC-024); `devs.toml` mode `0600` check (SEC-058) | AC-SEC-2-002; AC-SEC-3-005 |
| Audit trail — run lifecycle | Audit trail | `run.submitted`, `run.started`, `run.completed`, `run.failed`, `run.cancelled` events at INFO level (§5.2) | AC-SEC-5-001; all mandatory event types present in structured log output |
| Audit trail — control operations | Audit trail | `run.cancelled`, `run.paused`, `run.resumed`, `stage.cancelled`, `stage.paused`, `stage.resumed` events at INFO (§5.2) | AC-SEC-5-001 |
| Audit trail — security events | Audit trail | `security.misconfiguration`, `security.ssrf_blocked`, `security.credential_in_config` events at WARN (§5.2) | AC-SEC-1-001; AC-SEC-1-006; AC-SEC-2-002 |
| Dependency CVE scanning | Supply chain | `cargo audit --deny warnings` in `./do lint` (SEC-060); GitLab CI `cargo-audit` job (SEC-061) | AC-SEC-4-008; exits 0 on unmodified repository |
| Dependency version pinning | Supply chain | Authoritative version table in TAS §2.2; `./do lint` dep audit enforces it (SEC-081) | AC-SEC-4-005; unregistered dep causes lint failure |
| No third-party telemetry | Privacy | No dependency that initiates network calls to external analytics/crash-reporting endpoints | Verified by `cargo tree` review as part of dep audit; any such dep fails lint |

**[SEC-014-BR-001]** The audit trail MUST be complete: every `SubmitRun`, `CancelRun`, `PauseRun`, `ResumeRun`, `write_workflow_definition`, and stage terminal transition MUST produce a structured log event at `INFO` level or higher with the mandatory fields defined in §5.3 (`timestamp`, `level`, `target`, `fields.event_type`).

**[SEC-014-BR-002]** `cargo audit --deny warnings` MUST exit with code 0 on the unmodified repository at any point in the development lifecycle. Any advisory that cannot be immediately resolved MUST have a corresponding `audit.toml` suppression entry with a human-readable justification comment and an ISO 8601 expiry date (see SEC-062).

**[SEC-014-BR-003]** `devs` MUST NOT introduce any dependency that initiates outbound network connections to third-party telemetry, analytics, license validation, or crash-reporting endpoints. All outbound network I/O from the `devs-server` process MUST be one of: agent subprocess invocation (to AI provider APIs), webhook delivery (to operator-configured URLs), or git push/fetch (to the project repository). This MUST be verifiable by a `cargo tree` audit of all non-dev dependencies.

### 1.7 Section 1 Acceptance Criteria

All acceptance criteria in this section MUST be covered by at least one automated test annotated `// Covers: AC-SEC-1-NNN`. Tests satisfying E2E coverage gates (QG-003/004/005) MUST exercise the control through the external interface (CLI, TUI, or MCP), not through internal Rust function calls.

**Trust Model and Attack Surface (§1.1–1.2):**

- **[AC-SEC-1-001]** Server logs `WARN` with `event_type: "security.misconfiguration"`, `check_id: "SEC-BIND-ADDR"`, and `check_id: "SEC-TLS-MISSING"` on startup when `server.listen` binds to a non-loopback address without TLS configured. The server MUST still start (not abort).
- **[AC-SEC-1-002]** A process connecting to `:7890` on the loopback interface can call `SubmitRun` without providing any credentials; the call succeeds (not rejected with an auth error).
- **[AC-SEC-1-003]** A process connecting to `:7891` on the loopback interface can call `get_run` without authentication; the call succeeds with the expected JSON response.
- **[AC-SEC-1-007]** An unconfigured server (no `devs.toml`, no `DEVS_LISTEN` env var) binds only to `127.0.0.1:7890` for gRPC and `127.0.0.1:7891` for MCP. Verified by `netstat`/`ss` or equivalent in the test environment.
- **[AC-SEC-1-008]** The discovery file written by the server contains exactly one line in `<host>:<port>` format. The file MUST NOT contain the MCP port number or any other content.
- **[AC-SEC-1-009]** The discovery file is written atomically (write-to-tmp → `rename(2)`). A test that reads the discovery file concurrently with server startup MUST never observe a partial write (empty file or partial address).
- **[AC-SEC-1-010]** The discovery file has Unix mode `0600` immediately after creation. Verified by `fs::metadata().permissions()` in the test.

**Prompt Injection (§1.3.1):**

- **[AC-SEC-1-004]** Stage output containing the literal string `{{stage.other.stdout}}` passed as a template variable to a downstream stage does NOT trigger recursive template expansion; the literal string is emitted verbatim in the generated prompt without modification.
- **[AC-SEC-1-011]** A structured output field containing `{{workflow.input.secret}}` is extracted as a plain string and placed verbatim in the downstream prompt. The downstream prompt MUST NOT contain the expanded value of `workflow.input.secret`.
- **[AC-SEC-1-012]** A fan-out item value containing `}}{{` boundary sequences is placed verbatim into the generated prompt. No partial template token from the boundary sequence is evaluated.

**Credential Exposure (§1.3.2):**

- **[AC-SEC-1-005]** `CLAUDE_API_KEY` value does NOT appear in any `tracing`-generated log line (stdout or stderr of the server process) at any log level during a complete workflow run that includes agent subprocess invocation.
- **[AC-SEC-1-013]** A workflow `default_env` key that matches the pattern `*_API_KEY` triggers a `WARN` log event with `event_type: "security.credential_in_config"` at workflow load time. The key NAME is logged; the key VALUE is NOT logged.
- **[AC-SEC-1-014]** `devs.toml` with a credential key under `[credentials]` causes a `WARN` log event with `event_type: "security.credential_in_config"` and `key_name: "<KEYNAME>"` at startup. The credential value MUST NOT appear in the log event.

**Agent Subprocess Isolation (§1.3.3):**

- **[AC-SEC-1-015]** Two parallel fan-out sub-agents (fan_out.count = 2) write to paths within their respective working directories. The path `<os-tempdir>/devs-<run-id>-<stage>-0/repo/` and `<os-tempdir>/devs-<run-id>-<stage>-1/repo/` are distinct directories. Neither sub-agent's writes appear in the other's working directory.
- **[AC-SEC-1-016]** After a stage completes (success or failure), the working directory `<os-tempdir>/devs-<run-id>-<stage>/` is deleted. Verified by asserting the path does not exist on disk after the stage transitions to a terminal state.

**Path Traversal (§1.3.5):**

- **[AC-SEC-1-017]** A workflow definition with `prompt_file = "../../etc/passwd"` is rejected at validation time with `INVALID_ARGUMENT` containing `"invalid_argument: path traversal"`. No file read is attempted.
- **[AC-SEC-1-018]** A `prompt_file` that is a symlink resolving to a path outside the workflow directory is rejected at execution time with `"invalid_argument: path traversal detected"`. The stage transitions to `Failed` without spawning the agent subprocess.

**Git Repository Poisoning (§1.3.6):**

- **[AC-SEC-1-019]** A `checkpoint.json` with schema version other than `1` found on recovery is skipped; the corresponding run is marked `Unrecoverable` in the in-memory state; the server continues processing other projects normally.
- **[AC-SEC-1-020]** A `workflow_snapshot.json` file that already exists for a run MUST NOT be overwritten by a second write attempt. The persist layer returns an error that is logged at `ERROR` level; the server does not crash.

**SSRF via Webhooks (§1.3.7):**

- **[AC-SEC-1-006]** A webhook URL that resolves to `169.254.169.254` at delivery time (simulated via a test DNS stub) is blocked. A `WARN` log entry with `event_type: "security.ssrf_blocked"` is emitted. Zero HTTP requests are made to that address.
- **[AC-SEC-1-021]** A webhook URL using the literal IPv6 loopback address `http://[::1]:9999/hook` is blocked with `event_type: "security.ssrf_blocked"` without making any network connection.
- **[AC-SEC-1-022]** A webhook URL using a private RFC-1918 address (e.g., `http://10.0.0.1/hook`) is blocked with `event_type: "security.ssrf_blocked"`. The check is performed after DNS resolution so that DNS rebinding attacks (where a hostname resolves to a private IP) are also blocked.

**MCP Glass-Box Exposure (§1.3.11):**

- **[AC-SEC-1-023]** `get_stage_output` called on a stage with `status: "running"` returns a response with `"error": null`, `"exit_code": null`, and partial stdout/stderr content collected up to that point. The call MUST NOT return an error.
- **[AC-SEC-1-024]** `stream_logs(follow: true)` called after a stage has already completed returns all buffered log lines followed by a terminal chunk `{"done": true}`. The connection closes with HTTP 200; no error is returned.

**Compliance and Supply Chain (§1.6):**

- **[AC-SEC-1-025]** `cargo audit --deny warnings` exits with code 0 when run against the unmodified repository. This criterion MUST remain passing on every commit to main.
- **[AC-SEC-1-026]** Every `SubmitRun` call (via CLI `devs submit` or MCP `submit_run`) produces a structured log event at `INFO` level containing `event_type: "run.submitted"`, `run_id`, `workflow_name`, and `project_id`. Verified by scanning the server's structured log output in an E2E test.

### 1.8 Section 1 Component Dependencies

This section documents which other `devs` components implement the controls described in §1 and which components consume those controls.

```mermaid
graph TD
    subgraph SEC1["§1 Threat Model Controls"]
        TM["Trust Boundary Rules\n(SEC-001–002, SEC-ATK-*)"]
        STR["STRIDE Residual Risk\n(SEC-RISK-001–003)"]
    end

    subgraph IMPL["Implementing Components"]
        CORE["devs-core\n(Redacted<T>, BoundedString<N>,\nTemplateResolver, StateMachine)"]
        CONFIG["devs-config\n(devs.toml parsing, file perm check,\ncredential WARN)"]
        PERSIST["devs-checkpoint\n(atomic write, schema version,\nwrite-once snapshot)"]
        ADAPTERS["devs-adapters\n(prompt file UUID naming,\nworking dir isolation, EnvKey validation)"]
        EXECUTOR["devs-executor\n(working dir cleanup, log file mode,\nauto-collect boundary)"]
        WEBHOOK["devs-webhook\n(check_ssrf, HMAC signing,\nfire-and-forget delivery)"]
        MCP["devs-mcp\n(Filesystem MCP path policy,\nJSON depth limit)"]
        SERVER["devs-server\n(startup WARN on non-loopback,\ndiscovery file mode 0600)"]
    end

    TM -->|"enforced by"| SERVER
    TM -->|"enforced by"| CONFIG
    STR -->|"prompt injection"| CORE
    STR -->|"credential exposure"| CORE
    STR -->|"credential exposure"| CONFIG
    STR -->|"subprocess isolation"| EXECUTOR
    STR -->|"subprocess isolation"| ADAPTERS
    STR -->|"path traversal"| MCP
    STR -->|"path traversal"| ADAPTERS
    STR -->|"git poisoning"| PERSIST
    STR -->|"SSRF"| WEBHOOK
    STR -->|"Glass-Box exposure"| MCP
```

**Upstream dependencies** (components §1 controls depend on):

| Component | Role in §1 Controls |
|---|---|
| `devs-core` | Provides `Redacted<T>`, `BoundedString<N>`, `TemplateResolver` (single-pass expansion), `StateMachine` (prevents illegal transitions used in tampering mitigations) |
| `devs-config` | Enforces `devs.toml` parse-time credential warnings; provides file permission checks run at server startup |
| `devs-checkpoint` | Implements atomic write-rename protocol; enforces write-once snapshot invariant; validates `schema_version` on checkpoint load |
| `devs-adapters` | Uses UUID-named prompt files; validates `EnvKey` before subprocess spawn; strips prohibited env vars |
| `devs-executor` | Creates per-run-per-stage isolated working directories; enforces cleanup after every stage; sets log file mode `0600` |
| `devs-webhook` | Implements `check_ssrf()` with post-DNS validation; computes HMAC-SHA256 signatures; fire-and-forget delivery |
| `devs-mcp` | Enforces Filesystem MCP workspace boundary (path canonicalization + access policy); applies JSON deserialization depth limit |
| `devs-server` | Logs `security.misconfiguration` on non-loopback bind; writes discovery file with mode `0600`; deletes discovery file on shutdown |

**Downstream consumers** (components that depend on §1 threat model being correctly implemented):

| Consumer | Dependency |
|---|---|
| §2 (Authentication & Authorization Policies) | Builds on the MVP trust model boundary defined in §1.2; loopback-only assumption is the foundation for no-auth design |
| §4 (Application Security Controls) | Each control in §4 is a mitigation for a threat identified in §1.3 and §1.4 |
| §5 (Logging & Audit Trails) | Audit event types in §5.2 correspond to threat trigger conditions identified in §1.3 and §1.4.1 |
| Startup security checks (§2.6) | Checks run at startup directly correspond to threats and preconditions in §1.2 and §1.5 |

---

## 2. Authentication & Authorization Policies

### 2.1 MVP Trust Model (No Client Authentication)

**[SEC-015]** At MVP, neither the gRPC service nor the MCP HTTP server performs client authentication. The access control model is network-perimeter-based:

- **Bind address**: Default listen address for both gRPC (`:7890`) and MCP (`:7891`) MUST be `127.0.0.1` (loopback). Changing to `0.0.0.0` is a documented operator action with an explicit security warning logged at `WARN` level on startup.
- **Firewall enforcement**: Operators deploying on multi-user machines MUST use OS-level firewall rules to restrict access to these ports to authorized users or processes.
- **Remote clients**: When TUI or CLI clients connect to a remote server, the transport connection MUST use TLS (see **[SEC-031]**).

**[SEC-016]** The `devs-mcp-bridge` (stdio→MCP proxy) inherits the trust level of the process that spawns it. When spawned by an orchestrated agent via `DEVS_MCP_ADDR`, the bridge MUST NOT require additional authentication beyond network reachability. This is an accepted design constraint of the Glass-Box architecture.

#### 2.1.1 Connection Context Data Model

Every accepted TCP connection on either the gRPC or MCP port is tracked in-process with a minimal connection record. This record is ephemeral (not persisted to disk) and is used only for structured log emission and future auth interceptor integration.

```rust
/// In-process connection record. Lives for the duration of the TCP connection.
/// Not persisted to disk. Used only for audit log emission and future auth integration.
pub struct ConnectionContext {
    /// Unique ID for this connection, used in audit log entries for correlation.
    pub connection_id: Uuid,
    /// Remote IP address and port of the connecting client.
    pub remote_addr: std::net::SocketAddr,
    /// Which protocol endpoint accepted this connection.
    pub endpoint: ConnectionEndpoint,
    /// Monotonic timestamp of when the connection was accepted.
    pub accepted_at: std::time::Instant,
    /// Reserved for post-MVP auth: identity of the authenticated caller.
    /// Always `None` at MVP; present as `null` in audit log entries.
    pub authenticated_as: Option<String>,
}

pub enum ConnectionEndpoint {
    /// gRPC on the primary listen port.
    GrpcServer,
    /// MCP HTTP/JSON-RPC on the MCP port.
    McpServer,
}
```

`ConnectionContext` fields are emitted in audit log entries at connection open and connection close. The `connection_id` is a UUID4 generated per-connection; it appears in all log lines emitted during that connection's lifetime for trace correlation.

#### 2.1.2 Network Isolation Business Rules

The following rules define the binding and isolation behavior at MVP. Each rule is independently testable.

**[SEC-015-BR-001]** The default gRPC bind address is `127.0.0.1:7890`. The default MCP bind address is `127.0.0.1:7891`. Both defaults appear in the built-in default configuration and MUST NOT require any `devs.toml` entry to take effect.

**[SEC-015-BR-002]** When `server.listen` is changed to any non-loopback address (any address where the leading octet is not `127`), the startup security check `SEC-BIND-ADDR` MUST emit a `WARN`-level log. This warning is non-fatal; the server proceeds to bind.

**[SEC-015-BR-003]** When `server.listen` is changed to `0.0.0.0` (all interfaces), the `WARN` log MUST include the machine's resolved non-loopback IP addresses so the operator is fully aware of the network exposure surface.

**[SEC-015-BR-004]** Both gRPC and MCP ports MUST always be bound simultaneously. There is no configuration option to disable either port individually at MVP.

**[SEC-015-BR-005]** If gRPC and MCP are configured to the same port number, startup MUST fail during config validation — before any port binding — with error: `"invalid_argument: server.listen and server.mcp_port must be different"`.

**[SEC-015-BR-006]** The server MUST NOT bind to port 0 (OS-assigned ephemeral port) except in test contexts identified by the presence of the `DEVS_TEST_MODE=1` environment variable paired with an isolated `DEVS_DISCOVERY_FILE` path. Ephemeral-port binding outside test contexts is rejected at config validation.

#### 2.1.3 `devs-mcp-bridge` Trust Inheritance

The `devs-mcp-bridge` binary is a stdio-to-HTTP proxy. Its trust model is documented below:

```
[AI Agent Process]
    │ stdin/stdout (JSON-RPC 2.0)
    ▼
[devs-mcp-bridge]
    │ HTTP POST /mcp/v1/call
    ▼
[devs MCP Server on :7891]
```

The bridge performs no authentication of its own. It forwards all requests verbatim to the MCP server's HTTP endpoint. The trust chain is:

1. The process that spawns `devs-mcp-bridge` is trusted to have legitimate access to the MCP port; access control is network-perimeter-enforced at the OS level.
2. `devs-mcp-bridge` reads the MCP address from `DEVS_DISCOVERY_FILE` once at startup and caches it for the session lifetime. It MUST NOT re-read the discovery file mid-session (**[MCP-BR-004]**).
3. All JSON-RPC requests received on stdin are forwarded as-is. The bridge does NOT inspect or modify request bodies.
4. If the HTTP connection to the MCP server is lost, the bridge writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 (**[MCP-057]**); it does NOT silently buffer or retry beyond one reconnect attempt.

**[SEC-016-BR-001]** `devs-mcp-bridge` MUST forward the remote socket identity of its spawning process via the `X-Forwarded-For` HTTP header on every proxied request, enabling the MCP server's audit log to record the originating client.

**[SEC-016-BR-002]** If `devs-mcp-bridge` starts and the MCP address from the discovery file is not reachable (connection refused), it MUST exit with code 1 immediately and write `{"result":null,"error":"server_unreachable: MCP server not reachable at <addr>","fatal":true}` to stdout before attempting to forward any requests.

#### 2.1.4 Client Connection Lifecycle State Diagram

```mermaid
stateDiagram-v2
    [*] --> Pending : TCP SYN received on gRPC or MCP port

    Pending --> Accepted : TCP three-way handshake complete
    Accepted --> TlsHandshake : non-loopback bind AND TLS configured
    Accepted --> Authorized : loopback bind (no TLS required at MVP)

    TlsHandshake --> Authorized : TLS handshake succeeds
    TlsHandshake --> Rejected : TLS handshake fails (cert mismatch, expired, etc.)
    Rejected --> [*] : connection closed; WARN log with connection_id + remote_addr

    Authorized --> Serving : first valid request received
    Serving --> Serving : subsequent requests (connection reused)
    Serving --> Closed : client disconnect OR server shutdown signal

    Closed --> [*] : connection_id + remote_addr + duration emitted in audit log
```

#### 2.1.5 Trust Model Edge Cases

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-001 | Remote TUI client connects to non-loopback gRPC without TLS configured | Server with `server.listen = "0.0.0.0:7890"` and no TLS cert starts successfully but logs `WARN` with `event_type: "security.misconfiguration"`, `check_id: "SEC-TLS-MISSING"`, `detail: "plaintext gRPC on non-loopback address; configure [server.tls] to suppress"` (**[SEC-033]**) |
| EC-SEC-002 | Docker-based agent stage tries to connect back to MCP server | Agent receives `DEVS_MCP_ADDR` injected by `devs-executor` with `http://host-gateway:7891` or `http://host.docker.internal:7891`; standard loopback trust model applies from the host's perspective |
| EC-SEC-003 | Two `devs-mcp-bridge` instances connect simultaneously to MCP server | Both connections accepted; each assigned a distinct `connection_id`; MCP server handles ≥64 concurrent connections (**[MCP-BR-042]**) |
| EC-SEC-004 | Client connects to MCP port and sends malformed HTTP (not JSON-RPC 2.0) | Returns HTTP 400; `ConnectionContext` emits `WARN` log with remote addr and connection_id |
| EC-SEC-005 | `DEVS_MCP_ADDR` in the discovery file points to an unreachable address | `devs-mcp-bridge` exits code 1 with structured error; orchestrated agents that experience this call `signal_completion(success:false)` via fallback exit-code mechanism |

---

### 2.2 Agent Role Separation (Software-Enforced, Not Cryptographic)

**[SEC-017]** Two agent sub-roles exist with different intended MCP tool sets. Role is determined by execution context — specifically whether `DEVS_MCP_ADDR` is set in the agent's environment by `devs-executor` — not by cryptographic identity. This is a defense-in-depth convention, not a security boundary.

| Sub-Role | Detection Heuristic | Intended MCP Tools |
|---|---|---|
| **Orchestrated Agent** | `DEVS_MCP_ADDR` set in env (injected by `devs-executor`) | `report_progress`, `signal_completion`, `report_rate_limit` |
| **Observing/Controlling Agent** | External process; `DEVS_MCP_ADDR` not injected by `devs-executor` | All 17 MCP tools + Filesystem MCP |

**[SEC-018]** The MCP server MUST NOT enforce tool-level restrictions based on caller identity at MVP (documented in `[FEAT-BR-011]`). Tool-level authorization is a post-MVP capability. Any process that reaches `:7891` over the network can invoke all control tools. Operators must ensure network isolation is in place.

#### 2.2.1 Role Detection Algorithm

Role detection is performed by `devs-executor` at agent spawn time, not by the MCP server. The MCP server is stateless with respect to caller roles at MVP. The algorithm that constructs the subprocess environment is:

```rust
/// Build the subprocess environment for an orchestrated agent stage.
/// [SEC-017-BR-001]: DEVS_MCP_ADDR MUST be injected into every stage.
/// [SEC-017-BR-003]: DEVS_LISTEN, DEVS_MCP_PORT, DEVS_DISCOVERY_FILE MUST be stripped.
/// [SEC-017-BR-004]: Stage env MUST NOT reintroduce stripped variables.
pub fn build_agent_env(
    server_config: &ServerConfig,
    stage_def: &StageDefinition,
    inherited_server_env: &HashMap<EnvKey, String>,
) -> Result<HashMap<EnvKey, String>, EnvBuildError> {
    let mut env = inherited_server_env.clone();

    // Apply workflow-level default_env overrides
    for (key, val) in &stage_def.workflow_default_env {
        env.insert(key.clone(), val.clone());
    }

    // Apply stage-level env overrides
    for (key, val) in &stage_def.env {
        env.insert(key.clone(), val.clone());
    }

    // Step 1: Strip server-internal variables unconditionally.
    // These are stripped AFTER stage overrides to prevent stages from
    // reintroducing them (validation also blocks this, but defense-in-depth).
    for key in &[
        EnvKey::from_static("DEVS_LISTEN"),
        EnvKey::from_static("DEVS_MCP_PORT"),
        EnvKey::from_static("DEVS_DISCOVERY_FILE"),
    ] {
        env.remove(key);
    }

    // Step 2: Inject MCP address for agent→devs callback.
    // This is the defining characteristic of the Orchestrated Agent role.
    let mcp_addr = resolve_mcp_addr_for_execution_env(server_config, &stage_def.execution_env)?;
    env.insert(
        EnvKey::from_static("DEVS_MCP_ADDR"),
        mcp_addr,
    );

    Ok(env)
}

/// Resolve the MCP address appropriate for the stage's execution environment.
fn resolve_mcp_addr_for_execution_env(
    config: &ServerConfig,
    exec_env: &Option<ExecutionEnv>,
) -> Result<String, EnvBuildError> {
    match exec_env {
        None | Some(ExecutionEnv { kind: EnvKind::LocalTempdir, .. }) => {
            // Local execution: MCP is reachable at the configured MCP port on loopback.
            Ok(format!("http://127.0.0.1:{}", config.mcp_port))
        }
        Some(ExecutionEnv { kind: EnvKind::Docker, .. }) => {
            // Docker containers reach the host via host-gateway or host.docker.internal.
            // Platform-specific: Linux uses host-gateway; macOS/Windows use host.docker.internal.
            #[cfg(target_os = "linux")]
            return Ok(format!("http://host-gateway:{}", config.mcp_port));
            #[cfg(not(target_os = "linux"))]
            return Ok(format!("http://host.docker.internal:{}", config.mcp_port));
        }
        Some(ExecutionEnv { kind: EnvKind::RemoteSsh, .. }) => {
            // Remote SSH: agents reach back to the server's external_addr.
            let external = config.external_addr.as_ref()
                .ok_or(EnvBuildError::MissingExternalAddr)?;
            Ok(format!("http://{}:{}", external, config.mcp_port))
        }
    }
}
```

The `DEVS_MCP_ADDR` variable is injected into every orchestrated agent's environment immediately before subprocess spawn. External observing agents that run independently are never granted `DEVS_MCP_ADDR` through `devs-executor`; if they set it manually themselves, that does not change their treatment by the MCP server (which performs no enforcement at MVP).

#### 2.2.2 Agent Role Business Rules

**[SEC-017-BR-001]** `DEVS_MCP_ADDR` MUST be injected into every orchestrated agent subprocess environment by `devs-executor`, regardless of adapter type (claude, gemini, opencode, qwen, copilot) and regardless of stage-level configuration. No workflow definition field can suppress this injection.

**[SEC-017-BR-002]** The value injected for `DEVS_MCP_ADDR` MUST be a valid HTTP URL in the format `http://<host>:<port>`. The host component depends on the execution environment: loopback for local, `host-gateway` or `host.docker.internal` for Docker, and `server.external_addr` for SSH remote stages. If `server.external_addr` is required but not configured, the stage MUST fail before subprocess spawn with `"invalid_argument: server.external_addr required for remote SSH execution but not configured"`.

**[SEC-017-BR-003]** The three restricted server-internal variables (`DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`) MUST be stripped from the agent environment even if the server process inherited them from its own parent environment. Stripping occurs as the final step, after all env overrides are applied, so stage-level overrides cannot reintroduce them.

**[SEC-017-BR-004]** Stage and workflow `env` definitions MUST NOT declare `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`, or `DEVS_MCP_ADDR`. Attempting to define any of these keys in a `env` block MUST be rejected at workflow validation with `"invalid_argument: env key '<KEY>' is reserved and may not be set in workflow definitions"`.

**[SEC-018-BR-001]** At MVP, the MCP server processes all 17 tool calls identically regardless of which process invokes them. No `ConnectionContext` attribute is checked against a tool allowlist. This is a documented known limitation contingent on network-perimeter isolation.

**[SEC-018-BR-002]** The `report_progress`, `signal_completion`, and `report_rate_limit` tools require a `stage_run_id` parameter matching an active `StageRun`. While this is not an authentication mechanism, it functions as implicit scoping: an agent can only signal completion for a stage whose `stage_run_id` it obtained from `.devs_context.json`, which is written exclusively by `devs-executor`.

**[SEC-018-BR-003]** `stage_run_id` is a UUID4 generated by `devs` at stage dispatch time. It is included in `.devs_context.json` and in audit log events and is visible via `get_run`. It is not treated as a secret, but it is not publicly guessable for a newly dispatched stage.

#### 2.2.3 Agent Role Separation Edge Cases

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-006 | Orchestrated agent (subprocess) calls `submit_run` via the MCP | At MVP: call succeeds if all inputs are valid (no tool-level enforcement). This is a documented limitation. Post-MVP: rejected with `"permission_denied: tool not available to orchestrated agents"`. |
| EC-SEC-007 | Observing agent manually sets `DEVS_MCP_ADDR` in its own environment | The variable being present in the external agent's environment has no effect on the MCP server. The MCP server does not read the caller's environment; it only processes the JSON-RPC request body. |
| EC-SEC-008 | Two concurrent `signal_completion` calls for the same `stage_run_id` | Serialized by per-run `Mutex` (**[MCP-BR-043]**). Exactly one state transition occurs; the second call receives `{"result":null,"error":"failed_precondition: signal_completion already called for this stage"}`. |
| EC-SEC-009 | `signal_completion` called with a `stage_run_id` for a stage already in a terminal state | Returns `{"result":null,"error":"failed_precondition: stage is already in terminal state <status>"}`. No state change. (**[MCP-075]**) |
| EC-SEC-010 | Orchestrated agent calls `cancel_run` for its own parent run | At MVP: call succeeds if state machine preconditions are met. An agent self-terminating its own run is an accepted behavior; agents are trusted entities under the Glass-Box model. |
| EC-SEC-011 | Stage `env` block contains `DEVS_MCP_ADDR = "http://evil.com"` | Validation MUST reject with `"invalid_argument: env key 'DEVS_MCP_ADDR' is reserved and may not be set in workflow definitions"`. |
| EC-SEC-012 | SSH remote stage with no `server.external_addr` configured | Stage fails before subprocess spawn with `"invalid_argument: server.external_addr required for remote SSH execution but not configured"`; stage status → `Failed`; no subprocess spawned. |

---

### 2.3 Filesystem MCP Access Control

**[SEC-019]** The Filesystem MCP server enforces path-based access control independently of the `devs` Glass-Box MCP. All filesystem operations are subject to this policy before any OS-level filesystem call is made.

| Path Pattern | Read | Write | Rationale |
|---|---|---|---|
| `target/` and all children | Allowed | **Denied** | Build artifacts; agent writes could corrupt incremental compilation |
| `.devs/runs/` and all children | Allowed | **Denied** | Checkpoint files; all writes go through `devs-checkpoint` only |
| `.devs/logs/` and all children | Allowed | **Denied** | Log files; written exclusively by `devs-executor` |
| `.devs/workflows/` and all children | Allowed | Allowed | Workflow definitions; agents update these |
| `.devs/prompts/` and all children | Allowed | Allowed | Prompt template files; agents update these |
| `.devs/agent-state/` and all children | Allowed | Allowed | Session state (`task_state.json`); agents maintain this |
| `crates/*/src/` and all children | Allowed | Allowed | Source code; agents implement features here |
| `tests/` and all children | Allowed | Allowed | Test files; agents write tests here |
| `proto/` and all children | Allowed | Allowed | Protobuf definitions; agents update schema |
| Any path resolving outside workspace root | **Denied** | **Denied** | Absolute boundary; path traversal prevention |

**[SEC-020]** Path canonicalization (resolving symlinks and `..` segments to their final filesystem targets) MUST occur before access control evaluation, not after. Path traversal attempts — including paths containing `..` components, null bytes, or symlinks that escape the workspace root — MUST be rejected with a `permission_denied:` error prefix before any OS filesystem call is attempted.

#### 2.3.1 Workspace Root Definition

The workspace root is the absolute directory path passed to the Filesystem MCP server at startup via its configuration. For the `devs` self-development use case this is the root of the `devs` source repository. The workspace root MUST satisfy all of the following invariants:

- **Absolute path**: relative workspace roots are rejected at Filesystem MCP startup with a fatal error.
- **Canonicalized at startup**: the workspace root is resolved via `std::fs::canonicalize()` once at process startup and cached. All subsequent path checks use the cached canonical root.
- **Immutable during session**: the workspace root MUST NOT change while the Filesystem MCP server is running. Server restart is required to change the workspace root.
- **Exclusive boundary**: no path outside the canonical workspace root is accessible regardless of operation, permission, or content.

The Filesystem MCP server does NOT use the current working directory, `$HOME`, or any runtime-provided value as the workspace root. It is fixed at server startup from the configuration.

#### 2.3.2 Path Canonicalization Algorithm

All paths received by Filesystem MCP tools MUST be processed through the following canonicalization and validation sequence before any filesystem operation:

```rust
/// Canonical path validation for Filesystem MCP access control.
/// Returns the canonical absolute path if allowed, or a structured error.
///
/// [SEC-020-BR-001]: uses std::fs::canonicalize(); no manual string manipulation.
/// [SEC-020-BR-002]: uses Path::starts_with(); no string prefix matching.
pub fn validate_path(
    workspace_root: &Path,   // pre-canonicalized at startup, cached
    requested_path: &str,
    operation: FsOperation,
) -> Result<PathBuf, FsAccessError> {
    // Step 1: Reject null bytes before any OS call.
    if requested_path.contains('\0') {
        return Err(FsAccessError::InvalidArgument(
            "path contains null byte".into(),
        ));
    }

    // Step 2: Build a candidate path.
    //   - Absolute paths: use as-is.
    //   - Relative paths: join to workspace root.
    let candidate = if Path::new(requested_path).is_absolute() {
        PathBuf::from(requested_path)
    } else {
        workspace_root.join(requested_path)
    };

    // Step 3: Canonicalize — resolves symlinks, '..', '.', and double slashes.
    // For writes to new files, canonicalize only the parent directory.
    let canonical = match std::fs::canonicalize(&candidate) {
        Ok(p) => p,
        Err(e) if e.kind() == std::io::ErrorKind::NotFound => {
            // New file: canonicalize its parent directory, then re-attach filename.
            let parent = candidate
                .parent()
                .ok_or_else(|| FsAccessError::InvalidArgument("path has no parent".into()))?;
            let canonical_parent = std::fs::canonicalize(parent)
                .map_err(|_| FsAccessError::NotFound("parent directory not found".into()))?;
            let filename = candidate
                .file_name()
                .ok_or_else(|| FsAccessError::InvalidArgument("path has no filename".into()))?;
            canonical_parent.join(filename)
        }
        Err(e) => return Err(FsAccessError::Io(e.to_string())),
    };

    // Step 4: Workspace boundary check using Path::starts_with (not string prefix).
    if !canonical.starts_with(workspace_root) {
        return Err(FsAccessError::PermissionDenied(
            "path traversal detected: path resolves outside workspace root".into(),
        ));
    }

    // Step 5: Policy evaluation against the relative sub-path.
    let relative = canonical
        .strip_prefix(workspace_root)
        .expect("guaranteed by starts_with check above");
    check_access_policy(relative, operation)?;

    Ok(canonical)
}

fn check_access_policy(relative: &Path, op: FsOperation) -> Result<(), FsAccessError> {
    // Use forward-slash string form for policy matching (platform-normalized).
    let path_str = relative.to_string_lossy().replace('\\', "/");

    if matches!(op, FsOperation::Write) {
        const WRITE_DENIED_PREFIXES: &[&str] = &[
            "target/",
            ".devs/runs/",
            ".devs/logs/",
        ];
        for prefix in WRITE_DENIED_PREFIXES {
            if path_str.starts_with(prefix) || path_str == prefix.trim_end_matches('/') {
                return Err(FsAccessError::PermissionDenied(
                    format!("writes to {} are not permitted", prefix),
                ));
            }
        }
    }

    Ok(()) // All other paths allowed for read and write.
}
```

**[SEC-020-BR-001]** Canonicalization MUST use `std::fs::canonicalize()` (which calls `realpath(2)` on Unix or `GetFinalPathNameByHandleW` on Windows). Manual string manipulation of `..` segments is PROHIBITED. String-level traversal detection is insufficient because symlinks can route around string-based checks.

**[SEC-020-BR-002]** The workspace boundary check MUST use `Path::starts_with()` on `PathBuf` objects, not string prefix matching. String prefix matching is insufficient: `workspace/foo-bar` would incorrectly match a policy pattern for `workspace/foo` under naive string comparison.

**[SEC-020-BR-003]** On Windows, path separators are normalized: both `\` and `/` are accepted as input and normalized to forward-slash for policy evaluation. Drive letter prefixes (e.g., `C:\`) are preserved during canonicalization. The workspace boundary check uses case-insensitive comparison on Windows because NTFS is case-insensitive by default.

**[SEC-020-BR-004]** Glob patterns used in `search_files` MUST be evaluated within the workspace boundary. The glob expansion engine MUST NOT follow symlinks that would resolve outside the workspace root. Any glob match that — after resolution — falls outside the workspace root is silently excluded from results (not an error).

**[SEC-020-BR-005]** The regex engine used in `search_content` MUST be the `regex` crate (or an equivalent with guaranteed linear-time complexity). Backtracking regex engines that allow catastrophic backtracking (e.g., `"(?s).{10000000}"`) are PROHIBITED. A per-query timeout of 5 seconds MUST be enforced regardless of the engine's complexity guarantees.

#### 2.3.3 Filesystem MCP Access Control — Edge Cases

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-037 | `read_file` with path `../../etc/passwd` | After `canonicalize()`, resolves outside workspace root; rejected with `permission_denied: path traversal detected: path resolves outside workspace root` |
| EC-SEC-038 | `read_file` with a symlink inside workspace pointing to `/etc/passwd` | After `canonicalize()`, resolves to `/etc/passwd`; outside workspace root; rejected with `permission_denied: path traversal detected` |
| EC-SEC-039 | `write_file` to `.devs/runs/abc/checkpoint.json` | Path matches write-denied prefix `.devs/runs/`; rejected with `permission_denied: writes to .devs/runs/ are not permitted` |
| EC-SEC-040 | `search_files` glob pattern `../../../*` | Glob expanded relative to workspace root; any matches resolving outside workspace root silently excluded; result is empty set, not an error |
| EC-SEC-041 | Path with null byte `foo\x00bar` | Null byte detected in Step 1 before any OS call; rejected with `invalid_argument: path contains null byte` |
| EC-SEC-056 | `create_directory` at `target/new-subdir` | Parent `target/` matches write-denied prefix; rejected with `permission_denied: writes to target/ are not permitted` |
| EC-SEC-057 | `move_file` from `crates/src/main.rs` to `.devs/runs/foo/main.rs` | Destination path checked first; matches write-denied prefix; rejected. Source file is not moved. |
| EC-SEC-058 | Workspace root itself is configured as a symlink path | Resolved to canonical real path at Filesystem MCP startup via `canonicalize()`; all subsequent checks use the real path |
| EC-SEC-059 | `search_content` with regex `(?s).{10000000}` (catastrophic backtracking) | `regex` crate provides linear-time guarantees; query executes without catastrophic backtracking; 5-second timeout enforced regardless |

---

### 2.4 Webhook Signing

**[SEC-021]** Outbound webhooks carrying a configured `secret` MUST be signed using HMAC-SHA256. The signature is computed over the raw request body bytes (UTF-8 encoded JSON payload) using the secret as the key. The signature header format is:

```
X-Devs-Signature-256: sha256=<lowercase hex digest>
```

Webhook receivers MUST validate this signature by computing `HMAC-SHA256(secret, body)` and performing a constant-time comparison (using `subtle::ConstantTimeEq` or equivalent) against the received value. `devs` does not validate receiver responses for correctness of signature handling — this is the receiver's responsibility.

The HMAC computation in Rust:

```rust
use hmac::{Hmac, Mac};
use sha2::Sha256;

/// Sign a webhook payload body. Key is the raw UTF-8 bytes of the configured secret.
/// [SEC-021-BR-001]: No KDF applied; secret used directly as HMAC key.
/// [SEC-021-BR-002]: Signature computed over the exact bytes sent as the HTTP body.
fn sign_webhook_payload(secret: &[u8], body: &[u8]) -> String {
    let mut mac = Hmac::<Sha256>::new_from_slice(secret)
        .expect("HMAC key length validated at config time (≥32 bytes)");
    mac.update(body);
    let result = mac.finalize().into_bytes();
    format!("sha256={}", hex::encode(result))
}

/// Reference verification implementation for receivers.
/// [SEC-021-BR-004]: Constant-time comparison is mandatory.
fn verify_webhook_signature(secret: &[u8], body: &[u8], received_header: &str) -> bool {
    let expected = sign_webhook_payload(secret, body);
    // subtle::ConstantTimeEq prevents timing oracle attacks.
    use subtle::ConstantTimeEq;
    expected.as_bytes().ct_eq(received_header.as_bytes()).into()
}
```

#### 2.4.1 Webhook Signing Business Rules

**[SEC-021-BR-001]** The HMAC key is the raw UTF-8 bytes of the `secret` string. No key derivation function (KDF) is applied. The `secret` MUST be at least 32 bytes to provide adequate entropy (**[SEC-054]**).

**[SEC-021-BR-002]** The signature is computed over the **exact bytes** that will be sent in the HTTP body. If the payload is truncated to 64 KiB before delivery, the signature is computed over the truncated bytes, not the original full payload.

**[SEC-021-BR-003]** The `X-Devs-Signature-256` header MUST be present in every POST request when a `secret` is configured. It MUST be absent entirely when no `secret` is configured. Receivers MUST NOT receive an empty or zero-value signature header.

**[SEC-021-BR-004]** The comparison at the receiver side MUST be constant-time. Variable-time comparisons (e.g., `==` on `String`, early-exit byte comparisons) MUST NOT be used for signature validation because they enable timing-oracle attacks that allow an attacker to forge valid signatures incrementally.

**[SEC-021-BR-005]** The `secret` value MUST NOT appear in any log entry, audit event, checkpoint file, webhook payload, or error message. Only the boolean outcome of HMAC computation (the resulting hex digest) is ever emitted externally.

#### 2.4.2 Webhook Signing Edge Cases

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-042 | `secret` is empty string | Rejected at project registration: `"invalid_argument: webhook secret must be at least 32 bytes"` |
| EC-SEC-043 | `secret` is exactly 31 bytes | Rejected: 32-byte minimum enforced at project add/update validation |
| EC-SEC-044 | Webhook payload truncated to 64 KiB (`"truncated": true`) | Signature computed over the truncated bytes; receiver must validate against the same truncated body |
| EC-SEC-045 | No `secret` configured on webhook target | `X-Devs-Signature-256` header omitted entirely; no signature computed or sent |
| EC-SEC-060 | `secret` string contains non-UTF-8 bytes | `devs.toml` is UTF-8 only; non-UTF-8 content is a TOML parse error before config validation; rejected with TOML parse error |
| EC-SEC-061 | Two webhook targets on the same project have different secrets | Each target uses its own `secret`; HMAC computed independently per delivery; no cross-contamination |
| EC-SEC-062 | Webhook delivery retried after initial failure (same payload) | Signature is deterministic: same body bytes + same secret = same digest; each retry produces an identical `X-Devs-Signature-256` header |

---

### 2.5 Post-MVP Authentication Pathway

**[SEC-022]** The following authentication architecture is reserved for post-MVP implementation. The MVP codebase is designed to be forward-compatible with these additions: no service handler signatures change, no wire format changes are required, and the additions are isolated to interceptor/middleware layers.

- **gRPC mTLS**: Add a TLS interceptor to the `tonic` server builder; client certificates are issued per operator. All existing `tonic` service handler implementations remain unchanged because authentication is enforced in the interceptor before the handler is called.
- **Bearer token auth**: Add a `tonic` layer that validates `Authorization: Bearer <token>` metadata on every RPC. Tokens are opaque UUID4 values with short TTLs (max 24 hours) stored in server memory. The token store is lost on restart in the initial post-MVP implementation.
- **MCP HTTP auth**: Add an `Authorization: Bearer <token>` header requirement to the HTTP handler for `/mcp/v1/call`. The same token pool is shared between gRPC and MCP to allow a single token to authorize both interfaces.

#### 2.5.1 Forward-Compatibility Design Decisions

The following MVP design decisions directly enable post-MVP auth to be added without breaking changes:

**[SEC-022-BR-001]** All gRPC service handler methods receive a `tonic::Request<T>` which carries request metadata. A future auth interceptor can examine `request.metadata().get("authorization")` without modifying handler signatures. No handler inspects the `authorization` metadata field at MVP.

**[SEC-022-BR-002]** The `ConnectionContext` struct (§2.1.1) includes the `authenticated_as: Option<String>` field, which is always `None` at MVP but emitted as `null` in audit log entries. Post-MVP authentication layers populate this field; all existing log consumers treat `null` as anonymous access.

**[SEC-022-BR-003]** The MCP HTTP handler is implemented as a composable `tower::Service`. A post-MVP auth middleware can wrap the service at the server builder level without modifying any MCP tool dispatch logic.

**[SEC-022-BR-004]** No auth-related configuration keys are valid in `devs.toml` at MVP. If an `[auth]` section appears in `devs.toml`, startup MUST fail before port binding with `"invalid_argument: [auth] section is not supported at MVP; remove it from devs.toml"`.

#### 2.5.2 Post-MVP Token Schema (Reserved, Not Implemented at MVP)

The following schema is defined to ensure the MVP data model is forward-compatible. No code implementing this schema is shipped in the MVP binary:

```json
{
  "token_id": "<UUID4>",
  "issued_at": "<RFC3339 with ms precision>",
  "expires_at": "<RFC3339 with ms precision>",
  "scopes": ["read", "write", "admin"],
  "bound_to_ip": "<IPv4 or IPv6, or null for any IP>",
  "revoked": false
}
```

**Scope semantics (post-MVP):**

| Scope | Permitted tools |
|---|---|
| `read` | Observation tools: `list_runs`, `get_run`, `get_stage_output`, `stream_logs`, `get_pool_state`, `get_workflow_definition`, `list_checkpoints` |
| `write` | All 17 MCP tools including control and testing tools |
| `admin` | All `write` tools plus `ProjectService` gRPC RPCs (add/remove projects) |

Token TTL: 24 hours maximum. The token store is in-process memory; tokens do not survive server restart in the initial post-MVP implementation. Persistent token storage is a further post-MVP iteration.

---

### 2.6 Security Startup Sequence

The server performs a security check sequence as part of the standard startup flow. Security checks are non-fatal (they emit `WARN` logs and increment a misconfiguration counter) but block port binding if critical failures are detected.

```mermaid
stateDiagram-v2
    [*] --> ParseConfig : ./devs-server starts

    ParseConfig --> ConfigError : invalid devs.toml (all errors collected)
    ConfigError --> [*] : exit 1, errors to stderr (no ports bound)

    ParseConfig --> SecurityChecks : config valid

    SecurityChecks --> CheckBindAddr : begin checks
    CheckBindAddr --> WarnNonLoopback : listen addr not 127.x.x.x
    CheckBindAddr --> CheckCredentials : listen == 127.0.0.1
    WarnNonLoopback --> CheckCredentials : WARN logged (SEC-BIND-ADDR)

    CheckCredentials --> WarnTomlCredentials : *_API_KEY or *_TOKEN in devs.toml
    CheckCredentials --> CheckFilePerms : no TOML credentials
    WarnTomlCredentials --> CheckFilePerms : WARN logged (SEC-TOML-CRED)

    CheckFilePerms --> WarnWorldReadable : devs.toml is world-readable (o+r)
    CheckFilePerms --> CheckWebhooks : file perms OK
    WarnWorldReadable --> CheckWebhooks : WARN logged (SEC-FILE-PERM-TOML)

    CheckWebhooks --> WarnHttpWebhook : any webhook URL uses http://
    CheckWebhooks --> CheckSSH : all webhooks use https://
    WarnHttpWebhook --> CheckSSH : WARN logged (SEC-WEBHOOK-TLS)

    CheckSSH --> WarnStrictHostKey : StrictHostKeyChecking=no in ssh_config
    CheckSSH --> BindPorts : SSH config OK
    WarnStrictHostKey --> BindPorts : WARN logged (SEC-SSH-HOST-KEY)

    BindPorts --> BindGRPC
    BindGRPC --> BindMCP : gRPC port available
    BindGRPC --> [*] : EADDRINUSE → exit 1
    BindMCP --> InitPool : MCP port available
    BindMCP --> ReleaseGRPC : EADDRINUSE
    ReleaseGRPC --> [*] : exit 1 (gRPC port released first)

    InitPool --> WriteDiscovery : pool initialized
    WriteDiscovery --> AcceptConnections : discovery file written atomically (mode 0600)
    AcceptConnections --> [*] : server running; SIGTERM begins shutdown
```

---

### 2.8 Section 2 Acceptance Criteria

- **[AC-SEC-2-003]** A `write_file` request to the Filesystem MCP targeting `.devs/runs/<uuid>/checkpoint.json` returns HTTP 200 with `{"result": null, "error": "permission_denied: writes to .devs/runs/ are not permitted"}`.
- **[AC-SEC-2-004]** A webhook with a `secret` of 31 bytes is rejected at `devs project add` with exit code 4 and error message containing `"webhook secret must be at least 32 bytes"`.
- **[AC-SEC-2-005]** Server startup with `server.listen = "0.0.0.0:7890"` logs a `WARN` entry containing `event_type: "security.misconfiguration"` and `check_id: "SEC-BIND-ADDR"`.
- **[AC-SEC-2-007]** `DEVS_MCP_ADDR` is present in the environment of every agent subprocess spawned by `devs-executor`, regardless of adapter type (verified for claude, gemini, opencode, qwen, and copilot adapters individually).
- **[AC-SEC-2-008]** `DEVS_LISTEN`, `DEVS_MCP_PORT`, and `DEVS_DISCOVERY_FILE` are absent from the environment of every agent subprocess even when all three variables are set in the server process environment before startup.
- **[AC-SEC-2-009]** A Filesystem MCP `read_file` request with path `../../etc/passwd` returns HTTP 200 with `{"result": null, "error": "permission_denied: path traversal detected: path resolves outside workspace root"}`.
- **[AC-SEC-2-010]** A Filesystem MCP `read_file` request with a path containing a null byte returns HTTP 200 with `{"result": null, "error": "invalid_argument: path contains null byte"}`.
- **[AC-SEC-2-011]** A symlink inside the workspace that resolves to a path outside the workspace root is rejected by Filesystem MCP `read_file` with `"permission_denied: path traversal detected"` (rejection occurs after `canonicalize()`, not on the raw path string).
- **[AC-SEC-2-012]** A webhook HTTP POST includes `X-Devs-Signature-256: sha256=<hex>` when `secret` is configured; the header is completely absent when no `secret` is configured on the webhook target.
- **[AC-SEC-2-013]** The HMAC signature on a webhook delivery is computed over the exact bytes of the HTTP request body; a test receiver computing `HMAC-SHA256(secret, body)` over those same bytes produces an identical digest, confirming correct signing.
- **[AC-SEC-2-015]** Two concurrent `signal_completion` calls for the same `stage_run_id` result in exactly one successful state transition; the second caller receives `{"result": null, "error": "failed_precondition: signal_completion already called for this stage"}`.
- **[AC-SEC-2-016]** A stage definition with `env = { DEVS_LISTEN = "127.0.0.1:9999" }` is rejected at workflow validation with `"invalid_argument: env key 'DEVS_LISTEN' is reserved and may not be set in workflow definitions"`.
- **[AC-SEC-2-017]** A stage definition with `env = { DEVS_MCP_ADDR = "http://evil.com" }` is rejected at workflow validation with `"invalid_argument: env key 'DEVS_MCP_ADDR' is reserved and may not be set in workflow definitions"`.
- **[AC-SEC-2-018]** Server startup with an `[auth]` section present in `devs.toml` fails before port binding with `"invalid_argument: [auth] section is not supported at MVP; remove it from devs.toml"`.
- **[AC-SEC-2-020]** Every accepted TCP connection on the gRPC and MCP ports produces a `ConnectionContext` record; the `connection_id` (UUID4) appears in both the connection-open and connection-close audit log entries, enabling log correlation.
- **[AC-SEC-2-021]** Server configured with `server.listen` port equal to `mcp_port` (both set to 7890) fails at config validation before any port binding with `"invalid_argument: server.listen and server.mcp_port must be different"`.
- **[AC-SEC-2-023]** A remote SSH stage with no `server.external_addr` configured fails before subprocess spawn with `"invalid_argument: server.external_addr required for remote SSH execution but not configured"`; the stage transitions to `Failed` without spawning any process.
- **[AC-SEC-2-024]** A `devs-mcp-bridge` process that loses its HTTP connection to the MCP server writes `{"result":null,"error":"internal: server connection lost","fatal":true}` to stdout and exits with code 1 without hanging.

---

## 3. Data at Rest & Data in Transit Encryption

### 3.1 Data Classification

This section classifies every persistent and in-flight data artifact produced or consumed by `devs`, specifies its sensitivity level, and maps it to applicable storage and transit security controls. The file permission model is the primary at-rest control for all non-credential data; OS-level full-disk encryption (FDE) is the recommended additional control for High-sensitivity data on shared or cloud-hosted machines.

#### 3.1.1 Data Classification Table

| Data Class | Examples | Sensitivity | Storage Path | Lifecycle | At-Rest Control | Transit Control |
|---|---|---|---|---|---|---|
| **Agent API Keys** | `CLAUDE_API_KEY`, `GEMINI_API_KEY` | Critical | Process environment only | Server process lifetime | OS env (never to disk) | Inherited by agents only if required; stripped otherwise |
| **Webhook Secrets** | `WebhookTarget.secret` (HMAC key) | Critical | `projects.toml` (optional) | Project lifetime | File mode `0600`; `Redacted<String>` in memory | HMAC-SHA256 signature header; never in payload |
| **TLS Private Keys** | `server.key` | Critical | Operator-managed path | Server startup only | Mode `0600`; `Redacted<PathBuf>` in config; zeroed after loading | Never transmitted |
| **Stage Prompts** | `.devs_prompt_<uuid>` | High | Stage working directory | Deleted immediately after agent exits | Mode `0600`; isolated dir | Not transmitted; local subprocess only |
| **Stage Outputs** | `stdout.log`, `stderr.log`, `checkpoint.json` | High | `.devs/logs/<run-id>/…` | Retention policy (`max_age_days`, `max_size_mb`) | Not encrypted; log dir mode `0700`; file mode `0600`; OS FDE recommended | gRPC TLS (streaming) |
| **Checkpoint State** | `checkpoint.json`, `workflow_snapshot.json` | High | `.devs/runs/<run-id>/…` | Retention policy | Not encrypted; file mode `0600`; OS FDE recommended | `git2` push (SSH/HTTPS) to checkpoint branch |
| **Context Files** | `.devs_context.json` | High | Stage working directory | Deleted with working dir post-stage | Mode `0600` | Not transmitted directly |
| **Structured Output** | `.devs_output.json` | High | Stage working directory | Deleted with working dir post-stage | Mode `0600` | Not transmitted directly |
| **Workflow Definitions** | `.devs/workflows/*.toml`, `write_workflow_definition` payload | High | Project repo; in-memory | Workflow lifetime | File mode `0644`; not secret but may contain logic | gRPC TLS; MCP HTTP (TLS for non-loopback) |
| **Audit Logs** | `tracing` JSON output | Medium | Operator-configured destination | Operator-managed | Not encrypted by `devs`; operator manages | Not transmitted by `devs` |
| **Server Configuration** | `devs.toml` (non-credential fields) | Medium | `devs.toml` path | Server lifetime | File permission check at startup (WARN if `o+r`) | Not transmitted |
| **Project Registry** | `~/.config/devs/projects.toml` | Medium | `~/.config/devs/projects.toml` | Project registration lifetime | File mode `0600` (written atomically) | Not transmitted |
| **Task State** | `.devs/agent-state/<session-id>/task_state.json` | Medium | Project `.devs/` directory | 30-day retention default | Not encrypted; agent-written | Not transmitted by `devs` |
| **Discovery File** | `~/.config/devs/server.addr` | Low | Well-known path | Server lifetime (created on bind, deleted on SIGTERM) | Mode `0600` | Not transmitted |
| **Run Slugs / Run IDs** | `workflow-name-20260311-a4b2` | Low | All storage layers | Retention policy | Not encrypted | In all API responses (gRPC, MCP) |

#### 3.1.2 Sensitive Data Flow Diagram

The following diagram shows how sensitive data flows between `devs` components. All flows crossing process boundaries are labeled with the applicable transport control.

```mermaid
flowchart TD
    subgraph OperatorEnv ["Operator Environment"]
        ENV["OS Environment Variables\n(API keys — Critical)"]
        TOML["devs.toml\n(config; optional creds)"]
        TLSKEY["TLS Private Key File\n(Critical)"]
    end
    subgraph ServerProc ["devs-server Process"]
        CONFIG["devs-config\n(in-memory; Redacted fields)"]
        SCHED["DAG Scheduler\n(SchedulerState)"]
        EXEC["Stage Executor"]
        PERSIST["devs-checkpoint\n(git2)"]
        GRPC["devs-grpc\n(tonic / TLS)"]
        MCP["devs-mcp\n(HTTP/JSON-RPC)"]
        WEBHOOK["Webhook Dispatcher\n(reqwest / TLS)"]
    end
    subgraph AgentProc ["Agent Subprocess"]
        AGENT["Agent CLI\n(claude/gemini/etc.)"]
        PROMPTFILE[".devs_prompt_uuid\n(mode 0600)"]
        CONTEXTFILE[".devs_context.json\n(mode 0600)"]
        OUTPUTFILE[".devs_output.json\n(mode 0600)"]
    end
    subgraph GitStorage ["Git Storage"]
        BARE["Bare Clone\n~/.config/devs/state-repos/"]
        BRANCH["devs/state branch\n(checkpoint.json, logs)"]
    end
    subgraph Clients ["Client Processes"]
        TUI["devs-tui"]
        CLI["devs-cli"]
        BRIDGE["devs-mcp-bridge\n(stdio → HTTP)"]
    end

    ENV -->|"inherited at server spawn"| CONFIG
    TOML -->|"parsed + zeroized"| CONFIG
    TLSKEY -->|"read once; zeroed after load"| GRPC
    CONFIG --> SCHED
    SCHED --> EXEC
    EXEC -->|"spawn with env"| AGENT
    EXEC -->|"write mode 0600"| PROMPTFILE
    EXEC -->|"write mode 0600"| CONTEXTFILE
    AGENT -->|"write mode 0600"| OUTPUTFILE
    AGENT -->|"stdout/stderr"| EXEC
    EXEC --> PERSIST
    PERSIST -->|"git commit + push\n(SSH / HTTPS)"| BARE
    BARE --> BRANCH
    SCHED --> GRPC
    SCHED --> MCP
    SCHED --> WEBHOOK
    GRPC -->|"gRPC / TLS 1.2+"| TUI
    GRPC -->|"gRPC / TLS 1.2+"| CLI
    MCP -->|"HTTP/1.1\n(loopback: plaintext OK;\nnon-loopback: HTTPS)"| BRIDGE
    BRIDGE -->|"stdio JSON-RPC"| ExtAgent["External AI Agent"]
    WEBHOOK -->|"HTTPS / TLS 1.2+\n(SSRF-mitigated)"| WebhookRcvr["Webhook Receiver"]
```

#### 3.1.3 Data Lifecycle Business Rules

**[SEC-DAT-001]** Every file written by `devs` to a stage working directory MUST be created before the agent subprocess is spawned and cleaned up after the subprocess exits, regardless of exit code.

**[SEC-DAT-002]** Sensitive in-memory values (API keys loaded from TOML, TLS private key bytes) MUST NOT be copied into any string that is logged via `tracing` at any level, serialized into a checkpoint file, or transmitted in any gRPC or MCP response.

**[SEC-DAT-003]** The `Redacted<T>` wrapper type (defined in `devs-core/src/redacted.rs`) MUST be used for all fields in config structs that hold credential values, ensuring they are `Debug`-printed as `[REDACTED]` and serialized to JSON as the literal string `"[REDACTED]"`. The actual value is accessible only through the `.expose()` method.

```rust
/// Wraps a sensitive value to prevent accidental logging or serialization.
pub struct Redacted<T>(T);

impl<T> Redacted<T> {
    pub fn new(value: T) -> Self { Self(value) }
    /// Exposes the inner value. Call only when the value must be used.
    #[must_use]
    pub fn expose(&self) -> &T { &self.0 }
}

impl<T> std::fmt::Debug for Redacted<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "[REDACTED]")
    }
}

impl<T> serde::Serialize for Redacted<T> {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str("[REDACTED]")
    }
}
```

### 3.2 Data at Rest

#### 3.2.1 Credential Storage

**[SEC-023]** API keys and tokens MUST be supplied to the server via OS environment variables. This is the **mandatory preferred mechanism**. Environment variables are not persisted to disk by the Rust process and are not inherited by child processes beyond what is explicitly configured.

**[SEC-024]** When credentials are stored in `devs.toml` (fallback mechanism), the following controls apply:

- The server MUST log a `WARN`-level message at startup for every key matching the pattern `*_API_KEY` or `*_TOKEN` found in `devs.toml`: `"SECURITY WARNING: Credential '<key>' found in devs.toml. Use environment variables instead."`.
- `devs.toml` file permissions MUST be checked at startup. If the file is world-readable (`o+r`) on Unix systems, a `WARN`-level message MUST be logged: `"SECURITY WARNING: devs.toml is world-readable (mode %o). Restrict with chmod 600."`.
- `devs.toml` MUST NOT be committed to project source control. The `.gitignore` template provided by `devs project add` MUST include `devs.toml`.

**[SEC-025]** Credentials MUST NEVER appear in:
- `tracing` log output at any level
- Checkpoint files (`.devs/runs/*/checkpoint.json`)
- Stage context files (`.devs_context.json`)
- Template variable resolution (credential env vars are stripped from agent env, not injected into templates)
- Webhook payloads

**[SEC-026]** The environment variable inheritance chain for agent subprocesses is: server env → workflow default_env → stage env (later overrides earlier). The following variables are explicitly **stripped** from the agent environment before subprocess spawn, regardless of the inheritance chain: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE`. Credential variables (`*_API_KEY`, `*_TOKEN`) are inherited by agents unless explicitly overridden — this is intentional, as agents require their own API keys.

**Credential Storage — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-046 | `CLAUDE_API_KEY` env var value contains newlines | Passed as-is to the subprocess env; `EnvKey` validation applies to key names only, not values |
| EC-SEC-047 | Stage `env` overrides `CLAUDE_API_KEY` with a different value | The stage-level value takes effect for that stage's subprocess; server-level value unchanged |
| EC-SEC-048 | Both env var and `devs.toml` `CLAUDE_API_KEY` are set | Env var takes precedence per config override order (env var > TOML); TOML value is ignored |
| EC-SEC-049 | Agent subprocess `exec`s a shell with `printenv` | The spawned shell inherits the agent's env including any inherited API keys; this is an accepted agent-level risk documented in the operator guide |
| EC-SEC-049a | `devs.toml` has a credential entry but the file is deleted after server start | Server holds the credential in memory as `Redacted<String>`; restarting without the file causes config validation failure if the entry is required |
| EC-SEC-049b | Stage `env` map contains a key matching `*_API_KEY` | Key is passed through; `WARN` logged: `"Stage env contains credential-like key '<key>'"` |

**[SEC-DAT-004]** The `Redacted<T>` type MUST implement `serde::Serialize` to emit the literal string `"[REDACTED]"` when serialized to JSON or TOML. It MUST implement `std::fmt::Debug` to emit `[REDACTED]` in debug output. The actual value is accessible only through the `.expose()` method, which is `#[must_use]`. This is defined in `devs-core/src/redacted.rs`.

**[SEC-DAT-005]** At startup, after loading `devs.toml`, the server MUST zeroize all TOML-sourced credential strings from the intermediate parsed TOML representation before the buffer goes out of scope. This is achieved by using the `zeroize` crate's `Zeroizing<String>` wrapper on the raw string buffer after extraction into `Redacted<String>` fields.

#### 3.2.2 Git Checkpoint Store

**[SEC-027]** The git checkpoint store at `~/.config/devs/state-repos/<project-id>.git` (bare clone) and project `.devs/` directory are not encrypted at rest. Stage outputs (stdout/stderr) committed to the checkpoint branch may contain sensitive data printed by agent processes. Operators requiring encryption at rest MUST use full-disk encryption (e.g., LUKS, FileVault, BitLocker) at the OS level.

**[SEC-028]** The checkpoint branch (default: `devs/state`) SHOULD be a separate, dedicated branch isolated from the main project branch to reduce the risk of sensitive checkpoint data appearing in normal code review workflows. The `devs project add` command MUST default to `devs/state` and document this rationale.

**[SEC-029]** Prompt files written to disk for file-based agent adapters are stored at `<working_dir>/.devs_prompt_<uuid>`. These files MUST be:
- Created with mode `0600` (owner read/write only) on Unix systems
- Deleted immediately after the agent process exits, regardless of exit code
- Written to the stage's isolated working directory, not a shared system temp directory

**Git Checkpoint Store — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-050 | Checkpoint branch `devs/state` is checked out in the working tree | `devs-checkpoint` operates on a bare clone; the working tree state does not affect the bare repo operations |
| EC-SEC-051 | Disk becomes full during checkpoint git commit | `git2` commit fails; `ERROR` logged; no crash; operation retried on next state transition (**[2_TAS-BR-022]**) |
| EC-SEC-052 | Server shuts down while a checkpoint write is in-progress (tmp file exists) | On restart, `devs-checkpoint` detects orphaned `.tmp` files and deletes them before reading checkpoints |
| EC-SEC-053 | Prompt file cannot be deleted after agent exit (e.g., agent locked the file on Windows) | Error logged at `WARN`; execution continues; the file remains at mode `0600`; the working directory cleanup removes it when the entire directory is removed |
| EC-SEC-053a | `~/.config/devs/state-repos/` does not exist on first startup | Created automatically with mode `0700`; `git2::Repository::init_bare()` called for each project |
| EC-SEC-053b | Operator manually deletes a checkpoint commit from the `devs/state` branch | Next checkpoint write succeeds (push may fail if history diverged); server logs `WARN: checkpoint branch history diverged`; active run may become `Unrecoverable` if its `checkpoint.json` is deleted |

**[SEC-DAT-006]** The bare clone directory `~/.config/devs/state-repos/<project-id>.git` MUST be created with mode `0700` (owner only). The parent `~/.config/devs/` directory MUST be created with mode `0700` if it does not already exist.

**[SEC-DAT-007]** Git commit objects in the checkpoint branch contain stage stdout and stderr (up to 1 MiB each). If an agent prints a credential to stdout, it will appear in the checkpoint git history. The `devs project add` command MUST emit: `"NOTE: Stage stdout/stderr is committed to the git checkpoint branch. Avoid printing credentials in agent outputs."`.

**[SEC-DAT-008]** The `devs-checkpoint` crate MUST NOT expose the `git2::Repository` handle outside the crate. All interactions with the checkpoint store go through the `CheckpointStore` trait interface to prevent callers from bypassing security controls.

#### 3.2.3 Discovery File

**[SEC-030]** The server address discovery file at `~/.config/devs/server.addr` (or `DEVS_DISCOVERY_FILE`) contains the gRPC listen address in plaintext. This file MUST be created with mode `0600` on Unix systems and deleted on clean shutdown (`SIGTERM`) per **[2_TAS-REQ-002a]**.

**Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-054 | Discovery file from a previous crashed server exists at startup | Overwritten atomically with the new server's address; the old address is replaced |
| EC-SEC-055 | `DEVS_DISCOVERY_FILE` is a path in a world-writable directory | File is created at the specified path with mode `0600`; the parent directory permissions are not validated; operator responsibility |
| EC-SEC-056 | Server fails to delete discovery file on SIGTERM (e.g., permissions changed) | Error logged at `WARN`; server exits 0; stale file causes clients to get connection refused (exit code 3) |
| EC-SEC-056a | `DEVS_DISCOVERY_FILE` points to a symlink | The symlink target is written atomically (write-to-tmp → rename); symlink traversal is not followed for the rename operation to prevent TOCTOU; if the target path after symlink resolution already exists, it is overwritten |

**[SEC-DAT-009]** On Unix systems, the server MUST verify after writing the discovery file that the resulting file mode is `0600`. If the process `umask` causes a different mode, the server MUST call `fs::set_permissions()` explicitly. If `set_permissions` fails, the server MUST log `ERROR` and exit non-zero — a world-readable discovery file exposes the gRPC address to all local users.

**[SEC-DAT-010]** On Windows, the discovery file is written to `%APPDATA%\devs\server.addr`. Windows ACL-level restrictions are not programmatically enforced at MVP (the directory is user-owned by default). A `WARN` is logged at startup: `"Discovery file Windows ACL enforcement is not implemented; ensure %APPDATA%\\devs is not shared."`.

#### 3.2.4 Structured Output & Context Files

Agents produce two critical files in their working directories. These files can contain sensitive data derived from prior stages and MUST be treated with the same security controls as checkpoint files.

**[SEC-DAT-011]** The `.devs_context.json` file written by `devs-executor` before agent spawn MUST be created with mode `0600`. Its content includes `stdout` and `stderr` from all completed dependent stages (up to the 10 MiB total cap), which may contain sensitive information printed by prior agents.

**[SEC-DAT-012]** The `.devs_output.json` file written by the agent (in `structured_output` completion mode) is read by `devs-executor` after the agent exits. The executor MUST validate that the file size does not exceed **4 MiB** before reading. Files exceeding this limit are rejected; the stage transitions to `Failed` with `"structured_output: file exceeds 4 MiB limit"`.

**[SEC-DAT-013]** Neither `.devs_context.json` nor `.devs_output.json` are persisted to the checkpoint git store as raw files. They exist only in the stage's isolated working directory and are deleted during cleanup. The executor copies the parsed structured output value into the in-memory `StageOutput.structured` field and the git-committed `stages/<name>/attempt_<N>/structured_output.json` before deleting the working directory.

**Structured Output / Context File — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-069 | `.devs_context.json` write fails (disk full) | Stage transitions to `Failed` before agent spawn with `"context_file: write failed"` per **[2_TAS-REQ-023c]**; no cleanup needed as agent was never started |
| EC-SEC-070 | Agent writes `.devs_output.json` with content > 4 MiB | After agent exits, executor detects size > 4 MiB; stage → `Failed`; working dir cleaned up |
| EC-SEC-071 | Agent writes binary content (non-UTF-8) to `.devs_output.json` | Parsed as JSON bytes; invalid UTF-8 → JSON parse fails → `Failed`; stage `stderr` preserves raw bytes with U+FFFD substitution |
| EC-SEC-072 | Agent changes permissions on `.devs_context.json` after reading it | Stage execution proceeds normally; the executor holds an open file handle before spawning; cleanup deletes via the working directory path (executor has owner write access) |

#### 3.2.5 Agent Working Directory Security

Each stage execution runs in a fully isolated directory whose path incorporates both `run_id` and `stage_name` to prevent collision between concurrent stages.

**[SEC-DAT-014]** Working directory paths are:

- **Tempdir**: `<os-tempdir>/devs-<run-id>-<stage-name>/` — created with mode `0700`
- **Docker**: `/workspace/` inside the container — isolated by container filesystem namespace
- **Remote SSH**: `~/devs-runs/<run-id>-<stage-name>/` on the remote host

**[SEC-DAT-015]** The stage working directory MUST be deleted recursively after the stage completes, regardless of success or failure. If deletion fails (e.g., the agent left locked files on Windows), the failure MUST be logged at `WARN` and execution continues. The failed deletion does not affect the stage's `StageStatus`.

**[SEC-DAT-016]** For tempdir execution, the project repository is cloned into `<os-tempdir>/devs-<run-id>-<stage-name>/repo/` (a subdirectory of the working dir). Git clone credentials (SSH key or HTTPS token) MUST NOT be written to the working directory; they are passed via `git2` in-memory configuration only.

**[SEC-DAT-017]** The working directory MUST NOT be created inside the project's own repository tree. Creating the working directory within the repo would risk the agent committing working files as project changes. The executor MUST verify that the resolved absolute path of the working directory does not share a prefix with the project `repo_path`.

**Agent Working Directory — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-073 | Two parallel fan-out sub-agents attempt to create the same working directory path | Impossible by construction: `run_id` (UUID4) + `stage_name` + `fan_out_index` form the path; UUID4 collisions are negligible in practice |
| EC-SEC-074 | Agent writes outside its working directory (e.g., `/../../../etc/passwd`) | Not prevented by `devs` at MVP; the agent runs with the same OS user as the server; this accepted risk is documented in the threat model (§1.3) |
| EC-SEC-075 | `os-tempdir` is a network filesystem (NFS) with all-users write access | Directory is created with mode `0700` by the server process (owner: server user); NFS ACLs beyond this are the operator's responsibility |
| EC-SEC-076 | Working directory cleanup fails because the agent spawned a long-running background process | `WARN` logged with path; orphaned `devs-*` directories in the OS tempdir are candidates for operator cleanup; server logs them at startup via a scan |

#### 3.2.6 Log File Security

Stage stdout and stderr are persisted as raw log files and also committed to the git checkpoint branch.

**[SEC-DAT-018]** Log files written to `.devs/logs/<run-id>/<stage-name>/attempt_<N>/stdout.log` and `stderr.log` MUST be created with mode `0600`. Parent directories MUST be created with mode `0700`.

**[SEC-DAT-019]** Log files are written incrementally as the agent produces output (streaming write). If a single log line exceeds **32 KiB**, the line is truncated at 32 KiB and the truncation is appended as `[TRUNCATED]`. This prevents a pathological agent from consuming unbounded disk space with a single output line.

**[SEC-DAT-020]** Log retention is controlled by `retention.max_age_days` (default 30) and `retention.max_size_mb` (default 500). The retention sweep deletes entire run directories atomically; partial deletion within a run is not permitted.

**[SEC-DAT-021]** Log files MUST NOT be served via the gRPC `StreamLogs` or MCP `stream_logs` APIs with more than **1 MiB** of content per request. Clients requesting full logs for stages with > 1 MiB of output receive the most recent 1 MiB with `"truncated": true`. The full content remains on disk and in the git checkpoint.

**Log File Security — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-077 | Agent writes null bytes (`\0`) to stdout | Written as-is to the log file; when served via MCP/gRPC, null bytes are replaced with U+FFFD per serialization rules |
| EC-SEC-078 | Log directory has insufficient disk space before stage starts | Executor detects write failure on first chunk; stage transitions to `Failed`; working dir cleaned up; `ERROR` logged with `check_id: "DISK_FULL"` |
| EC-SEC-079 | Retention sweep runs while a log file is being written for an active stage | Active runs are never deleted by the sweep; the sweep checks `WorkflowRun.status` in-memory; only runs in terminal states with `completed_at` older than `max_age_days` are candidates |
| EC-SEC-080 | Log file is deleted by the operator while a gRPC `StreamLogs --follow` stream is active | The stream reads from the in-memory ring buffer (max 10,000 lines per stage); file deletion does not interrupt active streams; new content continues to buffer in memory |

#### 3.2.7 File Permission Model Reference

The following table is the authoritative reference for all files and directories created or managed by `devs`. Implementing agents MUST enforce these permissions on Unix systems; Windows notes are included where different.

| Path | Unix Mode | Created By | Deleted By | Notes |
|---|---|---|---|---|
| `~/.config/devs/` | `0700` | `devs-server` on first run | Never | Parent of all `devs` config |
| `~/.config/devs/server.addr` | `0600` | `devs-server` on bind | `devs-server` on SIGTERM | Overwritten atomically on startup |
| `~/.config/devs/projects.toml` | `0600` | `devs project add` | Entries removed by `devs project remove` | Written atomically (tmp→rename) |
| `~/.config/devs/state-repos/` | `0700` | `devs-server` on first run | Never | Parent of bare clones |
| `~/.config/devs/state-repos/<project-id>.git` | `0700` | `devs-checkpoint` | On project removal | Bare git clone |
| `devs.toml` | Checked at startup; `WARN` if `o+r` | Operator | Operator | Server refuses non-loopback if TLS absent |
| `<working-dir>/` | `0700` | `devs-executor` | `devs-executor` post-stage | Contains `repo/` subdirectory |
| `<working-dir>/.devs_prompt_<uuid>` | `0600` | `devs-adapters` | `devs-adapters` immediately after agent exits | File-based prompt adapters only |
| `<working-dir>/.devs_context.json` | `0600` | `devs-executor` pre-spawn | `devs-executor` with working dir | Contains prior stage outputs |
| `<working-dir>/.devs_output.json` | Written by agent | Agent process | `devs-executor` with working dir | Read by executor after agent exits |
| `.devs/runs/<run-id>/` | `0700` | `devs-checkpoint` | Retention sweep | Per-run checkpoint dir |
| `.devs/runs/<run-id>/checkpoint.json` | `0600` | `devs-checkpoint` | Retention sweep | Atomic write via tmp→rename |
| `.devs/runs/<run-id>/workflow_snapshot.json` | `0600` | `devs-checkpoint` | Retention sweep | Immutable after write |
| `.devs/runs/<run-id>/stages/<name>/attempt_<N>/structured_output.json` | `0600` | `devs-checkpoint` | Retention sweep | Only when `completion=structured_output` |
| `.devs/runs/<run-id>/stages/<name>/attempt_<N>/context.json` | `0600` | `devs-checkpoint` | Retention sweep | Copy of `.devs_context.json` |
| `.devs/logs/<run-id>/` | `0700` | `devs-checkpoint` | Retention sweep | Log root for run |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/stdout.log` | `0600` | `devs-executor` (streaming) | Retention sweep | Streamed during agent execution |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/stderr.log` | `0600` | `devs-executor` (streaming) | Retention sweep | Streamed during agent execution |
| `.devs/agent-state/<session-id>/task_state.json` | Written by agent | Agent process | Retention sweep (30 days default) | Not managed by `devs`; agent-written |
| `.devs/workflows/*.toml` | `0644` | Agent or operator | Agent or operator | Workflow definition files |

**[SEC-DAT-022]** On Unix, after creating any file or directory in the above table, `devs` MUST call `fs::set_permissions()` explicitly rather than relying on the process `umask`. This ensures the intended mode is always applied regardless of the operator's shell environment.

**[SEC-DAT-023]** On Windows, `devs` MUST create files using `OpenOptions::new().create_new(true)` where atomic creation is required. Windows ACL manipulation is not implemented at MVP. A startup `INFO` log is emitted on Windows: `"File permission enforcement limited to creation flags on Windows; use NTFS ACLs for additional isolation."`.

### 3.3 Data in Transit

#### 3.3.1 gRPC Transport (TLS)

**[SEC-031]** TLS is optional but strongly recommended for gRPC communication over non-loopback interfaces. When TLS is configured, the implementation MUST use `rustls` exclusively (via the `rustls-tls` feature of `reqwest` and `tonic`; OpenSSL is explicitly prohibited). Minimum TLS version: **TLS 1.2**. Preferred: **TLS 1.3**. Operating without TLS on a non-loopback interface is permitted but the server MUST emit a startup `WARN`.

**[SEC-032]** Cipher suite restrictions (rustls enforced defaults, no configuration override allowed):
- TLS 1.3: `TLS_AES_256_GCM_SHA384`, `TLS_AES_128_GCM_SHA256`, `TLS_CHACHA20_POLY1305_SHA256`
- TLS 1.2: `TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384`, `TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384`
- Explicitly disabled: RC4, 3DES, NULL ciphers, MD5-based cipher suites, export-grade ciphers

**[SEC-033]** For loopback-only deployments (default), TLS is optional. When the bind address is changed to any non-loopback interface and no `[server.tls]` section is configured, the server MUST emit a structured `WARN` log on startup: `{ "event_type": "security.misconfiguration", "check_id": "SEC-TLS-MISSING", "detail": "plaintext gRPC on non-loopback address; configure [server.tls] to suppress" }`. The server MUST still start and accept connections — TLS is not enforced at MVP.

**TLS Configuration Data Model:**

```toml
# devs.toml TLS configuration (optional; recommended for non-loopback deployments)
[server.tls]
# Path to PEM-encoded certificate chain (leaf + intermediates)
cert_file = "/etc/devs/server.crt"
# Path to PEM-encoded private key (RSA ≥3072 bit or ECDSA P-256/P-384)
key_file = "/etc/devs/server.key"
# Optional: minimum TLS version ("1.2" or "1.3"; default "1.2")
min_version = "1.2"
```

Corresponding Rust data model:

```rust
/// TLS configuration for the gRPC and MCP servers.
/// Required when `server.listen` is non-loopback.
pub struct TlsConfig {
    /// Path to PEM certificate chain file.
    pub cert_file: PathBuf,
    /// Path to PEM private key file.
    pub key_file: PathBuf,
    /// Minimum TLS version. Default: `Tls12`.
    pub min_version: TlsVersion,
}

pub enum TlsVersion {
    /// TLS 1.2 minimum (allows 1.2 and 1.3)
    Tls12,
    /// TLS 1.3 minimum (disables 1.2)
    Tls13,
}
```

Validation rules:
- `cert_file` MUST be readable at startup validation time (before port binding)
- `key_file` MUST be readable at startup validation time
- `cert_file` must parse as a valid PEM certificate chain (at least one certificate)
- Certificate expiry within 30 days: log `WARN` at startup
- Certificate already expired: log `ERROR` and refuse to bind (treated as config error)

**TLS — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-057 | `cert_file` does not exist at startup | Config validation error before any port binding: `invalid_argument: TLS cert_file not found at <path>` |
| EC-SEC-058 | TLS certificate expires during server operation | Server continues serving with expired cert (no automatic rotation); next startup will refuse to bind; a `WARN` is re-emitted at the expiry crossing if the server has an internal ticker for cert monitoring |
| EC-SEC-059 | Client presents a TLS certificate (mTLS attempt) | At MVP, server ignores client certificates; no mutual auth; post-MVP feature |
| EC-SEC-060 | Client attempts TLS 1.1 connection | rustls rejects the handshake; client receives TLS alert; server logs at `DEBUG` level |
| EC-SEC-060a | `min_version = "1.3"` and a TLS 1.2 client connects | rustls rejects with `TLSAlert(ProtocolVersion)`; no data transmitted |
| EC-SEC-060b | TLS private key file is deleted after server starts | Server continues to function (key already in memory); next restart will fail config validation |
| EC-SEC-060c | Two server instances start with the same `cert_file` path | No conflict; both read the file independently; TLS state is per-process |

**[SEC-TLS-001]** The `x-devs-client-version` gRPC metadata header MUST be verified on every RPC call after TLS establishment. A missing header returns `FAILED_PRECONDITION: "x-devs-client-version header is required"`. A major version mismatch returns `FAILED_PRECONDITION: "client major version <N> is incompatible with server major version <M>"`.

**[SEC-TLS-002]** The TLS private key file MUST be read only once at startup during config validation. The parsed key bytes are held in memory for the server's lifetime. The file path MUST be wrapped in `Redacted<PathBuf>` in `TlsConfig` to prevent path leakage in debug output.

**[SEC-TLS-003]** Both gRPC (default port 7890) and MCP HTTP (default port 7891) MUST use the same `[server.tls]` configuration when TLS is enabled. There is no separate TLS config per port. The same certificate and key are used for both listeners.

**Certificate Validation Algorithm** (applied during config validation, before any port is bound):

```
fn validate_tls_config(cfg: &TlsConfig) -> Result<(), Vec<ValidationError>> {
    // 1. Verify cert_file is readable
    cert_bytes = fs::read(cfg.cert_file)
        // Err → ValidationError::TlsCertNotReadable { path }

    // 2. Parse PEM certificate chain
    certs = parse_pem_chain(cert_bytes)
        // Err → ValidationError::TlsCertInvalidPem
    if certs.is_empty() → ValidationError::TlsCertEmpty

    // 3. Check expiry of leaf certificate (certs[0])
    not_after = certs[0].validity.not_after
    if not_after < Utc::now()
        → ValidationError::TlsCertExpired { expired_at: not_after }  // FATAL: refuse to bind
    else if not_after < Utc::now() + Duration::days(30)
        → log WARN "TLS certificate expires in <N> days at <not_after>"  // non-fatal

    // 4. Verify key_file is readable
    key_bytes = fs::read(cfg.key_file.expose())
        // Err → ValidationError::TlsKeyNotReadable { path: "[REDACTED]" }

    // 5. Parse private key
    key = parse_pem_key(key_bytes)
        // Err → ValidationError::TlsKeyInvalidPem

    // 6. Check key algorithm and minimum size
    match key.algorithm {
        RSA if key.bits < 3072 → ValidationError::TlsKeyTooWeak { bits: key.bits }
        RSA | ECDSA_P256 | ECDSA_P384 → ok
        _ → ValidationError::TlsKeyUnsupportedAlgorithm { alg }
    }

    // 7. Verify key matches certificate public key
    if !key_matches_cert(key, certs[0])
        → ValidationError::TlsKeyMismatch

    // All errors collected; return Vec (may be empty = success)
}
```

**TLS Connection State Machine:**

```mermaid
stateDiagram-v2
    [*] --> Listening : Server binds port
    Listening --> Handshaking : TCP SYN received
    Handshaking --> Rejected_Version : TLS version < min_version
    Handshaking --> Rejected_Cipher : Unsupported cipher suite
    Handshaking --> Established : TLS handshake OK
    Rejected_Version --> Listening : Connection closed; DEBUG log
    Rejected_Cipher --> Listening : Connection closed; DEBUG log
    Established --> VersionChecked : x-devs-client-version\nmetadata validated
    Established --> VersionMismatch : Major version mismatch
    VersionMismatch --> Listening : FAILED_PRECONDITION returned;\nconnection closed
    VersionChecked --> Active : gRPC RPCs processed
    Active --> Active : RPC calls (unary or streaming)
    Active --> Listening : Client disconnect or SIGTERM
    VersionChecked --> Listening : Client disconnect
```

#### 3.3.2 MCP HTTP Transport

The MCP server (`devs-mcp`) listens on a dedicated HTTP port (default 7891) and serves JSON-RPC 2.0 requests at `POST /mcp/v1/call`. Unlike the gRPC transport which uses HTTP/2 with `tonic`, the MCP server uses HTTP/1.1. All security controls in this section apply to this HTTP listener.

**[SEC-034]** The MCP HTTP server MUST apply the same TLS configuration as the gRPC server when operating over non-loopback interfaces. Specifically:

- If `server.listen` is a non-loopback address and `[server.tls]` is present, the MCP server MUST serve HTTPS using the same certificate and key as the gRPC server.
- If `server.listen` is a loopback address (default), the MCP server MAY serve plaintext HTTP.
- The MCP port MUST be bound to the same interface family as the gRPC port. If gRPC binds `0.0.0.0:7890`, MCP binds `0.0.0.0:7891`.

**[SEC-MCP-001]** All MCP HTTP responses MUST include the following security headers regardless of whether TLS is in use:

| Header | Value | Rationale |
|---|---|---|
| `Content-Type` | `application/json; charset=utf-8` | Prevent MIME-type sniffing attacks |
| `X-Content-Type-Options` | `nosniff` | Disable browser MIME sniffing |
| `Cache-Control` | `no-store` | Prevent caching of sensitive API responses |
| `X-Frame-Options` | `DENY` | Prevent clickjacking (defense-in-depth) |

**[SEC-MCP-002]** The MCP server MUST enforce a maximum request body size of **1 MiB** (1,048,576 bytes). Requests exceeding this limit MUST be rejected without reading the full body with HTTP 413 `{"result": null, "error": "request body exceeds 1 MiB limit"}`. The `Content-Length` header is checked first; if absent, the body is read up to 1 MiB + 1 byte; if the extra byte is present, the request is rejected.

**[SEC-MCP-003]** The MCP server MUST reject requests with `Content-Type` other than `application/json` with HTTP 415 `{"result": null, "error": "Content-Type must be application/json"}`.

**[SEC-MCP-004]** The MCP server MUST NOT handle `GET`, `PUT`, `DELETE`, `PATCH`, or `HEAD` methods. Only `POST` is accepted at `/mcp/v1/call`. Other methods return HTTP 405 with `Allow: POST` header and `{"result": null, "error": "method not allowed; use POST"}`.

**[SEC-MCP-005]** The MCP port MUST be different from the gRPC port. If they are configured to be equal, config validation MUST report `invalid_argument: gRPC port and MCP port must be different` before any binding attempt.

**[SEC-MCP-006]** The MCP server MUST handle panics in tool handler functions without crashing the server. A panic in any tool handler MUST be caught by a `catch_unwind` boundary in the HTTP request dispatcher and returned as HTTP 500 `{"result": null, "error": "internal: tool handler panicked"}`. The panic backtrace is logged at `ERROR` but NOT included in the HTTP response.

**[SEC-MCP-007]** The MCP server MUST limit concurrent connections to **64** per **[MCP-BR-042]**. New connections beyond this limit receive HTTP 503 `{"result": null, "error": "resource_exhausted: max concurrent connections reached"}` and are immediately closed.

**[SEC-MCP-008]** For `stream_logs` with `follow: true`, the HTTP response uses chunked transfer encoding. The streaming connection is subject to a **30-minute maximum lifetime** per stream. After 30 minutes, the server sends the terminal chunk `{"done": true, "truncated": false, "total_lines": <N>}` and closes the connection. Clients requiring a longer stream MUST reconnect using `from_sequence` to resume.

**[SEC-MCP-009]** The MCP server MUST NOT log request bodies (which may contain workflow definitions, stage outputs, or sensitive data). Only the JSON-RPC `method` name and request `id` fields are logged at `DEBUG` level.

**MCP HTTP Transport — Request Processing Pipeline:**

```mermaid
flowchart TD
    REQ["HTTP Request"] --> CHECK_METHOD{"Method == POST?"}
    CHECK_METHOD -->|"No"| R405["HTTP 405\nAllow: POST"]
    CHECK_METHOD -->|"Yes"| CHECK_PATH{"Path ==\n/mcp/v1/call?"}
    CHECK_PATH -->|"No"| R404["HTTP 404\n{error: not_found}"]
    CHECK_PATH -->|"Yes"| CHECK_CT{"Content-Type:\napplication/json?"}
    CHECK_CT -->|"No"| R415["HTTP 415\n{error: wrong content-type}"]
    CHECK_CT -->|"Yes"| CHECK_SIZE{"Body ≤ 1 MiB?"}
    CHECK_SIZE -->|"No"| R413["HTTP 413\n{error: body too large}"]
    CHECK_SIZE -->|"Yes"| PARSE{"JSON-RPC 2.0\nparse OK?"}
    PARSE -->|"No"| R400["HTTP 400\n{error: malformed JSON-RPC}"]
    PARSE -->|"Yes"| DISPATCH["Dispatch to\ntool handler"]
    DISPATCH -->|"Panic"| R500["HTTP 500\n{error: internal: panicked}"]
    DISPATCH -->|"Lock timeout 5s"| RLOCK["HTTP 200\n{error: resource_exhausted}"]
    DISPATCH -->|"Success"| R200["HTTP 200\n{result:{...},error:null}"]
    DISPATCH -->|"Tool error"| RERR["HTTP 200\n{result:null,error:'prefix:...'}"]
    R405 & R404 & R415 & R413 & R400 & R500 & RLOCK & R200 & RERR --> HEADERS["Add security headers\n(nosniff, no-store, etc.)"]
    HEADERS --> RESP["Send Response"]
```

**MCP HTTP Transport — API Contract Summary:**

| Property | Value |
|---|---|
| Protocol | HTTP/1.1 |
| Endpoint | `POST /mcp/v1/call` |
| Request `Content-Type` | `application/json` (required) |
| Response `Content-Type` | `application/json; charset=utf-8` |
| Max request body | 1 MiB (1,048,576 bytes) |
| Max concurrent connections | 64 |
| Max stream lifetime (`follow:true`) | 30 minutes |
| TLS | Required for non-loopback; optional for loopback |
| Authentication | None (MVP) |

**MCP HTTP Transport — HTTP Status Code Reference:**

| HTTP Status | Condition | Response Body |
|---|---|---|
| 200 | All tool responses (success or tool-level error) | `{"result": {...}\|null, "error": "..."\|null}` |
| 400 | Malformed JSON or invalid JSON-RPC 2.0 structure | `{"result": null, "error": "invalid_argument: malformed JSON-RPC request"}` |
| 404 | Wrong path | `{"result": null, "error": "not_found: endpoint not found; use POST /mcp/v1/call"}` |
| 405 | Non-POST method | `{"result": null, "error": "method not allowed"}` + `Allow: POST` header |
| 413 | Request body > 1 MiB | `{"result": null, "error": "request body exceeds 1 MiB limit"}` |
| 415 | Wrong Content-Type | `{"result": null, "error": "Content-Type must be application/json"}` |
| 500 | Tool handler panic | `{"result": null, "error": "internal: tool handler panicked"}` |
| 503 | Max connections exceeded | `{"result": null, "error": "resource_exhausted: max concurrent connections reached"}` |

**MCP HTTP Transport — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-081 | MCP client sends `Transfer-Encoding: chunked` request body | Server reads all chunks, assembles body, checks total size ≤ 1 MiB; rejects with HTTP 413 if exceeded |
| EC-SEC-082 | MCP client disconnects mid-stream during `stream_logs follow:true` | Server detects broken connection; releases stream resources within 500ms per **[MCP-DBG-BR-005]**; log buffer subscription cancelled |
| EC-SEC-083 | 65 simultaneous MCP connections attempted | The 65th connection receives HTTP 503 immediately; the first 64 are served normally |
| EC-SEC-084 | `stream_logs` stream open for > 30 minutes | Server sends terminal chunk at 30-minute mark and closes the connection; client MUST use `from_sequence` to resume |
| EC-SEC-085 | JSON-RPC request body is valid JSON but not an object (e.g., `[1, 2, 3]`) | HTTP 400: `{"result": null, "error": "invalid_argument: JSON-RPC request must be an object"}` |
| EC-SEC-086 | `method` field in JSON-RPC body names a non-existent tool | HTTP 200: `{"result": null, "error": "not_found: unknown MCP tool '<name>'"}` |
| EC-SEC-087 | MCP server receives a WebSocket upgrade request | HTTP 400 with `{"result": null, "error": "invalid_argument: WebSocket not supported"}` |

#### 3.3.3 Outbound Webhooks

**[SEC-035]** Outbound webhook delivery MUST use HTTPS for all non-loopback URLs. HTTP (non-TLS) webhook targets MUST log a `WARN` on every delivery attempt: `"SECURITY WARNING: Delivering webhook to non-TLS URL '<url>'. Payload may be intercepted."`. HTTP webhook targets are permitted at MVP to support local testing (e.g., `http://localhost:8080/hook`).

**[SEC-036]** Webhook SSRF mitigation: Before delivering any webhook, the resolved IP addresses of the target URL's hostname MUST be checked against a blocklist. The following IP ranges MUST be rejected with a `WARN` log and no delivery attempt:

| Range | Reason |
|---|---|
| `127.0.0.0/8` | Loopback |
| `10.0.0.0/8` | RFC-1918 private |
| `172.16.0.0/12` | RFC-1918 private |
| `192.168.0.0/16` | RFC-1918 private |
| `169.254.0.0/16` | Link-local / cloud metadata |
| `::1/128` | IPv6 loopback |
| `fc00::/7` | IPv6 unique local |
| `fe80::/10` | IPv6 link-local |

Exception: If `server.allow_local_webhooks = true` is set in `devs.toml` (for testing), loopback and RFC-1918 addresses are permitted with a startup `WARN`. This flag MUST NOT be set in production.

**[SEC-037]** Webhook URL length MUST NOT exceed 2048 characters. URLs with non-`http`/`https` schemes (e.g., `file://`, `ftp://`, `gopher://`) MUST be rejected at configuration validation time before any delivery.

**[SEC-WH-001]** Webhook delivery MUST use `reqwest` with the `rustls-tls` feature. The `reqwest::Client` used for webhook delivery MUST be constructed with:

- `.redirect(Policy::none())` — redirects are never followed
- `.timeout(Duration::from_secs(10))` — 10-second per-request timeout
- `.pool_max_idle_per_host(1)` — minimal connection pooling
- TLS certificate validation enabled (default in `rustls`); `danger_accept_invalid_certs(false)` MUST NOT be overridden

The webhook `reqwest::Client` is constructed once at server startup and reused across all deliveries. Constructing a new client per delivery is prohibited (performance regression).

**Outbound Webhook — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-061 | Webhook URL hostname has multiple A records; one is public, one is RFC-1918 | ALL resolved IP addresses are checked; if any is in the blocklist, delivery is rejected |
| EC-SEC-062 | Webhook receiver returns HTTP 301 redirect to a private IP | `reqwest` is configured with `.redirect(Policy::none())`; redirects are NOT followed; HTTP 301 is treated as delivery failure |
| EC-SEC-063 | Webhook receiver returns HTTP 500 | Delivery failure; retry per backoff policy; logged at `WARN` after all retries exhausted |
| EC-SEC-064 | DNS resolution fails for webhook hostname | Delivery fails; logged at `WARN`; treated as temporary failure; retried per backoff |
| EC-SEC-065 | Webhook URL contains basic auth credentials (`http://user:pass@host/`) | URL logged with credentials redacted as `http://user:[REDACTED]@host/`; delivery proceeds (credentials sent in Authorization header by HTTP client) |

#### 3.3.4 Remote Execution Transports

**[SEC-038]** SSH remote execution (via `ssh2` crate) MUST:
- Validate the remote host's public key against a known-hosts entry before executing any commands; unknown hosts MUST be rejected unless `ssh_config.StrictHostKeyChecking = no` is explicitly set (logged as `WARN`)
- Use Ed25519 or ECDSA P-256/P-384 keys for authentication (RSA keys ≥ 3072 bits are permitted; RSA keys < 2048 bits MUST be rejected)
- NEVER use password-based SSH authentication; only public-key authentication is permitted

**[SEC-039]** Docker remote execution MUST validate the `DOCKER_HOST` TLS certificate when using a TCP-based Docker daemon (`tcp://` or `https://` scheme). Unix socket connections (`unix://`) are permitted for local Docker daemons without TLS. Unverified TLS connections to remote Docker daemons (`DOCKER_TLS_VERIFY=0`) MUST log a `WARN` and are not permitted in production configurations.

**[SEC-SSH-001]** The SSH known-hosts file path used by `devs-executor` is resolved in this order:

1. `stage.execution_env.ssh.known_hosts_file` (per-stage config)
2. `~/.ssh/known_hosts` (user default)

If neither path exists, the connection is rejected with `not_found: SSH known_hosts file not found; set ssh_config.known_hosts_file`.

**[SEC-SSH-002]** SSH private key files used for `RemoteSshExecutor` connections MUST have mode `0600` (owner read only) on Unix. If the key file is more permissive (e.g., `0644`), the `ssh2` crate will typically reject the key. `devs-executor` additionally checks permissions before attempting connection and logs `WARN` if the file is group- or world-readable.

**Remote Execution — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-066 | SSH host key changes (server reprovision) | Host key mismatch → stage fails with `failed_precondition: SSH host key mismatch`; operator must update known_hosts |
| EC-SEC-067 | SSH private key file permissions are too open (world-readable) | Logged at `WARN`; `ssh2` may reject internally; if connection still proceeds, `devs` logs it; on next reconnect, check is re-applied |
| EC-SEC-068 | Docker container image not found | `DockerExecutor::prepare()` fails; stage fails immediately with `not_found: docker image <image> not found`; no retry |
| EC-SEC-068a | SSH connection drops mid-stage execution | `ssh2` channel error detected; stage transitions to `Failed`; working dir on remote host NOT cleaned automatically (requires manual operator intervention); `WARN` logged with remote path |
| EC-SEC-068b | Docker daemon TLS certificate is self-signed | Accepted if `DOCKER_CERT_PATH` is configured and the CA cert is in the trust store; rejected otherwise with `failed_precondition: Docker TLS certificate verification failed` |

#### 3.3.5 `devs-mcp-bridge` Transport Security

The `devs-mcp-bridge` binary provides a stdio-to-HTTP proxy that allows AI agents using the MCP stdio protocol to communicate with the `devs` MCP HTTP server. Because it forwards requests over a local or network HTTP connection, its transport security model requires specific consideration.

**[SEC-BRIDGE-001]** The `devs-mcp-bridge` discovers the MCP server address by reading the discovery file (via `DEVS_DISCOVERY_FILE` or `~/.config/devs/server.addr`) to obtain the gRPC address, then calling `ServerService.GetInfo` to retrieve the MCP port. This discovery MUST happen at bridge startup. If discovery fails, the bridge exits with code 1 and writes `{"result": null, "error": "server_unreachable: could not locate devs MCP server", "fatal": true}` to stdout.

**[SEC-BRIDGE-002]** The bridge connects to the MCP HTTP endpoint at `http://<host>:<mcp_port>/mcp/v1/call`. If the discovered gRPC host is non-loopback, the bridge MUST use `https://` instead of `http://`. The bridge uses `rustls` for HTTPS connections (same library as the main server) and validates the server's TLS certificate against the system trust store. Self-signed certificates require explicit configuration via `DEVS_BRIDGE_CA_CERT` environment variable (path to a PEM CA cert bundle).

**[SEC-BRIDGE-003]** The `devs-mcp-bridge` MUST NOT buffer requests. Each JSON-RPC request received on stdin (one per line) is forwarded immediately to the MCP HTTP server. The response from the server is written to stdout immediately (one JSON object per line) with no buffering. This prevents request pipelining and reduces the window for in-memory sensitive data accumulation.

**[SEC-BRIDGE-004]** The bridge MUST NOT log stdin or stdout content (which may contain workflow definitions, tool outputs, or sensitive data). Only connection lifecycle events are logged: `"devs-mcp-bridge: connected to <host>:<port>"`, `"devs-mcp-bridge: server connection lost; exiting"`.

**[SEC-BRIDGE-005]** After one failed reconnect attempt (1-second delay), the bridge exits with code 1 and emits: `{"result": null, "error": "internal: server connection lost", "fatal": true}`. The bridge does NOT attempt indefinite reconnection, as this would cause the AI agent using it to block indefinitely. Per **[MCP-057]**, the agent MUST handle this fatal error and write `task_state.json` before terminating.

**`devs-mcp-bridge` — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-088 | MCP server is on a non-loopback address but HTTPS is not configured | Bridge detects non-loopback host in discovery; uses HTTPS; if TLS handshake fails (no cert on server), bridge exits code 1 with `"fatal": true` |
| EC-SEC-089 | Stdin sends a request with body > 1 MiB | Bridge reads the line, forwards it to the MCP server; server returns HTTP 413; bridge writes `{"result": null, "error": "request body exceeds 1 MiB limit"}` to stdout and continues operating |
| EC-SEC-090 | Two `devs-mcp-bridge` processes run simultaneously against the same server | Both connect independently; server handles up to 64 concurrent connections; no conflict |
| EC-SEC-091 | AI agent sends multiple requests without waiting for responses (pipelined) | Bridge processes one request at a time (sequential, synchronous); subsequent requests queue on stdin; bridge reads the next line only after writing the response to stdout |

---

### 3.4 Memory & Process Security

This section specifies controls for sensitive data in process memory and subprocess isolation. These controls exist to mitigate risks where an adversarial agent subprocess, a debugger, or a core dump could expose credentials or sensitive state.

#### 3.4.1 Credential Zeroization

**[SEC-MEM-001]** API key strings loaded from `devs.toml` MUST be zeroized (overwritten with zeros) when the intermediate TOML parse buffer goes out of scope. This is implemented by wrapping the raw TOML credential string in a `Zeroizing<String>` buffer (from the `zeroize` crate) before the value is moved into a `Redacted<String>`.

```rust
use zeroize::Zeroizing;

/// Load a credential from a TOML value, zeroing the intermediate string.
fn load_credential(raw: &str) -> Redacted<String> {
    let s: Zeroizing<String> = raw.to_string().into();
    let result = Redacted::new(s.clone().into_inner());
    // `s` (Zeroizing<String>) drops and zeros here
    result
}
```

**[SEC-MEM-002]** TLS private key bytes MUST be held in `zeroize::Zeroizing<Vec<u8>>` until they are consumed by `rustls::PrivateKey::from()`. After the `rustls` key object is constructed, the raw bytes buffer is dropped and zeroed. The constructed `rustls::PrivateKey` is held in a `Redacted<rustls::PrivateKey>` wrapper for the lifetime of the server.

**[SEC-MEM-003]** Webhook secret strings (HMAC-SHA256 keys) MUST be stored as `Redacted<String>` in `WebhookTarget.secret`. The HMAC computation reads the key via `.expose()` only for the duration of the hash computation and does not retain a reference after the result is produced.

#### 3.4.2 Core Dump Prevention

**[SEC-MEM-004]** On Linux, the server MUST attempt to disable core dumps at startup by calling `setrlimit(RLIMIT_CORE, {rlim_cur: 0, rlim_max: 0})` via `libc`. If this call fails (e.g., running in a container without `CAP_SYS_RESOURCE`), a `WARN` is logged but the server continues: `"WARN: Could not disable core dumps; process credentials may be exposed in crash dumps."`.

**[SEC-MEM-005]** On macOS, `ptrace(PT_DENY_ATTACH, 0, 0, 0)` is attempted to prevent debugger attachment to the server process. Failure (common in containerized environments) is logged at `DEBUG` and does not prevent startup.

**[SEC-MEM-006]** On Windows, core dump prevention is not implemented at MVP. The server logs a startup `INFO`: `"Core dump prevention not implemented on Windows; use Windows Error Reporting settings to restrict dump capture."`.

**[SEC-MEM-007]** The server MUST call `mlockall(MCL_CURRENT | MCL_FUTURE)` on Linux if and only if running as root or with `CAP_IPC_LOCK`. If the call succeeds, a startup `INFO` is logged: `"Memory locked; credentials will not be swapped to disk."`. If the call fails for a non-privileged process, no `WARN` is emitted (non-root operation is the common case).

#### 3.4.3 Agent Subprocess Isolation

**[SEC-MEM-008]** Agent subprocesses MUST NOT inherit the server process's file descriptors beyond `stdin`, `stdout`, and `stderr`. All other file descriptors (gRPC server sockets, MCP server socket, git2 handles, log file handles) MUST be closed in the child process before `exec`. This is achieved by setting `O_CLOEXEC` on all file descriptors opened by the server.

**[SEC-MEM-009]** On Unix, the server MUST set `O_CLOEXEC` (`FD_CLOEXEC`) on every file descriptor it opens (server sockets, log files, git repo handles). In Rust, `std::fs::File` and `std::net::TcpListener` set `O_CLOEXEC` by default on Linux 2.6.23+ and macOS 10.12+; this default MUST NOT be overridden.

**[SEC-MEM-010]** The `portable-pty` crate used for PTY allocation MUST be configured to not leak non-PTY file descriptors to child processes. Verify that the `portable-pty` version in use does not inadvertently clear `O_CLOEXEC` on the pty master fd before forking.

**Memory & Process Security — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-092 | `setrlimit(RLIMIT_CORE, 0)` fails in a Docker container | `WARN` logged; server starts; operator should use `--ulimit core=0` in the Docker run command |
| EC-SEC-093 | Agent subprocess inherits a leaked file descriptor | If detected during fd audit on spawn, logged as `ERROR`; this is treated as a bug to be caught by enforcing `O_CLOEXEC` on all opened fds |
| EC-SEC-094 | Server is run under `strace` or `gdb` by the operator | On Linux, `ptrace` deny is advisory and not enforced for root; trusted-network model accepts this risk at MVP |

---

### 3.5 Section 3 Business Rules (Consolidated)

The following business rules are normative requirements derived from all subsections of Section 3. Each rule corresponds to one or more acceptance criteria in §3.7.

| ID | Rule | Enforcement Point |
|---|---|---|
| **SEC-BR-3-001** | Server MUST emit `WARN` (`check_id: "SEC-TLS-MISSING"`) if `[server.tls]` is absent and `server.listen` is non-loopback; server MUST still bind and start | Startup check (post-config, pre-bind) |
| **SEC-BR-3-002** | TLS minimum version is TLS 1.2; TLS 1.3 can be mandated; TLS 1.1 and below MUST be rejected | `rustls` configuration |
| **SEC-BR-3-003** | TLS private key path MUST be wrapped in `Redacted<PathBuf>` in `TlsConfig`; the path MUST NOT appear in any log output | `devs-config` type definition |
| **SEC-BR-3-004** | MCP HTTP server MUST respond HTTP 413 before reading full body when `Content-Length > 1 MiB` | `devs-mcp` request dispatcher |
| **SEC-BR-3-005** | All files and directories in §3.2.7 MUST be created with specified permissions using explicit `set_permissions()` calls, not relying on `umask` | `devs-executor`, `devs-checkpoint`, `devs-adapters` |
| **SEC-BR-3-006** | Prompt files (`.devs_prompt_<uuid>`) MUST be deleted immediately after the agent exits, before `devs-executor` returns the `StageRun` result | `devs-adapters` cleanup path |
| **SEC-BR-3-007** | Context files (`.devs_context.json`) and output files (`.devs_output.json`) MUST be deleted as part of working-directory cleanup, which runs after every stage regardless of outcome | `devs-executor` cleanup path |
| **SEC-BR-3-008** | Webhook delivery MUST NOT follow HTTP redirects | `devs-webhook` `reqwest::Client` config (`.redirect(Policy::none())`) |
| **SEC-BR-3-009** | SSRF blocklist MUST check ALL resolved IP addresses, not just the first | `devs-webhook` SSRF check |
| **SEC-BR-3-010** | `devs-mcp-bridge` MUST NOT buffer stdin/stdout; one line in, one line out | `devs-mcp-bridge` implementation |
| **SEC-BR-3-011** | SSH known-hosts validation MUST be performed before any command execution on a remote host | `devs-executor` `RemoteSshExecutor::prepare` |
| **SEC-BR-3-012** | Credential values MUST NEVER appear in `tracing` log output, checkpoint files, context files, or webhook payloads | `devs-core` `Redacted<T>` enforcement |
| **SEC-BR-3-013** | Core dump prevention (`setrlimit RLIMIT_CORE = 0`) MUST be attempted on Linux at startup | `devs-server` startup sequence |
| **SEC-BR-3-014** | Discovery file MUST be created with mode `0600` using explicit `set_permissions()` after atomic write | `devs-server` startup sequence |
| **SEC-BR-3-015** | MCP HTTP responses MUST include `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` on every response | `devs-mcp` response builder |
| **SEC-BR-3-016** | A `.devs_output.json` file exceeding 4 MiB MUST be rejected; stage transitions to `Failed` | `devs-executor` structured output reader |
| **SEC-BR-3-017** | SSH RSA keys < 2048 bits MUST be rejected before connection attempt | `devs-executor` `RemoteSshExecutor::prepare` |
| **SEC-BR-3-018** | Webhook `reqwest::Client` MUST be configured with TLS certificate validation enabled; `danger_accept_invalid_certs(false)` MUST NOT be overridden | `devs-webhook` client construction |

---

### 3.6 Section 3 Component Dependencies

| Component | Depends On | Is Depended Upon By |
|---|---|---|
| `devs-config` (TLS config loading, `Redacted<T>`, credential zeroization) | `devs-core` (`Redacted<T>`, `ValidationError`), `rustls`, `zeroize` | `devs-server`, `devs-grpc`, `devs-mcp` |
| `devs-grpc` (TLS-wrapped gRPC server) | `devs-config` (TLS config), `tonic` (`rustls-tls` feature), `devs-proto` | `devs-server`, `devs-tui`, `devs-cli` |
| `devs-mcp` (MCP HTTP server, security headers, size limits) | `devs-config` (TLS config), `devs-core` (`ServerState`) | `devs-server`, `devs-mcp-bridge` |
| `devs-mcp-bridge` (stdio→HTTP proxy) | `devs-core` (discovery logic), `rustls` (HTTPS to non-loopback MCP servers) | External AI agent processes |
| `devs-adapters` (prompt file creation/deletion, env var stripping) | `devs-core` (`EnvKey`, `Redacted<T>`), `tempfile`, `portable-pty` | `devs-executor` |
| `devs-executor` (working dir management, file permissions, context/output file lifecycle) | `devs-adapters`, `devs-checkpoint`, `devs-core` | `devs-scheduler` |
| `devs-checkpoint` (checkpoint branch, bare clone permissions, `git2` abstraction) | `git2`, `devs-core` | `devs-executor`, `devs-scheduler` |
| `devs-webhook` (SSRF mitigation, redirect blocking, TLS validation) | `reqwest` (`rustls-tls` feature), `devs-core` | `devs-scheduler` (via `webhook_tx` channel) |

**Dependency on Section 2 (Authentication & Authorization):**

- §3.3.1 gRPC TLS and §3.3.2 MCP HTTP TLS are prerequisites for the post-MVP client authentication pathway described in §2.5. The TLS infrastructure must be in place before bearer token auth can be added as a gRPC interceptor.
- §3.2.4 (context/output file security) depends on §2.3 (Filesystem MCP access control) to ensure agents do not access files outside their working directories via the Filesystem MCP.

**Dependency on Section 4 (Application Security Controls):**

- §3.2.1 (credential env var inheritance) depends on §4.4 (input validation) to ensure stage `env` map keys match `[A-Z_][A-Z0-9_]{0,127}` and that credential-like keys are flagged.
- §3.3.3 (outbound webhook SSRF) provides the blocklist data used by the SSRF mitigation algorithm in §4.7.

**Dependency on Section 5 (Logging & Audit):**

- §3.2.1 and §3.4.1 (credential redaction) depend on §5.4 (credential redaction in logs) for the implementation of `Redacted<T>` and the audit event `credential.found_in_config`.
- §3.4.1 (zeroization) requires that `Redacted<T>` correctly suppresses serialization, which is validated by §5.4.

---

### 3.7 Section 3 Acceptance Criteria

Each acceptance criterion below is a testable assertion that MUST be covered by an automated test annotated `// Covers: <AC-ID>`.

**Data Classification & Lifecycle:**

- **[AC-SEC-3-001]** Starting the server with `server.listen = "0.0.0.0:7890"` and no `[server.tls]` section in `devs.toml` causes the server to log a `WARN` with `check_id: "SEC-TLS-MISSING"` and `detail: "plaintext gRPC on non-loopback address; configure [server.tls] to suppress"`, and the server MUST still start successfully (exit 0 when subsequently shut down cleanly).
- **[AC-SEC-3-020]** A `WorkflowRun`'s `definition_snapshot` field returned by the `get_run` MCP tool MUST NOT contain any raw `*_API_KEY` or `*_TOKEN` string values; such values appear as `"[REDACTED]"`.
- **[AC-SEC-3-021]** A `checkpoint.json` file written to disk MUST NOT contain any string matching the pattern `sk-[a-zA-Z0-9]{10,}`. Verified by running a stage that prints `$CLAUDE_API_KEY` to stdout and asserting the checkpoint file does not contain the value.
- **[AC-SEC-3-022]** The file `.devs/logs/<run-id>/<stage>/attempt_1/stdout.log` is created with mode `0600` on Linux (verified by `fs::metadata(path)?.permissions().mode() & 0o777 == 0o600`).

**Credential Storage:**

- **[AC-SEC-3-002]** A prompt file for a file-based adapter is created with mode `0600` on Linux and is absent after the agent process exits (path no longer exists).
- **[AC-SEC-3-023]** When `devs.toml` contains `claude_api_key = "sk-test-xxx"`, the server logs a WARN matching `"Credential 'claude_api_key' found in devs.toml"` and the log message does NOT contain `"sk-test-xxx"`.
- **[AC-SEC-3-024]** When `devs.toml` is world-readable (`chmod o+r`), the server logs a WARN matching `"devs.toml is world-readable"` at startup.
- **[AC-SEC-3-025]** `Redacted<String>::serialize()` via `serde_json::to_string()` produces the literal `"[REDACTED]"` regardless of the inner value.
- **[AC-SEC-3-026]** `format!("{:?}", Redacted::new("secret"))` produces `"[REDACTED]"`.

**Git Checkpoint Store:**

- **[AC-SEC-3-027]** The `~/.config/devs/state-repos/` directory is created with mode `0700` on Linux.
- **[AC-SEC-3-028]** The `checkpoint.json` file within `.devs/runs/<run-id>/` is created with mode `0600` on Linux.

**Discovery File:**

- **[AC-SEC-3-029]** The discovery file is created with mode `0600` on Linux; verified by `fs::metadata(path)?.permissions().mode() & 0o777 == 0o600`.
- **[AC-SEC-3-030]** The discovery file is absent after a clean server shutdown triggered by SIGTERM.

**Structured Output & Context Files:**

- **[AC-SEC-3-031]** The `.devs_context.json` file is created with mode `0600` before the agent is spawned; it is absent after the stage working directory is cleaned up.
- **[AC-SEC-3-032]** A `.devs_output.json` file exceeding 4 MiB causes the stage to transition to `Failed` with an error message containing `"structured_output: file exceeds 4 MiB limit"`.

**TLS (gRPC & MCP):**

- **[AC-SEC-3-003]** Configuring a webhook target with URL `http://169.254.169.254/metadata` and triggering a `run.started` event results in: no HTTP request to that URL, and a `WARN` log entry with `event_type: "security.ssrf_blocked"`.
- **[AC-SEC-3-004]** Configuring a webhook target with a `secret` shorter than 32 bytes is rejected at `devs project add` time with exit code 4.
- **[AC-SEC-3-005]** The `devs.toml` file is checked for world-readable permissions at server startup; if world-readable, a `WARN` log entry with `check_id: "SEC-FILE-PERM-TOML"` is emitted.
- **[AC-SEC-3-033]** A TLS certificate that has already expired at server startup causes the server to exit non-zero with an error containing `"TLS cert expired"`.
- **[AC-SEC-3-034]** A TLS certificate expiring within 30 days causes a `WARN` log at startup containing `"TLS certificate expires in"` but does NOT prevent the server from starting.
- **[AC-SEC-3-035]** A TLS private key with RSA < 3072 bits is rejected at config validation with an error containing `"TLS key is too weak"`.
- **[AC-SEC-3-036]** A TLS private key that does not match the certificate is rejected at config validation with an error containing `"TLS key does not match certificate"`.
- **[AC-SEC-3-037]** A client connecting with TLS 1.1 is rejected by the server; the server does not crash; the client receives a TLS protocol alert.

**MCP HTTP Transport:**

- **[AC-SEC-3-038]** A POST to `/mcp/v1/call` with `Content-Type: text/plain` returns HTTP 415 with body `{"result": null, "error": "Content-Type must be application/json"}`.
- **[AC-SEC-3-039]** A POST to `/mcp/v1/call` with a body of exactly 1,048,577 bytes returns HTTP 413.
- **[AC-SEC-3-040]** A GET request to `/mcp/v1/call` returns HTTP 405 with an `Allow: POST` header.
- **[AC-SEC-3-041]** A POST to an unknown path (e.g., `/wrong/path`) returns HTTP 404 with body `{"result": null, "error": "not_found: ..."}`.
- **[AC-SEC-3-042]** MCP HTTP responses include `X-Content-Type-Options: nosniff` and `Cache-Control: no-store` headers on ALL response codes (200, 400, 404, 405, 413, 415, 500).
- **[AC-SEC-3-043]** A tool handler that panics returns HTTP 500 with body `{"result": null, "error": "internal: tool handler panicked"}` and the server continues to serve subsequent requests normally.

**SSRF & Webhooks:**

- **[AC-SEC-3-006]** A webhook redirect (HTTP 301) to a private IP address does NOT result in an HTTP request to the private IP; the delivery is treated as failed.
- **[AC-SEC-3-044]** A webhook URL `http://10.0.0.1/hook` is blocked; `WARN` logged; no HTTP request made.
- **[AC-SEC-3-045]** A webhook URL `http://[::1]/hook` (IPv6 loopback) is blocked.
- **[AC-SEC-3-046]** A webhook URL `file:///etc/passwd` is rejected at `devs project add` configuration validation time with exit code 4.
- **[AC-SEC-3-047]** A webhook hostname resolving to both `8.8.8.8` (public) and `192.168.1.1` (private) results in delivery being blocked (any private IP in the resolved set triggers the block).

**SSH & Docker:**

- **[AC-SEC-3-048]** An SSH connection attempt to a host not in known_hosts (with `StrictHostKeyChecking` not disabled) causes the stage to fail with an error containing `"SSH host key"`.
- **[AC-SEC-3-049]** An SSH RSA key with fewer than 2048 bits is rejected with an error containing `"SSH key too weak"`.

**`devs-mcp-bridge`:**

- **[AC-SEC-3-050]** When `devs-mcp-bridge` cannot locate the devs server (discovery file absent), it exits with code 1 and writes `{"result": null, "error": "server_unreachable: ...", "fatal": true}` to stdout.
- **[AC-SEC-3-051]** When the MCP server returns HTTP 413 for an oversized request forwarded by the bridge, the bridge writes `{"result": null, "error": "request body exceeds 1 MiB limit"}` to stdout and continues operating (does not exit).

**Memory & Process Security:**

- **[AC-SEC-3-052]** `devs-server` attempts `setrlimit(RLIMIT_CORE, 0)` on Linux at startup; if the call fails, a `WARN` log is emitted but startup continues normally.
- **[AC-SEC-3-053]** A `Redacted<String>` serialized to JSON via `serde_json::to_string()` produces `"\"[REDACTED]\""` and NOT the actual credential value.

---

## 4. Application Security Controls

### 4.0 Overview and Component Dependencies

Section 4 defines the runtime security controls enforced by `devs` across all subsystems. These controls are implemented entirely in Rust; no external security middleware or WAF is present at MVP. The controls address the attack surface produced by executing user-defined prompts, processing agent outputs, invoking subprocesses, and delivering outbound HTTP notifications.

**Component dependencies for this section:**

| Subsystem | Crate(s) | Depends On |
|---|---|---|
| Template injection prevention | `devs-core` (`TemplateResolver`) | `devs-scheduler` (depends_on closure computation) |
| Command injection prevention | `devs-adapters` | `devs-core` (`EnvKey`, `BoundedString`) |
| Path traversal prevention | `devs-executor`, `devs-config` | OS `canonicalize()` / `std::fs` |
| JSON injection prevention | `devs-executor`, `devs-mcp` | `serde_json` depth-limited deserializer |
| DoS limits | `devs-grpc`, `devs-mcp`, `devs-scheduler` | `tonic` interceptors, `tokio::sync::Semaphore` |
| Input validation | `devs-core`, `devs-config` | `serde` custom deserializers |
| Supply chain controls | `devs-build` (`./do` script), CI config | `cargo-audit`, `cargo-deny` |
| Credential redaction | `devs-core` (`Redacted<T>`) | `tracing`, all crates that log |
| SSRF prevention | `devs-webhook` | `tokio::net::lookup_host`, `reqwest` |

**Invariants that span all subsections:**
- All input validation errors are collected before returning; no short-circuit (**[FEAT-BR-016]**).
- All credential values are wrapped in `Redacted<T>` before being passed to `tracing` (**[SEC-100]**).
- No `unsafe` code is permitted in any crate (**[2_TAS-REQ-004b]**); memory safety vulnerabilities inherent to unsafe Rust are eliminated.
- All subprocess invocations use `tokio::process::Command` with discrete argument arrays; no shell string interpolation anywhere.

### 4.1 Injection Prevention

#### 4.1.1 Template Injection (Prompt Injection)

**[SEC-040]** Template variable resolution (`{{...}}`) MUST be **single-pass only**. After resolving a template variable's value, the resulting string MUST NOT be scanned for further `{{...}}` expressions. This prevents second-order prompt injection where a malicious agent output contains `{{stage.other.stdout}}` to extract data from a sibling stage.

**[SEC-041]** Template variable names that reference stages not in the current stage's transitive `depends_on` closure MUST cause an immediate stage failure with `TemplateError::UnreachableStage` before any agent spawn. This prevents lateral movement across the DAG via template references.

**[SEC-042]** Stage stdout and stderr values used in template resolution are truncated to **10,240 bytes** (the last 10,240 bytes, preserving most-recent content). Values exceeding this limit are truncated silently with no error. This limits the volume of attacker-controlled data injected into downstream prompts.

**[SEC-043]** Template variables resolved from structured JSON output (`{{stage.<name>.output.<field>}}`) extract only the leaf string/number/boolean value of the named field. If the field value is a JSON object or array, resolution fails with `TemplateError::NonScalarField` rather than serializing the structure into the prompt. This prevents embedding large JSON blobs into prompts as an exfiltration channel.

**Template Injection — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-069 | Resolved template value is 20,000 characters (exceeds 10KiB) | Truncated to last 10,240 bytes before prompt assembly; `WARN` log with `event_type: "template.truncated"` |
| EC-SEC-070 | Template references `{{stage.X.output.a.b.c}}` (nested path) | Only one level of field access permitted; `TemplateError::InvalidFieldPath` — stage fails before spawn |
| EC-SEC-071 | Template contains `{{ stage.X.stdout }}` with spaces inside delimiters | Whitespace inside `{{...}}` is normalized; parsed as `stage.X.stdout`; resolved normally |
| EC-SEC-072 | Template contains an unclosed `{{` with no matching `}}` | Treated as literal text; no error; the `{{` sequence is passed verbatim to the prompt |
| EC-SEC-073 | Prompt assembled from template resolution exceeds 1 MiB | Stage fails before agent spawn with `invalid_argument: assembled prompt exceeds 1 MiB limit` |

**Template Resolution Flow:**

```mermaid
flowchart TD
    A([Prompt template string]) --> B{Contains curly-brace variable?}
    B -- No --> Z([Pass assembled prompt to agent])
    B -- Yes --> C[Extract variable name at leftmost occurrence]
    C --> D{Variable namespace?}

    D -- workflow.input.* --> E{Input declared in WorkflowDefinition?}
    E -- No --> FAIL1([TemplateError::UnknownVariable → stage Failed])
    E -- Yes --> F{Input value present in submission?}
    F -- No --> FAIL2([TemplateError::MissingRequiredInput → stage Failed])
    F -- Yes --> RESOLVE[Resolve literal value]

    D -- run.id / run.slug / run.name --> G[Resolve from WorkflowRun metadata]
    G --> RESOLVE

    D -- stage.*.* --> H{Stage in transitive depends_on closure?}
    H -- No --> FAIL3([TemplateError::UnreachableStage → stage Failed])
    H -- Yes --> I{Stage status = Completed?}
    I -- No --> FAIL4([TemplateError::StageNotCompleted → stage Failed])
    I -- Yes --> J{Field path depth > 1 level?}
    J -- Yes --> FAIL5([TemplateError::InvalidFieldPath → stage Failed])
    J -- No --> K{Field value is scalar?}
    K -- No --> FAIL6([TemplateError::NonScalarField → stage Failed])
    K -- Yes --> L{Value length > 10,240 bytes?}
    L -- Yes --> M[Truncate to last 10,240 bytes; WARN log]
    M --> RESOLVE
    L -- No --> RESOLVE

    D -- fan_out.* --> N[Resolve fan_out.index or fan_out.item from sub-agent context]
    N --> RESOLVE

    D -- unknown namespace --> FAIL7([TemplateError::UnknownVariable → stage Failed])

    RESOLVE --> O[Substitute resolved value at exact position in template string]
    O --> P{Scan continues from position AFTER substitution point}
    P --> B

    Z --> Q{Assembled prompt size ≤ 1 MiB?}
    Q -- No --> FAIL8([invalid_argument: assembled prompt exceeds 1 MiB limit → stage Failed])
    Q -- Yes --> R([Spawn agent with assembled prompt])
```

**Key property of single-pass resolution:** The scan pointer advances past each substituted value without re-scanning it. If a resolved value happens to contain `{{` characters, those are passed verbatim to the agent; they are never interpreted as template expressions. This prevents second-order injection attacks.

#### 4.1.2 Command Injection (Agent Adapter Layer)

**[SEC-044]** Agent subprocess invocation MUST use `tokio::process::Command` with separate argument arrays — never shell string interpolation. The prompt string, prompt file path, and all flags MUST be passed as discrete `arg()` entries, not concatenated into a single shell command string. This prevents shell metacharacter injection (`; rm -rf`, `$(...)`, backtick execution) from appearing in prompts or file paths.

**[SEC-045]** Prompt files written to disk for file-based adapters (opencode, copilot) MUST use a generated UUID filename (`<working_dir>/.devs_prompt_<uuid4>`) — not any user-provided or stage-derived filename. The path passed to the agent adapter is the generated path, never a user-controlled value.

**[SEC-046]** Environment variable keys injected into agent processes MUST match the regex `[A-Z_][A-Z0-9_]{0,127}` (enforced by the `EnvKey` type in `devs-core`). This prevents injection of keys with shell-special characters. Environment variable values are passed verbatim with no escaping; implementors must ensure no shell interpolation occurs in the subprocess spawn path.

**Command Injection — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-074 | Prompt contains `"; rm -rf /; echo "` | Passed as the value of `--print` arg to `tokio::process::Command::arg()`; no shell interprets it; the agent receives the literal string |
| EC-SEC-075 | `prompt_file` path contains spaces | Passed as a single discrete `arg()` entry; `tokio::process::Command` handles quoting internally; no shell word-splitting occurs |
| EC-SEC-076 | Stage env key `FOO=BAR` (contains `=`) | Rejected by `EnvKey` validation (`[A-Z_][A-Z0-9_]*` does not match `=`); `invalid_argument: env key 'FOO=BAR' contains invalid characters` |

#### 4.1.3 Path Traversal

**[SEC-047]** All user-supplied file paths (workflow `prompt_file`, execution environment paths, project `repo_path`) MUST be canonicalized using `std::fs::canonicalize()` (or equivalent that resolves symlinks and `..` segments) before use. Paths that escape their intended root directory after canonicalization MUST be rejected with `invalid_argument: path traversal detected`.

**[SEC-048]** The `prompt_file` field in stage definitions is resolved at execution time relative to the project's workflow search directories. Path components that are absolute (begin with `/` or a drive letter on Windows) or contain `..` segments MUST be rejected at workflow validation time, not only at execution time.

**Path Traversal — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-077 | `prompt_file = "prompts/../../../etc/hosts"` | `..` component detected at validation time; rejected with `invalid_argument: prompt_file path contains '..' segment` |
| EC-SEC-078 | `repo_path` in `projects.toml` uses a symlink | Symlink resolved via `canonicalize()`; the resolved real path is used for all operations |
| EC-SEC-079 | `prompt_file` points to a file that is a symlink to `/etc/passwd` | Symlink resolved at execution time via `canonicalize()`; resolved path outside workflow directory → `invalid_argument: path traversal detected`; stage fails without reading the file |

#### 4.1.4 JSON Injection in Structured Output

**[SEC-049]** Structured output parsing (`.devs_output.json` and stdout JSON) MUST use `serde_json`'s safe deserialization with a depth limit of 128 nested levels. JSON with deeper nesting MUST cause stage failure with `structured_output_parse_error`. This prevents stack overflow attacks via deeply nested JSON.

**[SEC-050]** The `"success"` field in `.devs_output.json` MUST be a JSON boolean literal. String values (`"true"`, `"false"`, `"1"`, `"0"`) and numeric values (`1`, `0`) MUST cause stage failure with `Failed` status and log message `"structured_output: 'success' must be a boolean; got <actual_type>"`. This prevents type confusion attacks.

**JSON Injection — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-080 | `.devs_output.json` is 50 MiB of valid JSON | Parsed with size limit check; files over 10 MiB → `structured_output_parse_error: file exceeds 10 MiB`; stage `Failed` |
| EC-SEC-081 | `.devs_output.json` contains 129 levels of nesting | Depth limit exceeded at level 128; `structured_output_parse_error: nesting depth limit exceeded`; stage `Failed` |
| EC-SEC-082 | `.devs_output.json` contains `"success": null` | `null` is not a boolean; stage `Failed` with `"'success' must be a boolean; got null"` |
| EC-SEC-083 | Agent writes valid JSON to stdout but `.devs_output.json` also exists | `.devs_output.json` takes priority per **[2_TAS-BR-015]**; stdout JSON is ignored entirely |

### 4.2 OWASP Top 10 Mitigations

#### A01 — Broken Access Control

**[SEC-051]** MVP access control is network-perimeter-based (see §2.1). Within the network perimeter, all authenticated connections have equivalent access. There is no role-based or resource-based access control on gRPC or MCP endpoints at MVP. This is a documented and accepted risk. Operators MUST restrict network access.

**[SEC-052]** The Filesystem MCP enforces workspace-boundary access control (see **[SEC-019]** and **[SEC-020]**). This is the only enforced access control policy at MVP.

#### A02 — Cryptographic Failures

**[SEC-053]** The following cryptographic primitives are **prohibited** in all `devs` crates:
- MD5 (for any purpose, including non-security uses)
- SHA-1 (for any purpose, including checksums)
- DES, 3DES
- RC4, RC2
- RSA with keys < 2048 bits (key size < 3072 bits should be avoided for new key generation)
- HMAC with keys shorter than 128 bits
- ECB cipher mode for any symmetric encryption
- Random number generation via `rand::thread_rng()` for security-sensitive purposes; use `ring::rand::SystemRandom` or `getrandom` crate directly

**[SEC-054]** Webhook HMAC-SHA256 signing MUST use the `hmac` and `sha2` crates from the RustCrypto ecosystem (or `ring`). The HMAC key (webhook `secret` field) MUST be at minimum 32 bytes (256 bits). Keys shorter than 32 bytes MUST be rejected at project configuration validation.

**[SEC-055]** UUID generation (run IDs, delivery IDs, session IDs) MUST use UUID v4 (random). The UUID `v4` feature of the `uuid` crate uses the `getrandom` crate, which sources entropy from the OS CSPRNG. No UUID generation in security-relevant contexts (session IDs, delivery IDs) may use sequential or timestamp-based UUIDs (v1, v7).

#### A03 — Injection

**[SEC-056]** All injection controls are defined in §4.1 above. Key summary:
- Template: single-pass only (**[SEC-040]**)
- Command: no shell string interpolation (**[SEC-044]**)
- Path: canonicalize before use (**[SEC-047]**)
- JSON: depth-limited deserialization (**[SEC-049]**)

#### A04 — Insecure Design

**[SEC-057]** The Glass-Box MCP architecture is a deliberate design choice that trades confidentiality for observability. This is acceptable for the primary persona (sole developer using trusted AI agents on a local machine). Operators hosting `devs` for multiple users or in shared environments must treat this as a high-risk configuration at MVP and defer deployment until post-MVP authentication is available.

#### A05 — Security Misconfiguration

**[SEC-058]** The `devs` server MUST perform the following security checks on startup and log `WARN` for each violated condition:

1. `server.listen` or `server.mcp_port` bind to non-loopback address
2. Any `*_API_KEY` or `*_TOKEN` field found in `devs.toml`
3. `devs.toml` is world-readable (Unix: `o+r`)
4. `~/.config/devs/projects.toml` is world-readable
5. Any webhook URL uses HTTP (non-TLS) scheme
6. `server.allow_local_webhooks = true` is set
7. Any SSH `StrictHostKeyChecking = no` is configured

**Security Misconfiguration — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-097 | `devs.toml` cannot be stat'd (permissions) | Check `SEC-058-3` status = `"warn"` with finding `"cannot read file permissions: <OS error>"` |
| EC-SEC-098 | `server.listen = "0.0.0.0:7890"` but `DEVS_LISTEN` env var overrides to `127.0.0.1:7890` | Check reads the effective resolved value (after env var override); reports `ok` |

#### A06 — Vulnerable and Outdated Components

**[SEC-060]** The `./do lint` script MUST include execution of `cargo audit --deny warnings` against the RustSec Advisory Database. Any `cargo audit` finding at `WARN` or higher severity MUST cause `./do lint` to exit non-zero, blocking `./do presubmit`. The `cargo audit` tool MUST be installed by `./do setup` (pinned to a specific version in the authoritative dependency table).

**[SEC-061]** The GitLab CI pipeline MUST run `cargo audit` as a separate job that runs on every commit, independent of the main `presubmit` job. This job MUST fail the pipeline on any new advisory, even if `./do presubmit` would otherwise pass.

**[SEC-062]** Known false-positive or acceptable advisories MAY be suppressed via an `audit.toml` file at the repository root. Each suppressed advisory MUST include a comment documenting the justification and an expiry date. Suppression entries with expired dates MUST cause `cargo audit` to fail.

**`audit.toml` Schema (advisory suppression):**

```toml
# audit.toml — placed at workspace root
# Each [[ignore]] entry suppresses one RustSec advisory ID.
# Expired entries cause `cargo audit` to exit non-zero.

[[ignore]]
id = "RUSTSEC-2023-0071"
reason = "Affected code path (RSA PKCS1v15 decryption) is not called by devs; devs uses HMAC-SHA256 only"
expires = "2025-12-31"  # ISO 8601 date; audit fails after this date

[[ignore]]
id = "RUSTSEC-2024-0001"
reason = "Transitive dep through reqwest; not exploitable in our usage pattern (no user-controlled URL scheme)"
expires = "2025-06-30"
```

**`audit.toml` field constraints:**

| Field | Type | Required | Constraint |
|---|---|---|---|
| `id` | String | Yes | Must match `RUSTSEC-YYYY-NNNN` format |
| `reason` | String | Yes | Non-empty; must document why suppression is acceptable |
| `expires` | String | Yes | ISO 8601 date (`YYYY-MM-DD`); must be a future date at time of commit |

**[SEC-062a]** The `./do lint` script verifies that all `audit.toml` `expires` dates are at least 7 days in the future. Entries expiring within 7 days produce a `WARN` log; expired entries cause `./do lint` to exit non-zero.

**[SEC-062b]** The total number of suppressed advisories in `audit.toml` MUST NOT exceed 10 at any time. Exceeding this limit causes `./do lint` to exit non-zero with: `"security: too many suppressed advisories (N/10 limit); review and remove expired suppressions"`.

**Supply Chain — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-100a | `audit.toml` contains `expires = "2025-01-01"` (past date) | `cargo audit` exits non-zero: `"advisory RUSTSEC-YYYY-NNNN suppression expired 2025-01-01"` |
| EC-SEC-100b | New dependency added to `Cargo.toml` that is not in TAS version table | `./do lint` dep-audit step exits non-zero: `"dependency 'foo 1.0.0' not in authoritative version table"` |
| EC-SEC-100c | `reqwest` compiled with `native-tls` feature (accidentally) | `./do lint` dep-audit detects forbidden feature: `"reqwest must use rustls-tls only; found feature 'native-tls'"` |
| EC-SEC-100d | `unsafe` block added by a transitive proc-macro crate | `cargo deny check` or `cargo geiger` included in `./do lint`; reports `unsafe` in transitive deps; advisory (not fatal) at MVP |

#### A07 — Identification and Authentication Failures

**[SEC-063]** At MVP, there are no authentication credentials to protect (no client accounts, no session tokens). The API keys stored in server environment are credentials for upstream AI provider services, not for `devs` itself. Authentication failure handling is therefore not applicable to MVP client interactions.

**[SEC-064]** Webhook `secret` values used for HMAC-SHA256 signing MUST be treated as credentials: subject to the same logging prohibition (**[SEC-025]**), stored as `Option<String>` in the `WebhookTarget` struct, and NEVER serialized into checkpoint files or log output.

#### A08 — Software and Data Integrity Failures

**[SEC-065]** Checkpoint files (`checkpoint.json`, `workflow_snapshot.json`) are committed to git with SHA-1 content-addressed history. While SHA-1 is deprecated for cryptographic purposes, git's use of it for content addressing (with collision resistance improvements in modern git) is an acceptable integrity mechanism for checkpoint data. No additional integrity signing of checkpoint files is required at MVP.

**[SEC-066]** Workflow definition snapshots stored at `.devs/runs/<run-id>/workflow_snapshot.json` are written before the first stage transition and MUST NOT be modified after `Pending → Running` transition. Implementors MUST verify this immutability invariant in the `devs-checkpoint` layer by checking that the file does not exist before writing (returning an error if it already exists, rather than overwriting).

**[SEC-067]** The `devs-mcp-bridge` stdin-to-HTTP forwarding proxy MUST validate that every forwarded request body is valid JSON before transmitting to the MCP server. Malformed JSON on stdin MUST produce a structured error to stdout (`{"result":null,"error":"invalid_argument: malformed JSON input","fatal":false}`) and discard the request, rather than forwarding garbage to the MCP server.

#### A09 — Security Logging and Monitoring Failures

See §5 (Logging, Monitoring & Audit Trails) for full coverage.

#### A10 — Server-Side Request Forgery (SSRF)

**[SEC-068]** SSRF mitigations for outbound webhooks are defined in **[SEC-036]** and **[SEC-037]**. The blocklist check MUST be performed after DNS resolution (to catch DNS rebinding attacks) and MUST be re-evaluated on each delivery attempt (not cached). This is implemented by resolving the hostname to IP addresses immediately before the HTTP connection is established, not at configuration validation time.

**[SEC-069]** The `ssh2`-based remote execution does not perform outbound HTTP requests to user-controlled addresses. SSH connection targets are configured in `devs.toml` and are operator-controlled, not user-controlled (users submit workflow runs, not SSH connection parameters). No additional SSRF mitigation is required for the SSH execution environment.

### 4.3 Denial of Service Protections

**[SEC-070]** gRPC request size limits are enforced at the `tonic` layer:
- `SubmitRun`: max 1 MiB request body (enforces workflow definition size)
- `StreamLogs`: max 64 KiB request
- All other RPCs: max 1 MiB request / 4 MiB response

**[SEC-071]** MCP HTTP server enforces a 1 MiB maximum request body size (`Content-Length` or chunked transfer). Requests exceeding this limit MUST receive HTTP 413 with body `{"result":null,"error":"invalid_argument: request body exceeds 1 MiB limit"}`.

**[SEC-072]** Stage output buffers (stdout, stderr) are capped at 1 MiB each (see `BoundedBytes<1_048_576>` in `devs-core`). Output beyond this limit is truncated from the beginning (preserving most-recent content). This prevents agent processes from exhausting server memory by generating unbounded output.

**[SEC-073]** The context file (`.devs_context.json`) has a maximum size of 10 MiB. If the accumulated stage outputs exceed this limit, stdout/stderr of each included stage are truncated proportionally. This limits the total size of data passed between stages.

**[SEC-074]** Fan-out parallelism is capped at 64 sub-agents per stage (**[3_PRD-BR-031]**). Workflows with more than 256 stages are rejected at validation. These limits prevent resource exhaustion via combinatorial fan-out.

**[SEC-075]** The gRPC per-client event buffer is capped at 256 messages. On overflow, the oldest message is dropped (not the client connection). This prevents a slow or unresponsive client from blocking the scheduler's event dispatch.

**[SEC-076]** Webhook delivery MUST enforce a connection timeout of 10 seconds per attempt. A maximum of `max_retries + 1` attempts are made per event. Webhook delivery failures MUST NOT block or slow the scheduler — delivery runs in a dedicated `tokio::spawn` task via the `webhook_tx` channel (buffer ≥ 1024).

**Denial of Service — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-084 | 1025th event queued on `webhook_tx` (buffer full) | Oldest event dropped silently; new event enqueued; `WARN` log: `"webhook dispatcher queue full; event dropped"` |
| EC-SEC-085 | 257th gRPC streaming client connects to `StreamRunEvents` | Each client has an independent 256-message buffer; the 257th client is accepted; each client's buffer is independent |
| EC-SEC-086 | Workflow with 257 stages submitted | Rejected at step 13 of validation: `invalid_argument: workflow must have at most 256 stages; got 257` |
| EC-SEC-087 | Fan-out with `count = 65` submitted | Rejected at step 11 of validation: `invalid_argument: fan_out.count must be between 1 and 64; got 65` |
| EC-SEC-088 | Agent writes 2 MiB to stdout | First 1,048,576 bytes discarded; last 1,048,576 bytes retained; `truncated: true` set in `StageOutput` |

#### 4.3.1 Connection Limits

**[SEC-070a]** The MCP HTTP server MUST accept at least 64 simultaneous concurrent HTTP connections (**[MCP-BR-042]**). There is no hard upper connection limit enforced at MVP — the OS TCP stack and Tokio runtime govern maximum connections. Individual request processing is bounded by lock acquisition timeout (5 seconds) before returning `resource_exhausted`.

**[SEC-070b]** Lock acquisition for control-plane MCP tools (those that acquire `SchedulerState` write lock) MUST time out after 5 seconds if the lock is not available (**[MCP-BR-040]**). The response MUST be HTTP 200 with body `{"result":null,"error":"resource_exhausted: lock acquisition timed out after 5s"}`. This prevents a stalled write operation from indefinitely blocking all subsequent control requests.

**[SEC-070c]** gRPC streaming connections (`StreamRunEvents`, `StreamLogs`, `WatchPoolState`) are not subject to a connection-count limit at MVP. They are bounded by per-stream resource allocation (256-message buffer for `StreamRunEvents`, log chunk readers for `StreamLogs`). Streaming resources MUST be released within 500 ms of client cancellation or disconnect (**[2_TAS-REQ-002t]**).

**Connection Limit Summary:**

| Interface | Max Concurrent | Limit Enforcement | Behavior at Limit |
|---|---|---|---|
| MCP HTTP | ≥ 64 (OS-governed above) | Tokio acceptor | New connections queued in OS TCP backlog |
| gRPC unary | OS-governed | `tonic` | Standard TCP backlog behavior |
| gRPC streaming | OS-governed | `tonic` | Per-stream 256-msg buffer; oldest msg dropped on overflow |
| Webhook dispatcher | 1024 events in channel | `mpsc` buffer | Oldest event dropped on overflow; `WARN` logged |
| Lock wait (control plane) | N/A | 5s timeout per request | `resource_exhausted` returned; connection remains open |

### 4.4 Input Validation

**[SEC-077]** All workflow definition inputs (TOML, YAML, Rust builder API) MUST be validated through the 13-step validation pipeline (as defined in `[FEAT-BR-016]`) before any stage is dispatched. Validation collects all errors before returning; no short-circuit. Invalid definitions are rejected entirely.

**[SEC-078]** Run name and slug uniqueness is enforced under a per-project mutex (**[2_TAS-BR-016]**, **[2_TAS-BR-025]**) to prevent time-of-check/time-of-use (TOCTOU) races in duplicate name detection.

**[SEC-079]** Workflow input parameters of type `Path` MUST NOT be resolved to absolute filesystem paths at submission time. Resolution occurs at execution time within the stage's isolated working directory. This prevents path-based SSRF or local file inclusion via submitted inputs.

**[SEC-080]** `BoundedString<N>` type constraints MUST be enforced at deserialization time using `serde` custom deserializers, not only at explicit validation call sites. This ensures constraints are applied to all code paths that accept user input, including MCP tool calls and gRPC requests.

**Input Validation Data Model — `BoundedString<N>` Deserializer Contract:**

```rust
/// A UTF-8 string with a compile-time maximum byte length.
/// Enforced at deserialization time; never silently truncates.
pub struct BoundedString<const N: usize>(String);

impl<'de, const N: usize> Deserialize<'de> for BoundedString<N> {
    fn deserialize<D: Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        let s = String::deserialize(d)?;
        if s.is_empty() {
            return Err(D::Error::custom("BoundedString: value must not be empty"));
        }
        if s.len() > N {
            return Err(D::Error::custom(format!(
                "BoundedString<{N}>: value exceeds maximum length ({} bytes)",
                s.len()
            )));
        }
        Ok(BoundedString(s))
    }
}
```

Validation rules for all `BoundedString<N>` instances:
- Empty string → `ValidationError::EmptyString`
- Byte length > N → `ValidationError::ExceedsMaxLength { max: N, actual: len }`
- Non-UTF-8 bytes → rejected at JSON deserialization before `BoundedString` is reached

**Input Validation — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-089 | Workflow name is 129 UTF-8 bytes (exceeds BoundedString<128>) | `ValidationError::ExceedsMaxLength { max: 128, actual: 129 }` at deserialization |
| EC-SEC-090 | Stage env value contains null byte `\x00` | JSON string with null byte is valid JSON; the value is passed to the subprocess env as a null-terminated string; behavior is OS-defined (Linux typically truncates at null) |
| EC-SEC-091 | `submit_run` with extra input keys not declared in workflow | Step 5 of submission validation: `invalid_argument: unknown input key 'extra_key'`; entire submission rejected |
| EC-SEC-092 | `submit_run` with `integer` input value `"42.5"` (decimal string) | Step 4 type coercion: `invalid_argument: cannot coerce '42.5' to integer`; rejected |

**Comprehensive Field Constraints Reference:**

The following table defines all `devs-core` type constraints applied to user-submitted data. All constraints are enforced at deserialization time by `serde` custom deserializers or `BoundedString<N>` wrappers. Missing values for required fields produce `ValidationError::MissingRequiredField`.

| Field Path | Type | Constraint | Error on Violation |
|---|---|---|---|
| `WorkflowDefinition.name` | `BoundedString<128>` | `[a-z0-9_-]+`, non-empty, ≤ 128 bytes | `invalid_argument: workflow name must match [a-z0-9_-]+` |
| `WorkflowDefinition.stages` | `Vec<StageDefinition>` | 1–256 elements | `invalid_argument: workflow must have 1–256 stages` |
| `WorkflowDefinition.inputs` | `Vec<WorkflowInput>` | 0–64 elements | `invalid_argument: workflow may have at most 64 inputs` |
| `WorkflowDefinition.timeout_secs` | `Option<u64>` | If present: ≥ 1 | `invalid_argument: timeout_secs must be at least 1` |
| `StageDefinition.name` | `BoundedString<128>` | Non-empty, ≤ 128 bytes, unique within workflow | `invalid_argument: stage name must be unique and ≤128 bytes` |
| `StageDefinition.pool` | `String` | Non-empty; must match a declared pool name | `invalid_argument: pool 'X' not found` |
| `StageDefinition.prompt` | `String` | Non-empty; mutually exclusive with `prompt_file` | `invalid_argument: exactly one of prompt or prompt_file required` |
| `StageDefinition.prompt_file` | `String` | Non-empty; no `..` segments; not absolute | `invalid_argument: prompt_file must be a relative path with no '..' segments` |
| `StageDefinition.env` | `HashMap<EnvKey, String>` | 0–256 entries | `invalid_argument: stage env may have at most 256 entries` |
| `StageDefinition.timeout_secs` | `Option<u64>` | If present: ≥ 1, ≤ `workflow.timeout_secs` | `invalid_argument: stage timeout exceeds workflow timeout` |
| `StageDefinition.depends_on` | `Vec<String>` | All names must refer to other stages; no cycles | `invalid_argument: depends_on references unknown stage 'X'` |
| `StageDefinition.required_capabilities` | `Vec<String>` | 0–64 entries; each ≤ 128 bytes | `invalid_argument: required_capabilities entry exceeds 128 bytes` |
| `RetryConfig.max_attempts` | `u8` | 1–20 | `invalid_argument: max_attempts must be 1–20` |
| `RetryConfig.initial_delay_secs` | `u64` | ≥ 1 | `invalid_argument: initial_delay_secs must be at least 1` |
| `FanOutConfig.count` | `u32` | 1–64; mutually exclusive with `input_list` | `invalid_argument: fan_out.count must be 1–64` |
| `FanOutConfig.input_list` | `Vec<String>` | 1–64 entries; mutually exclusive with `count` | `invalid_argument: fan_out.input_list must have 1–64 entries` |
| `WorkflowInput.name` | `BoundedString<64>` | `[a-z0-9_]+`, non-empty, ≤ 64 bytes | `invalid_argument: input name must match [a-z0-9_]+` |
| `EnvKey` | `String` | `[A-Z_][A-Z0-9_]{0,127}`; prohibited: `DEVS_LISTEN`, `DEVS_MCP_PORT`, `DEVS_DISCOVERY_FILE` | `invalid_argument: env key 'X' is invalid or reserved` |
| `RunSlug` | `String` | `[a-z0-9-]+`, ≤ 128 chars | Auto-generated; user-provided names truncated to fit slug format |
| `AgentPool.max_concurrent` | `u32` | 1–1024 | `invalid_argument: max_concurrent must be 1–1024` |
| `AgentPool.agents` | `Vec<AgentConfig>` | ≥ 1 | `invalid_argument: pool must have at least one agent` |
| `Project.weight` | `u32` | ≥ 1 | `invalid_argument: project weight must be at least 1` |
| `WebhookTarget.url` | `Url` | Scheme `http` or `https`; ≤ 2048 chars | `invalid_argument: webhook URL scheme must be http or https` |
| `WebhookTarget.events` | `Vec<WebhookEvent>` | Non-empty | `invalid_argument: webhook events list must not be empty` |
| `WebhookTarget.timeout_secs` | `u32` | 1–30 | `invalid_argument: webhook timeout_secs must be 1–30` |
| `WebhookTarget.max_retries` | `u32` | 0–10 | `invalid_argument: webhook max_retries must be 0–10` |
| `WebhookTarget.secret` | `Option<String>` | If present: ≥ 32 bytes (256 bits) | `invalid_argument: webhook secret must be at least 32 bytes` |
| Max webhook targets per project | — | 0–16 | `invalid_argument: project may have at most 16 webhook targets` |

**`EnvKey` Prohibited Keys (stripped from all agent environments):**

```rust
const PROHIBITED_ENV_KEYS: &[&str] = &[
    "DEVS_LISTEN",
    "DEVS_MCP_PORT",
    "DEVS_DISCOVERY_FILE",
];
```

These keys are stripped from the agent's process environment even if the operator has them set in the server's own environment. `DEVS_MCP_ADDR` is injected by `devs-executor` into every agent process regardless of stage env declarations.

### 4.5 Supply Chain Security

**[SEC-081]** The authoritative dependency version table in the TAS (§2.2) is enforced by `./do lint`. Any dependency not in the authoritative table, or at a different version, MUST cause lint failure. This prevents silent introduction of unreviewed transitive dependencies.

**[SEC-082]** `unsafe_code = "deny"` is enforced workspace-wide via the workspace lint table (**[2_TAS-REQ-004b]**). No `unsafe` blocks are permitted in authored code. This eliminates a large class of memory safety vulnerabilities (buffer overflows, use-after-free, data races) inherent to unsafe Rust.

**[SEC-083]** The `reqwest` crate MUST be compiled with the `rustls-tls` feature only. The `native-tls` or `openssl` features MUST NOT be enabled. This ensures all outbound HTTP (webhooks, any future HTTP clients) uses the audited `rustls` stack, not platform-specific TLS implementations with varying security postures.

**[SEC-083a]** The dependency audit performed by `./do lint` MUST verify the following additional constraints beyond version pinning:

1. No crate in the dependency tree has `default-features = true` for `reqwest` (must explicitly set `default-features = false, features = ["json", "rustls-tls"]`).
2. The crates `openssl`, `openssl-sys`, `native-tls` MUST NOT appear anywhere in `cargo tree` output for non-dev profiles.
3. The crates `md5`, `sha1` (distinct from `sha1` used by git) MUST NOT appear as direct dependencies of any workspace crate.
4. No workspace crate's `Cargo.toml` contains `features = [... "openssl" ...]` or `features = [... "native-tls" ...]`.

**[SEC-083b]** The `./do setup` command MUST install `cargo-audit` at a pinned version. The pinned version and its SHA-256 checksum MUST be recorded in the `./do` script itself (not in `Cargo.toml`). This prevents supply chain compromise via a malicious update to `cargo-audit` before the audit runs.

**Supply Chain Dependency Audit Algorithm:**

```sh
# Performed by ./do lint, step: dep-audit
cargo metadata --format-version 1 --no-deps \
  | jq '.packages[] | {name: .name, version: .version}' \
  > /tmp/devs_actual_deps.json

# Compare against TAS authoritative table embedded in ./do
check_authoritative_versions /tmp/devs_actual_deps.json

# Verify forbidden crates absent from full dependency tree
cargo tree --prefix none --edges normal \
  | grep -E "^(openssl|native-tls|md5|sha1) " \
  && { echo "ERROR: forbidden dependency found"; exit 1; } || true

# Verify reqwest feature flags
cargo tree -p reqwest --features rustls-tls \
  | grep -v rustls | grep -q openssl \
  && { echo "ERROR: reqwest linked against openssl"; exit 1; } || true
```

### 4.6 `Redacted<T>` Type Definition

**[SEC-100]** All credential and secret values passed to `tracing` instrumentation MUST be wrapped in the `Redacted<T>` type. This type renders as `"[REDACTED]"` in all log formatters (both JSON and text), preventing accidental secret disclosure through log output.

```rust
/// A wrapper that renders as "[REDACTED]" in all log and display contexts.
/// Use this for any value that must not appear in log output:
/// API keys, webhook secrets, SSH private keys, etc.
pub struct Redacted<T>(pub T);

impl<T> fmt::Debug for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[REDACTED]")
    }
}

impl<T> fmt::Display for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "[REDACTED]")
    }
}

impl<T: tracing::Value> tracing::Value for Redacted<T> {
    fn record(&self, key: &tracing::field::Field, visitor: &mut dyn tracing::field::Visit) {
        visitor.record_str(key, "[REDACTED]");
    }
}
```

Usage requirements:
- `Redacted<T>` MUST be applied to any `tracing` field whose name matches the pattern `*_api_key`, `*_token`, `*_secret`, `*_password` (case-insensitive matching)
- `Redacted<T>` MUST be applied to webhook `secret` in all log events
- `Redacted<T>` MUST be applied to SSH private key content
- `Redacted<T>` is defined in `devs-core::security`; all other crates import from there

**Redacted<T> — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-093 | `tracing::info!(api_key = %some_key)` without `Redacted` wrapper | `cargo clippy` custom lint `devs::no_unredacted_secrets` flags the pattern; CI fails |
| EC-SEC-094 | `Redacted<String>` logged via JSON formatter | JSON output: `"api_key": "[REDACTED]"` — the key name is present, value is `[REDACTED]` |
| EC-SEC-095 | Code attempts to unwrap `Redacted<T>` to log the inner value | `Redacted<T>::0` is pub; the lint flags any `.0` access in a `tracing` context |

### 4.7 SSRF Mitigation Algorithm

The SSRF blocklist check is implemented as follows and applied before every webhook delivery attempt:

```rust
/// Returns Ok(()) if the URL is safe to deliver to.
/// Returns Err(SsrfError) if the resolved IP is in a blocked range.
async fn check_ssrf(url: &Url, allow_local: bool) -> Result<(), SsrfError> {
    let host = url.host_str().ok_or(SsrfError::NoHost)?;

    // Resolve hostname to IP addresses (DNS lookup performed at delivery time)
    let addrs: Vec<IpAddr> = tokio::net::lookup_host((host, 80))
        .await
        .map_err(|e| SsrfError::DnsFailure(e.to_string()))?
        .map(|sa| sa.ip())
        .collect();

    if addrs.is_empty() {
        return Err(SsrfError::DnsNoRecords);
    }

    for addr in &addrs {
        if is_blocked(addr, allow_local) {
            return Err(SsrfError::BlockedAddress {
                ip: *addr,
                reason: classify_blocked_range(addr),
            });
        }
    }

    Ok(())
}

fn is_blocked(addr: &IpAddr, allow_local: bool) -> bool {
    if allow_local {
        return false; // server.allow_local_webhooks = true
    }
    match addr {
        IpAddr::V4(v4) => {
            v4.is_loopback()          // 127.0.0.0/8
            || v4.is_private()        // 10/8, 172.16/12, 192.168/16
            || v4.is_link_local()     // 169.254.0.0/16
            || v4.is_broadcast()      // 255.255.255.255
            || v4.is_unspecified()    // 0.0.0.0
        }
        IpAddr::V6(v6) => {
            v6.is_loopback()          // ::1
            || is_unique_local(v6)    // fc00::/7
            || v6.is_unicast_link_local() // fe80::/10
            || v6.is_unspecified()    // ::
        }
    }
}
```

**Key invariants:**
- DNS resolution MUST occur immediately before connection establishment, not cached
- ALL resolved addresses must pass the blocklist check; one blocked address blocks delivery
- `allow_local` flag bypasses the check entirely; logged at `WARN` on each use
- DNS failure (`NXDOMAIN`, timeout) → delivery fails (logged at `WARN`); not treated as SSRF

**`SsrfError` Enum Definition:**

```rust
/// Error type returned by `check_ssrf()`.
/// Defined in `devs-webhook::ssrf`.
#[derive(Debug, thiserror::Error)]
pub enum SsrfError {
    /// The URL has no host component (e.g., bare IP without scheme).
    #[error("ssrf: URL has no host component")]
    NoHost,

    /// DNS lookup failed (NXDOMAIN, network error, timeout).
    #[error("ssrf: DNS resolution failed: {0}")]
    DnsFailure(String),

    /// DNS lookup succeeded but returned zero A/AAAA records.
    #[error("ssrf: DNS returned no records for hostname")]
    DnsNoRecords,

    /// A resolved IP address falls within a blocked range.
    #[error("ssrf: resolved address {ip} is in blocked range ({reason})")]
    BlockedAddress {
        ip: IpAddr,
        reason: &'static str,
    },
}

/// Classify why an IP is blocked (for error messages and logging).
fn classify_blocked_range(addr: &IpAddr) -> &'static str {
    match addr {
        IpAddr::V4(v4) if v4.is_loopback()    => "loopback (127.0.0.0/8)",
        IpAddr::V4(v4) if v4.is_private()     => "private network (RFC 1918)",
        IpAddr::V4(v4) if v4.is_link_local()  => "link-local (169.254.0.0/16)",
        IpAddr::V4(v4) if v4.is_broadcast()   => "broadcast",
        IpAddr::V4(v4) if v4.is_unspecified() => "unspecified (0.0.0.0)",
        IpAddr::V6(v6) if v6.is_loopback()    => "loopback (::1)",
        IpAddr::V6(v6) if v6.is_unspecified() => "unspecified (::)",
        _ /* unique-local or link-local IPv6 */=> "private/link-local IPv6",
    }
}
```

**SSRF — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-101 | Webhook URL `http://webhook.example.com` resolves to `192.168.1.100` via DNS | SSRF check blocks: `BlockedAddress { ip: 192.168.1.100, reason: "private network (RFC 1918)" }`; delivery permanently failed (no retry); `WARN` logged |
| EC-SEC-102 | DNS rebinding: first resolution returns public IP (passes check), second returns `127.0.0.1` | Each delivery attempt performs a fresh DNS resolution; second attempt blocked at `SSRFCheck` state |
| EC-SEC-103 | Webhook URL uses `https://` scheme but resolves to `::1` (IPv6 loopback) | Blocked: `BlockedAddress { ip: ::1, reason: "loopback (::1)" }`; TLS scheme does not exempt from SSRF check |
| EC-SEC-104 | `server.allow_local_webhooks = true` and URL resolves to `127.0.0.1` | `is_blocked()` returns `false`; delivery proceeds; `WARN "allow_local_webhooks is enabled; SSRF check bypassed for 127.0.0.1"` logged |
| EC-SEC-105 | Webhook hostname resolves to both `1.2.3.4` (public) and `10.0.0.1` (private) | Both addresses checked; `10.0.0.1` triggers `BlockedAddress`; delivery blocked even though one address was safe |

### 4.8 Webhook Delivery State Machine

```mermaid
stateDiagram-v2
    [*] --> Enqueued : webhook_tx.send(event)

    Enqueued --> ResolvingDNS : dispatcher picks up event

    ResolvingDNS --> SSRFCheck : DNS resolved
    ResolvingDNS --> DeliveryFailed : DNS failure (NXDOMAIN / timeout)

    SSRFCheck --> Delivering : all IPs pass blocklist
    SSRFCheck --> DeliveryBlocked : any IP in blocked range

    DeliveryBlocked --> [*] : WARN logged; no retry (config error)

    Delivering --> DeliverySuccess : HTTP 2xx received within 10s
    Delivering --> DeliveryFailed : timeout / non-2xx / connection error

    DeliverySuccess --> [*] : DEBUG logged

    DeliveryFailed --> WaitBackoff : attempt < max_retries + 1
    DeliveryFailed --> Dropped : attempt >= max_retries + 1

    WaitBackoff --> ResolvingDNS : backoff elapsed (fixed: 5s, 15s, 60s...)
    Dropped --> [*] : WARN logged; event permanently lost
```

**Backoff schedule for webhook retries:**

| Attempt | Wait Before Next |
|---|---|
| 1 (immediate) | 0s |
| 2 | 5s |
| 3 | 15s |
| 4+ | `min(15 × (N-1), 60)s` |

Maximum total attempts = `max_retries + 1` (default: 4 attempts).

### 4.9 Section 4 Acceptance Criteria

**4.9.1 Injection Prevention (§4.1)**

- **[AC-SEC-4-001]** A stage prompt containing `{{stage.upstream.stdout}}` where `upstream` produces output with the literal string `{{workflow.input.secret}}`: the downstream agent receives `{{workflow.input.secret}}` verbatim, not the value of `workflow.input.secret`. Single-pass expansion verified by inspecting the prompt file or `--print` argument passed to the agent.
- **[AC-SEC-4-002]** An agent subprocess spawned by the `claude` adapter with a prompt containing `; cat /etc/passwd` receives the full string as the value of the `--print` argument; no shell execution occurs. Verified by asserting the `tokio::process::Command` `args` list contains the exact prompt string as a single element.
- **[AC-SEC-4-003]** A template variable referencing `{{stage.X.stdout}}` where stage X is not in the current stage's transitive `depends_on` closure causes the stage to transition to `Failed` with `TemplateError::UnreachableStage`; no agent subprocess is spawned.
- **[AC-SEC-4-004]** A template variable referencing `{{stage.X.output.nested_field}}` where `nested_field` is a JSON object (not a scalar) causes the stage to transition to `Failed` with `TemplateError::NonScalarField`.
- **[AC-SEC-4-005]** A `prompt_file` value of `"../../etc/hosts"` is rejected at workflow validation with `invalid_argument: prompt_file path contains '..' segment`; no file read occurs.
- **[AC-SEC-4-006]** A prompt containing `{{stage.X.stdout}}` where X's stdout is 20,000 bytes results in the downstream prompt containing only the last 10,240 bytes of X's stdout; a `WARN` log event with `event_type: "template.truncated"` is emitted.
- **[AC-SEC-4-007]** `.devs_output.json` with `{"success": "true"}` (string, not boolean) causes the stage to transition to `Failed`; `get_stage_output` returns `structured` containing the parsed object and `exit_code` from the process.
- **[AC-SEC-4-008]** `.devs_output.json` with 129 levels of JSON nesting causes `structured_output_parse_error: nesting depth limit exceeded`; stage transitions to `Failed`.
- **[AC-SEC-4-009]** A stage env key of `DEVS_LISTEN` is rejected at workflow validation with `invalid_argument: env key 'DEVS_LISTEN' is reserved`. A stage env key of `FOO=BAR` is rejected with `invalid_argument: env key 'FOO=BAR' contains invalid characters`.

**4.9.2 OWASP Mitigations (§4.2)**

- **[AC-SEC-4-010]** On server startup with `server.listen = "0.0.0.0:7890"`, a `WARN` log event is emitted with message containing `"server.listen"` and `"non-loopback"`. The server starts normally; the warning does not abort startup.
- **[AC-SEC-4-011]** On server startup with a `devs.toml` containing `MY_API_KEY = "sk-..."`, a `WARN` log event is emitted with message containing `"API key"` or `"token"`. The key value itself is NOT present in the log output.
- **[AC-SEC-4-013]** `cargo audit --deny warnings` exits 0 on the unmodified repository (no known advisories in current dependency set at build time).
- **[AC-SEC-4-014]** `./do lint` exits non-zero when `cargo audit` reports any advisory at `WARN` or higher severity. When `audit.toml` contains a suppression entry with an expired `expires` date, `cargo audit` exits non-zero.
- **[AC-SEC-4-015]** `cargo tree -p devs-core --edges normal` output does not contain `tokio`, `git2`, `reqwest`, or `tonic` — verifying the zero-I/O-dependency invariant of `devs-core` (**[ARCH-AC-009]**).
- **[AC-SEC-4-016]** `cargo tree` output for a production build does not contain `openssl`, `openssl-sys`, or `native-tls` as crate names.
- **[AC-SEC-4-017]** `workflow_snapshot.json` is written exactly once per run (before first stage transition). Attempting to write it again (e.g., via a second concurrent `submit_run` with the same `run_id`) returns an error from `devs-checkpoint`; the original file is not overwritten.

**4.9.3 Denial of Service Protections (§4.3)**

- **[AC-SEC-4-018]** An MCP HTTP request with `Content-Length: 1048577` (1 MiB + 1 byte) receives HTTP 413 with body `{"result":null,"error":"invalid_argument: request body exceeds 1 MiB limit"}`.
- **[AC-SEC-4-019]** A workflow submitted with 257 stages is rejected with `invalid_argument` before any run is created; `list_runs` shows no new run.
- **[AC-SEC-4-020]** A fan-out stage with `count = 65` is rejected at validation with `invalid_argument: fan_out.count must be between 1 and 64; got 65`.
- **[AC-SEC-4-021]** When 64 concurrent MCP HTTP requests are active simultaneously, a 65th request is accepted (not refused); it may block on lock acquisition for up to 5 seconds before returning a response.
- **[AC-SEC-4-022]** A `StreamRunEvents` gRPC stream that is not consuming events (slow client) does not block the DAG scheduler from advancing; the oldest buffered event is silently dropped when the 257th event is enqueued for that client.

**4.9.4 Input Validation (§4.4)**

- **[AC-SEC-4-023]** A `BoundedString<128>` field submitted with 129 UTF-8 bytes is rejected at MCP `submit_run` with HTTP 200 and `"error": "invalid_argument: ..."` before any run is created; `list_runs` shows no new run.
- **[AC-SEC-4-024]** `submit_run` with an extra input key not declared in the workflow returns `invalid_argument: unknown input key '<name>'`; no run is created.
- **[AC-SEC-4-025]** `submit_run` with a `boolean` input value of the string `"1"` returns `invalid_argument: cannot coerce '1' to boolean`; values `"true"` and `"false"` (lowercase strings) are accepted.
- **[AC-SEC-4-026]** A webhook `secret` shorter than 32 bytes is rejected at project registration with `invalid_argument: webhook secret must be at least 32 bytes`.
- **[AC-SEC-4-027]** A project registered with `weight = 0` is rejected with `invalid_argument: project weight must be at least 1`.
- **[AC-SEC-4-028]** An `AgentPool` configured with `max_concurrent = 1025` is rejected at server startup config validation with a clear error before any port is bound.

**4.9.5 Supply Chain Security (§4.5)**

- **[AC-SEC-4-029]** `./do lint` exits non-zero when a `Cargo.toml` in the workspace declares a dependency not present in the TAS authoritative version table; the error message names the specific crate and version.
- **[AC-SEC-4-030]** `./do lint` exits non-zero when `reqwest` is found with `native-tls` feature enabled; exits 0 when `reqwest` is `rustls-tls` only.
- **[AC-SEC-4-031]** `audit.toml` with an `expires` date in the past causes `./do lint` to exit non-zero with a message referencing the specific advisory ID and the expired date.
- **[AC-SEC-4-032]** `cargo grep unsafe` (or equivalent) across all workspace `.rs` files returns zero matches (no `unsafe` blocks in authored code).

**4.9.6 Credential Redaction (§4.6)**

- **[AC-SEC-4-033]** `Redacted<String>` formats as `"[REDACTED]"` in both `{:?}` (Debug) and `{}` (Display) format specifiers. Unit test: `assert_eq!(format!("{:?}", Redacted("secret")), "[REDACTED]")`.
- **[AC-SEC-4-034]** When a webhook delivery event is logged at `WARN` with the `secret` field, the JSON log output contains `"secret": "[REDACTED]"`, not the actual secret value.
- **[AC-SEC-4-035]** When the server starts with an `ANTHROPIC_API_KEY` environment variable set, that value does NOT appear in any log line at any level, including `DEBUG` and `TRACE`.

**4.9.7 SSRF Mitigation (§4.7)**

- **[AC-SEC-4-036]** A webhook configured with URL `http://192.168.1.1/hook` is NOT delivered; `WARN` log event is emitted with `"ssrf"` in the message and reason `"private network (RFC 1918)"`; no retry is attempted (blocked at SSRF check, not delivery failure).
- **[AC-SEC-4-037]** A webhook configured with URL `http://localhost/hook` is NOT delivered; blocked with reason `"loopback (127.0.0.0/8)"`. With `server.allow_local_webhooks = true`, delivery IS attempted and a `WARN` log is emitted indicating the SSRF check was bypassed.
- **[AC-SEC-4-038]** Each webhook delivery attempt performs a fresh DNS resolution; a hostname that resolves to different IPs on successive calls is re-checked on each retry. (Verified by mocking DNS to return a private IP on the second resolution; second delivery attempt is blocked.)
- **[AC-SEC-4-039]** A webhook URL whose hostname resolves to both a public IP and `10.0.0.1` is blocked; the `SsrfError::BlockedAddress` error identifies the specific blocked IP and its range classification.

---

## 5. Logging, Monitoring & Audit Trails

### 5.1 Structured Logging Architecture

**[SEC-084]** All logging MUST use the `tracing` crate with structured key-value fields. `println!`, `eprintln!`, and `log::` macros are prohibited in library crates (**[ARCH-BR-008]**). Log output is formatted as newline-delimited JSON (`tracing-subscriber` with `json` format) for machine consumption, or human-readable text for interactive use. The output format is controlled by the `DEVS_LOG_FORMAT` environment variable (`json` or `text`; default `text`).

**[SEC-085]** Log verbosity is controlled by `RUST_LOG` environment variable using `tracing-subscriber`'s `env-filter`. Default production log level: `INFO`. The `DEBUG` and `TRACE` levels MUST NOT produce output in release builds by default, as they may include sensitive data (template variable values, stage outputs) for debugging purposes.

**[SEC-098]** The `tracing-subscriber` is initialized exactly once at server startup and MUST NOT be re-initialized at runtime. Log level and format changes require a server restart. The subscriber MUST be configured with: `env-filter` driven by `RUST_LOG` (default: `info`), the formatter selected by `DEVS_LOG_FORMAT`, all output directed to `stderr`, and timestamps in RFC 3339 format with millisecond precision.

**Log configuration environment variables:**

| Variable | Values | Default | Description |
|---|---|---|---|
| `RUST_LOG` | `tracing-subscriber` filter directives | `info` | Log level and per-crate overrides (e.g., `info,devs_scheduler=debug`) |
| `DEVS_LOG_FORMAT` | `json` \| `text` | `text` | Output format: `json` = NDJSON for machine parsing; `text` = human-readable |
| `DEVS_LOG_TIMESTAMPS` | `utc` \| `local` \| `off` | `utc` | Timestamp style in `text` mode only; `json` mode always emits UTC RFC 3339 |

**Log level semantics:**

| Level | Usage |
|---|---|
| `ERROR` | Unrecoverable error requiring operator attention (checkpoint write failure, port bind failure) |
| `WARN` | Recoverable abnormal condition (stage failure, webhook retry, security misconfiguration, rate limit) |
| `INFO` | Normal significant events forming the audit trail (stage dispatch, run completion, server startup) |
| `DEBUG` | Detailed diagnostic information; may include template resolved values; not safe for production use |
| `TRACE` | Extremely verbose; state machine transitions, lock acquisitions, individual buffer writes; never for production |

**`tracing` span hierarchy.** The server creates a span tree propagated through async tasks via `Instrument::instrument()`. All log events emitted within a span automatically inherit the span's key-value fields in the `span` JSON object.

```mermaid
graph TD
    A["server span\nversion, listen_addr, mcp_port"] --> B["run span\nrun_id, workflow_name, project_id"]
    B --> C["stage span\nstage_name, attempt, pool_name"]
    C --> D["agent span\nagent_tool, execution_env, pid"]
    A --> E["grpc_request span\nrequest_id, method"]
    A --> F["mcp_request span\nrequest_id, tool_name"]
    A --> G["retention_sweep span\nsweep_id"]
```

All `tracing::info!`, `warn!`, and `error!` calls within a stage executor task carry `run_id`, `stage_name`, and `attempt` automatically via the enclosing span, without requiring each call site to pass these values explicitly. Cross-crate async calls inherit the span via `tokio`'s task-local storage when using `.instrument(span)`.

**[SEC-099]** Log output is written to `stderr` exclusively. The server MUST NOT write operational log output to any file path. Stage output (agent stdout/stderr) is written to dedicated log files at `.devs/logs/`. These are distinct streams that MUST NOT be mixed.

**Structured Logging — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-103 | `DEVS_LOG_FORMAT=json` and `RUST_LOG=trace` | `TRACE` events appear in NDJSON output with full span context; operator assumes responsibility for sensitive data exposure at this level |
| EC-SEC-104 | `RUST_LOG` contains invalid directive (e.g., `RUST_LOG=invalid:::filter`) | `tracing-subscriber` falls back to `info` level; emits one `WARN` at startup: `"RUST_LOG parse error: ...; falling back to INFO"` |
| EC-SEC-105 | Server receives `SIGTERM` while a `WARN` log event is being written | `tracing` serializes output writes via internal mutex; partial log lines are impossible in JSON format (each event is a complete JSON object terminated by `\n`); in-flight event completes before shutdown proceeds |
| EC-SEC-106 | Two concurrent stage executor tasks emit log events simultaneously | `tracing-subscriber` serializes output writes via internal mutex; log events are never interleaved within a JSON line; event ordering between concurrent tasks is non-deterministic but each event is complete |
| EC-SEC-107 | `DEVS_LOG_FORMAT` set to an unrecognized value (e.g., `xml`) | Server reports config error to `stderr` before binding ports: `"invalid DEVS_LOG_FORMAT 'xml'; expected 'json' or 'text'"` and exits non-zero |

---

### 5.2 Mandatory Audit Events

**[SEC-086]** The following events MUST be logged at the specified level with structured fields, forming the audit trail. Each log entry MUST include: `timestamp` (RFC 3339 with ms precision), `event_type`, `run_id` (where applicable), `project_id` (where applicable), and `actor` (see complete enum below).

**Actor field — complete enumeration:**

| Actor Value | Description | Source |
|---|---|---|
| `"grpc_client"` | Any gRPC connection (no per-client identity at MVP) | gRPC interceptor |
| `"mcp_client"` | Any MCP HTTP connection | MCP request handler |
| `"scheduler"` | DAG Scheduler making autonomous scheduling decisions | `devs-scheduler` crate |
| `"agent"` | Orchestrated agent calling back via MCP mid-run | `report_progress`, `signal_completion`, `report_rate_limit` handlers |
| `"system"` | Server-internal events with no external actor (startup, shutdown, retention sweep) | `devs-server` crate |
| `"executor"` | Stage Executor performing environment setup and teardown | `devs-executor` crate |
| `"webhook"` | Webhook Dispatcher making outbound HTTP calls | `devs-webhook` crate |

The `actor` field is a plain string. At MVP there is no per-connection identity; all gRPC clients share the `"grpc_client"` actor label and all MCP HTTP clients share `"mcp_client"`. Events that result from fully internal autonomous decisions (retry scheduling, dependency evaluation) use `"scheduler"` or `"executor"`.

**Complete mandatory audit event table:**

| Event | Required Fields | Level |
|---|---|---|
| Server startup | `listen_addr`, `mcp_port`, `version` | `INFO` |
| Server shutdown | `reason` (`sigterm`\|`ctrl_c`), `active_runs_count` | `INFO` |
| `submit_run` accepted | `run_id`, `slug`, `workflow_name`, `project_id`, `actor` | `INFO` |
| `submit_run` rejected | `workflow_name`, `project_id`, `error`, `actor` | `WARN` |
| Run started (Pending→Running) | `run_id`, `slug`, `workflow_name`, `project_id` | `INFO` |
| Run completed | `run_id`, `slug`, `duration_ms` | `INFO` |
| Run failed | `run_id`, `slug`, `failed_stage`, `duration_ms` | `WARN` |
| Run cancelled | `run_id`, `slug`, `actor` | `INFO` |
| Run paused | `run_id`, `slug`, `actor` | `INFO` |
| Run resumed | `run_id`, `slug`, `actor` | `INFO` |
| Stage dispatched | `run_id`, `stage_name`, `attempt`, `agent_tool`, `pool_name`, `execution_env` | `INFO` |
| Stage completed | `run_id`, `stage_name`, `attempt`, `exit_code`, `duration_ms` | `INFO` |
| Stage failed | `run_id`, `stage_name`, `attempt`, `exit_code`, `failure_reason` | `WARN` |
| Stage timed out | `run_id`, `stage_name`, `attempt`, `timeout_secs` | `WARN` |
| Stage cancelled | `run_id`, `stage_name`, `attempt`, `actor` | `INFO` |
| Stage paused | `run_id`, `stage_name`, `attempt`, `actor` | `INFO` |
| Stage resumed | `run_id`, `stage_name`, `attempt`, `actor` | `INFO` |
| Stage retry scheduled | `run_id`, `stage_name`, `attempt`, `next_attempt`, `backoff_secs` | `INFO` |
| Rate limit detected | `pool_name`, `agent_tool`, `run_id`, `stage_name`, `cooldown_until` | `WARN` |
| Pool exhausted | `pool_name`, `queued_count` | `WARN` |
| Pool recovered | `pool_name` | `INFO` |
| Webhook delivery failed | `webhook_id`, `url` (redacted), `attempt`, `status_code`, `error` | `WARN` |
| Webhook delivery succeeded | `webhook_id`, `event_type`, `attempt` | `DEBUG` |
| Webhook SSRF blocked | `webhook_id`, `url`, `resolved_ip`, `reason` | `WARN` |
| Security misconfiguration | `check_id`, `detail` | `WARN` |
| Credential found in TOML | `key_name` (key name only, never value) | `WARN` |
| Path traversal attempt | `path`, `actor` | `WARN` |
| Checkpoint written | `run_id`, `commit_sha` | `INFO` |
| Checkpoint write failure | `run_id`, `error` | `ERROR` |
| Checkpoint recovered | `run_id`, `recovered_stage_count`, `action` | `INFO` |
| Checkpoint corrupt | `run_id`, `error` | `ERROR` |
| Retention sweep started | `sweep_id` | `INFO` |
| Retention sweep completed | `sweep_id`, `runs_deleted`, `bytes_freed` | `INFO` |
| Project registered | `project_id`, `name`, `repo_path`, `actor` | `INFO` |
| Project removed | `project_id`, `name`, `actor` | `INFO` |

**[SEC-087]** Webhook URLs logged in audit events MUST have query parameters redacted. The URL is logged as `<scheme>://<host><path>?<redacted>`. This prevents logging of API keys or tokens accidentally placed in webhook query strings by operators. If the URL has no query parameters, it is logged as-is.

**[SEC-100]** Audit event field validation: `run_id` fields MUST be lowercase-hyphenated UUID4; `attempt` fields MUST be ≥ 1; `duration_ms` fields MUST be ≥ 0. Log events containing invalid field values (caused by internal bugs) are emitted anyway but include an additional `"field_validation_error": true` field to enable filtering.

**Mandatory Audit Events — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-108 | `submit_run` accepted, then server crashes before run transitions to Running | `run.submitted` event is emitted before the crash; `run.started` is NOT emitted; recovery emits `checkpoint.recovered` event on next startup |
| EC-SEC-109 | Stage fails and retries; attempt 3 succeeds | Seven audit events total: `stage.dispatched` ×3, `stage.failed` ×2, `stage.retry_scheduled` ×2, `stage.completed` ×1; each carries the correct `attempt` value |
| EC-SEC-110 | `cancel_run` called on an already-cancelled run | MUST NOT emit a second `run.cancelled` event; gRPC returns `FAILED_PRECONDITION`; no audit entry for the rejected no-op |
| EC-SEC-111 | Server shuts down during stage execution | `server.shutdown` event emitted first with `active_runs_count > 0`; then per-stage `stage.cancelled` events are emitted as agents receive the cancel signal via stdin |
| EC-SEC-112 | Startup retention sweep fires while periodic 24-hour sweep timer also triggers | Second sweep detects first is in-progress via per-project sweep mutex; logs `INFO`: `"retention sweep already in progress; skipping"`; no double-deletion |

---

### 5.3 Audit Log Entry Schema

Every structured audit log entry emitted by `tracing` in JSON format MUST conform to the following schema. The `tracing-subscriber` JSON formatter is used as-is; this schema describes the semantic content that all call sites MUST emit.

```json
{
  "timestamp": "2026-03-11T10:00:00.123Z",
  "level": "INFO",
  "target": "devs_scheduler::dag",
  "span": {
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "project_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "stage_name": "implement-api",
    "attempt": 1
  },
  "fields": {
    "event_type": "stage.dispatched",
    "agent_tool": "claude",
    "pool_name": "primary",
    "execution_env": "tempdir",
    "message": "Stage dispatched"
  }
}
```

**Top-level field definitions:**

| Field | Type | Constraints | Required | Description |
|---|---|---|---|---|
| `timestamp` | string | RFC 3339, ms precision, `Z` suffix | Always | Wall-clock time via `chrono::Utc::now()` |
| `level` | string | One of `"TRACE"`, `"DEBUG"`, `"INFO"`, `"WARN"`, `"ERROR"` | Always | `tracing` severity level |
| `target` | string | Rust module path (e.g., `"devs_scheduler::dag"`) | Always | Code location emitting the event |
| `span` | object | Key-value pairs from enclosing spans; may be empty `{}` | Always | Span context (run_id, stage_name, etc.) |
| `fields` | object | Event-specific; MUST include `event_type` and `message` | Always | Event payload |

**`fields` object — universal required sub-fields:**

| Sub-field | Type | Constraints | Description |
|---|---|---|---|
| `event_type` | string | Value from registry table below | Machine-stable identifier for programmatic log filtering |
| `message` | string | Non-empty, human-readable English | Summary for human log readers |
| `actor` | string | One of the actor enum values | Who triggered the event; omitted for fully internal scheduler events with no external actor |

**Complete event type registry (exhaustive for MVP):**

| `event_type` | Description | Minimum `fields` Beyond Universal |
|---|---|---|
| `server.started` | Server accepting connections | `listen_addr`, `mcp_port`, `version` |
| `server.shutdown` | Graceful shutdown initiated | `reason`, `active_runs_count` |
| `run.submitted` | `submit_run` accepted | `run_id`, `slug`, `workflow_name`, `project_id`, `actor` |
| `run.rejected` | `submit_run` rejected before creation | `workflow_name`, `project_id`, `error`, `actor` |
| `run.started` | Scheduler transitions run Pending→Running | `run_id`, `slug`, `workflow_name` |
| `run.completed` | All stages completed successfully | `run_id`, `slug`, `duration_ms` |
| `run.failed` | Run reached Failed terminal state | `run_id`, `slug`, `failed_stage`, `duration_ms` |
| `run.cancelled` | `cancel_run` applied atomically | `run_id`, `slug`, `actor` |
| `run.paused` | `pause_run` applied | `run_id`, `slug`, `actor` |
| `run.resumed` | `resume_run` applied | `run_id`, `slug`, `actor` |
| `stage.dispatched` | Stage assigned to agent pool slot | `run_id`, `stage_name`, `attempt`, `agent_tool`, `pool_name`, `execution_env` |
| `stage.completed` | Stage in Completed terminal state | `run_id`, `stage_name`, `attempt`, `exit_code`, `duration_ms` |
| `stage.failed` | Stage in Failed state | `run_id`, `stage_name`, `attempt`, `exit_code`, `failure_reason` |
| `stage.timed_out` | Stage exceeded per-stage timeout | `run_id`, `stage_name`, `attempt`, `timeout_secs` |
| `stage.cancelled` | Stage in Cancelled state | `run_id`, `stage_name`, `attempt`, `actor` |
| `stage.paused` | Stage received `devs:pause\n` via stdin | `run_id`, `stage_name`, `attempt`, `actor` |
| `stage.resumed` | Stage received `devs:resume\n` via stdin | `run_id`, `stage_name`, `attempt`, `actor` |
| `stage.retry_scheduled` | Retry backoff started after failure | `run_id`, `stage_name`, `attempt`, `next_attempt`, `backoff_secs` |
| `pool.exhausted` | All agents in pool unavailable | `pool_name`, `queued_count` |
| `pool.recovered` | At least one pool agent available again | `pool_name` |
| `pool.rate_limited` | Agent placed in 60-second rate-limit cooldown | `pool_name`, `agent_tool`, `cooldown_until` |
| `webhook.delivered` | HTTP 2xx received from webhook endpoint | `webhook_id`, `event_type`, `attempt` |
| `webhook.delivery_failed` | All retry attempts exhausted | `webhook_id`, `url` (redacted), `final_error` |
| `webhook.ssrf_blocked` | Delivery blocked: URL resolves to blocked address | `webhook_id`, `url`, `resolved_ip`, `reason` |
| `security.misconfiguration` | Startup security check emits advisory | `check_id`, `detail` |
| `security.path_traversal` | Filesystem MCP path traversal rejected | `path`, `actor` |
| `checkpoint.written` | Checkpoint git commit succeeded | `run_id`, `commit_sha` |
| `checkpoint.write_failed` | Checkpoint git commit failed | `run_id`, `error` |
| `checkpoint.recovered` | Run state restored from checkpoint on startup | `run_id`, `recovered_stage_count`, `action` |
| `checkpoint.corrupt` | Checkpoint file unreadable or schema version mismatch | `run_id`, `error` |
| `retention.sweep.started` | Retention sweep begins execution | `sweep_id` |
| `retention.sweep.completed` | Retention sweep finished | `sweep_id`, `runs_deleted`, `bytes_freed` |
| `project.registered` | Project added to registry via `devs project add` | `project_id`, `name`, `repo_path`, `actor` |
| `project.removed` | Project removed from registry via `devs project remove` | `project_id`, `name`, `actor` |

**Example log entries for key event types:**

*`run.submitted`:*
```json
{
  "timestamp": "2026-03-11T10:00:01.000Z",
  "level": "INFO",
  "target": "devs_grpc::run_service",
  "span": { "project_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8" },
  "fields": {
    "event_type": "run.submitted",
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "slug": "feature-20260311-a1b2",
    "workflow_name": "feature",
    "project_id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
    "actor": "grpc_client",
    "message": "Run submitted"
  }
}
```

*`stage.failed`:*
```json
{
  "timestamp": "2026-03-11T10:02:45.321Z",
  "level": "WARN",
  "target": "devs_executor::local",
  "span": {
    "run_id": "550e8400-e29b-41d4-a716-446655440000",
    "stage_name": "implement-api",
    "attempt": 2
  },
  "fields": {
    "event_type": "stage.failed",
    "exit_code": 1,
    "failure_reason": "non_zero_exit",
    "duration_ms": 45321,
    "message": "Stage failed with exit code 1"
  }
}
```

*`security.misconfiguration`:*
```json
{
  "timestamp": "2026-03-11T09:59:58.000Z",
  "level": "WARN",
  "target": "devs_config::security",
  "span": {},
  "fields": {
    "event_type": "security.misconfiguration",
    "check_id": "SEC-TOML-CRED",
    "detail": "Credential key 'CLAUDE_API_KEY' found in devs.toml; use environment variables instead",
    "message": "Security misconfiguration detected"
  }
}
```

**[SEC-101]** The `event_type` field MUST use only the values from the registry table above. Custom `event_type` values are prohibited in `devs` production code. Internal diagnostic `tracing` events not in the registry MUST use `level: "DEBUG"` or `level: "TRACE"` so they are suppressed in production by default.

---

### 5.4 Credential Redaction in Logs

**[SEC-088]** Log fields containing credential values MUST be redacted. Implementors MUST use a custom `tracing` field type `Redacted<T>` (defined in `devs-core/src/redacted.rs`) that implements `fmt::Debug` and `fmt::Display` as `"[REDACTED]"`. This type MUST be applied to:
- Webhook `secret` fields in all log events and struct `Debug` impls
- Any field with a name matching the case-insensitive suffixes `_api_key`, `_token`, `_secret`, `_password`
- SSH private key content or file paths containing key material

**`Redacted<T>` type definition** (in `devs-core/src/redacted.rs`):

```rust
use std::fmt;

/// Wraps a sensitive value and prevents it from appearing in log output.
/// All `Debug`, `Display`, and `Serialize` implementations produce `"[REDACTED]"`.
/// The inner value is accessible only through `into_inner()`.
#[derive(Clone)]
pub struct Redacted<T>(T);

impl<T> Redacted<T> {
    /// Wrap a sensitive value.
    pub fn new(value: T) -> Self {
        Self(value)
    }

    /// Consume the wrapper and return the inner value.
    /// All `into_inner()` call sites MUST have a code comment explaining the exposure.
    pub fn into_inner(self) -> T {
        self.0
    }
}

impl<T> fmt::Debug for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("[REDACTED]")
    }
}

impl<T> fmt::Display for Redacted<T> {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str("[REDACTED]")
    }
}

impl<T: serde::Serialize> serde::Serialize for Redacted<T> {
    fn serialize<S: serde::Serializer>(&self, s: S) -> Result<S::Ok, S::Error> {
        s.serialize_str("[REDACTED]")
    }
}
```

**[SEC-102]** `Redacted<T>` MUST implement `serde::Serialize` as the literal string `"[REDACTED]"`. This ensures that if a `Redacted<T>` value is accidentally included in a JSON-serialized response (webhook payload, MCP result, checkpoint JSON), it produces `"[REDACTED]"` instead of the underlying value. The inner value MUST NOT be reachable through the `Serialize` implementation.

**[SEC-089]** Stage stdout and stderr MUST NOT be included in `tracing` log output at any level. Stage output is written to dedicated log files at `.devs/logs/<run-id>/<stage>/attempt_<N>/stdout.log` and `stderr.log`. Structured log events MUST reference the log file path (`log_path` field), never the content.

**Startup credential detection algorithm** (runs during `devs.toml` parsing, before port binding):

```
FOR each (key, value) in devs.toml flat key-value pairs:
  IF key matches regex (?i)(_api_key|_token|_secret|_password)$:
    emit WARN event_type="security.misconfiguration"
         check_id="SEC-TOML-CRED"
         detail="Credential key '<key>' found in devs.toml; use environment variables instead"
    # The value is NOT included in the log entry under any circumstances
```

This scan is advisory: the server starts (with `WARN`) even when credentials are found in TOML, as per **[SEC-058]**. The detection is based on key name patterns only; values are never examined for content.

**Credential Redaction — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-113 | Field named `api_key_hint` (does not end with `_api_key`) | NOT auto-redacted by naming convention; must be explicitly wrapped in `Redacted<T>` if it holds a sensitive value |
| EC-SEC-114 | `Redacted<String>` wraps an empty string | `Debug`/`Display`/`Serialize` all produce `"[REDACTED]"`; empty string is treated identically to any non-empty value |
| EC-SEC-115 | Developer passes `Redacted<T>` to `tracing::info!` field without explicit format specifier | The `Display` impl of `Redacted` produces `"[REDACTED]"`; correct behavior regardless of whether `%`, `?`, or no format is used |
| EC-SEC-116 | Webhook `secret` field inside a `WebhookTarget` struct that is `Debug`-printed in a `TRACE` log | `secret: Option<Redacted<String>>`; `Debug` output shows `secret: Some([REDACTED])`; inner value never exposed at any log level |
| EC-SEC-117 | `into_inner()` called in a code path that could reach a `tracing` sink | Code review policy: all `into_inner()` call sites MUST have a `// SAFETY: credential exposed to <reason>` comment; a custom `clippy` lint (in `./do lint`) warns on bare `into_inner()` usage lacking this comment |

---

### 5.5 Log Injection Mitigation

**[SEC-090]** When writing stage stdout/stderr to log files, content MUST be written verbatim (binary-safe) to the log file without any parsing or interpretation. ANSI escape sequences are NOT stripped from raw log files; stripping occurs only in the TUI display layer. This preserves full forensic fidelity while preventing log injection from interfering with the log pipeline.

**[SEC-091]** JSON-formatted structured logs from `tracing-subscriber` inherently prevent log injection by serializing all field values as JSON strings with proper escaping of `"`, `\n`, `\r`, and control characters. Newlines within a single log event MUST be escaped as `\n` in the JSON output, never emitted as literal newlines that would split a log record. This is guaranteed by the `tracing-subscriber` JSON formatter without additional intervention.

**[SEC-103]** Log field values that exceed 64 KiB in a single `tracing` event field are truncated to 64 KiB with `" ...[TRUNCATED: N bytes]"` appended. Stage output is always referenced via a `log_path` field (never inlined), so this limit primarily constrains error message strings and validation error arrays.

**[SEC-104]** Tracing span context MUST NOT include any user-controlled string that has not been validated against a known-safe character set. Fields used in span context and their validated character sets:

| Span Field | Validated Character Set | Validation Point |
|---|---|---|
| `run_id` | UUID4 lowercase-hyphenated `[0-9a-f-]` | Generated internally; never user-provided raw |
| `stage_name` | `[a-z0-9_-]+`, max 128 bytes | Workflow validation at definition parse |
| `workflow_name` | `[a-z0-9_-]+`, max 128 bytes | Workflow validation at definition parse |
| `pool_name` | `[a-z0-9_-]+` | Config validation at startup |
| `project_id` | UUID4 lowercase-hyphenated | Generated at `devs project add` |

Fields accepting arbitrary user-controlled strings (e.g., run `slug`, `message` content) are included only in the `fields` object, where JSON serialization handles escaping automatically.

**Log Injection — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-096 | Agent stdout contains `}\n{"level":"ERROR","message":"fake"}` | Written verbatim to `stdout.log`; `tracing` NDJSON output has no such line because the server never routes agent output through `tracing` |
| EC-SEC-097 | Agent stderr contains ANSI OSC terminal title sequence `\x1b]0;title\x07` | Written verbatim to `stderr.log`; TUI renders it stripped via `strip-ansi-escapes`; raw file preserved for forensic use |
| EC-SEC-098 | `stage_name` contains a newline character | `stage_name` is validated to `[a-z0-9_-]+` at workflow definition parse time; newlines cause a `ValidationError::InvalidStageName` rejection before the run is created |
| EC-SEC-099 | `run_id` submitted by a client in uppercase letters | UUID input from users (e.g., in `GetRun` RPC) is normalized to lowercase at deserialization; the normalized form is used in all log events |
| EC-SEC-118 | Agent stdout contains null bytes (`\x00`) | Written verbatim to `stdout.log` via binary-safe file write; `tracing` JSON never receives this content; log file is forensically valid though not valid UTF-8 |
| EC-SEC-119 | A `tracing` field value is a Rust `String` containing `{"level":"ERROR"}` | `tracing-subscriber` JSON formatter serializes this as a JSON string: `"fields": { "message": "{\"level\":\"ERROR\"}" }`; the embedded JSON is escaped and never parsed as a separate log event |

---

### 5.6 Log Retention and Access

**[SEC-092]** Stage log files in `.devs/logs/` are subject to the same retention policy as checkpoint data: `max_age_days` (default 30) and `max_size_mb` (default 500). Retention sweeps occur at startup (after checkpoint recovery) and on a 24-hour periodic timer. Logs of active (`Running` or `Paused`) runs MUST NOT be deleted during a sweep.

**[SEC-093]** Log files MUST be created with mode `0600` (owner read/write only) on Unix systems. Parent directories MUST be created with mode `0700` (owner only). On Windows, directory ACLs are not set by `devs` at MVP; this is documented as a deployment caveat requiring operators to configure appropriate ACLs. The intent is that no local user other than the server process owner can read stage output files.

**[SEC-094]** The `tracing` process-level log output (server operational logs) is written to `stderr` by default. Operators SHOULD redirect `stderr` to a log aggregation system in production. Log rotation of stage output files is handled by the retention sweep; process-level log rotation is the operator's responsibility.

**Complete file and directory permission model:**

| Path | Unix Mode | Creation Trigger |
|---|---|---|
| `.devs/` | `0700` | Server startup if absent |
| `.devs/logs/` | `0700` | Server startup if absent |
| `.devs/runs/` | `0700` | Server startup if absent |
| `.devs/logs/<run-id>/` | `0700` | Run creation |
| `.devs/logs/<run-id>/<stage>/` | `0700` | Stage dispatch |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/` | `0700` | Stage attempt start |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/stdout.log` | `0600` | Agent spawn (before exec) |
| `.devs/logs/<run-id>/<stage>/attempt_<N>/stderr.log` | `0600` | Agent spawn (before exec) |
| `.devs/runs/<run-id>/workflow_snapshot.json` | `0600` | Before first stage dispatched |
| `.devs/runs/<run-id>/checkpoint.json` | `0600` | Each state transition (atomic write) |
| `.devs/runs/<run-id>/stages/<stage>/attempt_<N>/structured_output.json` | `0600` | Stage completion with `structured_output` mechanism |

**[SEC-105]** On server startup, if `.devs/` exists with a mode that does not include `0700`, `devs` MUST attempt `chmod 0700` before proceeding. If `chmod` fails (e.g., owned by a different user), the server logs `WARN` with `event_type: "security.misconfiguration"` and `check_id: "SEC-FILE-PERM"` and proceeds anyway (to allow crash recovery of in-flight runs).

**Retention sweep algorithm:**

The sweep MUST NOT run concurrently with itself for the same project. A per-project boolean `sweep_in_progress` flag protected by a `Mutex` gates entry. The sweep runs at startup and then every 24 hours via `tokio::time::interval`.

```
FUNCTION run_retention_sweep(project_id, max_age_days, max_size_mb):
  IF NOT sweep_mutex[project_id].try_lock():
    LOG INFO "retention sweep already in progress; skipping"
    RETURN
  LOG INFO event_type="retention.sweep.started" sweep_id=<uuid4>

  all_runs = load_checkpoint_metadata_for_project(project_id)
  active_runs = filter(all_runs, status IN {Running, Paused})
  terminal_runs = all_runs - active_runs
  deleted = []

  // Phase 1: Age-based deletion
  cutoff = now() - max_age_days * 86400s
  FOR run IN terminal_runs WHERE run.completed_at < cutoff:
    delete_run_atomically(run.run_id)      // removes .devs/runs/<id>/ and .devs/logs/<id>/ together
    git_commit(checkpoint_branch, "devs: sweep run {run.run_id} (age)")
    deleted.append(run.run_id)

  // Phase 2: Size-based deletion
  remaining = terminal_runs - deleted
  SORT remaining BY completed_at ASC       // oldest first
  total_bytes = measure_devs_dir_bytes()
  max_bytes = max_size_mb * 1024 * 1024
  FOR run IN remaining:
    IF total_bytes <= max_bytes: BREAK
    freed = estimate_run_size_bytes(run.run_id)
    delete_run_atomically(run.run_id)
    git_commit(checkpoint_branch, "devs: sweep run {run.run_id} (size)")
    deleted.append(run.run_id)
    total_bytes -= freed

  LOG INFO event_type="retention.sweep.completed"
       sweep_id=<same uuid4>
       runs_deleted=len(deleted)
       bytes_freed=<computed sum>
  sweep_mutex[project_id].unlock()
```

`delete_run_atomically` removes `.devs/runs/<run-id>/` and `.devs/logs/<run-id>/` as a single git tree update before committing, ensuring no partial deletion is ever committed.

**Log Retention — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-100 | Retention sweep checks a run whose status just transitioned to Running in a concurrent task | Sweep acquires read lock on `SchedulerState` to check status; active run check uses the same lock; `Running` runs are never in the deletion candidate set |
| EC-SEC-101 | Single run's logs exceed `max_size_mb` with no other runs present | Sweep deletes the single run (it is the only candidate) and logs `WARN`: `"single run exceeds max_size_mb; deleting run <id>"`; `bytes_freed` equals the actual run size |
| EC-SEC-102 | `stdout.log` cannot be written to after creation (disk full) | `ERROR` logged with `event_type: "checkpoint.write_failed"`; stage log file write failure is non-fatal to the stage; stage continues but `stdout.log` will be empty or partial; `StageOutput.truncated` set to `true` |
| EC-SEC-121 | `max_age_days = 0` is set in `devs.toml` | Config validation rejects this at startup: `"retention.max_age_days must be >= 1"`; server does not start |
| EC-SEC-122 | `completed_at` is null in a terminal-state run checkpoint (internal bug) | Run is treated as if `completed_at = epoch` (smallest possible timestamp); it becomes the first candidate in size-based deletion; `WARN` logged: `"run {id} missing completed_at; treating as oldest"` |

---

### 5.7 Stage Log File Lifecycle

Stage log files have a well-defined lifecycle distinct from the `tracing`-based operational log stream. Understanding this lifecycle is required for correct implementation of `devs-executor` and `devs-checkpoint`.

**Lifecycle state machine:**

```mermaid
stateDiagram-v2
    [*] --> Creating: Stage transitions to Running (agent spawn imminent)
    Creating --> Open: Directories and files created (mode 0600/0700)
    Open --> Writing: Agent process spawned; executor writes output lines concurrently
    Writing --> Closed: Agent process exits (any outcome: success, failure, timeout, cancel)
    Closed --> Committed: StageOutput recorded in checkpoint.json; log_path set
    Committed --> Available: LogService.FetchLogs and stream_logs serve from memory + disk
    Available --> Swept: Retention sweep deletes run directory atomically
    Swept --> [*]
    Creating --> CreationFailed: File creation fails (disk full, permission error)
    CreationFailed --> [*]: Stage set to Failed without spawning agent; ERROR logged
```

**File creation sequence (before agent spawn):**

`devs-executor` MUST perform the following steps in order before invoking the agent binary:
1. Create directory `.devs/logs/<run-id>/<stage-name>/attempt_<N>/` with mode `0700` (creating all parent directories with mode `0700` as needed)
2. Open `stdout.log` with `O_CREAT | O_WRONLY | O_TRUNC`, mode `0600`
3. Open `stderr.log` with `O_CREAT | O_WRONLY | O_TRUNC`, mode `0600`
4. If either step fails: emit `ERROR` log, transition stage to `Failed`, do NOT spawn agent
5. Spawn agent with stdout and stderr piped to tokio async readers

**Concurrent writing model:**

The executor writes each agent output line to two sinks concurrently and independently:

```
Agent Process stdout
      |
      v
tokio::io::AsyncBufReadExt::lines()
      |
      +---> in-memory BoundedBytes<1_048_576> ring buffer
      |       Evicts oldest bytes when full; sets truncated=true
      |       Feeds TUI log tail and get_stage_output response
      |
      +---> tokio::fs::File write (unbounded on disk)
              Feeds LogService.FetchLogs for full forensic log
              Feeds stream_logs from disk for completed stages
```

**[SEC-106]** The disk write MUST NOT be blocked by the in-memory buffer write and vice versa. If the disk write fails (disk full), the in-memory buffer continues; the stage does not fail solely due to a log write error. If the in-memory buffer is full (1 MiB exceeded), only the buffer evicts data; the disk file continues receiving all output.

**`StageOutput.log_path` field:** Set to the relative directory path from the project root: `.devs/logs/<run-id>/<stage-name>/attempt_<N>/`. This is a directory, not a file path; callers specify `stream: "stdout"` or `stream: "stderr"` when requesting log content.

**[SEC-107]** On retry (attempt N > 1), a new `attempt_<N>/` directory is created with new empty log files. The previous attempt's log files MUST NOT be overwritten. Both remain independently accessible via `get_stage_output(run_id, stage_name, attempt=N)`.

**Stage Log File Lifecycle — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-124 | Agent produces no output (empty stdout and stderr) | `stdout.log` and `stderr.log` are created with zero bytes; `StageOutput.stdout` = `""` (empty string, not `null`); `truncated: false` |
| EC-SEC-125 | Agent produces exactly 1,048,576 bytes of stdout | In-memory buffer is exactly full; `truncated: false` (limit not exceeded); disk file contains exactly 1,048,576 bytes; identical content in both sinks |
| EC-SEC-126 | Agent produces 1,048,577 bytes of stdout | In-memory buffer evicts oldest byte; newest 1,048,576 bytes retained; `truncated: true`; disk file contains all 1,048,577 bytes; disk provides the full forensic view |
| EC-SEC-127 | `stream_logs(follow: true)` client disconnects mid-stream | `devs-mcp` releases the `broadcast::Receiver` within 500ms of disconnect detection; disk file and in-memory buffer are unaffected; a subsequent reconnect starts a new stream from sequence number 1 (no server-side resumption) |
| EC-SEC-128 | Stage log directory is deleted externally between server restarts | `checkpoint.recovered` event emits with `action: "log_dir_missing"`; stage is still recovered to `Eligible`; `get_stage_output` returns `"error": "not_found: log directory not found"` for that attempt |

---

### 5.8 Log Correlation and Request Tracing

Correlating log events across server components — gRPC handler, scheduler, executor, pool manager, checkpoint store — is essential for diagnosing failures in multi-stage concurrent runs. `devs` provides two complementary correlation mechanisms: `tracing` span propagation and explicit `request_id` fields.

**Request ID propagation:**

**[SEC-108]** Every gRPC unary response MUST include a `request_id` field (UUID4, lowercase-hyphenated) in its response proto message. Every MCP tool call response MUST include `"request_id": "<uuid>"` in the `result` JSON object. All `tracing` log events emitted within the scope of that request handler carry this `request_id` in the enclosing `grpc_request` or `mcp_request` span.

```mermaid
flowchart LR
    A["gRPC SubmitRun\n(client request)"] --> B["Handler:\nrequest_id = UUID4()"]
    B --> C["tracing::span! created\nwith request_id"]
    C --> D["scheduler.submit() called\n(inherits span via Instrument)"]
    D --> E["checkpoint write\n(inherits span)"]
    D --> F["webhook dispatch\n(inherits span)"]
    C --> G["gRPC response\nincludes request_id"]
    E --> H["LOG INFO checkpoint.written\nspan.request_id = UUID"]
    D --> I["LOG INFO run.submitted\nspan.request_id = UUID"]
```

**Run and stage span context propagation:**

The scheduler creates a `tracing::Span` at run creation and instruments all async tasks spawned for that run via `.instrument(run_span.clone())`. Stage executor tasks are instrumented with a child `stage_span`. This ensures all log events within a run's execution automatically carry `run_id` and `stage_name` in the `span` JSON object without per-call-site overhead.

```mermaid
graph TD
    A["server_span\nversion, listen_addr"] --> B["run_span\nrun_id, project_id, workflow_name"]
    B --> C1["stage_span: plan\nstage_name='plan', attempt=1"]
    B --> C2["stage_span: implement-api\nstage_name='implement-api', attempt=1"]
    C1 --> D1["agent_span\nagent_tool='claude', pid=12345"]
    C2 --> D2["agent_span\nagent_tool='opencode', pid=12346"]
    A --> E["grpc_request_span\nrequest_id=<uuid>, method='SubmitRun'"]
    A --> F["mcp_request_span\nrequest_id=<uuid>, tool='get_run'"]
```

**[SEC-109]** Log events emitted outside any run span (startup, retention sweep, responses to `list_runs`) have an empty `span` object `{}`. This is not an error; these events are identifiable by their `event_type` prefix (`server.*`, `retention.*`, `project.*`).

**Cross-component correlation example:**

A failing stage with one retry produces the following log chain, all filterable by `"run_id":"550e8400-..."`:

```
[INFO]  run.submitted         run_id=550e..., slug=feature-20260311-a1b2, request_id=aabb...
[INFO]  run.started           run_id=550e...
[INFO]  stage.dispatched      run_id=550e..., stage_name=plan, attempt=1, agent_tool=claude
[WARN]  stage.failed          run_id=550e..., stage_name=plan, attempt=1, exit_code=1
[INFO]  stage.retry_scheduled run_id=550e..., stage_name=plan, attempt=1, next_attempt=2, backoff_secs=5
[INFO]  stage.dispatched      run_id=550e..., stage_name=plan, attempt=2
[WARN]  stage.failed          run_id=550e..., stage_name=plan, attempt=2, exit_code=1
[WARN]  run.failed            run_id=550e..., slug=feature-20260311-a1b2, failed_stage=plan
```

A log aggregation query for `span.run_id = "550e8400-e29b-41d4-a716-446655440000"` retrieves the complete causal history from all components without requiring knowledge of which internal modules were involved.

**[SEC-110]** The `list_checkpoints` MCP tool returns `commit_sha` values for each checkpoint commit. These SHAs can be used with the Filesystem MCP `read_file` to read the exact `checkpoint.json` state at any historical point, providing a time-series view of state transitions that complements the structured log stream.

**Log Correlation — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-129 | `request_id` in gRPC response does not appear in any log line (handler returned on fast-path validation error) | The `run.rejected` `WARN` event still carries `request_id` in its `span` if the request span was entered before validation; if validation fails before span entry, `request_id` appears only in the response message |
| EC-SEC-130 | Two concurrent gRPC requests for the same `run_id` emit overlapping log events | Both carry distinct `request_id` values in their `grpc_request` span; both carry the same `run_id` in the `run` span; log consumers can distinguish by `span.request_id` |
| EC-SEC-131 | Client ignores the returned `request_id` | The ID is informational; the server does not require clients to reference it; no behavior change on the server |
| EC-SEC-132 | MCP `get_run` called while a stage is actively writing a checkpoint in a concurrent tokio task | `get_run` holds a read lock on `SchedulerState`; checkpoint write holds a write lock briefly during the `rename(2)` swap; log events from both operations appear in the log with the same `run_id` but different `request_id` values in their respective spans |

---

### 5.9 Monitoring and Alerting

**[SEC-095]** The following conditions MUST be detectable from the structured log stream and SHOULD trigger operator alerts in production environments. The `devs` server does not implement a built-in alerting engine; operators use external log aggregation systems (Grafana Loki, Elasticsearch, Datadog, etc.) that consume the structured JSON log stream.

**Alert conditions, thresholds, and recommended cooldowns:**

| Condition | Detection Signal | Threshold | Severity | Suggested Cooldown |
|---|---|---|---|---|
| Repeated stage failures | `event_type: "stage.failed"` per `project_id` | ≥ 5 events in any rolling 5-minute window | HIGH | 15 minutes |
| Pool exhaustion | `event_type: "pool.exhausted"` | Any occurrence | MEDIUM | 10 minutes (one per episode) |
| Repeated webhook failures | `event_type: "webhook.delivery_failed"` per `webhook_id` | ≥ 3 events per hour | MEDIUM | 1 hour |
| Checkpoint write failure | `event_type: "checkpoint.write_failed"` | Any occurrence | HIGH | 5 minutes |
| Corrupt checkpoint on recovery | `event_type: "checkpoint.corrupt"` | Any occurrence | HIGH | 5 minutes |
| Security misconfiguration | `event_type: "security.misconfiguration"` | Any occurrence at startup | HIGH | Until server restart |
| Path traversal attempt | `event_type: "security.path_traversal"` | Any occurrence | CRITICAL | 0 (alert on every occurrence) |
| SSRF webhook attempt | `event_type: "webhook.ssrf_blocked"` | Any occurrence | CRITICAL | 0 (alert on every occurrence) |
| Rate limit cascade (pool exhausted after multiple rate limits) | `pool.exhausted` following `pool.rate_limited` events | Any occurrence | HIGH | 10 minutes |
| Dependency advisory detected | `cargo audit` output in `./do lint` CI job | Any advisory | HIGH | Until patched |

**[SEC-096]** The outbound webhook system provides a native monitoring integration: operators MAY configure a `state.changed` webhook target pointing to their alerting system to receive all state transitions in real time. The webhook payload is signed with HMAC-SHA256 (**[SEC-021]**) allowing the receiver to verify event origin. This approach delivers events with lower latency than polling a log aggregation system and is the recommended production monitoring integration.

**Stage failure rate — detection query pattern:**

The stage failure rate is computed at the log aggregation layer. The intended query pattern for JSON-format log streams:

```
SELECT count(*) AS failure_count, span.project_id
FROM structured_logs
WHERE fields.event_type = 'stage.failed'
  AND timestamp > now() - 5m
GROUP BY span.project_id
HAVING failure_count >= 5
```

This query is not implemented inside `devs`; it is defined here as the canonical detection pattern for operators configuring their monitoring systems.

**Alert state machine** (per alert condition per scope — operators implement this in their alerting system):

```mermaid
stateDiagram-v2
    [*] --> Normal
    Normal --> Alerting: Threshold exceeded
    Alerting --> Fired: Alert delivered to operator
    Fired --> Suppressed: Within cooldown period
    Suppressed --> Fired: New threshold breach after cooldown
    Suppressed --> Normal: Condition clear for full cooldown period with no new occurrence
    Normal --> Normal: Condition not met (no transition)
```

**[SEC-111]** The `pool.exhausted` event fires at most once per exhaustion episode (**[3_PRD-BR-026]**, **[2_TAS-BR-WH-003]**). An exhaustion episode begins when all agents in a pool are simultaneously unavailable and ends when at least one becomes available again (signalled by `pool.recovered`). This prevents alert floods during prolonged pool unavailability. Operators SHOULD use `pool.recovered` to auto-resolve pool exhaustion alerts.

**Monitoring and Alerting — Edge Cases:**

| Case | Trigger | Expected Behavior |
|---|---|---|
| EC-SEC-133 | Pool exhaustion occurs and then 3 agents recover simultaneously | `pool.exhausted` fired exactly once at episode start; `pool.recovered` fired once when the first agent becomes available; no additional events for subsequent agent recoveries in the same episode |
| EC-SEC-134 | Operator's monitoring webhook target itself becomes unavailable | `devs` retries webhook delivery per **[2_TAS-REQ-144]** (max `max_retries` attempts); after exhaustion logs `webhook.delivery_failed`; server continues normal operation; run state is unaffected |
| EC-SEC-135 | `state.changed` webhook generates high event volume during a 64-instance fan-out | Each sub-agent transition fires a `state.changed` event; at 64 sub-agents × ~5 transitions = ~320 webhook POSTs per stage; operators running high fan-out SHOULD use a specific event filter (e.g., `run.completed` only) rather than `state.changed` |
| EC-SEC-136 | Multiple `security.misconfiguration` events at startup (multiple credential keys in TOML) | One event per detected credential key; no deduplication; each event has a distinct `detail` field identifying the specific key name; all are emitted before port binding |

---

### 5.10 Test Coverage Requirements for Security Controls

**[SEC-097]** Every security control in this document that is enforced in code MUST have at least one automated test annotated `// Covers: SEC-NNN`. The following controls MUST have dedicated E2E tests (not unit tests) to satisfy QG-003/004/005.

**Required E2E and integration tests:**

| Control | Test Interface | Test Description |
|---|---|---|
| **[SEC-036]** SSRF blocklist enforcement | MCP E2E | Configure webhook URL targeting `127.0.0.1`; trigger delivery; verify `"webhook.ssrf_blocked"` in JSON log; verify no outbound TCP connection to that address |
| **[SEC-040]** Single-pass template expansion | MCP E2E | Submit workflow where stage A output contains `{{workflow.input.name}}`; verify stage B receives the literal string unchanged, not a recursively expanded value |
| **[SEC-044]** No shell interpolation in agent spawn | Unit (adapter) | Assert that `AdapterCommand` populates `Command::args()` as a `Vec<String>` and does not construct a shell command string; inspect spawned args vector directly |
| **[SEC-050]** String `"success"` rejected | MCP E2E | `inject_stage_input` with `{"success": "true"}` (string value); verify stage transitions to `Failed`; verify `stage.failed` audit event with `failure_reason: "invalid_structured_output"` |
| **[SEC-060]** `cargo audit` in `./do lint` | Integration | Create a test Cargo workspace with a crate depending on a known-advisory version; run `./do lint`; assert exit code is non-zero and stderr contains advisory description |
| **[SEC-088]** Credential redaction in logs | Unit | Three assertions: `format!("{:?}", Redacted("sk-ant-secret")) == "[REDACTED]"`; `format!("{}", Redacted("sk-ant-secret")) == "[REDACTED]"`; `serde_json::to_string(&Redacted("sk-ant-secret")).unwrap() == "\"[REDACTED]\""` |
| **[SEC-093]** Log file permissions | Integration | After a stage completes, `fs::metadata("stdout.log").permissions().mode() & 0o777 == 0o600`; same check for `stderr.log`; same check for containing directories with `0o700` |
| **[SEC-019]** Filesystem MCP write denial for `.devs/runs/` | MCP E2E | `write_file` to `.devs/runs/<uuid>/test.json` returns `"error": "permission_denied: ..."` with HTTP 200 |
| **[SEC-091]** JSON log newline escaping | Unit | Write a `tracing` event with a field containing a literal `\n` character; capture `stderr` output; parse each line as JSON; assert exactly one JSON object per line; assert the field value contains `\\n` not a raw newline |
| **[SEC-108]** `request_id` in responses | CLI E2E | `devs submit --format json` output contains `"request_id"` with UUID4 format matching `[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}` |
| **[SEC-084]** No `println!` in library crates | CI (lint) | `./do lint` fails if any `crates/devs-{core,config,checkpoint,adapters,pool,executor,scheduler,webhook,grpc,mcp}/src/` file contains `println!` or `eprintln!` |
| **[SEC-100]** Audit event required fields | Unit | Assert that a workflow run through a full success path produces JSON log events where every event of type `run.*` contains `run_id` (non-null, UUID4 format) and every event of type `stage.*` contains `stage_name` (non-null, non-empty) |

**[SEC-112]** Test annotations MUST correspond to genuine behavioral coverage. A test that calls `Redacted::new()` and asserts `Debug` output covers **[SEC-088]**. A test that merely imports `Redacted` without asserting behavior at an interface boundary does NOT satisfy the coverage requirement.

**[SEC-113]** File permission tests (**[SEC-093]**) MUST run on all three CI platforms. On Windows, the test asserts that the file is created and the test documents that mode `0o600` is not enforced, emitting a `WARN` log: `"file permission enforcement not supported on Windows; .devs/ directory security relies on OS-level ACLs"`.

---

### 5.11 Component Dependencies

This section depends on and is depended upon by the following components:

| Direction | Component | Dependency |
|---|---|---|
| **This section depends on** | `devs-core` | `BoundedString<N>`, `EnvKey`, `Redacted<T>`, `StateMachine` trait definitions |
| **This section depends on** | `devs-checkpoint` | Atomic checkpoint write (`write-tmp-rename`), file mode enforcement, git commit authorship |
| **This section depends on** | `devs-mcp` | SSRF blocklist check, path traversal enforcement, lock-timeout enforcement, `request_id` generation |
| **This section depends on** | `devs-webhook` | HMAC-SHA256 signing, SSRF blocklist, at-least-once retry backoff, `pool.exhausted` dedup |
| **This section depends on** | `devs-adapters` | `EnvKey` validation, prompt temp-file cleanup, PTY fail-fast, span context injection into agent env |
| **This section depends on** | `devs-executor` | Working directory isolation, log file creation and concurrent writing, artifact collection scope |
| **This section depends on** | `devs-config` | Credential pattern detection in `devs.toml`, file permission checks at startup |
| **This section depends on** | `devs-scheduler` | Run and stage span lifecycle management, event emission ordering relative to state transitions |
| **This section depends on** | `tracing` (0.1) | Structured event emission, span tree, `Instrument` trait |
| **This section depends on** | `tracing-subscriber` (0.3) | JSON and text formatters, `env-filter`, output sink wiring |
| **Depended upon by** | TAS §4 | Security controls inform crate API design; `Redacted<T>` must be in `devs-core` (zero I/O) |
| **Depended upon by** | MCP Design §4 | Debugging procedures must not bypass `Redacted<T>`; `request_id` used for log correlation |
| **Depended upon by** | User Features §8 | Agentic development must respect path and tool boundaries; E2E tests verify log content |
| **Depended upon by** | `./do lint` | `cargo audit`, dep-version audit, no-`println!` check all enforce controls from this section |
| **Depended upon by** | GitLab CI | CI pipelines consume `DEVS_LOG_FORMAT=json` output for machine-readable artifact parsing |

---

### 5.12 Section 5 Acceptance Criteria

- **[AC-SEC-5-001]** Every `tracing` log event in JSON format (`DEVS_LOG_FORMAT=json`) contains top-level fields `timestamp`, `level`, `target`, `span`, and `fields`. The `fields` object contains `event_type` (non-null string) and `message` (non-null string). Verified by running a standard workflow run and parsing every line of server `stderr` output as JSON with no parse errors.

- **[AC-SEC-5-002]** When `devs.toml` contains `CLAUDE_API_KEY = "test"`, server startup emits a `WARN` log entry with `event_type: "security.misconfiguration"` and `check_id: "SEC-TOML-CRED"`. The string `"test"` does NOT appear anywhere in the server's `stderr` output. Verified by grep on captured stderr after startup.

- **[AC-SEC-5-003]** Stage `stdout.log` and `stderr.log` files are created with Unix permissions `0o600`. Verified by `fs::metadata(path).permissions().mode() & 0o777 == 0o600` in an integration test after a stage completes.

- **[AC-SEC-5-004]** The parent directory `.devs/logs/` and all intermediate directories up to `attempt_<N>/` are created with Unix permissions `0o700`. Verified by the same mechanism as AC-SEC-5-003.

- **[AC-SEC-5-005]** An agent that prints `CLAUDE_API_KEY=sk-ant-secret` to stdout: the string `sk-ant-secret` appears in `.devs/logs/<run-id>/<stage>/attempt_1/stdout.log` AND does NOT appear in any line of the server's `tracing` log output. Verified by grep on both the log file and captured server `stderr`.

- **[AC-SEC-5-006]** After running `./do test`, `target/traceability.json` contains `covered: true` entries for `SEC-036`, `SEC-040`, `SEC-044`, `SEC-050`, `SEC-060`, `SEC-088`, `SEC-091`, `SEC-108`. Verified by parsing `target/traceability.json`.

- **[AC-SEC-5-007]** A webhook URL `https://example.com/hook?token=secret` is logged in all audit events referencing that webhook as `https://example.com/hook?<redacted>`. The string `"secret"` does NOT appear in any log line. Verified by configuring such a webhook, triggering a delivery, and grepping server `stderr` output.

- **[AC-SEC-5-008]** Retention sweep at startup deletes all runs whose `completed_at` is older than `max_age_days` but does NOT delete any run currently in `Running` or `Paused` status. Verified by a test that: (a) starts a run, (b) stops the server, (c) manually ages `completed_at` in checkpoint JSON for other terminal runs, (d) restarts the server, (e) confirms only the aged runs are absent.

- **[AC-SEC-5-009]** `format!("{:?}", Redacted("test"))` returns `"[REDACTED]"`. `format!("{}", Redacted("test"))` returns `"[REDACTED]"`. `serde_json::to_string(&Redacted("test")).unwrap()` returns `"\"[REDACTED]\""`. All three assertions pass in a dedicated unit test annotated `// Covers: SEC-088`.

- **[AC-SEC-5-010]** Every gRPC unary response proto contains a non-null `request_id` field in UUID4 lowercase-hyphenated format. `devs submit --format json` output contains `"request_id"` matching the regex `[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}`. Verified in a CLI E2E test annotated `// Covers: SEC-108`.

- **[AC-SEC-5-011]** A workflow with two stages dispatched concurrently produces log events where (a) both `stage.dispatched` events carry the same `run_id` in their `span` object, (b) each carries a distinct `stage_name`, and (c) each carries `attempt: 1`. Verified by parsing JSON log output from a parallel-stage workflow E2E test.

- **[AC-SEC-5-012]** `DEVS_LOG_FORMAT=invalid` causes the server to write an error to `stderr` and exit non-zero before binding any TCP ports. Verified by spawning the server binary with this env var and asserting: exit code is non-zero AND the `~/.config/devs/server.addr` discovery file does NOT exist.

- **[AC-SEC-5-013]** A stage that produces 1,048,577 bytes of stdout output has `StageOutput.truncated == true` and `StageOutput.stdout.len() == 1_048_576` (in-memory cap), while the on-disk `stdout.log` file has size ≥ 1,048,577 bytes. Verified in an integration test using a mock agent binary that writes a controlled byte count.

- **[AC-SEC-5-014]** After a `cancel_run`, no `stage.dispatched`, `stage.completed`, or `stage.failed` audit events appear in the log for stages that were in `Waiting` or `Eligible` state at the time of cancellation. Verified by parsing the complete JSON log stream in a CLI E2E test that cancels a multi-stage run mid-flight.

- **[AC-SEC-5-015]** `./do lint` exits non-zero if any source file in `crates/devs-{core,config,checkpoint,adapters,pool,executor,scheduler,webhook,grpc,mcp}/src/` contains an invocation of `println!` or `eprintln!`. Verified by injecting `println!("test");` into `devs-core/src/lib.rs`, running `./do lint`, and asserting exit code is non-zero with the offending file and line reported on `stderr`.

- **[AC-SEC-5-016]** A `stream_logs(follow: true)` HTTP client that disconnects mid-stream causes the server to release all associated resources (`broadcast::Receiver`, log file read handle) within 500ms of disconnect detection. Verified by an integration test that connects, reads one line, drops the connection, and then asserts that a per-connection resource counter decrements within the 500ms window.

---

*End of Security Design*
