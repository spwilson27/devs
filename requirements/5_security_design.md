### **[SEC-010]** Dedicated User Context
- **Type:** Security
- **Description:** The orchestrator MUST run under a non-privileged local user account and MUST explicitly fail and exit if executed with root or sudo privileges (UID 0 check on startup).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-011]** Directory Hardening
- **Type:** Security
- **Description:** The .devs/ state directory MUST be initialized with 0700 (drwx------) permissions. The orchestrator MUST verify permissions on every startup and abort if they are loose.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-012]** Role-Based Scoping (RBAC)
- **Type:** Security
- **Description:** Agents MUST be assigned granular permissions based on their role: ResearcherAgent (no shell_exec/filesystem_write to src/), DeveloperAgent (limited filesystem_rw to /workspace, monitored shell_exec), and ReviewerAgent (read_only_fs, no code modification).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-013]** Tool Call Validation & Schema Enforcement
- **Type:** Technical
- **Description:** Every MCP tool call MUST be validated against a strict JSON schema. The ToolProxy MUST reject calls with unauthorized arguments.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-014]** IPC Security (CLI <-> Extension)
- **Type:** Security
- **Description:** Communication between the VSCode extension and CLI MUST use a secure local Unix Socket or Named Pipe with a unique, ephemeral 128-bit Handshake Token.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-015]** Environment Isolation
- **Type:** Security
- **Description:** The orchestrator MUST sanitize its own environment variables and strip sensitive host variables (e.g., AWS_ACCESS_KEY_ID) before spawning sandboxes.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-016]** Phase-Specific Permission Escalation
- **Type:** Security
- **Description:** Permissions MUST be dynamic based on the project phase (e.g., revoking Research tools during the Implementation phase).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-017]** Argument Sanitization (Anti-Injection)
- **Type:** Technical
- **Description:** Shell tool calls MUST accept arguments as an array of strings (argv[]). Metacharacters MUST be rejected unless explicitly escaped. Paths MUST be normalized and verified within the /workspace subtree.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-019]** Host Keychain Integration
- **Type:** Technical
- **Description:** All API keys MUST be stored in the host's native secure storage (macOS Keychain, Linux Secret Service, Windows Credential Manager) rather than .env files or databases.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-020]** Zero-Persistence Secret Policy
- **Type:** Security
- **Description:** Secrets injected for specific tasks MUST use ephemeral environment variables that exist only for the tool call duration and are scrubbed from logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-021]** Ephemeral GitHub/VCS Tokens
- **Type:** Security
- **Description:** Agents SHOULD use the host's ssh-agent or short-lived installation tokens for Git operations; credentials MUST NEVER be committed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-022]** Mandatory Approval Junctions
- **Type:** UX
- **Description:** The orchestrator state machine MUST implement hard blocks at Phase 2 (Architecture) and Phase 3 (Roadmap) requiring a human_approval_signature to proceed.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-023]** Immutable Architectural Sign-off
- **Type:** Security
- **Description:** After TAS approval, Developer Agents are NOT authorized to modify core architectural files without a specific ARCH_CHANGE_DIRECTIVE from the user.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-022]

### **[SEC-024]** Directive Injection Authorization
- **Type:** Security
- **Description:** The orchestrator MUST validate that mid-task directives come from an authenticated user session before injection into agent memory.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-025]** Default-Secure Auth Boilerplate
- **Type:** Technical
- **Description:** Generated projects requiring auth MUST use Argon2 hashing, 15-minute JWT rotation, and HttpOnly/Secure/SameSite cookies.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-026]** Agent-Oriented Debugging Auth
- **Type:** Security
- **Description:** Internal MCP servers in generated projects MUST only listen on localhost and MUST require a 256-bit Bearer Token generated by the orchestrator.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-027]** Mandatory TLS 1.3
- **Type:** Technical
- **Description:** All outbound requests to external APIs (Gemini, Serper, etc.) MUST use TLS 1.3.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-028]** Cipher Suite Enforcement
- **Type:** Technical
- **Description:** Only AEAD-based cipher suites (e.g., TLS_AES_256_GCM_SHA384) are permitted for external communication.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-027]

### **[SEC-029]** Certificate Pinning
- **Type:** Security
- **Description:** The orchestrator SHOULD implement certificate pinning for generativelanguage.googleapis.com.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-030]** Secure Web Scraping Egress
- **Type:** Security
- **Description:** Research agents MUST default to HTTPS; HTTP ingestion is blocked by default and requires per-domain USER_OVERRIDE.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-031]** CLI-to-Extension Handshake Encryption
- **Type:** Technical
- **Description:** Communication between the CLI and VSCode Extension MUST occur over encrypted Unix Domain Sockets or Named Pipes with ACLs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-014]

