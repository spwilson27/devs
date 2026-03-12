# Task: Run Slug Generation Algorithm (Sub-Epic: 01_Core Domain Models & State Machine)

## Covered Requirements
- [1_PRD-REQ-008], [2_TAS-REQ-030], [2_TAS-REQ-076]

## Dependencies
- depends_on: [none]
- shared_components: [devs-core]

## 1. Initial Test Written
- [ ] Write unit tests for the `RunSlug` generation logic in `devs-core/src/models/slug.rs`.
- [ ] Write tests verifying the format: `{workflow_name}-{YYYYMMDD}-{4 random hex chars}`.
- [ ] Write tests verifying that non-alphanumeric characters in the workflow name are replaced by or collapsed into hyphens.
- [ ] Write tests verifying the maximum length of 128 characters.
- [ ] Verifies [1_PRD-REQ-008], [2_TAS-REQ-030], [2_TAS-REQ-076].

## 2. Task Implementation
- [ ] Implement `RunSlug::generate(workflow_name: &str) -> String`.
- [ ] In the generation logic:
    - Normalize the workflow name: convert to lowercase, replace all non-alphanumeric characters with `-`.
    - Collapse multiple consecutive hyphens into a single `-`.
    - Remove leading/trailing hyphens.
    - Append the current date in `YYYYMMDD` format (using `chrono::Utc::now()`).
    - Append 4 random lowercase alphanumeric characters (using `rand` crate or `uuid` v4 prefix).
    - Ensure the final string does not exceed 128 characters by truncating the normalized workflow name if necessary.
- [ ] Define `RunSlug` as a wrapper around `String` with a `new(s: String) -> Result<Self, ValidationError>` method that enforces these format rules for manually provided names.
- [ ] Implements [1_PRD-REQ-008], [2_TAS-REQ-030], [2_TAS-REQ-076].

## 3. Code Review
- [ ] Verify that the slug format matches [2_TAS-REQ-076].
- [ ] Ensure the generation logic handles extremely long workflow names gracefully without exceeding the 128-character limit.
- [ ] Check for edge cases like workflow names that are entirely non-alphanumeric.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core` and verify all run slug generation tests pass.

## 5. Update Documentation
- [ ] Add doc comments explaining the run slug format and generation rules in `devs-core`.

## 6. Automated Verification
- [ ] Run `./tools/verify_requirements.py` to ensure traceability for the implemented REQ IDs.
