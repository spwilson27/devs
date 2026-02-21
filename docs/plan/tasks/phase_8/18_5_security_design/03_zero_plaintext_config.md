# Task: Implement zero-plaintext configuration loader and migration tool (Sub-Epic: 18_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-SD-035]

## 1. Initial Test Written
- [ ] Create tests at tests/test_security/test_secure_config.py that must be written and fail before implementation:
  - Test names & targets:
    - TestSecureConfig::test_load_resolves_secret_placeholders (unit): a config value set to "SECRET://service/key" is resolved by calling Keychain.get_secret and returned by load_secure_config.
    - TestSecureConfig::test_save_redacts_secrets_on_disk (unit): saving a config with secret values writes redacted placeholders to disk (e.g., "‹REDACTED›") and does not write plaintext secrets.
    - TestSecureConfig::test_migrate_plaintext_to_keychain_cli (integration): run migration CLI on a temp config file containing plaintext secrets, verify secrets are moved to keychain and the on-disk file contains redacted placeholders.
  - Test execution command examples (run first): python -m pytest tests/test_security/test_secure_config.py -q

## 2. Task Implementation
- [ ] Implement secure configuration handling in src/config/secure_config.py with API and behavior:
  - Public API:
    - def load_secure_config(path: str) -> dict  # resolves placeholders SECRET://... via Keychain
    - def save_secure_config(config: dict, path: str) -> None  # writes redacted file; refuses to write plaintext secrets
    - CLI: scripts/migrate_config_secrets.py --input config.yml --confirm (migrates plaintext secrets into platform keychain and updates file to redacted placeholders atomically)
  - Implementation details:
    - Detect secret placeholders using a strict pattern (e.g., ^SECRET://(?P<service>[^/]+)/(?P<key>.+)$) and keys with sensitive names (password, secret, token, api_key) must be treated as secret candidates.
    - Precedence: if an explicit environment variable exists (ENV_VAR), prefer that over keychain for runtime but do NOT persist env var into config.
    - When saving, replace secret values with a deterministic placeholder and record mapping metadata only in the keychain or in an encrypted keystore (fallback) — never persist plaintext secret to disk.
    - Atomic writes: write to a temp file in same directory, fsync, then os.replace to final path; set file mode 0o600.
    - Provide a migration CLI that:
      - Scans config for plaintext secret-looking values and prompts (or accepts --confirm) to store them in keychain and replace with placeholders.
      - Creates a dry-run mode and writes audit output to stdout (redacted) for CI.

## 3. Code Review
- [ ] In PR review ensure:
  - The loader correctly identifies placeholders and does not inadvertently treat normal strings as secrets.
  - Atomic write semantics are implemented and file permissions set to 0o600.
  - Migration CLI is idempotent and safe to re-run; it must require explicit confirmation in non-CI runs.
  - All writes containing placeholders are verified to be redacted; add unit tests for edge cases.

## 4. Run Automated Tests to Verify
- [ ] Run the tests and ensure they pass after implementation:
  - python -m pytest tests/test_security/test_secure_config.py -q
  - Run the migration CLI in a temp directory as part of integration test: python scripts/migrate_config_secrets.py --input tests/fixtures/plain_config.yml --confirm

## 5. Update Documentation
- [ ] Add docs/security/configuration.md describing:
  - Secure placeholder format, migration steps, how to run the CLI, and CI migration/dry-run instructions.
  - Developer guidance on how to add new configuration keys without accidentally persisting secrets.

## 6. Automated Verification
- [ ] Add scripts/check_no_plaintext_in_configs.sh to CI that:
  - Parses config directories and fails if any value matches a secret-looking regex outside of approved placeholder format (SECRET://... or ‹REDACTED›).
  - Example CI step: scripts/check_no_plaintext_in_configs.sh tests/fixtures || exit 1