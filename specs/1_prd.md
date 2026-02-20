# Product Requirements Document (PRD): devs

## 1. Executive Summary

**devs** is a sophisticated, multi-agent AI orchestration platform engineered to autonomously transform high-level project descriptions and user journeys into complete, production-ready, greenfield software projects. It is designed to overcome the limitations of standard "chat-to-code" tools by enforcing a comprehensive software development lifecycle (SDLC) that mirrors professional engineering standards. **devs** is delivered through a high-performance **VSCode Extension**, a robust **CLI tool**, and a standardized **MCP (Model Context Protocol) interface**, ensuring seamless integration into existing developer workflows.

### 1.1 The "Glass-Box" Philosophy
At its heart, **devs** implements a **"Glass-Box" architecture**. This ensures that the AI's internal reasoning, architectural decisions, and tool interactions are fully transparent and auditable. The system does not jump directly from prompt to code; instead, it generates a series of authoritative, unambiguous Markdown documents and Mermaid.js diagrams. These documents (PRD, TAS, Security Design, etc.) serve as the single source of truth for both the user and the subsequent implementation agents, requiring explicit human-in-the-loop approval at critical "Gates" before proceeding to implementation.

### 1.2 Multi-Agent SDLC Pipeline
The **devs** engine utilizes a specialized workforce of agents, coordinated via **LangGraph**, to execute a six-phase development pipeline:
1.  **Research & Discovery:** Autonomous agents perform Market Research, Competitive Analysis, Technology Landscape reporting, and User Research to ground the project in reality.
2.  **Architectural Specification:** Generation of a complete document suite (9+ documents) including Technical Architecture Specifications (TAS), Security Design, and UI/UX Architecture.
3.  **Requirement Distillation:** Automated extraction and deduplication of atomic requirements from all high-level documents, ordered by technical dependencies.
4.  **Epic & Phase Planning:** Decomposition of requirements into 8-16 high-level project phases (Epics) with clear milestones.
5.  **Atomic Task Decomposition:** Breaking each Epic into 25+ atomic tasks, each mapped to specific requirements via a traceability matrix.
6.  **TDD Implementation Loop:** A rigorous, test-driven cycle involving:
    *   **Red:** Initial test writing based on the task spec.
    *   **Green:** Minimal code implementation in an isolated **Docker sandbox**.
    *   **Refactor/Review:** Mandatory secondary agent code review and automated linting/profiling via MCP-enabled tools.
    *   **Commit & Memory:** Updating project documentation and the agent's long-term memory (ChromaDB) to maintain project-wide coherence.

### 1.3 "Chronos" Time-Travel & Branching
One of the system's most innovative features is its **State Checkpointing (Time-Travel)** system. By capturing full-state snapshots (filesystem, agent memory, LLM context, and task metadata) at every significant milestone, **devs** allows users to "rewind" the development process. Users can jump back to any previous state—for instance, to change a database choice in the TAS—and "branch" development into a new path. This handles the inherent stochasticity of LLMs by making the development process version-controlled and reversible, effectively acting as "Git for the AI development process."

### 1.4 Agentic Observability & Safety
**devs** is built with "First-Class" debugging and profiling capabilities. Every generated project is natively structured to support agentic interaction via MCP servers, allowing agents to debug their own implementation errors using step-through debuggers and profilers. To protect the user and the project, **devs** includes:
*   **Sandboxing:** Execution of all untrusted code within non-privileged Docker containers.
*   **Loop Detection:** Heuristic-based monitoring to detect and terminate recursive agent behaviors or "token-runaway."
*   **Scope Guardrails:** Restricting agents to specific file subtrees and architectural constraints identified during the TAS phase.
*   **Memory Management:** A tiered memory system (Short-term task context, Medium-term epic state, Long-term project constraints) to ensure consistent decision-making over long-running development cycles.

**devs** represents a paradigm shift from AI as a "coder" to AI as a "full-stack engineering unit," providing the rigor, transparency, and quality control required for professional software creation.

## 2. Goals and Objectives

### 2.1 Strategic Project Goals
The primary mission of **devs** is to bridge the gap between high-level human intent and high-integrity software implementation. The system aims to achieve the following:

