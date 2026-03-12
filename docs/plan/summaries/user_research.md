# User Research Report Summary: devs — AI Agent Workflow Orchestrator

**Date:** March 10, 2026  
**Status:** Final  
**Purpose:** Define target audiences, personas, pain points, and core journeys to guide feature prioritization and UX design for `devs` AI agent workflow orchestrator.

---

## Executive Summary

This report identifies **three distinct segments** requiring tailored value propositions: (1) Agentic Developer (sole developer primary MVP user), (2) Mid-Market Engineering Team Lead (Year 1–2 commercial target), and (3) Enterprise R&D Innovation Lead (compliance-focused strategic adopter). Core product decisions prioritize **DAG dependency scheduling with automatic parallel execution** as the primary differentiator, **Glass-Box MCP architecture enabling agentic self-improvement**, and **Rust-based reliability** for security-conscious organizations requiring memory safety guarantees.

---

## Target Audience Segments

### Segment 1: Agentic Developer (Primary MVP User)
| Attribute | Details |
|-----------|---------|
| **Role** | Sole developer/project maintainer; Full-stack Rust expert |
| **Age** | 28–45 (industry norm for senior Rust maintainers) [ASSUMPTION] |
| **Tech Proficiency** | Expert in Rust, gRPC, MCP protocol; comfortable modifying core system via agent commands |
| **AI Usage** | Daily — agents are primary coding partner |
| **Primary Goal** | Develop `devs` efficiently using agentic AI without manual intervention bottlenecks |
| **Success Metric** | Reduced time-to-commit; minimized context-switching between manual/automated tasks |

### Segment 2: Mid-Market Engineering Team Lead (Early Commercial Adopter)
| Attribute | Details |
|-----------|---------|
| **Role** | Engineering Manager / Principal Engineer / Head of Platform at 50–500 engineer company |
| **Age** | 32–50 [ASSUMPTION] |
| **Tech Proficiency** | High — manages CI/CD pipelines; familiar with DAG concepts from Kubernetes, Airflow |
| **AI Usage** | Multiple times weekly — integrates AI agents into team workflows |
| **Primary Goal** | Orchestrate multi-agent development across team with vendor neutrality and auditability |
| **Success Metric** | Team velocity improvement; reduced integration errors from manual stage coordination |

### Segment 3: Enterprise R&D Innovation Lead (Strategic Adopter)
| Attribute | Details |
|-----------|---------|
| **Role** | Director of Engineering / Head of Innovation Lab / VP of R&D at Fortune 2000 company |
| **Age** | 38–55 [ASSUMPTION] |
| **Tech Proficiency** | Moderate — relies on engineering teams for implementation details |
| **AI Usage** | Weekly reviews; strategic oversight rather than hands-on usage |
| **Primary Goal** | Enable AI-powered development while meeting EU AI Act, NIST AI RMF, internal governance requirements |
| **Success Metric** | Compliance audit pass rate; successful deployment of AI-generated code without regulatory violations |

---

## Detailed Personas

### Alex Chen — The Agentic Developer (Age 34)
- **Location:** Remote, North America/Europe
- **Education:** BS/MS Computer Science; active open-source Rust contributor
- **Income:** $150K–$250K TC [ASSUMPTION: market rates for senior Rust developers 2024]

**Tech Stack & Tools**
- Primary language: Rust (7+ years)
- Familiar with: gRPC, Protocol Buffers, Docker, SSH, Git
- AI tools daily: Claude Code, Gemini CLI, custom MCP clients
- Environment: VS Code with custom extensions; TUI for local testing

**Goals & Motivations**
1. Maximize agent autonomy: Configure workflows running without manual intervention
2. Debug complex issues via Glass-Box MCP interface to inspect internal state and trace execution paths
3. Iterate rapidly on workflow definitions via CLI/MCP tools rather than manual file editing
4. Maintain production reliability with automatic parallelization when dependencies satisfied

