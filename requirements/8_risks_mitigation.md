### **[RSK-001]** Agentic Looping & Token Exhaustion
- **Type:** Technical
- **Description:** Mitigate the risk of autonomous agents getting trapped in "hallucination loops," consuming tokens without progress.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-001-1]** Deterministic Entropy Detection
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a rolling buffer of the last 3 tool observations (stdout/stderr). If SHA256(obs_n) == SHA256(obs_n-1), the entropy counter increments.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-001]

### **[REQ-RSK-001-2]** Strategy Pivot Directive
- **Type:** Technical
- **Description:** Upon an entropy count of 3, the agent is issued a mandatory SYSTEM_PIVOT instruction, forcing it to "Reason from First Principles" and ignore its previous 3 attempts.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-001-1]

### **[REQ-RSK-001-3]** Hard Turn Limits
- **Type:** Technical
- **Description:** Every task implementation is capped at 10 turns. Every Epic is capped at a total turn budget. Exceeding these triggers an immediate PAUSE_FOR_INTERVENTION.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-001]

### **[REQ-RSK-001-4]** Cost Guardrails
- **Type:** Technical
- **Description:** Real-time USD tracking per task. If a single task exceeds a user-defined threshold (default $5.00), the orchestrator suspends execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-001]

### **[RSK-002]** Sandbox Escape & Host Compromise
- **Type:** Security
- **Description:** Mitigate the risk of AI-generated code or instructions attempting to execute kernel exploits or access host keys.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-002-1]** Hardened Docker Configuration
- **Type:** Security
- **Description:** Use of minimal Alpine-based images. Containers MUST run with --cap-drop=ALL, --security-opt=no-new-privileges, and --pids-limit 128.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-002]

### **[REQ-RSK-002-2]** Network Egress Proxy
- **Type:** Security
- **Description:** Implementation sandboxes operate on a "Deny-All" policy. Dependency resolution is routed through an orchestrator-controlled proxy that enforces a whitelist (e.g., registry.npmjs.org, pypi.org).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-002]

### **[REQ-RSK-002-3]** Filesystem Virtualization
- **Type:** Security
- **Description:** The host project directory is mounted to /workspace in the sandbox. The .git and .devs folders are NOT mounted to prevent agents from corrupting history or the state machine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-002]

### **[REQ-RSK-002-4]** Resource Quotas
- **Type:** Security
- **Description:** Hard CPU (2 cores) and Memory (4GB) limits enforced via Cgroups to prevent local Denial-of-Service attacks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-002]

### **[RSK-003]** Architectural Drift & TAS Violation
- **Type:** Quality
- **Description:** Mitigate the risk of Developer Agents violating the Technical Architecture Specification to pass tests.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-003-1]** Independent Reviewer Agent
- **Type:** Quality
- **Description:** Every task implementation is reviewed by a separate agent instance with a "Hostile Auditor" prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-003]

### **[REQ-RSK-003-2]** TAS Fidelity Gate
- **Type:** Quality
- **Description:** The Reviewer Agent is provided with the TAS as its primary constraint. It MUST verify that no new top-level directories or unapproved libraries were introduced.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-003]

### **[REQ-RSK-003-3]** Agent-Oriented Documentation (AOD) Audit
- **Type:** Quality
- **Description:** The Reviewer MUST verify that the .agent.md documentation for the modified module has been updated and accurately reflects the "Agentic Hooks."
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-003]

### **[RSK-004]** Context Saturation & Reasoning Decay
- **Type:** Technical
- **Description:** Mitigate the risk of "Instruction Drift" or "Lost in the Middle" syndrome as the project grows.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-004-1]** Sliding Window Summarization
- **Type:** Technical
- **Description:** The orchestrator MUST trigger a Gemini 3 Flash task to summarize intermediate reasoning turns once the active context window exceeds 500k tokens.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-004]

