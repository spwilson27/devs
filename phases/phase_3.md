# Phase 3: Communication - MCP Infrastructure & Agent Protocol

## Objective
Implement the communication backbone of `devs` using the Model Context Protocol (MCP) and the Structured Agent-Orchestrator Protocol (SAOP). This phase establishes how agents interact with the orchestrator, how tools are registered and executed, and how the internal "Flight Recorder" logs every reasoning step and tool outcome.

## Requirements Covered
- [TAS-101]: @devs/mcp standardized communication
- [1_PRD-REQ-NEED-DEVS-01]: Detailed tracing of agent communication
- [1_PRD-REQ-NEED-DOMAIN-02]: Agentic profiling via MCP
- [TAS-035]: SAOP Protocol for transparent reasoning
- [3_MCP-TAS-035]: SAOP compliance requirement
- [3_MCP-TAS-039]: Git-DB correlation requirement
- [3_MCP-TAS-041]: Binary gate protocol implementation
- [3_MCP-REQ-MCP-001]: Requirement-tagged logic
- [3_MCP-REQ-SYS-004]: Deterministic hashing for entropy
- [9_ROADMAP-REQ-SYS-003]: System requirements for MCP
- [9_ROADMAP-REQ-SYS-004]: System requirements for traceability
- [TAS-014]: Model Context Protocol integration
- [TAS-036]: MCP standard usage for all tools
- [1_PRD-REQ-INT-003]: MCP Orchestrator Server requirement
- [1_PRD-REQ-INT-011]: MCP state exposure
- [1_PRD-REQ-INT-012]: MCP Assistant querying
- [3_MCP-TAS-003]: MCP-native integration for generated code
- [3_MCP-TAS-036]: OrchestratorServer root implementation
- [3_MCP-TAS-037]: Injection of MCP into sandbox
- [3_MCP-TAS-038]: Real-time trace streaming
- [3_MCP-TAS-043]: Internal MCP server in generated projects
- [3_MCP-TAS-063]: Dynamic tool discovery via list_tools
- [3_MCP-TAS-066]: Standardized introspection interfaces
- [3_MCP-TAS-070]: Turn envelope schema & execution logic
- [3_MCP-TAS-071]: Malformed response retry protocol
- [3_MCP-TAS-072]: Partial completions resume protocol
- [3_MCP-TAS-073]: Tool timeout handling (300s)
- [3_MCP-TAS-074]: Standardized introspection points
- [3_MCP-TAS-075]: Reasoning persistence in agent_logs
- [3_MCP-TAS-076]: Immutable observations capture
- [3_MCP-TAS-077]: Core toolset implementation (get_project_context, etc.)
- [3_MCP-TAS-078]: Data models for Orchestrator
- [3_MCP-TAS-079]: Filesystem tools implementation
- [3_MCP-TAS-080]: Test and State tools implementation
- [3_MCP-TAS-081]: Lifecycle sync for ProjectServer
- [3_MCP-TAS-088]: turn_index tracking
- [3_MCP-TAS-089]: Context refresh turn
- [3_MCP-TAS-090]: Sandbox retry protocol
- [3_MCP-TAS-098]: Task-to-task handoff logic
- [3_MCP-REQ-SYS-003]: Headless First IPC
- [3_MCP-REQ-SEC-001]: Path sanitization in tools
- [3_MCP-REQ-UI-001]: Gated autonomy enforcement
- [3_MCP-REQ-UI-002]: Failure report generation
- [3_MCP-REQ-MET-008]: Tool registration manifest (index.agent.md)
- [3_MCP-REQ-MET-009]: Reviewer Agent hierarchy of concerns
- [3_MCP-REQ-MET-010]: Shadow requirement detection
- [1_PRD-REQ-SYS-004]: Agentic profiling via MCP
- [1_PRD-REQ-PIL-005]: MCP-native architecture
- [1_PRD-REQ-OBS-001]: Native MCP server integration
- [1_PRD-REQ-OBS-003]: Real-time state tracing
- [1_PRD-REQ-OBS-004]: Isolation execution via MCP
- [1_PRD-REQ-OBS-005]: Profiling via MCP
- [TAS-003]: Native agentic observability
- [TAS-035]: SAOP Protocol for transparent reasoning
- [TAS-043]: Generated project MCP API
- [TAS-062]: mcp-server/ directory requirement
- [TAS-065]: Observation standard (JSON)
- [TAS-072]: Tool execution flow (Agent -> Core -> Sandbox)
- [TAS-077]: Core toolset scoping by phase
- [2_TAS-REQ-030]: OrchestratorServer implementation
- [2_TAS-REQ-031]: ProjectServerTemplate blueprint
- [2_TAS-REQ-032]: ToolProxy bridge
- [2_TAS-REQ-006]: get_project_status tool
- [2_TAS-REQ-007]: inject_directive tool
- [2_TAS-REQ-008]: rewind_to_task tool
- [2_TAS-REQ-009]: inspect_state tool
- [2_TAS-REQ-010]: run_profiler tool
- [2_TAS-REQ-011]: execute_query tool
- [2_TAS-REQ-013]: run-mcp script
- [9_ROADMAP-TAS-106]: SAOP parser and validator
- [9_ROADMAP-TAS-205]: Setup MCP tool registry
- [9_ROADMAP-TAS-802]: Build Project MCP server template
- [9_ROADMAP-REQ-018]: SAOP Compliance validation
- [9_ROADMAP-REQ-023]: MCP handshake success rate
- [5_SECURITY_DESIGN-REQ-SEC-SD-013]: Tool call validation & schema enforcement
- [5_SECURITY_DESIGN-REQ-SEC-SD-014]: IPC Security (Handshake Token)
- [5_SECURITY_DESIGN-REQ-SEC-SD-026]: Agent-Oriented Debugging Auth
- [5_SECURITY_DESIGN-REQ-SEC-SD-031]: CLI-to-Extension Encrypted IPC
- [5_SECURITY_DESIGN-REQ-SEC-SD-032]: IPC session handshake
- [5_SECURITY_DESIGN-REQ-SEC-SD-033]: Localhost MCP security
- [5_SECURITY_DESIGN-REQ-SEC-SD-058]: Structured argument enforcement
- [5_SECURITY_DESIGN-REQ-SEC-SD-062]: Immutable audit log (nanosecond precision)
- [5_SECURITY_DESIGN-REQ-SEC-SD-065]: Immutable audit record (SAOP)
- [5_SECURITY_DESIGN-REQ-SEC-SD-066]: Metadata correlation in logs
- [5_SECURITY_DESIGN-REQ-SEC-SD-067]: Detailed observation persistence
- [5_SECURITY_DESIGN-REQ-SEC-SD-068]: Reasoning persistence
- [5_SECURITY_DESIGN-REQ-SEC-SD-073]: Trace linkage in commits
- [5_SECURITY_DESIGN-REQ-SEC-CRY-004]: Ephemeral session keys (X25519)
- [5_SECURITY_DESIGN-REQ-SEC-CRY-006]: Cryptographic MCP tools
- [8_RISKS-REQ-055]: Open-Standard MCP compliance
- [8_RISKS-REQ-059]: Glass-Box audit trail
- [8_RISKS-REQ-066]: Agentic observability (MCP differentiator)
- [4_USER_FEATURES-REQ-007]: Glass-Box trace streamer
- [4_USER_FEATURES-REQ-011]: Orchestrator control server
- [4_USER_FEATURES-REQ-012]: Project introspection server
- [4_USER_FEATURES-REQ-042]: Historical log retrieval tool
- [4_USER_FEATURES-REQ-003]: Structured audit export (--json)
- [3_MCP-UNKNOWN-101]: Multi-agent collaboration handling
- [3_MCP-UNKNOWN-201]: Multi-container MCP execution
- [3_MCP-UNKNOWN-302]: Long-running background process handling
- [UNKNOWN-801]: Multi-agent parallel execution support
- [UNKNOWN-802]: Transient sandbox flakiness handling
- [3_MCP-RISK-101]: Reasoning log volume archival strategy
- [3_MCP-RISK-102]: Schema evolution versioning
- [3_MCP-RISK-201]: Tool hallucination mitigation
- [3_MCP-RISK-202]: State pollution prevention
- [RISK-801]: Non-UTF8 tool output handling