- **End-to-End Autonomous Transformation:** Deliver a seamless, multi-agent pipeline that transforms a minimal project description and user journeys into a fully functional, production-ready greenfield project. This encompasses the entire SDLC—from market research and architectural design to TDD implementation and automated documentation—eliminating the "Day 0" setup toil.
- **Architectural-First Autonomy:** Transition AI usage from ephemeral "snippets" to robust "systems" by mandating a research-driven architectural phase. This ensures that every project is grounded in a deep understanding of the market, competition, and technology landscape *before* a single line of implementation code is written. Decisions must be authoritative, unambiguous, and documented as the "Single Source of Truth."
- **The "Glass-Box" Transparency Standard:** Establish a new industry benchmark for AI auditability. Every agent reasoning step, tool invocation, and architectural decision point must be externalized in version-controlled Markdown and Mermaid.js diagrams. The system must enforce human-in-the-loop "Approval Gates" at critical milestones, ensuring the user remains the "Chief Architect" while the AI serves as the "Engineering Unit."
- **Guaranteed Functional Correctness via Mandatory TDD:** Enforce a strict Test-Driven Development (TDD) cycle as the primary gating mechanism for code acceptance. Implementation agents must follow a "Red-Green-Refactor" cycle where 100% of generated features are verified against their specific requirements. Code that fails tests or secondary agent reviews is never merged into the main project branch.
- **Stochasticity Management via "Chronos" Time-Travel:** Provide a robust, non-linear development engine that treats the agentic process as a reversible state machine. By leveraging high-fidelity state checkpointing (filesystem, vector memory, and LLM context), users can "rewind" to any previous decision (e.g., a database choice in the TAS), "branch" into a new trajectory, and resume development without re-initiating the entire workflow.
- **Native Agentic Observability & Self-Healing:** Embed Model Context Protocol (MCP) servers natively into every generated project. This empowers agents to use professional-grade debuggers, profilers, and linters to independently diagnose and resolve runtime issues, making the AI capable of "Self-Healing" during the implementation of complex features.
- **Multi-Tiered Memory for Global Coherence:** Implement a structured memory hierarchy—Short-term (Task), Medium-term (Epic), and Long-term (Project Constraints)—to ensure consistent decision-making across the entire development lifecycle. Constraints identified in the initial research (e.g., "Always use Functional Programming") must be strictly adhered to during the implementation of the final tasks.
- **Zero-Trust Resource Governance & Safety:** Maintain a "Zero-Trust" execution environment using Docker sandboxing (with optional gVisor isolation). The system must proactively monitor for "token-runaway," recursive agent loops, and unauthorized scope access, providing a secure and cost-controlled environment for autonomous code generation.

#### 2.1.1 Key Technical Challenges & Strategic Risks
Implementation of these goals must address the following unknowns and high-impact risks:
- **State Explosion in "Chronos":** Managing the storage and retrieval overhead of full-state snapshots (Git deltas + Vector DB state + LLM Context) during long-running projects.
- **Non-Deterministic TDD Failures:** Mitigating "flaky" tests generated by AI or implementation loops where the agent gets trapped attempting to solve an unsolvable architectural conflict.
- **Context Fatigue vs. Coherence:** Balancing the use of Gemini's 2M+ context window with the need for semantic summarization to prevent the "dilution" of critical architectural constraints as the codebase grows.
- **Sandbox Escape & IP Protection:** Ensuring that implementation agents cannot access sensitive host data while maintaining clear legal ownership for the user over the generated IP through human-in-the-loop "Architect" status.
- **Loop Detection Accuracy:** Tuning heuristic-based monitors to distinguish between legitimate complex problem-solving and wasteful "token-runaway" recursive behaviors.

### 2.2 Success Metrics
The success of the **devs** platform will be evaluated through a multidimensional framework focusing on architectural fidelity, autonomous reliability, operational efficiency, and system safety. These metrics are designed to ensure the system delivers production-grade software that adheres to the "Glass-Box" philosophy.

#### 2.2.1 Architectural Fidelity & Traceability
- **Requirement-to-Test Coverage:** 100% of atomic requirements (distilled in Phase 3) must have at least one associated automated test case.
- **Traceability Matrix Integrity:** Every task (Phase 5) must map back to at least one requirement and one high-level architectural decision (e.g., from the TAS or Security Design).
- **TAS Alignment Score:** 100% of generated modules and data structures must conform to the constraints defined in the Technical Architecture Specification. Any deviation must trigger an "Architectural Violation" alert for user review.
- **Diagram Consistency:** 100% of Mermaid diagrams must be updated to reflect the final "as-built" architecture by the end of each Epic.
- **Constraint Adherence:** Zero instances where an implementation agent ignores a long-term project constraint (e.g., "Always use Functional Programming") defined in the initial TAS phase.

#### 2.2.2 Implementation Quality & TDD Performance
- **TDD Success Rate (Zero-Human):** >95% of implementation tasks must reach a "Green" (test-passing) state and pass the secondary "Reviewer Agent" audit without direct human code modification.
- **Self-Healing Efficiency:** Implementation agents must successfully resolve failing tests (Red-to-Green transition) within a maximum of 3 autonomous debugging/iteration cycles using MCP-enabled debuggers.
- **Code Coverage Mandate:** Minimum 90% statement and branch coverage for all implementation-phase code, enforced by automated coverage gates.
- **Documentation Parity:** 100% of public APIs and CLI commands must have matching, up-to-date documentation in the project's memory and external docs.
- **Linting & Profiling:** 100% of generated code must pass project-specific linting rules and show no memory leaks or performance regressions as verified by MCP profiling tools.

#### 2.2.3 Operational Efficiency & Resource Governance
- **Initialization Velocity:** The transition from project description to a finalized, user-approved TAS (Phases 1-2) should complete in under 20 minutes for standard scopes.
- **Token Optimization:** <5% of total token consumption should be attributed to detected agent loops, redundant tool calls, or repeated execution of identical failing commands.
- **Epic/Task Scaling:** The system must successfully decompose a project into 8-16 Epics and 25+ atomic tasks per Epic, maintaining a clear Directed Acyclic Graph (DAG) of dependencies.
- **Context Window Utilization:** Maintain >95% reasoning coherence even as the codebase grows, utilizing semantic summarization and tiered memory to manage Gemini’s 2M+ context window efficiently.