### **[REQ-RSK-004-2]** Static Specification Re-Injection
- **Type:** Technical
- **Description:** Every 10 turns, the full TAS and PRD text MUST be re-injected into the prompt as "High-Priority Anchors" to reset the agent's focus.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-004]

### **[REQ-RSK-004-3]** Deterministic Context Pruning
- **Type:** Technical
- **Description:** Large tool outputs (e.g., multi-megabyte log files) MUST be summarized or truncated after 2 turns, while maintaining the full raw output in the state.sqlite for deep-querying if needed.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-004]

### **[REQ-RSK-004-4]** Architectural Lesson Vectorization
- **Type:** Technical
- **Description:** Critical decisions made mid-task are vectorized into LanceDB (Long-term Memory) to ensure they persist across Epics even if the short-term context is cleared.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-004]

### **[RSK-005]** Supply Chain Attacks & Typosquatting
- **Type:** Security
- **Description:** Mitigate the risk of agents installing malicious packages due to hallucinations or poisoned research.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-005-1]** TAS-Approved Library List
- **Type:** Security
- **Description:** The Architect Agent generates an "Allowed Libraries" manifest in the TAS. The Developer Agent is blocked from adding new top-level dependencies without a re-architecting phase and human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-005]

### **[REQ-RSK-005-2]** Post-Install Audit Gate
- **Type:** Security
- **Description:** Every dependency installation turn MUST be followed by an automated audit (e.g., npm audit). Any "High" or "Critical" vulnerability triggers a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-005]

### **[REQ-RSK-005-3]** Lockfile Integrity
- **Type:** Security
- **Description:** The system enforces the presence of a lockfile. Any task that modifies package.json without updating the lockfile is rejected by the Reviewer Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-005]

### **[RSK-006]** Indirect Prompt Injection (Research Phase)
- **Type:** Security
- **Description:** Mitigate the risk of malicious instructions embedded in external sources overriding the agent's system prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-006-1]** Untrusted Context Delimitation
- **Type:** Security
- **Description:** All data ingested from external sources MUST be wrapped in strict delimiters (e.g., <untrusted_research_data>) in the LLM prompt.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-006]

### **[REQ-RSK-006-2]** High-Reasoning Sanitization
- **Type:** Security
- **Description:** A "Sanitizer Agent" (using Gemini 3 Flash) pre-processes all research data to identify and strip imperative language or "jailbreak" patterns before it reaches the Architect Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-006]

### **[RSK-007]** Secret Leakage in Logs/Traces
- **Type:** Privacy
- **Description:** Mitigate the risk of agents printing secrets (API keys, local paths) to logs or traces.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-007-1]** Mandatory SecretMasker
- **Type:** Security
- **Description:** All sandbox stdout/stderr MUST pass through a regex and entropy-based redaction engine.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-007]

### **[REQ-RSK-007-2]** High-Entropy Detection
- **Type:** Security
- **Description:** Any contiguous string of 20+ characters with high Shannon entropy (>4.5) is replaced with [REDACTED] before being persisted or sent to the LLM.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-007-1]

### **[REQ-RSK-007-3]** Local State Hardening
- **Type:** Security
- **Description:** The .devs/state.sqlite file is initialized with 0600 permissions. No secrets are ever stored in the database; only references to the host OS Keychain are permitted.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-007]

### **[RSK-008]** State Desync & ACID Violations
- **Type:** Technical
- **Description:** Mitigate the risk of system crashes leaving the database and Git repository in a mismatched state.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-008-1]** ACID-Compliant State Transitions
- **Type:** Technical
- **Description:** All state changes (Task Status: Success -> Git Commit -> Log Write) MUST be wrapped in a database transaction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-008]

### **[REQ-RSK-008-2]** Git-DB Verification on Resume
- **Type:** Technical
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-008]

