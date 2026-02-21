### **[8_RISKS-REQ-001]** state machine robustness
- **Type:** Technical
- **Description:** Technical & Reliability Risks are owned by the Orchestration Manager (`devs-core`) and must be mitigated through state machine robustness, entropy detection, and ACID persistence.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-002]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a rolling buffer of the last 3 tool observations (stdout/stderr). If SHA256(obs_n) == SHA256(obs_n-1), the entropy counter increments.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-003]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Upon an entropy count of 3, the agent is issued a mandatory SYSTEM_PIVOT instruction, forcing it to "Reason from First Principles" and ignore its previous 3 attempts.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-002]

### **[8_RISKS-REQ-004]** Hard Turn Limits
- **Type:** Technical
- **Description:** Every task implementation is capped at 10 turns. Every Epic is capped at a total turn budget. Exceeding these triggers an immediate PAUSE_FOR_INTERVENTION.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-005]** Cost Guardrails
- **Type:** Technical
- **Description:** Real-time USD tracking per task. If a single task exceeds a user-defined threshold (default $5.00), the orchestrator suspends execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-006]** Hardened Docker Configuration
- **Type:** Security
- **Description:** Use of minimal Alpine-based images. Containers MUST run with --cap-drop=ALL, --security-opt=no-new-privileges, and --pids-limit 128.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-007]** Network Egress Proxy
- **Type:** Security
- **Description:** Implementation sandboxes operate on a "Deny-All" policy. Dependency resolution is routed through an orchestrator-controlled proxy that enforces a whitelist (e.g., registry.npmjs.org, pypi.org).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-008]** Filesystem Virtualization
- **Type:** Security
- **Description:** The host project directory is mounted to /workspace in the sandbox. The .git and .devs folders are NOT mounted to prevent agents from corrupting history or the state machine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-009]** Resource Quotas
- **Type:** Technical
- **Description:** Hard CPU (2 cores) and Memory (4GB) limits enforced via Cgroups to prevent local Denial-of-Service attacks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-010]** Sliding Window Summarization
- **Type:** Technical
- **Description:** The orchestrator MUST trigger a Gemini 3 Flash task to summarize intermediate reasoning turns once the active context window exceeds 500k tokens.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-011]** Static Specification Re-Injection
- **Type:** Technical
- **Description:** Every 10 turns, the full TAS and PRD text MUST be re-injected into the prompt as "High-Priority Anchors" to reset the agent's focus.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-012]** Deterministic Context Pruning
- **Type:** Technical
- **Description:** Large tool outputs (e.g., multi-megabyte log files) MUST be summarized or truncated after 2 turns, while maintaining the full raw output in the state.sqlite for deep-querying if needed.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-013]** Architectural Lesson Vectorization
- **Type:** Technical
- **Description:** Critical decisions made mid-task are vectorized into LanceDB (Long-term Memory) to ensure they persist across Epics even if the short-term context is cleared.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-014]** TAS-Approved Library List
- **Type:** Technical
- **Description:** The Architect Agent generates an "Allowed Libraries" manifest in the TAS. The Developer Agent is blocked from adding new top-level dependencies without a re-architecting phase and human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-015]** Post-Install Audit Gate
- **Type:** Security
- **Description:** Every dependency installation turn MUST be followed by an automated audit (e.g., npm audit). Any "High" or "Critical" vulnerability triggers a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-016]** Lockfile Integrity
- **Type:** Technical
- **Description:** The system enforces the presence of a lockfile. Any task that modifies package.json without updating the lockfile is rejected by the Reviewer Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-017]** Untrusted Context Delimitation
- **Type:** Security
- **Description:** All data ingested from external sources MUST be wrapped in strict delimiters (e.g., <untrusted_research_data>) in the LLM prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-018]** High-Reasoning Sanitization
- **Type:** Security
- **Description:** A "Sanitizer Agent" (using Gemini 3 Flash) pre-processes all research data to identify and strip imperative language or "jailbreak" patterns before it reaches the Architect Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-019]** Recursive Decomposition
- **Type:** Technical
- **Description:** If an agent identifies a task as "High Complexity," the Architect Agent MUST be invoked to break it down into smaller, atomic sub-tasks (max 200 LoC per task).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-020]** Multi-Agent Chain-of-Thought
- **Type:** Technical
- **Description:** Complex tasks use a "Primary Developer" and a "Shadow Architect" working in parallel. The Shadow Architect reviews the PlanNode before code is written.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-021]** Expert Refinement Gates
- **Type:** Technical
- **Description:** Users can mark specific modules as "Expert Only," forcing the orchestrator to use the highest-reasoning model and requiring a 3-agent logic verification before commit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-022]** Arbitration Node
- **Type:** Technical
- **Description:** On the 3rd disagreement turn, a 3rd "Arbitrator Agent" (using a high-reasoning prompt) is invoked to review both reasoning traces and provide a binding decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-023]** User Escalation with RCA
- **Type:** Operational
- **Description:** If arbitration fails, the system MUST pause and present a "Conflict Analysis" report to the user, highlighting the specific PRD/TAS contradiction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-022]