#### 2.2.4 User Agency & "Chronos" Reliability
- **State Checkpoint Fidelity:** 100% success rate in restoring a project to a previous state (filesystem, agent memory, and vector DB) from any historical checkpoint.
- **Time-Travel Precision:** Zero data corruption or state inconsistency when "branching" development from a historical checkpoint.
- **Intervention Latency:** The system must pause and surface feedback requests within 2 seconds of encountering a "Decision Gate" or a detected loop.
- **Observability Depth:** 100% of agent reasoning (internal monologue) and tool invocations must be logged and accessible via the VSCode/CLI interface for audit.
- **Interface Parity:** 100% feature parity between the VSCode Extension UI and the CLI tool for all core operations (Research, Approval, Implementation, Time-Travel).

#### 2.2.5 Safety, Security & Sandboxing
- **Sandbox Violation Rate:** Zero successful escapes from the Docker/gVisor sandbox during the implementation and testing cycles.
- **Secret Leak Prevention:** 100% detection and automatic masking of sensitive information (API keys, credentials) in logs and checkpoints.
- **Budget Compliance:** 100% adherence to user-defined token/cost budgets. The system must proactively pause when reaching 80% and 95% of a milestone budget.
- **Vulnerability Density:** Zero "High" or "Critical" vulnerabilities in the generated code as identified by automated security scanning tools (e.g., Snyk, Trivy).
- **Scope Isolation:** Agents must be strictly prevented from modifying files outside of their current task-assigned scope or the global project documentation folder.

#### 2.2.6 Technical Questions & Implementation Risks
- **Non-Deterministic Loop Detection:** How can the system distinguish between a complex, multi-step problem-solving attempt and a wasteful recursive loop with 100% accuracy?
- **State Explosion:** What is the storage ceiling for high-fidelity state checkpoints in long-running projects with 400+ tasks?
- **Flaky Test Management:** How should the system handle non-deterministic test failures in the TDD loop to avoid "hallucinated" bug fixes?
- **MCP Server Latency:** How will high latency in custom MCP servers affect the overall implementation velocity and agent reasoning timeouts?

### 2.3 Functional Objectives
To realize these goals, the **devs** platform must satisfy the following technical objectives across the SDLC phases:

#### 2.3.1 Discovery & Design Objectives
- **Automated Domain Expertise:** Synthesize market research and competitive analysis into actionable technical constraints (e.g., identifying that a FinTech app requires specific encryption standards).
- **Unambiguous Documentation:** Generate 9+ core architectural documents (PRD, TAS, etc.) that are formatted for machine readability while remaining clear for human auditors.
- **Diagrammatic Clarity:** Standardize on Mermaid.js for all system diagrams to ensure they can be programmatically updated and version-controlled.

#### 2.3.2 Planning & Distillation Objectives
- **Requirement Traceability:** Map every atomic requirement to its source document and eventually to its implementing test and code module (Traceability Matrix).
- **Dependency-Aware Scheduling:** Construct a Directed Acyclic Graph (DAG) of project tasks to ensure implementation agents always have the necessary technical prerequisites (e.g., Database Schema before API implementation).

#### 2.3.3 Implementation & Validation Objectives
- **The TDD Hard-Gate:** Prevent the merging of any code that does not pass its associated "Red" test or fails the secondary "Reviewer Agent" audit.
- **Self-Healing Codebase:** Enable agents to interpret stack traces and profiler output via MCP to automatically iterate on failing tests until the "Green" state is achieved.
- **Documentation Parity:** Ensure READMEs, API specifications, and internal "Memory" modules are updated in sync with every code change.

### 2.4 Operational & Safety Objectives
- **Proactive Safeguarding:** Implement heuristic-based loop detection to terminate "token-runaway" (e.g., an agent repeatedly attempting the same failed `npm install`).
- **Context Optimization:** Maintain project-wide coherence using Gemini’s 2M+ context window while employing "Semantic Summarization" to prevent context fatigue in long-running projects.
- **Environment Isolation:** Standardize on Docker-based sandboxing with gVisor support for enhanced kernel-level isolation of implementation agents.

## 3. Target Audience

The **devs** platform is engineered for professional software creators who require high-autonomy agents without sacrificing architectural control or code quality. The target audience is segmented into three primary personas, each with distinct technical requirements and success criteria.

### 3.1 Primary User Personas

#### 3.1.1 The Solo Founder & "Indie Maker" (The "Architect-Owner")
*   **Profile:** Entrepreneurs or developers building MVPs and greenfield SaaS products single-handedly. They often possess broad technical knowledge but lack deep expertise in every layer of the modern stack (e.g., specialized Security or DevOps).
*   **Core Objective:** Rapidly translate a product vision into a production-ready, scalable codebase without the overhead of hiring a full engineering team.
*   **Technical Requirements:**
    *   **"CTO-in-a-Box":** Guidance on idiomatic project structure, database schema design, and security best practices.
    *   **Bootstrap Acceleration:** Automated generation of boilerplate, CI/CD pipelines, and basic CRUD infrastructure.
    *   **Cost Efficiency:** Strict "Token Budgeting" (R-016) to ensure the agentic process doesn't exceed the startup's initial capital.
