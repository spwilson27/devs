# Task: Enforce Token Cost Guardrails and Budgets (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-132]

## 1. Initial Test Written
- [ ] Write unit tests for `BudgetManager` verifying that it accurately computes USD cost given a varying token usage payload and pricing model configuration.
- [ ] Write tests to ensure the LangGraph orchestrator pauses execution and emits a `BUDGET_EXCEEDED` event when the accumulated cost breaches the hard task limit.

## 2. Task Implementation
- [ ] Implement the `BudgetManager` service to ingest token counts from every LLM interaction turn and calculate cumulative task and epic costs.
- [ ] Integrate a task-level budget limit (e.g., $5.00 per task as specified in constraints) into the main loop.
- [ ] Add logic to cleanly pause the task execution immediately before initiating the next LLM call if the token estimation indicates the budget will be breached.
- [ ] Store cumulative usage statistics in the SQLite `projects` or `tasks` table to persist budgets across restarts.

## 3. Code Review
- [ ] Verify that cost calculations correctly distinguish between cheaper models (Flash) and more expensive models (Pro).
- [ ] Ensure the `BudgetManager` update is wrapped in the same ACID SQLite transaction as the agent state to prevent budget desynchronization on a crash.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test:unit --filter budget-manager` to ensure price tracking algorithms are precise.
- [ ] Run a simulated end-to-end task that artificially inflates token use to verify the safety pause is triggered appropriately.

## 5. Update Documentation
- [ ] Add the newly created budget database columns and formulas to `docs/database_schema.md`.
- [ ] Document the CLI output format for `BUDGET_EXCEEDED` errors and how users can override the budget constraint in `.agent/operations.md`.

## 6. Automated Verification
- [ ] Confirm `[8_RISKS-REQ-132]` is validated by running the requirement matrix checker script against the updated test suite tags.
