# Tasks for 07_Persona Needs Core (Phase: phase_1.md)

## Covered Requirements
- [REQ-NEED-CORE]

### Task Checklist
- [ ] **Subtask 1: Define Persona Data Structures**: Create TypeScript interfaces and type definitions representing the four core personas: Makers, Architects, Domain Experts, and Developers. This should include configurations for their default contexts, constraint preferences (e.g., rigid vs. exploratory), and logging/verbosity levels.
- [ ] **Subtask 2: Implement Persona Context Providers**: Develop a provider service (`PersonaContextProvider`) that dynamically retrieves and injects persona-specific configuration into the system's global state or MCP context map upon project initialization. 
- [ ] **Subtask 3: Build Persona Prompt Injection Logic**: Implement an interceptor or prompt templating function within the LLM orchestration layer that automatically prepends persona-specific systemic constraints and guidelines (e.g., Maker's focus on thorough automation, Architect's focus on design documentation) to agent requests.
- [ ] **Subtask 4: Develop Persona-Specific Constraint Checkers**: Create validation middleware that analyzes proposed agent actions against the active persona's constraints (e.g., ensuring a "Developer" persona doesn't unilaterally alter high-level TAS without triggering an "Architect" approval flow).

### Testing & Verification
- [ ] Write unit tests for `PersonaContextProvider` to ensure valid persona configurations are returned and invalid identifiers fail gracefully.
- [ ] Create unit tests for the Prompt Injection Logic verifying that systemic constraints unique to Makers, Architects, Domain Experts, and Developers are correctly appended to the base prompts.
- [ ] Implement integration tests within a sandbox environment to simulate an agent action and assert that the Persona-Specific Constraint Checkers correctly permit or block actions depending on the currently active persona.