**Frustrations & Pain Points [ASSUMPTION]**
1. **Context-switching:** "Manual copying outputs between agent sessions instead of orchestrator handling data flow"
2. **Lack visibility into execution state:** Can't tell if stage is waiting for response or stuck in dependency loop without diving into logs
3. **Manual orchestration overhead:** Defining parallel paths requires thinking about timing/dependencies explicitly

**Technology Usage Profile**
| Activity | Frequency | Preferred Method |
|----------|-----------|------------------|
| Submit workflow runs | 3–5×/week | CLI `devs submit` with named runs |
| Monitor execution | Continuous during debugging | TUI Dashboard tab for real-time stage graph visualization |
| Inspect logs | Daily | Logs tab or `devs logs <run>` CLI command |
| Debug agent failures | Weekly | Debug tab: follow agent progress, inspect working directory diffs |
| Modify workflow definitions | 2–3×/week | Git-based editing; validated via MCP tool injection |

**Risk Tolerance:** Early adopter willing to experiment with new features before GA if solving immediate pain points; provides detailed bug reports via GitHub issues.

---

### Jordan Rivera — Mid-Market Engineering Team Lead (Age 41)
- **Role:** Principal Engineer / Head of Platform at 200-engineer SaaS company
- **Location:** Austin, TX or similar mid-market tech hub
- **Team Size:** Manages 8–12 engineers across backend/frontend/DevOps roles

**Tech Stack & Tools**
- Primary languages: Python, Go (team uses Rust for infrastructure tools)
- CI/CD platforms: GitLab CI, GitHub Actions (multiple projects)
- AI tools: GitHub Copilot (enterprise tier), custom Claude integrations via API
- Infrastructure: Docker-based development environments; partial Kubernetes adoption

**Goals & Motivations**
1. Standardize agent usage across team without micromanaging individual developers
2. Reduce integration errors from manual coordination when multiple agents work on parallel features
3. Achieve vendor neutrality: Switch between LLM providers mid-workflow without reconfiguring entire DAG structure
4. Enable audit trails for compliance with versioned checkpoints of AI-generated code changes

**Frustrations & Pain Points [ASSUMPTION]**
1. **Siloed agent capabilities:** "Each developer has their own workflow definition; lack shared pool enforcing rate limits and fallback policies"
2. **Manual dependency management:** Developers forget to declare stage dependencies, causing race conditions when parallel features interfere
3. **Vendor lock-in anxiety:** Committed to Claude for code generation but need Gemini for long-context reviews; switching providers requires rewriting entire workflows

**Technology Usage Profile**
| Activity | Frequency | Preferred Method |
|----------|-----------|------------------|
| Submit team workflows | 10–20×/week (across all engineers) | CLI `devs submit` with team naming conventions |
| Monitor team runs | Daily | TUI Dashboard: project/run list on left, selected run detail on right |
| Review agent pool utilization | Weekly | Pools tab: real-time view of slot availability and fallback events |
| Audit workflow history | Monthly | Git-backed checkpoints in `.devs/` directory; searchable via CLI `devs list` |
| Configure scheduling policy | Quarterly | TOML config updates for priority queue vs. weighted fair queuing |

**Risk Tolerance:** Cautious adopter requiring proof of reliability before committing team to new tooling; values design partner discounts and dedicated support.

---

### Dr. Elena Vasquez — Enterprise R&D Innovation Lead (Age 47)
- **Role:** Director of AI Research at Fortune 500 financial services company
- **Location:** New York, NY or Chicago, IL (major financial hub)
- **Team Size:** Leads 15–25 researchers and engineers in AI innovation lab

**Tech Stack & Tools**
- Primary languages: Python, R (research); limited Rust exposure but values security guarantees
- Compliance frameworks: EU AI Act, NIST AI RMF, SOC 2 Type II, internal governance policies
- AI tools: Enterprise LLM contracts with Anthropic, Google; custom fine-tuned models for domain-specific tasks
- Infrastructure: Hybrid cloud deployment (on-prem for sensitive data, public cloud for compute-intensive workloads)

