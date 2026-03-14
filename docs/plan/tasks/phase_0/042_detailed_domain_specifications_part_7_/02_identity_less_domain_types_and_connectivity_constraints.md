# Task: Architectural Guardrails: Identity-less Domain Types and Connectivity Constraints (Sub-Epic: 042_Detailed Domain Specifications (Part 7))

## Covered Requirements
- [1_PRD-REQ-065], [1_PRD-REQ-067], [1_PRD-REQ-068]

## Dependencies
- depends_on: ["01_security_posture_and_mcp_auth_exclusion.md"]
- shared_components: [devs-proto, devs-core, devs-config]

## 1. Initial Test Written
- [ ] Create a "Dependency Guard" script (e.g., `.tools/guard_dependencies.py`) that fails if any of the following crate names are found in any `Cargo.toml`: `aws-sdk-secretsmanager`, `vaultrs`, `google-cloud-secretmanager`, `azure_mgmt_keyvault`, `onepassword-connect-sdk`. This fulfills `[1_PRD-REQ-068]`.
- [ ] Create a "Domain Purity" test in `devs-proto` (or `tests/`) that uses a reflection-like check (or just a manual field check) to ensure `WorkflowRun` and `SubmitRunRequest` messages do not have fields containing the strings "user", "owner", "auth", "session", or "token". This fulfills `[1_PRD-REQ-067]`.

## 2. Task Implementation
- [ ] Ensure that `proto/devs/v1/run.proto` (as defined in Sub-Epic 008/009) is reviewed and explicitly marked with `// Covers: 1_PRD-REQ-067` to certify its identity-less nature.
- [ ] Update `devs-config` (or the initial `ServerConfig` struct) to include a reserved `tls` section as per `[1_PRD-REQ-065]`. 
    ```rust
    /// Architectural reservation for future TLS support.
    /// Covers: 1_PRD-REQ-065
    #[derive(Debug, Serialize, Deserialize)]
    pub struct TlsConfig {
        /// Reserved field. Must be None or empty in MVP.
        pub enabled: Option<bool>,
    }
    ```
- [ ] Implement the `.tools/guard_dependencies.py` script and integrate it into the `./do lint` command sequence.
- [ ] Add a comment to the gRPC service layer implementations explicitly stating that they are authentication-agnostic and must not be coupled to identity schemas.

## 3. Code Review
- [ ] Verify that no "user-identity" concepts have sneaked into the gRPC service method signatures (e.g. `submit_run(run_request: SubmitRunRequest)` should not be `submit_run(user: User, run_request: ...)`.
- [ ] Ensure that the `TlsConfig` struct is parsed from TOML but has zero effect on the actual `tonic` or `mcp` server instantiation code.

## 4. Run Automated Tests to Verify
- [ ] Run `./do lint` and ensure the `guard_dependencies.py` check passes.
- [ ] Run the "Domain Purity" test to confirm identity-less proto messages.
- [ ] Try to add `aws-sdk-secretsmanager` to a `Cargo.toml` temporarily and verify that `./do lint` correctly fails.

## 5. Update Documentation
- [ ] Update `MEMORY.md` to record the architectural guardrail requiring all domain types to be identity-less.

## 6. Automated Verification
- [ ] Run `.tools/verify_requirements.py` to ensure `1_PRD-REQ-065`, `1_PRD-REQ-067`, and `1_PRD-REQ-068` are correctly mapped to this task and its verification scripts.