### **[RSK-009]** Flaky Tests & Non-Deterministic TDD
- **Type:** Quality
- **Description:** Mitigate the risk of agents writing flaky tests that lead to false positives or endless retries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-009-1]** Multi-Run Verification
- **Type:** Quality
- **Description:** Every "Green" test completion MUST be verified by running the test suite 3 consecutive times in a clean sandbox.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-009]

### **[REQ-RSK-009-2]** Flakiness Heuristics
- **Type:** Quality
- **Description:** If a test fails with different error messages across retries, the system flags it as FLAKY and pauses for human intervention.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-009]

### **[RSK-010]** Approval Fatigue & Human Error
- **Type:** Operational
- **Description:** Mitigate the risk of users blindly approving changes to maintain velocity.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-010-1]** High-Signal Diff UI
- **Type:** UX
- **Description:** Approvals MUST highlight semantic changes (e.g., "New Dependency Added", "Security Policy Modified") rather than raw text diffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-010]

### **[REQ-RSK-010-2]** Logic Anomaly Alerts
- **Type:** Technical
- **Description:** The Reviewer Agent MUST flag if a user directive contradicts a previously established "Long-term Memory" constraint, requiring an explicit confirmation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-010]

### **[REQ-RSK-010-3]** Staggered Review Cadence
- **Type:** UX
- **Description:** Users can configure "Batch Approval" for P1 tasks while requiring individual sign-off for P3 architectural changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-010]

### **[RSK-011]** Model Reasoning Ceiling (Complex Arch)
- **Type:** Technical
- **Description:** Mitigate the risk of the LLM failing to comprehend complex architectural abstractions.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-011-1]** Recursive Decomposition
- **Type:** Technical
- **Description:** If an agent identifies a task as "High Complexity," the Architect Agent MUST be invoked to break it down into smaller, atomic sub-tasks (max 200 LoC per task).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-011]

### **[REQ-RSK-011-2]** Multi-Agent Chain-of-Thought
- **Type:** Technical
- **Description:** Complex tasks use a "Primary Developer" and a "Shadow Architect" working in parallel. The Shadow Architect reviews the PlanNode before code is written.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-011]

### **[REQ-RSK-011-3]** Expert Refinement Gates
- **Type:** Technical
- **Description:** Users can mark specific modules as "Expert Only," forcing the orchestrator to use the highest-reasoning model and requiring a 3-agent logic verification before commit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-011]

### **[RSK-012]** Dependency Collision (Parallelism)
- **Type:** Technical
- **Description:** Mitigate the risk of parallel agents modifying the same shared files simultaneously.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-012-1]** File-Level Write Locking
- **Type:** Technical
- **Description:** The orchestrator MUST maintain a "Write Lock" on all files within the active task's input_files scope. No two parallel tasks can have overlapping writable file sets.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-012]

### **[REQ-RSK-012-2]** Manifest Serialization
- **Type:** Technical
- **Description:** Modifications to global manifests (package.json, Cargo.toml) MUST be serialized through a central "Dependency Orchestrator" agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-012]

### **[REQ-RSK-012-3]** Post-Parallel Validation
- **Type:** Technical
- **Description:** After parallel tasks merge, the system MUST run a "Global Epic Test" to ensure no side-effect regressions were introduced by the combined changes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-012]

### **[RSK-013]** LLM API Rate Limiting & Latency
- **Type:** Operational
- **Description:** Mitigate the risk of Gemini API rate limits stalling the orchestrator.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-013-1]** Tiered Model Failover
- **Type:** Technical
- **Description:** If Gemini 3 Pro is rate-limited, the system MUST automatically route non-reasoning tasks (linting, basic unit tests) to Gemini 3 Flash.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-013]

### **[REQ-RSK-013-2]** Jittered Exponential Backoff
- **Type:** Technical
- **Description:** Mandatory implementation of exponential backoff (Base 2s, Max 60s) for all 429 (Rate Limit) errors.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-013]

