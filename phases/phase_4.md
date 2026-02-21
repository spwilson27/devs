# Phase 4: Intelligence - Tiered Memory & Context Management

## Objective
Establish the tiered memory system and intelligent context management logic. This phase ensures that agents have access to relevant historical decisions, architectural constraints (TAS), and project requirements without exceeding token limits or suffering from "reasoning decay."

## Requirements Covered
- [TAS-100]: @devs/memory tiered system management
- [TAS-011]: Vector Memory (Long-term) in LanceDB
- [TAS-081]: Tiered memory hierarchy (Short, Medium, Long)
- [TAS-016]: Short-term memory requirement (In-context)
- [TAS-017]: Medium-term memory requirement (SQLite logs)
- [TAS-018]: Long-term memory requirement (LanceDB)
- [TAS-091]: Embedding model text-embedding-004
- [TAS-092]: IVF-PQ indexing strategy
- [TAS-093]: LanceDB vector schema
- [TAS-057]: Vector memory updates after tasks
- [TAS-024]: Context pruning at 800k tokens
- [TAS-028]: Content extraction for memory
- [2_TAS-REQ-015]: LanceDB storage path (.devs/memory.lancedb)
- [2_TAS-REQ-027]: VectorStore integration
- [2_TAS-REQ-028]: ContextPruner logic
- [2_TAS-REQ-029]: MemoryRefresher for long-term sync
- [3_MCP-TAS-011]: LanceDB cosine_similarity search
- [3_MCP-TAS-016]: Short-term memory implementation
- [3_MCP-TAS-017]: Medium-term memory implementation
- [3_MCP-TAS-018]: Long-term memory implementation
- [3_MCP-TAS-024]: Context window saturation mitigation
- [3_MCP-TAS-047]: Context window composition logic
- [3_MCP-TAS-048]: Active file management (Pinning)
- [3_MCP-TAS-049]: Context compression thresholds
- [3_MCP-TAS-050]: Spec refresh protocol (every 10 turns)
- [3_MCP-TAS-051]: Tool result retention & truncation
- [3_MCP-TAS-052]: Strategy blacklist (Lesson Learned)
- [3_MCP-TAS-097]: Learning injection into LanceDB
- [3_MCP-REQ-SYS-001]: Sliding relevance window requirement
- [1_PRD-REQ-PERF-001]: Context window compression
- [1_PRD-REQ-PERF-004]: Summarization handoffs
- [1_PRD-REQ-GOAL-007]: Multi-tiered context management
- [1_PRD-REQ-SYS-001]: Token optimization strategy
- [1_PRD-REQ-REL-006]: Token budget per task
- [1_PRD-REQ-CON-004]: Context window optimization
- [1_PRD-REQ-NEED-AGENT-01]: Long-term architectural context
- [9_ROADMAP-TAS-104]: Integrate LanceDB for vectorized memory
- [9_ROADMAP-TAS-105]: Develop ContextPruner utilizing Flash
- [9_ROADMAP-REQ-SYS-001]: ContextPruner summarization turn
- [9_ROADMAP-REQ-010]: Context Injection logic
- [9_ROADMAP-REQ-019]: Memory efficiency benchmark
- [5_SECURITY_DESIGN-REQ-SEC-SD-037]: Vector embedding integrity
- [5_SECURITY_DESIGN-REQ-SEC-SD-061]: Vector memory sanitization
- [5_SECURITY_DESIGN-REQ-SEC-SD-084]: Context window refresh turn
- [8_RISKS-REQ-010]: Sliding window summarization (Flash)
- [8_RISKS-REQ-011]: Static specification re-injection
- [8_RISKS-REQ-012]: Deterministic context pruning
- [8_RISKS-REQ-013]: Architectural lesson vectorization
- [8_RISKS-REQ-031]: Intelligent token budgeting
- [8_RISKS-REQ-037]: Background indexing throttling
- [8_RISKS-REQ-058]: Research result caching
- [8_RISKS-REQ-071]: Vector memory pruning on rewind
- [8_RISKS-REQ-077]: User fix DNA encoding
- [8_RISKS-REQ-104]: Context pruning heuristics
- [8_RISKS-REQ-105]: Semantic decay for older entries
- [8_RISKS-REQ-111]: Context saturation mitigation
- [8_RISKS-REQ-122]: Stale memory risk mitigation
- [8_RISKS-REQ-137]: Long-term memory hallucination risk
- [4_USER_FEATURES-REQ-017]: Tiered memory hierarchy support
- [4_USER_FEATURES-REQ-018]: Context pruning & refresh feature
- [4_USER_FEATURES-REQ-019]: Semantic memory retrieval (RAG)
- [4_USER_FEATURES-REQ-075]: Memory syncing on rewind
- [4_USER_FEATURES-REQ-083]: Token limit context refresh
- [4_USER_FEATURES-REQ-068]: Directive history trace
- [4_USER_FEATURES-REQ-072]: Feedback injection tool
- [3_MCP-UNKNOWN-501]: Shared memory support evaluation
- [3_MCP-UNKNOWN-502]: User directive precedence
- [9_ROADMAP-SPIKE-002]: Long-term memory drift investigation
- [9_ROADMAP-BLOCKER-001]: ContextPruner intent maintenance
- [3_MCP-RISK-303]: Context drift mitigation
- [3_MCP-RISK-501]: Semantic drift prevention
- [3_MCP-RISK-502]: Vector retrieval noise filtering
- [3_MCP-RISK-503]: Context poisoning prevention
- [RISK-802]: Context window exhaustion risk
- [REQ-SYS-001]: Sliding-window context management implementation

## Detailed Deliverables & Components
### LanceDB Vector Integration
- Integrate LanceDB as the long-term vector store.
- Implement `text-embedding-004` based indexing for PRD, TAS, and architectural decisions.
- Build the semantic search tool `search_memory` with cosine similarity and metadata filtering.

### Context Management (ContextPruner)
- Develop the `ContextPruner` utilizing Gemini 3 Flash for summarizing intermediate turns.
- Implement the "Sliding Relevance Window" logic to prioritize the active task goal and recent history.
- Build the "Spec Refresh" protocol to re-inject core blueprints every 10 turns.

### Tiered Memory Manager
- Implement `@devs/memory/tiered` to manage Short-term (in-context), Medium-term (SQLite), and Long-term (Vector) tiers.
- Develop logic for "Learning Injection" where task outcomes and RCAs are promoted to vector memory.
- Implement temporal pruning and semantic decay to prevent "Future Knowledge" hallucinations during rewinds.

## Technical Considerations
- Managing the transition between raw logs and summarized context without losing technical nuance.
- Throttling vector indexing to avoid CPU spikes during parallel task implementation.
- Handling 1M token context windows while maintaining model reasoning fidelity.