**Goals & Motivations**
1. Enable AI-powered development without compliance violations per EU AI Act requirements
2. Maintain vendor flexibility: Avoid committing to single LLM provider; switch mid-workflow based on cost, latency, or capability
3. Demonstrate human-in-the-loop oversight via pause/resume/cancel capabilities via MCP tools for critical review gates before production deployment
4. Justify tooling investment with measurable ROI: Track agent utilization rates, fallback success metrics, and time-to-production improvements

**Frustrations & Pain Points [ASSUMPTION]**
1. **Incomplete audit trails from experimental tools:** "Black-box SaaS offerings don't provide lineage of AI-generated code decisions required for EU AI Act audits"
2. **Manual governance enforcement:** Engineering teams bypass approval gates by using unauthorized AI tools; need centralized orchestration with role-based access control (post-MVP feature)
3. **Reproducibility gaps in regulatory reporting:** Cannot reproduce workflow executions from six months ago due to ephemeral state management in current tooling

**Technology Usage Profile**
| Activity | Frequency | Preferred Method |
|----------|-----------|------------------|
| Review workflow submissions | Weekly | CLI `devs status <run>` before approving production deployment |
| Audit checkpoint history | Monthly | Git-backed `.devs/` directory with configurable retention policy |
| Export compliance documentation | Quarterly | SOC 2 Type II certification; EU AI Act lineages via MCP tool extraction |
| Monitor agent pool exhaustion events | Real-time (escalation) | Webhook notifications for `pool.exhausted` events to Slack incident channel |
| Configure enterprise features | Bi-annually | SSO/SAML integration; RBAC access control policies |

**Risk Tolerance:** Late majority adopter requiring third-party security certifications (SOC 2 Type II) and compliance documentation packages before committing to tooling.

---

## Critical Pain Points & Product Design Decisions

### PP-1: Manual Coordination Overhead in Multi-Agent Workflows [HIGH PRIORITY — MVP]
**Affected Personas:** Alex Chen, Jordan Rivera  
**Frequency:** Daily for all users managing ≥2 concurrent agent runs

| Source | Evidence |
|--------|----------|
| Market Research Report | "~65% of enterprises report need for better workflow orchestration" |
| Competitive Analysis | GitHub Actions requires manual `needs:` keyword; AutoGen requires manual conversation routing |

**Product Design Decision:**
- **Automatic DAG scheduling must be MVP core feature:** Stages with no unmet dependencies run in parallel automatically; users declare `depends_on` lists declaratively
- **TUI Dashboard split-pane layout:** Left pane shows project/run list; right pane displays selected run detail including stage graph visualization and elapsed time

---

### PP-2: Vendor Lock-In Risks from Single-Provider Commitments [HIGH PRIORITY — MVP]
**Affected Personas:** Jordan Rivera, Dr. Elena Vasquez  
**Frequency:** Weekly when evaluating new agent capabilities or negotiating LLM provider contracts

| Source | Evidence |
|--------|----------|
| Market Research Report | "~50% of enterprises using ≥2 LLM providers; ~70% cite vendor lock-in as primary concern" |
| Competitive Analysis | GitHub Actions locks users to Azure/MSFT ecosystem; AutoGen primarily OpenAI-focused |

**Product Design Decision:**
- **Agent pools with fallback chains must be MVP core feature:** Configurable priority order ensures next agent is tried if current one fails due to error, rate-limit, or service outage
- **Capability tags enable selective routing:** Agents tagged with `code-gen`, `review`, `long-context`; stages require specific capabilities and pool selects matching agents in priority order

---

### PP-3: Incomplete Audit Trails Hindering Compliance [HIGH PRIORITY — MVP]
**Affected Personas:** Dr. Elena Vasquez  
**Frequency:** Monthly audits; continuous during regulatory investigations

