### **[REQ-RSK-001.1]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a rolling buffer of the last 3 tool observations (stdout/stderr). If SHA256(obs_n) == SHA256(obs_n-1), the entropy counter increments.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-001.2]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Upon an entropy count of 3, the agent is issued a mandatory SYSTEM_PIVOT instruction, forcing it to "Reason from First Principles" and ignore its previous 3 attempts.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-001.1

### **[REQ-RSK-001.3]** Hard Turn Limits
- **Type:** Technical
- **Description:** Every task implementation is capped at 10 turns. Every Epic is capped at a total turn budget. Exceeding these triggers an immediate PAUSE_FOR_INTERVENTION.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-001.4]** Cost Guardrails
- **Type:** Technical
- **Description:** Real-time USD tracking per task. If a single task exceeds a user-defined threshold (default $5.00), the orchestrator suspends execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-002.1]** Hardened Docker Configuration
- **Type:** Security
- **Description:** Use of minimal Alpine-based images. Containers MUST run with --cap-drop=ALL, --security-opt=no-new-privileges, and --pids-limit 128.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-002.2]** Network Egress Proxy
- **Type:** Security
- **Description:** Implementation sandboxes operate on a "Deny-All" policy. Dependency resolution is routed through an orchestrator-controlled proxy that enforces a whitelist (e.g., registry.npmjs.org, pypi.org).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-002.3]** Filesystem Virtualization
- **Type:** Security
- **Description:** The host project directory is mounted to /workspace in the sandbox. The .git and .devs folders are NOT mounted to prevent agents from corrupting history or the state machine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-002.4]** Resource Quotas
- **Type:** Technical
- **Description:** Hard CPU (2 cores) and Memory (4GB) limits enforced via Cgroups to prevent local Denial-of-Service attacks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-004.1]** Sliding Window Summarization
- **Type:** Technical
- **Description:** The orchestrator MUST trigger a Gemini 3 Flash task to summarize intermediate reasoning turns once the active context window exceeds 500k tokens.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-004.2]** Static Specification Re-Injection
- **Type:** Technical
- **Description:** Every 10 turns, the full TAS and PRD text MUST be re-injected into the prompt as "High-Priority Anchors" to reset the agent's focus.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-004.3]** Deterministic Context Pruning
- **Type:** Technical
- **Description:** Large tool outputs (e.g., multi-megabyte log files) MUST be summarized or truncated after 2 turns, while maintaining the full raw output in the state.sqlite for deep-querying if needed.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-004.4]** Architectural Lesson Vectorization
- **Type:** Technical
- **Description:** Critical decisions made mid-task are vectorized into LanceDB (Long-term Memory) to ensure they persist across Epics even if the short-term context is cleared.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-005.1]** TAS-Approved Library List
- **Type:** Technical
- **Description:** The Architect Agent generates an "Allowed Libraries" manifest in the TAS. The Developer Agent is blocked from adding new top-level dependencies without a re-architecting phase and human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-005.2]** Post-Install Audit Gate
- **Type:** Security
- **Description:** Every dependency installation turn MUST be followed by an automated audit (e.g., npm audit). Any "High" or "Critical" vulnerability triggers a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-005.3]** Lockfile Integrity
- **Type:** Technical
- **Description:** The system enforces the presence of a lockfile. Any task that modifies package.json without updating the lockfile is rejected by the Reviewer Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-006.1]** Untrusted Context Delimitation
- **Type:** Security
- **Description:** All data ingested from external sources MUST be wrapped in strict delimiters (e.g., <untrusted_research_data>) in the LLM prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-006.2]** High-Reasoning Sanitization
- **Type:** Security
- **Description:** A "Sanitizer Agent" (using Gemini 3 Flash) pre-processes all research data to identify and strip imperative language or "jailbreak" patterns before it reaches the Architect Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-011.1]** Recursive Decomposition
- **Type:** Technical
- **Description:** If an agent identifies a task as "High Complexity," the Architect Agent MUST be invoked to break it down into smaller, atomic sub-tasks (max 200 LoC per task).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-011.2]** Multi-Agent Chain-of-Thought
- **Type:** Technical
- **Description:** Complex tasks use a "Primary Developer" and a "Shadow Architect" working in parallel. The Shadow Architect reviews the PlanNode before code is written.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-011.3]** Expert Refinement Gates
- **Type:** Quality
- **Description:** Users can mark specific modules as "Expert Only," forcing the orchestrator to use the highest-reasoning model and requiring a 3-agent logic verification before commit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-018.1]** Arbitration Node
- **Type:** Technical
- **Description:** On the 3rd disagreement turn, a 3rd "Arbitrator Agent" (using a high-reasoning prompt) is invoked to review both reasoning traces and provide a binding decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-018.2]** User Escalation with RCA
- **Type:** Operational
- **Description:** If arbitration fails, the system MUST pause and present a "Conflict Analysis" report to the user, highlighting the specific PRD/TAS contradiction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-018.1

