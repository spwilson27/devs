# Task: Develop Benchmarking Suite for Orchestrator Metrics (Sub-Epic: 14_Fact-Checking & Benchmarking)

## Covered Requirements
- [9_ROADMAP-TAS-803]

## 1. Initial Test Written
- [ ] Write a unit test suite in `tests/metrics/benchmarkingSuite.test.ts`.
- [ ] Mock a SQLite database containing known `tasks`, `agent_logs`, and `requirements` records.
- [ ] Assert that `BenchmarkingSuite.calculateTAR()` accurately computes the Task Autonomy Rate (tasks completed without HITL intervention / total tasks).
- [ ] Assert that `BenchmarkingSuite.calculateTTFC()` accurately computes Time-to-First-Commit (time delta from project start to the first git commit in the `tasks` table).
- [ ] Assert that `BenchmarkingSuite.calculateRTI()` correctly computes Requirement Traceability Index (requirements mapped to tasks / total requirements).
- [ ] Assert that `BenchmarkingSuite.calculateUSDPerTask()` correctly aggregates token usage from `agent_logs` and applies a mock pricing model to estimate USD cost per task.

## 2. Task Implementation
- [ ] Create the `BenchmarkingSuite` class in `src/metrics/BenchmarkingSuite.ts`.
- [ ] Inject the SQLite connection pool (`DatabaseService`) into the suite.
- [ ] Implement the `calculateTAR()` method using a SQL query to count tasks with zero `intervention_count`.
- [ ] Implement the `calculateTTFC()` method by finding the timestamp of the earliest `CommitNode` log and comparing it to the project `created_at` timestamp.
- [ ] Implement the `calculateRTI()` method by joining the `requirements` table with the `tasks` table to find the coverage percentage.
- [ ] Implement the `calculateUSDPerTask()` method by summing `prompt_tokens` and `completion_tokens` from `agent_logs` per task, multiplying by the configured model cost coefficients.

## 3. Code Review
- [ ] Ensure SQL queries are optimized (e.g., using `COUNT()` and `SUM()` natively in SQLite rather than pulling all rows into memory).
- [ ] Verify that the cost coefficients can be easily configured or injected via environment variables for future model pricing updates.

## 4. Run Automated Tests to Verify
- [ ] Execute `npm run test -- tests/metrics/benchmarkingSuite.test.ts` and verify all metric calculations match the mocked data expectations.
- [ ] Run `npm run test:metrics` to ensure there are no regressions.

## 5. Update Documentation
- [ ] Add documentation in `.agent/metrics.md` detailing the mathematical formulas and SQLite queries used for TAR, TTFC, RTI, and USD/Task.
- [ ] Add instructions on how to invoke the Benchmarking Suite via the CLI (e.g., via a new `devs benchmark` command, if applicable, or just document the internal API).

## 6. Automated Verification
- [ ] Run `npm run lint` and `npm run typecheck` to verify code quality.