### **[8_RISKS-REQ-024]** TAS Evolution Workflow
- **Type:** Technical
- **Description:** If the Developer Agent provides a valid technical justification for a TAS violation, the Arbitrator can propose a "TAS Revision" task for human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-022]

### **[8_RISKS-REQ-025]** Mandatory Security Spec
- **Type:** Security
- **Description:** The Architect Agent MUST generate a 5_security_design.md for every project, which the Developer Agent is required to ingest as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-026]** Automated SAST Injection
- **Type:** Security
- **Description:** The Reviewer Agent MUST run static analysis tools (e.g., eslint-plugin-security, bandit, gosec) as part of the implementation loop.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-027]** Security-Focused Reviewer Prompt
- **Type:** Security
- **Description:** The Reviewer Agent is specifically instructed to flag patterns like eval(), dangerouslySetInnerHTML, or unparameterized queries even if they pass the functional tests.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-028]** Dependency Vulnerability Scan
- **Type:** Security
- **Description:** The Developer Agent MUST run a security audit (e.g., npm audit) after every dependency installation. Any "High" or "Critical" vulnerability MUST trigger a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-029]** Tiered Model Failover
- **Type:** Technical
- **Description:** If Gemini 3 Pro is rate-limited, the system MUST automatically route non-reasoning tasks (linting, basic unit tests) to Gemini 3 Flash.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-030]** Jittered Exponential Backoff
- **Type:** Technical
- **Description:** Mandatory implementation of exponential backoff (Base 2s, Max 60s) for all 429 (Rate Limit) errors.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-031]** Intelligent Token Budgeting
- **Type:** Technical
- **Description:** The orchestrator tracks token usage in real-time and slows down parallel execution if the project is within 10% of its hard limit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-032]** Real-time Resource Gauges
- **Type:** Technical
- **Description:** The SandboxProvider MUST monitor stats from Docker/WebContainer and trigger an ENTROPY_PAUSE before a hard OOM kill occurs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-033]** Ephemeral Artifact Purging
- **Type:** Technical
- **Description:** Automated cleanup of node_modules/.cache, build logs, and temporary test artifacts between Epics.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-034]** Writable Volume Quotas
- **Type:** Technical
- **Description:** Enforcement of strict disk quotas on the /workspace mount using xfs_quota or container-level limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-035]** Off-Main-Thread Execution
- **Type:** Performance
- **Description:** All trace parsing, vector search operations, and Markdown-to-HTML rendering MUST occur in a separate Worker Thread.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-036]** Virtualized Trace Streaming
- **Type:** UX
- **Description:** The VSCode Webview MUST implement virtualized lists for agent logs, rendering only the visible window of the trace.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-037]** Background Indexing
- **Type:** Performance
- **Description:** Vector DB indexing (LanceDB) MUST be throttled to avoid CPU spikes during active agent implementation turns.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-038]** High-Signal Diff UI
- **Type:** UX
- **Description:** Approvals MUST highlight semantic changes (e.g., "New Dependency Added", "Security Policy Modified") rather than raw text diffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-039]** Logic Anomaly Alerts
- **Type:** Quality
- **Description:** The Reviewer Agent MUST flag if a user directive contradicts a previously established "Long-term Memory" constraint, requiring an explicit confirmation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-040]** Staggered Review Cadence
- **Type:** UX
- **Description:** Users can configure "Batch Approval" for P1 tasks while requiring individual sign-off for P3 architectural changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-041]** ACID-Compliant Commits
- **Type:** Reliability
- **Description:** All state changes (Success -> Commit -> Log Write) MUST be wrapped in a database transaction that rolls back if the Git operation fails.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-042]** Git-DB Verification on Resume
- **Type:** Reliability
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-043]** Automatic Lockfile Cleanup
- **Type:** Reliability
- **Description:** devs MUST perform a cleanup of stale .git/index.lock or .devs/state.sqlite-journal files upon startup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-044]** Canonical Sandbox Images
- **Type:** Technical
- **Description:** Every project MUST use a version-locked base image (Docker/WebContainer) defined in the TAS.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-045]** Path Normalization Middleware
- **Type:** Technical
- **Description:** The orchestrator MUST use upath or similar for all internal file operations to ensure cross-platform consistency.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-046]** Environment Scrubbing
- **Type:** Technical
- **Description:** Mandatory stripping of host-specific environment variables before spawning any sandbox process.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-047]** File-Level Write Locking
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a "Write Lock" on all files within the active task's input_files scope. No two parallel tasks can have overlapping writable file sets.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-048]** Manifest Serialization
- **Type:** Technical
- **Description:** Modifications to global manifests (package.json, Cargo.toml) MUST be serialized through a central "Dependency Orchestrator" agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-049]** Post-Parallel Validation
- **Type:** Quality
- **Description:** After parallel tasks merge, the system MUST run a "Global Epic Test" to ensure no side-effect regressions were introduced by the combined changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-050]** Source Citation Requirement
- **Type:** Quality
- **Description:** Every claim in a research report MUST be accompanied by a valid URL or document reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-051]** Automated Link Validation
- **Type:** Quality
- **Description:** The orchestrator MUST attempt to fetch and verify the existence of all cited URLs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-050]

