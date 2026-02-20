### **[REQ-TL-001]** Node.js (TypeScript) Runtime
- **Type:** Technical
- **Description:** The system shall use Node.js with TypeScript as its primary runtime to ensure compatibility with the VSCode Extension API and the MCP SDK ecosystem.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-002]** Orchestration Framework
- **Type:** Technical
- **Description:** The system shall utilize LangGraph.js or a custom state machine to manage cyclical agentic graphs and iterative development loops (TDD, research-to-requirements).
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-003]** Primary LLM: Gemini 3 Pro
- **Type:** Technical
- **Description:** The system shall use Gemini 3 Pro as the primary model for tasks requiring large context windows (1M+ tokens), such as codebase analysis and documentation ingestion.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-004]** Secondary LLM: Gemini 3 Flash
- **Type:** Technical
- **Description:** The system shall use Gemini 3 Flash for low-latency tasks including code reviews, unit test generation, and requirement distillation.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-005]** MCP SDK Integration
- **Type:** Technical
- **Description:** The system shall integrate the @modelcontextprotocol/sdk to provide agents with standardized access to file systems, terminals, browsers, and git.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-006]** Custom MCP Servers for Agentic Support
- **Type:** Technical
- **Description:** The project shall develop specialized MCP servers specifically for agentic profiling and TDD execution.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-005]

### **[REQ-TL-007]** Relational Data Storage: SQLite
- **Type:** Technical
- **Description:** The system shall use SQLite for local-first storage of project requirements, task statuses, and agent logs within the .devs/ directory.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-008]** Vector Search for Long-term Memory
- **Type:** Technical
- **Description:** The system shall use an embedded vector database (LanceDB or ChromaDB) to enable semantic search over project history and architectural decisions.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-009]** Agent Execution Sandboxing
- **Type:** Security
- **Description:** Agents must execute all tests and implementation tasks within an isolated environment (Docker or WebContainers) to prevent system damage.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-010]** Mandatory Docker Sandboxing
- **Type:** Security
- **Description:** All AI-generated code execution must occur within a Docker container with restricted network access.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-009]

### **[REQ-TL-011]** Token Redaction in Logs
- **Type:** Security
- **Description:** The system must pre-process logs to ensure no API keys or secrets are stored in the project's agent memory.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-012]** Human-in-the-Loop Checkpoints
- **Type:** Security
- **Description:** Explicit user approval is required for any tasks involving external network requests or dependency installations.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-013]** Efficient Context Management
- **Type:** Technical
- **Description:** The system shall utilize Gemini's long context window to minimize RAG latency while implementing a sliding window for short-term task memory to optimize token usage.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-003]

### **[REQ-TL-014]** Parallel Agent Execution
- **Type:** Technical
- **Description:** The system shall support parallel execution for research tasks (Market/Competitive analysis) and concurrent operations between Reviewer agents and Test-writing phases.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-015]** Stateless Agent Architecture
- **Type:** Technical
- **Description:** Agents shall be stateless, with all state maintained in SQLite to allow system resumption from any point after interruption.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-007]

### **[REQ-TL-016]** Project Partitioning into Epics
- **Type:** Technical
- **Description:** Large projects must be broken into 8-16 Epics to ensure LLM reasoning remains focused and within high-confidence bounds.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-017]** Agent Loop Prevention
- **Type:** Technical
- **Description:** The system shall implement "Max Turn" limits per task and automatic "Entropy Detection" to identify and stop agents trapped in repeating loops.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-018]** Locked Dependency Management
- **Type:** Technical
- **Description:** The Architect Agent must generate a locked dependency manifest, and Developer Agents are restricted from adding new libraries without a re-architecting phase.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** None

### **[REQ-TL-019]** Stale Context Refresh
- **Type:** Technical
- **Description:** The system shall implement a "Context Refresh" at the start of every Epic, where the Architect Agent re-summarizes the project state to clear noise.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-016]

### **[REQ-TL-020]** Strict Sandbox Profiles
- **Type:** Security
- **Description:** Sandbox containers must use minimal base images and strict seccomp profiles to limit system calls and prevent escape.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-010]

### **[REQ-TL-021]** Multi-Model TDD Validation
- **Type:** Technical
- **Description:** The system shall use a multi-model check for TDD: Gemini 3 Pro writes the test, Gemini 3 Flash reviews it, and implementation only begins after the test fails as expected.
- **Source:** Technology Landscape Report (research/tech_landscape.md)
- **Dependencies:** [REQ-TL-003], [REQ-TL-004]
