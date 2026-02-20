### **[REQ-SEC-THR-001]** The "Trojan Requirement"
- **Type:** Security
- **Description:** An agent, influenced by malicious research, distills a requirement that seems valid (e.g., "Add health check endpoint") but includes a hidden backdoor (e.g., `eval(req.query.cmd)`).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-THR-002]** Supply Chain Poisoning
- **Type:** Security
- **Description:** The agent is tricked into choosing a "typosquatted" or malicious library during the Tech Landscape phase because it lacked a live "reputation check."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-THR-003]** Recursive Resource Drain
- **Type:** Security
- **Description:** An agent generates code that creates millions of tiny files or spawns thousands of processes within the sandbox to perform a local DoS.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-THR-004]** Verification Bypass
- **Type:** Security
- **Description:** An agent writes both the implementation *and* a "fake" test that passes regardless of the actual logic, tricking the Reviewer Agent.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-001]** Spoofing Mitigation
- **Type:** Security
- **Description:** Multi-agent signatures; Orchestrator-controlled agent identity.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-002]** Tampering Mitigation
- **Type:** Security
- **Description:** Checksum verification of AOD files before agent ingestion.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-003]** Repudiation Mitigation
- **Type:** Security
- **Description:** Persistent SAOP traces linked to Git commit hashes.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-004]** Info Disclosure Mitigation
- **Type:** Security
- **Description:** Mandatory `SecretMasker` on all sandbox streams.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-005]** DoS Mitigation
- **Type:** Security
- **Description:** Hard resource quotas (2 cores, 4GB) and 300s timeouts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-STR-006]** Privilege Escalation Mitigation
- **Type:** Security
- **Description:** `ignore-scripts` flag; no-exec `/tmp` in sandbox.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-001]** Sandbox Escape (WebContainers)
- **Type:** Security
- **Description:** The maturity of WebContainer isolation compared to Docker is an unknown for complex C-extension based Node modules.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-002]** Token Redaction Lag
- **Type:** Security
- **Description:** If the `SecretMasker` is too slow, it may introduce latency in the "Green-Phase" of the TDD loop.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-QST-001]** Local-only Models Support
- **Type:** Security
- **Description:** Determine if we should support "Local-only" models to eliminate the Level 0 (External Service) trust risk for enterprise users.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-QST-002]** Host-Aware Agents Handling
- **Type:** Security
- **Description:** Determine how to handle "Host-Aware" agents that need to know the specific OS (Darwin vs. Linux) for implementation without leaking sensitive host details.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-010]** Dedicated User Context
- **Type:** Technical
- **Description:** The orchestrator MUST run under a non-privileged local user account. It MUST explicitly fail and exit if executed with `root` or `sudo` privileges (UID 0 check on startup).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-011]** Directory Hardening
- **Type:** Technical
- **Description:** The `.devs/` state directory MUST be initialized with `0700` (drwx------) permissions. On every startup, the orchestrator MUST verify that no other local user has read/write access and abort if permissions are loose.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-014]** IPC Security (CLI <-> Extension)
- **Type:** Technical
- **Description:** Communication between the VSCode extension and the CLI logic MUST use a secure local Unix Socket or Named Pipe. Every session MUST utilize a unique, ephemeral 128-bit Handshake Token to prevent local cross-process hijack attempts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-015]** Environment Isolation
- **Type:** Technical
- **Description:** The orchestrator MUST sanitize its own environment variables before spawning sandboxes. Sensitive host variables (e.g., `AWS_ACCESS_KEY_ID`, `KUBECONFIG`) MUST be stripped from the agent's view.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-012]** Role-Based Scoping (RBAC)
- **Type:** Technical
- **Description:** Agents must have granular permissions based on their role: ResearcherAgent (discovery only), DeveloperAgent (workspace access), ReviewerAgent (read-only/test execution).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-013]** Tool Call Validation & Schema Enforcement
- **Type:** Technical
- **Description:** Every MCP tool call MUST be validated against a strict JSON schema. If an agent attempts to pass an undefined argument, the `ToolProxy` MUST reject the call and log a security violation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-016]** Phase-Specific Permission Escalation
- **Type:** Technical
- **Description:** Permissions are dynamic. Research tools are revoked during Phase 4 (Implementation) to minimize the attack surface for prompt injection.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-017]** Argument Sanitization (Anti-Injection)
- **Type:** Technical
- **Description:** Shell tool calls MUST accept arguments as an array of strings. Paths MUST be resolved to absolute paths and verified to be within the `/workspace` subtree.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-019]** Host Keychain Integration
- **Type:** Technical
- **Description:** All API keys (Gemini, Serper, GitHub) MUST be stored in the host's native secure storage (macOS Keychain, Linux Secret Service, Windows Credential Manager).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-020]** Zero-Persistence Secret Policy
- **Type:** Technical
- **Description:** Secrets injected into the sandbox for specific tasks MUST be provided via ephemeral environment variables that are scrubbed from all logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-021]** Ephemeral GitHub/VCS Tokens
- **Type:** Technical
- **Description:** For Git operations, agents SHOULD use the host's existing `ssh-agent` or a short-lived GitHub App installation token. Credentials MUST NEVER be committed to the repository.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-022]** Mandatory Approval Junctions
- **Type:** Functional
- **Description:** The orchestrator state machine MUST implement hard blocks at Phase 2 (Architecture) and Phase 3 (Roadmap), requiring human approval signature to proceed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-023]** Immutable Architectural Sign-off
- **Type:** Functional
- **Description:** Once the TAS is approved, the Developer Agent is NOT authorized to modify core architectural files without a specific `ARCH_CHANGE_DIRECTIVE` from the user.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-024]** Directive Injection Authorization
- **Type:** Technical
- **Description:** Directives from the user are authorized mid-task. The orchestrator validates the session before injecting the directive into the agent's memory.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-025]** Default-Secure Auth Boilerplate
- **Type:** Technical
- **Description:** Projects requiring authentication MUST be generated with industry-standard defaults: Argon2 hashing, 15-minute JWT rotation, and HttpOnly/Secure/SameSite cookies.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-026]** Agent-Oriented Debugging Auth
- **Type:** Technical
- **Description:** The internal MCP server in the generated project MUST only listen on `localhost` and require a 256-bit Bearer Token generated by the orchestrator.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-101]** Identity Spoofing (Agent-to-Agent)
- **Type:** Security
- **Description:** Mitigation: The Orchestration Engine tracks `thread_id` and role; refuses to transition a task if the same agent instance signs off as Reviewer.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-102]** Indirect Tool Invocation
- **Type:** Security
- **Description:** Mitigation: Strict delimiters in LLM prompts and CBAC enforcement at the `OrchestratorServer` IPC level.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-103]** Privilege Escalation via Dependencies
- **Type:** Security
- **Description:** Mitigation: Mandatory use of `--ignore-scripts` in the sandbox and restricted network egress during installation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-027]** Mandatory TLS 1.3
- **Type:** Technical
- **Description:** All outbound requests to external APIs MUST use TLS 1.3 (RFC 8446).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-028]** Cipher Suite Enforcement
- **Type:** Technical
- **Description:** Only AEAD-based cipher suites are permitted for external API communication.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-029]** Certificate Pinning
- **Type:** Technical
- **Description:** The orchestrator SHOULD implement certificate pinning for `generativelanguage.googleapis.com` to mitigate MITM attacks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-030]** Secure Web Scraping Egress
- **Type:** Technical
- **Description:** Research agents MUST default to `HTTPS` for all discovery tasks. Ingestion of `HTTP` content is blocked by default and requires explicit `USER_OVERRIDE`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-031]** CLI-to-Extension Handshake
- **Type:** Technical
- **Description:** Communication between the CLI and Extension MUST occur over an encrypted Unix Domain Socket (UDS) or Named Pipes with ACLs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-032]** Session Handshake
- **Type:** Technical
- **Description:** Each IPC session MUST begin with a 256-bit ephemeral handshake token passed via environment variables to the child process.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-033]** Localhost MCP Security
- **Type:** Technical
- **Description:** MCP servers listening on TCP MUST bind exclusively to `127.0.0.1` and require a Bearer token for every request.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-034]** Native Keychain Integration (EaR)
- **Type:** Technical
- **Description:** Secrets MUST NEVER be stored in plaintext. They MUST be stored using the host OS's secure credential manager (macOS Keychain, Linux Secret Service, Windows DPAPI).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-035]** Zero-Plaintext Config
- **Type:** Technical
- **Description:** The `config.json` and `.devs/state.sqlite` files MUST NOT contain any unencrypted API keys. References MUST use a URI-based lookup.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-036]** Filesystem Permission Hardening
- **Type:** Technical
- **Description:** The `.devs/` directory MUST be initialized with `0700` permissions. Individual database files MUST be set to `0600`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-037]** Vector Embedding Integrity
- **Type:** Technical
- **Description:** LanceDB files MUST be treated as high-confidentiality assets. Sensitive blobs in vector metadata SHOULD be encrypted using a project-specific master key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-038]** Pre-Persistence Redaction (SecretMasker)
- **Type:** Technical
- **Description:** `SecretMasker` middleware MUST apply regex and entropy-based redaction to all `stdout`/`stderr` before writing to logs or SQLite.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-039]** Reasoning Log Anonymization
- **Type:** Technical
- **Description:** Agent "thoughts" saved to SQLite MUST be scrubbed of any PII (User Name, System Paths, Localhost IPs) unless explicitly required.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-040]** Ephemeral Sandbox Environment
- **Type:** Technical
- **Description:** Secrets MUST NOT be passed directly to the Docker command line. They SHOULD be passed via secure `stdin` or encrypted ephemeral files with `0400` permissions.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-041]** Temporary Directory Isolation
- **Type:** Technical
- **Description:** The project's temporary directory MUST follow the `0700` permission policy and MUST be purged upon completion.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-042]** Master Key Derivation
- **Type:** Technical
- **Description:** A 256-bit project master key MUST be derived from the user's host keychain using PBKDF2-HMAC-SHA512 with 100k+ iterations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-043]** Ephemeral Sandbox Key Rotation
- **Type:** Technical
- **Description:** Every task execution in the Sandbox MUST use a new, ephemeral 128-bit session key for encryption.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-044]** Secure Deletion (devs purge)
- **Type:** Technical
- **Description:** The `purge` command MUST overwrite sensitive files with random data where possible before final removal from the filesystem.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-045]** Mandatory Ephemeral Isolation
- **Type:** Technical
- **Description:** All implementation, testing, and dependency resolution tasks MUST occur within a fresh, isolated sandbox (Docker or WebContainer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-046]** Hardened Runtime Configuration (Docker-specific)
- **Type:** Technical
- **Description:** Containers MUST run with capability stripping (`--cap-drop=ALL`), privilege limitation, PID limiting (128), and hard resource quotas (4GB RAM, 2 vCPUs).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-047]** Filesystem Isolation & Integrity
- **Type:** Technical
- **Description:** Immutable Root filesystem, isolated writable volumes (`/workspace`, `/tmp`), and `/tmp` mounted as `tmpfs` with `noexec,nosuid,nodev`. Shadow mounting to prevent access to `.git` and `.devs`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-048]** Network Egress & DNS Filtering
- **Type:** Technical
- **Description:** Default Deny network policy. Controlled egress via internal proxy for allow-listed domains (npm, github, pypi). DNS isolation using static mapping.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-049]** Multi-Tiered Redaction (LLM Safety)
- **Type:** Technical
- **Description:** All data passing through the `ToolProxy` MUST be processed by the `SecretMasker` to prevent leakage of secrets into LLM contexts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-050]** Phase 1: High-Entropy & Pattern Matching
- **Type:** Technical
- **Description:** Redaction using a library of 100+ patterns and Shannon Entropy detection for contiguous strings of 20+ characters.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-051]** Phase 2: Contextual Validation (Flash-Model)
- **Type:** Technical
- **Description:** Flagged strings are sent to a local `Gemini 3 Flash` instance to determine if they are legitimate secrets or safe artifacts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-052]** Phase 3: Replacement & Hashing
- **Type:** Technical
- **Description:** Detected secrets are replaced with deterministic placeholders: `[REDACTED_<TYPE>_<SHORT_HASH>]`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-053]** Input Redaction (Tool Call Protection)
- **Type:** Technical
- **Description:** `SecretMasker` inspects tool arguments *before* they are sent to the sandbox to prevent passing host secrets into shell commands.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-054]** Zero-Trust Dependency Management
- **Type:** Technical
- **Description:** Automated protection against typosquatting and malicious libraries during the dependency installation phase.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-055]** Mandatory Lockfile Enforcement
- **Type:** Technical
- **Description:** The `DependencyManager` tool MUST fail if a package is installed without generating/updating a lockfile.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-056]** Automated Vulnerability Gates
- **Type:** Technical
- **Description:** Every installation MUST be followed by an automated audit. Any "High" or "Critical" vulnerability MUST trigger a mandatory `ReviewerAgent` failure.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-057]** Script Execution Blocking
- **Type:** Technical
- **Description:** Package installations MUST use `--ignore-scripts` by default. Post-install scripts require manual user approval via `HITL_GATE`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-058]** Structured Argument Enforcement (Tool Call)
- **Type:** Technical
- **Description:** JSON Schema validation for all MCP tool calls. Shell sanitization using `argv` arrays. Path traversal protection via `resolveAndValidatePath()`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-059]** Atomic State Persistence
- **Type:** Technical
- **Description:** `.devs/state.sqlite` MUST use WAL and ACID transactions. Every state change MUST be verified for consistency.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-060]** Document Integrity Checksums
- **Type:** Technical
- **Description:** SHA-256 checksums for PRD and TAS verified before distillation and implementation. Manual edits require re-approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-061]** Vector Memory Sanitization
- **Type:** Technical
- **Description:** Long-term memory only updated with "Verified" decisions. Research data kept in separate, lower-trust partition.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-062]** Immutable Audit Log
- **Type:** Technical
- **Description:** Every SAOP turn is logged to `agent_logs` with a nanosecond-precision timestamp.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-063]** Sandbox violation alerts
- **Type:** Security
- **Description:** Attempts by containers to access blocked network or exceed quotas MUST be logged as `SECURITY_ALERT` in project state.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-064]** Requirement-to-Commit Traceability
- **Type:** Technical
- **Description:** Every Git commit MUST be tagged with a `REQ-ID` and reference to the SQLite task record.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-065]** Immutable Audit Record (SAOP)
- **Type:** Technical
- **Description:** Every turn MUST be persisted to the `agent_logs` table before the next turn is initiated.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-066]** Metadata Correlation
- **Type:** Technical
- **Description:** Each log entry MUST be tagged with `thread_id`, `task_id`, `agent_role`, `turn_index`, and `git_commit_hash`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-067]** Detailed Observation Persistence
- **Type:** Technical
- **Description:** Tool outputs MUST be stored in raw form (after redaction). Truncation for LLM context MUST NOT affect the stored log.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-068]** Reasoning Persistence
- **Type:** Technical
- **Description:** The `reasoning_chain` is never discarded and is stored as a blob in the `agent_logs` table.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-069]** Low-Latency Event Bus
- **Type:** Technical
- **Description:** Use WebSockets or SSE to stream `AGENT_THOUGHT_STREAM`, `TOOL_LIFECYCLE`, and `SANDBOX_BUFFER_PULSE` events.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-070]** UI Redaction Parity
- **Type:** Technical
- **Description:** The event stream MUST pass through the `SecretMasker` to ensure no secrets are leaked to the VSCode UI or terminal.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-071]** HITL Block Signaling
- **Type:** Functional
- **Description:** Explicit events for when the orchestrator is suspended awaiting user approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-072]** Atomic Task Commits
- **Type:** Technical
- **Description:** Every successful task implementation MUST result in an atomic Git commit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-073]** Trace Linkage (Git)
- **Type:** Technical
- **Description:** Commit messages MUST include the `TASK-ID` and a reference to the reasoning trace in the `.devs/` database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-074]** Git-DB Correlation (Rewind Support)
- **Type:** Technical
- **Description:** The `tasks` table stores the `HEAD` hash, enabling a "Hard Rewind" that restores both the filesystem and the database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-075]** Security Alert Table
- **Type:** Technical
- **Description:** Dedicated SQLite table to log network/filesystem violations, resource DoS, and redaction hits.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-076]** Forensic Sandbox Persistence
- **Type:** Technical
- **Description:** On task failure or security violation, the orchestrator MUST preserve the container state for forensic analysis.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-077]** Command-Line Auditing
- **Type:** Technical
- **Description:** Support for `devs trace --task <ID>` to output a human-readable summary of agent operations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-078]** Compliance & Traceability Export
- **Type:** Technical
- **Description:** Ability to generate a "Project Integrity Report" ensuring 100% RTI (Requirement Traceability Index).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-079]** Log Integrity & Purge
- **Type:** Technical
- **Description:** Support for `devs purge` command that securely deletes all traces, vector databases, and reasoning caches.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-080]** Entropy Detection
- **Type:** Technical
- **Description:** The orchestrator monitors the `Observation` output for repeating patterns to prevent token waste and autonomous "spinning."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-081]** Deterministic Loop Detection
- **Type:** Technical
- **Description:** The system computes a SHA-256 hash of the last 3 error outputs. If `hash(N) == hash(N-1) == hash(N-2)`, it triggers a `STRATEGY_PIVOT`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-082]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** The agent is forced to "Reason from First Principles," ignoring previous attempts when a loop is detected.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-083]** Escalation Pause
- **Type:** Functional
- **Description:** After 5 total failed implementation attempts for a single task, the system MUST enter a `PAUSED_FOR_INTERVENTION` state.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-084]** Context Window Refresh
- **Type:** Technical
- **Description:** Re-inject full TAS and PRD blueprints every 10 turns to combat "Reasoning Decay."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-085]** Independent Reviewer Validation
- **Type:** Technical
- **Description:** Every implementation task MUST be verified by a separate Reviewer Agent with a different system prompt.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-001]** Master Key Derivation (Standard)
- **Type:** Technical
- **Description:** Project Master Key derived from host keychain secret using PBKDF2-HMAC-SHA512.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-002]** Key Wrapping (KEK)
- **Type:** Technical
- **Description:** All asset-specific keys are wrapped using the Master Key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-003]** Host Keychain Integration (Crypto)
- **Type:** Technical
- **Description:** API keys and long-lived secrets MUST be stored in the host OS's native secure storage.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-004]** Ephemeral Session Keys
- **Type:** Technical
- **Description:** IPC channels use X25519 to establish unique session keys rotated on every restart.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-005]** No Raw Keys in Context
- **Type:** Technical
- **Description:** SAOP protocol ensures agents only see "Key References." Raw private keys MUST NOT be injected into LLM context.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-006]** Cryptographic MCP Tools
- **Type:** Technical
- **Description:** All signing and encryption tasks are performed via the Orchestrator's MCP tools.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-CRY-007]** Default-Secure Generation (Crypto)
- **Type:** Technical
- **Description:** Architect Agent MUST prioritize libraries that leverage native OS crypto over user-land implementations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-EDG-001]** Legacy System Integration
- **Type:** Technical
- **Description:** Interaction with legacy systems using weak primitives MUST be wrapped in a `LEGACY_CRYPTO_ADAPTER` flagged for human audit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-EDG-002]** Host Entropy Depletion
- **Type:** Technical
- **Description:** Sandboxes SHOULD use a PRNG seeded from the host's entropy source to ensure non-blocking operation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-201]** Redaction Collision
- **Type:** Security
- **Description:** Mitigation: Use the first 12 chars of the SHA-256 hash for secret masking to provide negligible collision probability.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-QST-201]** Post-Quantum Cryptography Support
- **Type:** Security
- **Description:** Should 'devs' implement PQC primitives (e.g., Kyber) for local IPC handshake? (Current: Out of Scope).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-086]** Data Minimization
- **Type:** Technical
- **Description:** The system only sends minimal project context to the LLM. No host system environment variables are sent.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-SD-087]** Right to Erasure
- **Type:** Technical
- **Description:** `devs purge` command MUST recursively delete all state, vector databases, and cached reasoning traces.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-901]** Sandbox Performance
- **Type:** Technical
- **Description:** The overhead of strict Docker isolation may impact build times for large projects.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-RSK-902]** Redaction False Positives
- **Type:** Technical
- **Description:** High-entropy strings in binary files may be incorrectly redacted, breaking builds.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-QST-901]** Context Injection Risk (Long Window)
- **Type:** Security
- **Description:** Will Gemini 3 Pro's long context window increase the risk of "Context Injection" from older tasks?
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[REQ-SEC-QST-902]** Native Extensions Handling
- **Type:** Technical
- **Description:** How to handle projects requiring "Native Extensions" that need compilation and might require broader sandbox permissions?
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None