*   **Key Success Metric:** Time-to-Market (TTM) for a functional, tested MVP.

#### 3.1.2 The Polyglot Senior Engineer (The "High-Velocity Implementer")
*   **Profile:** Expert developers who are proficient in multiple languages but are moving into a new stack or framework (e.g., a Java expert moving to Rust or Go).
*   **Core Objective:** Bypass the "Day 0" toil of setting up project structures, dependency management, and testing harnesses in an unfamiliar language.
*   **Technical Requirements:**
    *   **"Glass-Box" Transparency:** Ability to inspect every architectural decision and "Time-Travel" (R-014) to undo agentic hallucinations or sub-optimal library choices.
    *   **Idiomatic Implementation:** Agents must produce code that follows the specific "Best Practices" of the target language (e.g., Borrow Checker patterns in Rust, Go routines in Go).
    *   **Tooling Parity:** Integration with professional debuggers and profilers via MCP (R-018) for deep-dive investigation when the agent reaches a logic limit.
*   **Key Success Metric:** Reduction in "Context Switching" overhead and setup time.

#### 3.1.3 The Process-Driven Tech Lead (The "Governance & Quality Gatekeeper")
*   **Profile:** Engineering managers or Tech Leads in medium-to-large organizations responsible for maintaining high code standards and security compliance across teams.
*   **Core Objective:** Enable the use of AI agents in the development lifecycle while ensuring that all generated code is auditable, tested, and follows organizational standards.
*   **Technical Requirements:**
    *   **Auditability & Traceability:** A complete Traceability Matrix (R-009) connecting every line of code to a specific requirement and PRD decision.
    *   **Mandatory TDD Gating:** Zero-tolerance policy for merging code that bypasses the "Red-Green-Refactor" cycle (R-011).
    *   **Security Sandboxing:** Guaranteed isolation of implementation agents via Docker/gVisor (R-010) to prevent exposure of internal company credentials or source code.
*   **Key Success Metric:** Zero "Critical" security vulnerabilities and >90% code coverage in AI-generated modules.

### 3.2 User Needs & Pain Point Mapping

| Pain Point | User Need | **devs** Strategic Solution |
| :--- | :--- | :--- |
| **Architectural Debt** | High-quality, idiomatic project structure from Day 1. | **Discovery Agent:** Automated Research & TAS generation *before* coding starts. |
| **"Black-Box" Anxiety** | Transparency into AI decision-making. | **Glass-Box Core:** Human-approvable PRD/TAS documents and real-time "Internal Monologue" logs. |
| **Stochastic Dead-Ends** | Ability to undo "bad" AI decisions without restarting. | **Chronos System:** "Git for Prompts" allowing for state-checkpointing, branching, and rewinding. |
| **Verification Gaps** | Confidence that generated code is functional and secure. | **Mandatory TDD:** Hard-gate implementation loop requiring test-passing state for all tasks. |
| **Manual Debugging Toil** | AI agents that can fix their own runtime errors. | **Agentic Observability:** Native MCP integration for step-through debugging and profiling. |

### 3.3 Audience-Specific Edge Cases & Risks

#### 3.3.1 The "Pivot Fatigue" (Solo Maker Risk)
*   **Scenario:** A Solo Maker uses Time-Travel (R-014) too frequently to "perfect" the architecture, leading to a state of "Analysis Paralysis" or exhausting the token budget before implementation begins.
*   **Requirement:** The system should provide "Checkpoint Summaries" that highlight the cost and time implications of branching vs. continuing.

#### 3.3.2 The "Stack Hallucination" (Polyglot Engineer Risk)
*   **Scenario:** A Senior Engineer requests a niche or bleeding-edge stack (e.g., a specific beta framework in Zig). The agent may hallucinate idiomatic patterns or build commands.
*   **Requirement:** The Research Phase (Phase 1) must include a "Technology Readiness Level" (TRL) check, flagging high-risk or low-documentation libraries during the TAS phase.

#### 3.3.3 The "Compliance Drift" (Tech Lead Risk)
*   **Scenario:** Over a long-running project (400+ tasks), implementation agents might gradually "drift" away from the global constraints defined in the initial TAS (e.g., "Never use external auth libraries").
*   **Requirement:** The "Reviewer Agent" (part of R-011) must have access to the **Long-term Memory** of project-wide constraints to flag "Architectural Deviations" during the TDD cycle.

#### 3.3.4 The "Sandbox Latency" (General Risk)
*   **Scenario:** Running complex test suites in Docker containers for every atomic task (R-010) introduces significant latency, frustrating users who expect "instant" code generation.
*   **Requirement:** Support for "Incremental Test Execution" and parallelized sandbox runners to maintain high development velocity.

