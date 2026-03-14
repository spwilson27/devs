# Task: .devs_context.json Content & Schema (Sub-Epic: 03_Template Resolution & Context)

## Covered Requirements
- [2_TAS-REQ-089]

## Dependencies
- depends_on: ["01_template_resolver_skeleton.md"]
- shared_components: [devs-core, devs-executor]

## 1. Initial Test Written
- [ ] Create unit tests in `crates/devs-executor/src/context/tests.rs` verifying the generation of the `.devs_context.json` payload.
- [ ] Write a test that ensures the payload matches the expected schema:
    - `run`: { `run_id`, `slug`, `workflow_name` }
    - `inputs`: { `key`: `value` }
    - `stages`: { `name`: `StageOutput` }
- [ ] Write a test for proportional truncation when the payload exceeds 10 MiB.
- [ ] Verify that truncated fields are clearly marked (e.g., using a `truncated: true` flag in the relevant output field).

## 2. Task Implementation
- [ ] Define the `StageContextPayload` serializable struct in `crates/devs-executor/src/context/payload.rs`.
- [ ] Implement a function `generate_context_payload(ctx: &ResolutionContext) -> StageContextPayload`.
- [ ] Add logic to gather:
    - Run metadata (run_id, slug, etc.).
    - Workflow inputs.
    - Status and outputs (stdout, stderr, structured) of all stages in the transitive dependency closure.
- [ ] Implement proportional truncation:
    - Calculate the total size of the JSON-serialized payload.
    - If > 10 MiB, identify the largest fields (likely stdout/stderr of prior stages).
    - Truncate these fields proportionally until the total size is under 10 MiB.
    - Ensure truncated fields append a summary like `"... [TRUNCATED 500 KB]"` and set a `truncated` boolean if the schema supports it.

## 3. Code Review
- [ ] Verify the truncation algorithm is fair and doesn't remove all context from any single dependency.
- [ ] Confirm the output JSON schema matches the requirement [2_TAS-REQ-089].
- [ ] Ensure `serde_json` is used for robust serialization.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-executor --lib context::tests` and ensure all context generation and truncation tests pass.

## 5. Update Documentation
- [ ] Document the schema and truncation policy of `.devs_context.json` for agent developers.

## 6. Automated Verification
- [ ] Verify traceability annotations: `// Covers: 2_TAS-REQ-089`.
- [ ] Run `./tools/verify_requirements.py` to ensure requirements are correctly mapped.