### **[REQ-RSK-013-3]** Intelligent Token Budgeting
- **Type:** Technical
- **Description:** The orchestrator tracks token usage in real-time and slows down parallel execution if the project is within 10% of its hard limit.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-013]

### **[RSK-014]** Hallucinated Requirements Distillation
- **Type:** Quality
- **Description:** Mitigate the risk of agents inventing requirements during distillation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-014-1]** Multi-Agent Cross-Check
- **Type:** Quality
- **Description:** Requirements distilled by one agent MUST be reviewed by a second agent using the source documents as reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-014]

### **[REQ-RSK-014-2]** Requirement Traceability Linkage
- **Type:** Quality
- **Description:** Every distilled requirement MUST link back to a specific paragraph or section in the source specs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-014]

### **[REQ-RSK-014-3]** Mandatory User Approval Gate
- **Type:** Quality
- **Description:** Distilled requirements MUST be approved by the user before Epics and Tasks are generated.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-014]

### **[RSK-015]** Stale/Irrelevant Vector Memory
- **Type:** Quality
- **Description:** Mitigate the risk of outdated architectural decisions confusing the agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-015-1]** Context Pruning Heuristics
- **Type:** Quality
- **Description:** The orchestrator MUST implement semantic similarity thresholds to filter out low-relevance results from LanceDB.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-015]

### **[REQ-RSK-015-2]** Semantic Decay
- **Type:** Quality
- **Description:** Older memory entries should have their "weight" reduced over time if they contradict newer entries.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-015]

### **[RSK-016]** Sandbox Resource Exhaustion (OOM/Disk)
- **Type:** Technical
- **Description:** Mitigate the risk of build processes or tests exceeding container resource quotas.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-016-1]** Real-time Resource Gauges
- **Type:** Technical
- **Description:** The SandboxProvider MUST monitor stats from Docker/WebContainer and trigger an ENTROPY_PAUSE before a hard OOM kill occurs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-016]

### **[REQ-RSK-016-2]** Ephemeral Artifact Purging
- **Type:** Technical
- **Description:** Automated cleanup of node_modules/.cache, build logs, and temporary test artifacts between Epics.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-016]

### **[REQ-RSK-016-3]** Writable Volume Quotas
- **Type:** Technical
- **Description:** Enforcement of strict disk quotas on the /workspace mount using xfs_quota or container-level limits.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-016]

### **[RSK-017]** Insecure Generated Code Patterns
- **Type:** Security
- **Description:** Mitigate the risk of agents introducing common security vulnerabilities in generated code.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-017-1]** Mandatory Security Spec
- **Type:** Security
- **Description:** The Architect Agent MUST generate a 5_security_design.md for every project, which the Developer Agent is required to ingest as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-017]

### **[REQ-RSK-017-2]** Automated SAST Injection
- **Type:** Security
- **Description:** The Reviewer Agent MUST run static analysis tools (e.g., eslint-plugin-security, bandit, gosec) as part of the implementation loop.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-017]

### **[REQ-RSK-017-3]** Security-Focused Reviewer Prompt
- **Type:** Security
- **Description:** The Reviewer Agent is specifically instructed to flag patterns like eval(), dangerouslySetInnerHTML, or unparameterized queries even if they pass the functional tests.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-017]

### **[REQ-RSK-017-4]** Dependency Vulnerability Scan
- **Type:** Security
- **Description:** The Developer Agent MUST run a security audit (e.g., npm audit) after every dependency installation. Any "High" or "Critical" vulnerability MUST trigger a task failure.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-017]

### **[RSK-018]** Agent Deadlock (Reviewer vs Dev)
- **Type:** Technical
- **Description:** Mitigate the risk of Developer and Reviewer Agents entering an unresolvable loop of disagreement.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-018-1]** Arbitration Node
- **Type:** Technical
- **Description:** On the 3rd disagreement turn, a 3rd "Arbitrator Agent" (using a high-reasoning prompt) is invoked to review both reasoning traces and provide a binding decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-018]

