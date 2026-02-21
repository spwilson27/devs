# Phase 5: Discovery - Research & Analysis Agents

## Objective
Implement the specialized agents and tools for the Discovery phase. This epic enables parallelized research into the market, competition, and technology landscape. It ensures that the system gathers comprehensive data, validates source credibility, and generates detailed research reports with Mermaid SWOT diagrams before any architectural decisions are made.

## Requirements Covered
- [TAS-049]: Phase 1: Discovery & Research
- [1_PRD-REQ-UI-001]: Research Suite sign-off requirement
- [1_PRD-REQ-UI-013]: Agent-Initiated Clarification (AIC)
- [1_PRD-REQ-RES-001]: Market & Competitive Analysis
- [1_PRD-REQ-RES-002]: Technology Landscape & Decision Matrix
- [1_PRD-REQ-RES-003]: User Persona & Journey Mapping
- [1_PRD-REQ-RES-004]: Research Edge Cases (adjacent markets)
- [1_PRD-REQ-RES-005]: Niche Markets analysis
- [1_PRD-REQ-RES-006]: Stale Data Prevention (live searches)
- [1_PRD-REQ-RES-007]: Research Agent Deployment & Scoring
- [1_PRD-REQ-MAP-001]: Parallelized Research Agents
- [1_PRD-REQ-MAP-002]: Persistent decision log in research
- [1_PRD-REQ-MAP-003]: Research report details (Pros/Cons)
- [1_PRD-REQ-MAP-004]: Sandbox tooling for research
- [1_PRD-REQ-MAP-006]: Mandatory entropy detection in research
- [1_PRD-REQ-HITL-001]: Phase 1 Completion Approval (Research Gate)
- [1_PRD-REQ-NEED-DOMAIN-01]: High-fidelity research reports
- [1_PRD-REQ-PIL-001]: Research-First Methodology
- [3_MCP-REQ-GOAL-001]: Research-First Methodology (MCP)
- [2_TAS-REQ-001]: Expansion Process (Input to context)
- [9_ROADMAP-PHASE-003]: Discovery & Research Agents phase
- [9_ROADMAP-TAS-301]: Develop ResearchManager agent
- [9_ROADMAP-TAS-302]: Integrate Serper/Google Search API
- [9_ROADMAP-TAS-303]: Implement ContentExtractor tool
- [9_ROADMAP-TAS-304]: Develop Tech Landscape decision matrix generator
- [9_ROADMAP-TAS-305]: Implement automated Markdown report generation
- [9_ROADMAP-REQ-024]: Parallelization of research streams
- [9_ROADMAP-REQ-025]: Source Credibility scoring (>0.8)
- [9_ROADMAP-REQ-026]: Content Extraction efficiency
- [9_ROADMAP-REQ-007]: Discovery-to-Architecture transition logic
- [9_ROADMAP-REQ-001]: The Research Gate (Post-Phase 3)
- [9_ROADMAP-DOD-P3]: Discovery Definition of Done
- [TAS-027]: Real-time search integration
- [TAS-028]: Content extraction (Firecrawl/Jina)
- [5_SECURITY_DESIGN-REQ-SEC-SD-016]: Research-specific tool permissions
- [5_SECURITY_DESIGN-REQ-SEC-SD-030]: Secure Web Scraping Egress (HTTPS)
- [5_SECURITY_DESIGN-REQ-SEC-THR-002]: Supply Chain Poisoning mitigation
- [8_RISKS-REQ-050]: Source Citation Requirement
- [8_RISKS-REQ-051]: Automated Link Validation
- [8_RISKS-REQ-052]: Fact-Checker Agent
- [8_RISKS-REQ-126]: Market Research Hallucination risk mitigation
- [8_RISKS-REQ-017]: Untrusted Context Delimitation
- [8_RISKS-REQ-018]: High-reasoning Sanitization turn
- [8_RISKS-REQ-065]: Architecture-First Differentiator
- [8_RISKS-REQ-113]: Indirect Prompt Injection mitigation
- [4_USER_FEATURES-REQ-050]: Multi-lingual research support
- [4_USER_FEATURES-REQ-024]: VSCode Sidebar research status
- [4_USER_FEATURES-REQ-025]: CLI progress bar for research
- [4_USER_FEATURES-REQ-026]: Ambiguous brief handling
- [4_USER_FEATURES-REQ-027]: Search dead-end handling
- [4_USER_FEATURES-REQ-028]: Source contradiction handling
- [9_ROADMAP-REQ-UI-013]: Ambiguous brief clarification (AIC)
- [9_ROADMAP-REQ-RES-001]: Market analysis requirements
- [9_ROADMAP-REQ-RES-002]: Technology decision matrix requirements
- [9_ROADMAP-REQ-RES-003]: User journey requirements
- [9_ROADMAP-REQ-RES-004]: Adjacent market requirements
- [9_ROADMAP-REQ-MAP-002]: Persistent decision log requirements

## Detailed Deliverables & Components
### ResearchManager Agent
- Develop the `ResearchManager` agent responsible for decomposing the user brief into search queries.
- Implement parallel execution logic to handle 3+ concurrent search/extract streams.
- Build confidence scoring and citation verification logic.

### Search & Extraction Tools
- Integrate Serper/Google Search API with source credibility filtering.
- Implement `ContentExtractor` to convert SPA/Dynamic content into clean Markdown.
- Develop `SanitizerAgent` to strip malicious imperative language from research data.

### Report Generation Engine
- Build automated Markdown generator for Market, Competitive, Tech, and User Research reports.
- Implement Mermaid.js SWOT and Decision Matrix auto-generators.
- Develop the "Adjacent Market Analysis" fallback logic for niche requests.

### Discovery Workflow Logic
- Implement the "Wait-for-Approval" HITL gate at the end of the Discovery phase.
- Develop transition logic that requires confidence scores > 85% to proceed to Phase 6.

## Technical Considerations
- Avoiding rate-limit lockouts during parallel search execution.
- Ensuring multi-lingual support for global research tasks.
- Handling contradictions in scraped data through cross-agent fact-checking.
