# Task: Implement State Repository (Sub-Epic: 02_SQLite Schema & Persistence Layer)

## Covered Requirements
- [2_TAS-REQ-017]

## 1. Initial Test Written
- [ ] Create an integration test in `packages/core/test/persistence/state_repository.test.ts` that:
    - Instantiates the `StateRepository` with a test database.
    - Tests adding, updating, and retrieving a project.
    - Tests bulk insertion of requirements and epics within a single transaction.
    - Tests appending an agent turn to the `agent_logs` table.
    - Verifies ACID compliance by simulating a failure mid-transaction and checking that no partial data was committed.
    - Tests retrieving the full state of a project (requirements + tasks + logs).

## 2. Task Implementation
- [ ] Implement the `StateRepository` class in `packages/core/src/persistence/state_repository.ts`.
- [ ] Implement methods for all core entities:
    - `upsertProject(project: Project): void`
    - `addDocument(doc: Document): void`
    - `saveRequirements(reqs: Requirement[]): void`
    - `saveEpics(epics: Epic[]): void`
    - `saveTasks(tasks: Task[]): void`
    - `appendAgentLog(log: AgentLog): void`
    - `recordEntropyEvent(event: EntropyEvent): void`
- [ ] Use `better-sqlite3`'s `.transaction()` wrapper to ensure all multi-step operations are ACID-compliant.
- [ ] Implement query methods for state recovery and audit (e.g., `getProjectState(id: string)`, `getTaskLogs(taskId: string)`).

## 3. Code Review
- [ ] Verify that all operations use transactions where appropriate to maintain state integrity [2_TAS-REQ-017].
- [ ] Ensure that the repository pattern is correctly followed, abstracting the SQL logic away from the orchestrator.
- [ ] Check for proper error handling and logging within the repository.

## 4. Run Automated Tests to Verify
- [ ] Run `pnpm test packages/core/test/persistence/state_repository.test.ts` and ensure all persistence operations are verified.

## 5. Update Documentation
- [ ] Update internal developer documentation on how to use the `StateRepository` for persisting agent state and logs.

## 6. Automated Verification
- [ ] Run a stress test script `scripts/db_stress_test.ts` that performs 1000 concurrent writes/reads and verifies that the database remains consistent and no data is lost.
