# Phase 14: Hardening - Security, Policy & Performance

## Objective
Implement advanced security policies, performance optimizations, and operational compliance features. This phase focuses on hardening the orchestrator and generated projects through dedicated non-privileged user contexts, certificate pinning, AEAD cipher suite enforcement, and comprehensive audit logging. It also optimizes system performance through off-main-thread processing and background indexing.

## Requirements Covered
- [TAS-005]: TypeScript 5.4+ Strict Mode requirement
- [1_PRD-REQ-NEED-DEVS-03]: System-wide profiling requirement
- [5_SECURITY_DESIGN-REQ-SEC-EDG-001]: Legacy system crypto wrapping
- [5_SECURITY_DESIGN-REQ-SEC-EDG-002]: Host entropy management
- [9_ROADMAP-TAS-804]: Project self-host feature implementation
- [9_ROADMAP-TAS-805]: Agent-ready project templates generation
- [TAS-006]: package.json devs section requirements
- [TAS-007]: Gemini 3 Pro reasoning model integration
- [TAS-008]: Gemini 3 Flash utility model integration
- [TAS-026]: Rate limit handling with exponential backoff
- [TAS-063]: Requirement mapping in code comments
- [TAS-071]: Scaling traces archival strategy
- [1_PRD-REQ-SEC-006]: Prompt injection mitigation
- [1_PRD-REQ-SEC-007]: Dependency vulnerability scanning
- [1_PRD-REQ-SEC-008]: Explicit allow-lists for package managers
- [1_PRD-REQ-SEC-012]: Structured prompting with delimiters
- [1_PRD-REQ-SEC-013]: Vulnerability trigger for task failure
- [1_PRD-REQ-CON-001]: Rate limiting & token management
- [1_PRD-REQ-CON-003]: Conflict resolution between agents
- [1_PRD-REQ-CON-005]: Dependency management enforcement
- [1_PRD-REQ-PERF-002]: Tiered model orchestration
- [1_PRD-REQ-PERF-003]: Parallel task execution in sandboxes
- [1_PRD-REQ-GOAL-001]: Compression of Time-to-Market (TTM)
- [1_PRD-REQ-GOAL-003]: Absolute User Agency & Control
- [1_PRD-REQ-GOAL-006]: Proactive entropy detection
- [1_PRD-REQ-GOAL-008]: Secure, sandboxed autonomy
- [1_PRD-REQ-MET-004]: Architectural Fidelity Score (AFS)
- [1_PRD-REQ-MET-009]: Sandbox provisioning latency target
- [1_PRD-REQ-MET-010]: Context optimization efficiency target
- [1_PRD-REQ-MET-013]: Approval latency metric
- [1_PRD-REQ-MET-016]: Zero sandbox escapes target
- [1_PRD-REQ-PIL-003]: Strict TDD loop requirement
- [3_MCP-REQ-GOAL-005]: Strict TDD loop (MCP)
- [2_TAS-REQ-005]: Verification process requirement
- [2_TAS-REQ-006]: get_project_status tool requirement
- [2_TAS-REQ-007]: inject_directive tool requirement
- [2_TAS-REQ-008]: rewind_to_task tool requirement
- [2_TAS-REQ-009]: inspect_state tool requirement
- [2_TAS-REQ-010]: run_profiler tool requirement
- [2_TAS-REQ-011]: execute_query tool requirement
- [2_TAS-REQ-012]: bootstrap-sandbox script requirement
- [2_TAS-REQ-013]: run-mcp script requirement
- [2_TAS-REQ-014]: validate-all script requirement
- [9_ROADMAP-TAS-203]: Build Network Egress Proxy
- [9_ROADMAP-TAS-207]: Implement resource quotas for sandboxes
- [9_ROADMAP-TAS-803]: Develop Benchmarking Suite
- [9_ROADMAP-REQ-018]: SAOP Compliance validation
- [9_ROADMAP-REQ-020]: Sandbox Isolation verification
- [9_ROADMAP-REQ-021]: Redaction Accuracy benchmark
- [9_ROADMAP-REQ-022]: Surgical Precision benchmark
- [9_ROADMAP-REQ-023]: MCP Handshake success rate
- [9_ROADMAP-REQ-024]: Parallelization efficiency
- [9_ROADMAP-REQ-025]: Source Credibility score
- [9_ROADMAP-REQ-026]: Content Extraction benchmark
- [9_ROADMAP-REQ-027]: Document Validity linting
- [9_ROADMAP-REQ-028]: Visual Correctness rendering
- [9_ROADMAP-REQ-029]: Architectural Traceability index
- [9_ROADMAP-REQ-030]: Requirement Coverage index
- [9_ROADMAP-REQ-031]: DAG Determinism validation
- [9_ROADMAP-REQ-032]: Cost Heuristics benchmark
- [9_ROADMAP-REQ-033]: TDD Fidelity benchmark
- [9_ROADMAP-REQ-034]: Reviewer Autonomy benchmark
- [9_ROADMAP-REQ-035]: Entropy Prevention speed
- [9_ROADMAP-REQ-036]: Real-time Streaming FPS
- [9_ROADMAP-REQ-037]: State Synchronization desync
- [9_ROADMAP-REQ-038]: Rewind Fidelity match
- [9_ROADMAP-REQ-039]: Self-Host success metric
- [9_ROADMAP-REQ-040]: Global Audit pass rate
- [9_ROADMAP-REQ-041]: AOD Density ratio
- [9_ROADMAP-REQ-042]: Global Validation phase implementation
- [9_ROADMAP-REQ-043]: Protocol Freeze milestone
- [9_ROADMAP-REQ-044]: Sandbox provisioning latency risk
- [9_ROADMAP-REQ-045]: Task Granularity cap
- [9_ROADMAP-REQ-046]: Entropy Buffer allocation
- [9_ROADMAP-REQ-047]: State Recovery Time KPI
- [9_ROADMAP-REQ-048]: KPI: Research Citation Count > 5
- [9_ROADMAP-REQ-049]: KPI: TAR > 85%, TTFC < 1hr
- [5_SECURITY_DESIGN-REQ-SEC-STR-001]: Agent identity enforcement
- [5_SECURITY_DESIGN-REQ-SEC-STR-005]: Resource quotas and timeouts
- [5_SECURITY_DESIGN-REQ-SEC-STR-006]: Host-level execution prevention
- [5_SECURITY_DESIGN-REQ-SEC-SD-010]: Dedicated non-privileged user context
- [5_SECURITY_DESIGN-REQ-SEC-SD-011]: Directory hardening (0700)
- [5_SECURITY_DESIGN-REQ-SEC-SD-019]: Host keychain integration
- [5_SECURITY_DESIGN-REQ-SEC-SD-021]: Ephemeral GitHub/VCS tokens
- [5_SECURITY_DESIGN-REQ-SEC-SD-022]: Mandatory approval junctions
- [5_SECURITY_DESIGN-REQ-SEC-SD-024]: Directive injection authorization
- [5_SECURITY_DESIGN-REQ-SEC-SD-025]: Default-secure auth boilerplate
- [5_SECURITY_DESIGN-REQ-SEC-SD-027]: Mandatory TLS 1.3
- [5_SECURITY_DESIGN-REQ-SEC-SD-028]: Cipher suite enforcement (AEAD)
- [5_SECURITY_DESIGN-REQ-SEC-SD-029]: Certificate pinning implementation
- [5_SECURITY_DESIGN-REQ-SEC-SD-036]: Filesystem permission hardening
- [5_SECURITY_DESIGN-REQ-SEC-SD-044]: Secure deletion (devs purge)
- [5_SECURITY_DESIGN-REQ-SEC-SD-056]: Automated vulnerability gates
- [5_SECURITY_DESIGN-REQ-SEC-SD-063]: Sandbox violation alerts
- [5_SECURITY_DESIGN-REQ-SEC-SD-064]: Requirement-to-Commit traceability
- [5_SECURITY_DESIGN-REQ-SEC-SD-075]: Security alert table
- [5_SECURITY_DESIGN-REQ-SEC-SD-077]: Command-line auditing tool (devs trace)
- [5_SECURITY_DESIGN-REQ-SEC-SD-078]: Compliance & Traceability export
- [5_SECURITY_DESIGN-REQ-SEC-SD-079]: Log integrity & purge (GDPR)
- [5_SECURITY_DESIGN-REQ-SEC-SD-083]: Escalation pause state
- [5_SECURITY_DESIGN-REQ-SEC-SD-086]: Data minimization policy
- [5_SECURITY_DESIGN-REQ-SEC-SD-087]: Right to erasure implementation
- [5_SECURITY_DESIGN-REQ-SEC-RSK-001]: Sandbox escape risk mitigation
- [5_SECURITY_DESIGN-REQ-SEC-RSK-002]: Token redaction latency optimization
- [5_SECURITY_DESIGN-REQ-SEC-RSK-101]: Identity spoofing mitigation
- [5_SECURITY_DESIGN-REQ-SEC-RSK-201]: Redaction hash collision mitigation
- [5_SECURITY_DESIGN-REQ-SEC-RSK-901]: Sandbox performance overhead monitoring
- [5_SECURITY_DESIGN-REQ-SEC-THR-001]: Trojan requirement mitigation
- [5_SECURITY_DESIGN-REQ-SEC-THR-003]: Recursive resource drain protection
- [5_SECURITY_DESIGN-REQ-SEC-QST-001]: Local-only model support evaluation
- [5_SECURITY_DESIGN-REQ-SEC-QST-002]: Host-aware agent implementation
- [5_SECURITY_DESIGN-REQ-SEC-QST-201]: Post-quantum cryptography evaluation
- [5_SECURITY_DESIGN-REQ-SEC-QST-901]: Context injection risk evaluation
- [5_SECURITY_DESIGN-REQ-SEC-QST-902]: Native extension sandbox support
- [8_RISKS-REQ-005]: Cost guardrails implementation
- [8_RISKS-REQ-007]: Network Egress Proxy requirement
- [8_RISKS-REQ-009]: Resource quotas (Cgroups) requirement
- [8_RISKS-REQ-031]: Intelligent token budgeting requirement
- [8_RISKS-REQ-033]: Ephemeral artifact purging
- [8_RISKS-REQ-035]: Off-main-thread execution logic
- [8_RISKS-REQ-063]: Zero-data-retention option requirement
- [8_RISKS-REQ-089]: Budget alert and pause logic
- [8_RISKS-REQ-117]: Approval fatigue risk mitigation
- [8_RISKS-REQ-120]: LLM API rate limiting mitigation
- [8_RISKS-REQ-124]: Insecure generated code mitigation
- [8_RISKS-REQ-128]: VSCode extension resource overload mitigation
- [8_RISKS-REQ-133]: Professional trust & black-box resistance
- [8_RISKS-REQ-134]: IP & Copyright uncertainty risk
- [8_RISKS-REQ-135]: Competitive encroachment risk
- [8_RISKS-REQ-136]: Maintenance & agentic debt risk