### 3.4 Open Questions & Unknowns
*   **User Intervention Depth:** At what point does "Human-in-the-loop" become "Human-in-the-way"? We need to define the optimal granularity of "Decision Gates" to prevent user fatigue.
*   **Legal Ownership Traceability:** How can we programmatically prove "Human Directorship" in the state checkpoints to satisfy evolving IP/Copyright laws for AI-generated code?
*   **Multi-User Collaboration:** How does the "Chronos" time-travel system handle multiple users branching the same project simultaneously? (Current scope assumes a single "Chief Architect").

## 4. Functional Requirements

### 4.1 Phase 1: Research & Documentation Phase
This phase is the foundational "Discovery" stage where the system ground-truths the user's vision against market reality and technical constraints. The system MUST operate as a multi-agent research collective, synthesizing disparate data sources into a cohesive architectural blueprint.

- **R-001 (Multi-Agent Research Collective):** The system MUST deploy specialized agents with web-search capabilities (via Google Search Tool) to generate four primary research artifacts:
    - **R-001.1 (Market Research Agent):** MUST analyze the Total Addressable Market (TAM), Serviceable Addressable Market (SAM), and Serviceable Obtainable Market (SOM). It MUST identify current industry trends, monetization strategies (SaaS, Freemium, BYOK), and regulatory hurdles (GDPR, SOC2, HIPAA).
    - **R-001.2 (Competitive Analysis Agent):** MUST perform a feature-level teardown of at least 4 top-tier competitors. It MUST generate a SWOT (Strengths, Weaknesses, Opportunities, Threats) matrix and identify "Strategic Gaps" that the project should exploit.
    - **R-001.3 (Technology Landscape Agent):** MUST evaluate the proposed tech stack against the "Technology Readiness Level" (TRL) framework. It MUST audit library maturity, GitHub activity, security vulnerability history (CVEs), and ecosystem vitality. It MUST propose "Safe" vs. "Bleeding-Edge" alternatives.
    - **R-001.4 (User Research Agent):** MUST develop 3+ detailed personas using the "Jobs-to-be-Done" (JTBD) framework. It MUST map typical friction points and generate "Empathy Maps" to guide UI/UX decisions.

- **R-002 (The High-Level Document Suite):** The system MUST distill the research artifacts into 9 authoritative Markdown documents. These documents serve as the "Single Source of Truth" (SSOT) for implementation agents.
    - **R-002.1 (Formatting Standard):** All documents MUST use GitHub-Flavored Markdown (GFM) and incorporate Mermaid.js for visual modeling (ERDs, Sequence Diagrams, Architecture Maps).
    - **R-002.2 (AI-Optimized Content):** Documents MUST be written for an AI audience—authoritative, unambiguous, and free of "flowery" language. They MUST explicitly identify problems and state final decisions.
    - **R-002.3 (Required Document List):**
        1. **PRD (Product Requirements Document):** Goals, non-goals, constraints, and success metrics.
        2. **TAS (Technical Architecture Specification):** MUST define language versions, data schemas (Mermaid ERD), API designs (OpenAPI), and component hierarchies.
        3. **MCP & AI Development Design:** MUST define Glass-Box architecture, tool interfaces, and agentic observability patterns.
        4. **User Features:** Detailed user journeys and functional feature set.
        5. **Security Design:** Threat model, encryption standards, and auth/authz protocols.
        6. **UI/UX Architecture:** Technical structure for the frontend, state management, and interaction patterns.
        7. **UI/UX Design:** Visual aesthetic, navigation flow, and design system constraints.
        8. **Risks & Mitigation:** Technical, operational, and market risk assessment with specific mitigation plans.
        9. **Project Roadmap:** Dependency-aware order of operations and milestones.

- **R-003 (Cascading Update Logic & "Decision Gating"):**
    - **R-003.1 (Approval Gates):** The system MUST pause and request explicit user approval after each document is generated or modified.
    - **R-003.2 (Feedback Propagation):** If a user rejects a decision or provides new requirements (e.g., "Change to a microservices architecture"), the system MUST perform a "Cascading Impact Analysis." It MUST identify all affected requirements in downstream documents and trigger an automated regeneration of those specific sections to maintain project-wide coherence.
    - **R-003.3 (Decision Logs):** Every document MUST maintain a persistent `## Decisions Log` that records the technical rationale, rejected alternatives, and user-driven changes to prevent "Memory Drift" in later phases.

- **R-004 (Research Technical Constraints):**
    - **R-004.1 (Source Attribution):** Research agents MUST provide citations for all market data and technical recommendations to allow for user verification.
    - **R-004.2 (Conflict Resolution):** If research streams produce contradictory results (e.g., Market Research suggests a feature that Technology Landscape deems high-risk), the system MUST surface this "Technical Tension" to the user for a final executive decision during the TAS phase.
    - **R-004.3 (Hallucination Guardrails):** Agents MUST verify the existence of all proposed libraries/APIs by attempting to fetch their documentation or version history before including them in the TAS.

### 4.2 Phase 2: Requirement Distillation & Tasking (The "Orchestrator")
This phase represents the critical transition from high-level architectural intent to a granular, executable implementation plan. The system MUST transform the 9+ design documents into a dependency-aware graph of atomic requirements and tasks, ensuring 100% coverage and architectural fidelity.