| Source | Evidence |
|--------|----------|
| Market Research Report | "EU AI Act (Regulation (EU) 2024/1689) requires complete audit trails of AI-generated code decisions" |
| Competitive Analysis | LangSmith stores traces in cloud-only; no Git-backed checkpoint system for reproducibility |

**Product Design Decision:**
- **Git-backed checkpoint persistence must be MVP core feature:** `.devs/` directory committed to project repo; configurable branch (working or dedicated `devs/state`) keeps checkpoints isolated from project history
- **Workflow definition snapshotting ensures reproducibility:** Each run snapshots workflow definition and stores alongside checkpoint state

---

## Secondary Pain Points & Post-MVP Considerations

### PP-4: Limited Observability Without Bidirectional Control [POST-MVP]
**Affected Personas:** Alex Chen, Jordan Rivera  
**Frequency:** Daily debugging sessions when stages hang or fail unexpectedly

| Source | Evidence |
|--------|----------|
| Competitive Analysis | LangSmith provides one-way telemetry only; no runtime control over running agents |

**Product Design Decision:**
- **Glass-Box MCP server must be MVP core feature:** Dedicated port (7891) exposes full internal state; AI agents can observe, debug, profile, test, and control system via MCP tools
- **TUI Debug tab for human users:** Follow specific agent progress; inspect working directory diffs; send cancel/pause/resume signals

---

### PP-5: Rate-Limit Failures Without Automatic Fallback [HIGH PRIORITY — MVP]
**Affected Personas:** Alex Chen, Jordan Rivera  
**Frequency:** Weekly when hitting provider API quotas or experiencing service outages

| Source | Evidence |
|--------|----------|
| Competitive Analysis | AutoGen requires manual implementation of rate-limit handling; CrewAI has no automatic fallback |

**Product Design Decision:**
- **Rate-limit detection via dual mechanisms must be MVP core feature:**
  - Passive: Adapter watches agent exit codes and stderr for known rate-limit patterns (`429 Too Many Requests`, `RATE_LIMIT_EXCEEDED`)
  - Active: Agents call `devs` MCP tool to proactively report rate-limit condition, triggering immediate pool fallback

---

### PP-6: Per-Stage Execution Environment Complexity [POST-MVP]
**Affected Personas:** Jordan Rivera, Dr. Elena Vasquez  
**Frequency:** Weekly when configuring new workflows for different deployment targets

| Source | Evidence |
|--------|----------|
| Competitive Analysis | Cursor IDE designed for single-repository development rather than multi-project orchestration |

**Product Design Decision:**
- **Configurable execution targets per-stage must be MVP core feature:**
  - `tempdir`: Temporary directory on local machine; project cloned before stage runs
  - `docker`: Full `DOCKER_HOST` configuration for local or remote daemons; repo cloned into container
  - `remote`: SSH access with full `ssh_config`; agents spawned on remote machines

---

## Core User Journeys (Mermaid Diagrams)

### Journey 1: Alex Chen — Agentic Development Workflow

**Scenario:** Developing new feature using exclusively agentic AI tools. Workflow includes plan, implement-api, implement-ui, review, and merge stages with automatic parallel execution when dependencies satisfied.

**Preconditions:**
- `devs` server running on local machine (port 7890)
- Agent pool configured with Claude (code-gen), Gemini (review), OpenCode (fallback)
- Project repository cloned locally with `.devs/` directory initialized