### **[8_RISKS-REQ-052]** Fact-Checker Agent
- **Type:** Quality
- **Description:** A separate agent MUST be used to cross-reference the research report against the raw scraped data to identify discrepancies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-053]** Multi-Model Failover Architecture
- **Type:** Technical
- **Description:** The Agent Factory MUST be designed to support Anthropic (Claude 3.5 Sonnet) and OpenAI (GPT-4o) as secondary providers, even if context window performance degrades.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-054]** Headless CLI Parity
- **Type:** Technical
- **Description:** Ensure the CLI remains fully functional without the VSCode Extension to mitigate risk of IDE-specific breakages.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-055]** Open-Standard MCP Compliance
- **Type:** Technical
- **Description:** Adhere strictly to the public MCP spec rather than proprietary extensions to ensure compatibility with future agentic tools.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-056]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Mandatory use of Gemini 3 Flash for routine tasks (Linting, simple code reviews) to reduce cost by up to 80% compared to Pro-only execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-057]** Pre-Execution Cost Estimation
- **Type:** Operational
- **Description:** Phase 3 (Distillation) MUST provide a "Project Token Estimate" (+/- 20%) before implementation begins.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-058]** Caching & Memoization
- **Type:** Technical
- **Description:** Orchestrator MUST cache successful research results and distilled requirements across project attempts to avoid redundant API calls.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-059]** The Glass-Box Audit Trail
- **Type:** Quality
- **Description:** Every commit MUST be linked to a queryable reasoning trace (SAOP_Envelope) in SQLite, allowing architects to inspect the "Why" behind every decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-060]** Mandatory TDD Verification
- **Type:** Quality
- **Description:** Code is never presented as "done" without a 100% test pass rate in a clean sandbox, providing empirical proof of correctness.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-061]** Agent-Oriented Documentation (AOD)
- **Type:** Quality
- **Description:** Every module includes .agent.md documentation, ensuring the project is as readable to humans as it is to agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-062]** Human-in-the-Loop Sign-off
- **Type:** Strategic
- **Description:** All architectural decisions (PRD/TAS) require explicit user approval, ensuring significant human "creative direction" is part of the audit trail.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-063]** Zero-Data-Retention Option
- **Type:** Security
- **Description:** Support for Enterprise LLM endpoints that guarantee user code is not used for model training.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-064]** Origin Traceability
- **Type:** Quality
- **Description:** Every requirement is traced from the user's initial prompt to the final code, providing a clear map of human intent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-065]** The "Architecture-First" Differentiator
- **Type:** Strategic
- **Description:** Focus on the Deep Research and TAS phase which general-purpose assistants currently ignore.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-066]** Agentic Observability (MCP)
- **Type:** Technical
- **Description:** Build the most robust MCP-native debugging environment, making 'devs'-generated projects easier to maintain than generic AI-scaffolded ones.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-067]** Idiomatic Pattern Enforcement
- **Type:** Quality
- **Description:** The Reviewer Agent uses a "Clean Code" prompt to ensure generated code follows standard community patterns (e.g., SOLID, Clean Architecture).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-068]** Automated Onboarding
- **Type:** Quality
- **Description:** Every project includes an onboarding.agent.md that explains the architecture to any new developer (human or AI).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-069]** Filesystem Restoration
- **Type:** Reliability
- **Description:** The orchestrator executes a git checkout <commit_hash> --force to restore the work tree.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-070]** Relational State Rollback
- **Type:** Reliability
- **Description:** ACID-compliant deletion of all records in agent_logs, tasks, and requirements with timestamps succeeding the target snapshot.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-071]** Vector Memory Pruning
- **Type:** Reliability
- **Description:** Temporal filtering of LanceDB queries to exclude semantic embeddings generated after the rewind point, preventing "future knowledge" hallucinations.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-072]** Dirty Workspace Detection
- **Type:** Reliability
- **Description:** The system MUST detect uncommitted manual changes and prompt for git stash or discard before proceeding.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-073]** Schema Drift Reconciliation
- **Type:** Reliability
- **Description:** If a task involved a database schema migration, the system MUST run a "Schema Reconciliation" turn to revert the local database instance.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-074]** Agent Suspension
- **Type:** Technical
- **Description:** The active task is moved to PAUSED_FOR_INTERVENTION, and the sandbox is preserved ("Suspended State").
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-075]** User Intervention
- **Type:** Operational
- **Description:** The user manually modifies the code in src/.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-074]