- **R-005 (Multi-Document Requirement Distillation):**
    - **R-005.1 (Atomic Extraction):** The system MUST employ specialized NLP agents to parse all architectural documents and extract unique "Atomic Requirements." An atomic requirement is defined as a single, testable statement of functionality, constraint, or design rule.
    - **R-005.2 (Cross-Document Normalization):** Requirements MUST be normalized into a standardized technical lexicon. The system MUST resolve conflicts where different documents describe the same feature with varying terminology.
    - **R-005.3 (Semantic Deduplication):** Using LLM-based semantic similarity, the system MUST merge redundant requirements from different source documents into a single "Master Requirement" ID, maintaining a list of all origin sources for auditability.
    - **R-005.4 (Requirement Metadata Schema):** Each distilled requirement MUST store:
        - `UID`: Unique identifier (e.g., REQ-001).
        - `Statement`: The core requirement text.
        - `Traceability`: JSON array of source document URI/line references.
        - `Category`: (e.g., Data, API, Security, UI, Logic, Infrastructure).
        - `Priority`: (Must/Should/Could) derived from document sentiment analysis.
        - `Validation_Strategy`: (e.g., Unit Test, Integration Test, Linter Rule, Profiler Check).

- **R-006 (Dependency Mapping & DAG Construction):**
    - **R-006.1 (Technical Dependency Identification):** The system MUST analyze requirements to identify "Hard" technical dependencies (e.g., the Database Schema must exist before the API Layer can be implemented).
    - **R-006.2 (Logical Sequence Optimization):** It MUST optimize the implementation sequence to minimize "Blocked" states for implementation agents, favoring parallelization where dependencies allow.
    - **R-006.3 (Directed Acyclic Graph (DAG) Generation):** The system MUST construct a formal DAG of all requirements.
    - **R-006.4 (Cycle & Conflict Detection):** The system MUST proactively detect circular dependencies or contradictory requirements (e.g., REQ-A requires REQ-B, but REQ-B is marked as "Out of Scope" in the PRD). These MUST be surfaced as "Critical Blockers" for user resolution.

- **R-007 (Epic Formulation & Milestone Planning):**
    - **R-007.1 (Functional Epic Grouping):** Requirements MUST be clustered into 8-16 "Epics" based on functional domains (e.g., "Auth & Identity," "Data Persistence Layer," "Core Logic Engine").
    - **R-007.2 (Epic Specification):** Each Epic MUST include:
        - A concise technical objective.
        - A comprehensive "Definition of Done" (DoD).
        - A summary of the architectural context (TAS/Security Design) required for its implementation.
    - **R-007.3 (Milestone Sequencing):** Epics MUST be ordered chronologically based on the underlying requirement DAG, forming the high-level Project Roadmap.

- **R-008 (Atomic Task Decomposition):**
    - **R-008.1 (Decomposition Logic):** Every Epic MUST be broken down into 25+ atomic tasks. 
    - **R-008.2 (Criteria for Atomicity):** A task is considered "Atomic" only if it meets all the following:
        - **Contextual Fit:** The required context (files, TAS refs, requirements) fits within a single LLM context window (targeting <32k tokens for the prompt).
        - **Isolation:** The task has clearly defined input and output files.
        - **Verifiability:** The task can be validated by a discrete set of automated tests that do not depend on yet-to-be-implemented features outside the task's pre-requisites.
    - **R-008.3 (Task Specification Object):** Each task MUST be a structured object containing:
        - `Implementation_Instructions`: Detailed, unambiguous steps for the agent.
        - `Target_Files`: List of files to create or modify.
        - `Prerequisite_Tasks`: IDs of tasks that MUST be completed and verified before this task begins.
        - `Requirement_IDs`: List of distilled requirements this task implements.
        - `Estimated_Complexity`: Heuristic-based token/time estimate.

- **R-009 (Traceability Matrix & The Planning Gate):**
    - **R-009.1 (Traceability Matrix Integrity):** The system MUST maintain a persistent, bidirectional matrix connecting: `Source Document -> Requirement -> Epic -> Task -> Test Case`.
    - **R-009.2 (Gap Analysis):** Before finalizing the plan, the system MUST perform an automated audit to ensure that 100% of requirements from the high-level documents are mapped to at least one task and one test.
    - **R-009.3 (User Review & Intervention):** The system MUST present the finalized Task Graph and Traceability Matrix to the user. The user MUST be able to:
        - Manually adjust task priority or dependencies.
        - Merge or split tasks if the heuristic decomposition is sub-optimal.
        - Annotate specific tasks with additional constraints or context.
    - **R-009.4 (Plan Checkpointing):** Once approved, the Task Graph is locked and versioned as a "Chronos Master Plan." Any subsequent deviation or "Time-Travel" re-planning MUST generate a new version of this graph.

### 4.3 Phase 3: TDD Implementation Loop (The "Implementation" Agent)
This phase is the high-fidelity execution engine where atomic tasks are transformed into verified, production-grade code. The system MUST enforce a strict, non-bypassable Test-Driven Development (TDD) cycle within a secure, observable, and resource-constrained environment.

