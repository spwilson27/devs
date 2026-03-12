# Task: Security Posture Documentation and MCP Auth-less Design (Sub-Epic: 042_Detailed Domain Specifications (Part 7))

## Covered Requirements
- [1_PRD-REQ-064], [1_PRD-REQ-066]

## Dependencies
- depends_on: [none]
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a documentation verification test in a new file `tests/test_security_docs.py` (or similar) that asserts the existence of a `docs/SECURITY.md` file containing the specific phrase "local or trusted-network deployment".
- [ ] Create a "future-proof" unit test in a placeholder crate (e.g., `devs-mcp/src/lib.rs` if it exists, or as a workspace test) that asserts that a mock MCP handshake completes successfully without any `Authorization` or `Token` headers. This is a "Red" test because the crate likely doesn't exist yet, so the "test" might be a script that fails if an auth-requiring crate is found.

## 2. Task Implementation
- [ ] Create `docs/SECURITY.md` with the following authoritative content:
    ```markdown
    # Security Policy (MVP)
    
    The `devs` server is designed for **local or trusted-network deployment ONLY**.
    It MUST NOT be exposed to the public internet without external network controls (OS firewalls, VPCs).
    
    ## MCP Authentication
    The MCP server (Glass-Box interface) does NOT require authentication tokens in the MVP protocol handshake.
    Any process that can reach the MCP listener is trusted unconditionally.
    ```
- [ ] Update the `README.md` in the root directory to include a "Security Warning" section that links to `docs/SECURITY.md`.
- [ ] Add a comment to the MCP server implementation (even if it's just a stub in Phase 0) explicitly referencing `[1_PRD-REQ-064]` and stating that authentication is omitted by design for MVP.

## 3. Code Review
- [ ] Verify that the documentation is clear and uses the "MUST NOT" and "MUST" keywords correctly as per the requirements.
- [ ] Ensure that no existing proto definitions (if any) have been modified to include auth fields.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test` and ensure the documentation existence test passes.
- [ ] Verify that no new "auth" dependencies have been introduced by running `cargo tree | grep auth` (if `Cargo.toml` exists).

## 5. Update Documentation
- [ ] Update `MEMORY.md` to record the security posture decision and the "Trusted Network" constraint for future agents.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure `1_PRD-REQ-064` and `1_PRD-REQ-066` are correctly mapped to this task and the tests.