### **[SEC-032]** Session Handshake Token
- **Type:** Security
- **Description:** Each IPC session MUST begin with a 256-bit ephemeral handshake token passed via environment variables from parent to child process.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-033]** Localhost MCP Security
- **Type:** Security
- **Description:** MCP servers listening on TCP MUST bind exclusively to 127.0.0.1 and require a Bearer token for every request.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-034]** Native Keychain Integration for Secrets
- **Type:** Technical
- **Description:** Secrets MUST NEVER be stored in plaintext and MUST use host OS secure credential managers (Keychain, libsecret, DPAPI).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-019]

### **[SEC-035]** Zero-Plaintext Config
- **Type:** Security
- **Description:** config.json and .devs/state.sqlite MUST NOT contain unencrypted API keys; references MUST use URI-based lookups (e.g., keychain://).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-034]

### **[SEC-036]** Filesystem Permission Hardening (Data at Rest)
- **Type:** Security
- **Description:** The .devs/ directory MUST be 0700; individual database files (SQLite, LanceDB) MUST be 0600.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-011]

### **[SEC-037]** Vector Embedding Integrity
- **Type:** Security
- **Description:** Sensitive blobs in LanceDB vector metadata SHOULD be encrypted using a project-specific master key derived from the User Keychain.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-038]** Pre-Persistence Redaction (SecretMasker)
- **Type:** Technical
- **Description:** A mandatory SecretMasker middleware MUST apply regex and entropy-based redaction to all sandbox streams before persistence.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-039]** Reasoning Log Anonymization
- **Type:** Security
- **Description:** Agent "thoughts" saved to SQLite MUST be scrubbed of PII (User Name, System Paths, IPs) unless explicitly required.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-038]

### **[SEC-040]** Ephemeral Sandbox Environment
- **Type:** Security
- **Description:** Secrets MUST NOT be passed to Docker via command line arguments; they SHOULD use secure stdin or encrypted ephemeral files with 0400 permissions.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-041]** Temporary Directory Isolation
- **Type:** Security
- **Description:** The project's temporary directory (.gemini/tmp/devs) MUST follow 0700 permission policy and MUST be purged upon project completion.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-042]** Master Key Derivation
- **Type:** Technical
- **Description:** A 256-bit project master key MUST be derived from the host keychain using PBKDF2-HMAC-SHA512 with 100k+ iterations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-019]

### **[SEC-043]** Ephemeral Sandbox Key Rotation
- **Type:** Security
- **Description:** Every task execution MUST use a new, ephemeral 128-bit session key for internal communication and file encryption.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-044]** Secure Deletion (devs purge)
- **Type:** Technical
- **Description:** The purge command MUST overwrite sensitive files (SQLite, LanceDB, etc.) with random data before removal.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-045]** Mandatory Ephemeral Isolation
- **Type:** Security
- **Description:** All implementation, testing, and dependency tasks MUST occur within a fresh, isolated sandbox (Docker or WebContainer).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-046]** Hardened Runtime Configuration
- **Type:** Technical
- **Description:** Sandboxes MUST use --cap-drop=ALL, --security-opt=no-new-privileges:true, --pids-limit 128, and hard memory/CPU quotas (4GB/2 vCPUs).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-045]

### **[SEC-047]** Filesystem Isolation & Integrity
- **Type:** Security
- **Description:** Sandboxes MUST use a read-only root, isolated writable volumes (/workspace, /tmp), and a noexec tmpfs for /tmp. The .git and .devs directories MUST NOT be mounted.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-045]

### **[SEC-048]** Network Egress & DNS Filtering
- **Type:** Security
- **Description:** Sandboxes MUST default to --network none. During dependency installation, egress MUST be routed through a proxy enforcing an allow-list (npmjs, github, pypi) with DNS isolation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-045]

### **[SEC-049]** Multi-Tiered Redaction Suite
- **Type:** Technical
- **Description:** Data passing through the ToolProxy MUST be processed by the SecretMasker to prevent leakage of secrets into LLM contexts or logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-038]

### **[SEC-050]** Redaction Phase 1: Pattern Matching
- **Type:** Technical
- **Description:** SecretMasker MUST use 100+ regex patterns and flag any contiguous string with Shannon Entropy > 4.5.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-049]

### **[SEC-051]** Redaction Phase 2: Contextual Validation
- **Type:** Technical
- **Description:** Flagged strings MUST be classified by a local Gemini Flash instance to distinguish secrets from safe technical artifacts.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-050]