### **[REQ-RSK-018-2]** User Escalation with RCA
- **Type:** Technical
- **Description:** If arbitration fails, the system MUST pause and present a "Conflict Analysis" report to the user, highlighting the specific PRD/TAS contradiction.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-018-1]

### **[REQ-RSK-018-3]** TAS Evolution Workflow
- **Type:** Technical
- **Description:** If the Developer Agent provides a valid technical justification for a TAS violation, the Arbitrator can propose a "TAS Revision" task for human approval.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-018-1]

### **[RSK-019]** Market Research Hallucination
- **Type:** Strategic
- **Description:** Mitigate the risk of the Research Agent hallucinating market or competitor data.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-019-1]** Source Citation Requirement
- **Type:** Quality
- **Description:** Every claim in a research report MUST be accompanied by a valid URL or document reference.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-019]

### **[REQ-RSK-019-2]** Automated Link Validation
- **Type:** Technical
- **Description:** The orchestrator MUST attempt to fetch and verify the existence of all cited URLs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-019-1]

### **[REQ-RSK-019-3]** Fact-Checker Agent
- **Type:** Technical
- **Description:** A separate agent MUST be used to cross-reference the research report against the raw scraped data to identify discrepancies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-019]

### **[RSK-020]** Git History Corruption/Conflicts
- **Type:** Reliability
- **Description:** Mitigate the risk of system crashes mid-commit leaving the repository in a corrupted state.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-020-1]** ACID-Compliant Commits
- **Type:** Technical
- **Description:** All state changes (Success -> Commit -> Log Write) MUST be wrapped in a database transaction that rolls back if the Git operation fails.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-020]

### **[REQ-RSK-020-2]** Git-DB Verification on Resume
- **Type:** Technical
- **Description:** On startup, the orchestrator MUST verify that the repository HEAD matches the git_commit_hash of the last successfully completed task in SQLite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-020]

### **[REQ-RSK-020-3]** Automatic Lockfile Cleanup
- **Type:** Technical
- **Description:** devs MUST perform a cleanup of stale .git/index.lock or .devs/state.sqlite-journal files upon startup.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-020]

### **[RSK-021]** VSCode Extension Resource Overload
- **Type:** Performance
- **Description:** Mitigate the risk of trace processing and rendering blocking the VSCode Extension Host.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-021-1]** Off-Main-Thread Execution
- **Type:** Technical
- **Description:** All trace parsing, vector search operations, and Markdown-to-HTML rendering MUST occur in a separate Worker Thread.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-021]

### **[REQ-RSK-021-2]** Virtualized Trace Streaming
- **Type:** UX
- **Description:** The VSCode Webview MUST implement virtualized lists for agent logs, rendering only the visible window of the trace.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-021]

### **[REQ-RSK-021-3]** Background Indexing
- **Type:** Technical
- **Description:** Vector DB indexing (LanceDB) MUST be throttled to avoid CPU spikes during active agent implementation turns.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-021]

### **[RSK-022]** Requirement Traceability Gaps
- **Type:** Quality
- **Description:** Mitigate the risk of requirements being "lost" during the task breakdown process.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-022-1]** RTI Metric Monitoring
- **Type:** Quality
- **Description:** The system MUST calculate a Requirement Traceability Index (RTI) at each phase to ensure 100% coverage.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-022]

### **[REQ-RSK-022-2]** Global Validation Phase
- **Type:** Quality
- **Description:** A final "Global Audit" task MUST be executed after all Epics are complete to verify every requirement ID is present in the codebase and test suite.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-022]

### **[RSK-023]** Execution Environment Non-Determinism
- **Type:** Technical
- **Description:** Mitigate the risk of environment differences leading to non-deterministic TDD failures.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-023-1]** Canonical Sandbox Images
- **Type:** Technical
- **Description:** Every project MUST use a version-locked base image (Docker/WebContainer) defined in the TAS.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-023]