### **[8_RISKS-REQ-076]** Contextual Ingestion
- **Type:** Technical
- **Description:** Upon resume, the agent executes a diff_analysis tool to identify user changes and updates its Medium-term Memory.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-075]

### **[8_RISKS-REQ-077]** DNA Encoding
- **Type:** Technical
- **Description:** The user's fix is vectorized into Long-term Memory as a USER_PREFERENCE to ensure future agents adhere to the manual logic.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-076]

### **[8_RISKS-REQ-078]** Deep Purge
- **Type:** Technical
- **Description:** Execution of docker-compose down -v followed by a cleanup of ephemeral volumes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-079]** Image Reconstruction
- **Type:** Technical
- **Description:** Rebuild of the sandbox using the TAS-locked base image and SHA-pinned dependencies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-078]

### **[8_RISKS-REQ-080]** Fallback Registry
- **Type:** Technical
- **Description:** If the primary image registry is unreachable, the system attempts failover to a secondary mirror or local cache.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-081]** Model Failover Logic
- **Type:** Technical
- **Description:** Automatic switching of LLM providers (Gemini 3 Pro -> Claude 3.5 Sonnet -> GPT-4o) to mitigate service outages or rate-limiting.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-082]** State Preservation
- **Type:** Technical
- **Description:** The thread_id and reasoning context are serialized into a model-agnostic Markdown format to maintain continuity across provider handoffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-081]

### **[8_RISKS-REQ-083]** Audit Trail Reconstruction
- **Type:** Reliability
- **Description:** The system parses the Git repository's commit history and extracts REQ-ID and TaskID metadata from structured commit footers.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-084]** Roadmap Reconstruction
- **Type:** Quality
- **Description:** The requirement roadmap is reconstructed by cross-referencing commit tags with the specs/ documentation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-083]

### **[8_RISKS-REQ-085]** State Snapshot in commit footer
- **Type:** Reliability
- **Description:** Every commit MUST include a "State Snapshot" block in the footer containing current requirement fulfillment status.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-086]** Blame Identification
- **Type:** Quality
- **Description:** Automated analysis to find the task that introduced the regression.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-087]** Soft Rewind
- **Type:** Reliability
- **Description:** Reversion of application code to the pre-regressive state while retaining the new failing test case.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-086]

### **[8_RISKS-REQ-088]** Re-implementation
- **Type:** Quality
- **Description:** The regressive task is re-assigned with the regression failure as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-087]