### **[REQ-RSK-018.3]** TAS Evolution Workflow
- **Type:** Technical
- **Description:** If the Developer Agent provides a valid technical justification for a TAS violation, the Arbitrator can propose a "TAS Revision" task for human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-018.1

### **[REQ-RSK-017.1]** Mandatory Security Spec
- **Type:** Security
- **Description:** The Architect Agent MUST generate a 5_security_design.md for every project, which the Developer Agent is required to ingest as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-017.2]** Automated SAST Injection
- **Type:** Security
- **Description:** The Reviewer Agent MUST run static analysis tools (e.g., eslint-plugin-security, bandit, gosec) as part of the implementation loop.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-017.3]** Security-Focused Reviewer Prompt
- **Type:** Security
- **Description:** The Reviewer Agent is specifically instructed to flag patterns like eval(), dangerouslySetInnerHTML, or unparameterized queries even if they pass the functional tests.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-017.4]** Dependency Vulnerability Scan
- **Type:** Security
- **Description:** The Developer Agent MUST run a security audit (e.g., npm audit) after every dependency installation. Any "High" or "Critical" vulnerability MUST trigger a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-013.1]** Tiered Model Failover
- **Type:** Technical
- **Description:** If Gemini 3 Pro is rate-limited, the system MUST automatically route non-reasoning tasks (linting, basic unit tests) to Gemini 3 Flash.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-013.2]** Jittered Exponential Backoff
- **Type:** Technical
- **Description:** Mandatory implementation of exponential backoff (Base 2s, Max 60s) for all 429 (Rate Limit) errors.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-013.3]** Intelligent Token Budgeting
- **Type:** Technical
- **Description:** The orchestrator tracks token usage in real-time and slows down parallel execution if the project is within 10% of its hard limit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-016.1]** Real-time Resource Gauges
- **Type:** Technical
- **Description:** The SandboxProvider MUST monitor stats from Docker/WebContainer and trigger an ENTROPY_PAUSE before a hard OOM kill occurs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-016.2]** Ephemeral Artifact Purging
- **Type:** Technical
- **Description:** Automated cleanup of node_modules/.cache, build logs, and temporary test artifacts between Epics.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-016.3]** Writable Volume Quotas
- **Type:** Technical
- **Description:** Enforcement of strict disk quotas on the /workspace mount using xfs_quota or container-level limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-021.1]** Off-Main-Thread Execution
- **Type:** UX
- **Description:** All trace parsing, vector search operations, and Markdown-to-HTML rendering MUST occur in a separate Worker Thread in the VSCode extension.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-021.2]** Virtualized Trace Streaming
- **Type:** UX
- **Description:** The VSCode Webview MUST implement virtualized lists for agent logs, rendering only the visible window of the trace.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-021.3]** Background Indexing
- **Type:** Technical
- **Description:** Vector DB indexing (LanceDB) MUST be throttled to avoid CPU spikes during active agent implementation turns.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-010.1]** High-Signal Diff UI
- **Type:** UX
- **Description:** Approvals MUST highlight semantic changes (e.g., "New Dependency Added", "Security Policy Modified") rather than raw text diffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-010.2]** Logic Anomaly Alerts
- **Type:** UX
- **Description:** The Reviewer Agent MUST flag if a user directive contradicts a previously established "Long-term Memory" constraint, requiring an explicit confirmation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-010.3]** Staggered Review Cadence
- **Type:** UX
- **Description:** Users can configure "Batch Approval" for P1 tasks while requiring individual sign-off for P3 architectural changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-020.1]** ACID-Compliant Commits
- **Type:** Technical
- **Description:** All state changes (Success -> Commit -> Log Write) MUST be wrapped in a database transaction that rolls back if the Git operation fails.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-020.2]** Git-DB Verification on Resume
- **Type:** Technical
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-020.3]** Automatic Lockfile Cleanup
- **Type:** Technical
- **Description:** devs MUST perform a cleanup of stale .git/index.lock or .devs/state.sqlite-journal files upon startup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-023.1]** Canonical Sandbox Images
- **Type:** Technical
- **Description:** Every project MUST use a version-locked base image (Docker/WebContainer) defined in the TAS.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-023.2]** Path Normalization Middleware
- **Type:** Technical
- **Description:** The orchestrator MUST use upath or similar for all internal file operations to ensure cross-platform consistency.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-023.3]** Environment Scrubbing
- **Type:** Security
- **Description:** Mandatory stripping of host-specific environment variables before spawning any sandbox process.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-012.1]** File-Level Write Locking
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a "Write Lock" on all files within the active task's input_files scope. No two parallel tasks can have overlapping writable file sets.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-012.2]** Manifest Serialization
- **Type:** Technical
- **Description:** Modifications to global manifests (package.json, Cargo.toml) MUST be serialized through a central "Dependency Orchestrator" agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-012.3]** Post-Parallel Validation
- **Type:** Quality
- **Description:** After parallel tasks merge, the system MUST run a "Global Epic Test" to ensure no side-effect regressions were introduced by the combined changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-001.1]** Multi-Model Failover Architecture
- **Type:** Technical
- **Description:** The Agent Factory MUST be designed to support Anthropic (Claude 3.5 Sonnet) and OpenAI (GPT-4o) as secondary providers.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-001.2]** Headless CLI Parity
- **Type:** Technical
- **Description:** Ensure the CLI remains fully functional without the VSCode Extension to mitigate risk of IDE-specific breakages.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-001.3]** Open-Standard MCP Compliance
- **Type:** Technical
- **Description:** Adhere strictly to the public MCP spec rather than proprietary extensions to ensure compatibility with future agentic tools.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-002.1]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Mandatory use of Gemini 3 Flash for routine tasks (Linting, simple code reviews) to reduce cost by up to 80% compared to Pro-only execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-002.2]** Pre-Execution Cost Estimation
- **Type:** Operational
- **Description:** Phase 3 (Distillation) MUST provide a "Project Token Estimate" (+/- 20%) before implementation begins.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-002.3]** Caching & Memoization
- **Type:** Technical
- **Description:** Orchestrator MUST cache successful research results and distilled requirements across project attempts to avoid redundant API calls.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-003.1]** The Glass-Box Audit Trail
- **Type:** Technical
- **Description:** Every commit MUST be linked to a queryable reasoning trace (SAOP_Envelope) in SQLite, allowing architects to inspect the "Why" behind every decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-003.2]** Mandatory TDD Verification
- **Type:** Quality
- **Description:** Code is never presented as "done" without a 100% test pass rate in a clean sandbox, providing empirical proof of correctness.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-003.3]** Agent-Oriented Documentation (AOD)
- **Type:** Quality
- **Description:** Every module includes .agent.md documentation, ensuring the project is as readable to humans as it is to agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-004.1]** Human-in-the-Loop Sign-off
- **Type:** Operational
- **Description:** All architectural decisions (PRD/TAS) require explicit user approval, ensuring significant human "creative direction" is part of the audit trail.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-004.2]** Zero-Data-Retention Option
- **Type:** Security
- **Description:** Support for Enterprise LLM endpoints that guarantee user code is not used for model training.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-004.3]** Origin Traceability
- **Type:** Quality
- **Description:** Every requirement is traced from the user's initial prompt to the final code, providing a clear map of human intent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-006.1]** Idiomatic Pattern Enforcement
- **Type:** Quality
- **Description:** The Reviewer Agent uses a "Clean Code" prompt to ensure generated code follows standard community patterns (e.g., SOLID, Clean Architecture).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-006.2]** Automated Onboarding
- **Type:** Quality
- **Description:** Every project includes an onboarding.agent.md that explains the architecture to any new developer (human or AI).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-001]** Deterministic Project Rewind (Time-Travel Recovery)
- **Type:** Technical
- **Description:** Reversion of the entire development environment to a verified historical task completion state. Includes filesystem restoration (git checkout), relational state rollback (ACID deletion of logs/tasks/requirements), and vector memory pruning.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-002]** Strategy Pivot & Manual Implementation Bypass
- **Type:** Operational
- **Description:** Triggered on entropy detection > 5 or user takeover. Moves task to PAUSED_FOR_INTERVENTION, preserves sandbox, allows user modification, and ingests user changes via diff_analysis upon resume.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-003]** Sandbox Reconstruction & Image Failover
- **Type:** Technical
- **Description:** Deep purge and reconstruction of the sandbox using the TAS-locked base image and SHA-pinned dependencies. Failover to mirrors if registry unreachable.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-004]** Multi-Model API Failover & Redundancy
- **Type:** Technical
- **Description:** Automatic switching of LLM providers (Gemini -> Claude -> GPT) with thread_id and context serialization into model-agnostic Markdown.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-005]** State Reconstruction from Audit Trails
- **Type:** Technical
- **Description:** Reconstruction of requirement roadmap and task status by parsing Git history metadata and structured commit footers if .devs/ metadata is corrupted.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-006]** Automated Regression Rollback
- **Type:** Technical
- **Description:** Automated identification of task introducing regression, soft rewind of code (retaining failing test), and re-assignment of task with regression constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[PROC-007]** Budget & Token Exhaustion Fallback
- **Type:** Technical
- **Description:** Soft limit pause at 80% budget. Hard limit snapshot_and_freeze at 100%. Resumes only after user updates configuration.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-007.1]** Mandatory SecretMasker
- **Type:** Security
- **Description:** All sandbox stdout/stderr MUST pass through a regex and entropy-based redaction engine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-007.2]** High-Entropy Detection
- **Type:** Security
- **Description:** Any contiguous string of 20+ characters with high Shannon entropy (>4.5) is replaced with [REDACTED] before being persisted or sent to the LLM.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-007.1