### **[REQ-RSK-023-2]** Path Normalization Middleware
- **Type:** Technical
- **Description:** The orchestrator MUST use upath or similar for all internal file operations to ensure cross-platform consistency.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-023]

### **[REQ-RSK-023-3]** Environment Scrubbing
- **Type:** Technical
- **Description:** Mandatory stripping of host-specific environment variables before spawning any sandbox process.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-023]

### **[RSK-MKT-001]** Ecosystem Dependency & Model Lock-in
- **Type:** Strategic
- **Description:** Mitigate the risk of obsolescence due to shifts in model pricing or IDE standards.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-001-1]** Multi-Model Failover Architecture
- **Type:** Technical
- **Description:** The Agent Factory MUST be designed to support Anthropic (Claude 3.5 Sonnet) and OpenAI (GPT-4o) as secondary providers, even if context window performance degrades.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-001]

### **[REQ-RSK-MKT-001-2]** Headless CLI Parity
- **Type:** Technical
- **Description:** Ensure the CLI remains fully functional without the VSCode Extension to mitigate risk of IDE-specific breakages.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-001]

### **[REQ-RSK-MKT-001-3]** Open-Standard MCP Compliance
- **Type:** Technical
- **Description:** Adhere strictly to the public MCP spec rather than proprietary extensions to ensure compatibility with future agentic tools.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-001]

### **[RSK-MKT-002]** Economic Viability (Token Inflation)
- **Type:** Strategic
- **Description:** Mitigate the risk of project costs exceeding the budget due to agent inefficiency.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-002-1]** Tiered Model Orchestration
- **Type:** Technical
- **Description:** Mandatory use of Gemini 3 Flash for routine tasks (Linting, simple code reviews) to reduce cost by up to 80% compared to Pro-only execution.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-002]

### **[REQ-RSK-MKT-002-2]** Pre-Execution Cost Estimation
- **Type:** Technical
- **Description:** Phase 3 (Distillation) MUST provide a "Project Token Estimate" (+/- 20%) before implementation begins.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-002]

### **[REQ-RSK-MKT-002-3]** Caching & Memoization
- **Type:** Technical
- **Description:** Orchestrator MUST cache successful research results and distilled requirements across project attempts to avoid redundant API calls.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-002]

### **[RSK-MKT-003]** Professional Trust & "Black-Box" Resistance
- **Type:** Strategic
- **Description:** Mitigate architect rejection of AI-generated code due to lack of control or auditability.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-003-1]** The Glass-Box Audit Trail
- **Type:** Technical
- **Description:** Every commit MUST be linked to a queryable reasoning trace (SAOP_Envelope) in SQLite, allowing architects to inspect the "Why" behind every decision.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-003]

### **[REQ-RSK-MKT-003-2]** Mandatory TDD Verification
- **Type:** Technical
- **Description:** Code is never presented as "done" without a 100% test pass rate in a clean sandbox, providing empirical proof of correctness.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-003]

### **[REQ-RSK-MKT-003-3]** Agent-Oriented Documentation (AOD)
- **Type:** Technical
- **Description:** Every module includes .agent.md documentation, ensuring the project is as readable to humans as it is to agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-003]

### **[RSK-MKT-004]** Intellectual Property (IP) & Copyright Uncertainty
- **Type:** Strategic
- **Description:** Mitigate legal concerns regarding the copyrightability of AI-generated code.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-004-1]** Human-in-the-Loop Sign-off
- **Type:** Operational
- **Description:** All architectural decisions (PRD/TAS) require explicit user approval, ensuring significant human "creative direction" is part of the audit trail.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-004]

### **[REQ-RSK-MKT-004-2]** Zero-Data-Retention Option
- **Type:** Security
- **Description:** Support for Enterprise LLM endpoints that guarantee user code is not used for model training.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-004]

