# Phase 2: Security - Sandbox Isolation & Secret Redaction

## Objective
Implement the secure, ephemeral execution environment for agents. This phase focuses on containerization (Docker/WebContainers), network egress control, and the `SecretMasker` middleware to ensure that agent actions are sandboxed and sensitive data never leaks into logs or LLM context.

## Requirements Covered
- [9_ROADMAP-PHASE-002]: Sandbox Isolation & MCP Infrastructure
- [TAS-099]: @devs/sandbox module
- [TAS-080]: Execution Layer (Sandbox)
- [TAS-042]: The .agent/ directory requirement
- [TAS-045]: src and tests directory structure
- [2_TAS-REQ-024]: SandboxProvider abstraction
- [3_MCP-TAS-023]: Secret Masking implementation
- [9_ROADMAP-DOD-P2]: Execution Definition of Done
- [9_ROADMAP-REQ-SEC-001]: Security requirements for sandbox
- [9_ROADMAP-REQ-SEC-002]: Security requirements for network
- [9_ROADMAP-REQ-SEC-003]: Security requirements for secrets
- [TAS-080-1]: FilesystemManager for sandbox
- [TAS-013]: Agent Sandboxing requirement
- [1_PRD-REQ-IMP-001]: Sandbox lifecycle management
- [1_PRD-REQ-IMP-010]: Sandbox provisioning (Docker/WebContainer)
- [1_PRD-REQ-IMP-006]: Pre-flight injection into sandbox
- [1_PRD-REQ-IMP-007]: Sandbox cleanup and persistence
- [1_PRD-REQ-SEC-001]: Mandatory containerization
- [1_PRD-REQ-SEC-002]: Network egress control
- [1_PRD-REQ-SEC-003]: Filesystem integrity in sandbox
- [1_PRD-REQ-SEC-004]: Resource quotas for sandboxes
- [1_PRD-REQ-SEC-009]: Host protection (.git/.devs)
- [1_PRD-REQ-SEC-010]: Execution time cap (5 min)
- [TAS-021]: Sandbox resource constraints (2 CPU, 4GB RAM)
- [TAS-022]: Network egress policy (Default Deny)
- [5_SECURITY_DESIGN-REQ-SEC-SD-045]: Mandatory ephemeral isolation
- [5_SECURITY_DESIGN-REQ-SEC-SD-046]: Hardened Docker configuration
- [5_SECURITY_DESIGN-REQ-SEC-SD-047]: Filesystem isolation & integrity
- [5_SECURITY_DESIGN-REQ-SEC-SD-048]: Network egress & DNS filtering
- [5_SECURITY_DESIGN-REQ-SEC-SD-049]: Multi-tiered redaction in ToolProxy
- [5_SECURITY_DESIGN-REQ-SEC-SD-040]: Ephemeral sandbox environment secrets
- [5_SECURITY_DESIGN-REQ-SEC-SD-041]: Temporary directory isolation
- [5_SECURITY_DESIGN-REQ-SEC-SD-043]: Ephemeral sandbox key rotation
- [5_SECURITY_DESIGN-REQ-SEC-SD-015]: Environment isolation & sanitization
- [9_ROADMAP-TAS-201]: Hardened Docker base images
- [9_ROADMAP-TAS-202]: SandboxProvider for Docker/WebContainers
- [9_ROADMAP-TAS-203]: Network Egress Proxy with whitelist
- [9_ROADMAP-TAS-207]: Resource quotas via Cgroups
- [9_ROADMAP-REQ-SEC-004]: Sandbox Breach detection
- [3_MCP-REQ-SEC-002]: Resource quotas (4GB RSS / 100% CPU)
- [1_PRD-REQ-SEC-005]: Automated secret & PII redaction
- [1_PRD-REQ-SEC-011]: Secret replacement with [REDACTED]
- [TAS-023]: Secret masking & redaction middleware
- [9_ROADMAP-TAS-204]: SecretMasker middleware (Regex + Entropy)
- [5_SECURITY_DESIGN-REQ-SEC-STR-004]: Mandatory SecretMasker on sandbox streams
- [5_SECURITY_DESIGN-REQ-SEC-SD-038]: Pre-persistence redaction
- [5_SECURITY_DESIGN-REQ-SEC-SD-050]: Phase 1 Redaction: Patterns & Entropy
- [5_SECURITY_DESIGN-REQ-SEC-SD-051]: Phase 2 Redaction: Contextual Validation
- [5_SECURITY_DESIGN-REQ-SEC-SD-052]: Phase 3 Redaction: Replacement & Hashing
- [5_SECURITY_DESIGN-REQ-SEC-SD-039]: Reasoning log anonymization
- [5_SECURITY_DESIGN-REQ-SEC-SD-070]: UI redaction parity
- [8_RISKS-REQ-091]: Mandatory SecretMasker
- [8_RISKS-REQ-092]: High-entropy detection (>4.5)
- [8_RISKS-REQ-114]: Secret leakage risk mitigation
- [4_USER_FEATURES-REQ-021]: PII & Secret Redaction feature
- [9_ROADMAP-REQ-021]: Redaction accuracy benchmark (>99.9%)
- [9_ROADMAP-REQ-020]: Sandbox isolation verification
- [1_PRD-REQ-MET-016]: Zero sandbox escapes metric
- [4_USER_FEATURES-REQ-020]: Ephemeral sandbox isolation UI/Config
- [4_USER_FEATURES-REQ-039]: Sandbox resource exhaustion management
- [4_USER_FEATURES-REQ-082]: Sandbox escape detection
- [8_RISKS-REQ-006]: Hardened Docker configuration
- [8_RISKS-REQ-007]: Network Egress Proxy
- [8_RISKS-REQ-008]: Filesystem virtualization
- [8_RISKS-REQ-009]: Resource quotas (Cgroups)
- [8_RISKS-REQ-015]: Post-install audit gate
- [8_RISKS-REQ-028]: Dependency vulnerability scan
- [8_RISKS-REQ-034]: Writable volume quotas
- [8_RISKS-REQ-044]: Canonical sandbox images
- [8_RISKS-REQ-046]: Environment scrubbing
- [8_RISKS-REQ-078]: Deep purge of sandbox artifacts
- [8_RISKS-REQ-079]: Image reconstruction from locked base
- [8_RISKS-REQ-080]: Fallback registry support
- [8_RISKS-REQ-109]: Sandbox escape risk mitigation
- [8_RISKS-REQ-112]: Supply chain attack mitigation
- [8_RISKS-REQ-123]: Sandbox resource exhaustion mitigation
- [8_RISKS-REQ-130]: Execution environment determinism
- [8_RISKS-REQ-139]: Sandbox latency at scale unknown
- [9_ROADMAP-SPIKE-001]: WebContainer parity spike
- [9_ROADMAP-RISK-SEC-01]: WebContainer syscall compatibility
- [UNKNOWN-401]: WebContainers native dependency support
- [TAS-025]: Dependency deadlock resolution
- [2_TAS-REQ-025]: DockerDriver implementation
- [2_TAS-REQ-026]: WebContainerDriver implementation
- [2_TAS-REQ-012]: bootstrap-sandbox script
- [2_TAS-REQ-014]: validate-all script
- [REQ-SEC-003]: Filesystem protection logic

## Detailed Deliverables & Components
### Sandbox Abstraction Layer
- Implement `SandboxProvider` abstract class in `@devs/sandbox`.
- Create `DockerDriver` using Alpine-based hardened images with `--cap-drop=ALL`.
- Create `WebContainerDriver` for browser-based execution.
- Implement `FilesystemManager` to sync project files while excluding `.git` and `.devs`.

### Network & Resource Control
- Build a Network Egress Proxy that intercepts all sandbox outbound traffic.
- Implement domain whitelisting (npm, pypi, github) and "Default Deny" policy.
- Configure Cgroups/Docker limits for CPU (2 cores) and Memory (4GB).

### SecretMasker Middleware
- Develop `SecretMasker` using 100+ regex patterns and Shannon Entropy (>4.5) detection.
- Implement 3-phase redaction: identification, contextual validation (local Flash), and replacement.
- Integrate `SecretMasker` into the `ToolProxy` stream to redact all sandbox output before persistence.

## Technical Considerations
- Balancing sandbox provisioning latency (target < 30s) with strict isolation.
- Handling syscall compatibility in WebContainers for non-JS languages.
- Minimizing performance overhead of real-time entropy-based redaction.
