# Task: Implement Search-Before-Read Policy (Sub-Epic: 01_MCP Tool Reliability & Recovery)

## Covered Requirements
- [3_MCP_DESIGN-REQ-046]

## Dependencies
- depends_on: []
- shared_components: [devs-core, devs-mcp]

## 1. Initial Test Written
- [ ] Write a unit test in `crates/devs-core/src/agent/client/search_read.rs` (or similar).
- [ ] The test must:
    - [ ] Create a mock agent client with a recorded history of MCP tool calls.
    - [ ] Simulate an agent's request to read a file in a large crate (e.g., `crates/devs-core/src/lib.rs`).
    - [ ] Assert that the client logic first calls `search_files` or `search_content` to locate relevant symbols before allowing a `read_file` call on that path.
    - [ ] Assert that a direct `read_file` call without a preceding search for a large file (e.g., > 1000 lines) returns a "soft error" or warning to the agent, prompting it to narrow its search first.

## 2. Task Implementation
- [ ] Implement the `SearchBeforeRead` decorator/policy in the agent client:
    - [ ] Track the "known context" of the agent session (files already searched or read).
    - [ ] Intercept `read_file` calls.
    - [ ] If the file is part of a "large" directory or is known to be large, and no `search_files` or `search_content` has been performed in its parent directory/module, return a prompt to the agent suggesting a search first.
    - [ ] Provide a `Search` utility that wraps `search_content` and `search_files` to make it easy for agents to follow the protocol.
- [ ] Ensure the policy is configurable to avoid blocking legitimate first-time reads of small, known configuration files (e.g., `Cargo.toml`).

## 3. Code Review
- [ ] Verify that the policy does not introduce infinite loops where the agent keeps searching without reading.
- [ ] Ensure that "large file" thresholds are sensible (e.g., 500 lines or 50KB).
- [ ] Check that the search requirement is "sticky" for a session (once searched, reading is allowed).

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core --lib agent::client::search_read`
- [ ] Run `./do test` and verify traceability for REQ-046.

## 5. Update Documentation
- [ ] Update `docs/plan/specs/3_mcp_design.md` to reflect the specific implementation of the search-before-read threshold and session state tracking.

## 6. Automated Verification
- [ ] Run `./do test` and ensure `target/traceability.json` reports `[3_MCP_DESIGN-REQ-046]` as covered.