### **[REQ-RSK-MKT-004-3]** Origin Traceability
- **Type:** Technical
- **Description:** Every requirement is traced from the user's initial prompt to the final code, providing a clear map of human intent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-004]

### **[RSK-MKT-005]** Competitive Encroachment (Platform Erosion)
- **Type:** Strategic
- **Description:** Mitigate the risk of IDEs integrating full project orchestration natively.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-005-1]** The "Architecture-First" Differentiator
- **Type:** Technical
- **Description:** Focus on the Deep Research and TAS phase which general-purpose assistants currently ignore.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-005]

### **[REQ-RSK-MKT-005-2]** Agentic Observability (MCP)
- **Type:** Technical
- **Description:** Build the most robust MCP-native debugging environment, making 'devs'-generated projects easier to maintain than generic AI-scaffolded ones.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-005]

### **[RSK-MKT-006]** Maintenance & "Agentic Debt"
- **Type:** Strategic
- **Description:** Mitigate the risk of generating "alien" code that can only be maintained by AI.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-MKT-006-1]** Idiomatic Pattern Enforcement
- **Type:** Technical
- **Description:** The Reviewer Agent uses a "Clean Code" prompt to ensure generated code follows standard community patterns (e.g., SOLID, Clean Architecture).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-006]

### **[REQ-RSK-MKT-006-2]** Automated Onboarding
- **Type:** Technical
- **Description:** Every project includes an onboarding.agent.md that explains the architecture to any new developer (human or AI).
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [RSK-MKT-006]

### **[PROC-001]** Deterministic Project Rewind (Time-Travel Recovery)
- **Type:** Reliability
- **Description:** Reversion of the entire development environment to a verified historical task completion state.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-024-1]** Filesystem Restoration
- **Type:** Reliability
- **Description:** The orchestrator executes a git checkout <commit_hash> --force to restore the work tree.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-001]

### **[REQ-RSK-024-2]** Relational State Rollback
- **Type:** Reliability
- **Description:** ACID-compliant deletion of all records in agent_logs, tasks, and requirements with timestamps succeeding the target snapshot.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-001]

### **[REQ-RSK-024-3]** Vector Memory Pruning
- **Type:** Reliability
- **Description:** Temporal filtering of LanceDB queries to exclude semantic embeddings generated after the rewind point, preventing "future knowledge" hallucinations.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-001]

### **[PROC-002]** Strategy Pivot & Manual Implementation Bypass
- **Type:** Reliability
- **Description:** Mechanism to handle unresolvable agentic loops via user takeover.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-025-1]** Agent Suspension
- **Type:** Technical
- **Description:** The active task is moved to PAUSED_FOR_INTERVENTION, and the sandbox is preserved ("Suspended State").
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-002]

### **[REQ-RSK-025-2]** User Intervention
- **Type:** Operational
- **Description:** The user manually modifies the code in src/.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-025-1]

### **[REQ-RSK-025-3]** Contextual Ingestion
- **Type:** Technical
- **Description:** Upon resume, the agent executes a diff_analysis tool to identify user changes and updates its Medium-term Memory.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-025-2]

### **[REQ-RSK-025-4]** DNA Encoding
- **Type:** Technical
- **Description:** The user's fix is vectorized into Long-term Memory as a USER_PREFERENCE to ensure future agents adhere to the manual logic.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-025-2]

### **[PROC-003]** Sandbox Reconstruction & Image Failover
- **Type:** Reliability
- **Description:** Mechanism to recover from container compromise or environment corruption.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-026-1]** Deep Purge
- **Type:** Technical
- **Description:** Execution of docker-compose down -v followed by a cleanup of ephemeral volumes.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-003]

### **[REQ-RSK-026-2]** Image Reconstruction
- **Type:** Technical
- **Description:** Rebuild of the sandbox using the TAS-locked base image and SHA-pinned dependencies.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-026-1]

