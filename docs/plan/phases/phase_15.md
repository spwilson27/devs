# Phase 15: Out of Scope & Future Roadmap

## Objective
Define the boundaries of the `devs` system by explicitly documenting out-of-scope (OOS) requirements and mapping future roadmap items. This ensures that the implementation remains focused on the core mission of greenfield software generation while providing a clear path for future enhancements like multi-user collaboration and local LLM support.

## Requirements Covered
- [1_PRD-REQ-OOS-001]: Legacy System Refactoring (Out of Scope)
- [1_PRD-REQ-OOS-002]: Live Production Infrastructure (Out of Scope)
- [1_PRD-REQ-OOS-003]: Creative Asset Generation (Out of Scope)
- [1_PRD-REQ-OOS-004]: Ongoing Agent-as-a-Service (Out of Scope)
- [1_PRD-REQ-OOS-005]: Hardware-Specific Development (Out of Scope)
- [1_PRD-REQ-OOS-006]: App Store Submission Management (Out of Scope)
- [1_PRD-REQ-OOS-007]: Legal & Compliance Certification (Out of Scope)
- [1_PRD-REQ-OOS-008]: Niche Language Support (Out of Scope)
- [1_PRD-REQ-OOS-009]: Production Data Migration (Out of Scope)
- [1_PRD-REQ-OOS-010]: Real-time Multi-User Orchestration (Out of Scope)
- [1_PRD-REQ-OOS-011]: Local LLM Hosting Management (Out of Scope)
- [1_PRD-REQ-OOS-012]: Subjective Manual UI/UX QA (Out of Scope)
- [1_PRD-REQ-OOS-013]: Advanced Red-Team Penetration Testing (Out of Scope)
- [1_PRD-REQ-OOS-014]: Distributed Load Testing (Out of Scope)
- [1_PRD-REQ-OOS-015]: Secret Management Vault Hosting (Out of Scope)
- [1_PRD-REQ-OOS-016]: Browser/OS-Specific Polyfilling (Out of Scope)
- [1_PRD-REQ-OOS-017]: 3D Modeling & Game Assets (Out of Scope)
- [1_PRD-REQ-OOS-018]: Formal Cryptographic Auditing (Out of Scope)
- [1_PRD-REQ-OOS-019]: Full Offline Operational Mode (Out of Scope)
- [1_PRD-REQ-OOS-020]: Project Hosting & PaaS (Out of Scope)
- [9_ROADMAP-FUTURE-001]: Support for local LLMs (Future)
- [9_ROADMAP-FUTURE-002]: Team Mode: Multi-user collaboration (Future)
- [9_ROADMAP-FUTURE-003]: Automated PR Reviewer integration (Future)
- [9_ROADMAP-FUTURE-004]: Native Mobile App monitoring (Future)
- [3_MCP-UNKNOWN-301]: TAS Revision Gate with approval evaluation
- [4_USER_FEATURES-REQ-087]: Project Export & Handover

## Detailed Deliverables & Components
### Out-of-Scope Manifest
- Document all explicitly excluded features to prevent scope creep during P6 implementation.
- Maintain the "Greenfield Only" focus for the core orchestrator.

### Future Roadmap Strategy
- Define the architectural hooks needed to support "Team Mode" and "Local LLMs" in the future.
- Research integration points for GitHub Automated PR Reviews.

### Project Handover Tools
- Implement the `devs export` command to archive the project and generate the final validation report.
- Develop the "Onboarding Agent" manifest to facilitate human handover.

## Technical Considerations
- Ensuring that current architectural decisions (like SQLite and single-user focus) don't create insurmountable blockers for future collaborative features.
- Evaluating the impact of local LLM inference on system latency and context management.