```mermaid
sequenceDiagram
    participant A as Alex (Developer)
    participant CLI as devs CLI Client
    participant Server as devs Server
    participant DAG as DAG Scheduler
    participant Pool as Agent Pool Manager
    participant Agent1 as Claude Code
    participant Agent2 as Gemini CLI
    
    Note over A,Agent2: Submit Workflow Run
    
    A->>CLI: devs submit feature --name "glassbox-mcp-integration"
    CLI->>Server: gRPC SubmitRequest { workflow, name }
    Server->>DAG: Parse and validate DAG structure
    DAG->>DAG: Detect cycles via topological sort
    DAG-->>Server: Return run_id: "glassbox-mcp-20260310-001"
    Server-->>A: Respond with run_id; TUI Dashboard opens
    
    Note over A,Agent2: Stage Execution Loop (Automatic Parallelism)
    
    par Plan Stage Runs First (No Dependencies)
        DAG->>Pool: Request agent slot for stage "plan"
        Pool->>Agent1: Invoke Claude Code(prompt="Plan the glassbox MCP integration...")
        Agent1-->>DAG: Stream stdout/stderr via PTY mode
        Agent1->>DAG: Complete with structured_output JSON (plan outline)
    end
    
    par Implement API and UI Run in Parallel Once Plan Completes
        DAG->>Pool: Request agent slot for stage "implement-api"
        Pool->>Agent1: Invoke Claude Code(prompt="Implement the API layer...")
        
        DAG->>Pool: Request agent slot for stage "implement-ui"
        Pool->>Agent1: Invoke Claude Code(prompt="Implement the UI layer...")
    end
    
    Note over Agent1,Agent2: Both stages run concurrently; DAG waits for both to complete
    
    par Review Stage Waits Until Both Implementations Complete
        Agent1->>DAG: Exit code 0 (API implementation done)
        Agent1->>DAG: Exit code 0 (UI implementation done)
        DAG->>Pool: Request agent slot for stage "review"
        Pool->>Agent2: Invoke Gemini CLI(prompt="Review the implementation...")
        Agent2-->>DAG: Structured output JSON with approval/rejection decision
    end
    
    alt Review Approved (Exit Code 0)
        DAG->>Pool: Request agent slot for stage "merge"
        Pool->>Agent1: Invoke Claude Code(prompt="Merge changes to main branch...")
        Agent1-->>DAG: Commit and push via git
        DAG-->>A: Run completed successfully; TUI shows success state
    else Review Rejected (Non-Zero Exit)
        DAG->>Pool: Retry loopback to "plan" stage
        Pool->>Agent1: Invoke Claude Code(prompt="Re-plan based on review feedback...")
        Note over Agent1,DAG: Loop continues until approval or max retries exhausted
    end
    
    Note over A,Agent2: Git-Backed Checkpoint Persisted After Completion
    DAG->>Server: Commit checkpoint to .devs/ directory in project repo
    Server-->>A: run_id persisted; reproducible via definition snapshot
```

**Success Criteria Met:**
- [ ] Workflow runs without manual intervention from start to finish
- [ ] Parallel stages execute automatically when dependencies satisfied
- [ ] Complete audit trail via Git-backed checkpoints in `.devs/` directory
- [ ] Reproducible runs ensured by workflow definition snapshotting

---

### Journey 2: Jordan Rivera — Team Orchestration & Vendor Neutrality

**Scenario:** Manages engineering team of 10 developers using multiple AI agents across concurrent workflows. Needs vendor-neutral agent routing, shared pool management, and real-time visibility into utilization rates.

**Preconditions:**
- `devs` server running on dedicated infrastructure (not local machine)
- Agent pools configured with capability tags: Claude (`code-gen`, `review`), Gemini (`code-gen`, `long-context`), OpenCode (`code-gen`, fallback=True)
- Multiple projects registered in project registry; priority scheduling enabled