### **[REQ-RSK-007.3]** Local State Hardening
- **Type:** Security
- **Description:** The .devs/state.sqlite file is initialized with 0600 permissions. No secrets stored in DB; only references to host OS Keychain permitted.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-008.1]** ACID-Compliant State Transitions
- **Type:** Technical
- **Description:** All state changes (Task Status: Success -> Git Commit -> Log Write) MUST be wrapped in a database transaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-003.1]** Independent Reviewer Agent
- **Type:** Quality
- **Description:** Every task implementation is reviewed by a separate agent instance with a "Hostile Auditor" prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-003.2]** TAS Fidelity Gate
- **Type:** Quality
- **Description:** The Reviewer Agent MUST verify that no new top-level directories or unapproved libraries were introduced, using the TAS as the primary constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-003.1

### **[REQ-RSK-003.3]** Agent-Oriented Documentation (AOD) Audit
- **Type:** Quality
- **Description:** The Reviewer MUST verify that the .agent.md documentation for the modified module has been updated and accurately reflects the "Agentic Hooks."
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** REQ-RSK-003.1

### **[REQ-RSK-009.1]** Multi-Run Verification
- **Type:** Quality
- **Description:** Every "Green" test completion MUST be verified by running the test suite 3 consecutive times in a clean sandbox.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-009.2]** Flakiness Heuristics
- **Type:** Quality
- **Description:** If a test fails with different error messages across retries, the system flags it as FLAKY and pauses for human intervention.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None