## Detailed Deliverables & Components
### SAOP Protocol Implementation
- Define the strictly-typed JSON schema for `SAOP_Envelope` (Thought, Action, Observation).
- Implement parser and validator in `@devs/core/protocol`.
- Develop logic for turn-based interaction, including `turn_index` and `reasoning_chain` persistence.

### Orchestrator MCP Server
- Build the `OrchestratorServer` using the MCP SDK.
- Implement core tools: `get_project_context`, `search_memory`, `inject_directive`, `rewind_to_task`.
- Secure the server with Bearer Tokens and bind exclusively to `localhost`.

### ToolProxy & Sandbox Bridge
- Develop the `ToolProxy` to route agent tool calls to the `@devs/sandbox` execution layer.
- Implement schema enforcement and argument sanitization for all tool calls.
- Build the `ToolRegistry` to scope tool access based on agent role and project phase.

### ProjectServer Template
- Create the blueprint for the internal MCP server (`/mcp-server`) injected into generated projects.
- Implement introspection tools: `inspect_state`, `run_test_task`, `execute_query`, `run_profiler`.

## Technical Considerations
- Ensuring sub-second latency for trace streaming to the VSCode UI.
- Managing memory limits for the OrchestratorServer when handling large log volumes.
- Implementation of AEAD-based cipher suites for CLI-to-Extension IPC.