### **[8_RISKS-REQ-089]** Budget Alert and Pause
- **Type:** Operational
- **Description:** Soft Limit: Pause and notify at 80% budget. Hard Limit: At 100%, the system executes a snapshot_and_freeze operation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-090]** Recovery Workflow
- **Type:** Operational
- **Description:** Project can only resume once the user updates config.json with an increased budget or authorizes a "Tier 2" model (e.g., Flash) for all subsequent tasks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-089]

### **[8_RISKS-REQ-091]** Mandatory SecretMasker
- **Type:** Security
- **Description:** All sandbox stdout/stderr MUST pass through a regex and entropy-based redaction engine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-092]** High-Entropy Detection
- **Type:** Security
- **Description:** Any contiguous string of 20+ characters with high Shannon entropy (>4.5) is replaced with [REDACTED] before being persisted or sent to the LLM.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-091]

### **[8_RISKS-REQ-093]** Local State Hardening
- **Type:** Security
- **Description:** The .devs/state.sqlite file is initialized with 0600 permissions. No secrets are ever stored in the database; only references to the host OS Keychain are permitted.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-094]** ACID-Compliant State Transitions
- **Type:** Reliability
- **Description:** All state changes (Task Status: Success -> Git Commit -> Log Write) MUST be wrapped in a database transaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-095]** Git-DB Verification on Resume
- **Type:** Reliability
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-096]** Independent Reviewer Agent
- **Type:** Quality
- **Description:** Every task implementation is reviewed by a separate agent instance with a "Hostile Auditor" prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-097]** TAS Fidelity Gate
- **Type:** Quality
- **Description:** The Reviewer Agent is provided with the TAS as its primary constraint. It MUST verify that no new top-level directories or unapproved libraries were introduced.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-098]** Agent-Oriented Documentation (AOD) Audit
- **Type:** Quality
- **Description:** The Reviewer MUST verify that the .agent.md documentation for the modified module has been updated and accurately reflects the "Agentic Hooks."
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-099]** Multi-Run Verification
- **Type:** Quality
- **Description:** Every "Green" test completion MUST be verified by running the test suite 3 consecutive times in a clean sandbox.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-100]** Flakiness Heuristics
- **Type:** Quality
- **Description:** If a test fails with different error messages across retries, the system flags it as FLAKY and pauses for human intervention.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [8_RISKS-REQ-099]

