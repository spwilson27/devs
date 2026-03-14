# Task: Reserve [secrets] Config Section in devs.toml Schema (Sub-Epic: 043_Detailed Domain Specifications (Part 8))

## Covered Requirements
- [1_PRD-REQ-071]

## Dependencies
- depends_on: [none]
- shared_components: [devs-config (consumer)]

## 1. Initial Test Written
- [ ] In the `devs-config` crate, write a unit test `test_secrets_section_parsed_and_ignored` that:
  1. Constructs a TOML string containing a valid `[secrets]` section with arbitrary keys (e.g., `provider = "vault"`, `token = "abc123"`, `region = "us-east-1"`).
  2. Deserializes it into `ServerConfig` and asserts deserialization succeeds.
  3. Asserts that the `secrets` field is `Some(...)` and its contents are captured.
  4. Asserts that no side effects occur (no env vars set, no network calls, no state changes).
- [ ] Write a second test `test_config_without_secrets_section` that confirms a TOML without `[secrets]` deserializes successfully with `secrets: None`.
- [ ] Annotate tests with `// Covers: 1_PRD-REQ-071`.

## 2. Task Implementation
- [ ] Define a `SecretsConfig` struct in `devs-config` that uses `#[serde(flatten)]` with `HashMap<String, toml::Value>` to accept arbitrary key-value pairs without constraining the schema.
- [ ] Add `secrets: Option<SecretsConfig>` to the `ServerConfig` struct with `#[serde(default)]`.
- [ ] Add a doc comment on the field: `/// Reserved for post-MVP secrets manager integration. Parsed but ignored. See [1_PRD-REQ-071].`
- [ ] Ensure no code path reads from `secrets` to influence runtime behavior.

## 3. Code Review
- [ ] Verify the `SecretsConfig` struct is flexible enough to accept any future schema without breaking changes.
- [ ] Confirm the field is clearly marked as reserved and unused.
- [ ] Verify no runtime logic references `config.secrets`.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-config` and confirm all tests pass.

## 5. Update Documentation
- [ ] Add a doc comment on `SecretsConfig` explaining its purpose as a forward-compatible reserved section.

## 6. Automated Verification
- [ ] Run `cargo test -p devs-config` and confirm exit code 0.
- [ ] Verify `// Covers: 1_PRD-REQ-071` annotation exists in test code via grep.