### **[SEC-052]** Redaction Phase 3: Replacement
- **Type:** Technical
- **Description:** Detected secrets MUST be replaced with deterministic placeholders: [REDACTED_<TYPE>_<SHORT_HASH>].
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-051]

### **[SEC-053]** Input Redaction (Tool Call Protection)
- **Type:** Security
- **Description:** SecretMasker MUST inspect tool arguments before they are sent to the sandbox to prevent accidental secret leakage in logs.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-049]

### **[SEC-054]** Zero-Trust Dependency Management
- **Type:** Security
- **Description:** The system MUST mitigate hallucination-driven supply chain attacks through automated integrity checks.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-055]** Mandatory Lockfile Enforcement
- **Type:** Technical
- **Description:** DependencyManager MUST fail if an agent attempts installation without generating or updating a lockfile.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-054]

### **[SEC-056]** Automated Vulnerability Gates
- **Type:** Security
- **Description:** Every installation MUST be followed by an audit (e.g., npm audit); High/Critical vulnerabilities MUST trigger a mandatory ReviewerAgent failure.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-054]

### **[SEC-057]** Script Execution Blocking
- **Type:** Security
- **Description:** All package installations MUST use --ignore-scripts by default. Post-install scripts require a HITL_GATE for manual approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-054]

### **[SEC-058]** Structured Argument Enforcement
- **Type:** Technical
- **Description:** All tool calls MUST be validated against schemas; shell_exec MUST use argv arrays; path arguments MUST be validated via resolveAndValidatePath().
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-013], [SEC-017]

### **[SEC-059]** Atomic State Persistence
- **Type:** Technical
- **Description:** state.sqlite MUST use WAL and ACID transactions to ensure consistency between tasks and requirements.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-060]** Document Integrity Checksums
- **Type:** Security
- **Description:** SHA-256 checksums for PRD and TAS MUST be verified before distillation and implementation; execution MUST block if specs are modified without re-approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-022]

### **[SEC-061]** Vector Memory Sanitization
- **Type:** Security
- **Description:** LanceDB MUST only be updated with "Verified" architectural decisions; lower-trust partition MUST be used for research data.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-062]** Immutable Audit Log
- **Type:** Technical
- **Description:** Every SAOP turn MUST be logged to agent_logs with nanosecond-precision timestamps.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-063]** Sandbox Violation Alerts
- **Type:** Security
- **Description:** Attempts to breach network, filesystem, or resource quotas MUST be logged as a SECURITY_ALERT in the state database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-046], [SEC-047], [SEC-048]

### **[SEC-064]** Requirement-to-Commit Traceability
- **Type:** Technical
- **Description:** Every Git commit MUST be tagged with a REQ-ID and a reference to the SQLite task record.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-065]** Immutable Audit Record Persistence
- **Type:** Technical
- **Description:** Every turn MUST be persisted to state.sqlite before any subsequent turn is initiated.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-062]

### **[SEC-066]** Audit Log Metadata Correlation
- **Type:** Technical
- **Description:** Each log entry MUST be tagged with thread_id, task_id, agent_role, turn_index, and git_commit_hash.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-065]

### **[SEC-067]** Detailed Observation Persistence
- **Type:** Technical
- **Description:** Tool outputs MUST be stored in raw (redacted) form in SQLite, unaffected by LLM context truncation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-065]

### **[SEC-068]** Reasoning Persistence
- **Type:** Technical
- **Description:** payload.analysis.reasoning_chain MUST be stored as a blob in the agent_logs table for post-hoc analysis.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-065]

### **[SEC-069]** Low-Latency Event Bus
- **Type:** UX
- **Description:** The orchestrator MUST stream internal events (thoughts, tool lifecycle, sandbox pulses) via WebSockets or SSE.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-070]** UI Redaction Parity
- **Type:** Security
- **Description:** Real-time event streams MUST pass through the SecretMasker before being sent to the UI.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-069], [SEC-038]

### **[SEC-071]** HITL Block Signaling
- **Type:** UX
- **Description:** Explicit events MUST be emitted when the orchestrator is awaiting user approval.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-069], [SEC-022]

### **[SEC-072]** Atomic Task Commits
- **Type:** Technical
- **Description:** Every successful task implementation MUST result in an atomic Git commit.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-073]** Trace Linkage in Commits
- **Type:** Technical
- **Description:** Commit messages MUST include the TASK-ID and a reference to the reasoning trace in the database.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-072], [SEC-064]

