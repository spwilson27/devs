# Task: Security Check CLI and Webhook Risk Reporting (Sub-Epic: 41_Risk 014 Verification)

## Covered Requirements
- [AC-RISK-014-04]

## Dependencies
- depends_on: [02_mcp_server_hardening.md]
- shared_components: [devs-cli, devs-config]

## 1. Initial Test Written
- [ ] Write an E2E test in `devs-cli` that invokes `devs security-check --format json`.
- [ ] The test must verify that the output contains a JSON object with `"check_id": "SEC-WEBHOOK-TLS"`.
- [ ] Assert that the status for this check is `"warn"` and the `detail` field mentions the DNS-rebinding residual risk.

## 2. Task Implementation
- [ ] Implement the `devs security-check` command in the `devs-cli` crate.
- [ ] The command should load the current `ServerConfig` (via `devs-config`).
- [ ] Implement the `SEC-WEBHOOK-TLS` check: it should unconditionally report `status: "warn"` at MVP, with the `detail` string: `"Webhook SSRF DNS-rebinding window remains open; rebinding during the 500ms connection window is possible."`
- [ ] (Bonus) The check could also inspect if `allow_local_webhooks = true` and report `SEC-LOCAL-WEBHOOK` as `warn` if so (aligning with [RISK-014]).
- [ ] Format the output as either human-readable text (default) or JSON (via `--format json`).

## 3. Code Review
- [ ] Verify that the `detail` string is accurate and matches the mitigation documented in [RISK-014].
- [ ] Confirm that the CLI command uses the same `check_id` strings as specified in the risk mitigation spec.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-cli` and the E2E test for the `security-check` command.

## 5. Update Documentation
- [ ] Update the CLI help text for `devs security-check` to describe its purpose.

## 6. Automated Verification
- [ ] Run `./do test` and verify that `traceability.json` shows [AC-RISK-014-04] as covered.
