# Requirements: Security Design (specs/5_security_design.md)

### **[5_SECURITY_DESIGN-REQ-SEC-THR-001]** The "Trojan Requirement"
- **Type:** Security
- **Description:** An agent, influenced by malicious research, distills a requirement that seems valid (e.g., "Add health check endpoint") but includes a hidden backdoor (e.g., `eval(req.query.cmd)`).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-002]** Supply Chain Poisoning
- **Type:** Security
- **Description:** The agent is tricked into choosing a "typosquatted" or malicious library during the Tech Landscape phase because it lacked a live "reputation check."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-003]** Recursive Resource Drain
- **Type:** Security
- **Description:** An agent generates code that creates millions of tiny files or spawns thousands of processes within the sandbox to perform a local DoS.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-THR-004]** Verification Bypass
- **Type:** Security
- **Description:** An agent writes both the implementation *and* a "fake" test that passes regardless of the actual logic, tricking the Reviewer Agent.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-001]** Agent Identity Enforcement
- **Type:** Security
- **Description:** Use multi-agent signatures and Orchestrator-controlled agent identity to prevent an agent from impersonating the Reviewer to sign off on its own task.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-002]** AOD Checksum Verification
- **Type:** Security
- **Description:** Implement checksum verification of AOD files before agent ingestion to prevent tampering with `.agent.md` and misleading future developer agents.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-003]** Persistent SAOP Traces
- **Type:** Security
- **Description:** Maintain persistent SAOP traces linked to Git commit hashes to ensure non-repudiation of agent-generated code blocks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-004]** Mandatory SecretMasker
- **Type:** Security
- **Description:** Implement a mandatory `SecretMasker` on all sandbox streams to prevent secret leakage via error logs sent back to the Gemini API.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-005]** Resource Quotas and Timeouts
- **Type:** Security
- **Description:** Enforce hard resource quotas (e.g., 2 cores, 4GB) and 300s timeouts to prevent DoS attacks where an agent locks the sandbox CPU.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-STR-006]** Host-Level Execution Prevention
- **Type:** Security
- **Description:** Use `ignore-scripts` flag and no-exec `/tmp` in sandbox to prevent privilege escalation via malicious post-install scripts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-001]** Sandbox Escape Risk (WebContainers)
- **Type:** Security
- **Description:** Investigate and mitigate the risk of sandbox escape in WebContainers, especially for complex C-extension based Node modules.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-002]** Token Redaction Latency
- **Type:** Technical
- **Description:** Ensure `SecretMasker` performance does not introduce significant latency in the "Green-Phase" of the TDD loop.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-001]** Local-only Model Support
- **Type:** Technical
- **Description:** Evaluate supporting "Local-only" models to eliminate external service trust risks for enterprise users.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-002]** Host-Aware Agent Implementation
- **Type:** Technical
- **Description:** Determine how to handle "Host-Aware" agents that need OS details without leaking sensitive host information.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-010]** Dedicated Non-privileged User Context
- **Type:** Security
- **Description:** The orchestrator MUST run under a non-privileged local user account and MUST explicitly fail and exit if executed with `root` or `sudo` privileges (UID 0 check on startup).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-011]** Directory Hardening
- **Type:** Security
- **Description:** The `.devs/` state directory MUST be initialized with `0700` permissions. The orchestrator MUST verify permissions on startup and abort if they are loose.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-014]** IPC Security (CLI <-> Extension)
- **Type:** Technical
- **Description:** Communication between the VSCode extension and CLI logic MUST use a secure local Unix Socket or Named Pipe with a unique, ephemeral 128-bit Handshake Token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-015]** Environment Isolation
- **Type:** Security
- **Description:** The orchestrator MUST sanitize its own environment variables before spawning sandboxes, stripping sensitive host variables (e.g., `AWS_ACCESS_KEY_ID`).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-012]** Role-Based Scoping (RBAC)
- **Type:** Security
- **Description:** Implement granular capabilities for MCP tools based on Agent Role (Researcher, Developer, Reviewer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-013]** Tool Call Validation & Schema Enforcement
- **Type:** Security
- **Description:** Every MCP tool call MUST be validated against a strict JSON schema; unauthorized arguments MUST result in rejection and logging.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-016]** Phase-Specific Permission Escalation
- **Type:** Security
- **Description:** Permissions MUST be dynamic based on the project phase (e.g., revoking Research tools during Implementation).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-017]** Argument Sanitization (Anti-Injection)
- **Type:** Security
- **Description:** Shell commands MUST accept arguments as an array; shell metacharacters MUST be rejected unless escaped. Paths MUST be normalized and restricted to the `/workspace` subtree.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-019]** Host Keychain Integration
- **Type:** Security
- **Description:** All API keys MUST be stored in the host's native secure storage (macOS Keychain, etc.); they MUST NOT be stored in `.env` files or the database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-020]** Zero-Persistence Secret Policy
- **Type:** Security
- **Description:** Secrets injected into the sandbox MUST be provided via ephemeral environment variables and scrubbed from all logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-021]** Ephemeral GitHub/VCS Tokens
- **Type:** Security
- **Description:** Agents SHOULD use host `ssh-agent` or short-lived tokens for Git operations; credentials MUST NEVER be committed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-022]** Mandatory Approval Junctions
- **Type:** UX
- **Description:** The orchestrator state machine MUST implement hard blocks at Phase 2 and Phase 3, requiring a `human_approval_signature` to proceed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-023]** Immutable Architectural Sign-off
- **Type:** Technical
- **Description:** Once the TAS is approved, the Developer Agent is NOT authorized to modify core architectural files without a specific directive.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-024]** Directive Injection Authorization
- **Type:** Security
- **Description:** The orchestrator MUST validate that mid-task directives come from the authenticated user session.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-025]** Default-Secure Auth Boilerplate
- **Type:** Technical
- **Description:** Generated projects MUST use industry-standard auth defaults (Argon2, JWT rotation, secure cookies); basic-auth is prohibited.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-026]** Agent-Oriented Debugging Auth
- **Type:** Security
- **Description:** Internal MCP servers in generated projects MUST only listen on `localhost` and MUST require a 256-bit Bearer Token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-101]** Identity Spoofing Mitigation
- **Type:** Security
- **Description:** Prevent an agent instance from signing off as its own Reviewer by tracking `thread_id` and role.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-102]** Indirect Tool Invocation Mitigation
- **Type:** Security
- **Description:** Use strict delimiters in prompts and CBAC enforcement to prevent malicious data from triggering unauthorized tool calls.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-103]** Privilege Escalation via Dependencies Mitigation
- **Type:** Security
- **Description:** Mandatory use of `--ignore-scripts` and restricted network egress during package installation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-027]** Mandatory TLS 1.3
- **Type:** Technical
- **Description:** All outbound requests to external APIs MUST use TLS 1.3.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-028]** Cipher Suite Enforcement
- **Type:** Technical
- **Description:** Only AEAD-based cipher suites are permitted for external communication.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-029]** Certificate Pinning
- **Type:** Security
- **Description:** The orchestrator SHOULD implement certificate pinning for Gemini API endpoints.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-030]** Secure Web Scraping Egress
- **Type:** Security
- **Description:** Research agents MUST default to HTTPS; HTTP content is blocked unless explicitly overridden and logged.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-031]** CLI-to-Extension Encrypted IPC
- **Type:** Technical
- **Description:** IPC between CLI and Extension MUST occur over encrypted Unix Domain Sockets or Named Pipes with ACLs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-032]** IPC Session Handshake
- **Type:** Security
- **Description:** Each IPC session MUST begin with a 256-bit ephemeral handshake token passed via environment variables.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-033]** Localhost MCP Security
- **Type:** Security
- **Description:** MCP servers MUST bind exclusively to `127.0.0.1` and require a Bearer token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-034]** Native Keychain Integration for Secrets
- **Type:** Security
- **Description:** Secrets MUST NEVER be stored in plaintext; they MUST be stored using host OS secure credential managers (Keychain, DPAPI, etc.).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-035]** Zero-Plaintext Config
- **Type:** Security
- **Description:** Config and state files MUST NOT contain unencrypted API keys; references MUST use URI-based lookup.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-036]** Filesystem Permission Hardening
- **Type:** Security
- **Description:** The `.devs/` directory MUST have `0700` permissions; individual DB files MUST be `0600`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-037]** Vector Embedding Integrity
- **Type:** Security
- **Description:** Vector database files MUST be treated as high-confidentiality assets; sensitive blobs SHOULD be encrypted with a project master key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-038]** Pre-Persistence Redaction (SecretMasker)
- **Type:** Security
- **Description:** `SecretMasker` MUST apply regex and entropy-based redaction to all stdout/stderr before writing to logs or SQLite.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-039]** Reasoning Log Anonymization
- **Type:** Security
- **Description:** Agent "thoughts" MUST be scrubbed of PII unless explicitly required for the task.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-040]** Ephemeral Sandbox Environment Secrets
- **Type:** Security
- **Description:** Secrets MUST NOT be passed via command line; they SHOULD use secure stdin or encrypted ephemeral files with `0400` permissions.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-041]** Temporary Directory Isolation
- **Type:** Security
- **Description:** Temporary directories MUST follow `0700` policy and MUST be purged upon completion.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-042]** Master Key Derivation
- **Type:** Technical
- **Description:** A 256-bit project master key MUST be derived from the user's host keychain using PBKDF2-HMAC-SHA512.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-043]** Ephemeral Sandbox Key Rotation
- **Type:** Security
- **Description:** Every sandbox task MUST use a new, ephemeral 128-bit session key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-044]** Secure Deletion (devs purge)
- **Type:** Technical
- **Description:** The `purge` command MUST overwrite sensitive files with random data before removal.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-045]** Mandatory Ephemeral Isolation
- **Type:** Security
- **Description:** All implementation and testing tasks MUST occur within a fresh, isolated sandbox (Docker or WebContainer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-046]** Hardened Runtime Configuration (Docker)
- **Type:** Security
- **Description:** Enforce `--cap-drop=ALL`, `--security-opt=no-new-privileges:true`, `--pids-limit 128`, and hard RAM/CPU quotas for Docker containers.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-047]** Filesystem Isolation & Integrity
- **Type:** Security
- **Description:** Container root MUST be read-only; `/tmp` MUST be `tmpfs` with `noexec,nosuid,nodev`. `.git` and `.devs` MUST NOT be mounted.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-048]** Network Egress & DNS Filtering
- **Type:** Security
- **Description:** Default to no network; use a scoped bridge with an internal proxy enforcing an allow-list and isolated DNS.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-049]** Multi-Tiered Redaction
- **Type:** Security
- **Description:** Process all data passing through `ToolProxy` via the `SecretMasker` to prevent leakage.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-050]** Phase 1 Redaction: Patterns & Entropy
- **Type:** Security
- **Description:** Use 100+ regex patterns and Shannon Entropy > 4.5 detection for initial secret identification.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-051]** Phase 2 Redaction: Contextual Validation
- **Type:** Security
- **Description:** Use a local flash model to determine if flagged strings are legitimate secrets or safe technical artifacts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-052]** Phase 3 Redaction: Replacement & Hashing
- **Type:** Security
- **Description:** Replace secrets with consistent placeholders `[REDACTED_<TYPE>_<SHORT_HASH>]`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-053]** Input Redaction (Tool Call Protection)
- **Type:** Security
- **Description:** Inspect tool arguments before sending to the sandbox to prevent accidental secret leakage in shell commands.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-054]** Zero-Trust Dependency Management
- **Type:** Security
- **Description:** Protect against supply chain attacks and typosquatting during dependency resolution.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-055]** Mandatory Lockfile Enforcement
- **Type:** Technical
- **Description:** The `DependencyManager` MUST fail if no lockfile is generated/updated during installation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-056]** Automated Vulnerability Gates
- **Type:** Security
- **Description:** Perform automated audits after installation; high/critical vulnerabilities MUST trigger Reviewer failure.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-057]** Script Execution Blocking
- **Type:** Security
- **Description:** Use `--ignore-scripts` by default; post-install scripts require HITL approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-058]** Structured Argument Enforcement
- **Type:** Security
- **Description:** Enforce JSON schema validation, `argv` arrays for shell execution, and path traversal protection for all tool calls.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-059]** Atomic State Persistence
- **Type:** Technical
- **Description:** Use WAL and ACID transactions in SQLite; ensure consistency between tasks and requirements.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-060]** Document Integrity Checksums
- **Type:** Security
- **Description:** Verify SHA-256 checksums of PRD and TAS before distilling and implementation; block if manual edits bypass approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-061]** Vector Memory Sanitization
- **Type:** Security
- **Description:** Store research data in a separate, lower-trust partition to prevent semantic poisoning.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-062]** Immutable Audit Log
- **Type:** Security
- **Description:** Log every SAOP turn with nanosecond precision timestamps.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-063]** Sandbox Violation Alerts
- **Type:** Security
- **Description:** Log network or resource violations as security alerts in the dashboard.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-064]** Requirement-to-Commit Traceability
- **Type:** Technical
- **Description:** Tag every Git commit with a REQ-ID and reference to the SQLite task record.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-065]** Immutable Audit Record (SAOP)
- **Type:** Security
- **Description:** Persist every turn (Thought, Action, Observation) to SQLite before the next turn begins.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-066]** Metadata Correlation in Logs
- **Type:** Technical
- **Description:** Tag log entries with thread_id, task_id, agent_role, turn_index, and git_commit_hash.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-067]** Detailed Observation Persistence
- **Type:** Technical
- **Description:** Store raw tool outputs (after redaction) in SQLite, unaffected by context window truncation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-068]** Reasoning Persistence
- **Type:** Technical
- **Description:** Never discard the reasoning chain; store it as a blob for post-hoc analysis.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-069]** Low-Latency Event Bus
- **Type:** UX
- **Description:** Stream thought streams and sandbox pulses via WebSockets or SSE for real-time observability.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-070]** UI Redaction Parity
- **Type:** Security
- **Description:** Ensure real-time streams pass through the `SecretMasker` before display in UI.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-071]** HITL Block Signaling
- **Type:** UX
- **Description:** Provide explicit events when the orchestrator is awaiting user approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-072]** Atomic Task Commits
- **Type:** Technical
- **Description:** Every successful task implementation MUST result in an atomic Git commit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-073]** Trace Linkage in Commits
- **Type:** Technical
- **Description:** Commit messages MUST include TASK-ID and a reference to the reasoning trace.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-074]** Git-DB Correlation (Rewind)
- **Type:** Technical
- **Description:** Store HEAD hash in tasks table to support consistent historical rewinds.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-075]** Security Alert Table
- **Type:** Security
- **Description:** Dedicated table to log network violations, filesystem violations, resource DoS, and redaction hits.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-076]** Forensic Sandbox Persistence
- **Type:** Technical
- **Description:** Preserve container state on failure or violation for manual analysis via `devs debug`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-077]** Command-Line Auditing Tool
- **Type:** Technical
- **Description:** Support `devs trace` to output Markdown summaries of agent reasoning for specific tasks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-078]** Compliance & Traceability Export
- **Type:** Technical
- **Description:** Generate "Project Integrity Reports" with full requirement-to-commit mapping.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-079]** Log Integrity & Purge (GDPR)
- **Type:** Security
- **Description:** Support secure deletion of all traces and metadata via `devs purge`.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-080]** Entropy Detection
- **Type:** Technical
- **Description:** Monitor output for repeating patterns to prevent token waste and autonomous "spinning."
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-081]** Deterministic Loop Detection
- **Type:** Technical
- **Description:** Trigger `STRATEGY_PIVOT` if the hash of the last 3 error outputs remains identical.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-082]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Force the agent to "Reason from First Principles" and address the repeating error.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-083]** Escalation Pause
- **Type:** UX
- **Description:** Enter `PAUSED_FOR_INTERVENTION` state after 5 total failed implementation attempts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-084]** Context Window Refresh
- **Type:** Technical
- **Description:** Re-inject TAS and PRD blueprints every 10 turns to combat reasoning decay.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-085]** Independent Reviewer Validation
- **Type:** Security
- **Description:** Every implementation task MUST be verified by a separate Reviewer Agent with a different prompt.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-001]** Master Key Derivation Strategy
- **Type:** Technical
- **Description:** Derive a 256-bit Project Master Key from the user's host keychain using PBKDF2-HMAC-SHA512.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-002]** Key Wrapping (KEK)
- **Type:** Technical
- **Description:** Wrap asset-specific keys using the Master Key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-003]** Mandatory Host Keychain Usage
- **Type:** Security
- **Description:** Long-lived secrets MUST be stored in native secure storage; plaintext in config files is prohibited.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-004]** Ephemeral Session Keys (IPC)
- **Type:** Technical
- **Description:** Use X25519 to establish and rotate unique session keys for CLI/Extension IPC.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-005]** No Raw Keys in LLM Context
- **Type:** Security
- **Description:** Agents MUST only see Key References; raw private keys MUST NOT be injected into context.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-006]** Cryptographic MCP Tools
- **Type:** Technical
- **Description:** Perform all signing/encryption via Orchestrator MCP tools to maintain control over keys.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-CRY-007]** Default-Secure Generated Crypto
- **Type:** Technical
- **Description:** Prioritize native OS crypto modules in generated code over user-land JS implementations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-EDG-001]** Legacy System Crypto Wrapping
- **Type:** Technical
- **Description:** Wrap legacy weak primitives in a dedicated adapter flagged for human audit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-EDG-002]** Host Entropy Management
- **Type:** Technical
- **Description:** Seed sandbox PRNGs from host entropy source to ensure non-blocking operation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-201]** Redaction Hash Collision Mitigation
- **Type:** Technical
- **Description:** Use first 12 chars of SHA-256 for secret masking to allow correlation while minimizing collision risk.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-201]** Post-Quantum Cryptography Evaluation
- **Type:** Technical
- **Description:** Evaluate future implementation of PQC primitives (e.g., Kyber) for IPC handshakes.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-086]** Data Minimization
- **Type:** Security
- **Description:** Only send minimal project context to the LLM; exclude host environment variables like PATH or HOME.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-SD-087]** Right to Erasure Implementation
- **Type:** Security
- **Description:** Ensure `devs purge` recursively deletes all state, vectors, and traces.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-901]** Sandbox Performance Overhead
- **Type:** Technical
- **Description:** Monitor and mitigate build time impact from strict Docker isolation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-RSK-902]** Redaction False Positive Management
- **Type:** Technical
- **Description:** Handle incorrect redaction of high-entropy binary/encoded artifacts that could break builds.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-901]** Context Injection Risk Evaluation
- **Type:** Security
- **Description:** Assess risk of older malicious requirements influencing tasks via long context windows.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[5_SECURITY_DESIGN-REQ-SEC-QST-902]** Native Extension Sandbox Support
- **Type:** Technical
- **Description:** Develop strategy for handling projects requiring broad permissions for native extension compilation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None