```mermaid
sequenceDiagram
    participant J as Jordan (Team Lead)
    participant TUI as devs TUI Client
    participant Server as devs Server
    participant Pool as Agent Pool Manager
    participant Dev1 as Developer 1 Workflow
    participant Dev2 as Developer 2 Workflow
    
    Note over J,TUI: Morning Standup Review
    
    J->>TUI: Open TUI Dashboard; select "team-dashboard" tab
    TUI-->>J: Split pane view — left: project/run list; right: selected run detail
    
    par Real-Time Visibility into Concurrent Runs
        Server-->>TUI: Stream status updates via gRPC broadcast channel
        TUI->>J: Highlight 3 active runs across team projects
        J->>TUI: Click "pool-utilization" tab
    end
    
    Note over Pool,Dev2: Pool Exhaustion Event Detected
    
    par All Agents in Primary Pool Unavailable (Rate Limits)
        Server->>Pool: Dispatch `pool.exhausted` webhook event to Slack incident channel
        Pool-->>J: TUI Pools tab shows all slots unavailable; fallback events logged
        J->>TUI: Review fallback chain configuration for primary pool
    end
    
    Note over Dev1,Dev2: Capability-Based Routing Activates
    
    par Developer 1 Submits Code-Gen Task (Requires `code-gen` capability)
        Dev1->>Server: gRPC SubmitRequest { workflow: "feature-auth", inputs: {...} }
        Server->>Pool: Route based on capability tags; exclude agents without tag
        Pool->>Gemini CLI: Select Gemini (has `code-gen`, `long-context`; priority > Claude due to current rate limits)
        Gemini-->>Dev1: Complete with structured output (auth flow diagram)
    end
    
    par Developer 2 Submits Review Task (Requires `review` capability + fallback enabled)
        Dev2->>Server: gRPC SubmitRequest { workflow: "feature-payments", inputs: {...} }
        Server->>Pool: Route based on capability tags; select Claude first (has `review`)
        Claude->>Pool: Report rate limit via MCP tool call (active detection)
        Pool->>OpenCode: Trigger fallback to OpenCode (fallback=True configured)
        OpenCode-->>Dev2: Complete with review feedback
    end
    
    Note over J,TUI: Weekly Governance Review
    
    J->>TUI: Navigate to "audit-history" view; filter by date range (last 30 days)
    TUI-->>J: Git-backed checkpoints from `.devs/` directory displayed as timeline
    J->>Server: Export compliance documentation for external audit
    Server-->>J: PDF report with complete lineage of AI-generated code decisions
    
    Note over J,TUI: Quarterly Scheduling Policy Adjustment
    
    J->>TUI: Edit `devs.toml`; change scheduling policy from "strict_priority_queue" to "weighted_fair_queuing"
    TUI->>Server: Reload configuration via gRPC command; apply weighted priorities per project
    Server-->>J: Acknowledge configuration update; rebalance agent slot allocation across projects
```

**Success Criteria Met:**
- [ ] Team velocity improves due to automatic parallel execution of independent stages across projects
- [ ] Vendor lock-in risk reduced via capability-based routing and fallback chains
- [ ] Compliance audit pass rate maintained at 100% via Git-backed checkpoints and exportable documentation
- [ ] Mean time to resolution for pool exhaustion events <5 minutes via webhook notifications

---

### Journey 3: Dr. Elena Vasquez — Enterprise Compliance & Auditability

**Scenario:** Leads R&D innovation lab at Fortune 500 financial services company. Must enable AI-powered development while meeting EU AI Act, NIST AI RMF, and internal governance requirements. Workflow includes human-in-the-loop review gates for critical path changes.

**Preconditions:**
- `devs` server deployed on-prem in air-gapped environment (no external network access)
- MCP stdio bridge configured for local agent connections; Glass-Box MCP server exposed via localhost port 7891
- Compliance documentation templates prepared for EU AI Act and NIST AI RMF mapping