### **[PROC-004]** Multi-Model API Failover & Redundancy
- **Type:** Reliability
- **Description:** Automatic switching of LLM providers to mitigate service outages.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-027-1]** State Preservation
- **Type:** Technical
- **Description:** The thread_id and reasoning context are serialized into a model-agnostic Markdown format to maintain continuity across provider handoffs.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-004]

### **[PROC-005]** State Reconstruction from Audit Trails
- **Type:** Reliability
- **Description:** Recovery mechanism in case of metadata directory corruption.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-028-1]** Audit Trail Reconstruction
- **Type:** Reliability
- **Description:** The system parses the Git repository's commit history and extracts REQ-ID and TaskID metadata from structured commit footers.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-005]

### **[REQ-RSK-028-2]** Roadmap Reconstruction
- **Type:** Reliability
- **Description:** The requirement roadmap is reconstructed by cross-referencing commit tags with the specs/ documentation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-028-1]

### **[PROC-006]** Automated Regression Rollback
- **Type:** Reliability
- **Description:** Mechanism to handle regressions detected by the Reviewer Agent.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-029-1]** Blame Identification
- **Type:** Technical
- **Description:** Automated analysis to find the task that introduced the regression.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-006]

### **[REQ-RSK-029-2]** Soft Rewind
- **Type:** Reliability
- **Description:** Reversion of application code to the pre-regressive state while retaining the new failing test case.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-029-1]

### **[REQ-RSK-029-3]** Re-implementation
- **Type:** Technical
- **Description:** The regressive task is re-assigned with the regression failure as a high-priority constraint.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-029-2]

### **[PROC-007]** Budget & Token Exhaustion Fallback
- **Type:** Operational
- **Description:** Mechanism to handle token budget exhaustion.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-030-1]** Budget Alert and Pause
- **Type:** Operational
- **Description:** Soft Limit: Pause and notify at 80% budget. Hard Limit: At 100%, the system executes a snapshot_and_freeze operation.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-007]

### **[REQ-RSK-030-2]** Recovery Workflow
- **Type:** Operational
- **Description:** Project can only resume once the user updates config.json with an increased budget or authorizes a "Tier 2" model (e.g., Flash) for all subsequent tasks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [REQ-RSK-030-1]

### **[UNK-001]** Long-Term Memory Hallucination
- **Type:** Technical
- **Description:** Identify risk of retrieval results introducing noise as vector store grows.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[UNK-002]** Multi-Agent Conflict
- **Type:** Technical
- **Description:** Identify risk of deep disagreements between Developer and Reviewer Agents.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[UNK-003]** Sandbox Latency at Scale
- **Type:** Performance
- **Description:** Identify risk of Docker provisioning and SecretMasker processing becoming bottlenecks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-031]** state machine robustness
- **Type:** Technical
- **Description:** The Orchestration Manager MUST ensure state machine robustness to mitigate technical and reliability risks.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** None

### **[REQ-RSK-032]** Dirty Workspace Detection
- **Type:** Reliability
- **Description:** The system MUST detect uncommitted manual changes and prompt for git stash or discard before proceeding.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-001]

### **[REQ-RSK-033]** Schema Reconciliation
- **Type:** Reliability
- **Description:** If a task involved a database schema migration, the system MUST run a "Schema Reconciliation" turn to revert the local database instance.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-001]

### **[REQ-RSK-034]** Fallback Registry
- **Type:** Technical
- **Description:** If the primary image registry is unreachable, the system attempts failover to a secondary mirror or local cache.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-003]

### **[REQ-RSK-035]** Model Failover Logic
- **Type:** Technical
- **Description:** Automatic switching of LLM providers to mitigate service outages or rate-limiting.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-004]

### **[REQ-RSK-036]** State Snapshot in commit footer
- **Type:** Reliability
- **Description:** Every commit MUST include a "State Snapshot" block in the footer containing current requirement fulfillment status.
- **Source:** Risks and Mitigation (specs/8_risks_mitigation.md)
- **Dependencies:** [PROC-005]
