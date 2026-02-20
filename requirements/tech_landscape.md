### **[TL-001]** Glass-Box Multi-Agent Orchestrator
- **Type:** Technical
- **Description:** The system must be designed as a multi-agent orchestrator that follows a Plan-Act-Verify lifecycle, coordinating specialized agents (Research, Architect, Developer, Reviewer) through a central state machine.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-002]** Model Context Protocol (MCP) Integration
- **Type:** Technical
- **Description:** The system must integrate the Model Context Protocol (MCP) to provide a standardized way for agents to interact with local development tools, debuggers, and profilers.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-003]** Transparent State Management (Glass-Box Philosophy)
- **Type:** Technical
- **Description:** The system must maintain a transparent and queryable state of all agent decisions, requirements, and execution logs to allow for user auditing and intervention at any stage.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-004]** Node.js (TypeScript) Runtime
- **Type:** Technical
- **Description:** The core orchestration and logic of the system must be implemented using Node.js and TypeScript to ensure compatibility with VSCode Extension APIs and MCP SDKs.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-005]** State Machine Orchestration
- **Type:** Technical
- **Description:** The system must utilize a state machine (e.g., LangGraph.js) for orchestration to manage cyclical workflows and explicit state transitions between development phases.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-006]** Gemini 3 Pro Primary Model
- **Type:** Technical
- **Description:** The system must use Gemini 3 Pro as the primary language model for tasks requiring large context windows, such as ingesting entire codebases and documentation.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-007]** Gemini 3 Flash Secondary Model
- **Type:** Technical
- **Description:** The system must use Gemini 3 Flash for low-latency tasks including code reviews, unit test generation, and requirement distillation.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-008]** MCP SDK Implementation
- **Type:** Technical
- **Description:** The system must implement tool access for all agents using the `@modelcontextprotocol/sdk`.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-002]

### **[TL-009]** Specialized MCP Servers
- **Type:** Technical
- **Description:** The system must include the development and use of specialized MCP servers for Agentic Profiling and TDD (Test-Driven Development) Execution.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-002]

### **[TL-010]** SQLite Local Storage
- **Type:** Technical
- **Description:** The system must use SQLite for local-first storage of project requirements, epic/task statuses, and agent logs within a `.devs/` directory.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-011]** Embedded Vector Memory
- **Type:** Technical
- **Description:** The system must integrate an embedded vector database (e.g., LanceDB or ChromaDB) to enable semantic search over project history and architectural decisions.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-012]** Mandatory Agent Sandboxing
- **Type:** Security
- **Description:** All AI-generated code execution and test runs must occur within an isolated environment such as Docker or WebContainers to protect the host system.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-013]** Restricted Sandbox Networking
- **Type:** Security
- **Description:** Agent execution sandboxes must have restricted network access to prevent unauthorized data exfiltration or external interactions.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-012]

### **[TL-014]** Sensitive Data Redaction
- **Type:** Security
- **Description:** The system must pre-process logs to redact API keys and secrets before they are stored in the project's agent memory.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-010]

### **[TL-015]** Human-in-the-Loop Checkpoints
- **Type:** UX
- **Description:** The system must require explicit user approval for any agent tasks involving external network requests or the installation of new dependencies.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-016]** Long-Context Management
- **Type:** Technical
- **Description:** The system must implement a context management strategy that leverages Gemini's long context window while maintaining a sliding window for short-term task context.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-006]

### **[TL-017]** Parallel Agent Operations
- **Type:** Technical
- **Description:** The orchestration manager must support parallel execution of independent agent tasks, such as concurrent market and competitive analysis.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-001]

### **[TL-018]** Stateless Resumption Capability
- **Type:** Technical
- **Description:** By maintaining state in SQLite, the system must be able to resume development from any point following an interruption.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-010]

### **[TL-019]** Project Partitioning (Epics)
- **Type:** Technical
- **Description:** The system must break projects into 8-16 Epics to ensure LLM reasoning remains focused and within high-confidence bounds.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-020]** Agent Loop Prevention
- **Type:** Technical
- **Description:** The system must implement "Max Turn" limits per task and automatic "Entropy Detection" to identify and stop agents trapped in unproductive loops.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-021]** Locked Dependency Management
- **Type:** Technical
- **Description:** The Architect Agent must generate a locked dependency manifest, and Developer Agents must be restricted from adding new libraries without an explicit re-architecting phase.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[TL-022]** Epic Context Refresh
- **Type:** Technical
- **Description:** The system must implement a "Context Refresh" at the start of every Epic where the Architect Agent re-summarizes the current project state to clear noise.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-019]

### **[TL-023]** Hardened Sandbox Profiles
- **Type:** Security
- **Description:** Agent sandboxes must use minimal base images and strict `seccomp` profiles to limit available system calls.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-012]

### **[TL-024]** Multi-Model TDD Validation
- **Type:** Technical
- **Description:** The system must use a multi-model check where one model (Gemini 3 Pro) writes the test and another (Gemini 3 Flash) reviews it for logic.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [TL-006], [TL-007]

### **[TL-025]** Mandatory Red-Phase TDD
- **Type:** Technical
- **Description:** The Developer Agent must only proceed with implementation once a written test has been confirmed to fail as expected (Red phase).
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None