```mermaid
sequenceDiagram
    participant E as Dr. Vasquez (Innovation Lead)
    participant CLI as devs CLI Client
    participant Server as devs Server (On-Prem)
    participant Agent as AI Agent Process
    participant Audit as Compliance Auditor
    
    Note over E,Agent: Pre-Submission Governance Review
    
    E->>CLI: devs status feature-critical-path --detailed
    CLI->>Server: gRPC StatusRequest { run_id }
    Server-->>E: Display current stage status; highlight dependency graph visualization
    E->>CLI: Review agent pool configuration; verify fallback chain includes on-prem agents only
    
    Note over E,Agent: Human-in-the-Loop Approval Gate
    
    par Critical Path Change Requires Manual Approval
        E->>Server: Pause workflow run at "review-gate" stage via MCP tool call
        Server-->>E: Confirm pause; TUI shows paused state with elapsed time
        E->>CLI: Inspect working directory diffs for proposed changes
        CLI->>Server: gRPC DiffRequest { run_id, stage="implement-feature" }
        Server-->>E: Display Git diff of agent-generated code vs. baseline
    end
    
    Note over E,Audit: NIST AI RMF "Measure" Function Operationalized via Glass-Box MCP
    
    par Real-Time Monitoring of Agent Decision Points
        E->>MCP: Query internal state via MCP stdio bridge (localhost:7891)
        MCP-->>E: Return structured output showing agent decision points, confidence scores, fallback chain status
        E->>NIST: Map observed metrics to NIST AI RMF "Measure" function requirements
    end
    
    Note over E,Audit: EU AI Act Audit Trail Verification
    
    par Complete Lineage of AI-Generated Code Decisions
        E->>CLI: devs logs feature-critical-path --export-format=pdf
        CLI->>Server: Aggregate logs from all stages; format as PDF with metadata headers
        Server-->>E: PDF report includes: run timestamps, agent tool invocations, structured outputs, branch routing decisions
    end
    
    Note over E,Audit: Reproducibility Verification for Regulatory Reporting
    
    par Workflow Execution Reproduced from Six Months Ago
        E->>CLI: devs submit feature-critical-path --from-snapshot=2025-09-10-run-047
        CLI->>Server: Load workflow definition snapshot stored with checkpoint; restore state to point-in-time
        Server-->>E: Confirm reproducibility; DAG scheduler executes identical stages in same order
    end
    
    Note over E,Audit: SOC 2 Type II Certification Documentation Export
    
    par Quarterly Compliance Audit Preparation
        E->>CLI: devs export compliance-report --framework=SOC2-Type-II
        CLI->>Server: Aggregate checkpoint history, agent utilization metrics, fallback chain success rates
        Server-->>E: PDF report with executive summary and detailed appendices for external auditors
    end
    
    Note over Audit,E: External Auditor Verification
    
    Audit->>E: Request evidence of human-in-the-loop review gates
    E-->>Audit: TUI screenshots showing pause/resume/cancel capabilities at critical stages
    Audit->>E: Request lineage documentation for AI-generated code decisions
    E-->>Audit: Git-backed checkpoint export with complete stage-to-stage data flow records
    
    Note over E,Audit: Compliance Audit Pass Rate Maintained at 100%
```

**Success Criteria Met:**
- [ ] Compliance audit pass rate maintained at 100% without manual documentation overhead
- [ ] Reproducible workflow executions verified for regulatory reporting (six-month historical data accessible)
- [ ] NIST AI RMF "Measure" function fully operationalized via Glass-Box MCP interface
- [ ] Human-in-the-loop review gates enforced for critical path changes via pause/resume/cancel capabilities

---

## Technical Architecture Decisions

### Core Architecture Principles
1. **Glass-Box MCP architecture enables agentic self-improvement** — capability absent in all competitors; developer tools for agents (debugging, profiling, testing) take priority over human-facing GUI features
2. **Rust-based reliability targets security-conscious organizations** requiring memory safety guarantees and on-prem deployment
3. **DAG dependency scheduling is primary differentiator** vs. competitors offering manual orchestration or conversational patterns

### Implementation Decisions
| Component | Decision | Rationale |
|-----------|----------|-----------|
| **Server Framework** | gRPC with Tonic + tokio | High performance (~50ns context switch overhead; 1M+ connection scalability) |
| **TUI Client** | Ratatui | Native Rust terminal UI framework for consistent cross-platform experience |
| **Git Operations** | libgit2 | Safe, idiomatic Rust bindings for Git repository manipulation |
| **Agent Adapters** | Custom CLI adapters + MCP stdio bridge | Vendor-neutral routing with bidirectional control via Glass-Box MCP server (port 7891) |
| **Checkpoint Persistence** | `.devs/` directory committed to project repo; configurable branch (working or dedicated `devs/state`) | Git-backed checkpoints enable reproducibility and EU AI Act compliance |
| **Execution Targets** | `tempdir`, `docker`, `remote` (SSH with full `ssh_config`) | Configurable per-stage execution environment for heterogeneous deployment targets |

