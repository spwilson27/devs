# Task: Hardcoded Coverage Thresholds (Sub-Epic: 036_Detailed Domain Specifications (Part 1))

## Covered Requirements
- [1_PRD-KPI-BR-004]

## Dependencies
- depends_on: [none]
- shared_components: ["./do Entrypoint Script"]

## 1. Initial Test Written
- [ ] Create a test that tries to pass a coverage threshold via a config file (e.g., `.devs_coverage.json`) and verify that the `./do` script ignores it.
- [ ] Verify that thresholds are not read from environment variables (other than perhaps a debug override, though the requirement says "MUST NOT be read from any configuration file at runtime").
- [ ] Assert that the `./do` script's `coverage` logic uses internal constants for thresholds.

## 2. Task Implementation
- [ ] Open the `./do` script and locate the `coverage` subcommand.
- [ ] Define constant variables for all coverage gates (e.g., `UNIT_THRESHOLD=90`, `E2E_THRESHOLD=80`).
- [ ] Ensure that these constants are used in the comparison logic against `actual_pct`.
- [ ] Remove any logic that attempts to load thresholds from external files or configuration sources.

## 3. Code Review
- [ ] Confirm that thresholds are indeed hardcoded as variables within the `./do` script [1_PRD-KPI-BR-004].
- [ ] Verify that any modification of these thresholds requires a code change to `./do`.

## 4. Run Automated Tests to Verify
- [ ] Run the test created in step 1 and ensure it passes.
- [ ] Run `./do coverage` and verify it correctly enforces the hardcoded thresholds.

## 5. Update Documentation
- [ ] Update `.agent/MEMORY.md` to note that coverage thresholds are now hardcoded in the `./do` script as per the requirement.

## 6. Automated Verification
- [ ] Run `grep` on the `./do` script to verify the presence of the constant threshold definitions.