### **[8_RISKS-REQ-101]** Multi-Agent Cross-Check
- **Type:** Quality
- **Description:** Requirements distilled by one agent MUST be reviewed by a second agent using the source documents as reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-102]** Requirement Traceability Linkage
- **Type:** Quality
- **Description:** Every distilled requirement MUST link back to a specific paragraph or section in the source specs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-103]** Mandatory User Approval Gate
- **Type:** Quality
- **Description:** Distilled requirements MUST be approved by the user before Epics and Tasks are generated.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-104]** Context Pruning Heuristics
- **Type:** Quality
- **Description:** The orchestrator MUST implement semantic similarity thresholds to filter out low-relevance results from LanceDB.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-105]** Semantic Decay
- **Type:** Quality
- **Description:** Older memory entries should have their "weight" reduced over time if they contradict newer entries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-106]** RTI Metric Monitoring
- **Type:** Quality
- **Description:** The system MUST calculate a Requirement Traceability Index (RTI) at each phase to ensure 100% coverage.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-107]** Global Validation Phase
- **Type:** Quality
- **Description:** A final "Global Audit" task MUST be executed after all Epics are complete to verify every requirement ID is present in the codebase and test suite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-108]** Agentic Looping & Token Exhaustion Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Agentic Looping & Token Exhaustion risk through Entropy Detection & Turn Limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-109]** Sandbox Escape & Host Compromise Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Sandbox Escape & Host Compromise risk through Zero-Trust Containerization.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-110]** Architectural Drift & TAS Violation Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Architectural Drift & TAS Violation risk through Reviewer Agent & Fidelity Gates.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-111]** Context Saturation & Reasoning Decay Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Context Saturation & Reasoning Decay risk through Sliding Window Summarization.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-112]** Supply Chain Attacks & Typosquatting Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Supply Chain Attacks & Typosquatting risk through Dependency Whitelisting & Audits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-113]** Indirect Prompt Injection (Research) Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Indirect Prompt Injection risk through Context Delimitation & Redaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-114]** Secret Leakage in Logs/Traces Risk Mitigation
- **Type:** Privacy
- **Description:** Mitigation for Secret Leakage in Logs/Traces risk through Mandatory SecretMasker Middleware.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-115]** State Desync & ACID Violations Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for State Desync & ACID Violations risk through Transactional SQLite Persistence.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-116]** Flaky Tests & Non-Deterministic TDD Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Flaky Tests & Non-Deterministic TDD risk through Heuristic Failure Analysis.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-117]** Approval Fatigue & Human Error Risk Mitigation
- **Type:** Operational
- **Description:** Mitigation for Approval Fatigue & Human Error risk through Delta-Based Review Interfaces.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-118]** Model Reasoning Ceiling (Complex Arch) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Model Reasoning Ceiling risk through Recursive Task Decomposition.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-119]** Dependency Collision (Parallelism) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Dependency Collision risk through Task DAG Serialization Rules.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-120]** LLM API Rate Limiting & Latency Risk Mitigation
- **Type:** Operational
- **Description:** Mitigation for LLM API Rate Limiting & Latency risk through Exponential Backoff & Caching.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-121]** Hallucinated Requirements Distillation Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Hallucinated Requirements Distillation risk through Multi-Agent Cross-Check & User Gate.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-122]** Stale/Irrelevant Vector Memory Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Stale/Irrelevant Vector Memory risk through Context Pruning & Semantic Decay.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-123]** Sandbox Resource Exhaustion (OOM/Disk) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Sandbox Resource Exhaustion risk through Cgroups & Ephemeral Cleanup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-124]** Insecure Generated Code Patterns Risk Mitigation
- **Type:** Security
- **Description:** Mitigation for Insecure Generated Code Patterns risk through Automated SAST & Security Spec.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-125]** Agent Deadlock (Reviewer vs Dev) Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Agent Deadlock risk through User Clarification & Pivot Logic.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-126]** Market Research Hallucination Risk Mitigation
- **Type:** Strategic
- **Description:** Mitigation for Market Research Hallucination risk through Cite-Checking & Source Validation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-127]** Git History Corruption/Conflicts Risk Mitigation
- **Type:** Reliability
- **Description:** Mitigation for Git History Corruption/Conflicts risk through Atomic Snapshots & State Locking.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-128]** VSCode Extension Resource Overload Risk Mitigation
- **Type:** Performance
- **Description:** Mitigation for VSCode Extension Resource Overload risk through Off-Main-Thread Processing.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-129]** Requirement Traceability Gaps Risk Mitigation
- **Type:** Quality
- **Description:** Mitigation for Requirement Traceability Gaps risk through RTI Metric & Global Validation Phase.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-130]** Execution Environment Non-Determinism Risk Mitigation
- **Type:** Technical
- **Description:** Mitigation for Execution Environment Non-Determinism risk through Canonical Sandbox Images.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-131]** Ecosystem Dependency & Model Lock-in Risk
- **Type:** Technical
- **Description:** Risk that 'devs' is heavily optimized for Gemini 3 Pro and MCP protocol, potentially becoming obsolete if standards shift.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-132]** Economic Viability (Token Inflation) Risk
- **Type:** Strategic
- **Description:** Risk that project generation cost exceeds solo "Maker" budget due to agent inefficiency or retries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-133]** Professional Trust & "Black-Box" Resistance Risk
- **Type:** Strategic
- **Description:** Risk that senior architects reject AI-generated code due to lack of control or auditing difficulty.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-134]** Intellectual Property (IP) & Copyright Uncertainty Risk
- **Type:** Strategic
- **Description:** Risk regarding legal precedents of copyrightability of AI-generated code.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-135]** Competitive Encroachment (Platform Erosion) Risk
- **Type:** Strategic
- **Description:** Risk that major IDE players integrate orchestration natively, rendering 'devs' redundant.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-136]** Maintenance & "Agentic Debt" Risk
- **Type:** Quality
- **Description:** Risk that AI-generated code is "alien" to human maintainers and requires AI for maintenance.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-137]** Long-Term Memory Hallucination Unknown
- **Type:** Quality
- **Description:** Uncertainty if retrieval noise will increase as the vector store grows.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-138]** Multi-Agent Conflict Unknown
- **Type:** Technical
- **Description:** Uncertainty on how to resolve deep disagreements between Developer and Reviewer agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[8_RISKS-REQ-139]** Sandbox Latency at Scale Unknown
- **Type:** Technical
- **Description:** Uncertainty regarding performance bottlenecks for large projects with many tasks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None