- **R-010 (Secure & Observable Sandboxed Runtime):**
    - **R-010.1 (Ephemeral Docker Isolation):** Every implementation task MUST execute in a pristine, ephemeral Docker container. The system MUST dynamically provision a container image that precisely matches the runtime and toolchain defined in the Technical Architecture Specification (TAS) (e.g., `node:20-bookworm`, `python:3.11-slim`).
    - **R-010.2 (Filesystem Visibility Guardrails):** The container MUST use a "Scoped Mount" strategy. Implementation agents MUST have **Read-Write** access only to the files targeted by the current task. All other project files, including the TAS, PRD, and previous epic implementations, MUST be mounted as **Read-Only** to prevent accidental side effects or "Scope Creep."
    - **R-010.3 (Zero-Trust Network Governance):** By default, the sandbox MUST have networking disabled (using `--network none`). If the TAS explicitly identifies external API dependencies for a task, the system MUST enable a restricted network bridge governed by a whitelist of authorized domains/IPs. All egress traffic MUST be logged for audit.
    - **R-010.4 (Resource & Loop Prevention Limits):** To mitigate "Token-Runaway" and runaway processes, the system MUST enforce hard resource caps: CPU (max 2 cores), RAM (max 4GB), and a maximum execution time of 15 minutes per tool invocation. Any process exceeding these limits MUST be auto-killed, triggering a "Resource Violation" alert.
    - **R-010.5 (MCP Server Injection):** The sandbox MUST be pre-configured with a Model Context Protocol (MCP) server. This server MUST provide the agent with standardized tools for filesystem operations, shell execution, and language-specific debugging, ensuring all agent actions are observable and logged.

- **R-011 (The Rigorous TDD "Red-Green-Refactor" Protocol):**
    - **R-011.1 (Red Phase: Verification of Intent):**
        - **Requirement:** The agent MUST write one or more automated tests that define the "Success State" for the task, based on the requirements distilled in Phase 2.
        - **Verification:** The agent MUST execute the tests and confirm they FAIL. The system MUST verify that the failure is "Clean" (i.e., it is a logical assertion failure or a "missing symbol" error, not a pre-existing build failure or environment error).
    - **R-011.2 (Green Phase: Minimalist Implementation):**
        - **Requirement:** The agent MUST implement the minimal amount of code necessary to make the tests pass. Implementation of features not explicitly mapped to the current task IDs is strictly forbidden.
        - **Verification:** This step is only successful when all new tests PASS and no regressions are introduced in the project's existing test suite. The system MUST capture and parse all stdout/stderr for potential warnings or deprecations.
    - **R-011.3 (Refactor Phase: Idiomatic Optimization):**
        - **Requirement:** Once tests are passing, the agent MUST refactor the code to adhere to the idiomatic patterns, naming conventions, and architectural constraints defined in the TAS and the Technology Landscape report.
        - **Verification:** The agent MUST re-execute the test suite. Any failure during refactoring MUST return the agent to the Green Phase.
    - **R-011.4 (Reviewer Agent Audit - The "Second Pair of Eyes"):**
        - **Requirement:** A secondary "Reviewer Agent" (with a distinct system prompt focused on security, performance, and TAS compliance) MUST perform a static analysis of the changes.
        - **Checklist:** The audit MUST cover: 1) Alignment with the TAS component hierarchy, 2) Detection of security anti-patterns (e.g., OWASP Top 10), 3) Verification of Requirement Traceability, and 4) Code complexity (Cyclomatic/Cognitive).
        - **Outcome:** The Reviewer Agent may "Approve" or "Request Changes." Rejections MUST include specific line references and actionable feedback, forcing the Implementation Agent to repeat the cycle.
    - **R-011.5 (Commit & Memory Synchronization):**
        - **Requirement:** Upon final approval, the system MUST: 1) Update the Project Memory (ChromaDB) with new architectural decisions, 2) Synchronize task documentation, and 3) Perform an atomic Git commit with a structured message (e.g., `feat(auth): implement JWT validation [REQ-042]`).

- **R-012 (Agentic Self-Healing & MCP-Enabled Debugging):**
    - **R-012.1 (Automated Failure Diagnostics):** If a test fails and the agent cannot immediately resolve it, the system MUST provide an "Enhanced Diagnostic Context," including the last 1000 lines of logs, relevant environment variables, and a "Reasoning Diff" of the agent's last 3 implementation attempts.
    - **R-012.2 (MCP-Enabled Deep Debugging):** The agent MUST be empowered to use professional-grade debuggers (e.g., `pdb`, `node --inspect`, `gdb`) through the MCP interface. This includes the ability to set conditional breakpoints, inspect heap state, and evaluate expressions in the runtime context.
    - **R-012.3 (Iteration Back-off & Human Escalation):** The system MUST implement a "Heuristic Watchdog." If an agent repeats the same failure pattern 5 times (as detected by semantic log analysis), the system MUST freeze the task state and escalate to the user for a manual "Architectural Intervention."

