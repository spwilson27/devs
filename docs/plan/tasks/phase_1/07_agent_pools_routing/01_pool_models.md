# Task: Define Agent Pool Domain Models and Configuration (Sub-Epic: 07_Agent Pools & Routing)

## Covered Requirements
- [1_PRD-REQ-019]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config]

## 1. Initial Test Written
- [ ] Write a unit test in `devs-config` that verifies the parsing of `[[pool]]` blocks from a `devs.toml` string.
- [ ] Test should assert that:
    - Named pools are correctly identified.
    - `max_concurrent` is correctly parsed as a positive integer.
    - `[[pool.agent]]` entries are correctly ordered within the pool.
    - Capability tags are correctly extracted as a set of strings (e.g., `["code-gen", "review"]`).
    - The `tool` field (e.g., `"claude"`) and `fallback` boolean are parsed.
- [ ] Verify that duplicate pool names result in a validation error.
- [ ] Verify that an empty pool is valid but logs a warning (to be handled in later tasks).

## 2. Task Implementation
- [ ] In `devs-config`, define the `PoolConfig`, `AgentMemberConfig`, and `Capability` structs/enums.
- [ ] `AgentMemberConfig` should include:
    - `tool`: String (references the adapter name).
    - `capabilities`: `BTreeSet<String>` (standardized capability tags).
    - `fallback`: `bool` (used for priority ordering).
- [ ] `PoolConfig` should include:
    - `name`: String (unique identifier).
    - `max_concurrent`: `usize`.
    - `agents`: `Vec<AgentMemberConfig>`.
- [ ] Implement `serde` deserialization for these types to match the `devs.toml` format.
- [ ] Add a `validate()` method to `PoolConfig` to ensure `max_concurrent > 0` and that at least one agent is defined if the pool is intended to be usable.

## 3. Code Review
- [ ] Ensure that capability tags are case-insensitive and normalized (e.g., "Code-Gen" -> "code-gen").
- [ ] Verify that `AgentMemberConfig` ordering is preserved (first agent is highest priority).
- [ ] Ensure `devs-config` does not depend on `devs-pool` (avoiding circular dependency).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` to verify parsing logic.

## 5. Update Documentation
- [ ] Update `devs-config` internal documentation to reflect the new `PoolConfig` structure.

## 6. Automated Verification
- [ ] Run `./do test` and ensure all tests pass.
- [ ] Run `./tools/verify_requirements.py` to ensure [1_PRD-REQ-019] is covered.