### **[SEC-074]** Git-DB Correlation (Rewind)
- **Type:** Technical
- **Description:** The tasks table MUST store the HEAD hash to enable hard rewinds of both filesystem and database state.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-059]

### **[SEC-075]** Security Alert Table
- **Type:** Security
- **Description:** A dedicated table MUST log network/filesystem violations, resource DoS, and SecretMasker redaction hits.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-063]

### **[SEC-076]** Forensic Sandbox Persistence
- **Type:** Technical
- **Description:** On task failure or security violation, the orchestrator MUST preserve the container state for manual forensic analysis.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-045]

### **[SEC-077]** Command-Line Auditing Tool
- **Type:** Technical
- **Description:** devs trace --task <ID> MUST output a Markdown summary of an agent's reasoning, actions, and observations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-065]

### **[SEC-078]** Compliance & Traceability Export
- **Type:** Technical
- **Description:** The system MUST be able to generate a Project Integrity Report mapping requirements to tests to commits.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-064]

### **[SEC-079]** Log Integrity & Purge (GDPR)
- **Type:** Technical
- **Description:** The system MUST support a devs purge command that securely deletes all traces, vector databases, and cached reasoning.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-044]

### **[SEC-080]** Agentic Fail-Safes & Entropy Management
- **Type:** Technical
- **Description:** The orchestrator MUST monitor observations for repeating patterns to prevent autonomous spinning.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-081]** Deterministic Loop Detection
- **Type:** Technical
- **Description:** The system MUST compute a SHA-256 hash of the last 3 error outputs; matching hashes trigger a STRATEGY_PIVOT.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-080]

### **[SEC-082]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Triggered pivots MUST force the agent to reason from first principles and explicitly address repeating errors.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-081]

### **[SEC-083]** Escalation Pause
- **Type:** UX
- **Description:** After 5 failed implementation attempts for one task, the system MUST enter PAUSED_FOR_INTERVENTION state.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-084]** Context Window Refresh
- **Type:** Technical
- **Description:** The system MUST re-inject TAS and PRD blueprints every 10 turns to combat reasoning decay and instruction drift.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-085]** Independent Reviewer Validation
- **Type:** Security
- **Description:** Every implementation task MUST be verified by a separate Reviewer Agent instance with a different system prompt.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-012]

### **[SEC-086]** Data Minimization
- **Type:** Security
- **Description:** Only minimal project context MUST be sent to the LLM; host system environment variables MUST NOT be sent.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[SEC-087]** Right to Erasure
- **Type:** Security
- **Description:** devs purge MUST recursively delete all state, vector databases, and cached reasoning traces.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-079]

### **[CRYPTO-001]** Master Key Derivation Protocol
- **Type:** Technical
- **Description:** A 256-bit Project Master Key MUST be derived from the user's host keychain using PBKDF2-HMAC-SHA512 (100k+ iterations) and MUST never leave orchestrator memory.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-042]

### **[CRYPTO-002]** Key Wrapping (KEK)
- **Type:** Technical
- **Description:** All asset-specific keys (SQLite encryption, sandbox credentials) MUST be wrapped using the Project Master Key.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [CRYPTO-001]

### **[CRYPTO-003]** Host Keychain Integration (Crypto)
- **Type:** Technical
- **Description:** API keys and long-lived secrets MUST be stored in native secure storage; plaintext in .env or config.json is a hard violation.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-019]

### **[CRYPTO-004]** Ephemeral Session Keys
- **Type:** Technical
- **Description:** IPC channels MUST use X25519 to establish unique session keys rotated on every restart.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** [SEC-014]

### **[CRYPTO-005]** No Raw Keys in Agent Context
- **Type:** Security
- **Description:** Agents MUST only see Key References (e.g., key_id); raw private keys or master secrets MUST NOT be injected into LLM context.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[CRYPTO-006]** Cryptographic MCP Tools
- **Type:** Technical
- **Description:** All signing and encryption tasks MUST be performed via Orchestrator MCP tools (e.g., sign_artifact) where intent is validated before key use.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[CRYPTO-007]** Default-Secure Crypto Generation
- **Type:** Technical
- **Description:** Code generated for projects MUST prioritize libraries that leverage native OS crypto (e.g., Node crypto) over user-land implementations.
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None

### **[CRYPTO-Standards]** Mandatory Cryptographic Primitives
- **Type:** Technical
- **Description:** The system MUST use SHA-256/384 (Hashing), AES-256-GCM (Symmetric), Ed25519/X25519 (Asymmetric), Argon2id (Passwords), and JWT ES256 (Tokens).
- **Source:** Security Design (specs/5_security_design.md)
- **Dependencies:** None
