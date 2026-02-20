# Tasks for Market Analysis & Trends (Phase: phase_1.md)

## Covered Requirements
- [REQ-MR-006], [REQ-MR-007], [REQ-MR-008], [REQ-MR-009], [REQ-MR-010]

### Task Checklist
- [ ] **Subtask 1: Define User Approval Workflow (REQ-MR-006)**: Document the exact sequence of events for architectural approval, including how the AI presents options, how the user provides feedback, and how the AI incorporates that feedback into the final decision.
- [ ] **Subtask 2: Specify HITL Checkpoint Schema (REQ-MR-006)**: Define a JSON schema for 'HITL Checkpoints' that includes the context of the decision, the options considered, the AI's recommendation, and the user's ultimate approval or rejection.
- [ ] **Subtask 3: Architecture Approval UI Mockup (REQ-MR-006)**: Create a conceptual mockup or markdown-based UI description for the VSCode Dashboard that displays architectural decisions for user review.
- [ ] **Subtask 4: Decision Log Schema Definition (REQ-MR-007)**: Define a standardized format (JSON) for logging agent decisions, including timestamps, agent ID, specific requirement ID being addressed, reasoning (Chain of Thought), and the final decision.
- [ ] **Subtask 5: Audit Trail Storage Strategy (REQ-MR-007)**: Determine and document where and how the audit trail will be stored (e.g., a `.devs/audit/` directory with daily JSON logs) to ensure persistence and easy retrieval for compliance reviews.
- [ ] **Subtask 6: Integrate Decision Logging into Research Agent Prompting (REQ-MR-007)**: Update the base system prompt instructions for research agents to ensure they explicitly output their reasoning in a format that can be parsed and logged.
- [ ] **Subtask 7: Sandbox Architecture Specification (REQ-MR-008)**: Research and document the technical architecture for the agent sandbox, comparing options like Docker containers vs. local process isolation with restricted permissions.
- [ ] **Subtask 8: Define Sandbox Resource Limits (REQ-MR-008)**: Specify the default resource constraints for the agent sandbox (CPU, Memory, Network egress, File system read/write paths) to prevent runaway processes or unauthorized data access.
- [ ] **Subtask 9: Security Threat Model for Autonomous Agents (REQ-MR-008)**: Perform a STRIDE threat modeling exercise for autonomous agent execution and document the mitigations that the sandbox must provide.
- [ ] **Subtask 10: LLM Provider Configuration Schema (REQ-MR-009)**: Define a configuration schema that allows users to specify LLM providers, including support for local endpoints (e.g., `http://localhost:11434` for Ollama) and specific "Zero-Data-Retention" flags for enterprise APIs.
- [ ] **Subtask 11: Zero-Data-Retention (ZDR) Verification Logic (REQ-MR-009)**: Define the validation logic that ensures 'devs' only uses approved, privacy-compliant models and settings when the user enables "Strict Privacy Mode".
- [ ] **Subtask 12: Local LLM Compatibility Research (REQ-MR-009)**: Document the minimum requirements and supported local LLM providers (Ollama, LM Studio, vLLM) to ensure a baseline of quality for the "Basic Mode".
- [ ] **Subtask 13: CLI Basic Mode Architecture (REQ-MR-010)**: Design the CLI architecture to support a standalone "Basic Mode" that can execute core research and project initialization tasks without requiring the VSCode Extension.
- [ ] **Subtask 14: Basic Mode Command Set Definition (REQ-MR-010)**: Define the specific set of subcommands and flags available in Basic Mode (e.g., `devs init --basic`, `devs research --basic`) and document any limitations compared to the Pro version.
- [ ] **Subtask 15: Feature Parity and Tier Mapping (REQ-MR-010)**: Create a matrix mapping features between the CLI-Only Basic Mode and the VSCode Pro Mode to guide future development and monetization strategies.

### Testing & Verification
- [ ] **Audit Trail Validation**: Verify that the Decision Log Schema can successfully capture and represent a complex architectural decision with multiple alternatives.
- [ ] **Sandbox Constraint Verification**: Define a set of "negative tests" (e.g., attempting to access a sensitive file outside the project root) that the sandbox implementation must eventually pass.
- [ ] **CLI Basic Mode Smoke Test Plan**: Create a manual test plan to verify that the CLI can initialize a project and run a basic research task in "Basic Mode" without the VSCode environment.
