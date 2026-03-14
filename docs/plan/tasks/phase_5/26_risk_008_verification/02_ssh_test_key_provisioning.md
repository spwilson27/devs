# Task: Implement SSH E2E Key Setup and Permissions (Sub-Epic: 26_Risk 008 Verification)

## Covered Requirements
- [RISK-008-BR-002]

## Dependencies
- depends_on: []
- shared_components: [./do Entrypoint Script]

## 1. Initial Test Written
- [ ] Create a new unit test for the `do` script in `tests/test_do_setup_ssh.py` (or similar) that:
    - Mocks the filesystem.
    - Simulates `./do setup` running.
    - Verifies that `~/.ssh/devs_test_key` and `~/.ssh/devs_test_key.pub` are created if they don't exist.
    - Verifies that the script checks and sets the mode of `~/.ssh/devs_test_key` to `0600`.
    - Verifies that the script exits non-zero if `chmod 0600` fails or cannot be verified.

## 2. Task Implementation
- [ ] Modify the `cmd_setup()` function in `./do`:
    - Add a block to generate an SSH key pair (`ed25519`) in `$HOME/.ssh/devs_test_key` without a passphrase if it doesn't already exist.
    - Use `ssh-keygen -t ed25519 -f "$HOME/.ssh/devs_test_key" -N "" -C "devs-e2e-test"`.
    - Append the public key to `$HOME/.ssh/authorized_keys` with the `command="/bin/sh"` prefix if not already present.
    - Use `os.chmod(key_path, 0o600)` to set permissions on the private key file.
    - Immediately after `os.chmod`, call `os.stat(key_path).st_mode` to verify it matches `0o100600`.
    - Exit with an error message and non-zero code if the mode verification fails.
- [ ] Add `// Covers: RISK-008-BR-002` to the relevant code blocks or the setup test.

## 3. Code Review
- [ ] Verify that SSH key creation is idempotent (won't overwrite existing keys).
- [ ] Verify that the script handles missing `.ssh` directories gracefully (creating them with correct permissions if necessary).
- [ ] Ensure that `0600` mode is strictly enforced as required by `RISK-008-BR-002`.

## 4. Run Automated Tests to Verify
- [ ] Run `./do test tests/test_do_setup_ssh.py`.
- [ ] Manually run `./do setup` and verify the file modes using `ls -l ~/.ssh/devs_test_key`.

## 5. Update Documentation
- [ ] Update `README.md` or `DEVELOPER.md` to mention the automated SSH test key setup.

## 6. Automated Verification
- [ ] Run `./do test` and check that the new setup tests pass.