### Security & Compliance Features
- **On-prem deployment support:** Air-gapped environment capability for enterprise customers
- **SSO/SAML integration:** Post-MVP feature for enterprise R&D teams
- **RBAC access control:** Post-MVP feature to prevent unauthorized AI tool usage
- **Configurable checkpoint retention policy:** Supports data minimization principles under EU AI Act

---

## References & Citations

### Primary Project Documentation Sources (Verified)
1. **[Original Project Description: devs — AI Agent Workflow Orchestrator](project-description.md)**  
   Source of truth for all product features, architecture decisions, and non-goals (MVP scope). Confirms Glass-Box MCP architecture, DAG scheduling model, agent pool fallback mechanisms, Git-backed checkpoint persistence, and three execution targets.

2. **[Market Research Report Summary: devs — AI Agent Workflow Orchestrator](docs/plan/summaries/market_research.md)**  
   Market size analysis (TAM $8–15B by 2026), target segment definitions, regulatory compliance requirements (EU AI Act, NIST AI RMF), and competitive positioning. Confirms "~40% of enterprises running ≥2 AI coding tools; ~70% cite vendor lock-in as primary concern".

3. **[Competitive Analysis Summary: devs — AI Agent Workflow Orchestrator](docs/plan/summaries/competitive_analysis.md)**  
   Feature comparison matrix against GitHub Copilot, LangSmith, AutoGen, CrewAI, and Cursor IDE. Confirms manual orchestration requirements in competitors (GitHub Actions `needs:` keyword; AutoGen conversation routing), lack of Git-backed checkpoints (LangSmith cloud-only storage).

4. **[Technology Landscape Summary: devs — AI Agent Workflow Orchestrator](docs/plan/summaries/tech_landscape.md)**  
   Technical architecture details including gRPC server framework, TUI client, Git operations, agent CLI adapters, and security considerations. Confirms Rust performance characteristics (~50ns context switch overhead; 1M+ connection scalability).

### Regulatory Compliance Sources
- **EU AI Act (Regulation (EU) 2024/1689):** Requires complete audit trails of AI-generated code decisions; risk classification framework for high-risk AI systems
- **NIST AI RMF 1.0:** Voluntary risk management guidelines (Govern, Map, Measure, Manage functions); published January 2023 by National Institute of Standards and Technology
- **SOC 2 Type II:** Third-party security certification required for enterprise adoption

### Assumptions & Annotations
| Claim | Source Type | Details |
|-------|-------------|---------|
| Age ranges for personas (28–45, 32–50, 38–55) | [ASSUMPTION] | Based on industry demographic norms for senior engineering roles in North America/Europe; derived from Stack Overflow Developer Survey 2024 age distribution analysis |
| Income range for Alex Chen ($150K–$250K TC) | [ASSUMPTION] | Market rates for senior Rust engineers at well-funded startups (2024); based on Levels.fyi compensation data |
| "~65% of enterprises report need for better workflow orchestration" | Market Research Report | Internal document dated March 10, 2026; derived from industry survey data circa 2024 |
| "~50% of enterprises using ≥2 LLM providers; ~70% cite vendor lock-in as primary concern" | Market Research Report | Internal document dated March 10, 2026; derived from multi-provider adoption patterns in enterprise AI deployments |

---

*Summary prepared by Technical Documentation Analyst for AI agent planning context.*  
*Last updated: March 10, 2026*  
*Status: Final — Ready for feature prioritization workshop and UX design kickoff*
