# Task: Enforce SubmitRun as Sole Run Creation Path (Sub-Epic: 044_Detailed Domain Specifications (Part 9))

## Covered Requirements
- [1_PRD-REQ-077]

## Dependencies
- depends_on: []
- shared_components: [devs-core (Consumer), devs-proto (Consumer)]

## 1. Initial Test Written
- [ ] Create an architectural fitness test in `crates/devs-core/src/lib.rs` `#[cfg(test)]` (or a dedicated `tests/arch_constraints.rs`) named `test_submit_run_sole_creation_path`.
- [ ] This test uses `std::process::Command` to run `grep -rn "WorkflowRun::new\|WorkflowRun::create\|WorkflowRunBuilder::build" --include="*.rs" crates/` (or the project's equivalent constructor name) and parses the output.
- [ ] The test asserts that every call site found is in one of exactly two allowed locations:
  - The `SubmitRun` gRPC handler (e.g., `crates/devs-grpc/src/run_service.rs` or similar)
  - The MCP `submit_run` tool handler (e.g., `crates/devs-mcp/src/tools/submit_run.rs` or similar)
  - Test code (`#[cfg(test)]` modules or `tests/` directories) — allowed but must use the same public API
- [ ] Any other call site causes the test to fail with a message listing the offending file and line number.
- [ ] Annotate the test with `// Covers: 1_PRD-REQ-077`.

## 2. Task Implementation
- [ ] Design the `WorkflowRun` constructor in `devs-core` (or `devs-scheduler`) so that it requires a `SubmitRunRequest` parameter — a type only constructible from validated gRPC/MCP input. This makes accidental creation from other code paths a type error.
- [ ] If the type-level enforcement is not feasible at this phase (because the scheduler crate doesn't exist yet), implement the grep-based architectural test as the primary enforcement and document the type-level approach as a TODO for Phase 2.
- [ ] Integrate the architectural test into `./do test` so it runs on every presubmit.

## 3. Code Review
- [ ] Verify no test-only backdoors bypass the creation constraint without explicit `#[cfg(test)]` gating.
- [ ] Verify the grep pattern covers all constructor variants (e.g., `::new`, `::create`, `::default` if `Default` is derived).
- [ ] Confirm the allowed-paths list is maintained as a constant in the test for easy updates.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` (or the crate hosting the test) and confirm the architectural test passes.

## 5. Update Documentation
- [ ] Add a doc comment on the `WorkflowRun` constructor: `/// Only `SubmitRun` (gRPC) and `submit_run` (MCP) may call this. See [1_PRD-REQ-077].`

## 6. Automated Verification
- [ ] Run `./do test` and verify the architectural test is included in output.
- [ ] Verify `// Covers: 1_PRD-REQ-077` annotation present via `grep -r "Covers: 1_PRD-REQ-077"`.
