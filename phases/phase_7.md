# Phase 7: Distillation - Requirement Compilation & Roadmap

## Objective
Implement the `DistillerAgent` and the roadmap generation logic. This phase focuses on parsing approved PRD/TAS documents to extract unique, atomic, and testable requirements. These requirements are then organized into an 8-16 Epic roadmap and a Directed Acyclic Graph (DAG) of 200+ implementation tasks, ensuring 100% coverage and clear dependency paths.

## Requirements Covered
- [TAS-051]: Phase 3: Requirement Compilation
- [TAS-068]: Orphaned Requirements Check
- [1_PRD-REQ-PLAN-001]: Atomic Requirement Extraction
- [1_PRD-REQ-PLAN-002]: Epic & Task Orchestration
- [1_PRD-REQ-PLAN-003]: Dependency DAG generation
- [1_PRD-REQ-PLAN-004]: Task Granularity (25+ per Epic)
- [1_PRD-REQ-PLAN-005]: Task Definition attributes
- [1_PRD-REQ-PLAN-006]: Epic Count (8-16)
- [1_PRD-REQ-UI-003]: Roadmap & Task DAG Approval UI
- [1_PRD-REQ-UI-004]: Epic Commencement Checkpoint
- [1_PRD-REQ-UI-006]: Visual Task Progress (DAG View)
- [1_PRD-REQ-HITL-003]: Roadmap & Epic Review Approval
- [1_PRD-REQ-HITL-004]: Epic Start Review
- [1_PRD-REQ-NEED-MAKER-02]: Clear progress summaries
- [1_PRD-REQ-MET-003]: Requirement Traceability Index (RTI)
- [2_TAS-REQ-003]: Decomposition Process (Spec to Task)
- [9_ROADMAP-PHASE-005]: Requirement Distiller phase
- [9_ROADMAP-TAS-501]: Implement Requirement Distiller (Atomic extraction)
- [9_ROADMAP-TAS-502]: Epic and Task generation algorithm
- [9_ROADMAP-TAS-503]: Task Dependency DAG generator
- [9_ROADMAP-TAS-504]: Token/Cost Estimation heuristic
- [9_ROADMAP-TAS-505]: Build RTI calculator
- [9_ROADMAP-REQ-PLAN-003]: Dependency Deadlock detection
- [9_ROADMAP-REQ-030]: Requirement Coverage validation (RTI=1.0)
- [9_ROADMAP-REQ-009]: The Distillation Compiler (P5) logic
- [9_ROADMAP-REQ-003]: The Roadmap Gate (Post-Phase 5)
- [9_ROADMAP-REQ-004]: The Epic Start Gate logic
- [9_ROADMAP-DOD-P5]: Planning Definition of Done
- [9_ROADMAP-TAS-010]: Technical requirements for distillation
- [9_ROADMAP-TAS-011]: Technical requirements for planning
- [9_ROADMAP-TAS-013]: Technical requirements for roadmap
- [9_ROADMAP-TAS-014]: Technical requirements for epics
- [9_ROADMAP-TAS-019]: Technical requirements for tasks
- [9_ROADMAP-TAS-043]: Technical requirements for RTI
- [8_RISKS-REQ-057]: Pre-Execution Cost Estimation (+/- 20%)
- [8_RISKS-REQ-101]: Multi-Agent Requirement Cross-Check
- [8_RISKS-REQ-102]: Requirement Traceability Linkage
- [8_RISKS-REQ-103]: Mandatory User Approval Gate for requirements
- [8_RISKS-REQ-106]: RTI Metric Monitoring per phase
- [8_RISKS-REQ-121]: Hallucinated Requirements Distillation mitigation
- [8_RISKS-REQ-129]: Requirement Traceability Gaps mitigation
- [4_USER_FEATURES-REQ-014]: Requirement-to-Task Distillation feature
- [4_USER_FEATURES-REQ-015]: Dependency DAG Execution logic
- [4_USER_FEATURES-REQ-033]: Roadmap Viewer (Gantt/DAG) implementation
- [4_USER_FEATURES-REQ-034]: Requirement Orphanage Detection
- [4_USER_FEATURES-REQ-035]: Circular Task Dependency Resolution
- [4_USER_FEATURES-REQ-073]: Requirement Refinement Mode (re-distill)
- [4_USER_FEATURES-REQ-081]: Requirement Contradiction Detection
- [4_USER_FEATURES-REQ-084]: Token Budgeting (Configurable limits)
- [1_PRD-REQ-NEED-MAKER-03]: Cost estimation per project phase
- [9_ROADMAP-REQ-032]: Cost Heuristics benchmark
- [9_ROADMAP-REQ-045]: Task Granularity cap enforcement
- [9_ROADMAP-REQ-PLAN-001]: Plan requirements mapping
- [9_ROADMAP-REQ-PLAN-002]: Roadmap planning requirements

## Detailed Deliverables & Components
### Requirement Distiller Agent
- Develop the `DistillerAgent` to parse Phase 1 & 2 docs and extract unique `REQ-ID`s.
- Implement the "Multi-Agent Cross-Check" where a second agent validates the extracted list against source documents.
- Build the `RTI (Requirement Traceability Index) Calculator` to ensure 100% coverage.

### Task DAG Generator
- Build the algorithm to decompose requirements into atomic tasks (max 200 LoC per task).
- Implement the DAG generator with zero-cycle enforcement and dependency pathing.
- Develop the `CycleResolution` utility to automatically prompt for manual reordering if deadlocks are detected.

### Project Roadmap Planner
- Implement the 8-16 Epic partitioning logic based on logical milestones.
- Build the `TokenEstimate` heuristic to provide project-wide cost estimates (+/- 20%).
- Develop the "Epic Start Gate" where users can review and modify the 25+ tasks for an upcoming epic.

### Roadmap Visualization (Webview)
- Create the interactive Gantt/DAG view showing epic and task hierarchies.
- Implement "Semantic Zooming" to hide task details at low zoom levels.
- Build the "Requirement Orphanage" dashboard to highlight unmapped requirements.

## Technical Considerations
- Managing the complexity of 200+ task dependencies without performance lag in the UI.
- Ensuring task definitions include all necessary attributes (Success Criteria, Input Files).
- Implementation of the "Distillation Sweep" animation to provide feedback during the compilation process.