### 4.4 Chronos State Management (Time-Travel & Branching)
- **R-013 (High-Fidelity Checkpointing):** The system MUST create a persistent "State Snapshot" after every Phase, Epic, and Task. A Snapshot MUST include:
    - **Filesystem:** Git commit hash of the generated codebase.
    - **Agent State:** Full serialized LangGraph state, including the `checkpoint_id`.
    - **Memory:** A delta-dump of the Vector DB (ChromaDB) state.
    - **Context:** The LLM's current "active" context window (to allow resumption of reasoning).
- **R-014 (Non-Linear Branching):**
    - **R-014.1:** Users MUST be able to "Check out" any historical checkpoint.
    - **R-014.2:** If the user resumes from a checkpoint with new instructions, the system MUST create a named "Branch."
    - **R-014.3:** The system MUST support "Diffing" between branches, highlighting changes in generated requirements or tasks.

### 4.6 Safety, Observability & Guardrails
- **R-015 (Recursive Loop Detection):**
    - The system MUST monitor shell commands. If an agent executes the exact same command 3 times with the same failure output, the system MUST terminate the task and alert the user.
    - It MUST detect "Edit-Test-Fail" loops where the agent modifies the same file 5+ times without moving the test coverage forward.
- **R-016 (Token Budgeting & Thresholds):**
    - **R-016.1:** Users MUST set a "Soft Budget" and "Hard Budget" (in USD or Token count).
    - **R-016.2:** The system MUST pause and request confirmation at 80% and 95% of the milestone budget.
- **R-017 (Secret & PII Guard):**
    - The system MUST employ high-entropy string detection and regex patterns to identify secrets (API Keys, JWTs, private keys) in agent logs.
    - Any detected secret MUST be automatically masked in the "Glass-Box" UI and excluded from state checkpoints.
- **R-018 (MCP Transparency):** Every tool call made via MCP MUST be logged with: `Tool_Name`, `Arguments`, `Execution_Time`, and `Output_Summary`. This log MUST be accessible via the VSCode Timeline view.

## 5. Non-Functional Requirements

### 5.1 Security
- **NF-001 (Execution Isolation):** Use Docker with limited resource allocations (CPU/RAM) and no network access unless explicitly required for a task.
- **NF-002 (Identity & Access):** Support for `BYOK` (Bring Your Own Key) for LLM providers (Gemini, OpenAI, Anthropic).

### 5.2 Performance
- **NF-003 (Parallelism):** Support parallel execution of independent tasks within the same Epic to accelerate development.
- **NF-004 (Context Management):** Use Gemini's 2M+ context window effectively, but implement "Semantic Summarization" for long-running projects to maintain performance.

### 5.3 UX/UI
- **NF-005 (VSCode Integration):** Provide a rich, interactive sidebar and webviews for monitoring progress, reviewing documents, and navigating the Time-Travel timeline.
- **NF-006 (CLI First):** Ensure 100% of functionality is available via the CLI for headless or power-user workflows.

## 6. Constraints & Dependencies
- **Core Reasoning Engine:** Google Gemini 1.5 Pro (Optimized for context and reasoning).
- **Orchestration Framework:** Node.js/TypeScript with LangGraph for state-machine management.
- **Communication Standard:** Model Context Protocol (MCP).
- **Project Structure:** Must follow a "Glass-Box" architecture with all state persisted in a local SQLite/PostgreSQL database and Git.

## 7. User Journeys

### 7.1 Initializing a Project
1. User provides: "A task management app for writers using Rust and SQLite."
2. devs generates Research Reports.
3. User reviews and approves.
4. devs generates PRD, TAS, and Security Design.
5. User modifies the TAS to use PostgreSQL instead of SQLite.
6. devs updates documents and generates the Project Roadmap.

### 7.2 Debugging a Failing Task
1. Implementation agent writes a test for "Task Creation API."
2. Agent writes implementation, but the test fails.
3. Agent uses the MCP Debugger to set a breakpoint in the Rust code.
4. Agent identifies a logic error in the database transaction.
5. Agent fixes the code, tests pass, and the task is committed.

### 7.3 Branching from a Failure
1. After 5 Epics, the user realizes the UI architecture (React) is too complex for the simple requirement.
2. User uses Time-Travel to jump back to "Phase 2: UI Architecture Design."
3. User creates a new branch and updates the requirement to "Use HTMX and Tailwind."
4. devs regenerates the roadmap and resumes implementation from that point.

## 8. Out of Scope
- **Legacy Refactoring:** devs is not designed to refactor existing large-scale legacy codebases.
- **Cloud Hosting Management:** devs generates infrastructure-as-code (Terraform/Pulumi) but does not manage the cloud accounts or hosting billing.
- **Human Creative Work:** Generation of brand identities, logos, or marketing copy.

## 9. Risks & Mitigations
- **Token Runaway:** Mitigated by R-015 (Recursive Loop Detection) and R-016 (Token Budgeting).
- **Hallucinations:** Mitigated by mandatory human-in-the-loop approval gates for all high-level documents (R-003.1).
- **Code Quality:** Mitigated by R-011 (Mandatory TDD) and a secondary Reviewer Agent.
- **Security Escapes:** Mitigated by R-010 (Sandboxed Execution) and gVisor/Kata container options for enhanced isolation.