## Detailed Deliverables & Components
### Security Hardening
- Implement non-privileged user execution check (UID 0 block).
- Develop directory hardening utility to enforce 0700 permissions on `.devs/`.
- Build certificate pinning for Gemini API endpoints and enforce TLS 1.3 with AEAD ciphers.

### Operational Policy Engine
- Implement the `devs purge` command with secure deletion (random data overwrite).
- Develop the "Protocol Freeze" milestone logic to prevent breaking changes during implementation.
- Build the "Compliance & Traceability Export" to generate project integrity reports.

### Performance & Scaling
- Move heavy trace parsing and vector search operations to Worker Threads.
- Implement background indexing for LanceDB with CPU throttling.
- Develop the `ScaleTrace` utility to archive `agent_logs` exceeding 100MB to compressed JSON.

### Operational Dashboard
- Build the `SecurityAlertTable` to log network/filesystem violations.
- Implement the "Escalation Pause" UI when implementation attempts exceed the threshold.
- Develop real-time performance telemetry showing sandbox resource usage (CPU/RAM).

## Technical Considerations
- Ensuring `Off-Main-Thread` processing doesn't introduce race conditions in the SQLite state.
- Balancing data minimization (stripping host ENV) with agent needs for OS details.
- Maintaining sub-second responsiveness in the VSCode Webview during background trace scaling.
