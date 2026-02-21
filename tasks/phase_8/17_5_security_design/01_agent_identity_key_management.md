# Task: Implement Agent Identity Key Management (Sub-Epic: 17_5_SECURITY_DESIGN)

## Covered Requirements
- [5_SECURITY_DESIGN-REQ-SEC-STR-001], [5_SECURITY_DESIGN-REQ-SEC-SD-020]

## 1. Initial Test Written
- [ ] Create unit tests at tests/test_agent_identity.py using pytest (if project has no test framework, install pytest and run via virtualenv). The tests MUST be written before implementation and include:
  - test_create_agent_keypair_should_store_public_key_and_keep_private_key_secure(): call AgentIdentity.create_agent('agent:alice') and assert:
    - AgentIdentity.get_public_key('agent:alice') returns a valid PEM/encoded public key (use cryptography library helper to validate).
    - Private key material is NOT present in any return values or logs (capture logger output and assert no 'BEGIN PRIVATE KEY' or raw key substrings).
    - AgentIdentity.list_agents() includes 'agent:alice'.
  - test_private_key_not_written_to_filesystem(): ensure no file on disk under repo contains private key PEM after key creation (scan tmp repo dir).
  - test_key_generation_idempotent_and_recoverable(): calling create_agent twice for the same id returns same public key and sign/verify roundtrip works.

## 2. Task Implementation
- [ ] Implement a new module src/security/agent_identity.py (or src/security/agentIdentity.ts for TS) with the following behavior and API:
  - Public API: create_agent(agent_id: str) -> None, get_public_key(agent_id) -> str, sign(agent_id, message: bytes) -> signature, verify(agent_id, message, signature) -> bool, list_agents() -> List[str].
  - Key backend: implement a KeyStore interface that uses the OS secure storage (macOS Keychain, Windows Credential Manager, Linux Secret Service) via an abstraction (Python: keyring library; Node: keytar). The implementation MUST NOT write private keys to disk or to the repository.
  - Key type: prefer Ed25519; fallback to RSA-2048 with PSS+SHA256 if Ed25519 unavailable. Use established crypto libs (cryptography, nacl, libsodium, or node libs).
  - Public keys are stored in the project's secure sqlite database table `agent_identities` with columns: agent_id TEXT PRIMARY KEY, pubkey TEXT, created_at TIMESTAMP. Do not store private keys in DB.
  - Ensure all operations use secure defaults and perform input validation on agent_id format (e.g., ^[a-z0-9:_-]{3,64}$).
  - Add dependency references in requirements-dev or package.json devDependencies as needed and document installation steps in the README changes.

## 3. Code Review
- [ ] Verify:
  - Private key material is never serialized, logged, or written into repo files (search for 'BEGIN PRIVATE KEY' in commit diff).
  - KeyStore is abstracted behind an interface and can be mocked in tests.
  - Cryptographic choices are modern (Ed25519 preferred) and use library-recommended APIs.
  - All DB writes use parameterized queries and are executed in transactions.

## 4. Run Automated Tests to Verify
- [ ] Run the project's test runner; example commands (pick the project runner if present, otherwise use pytest):
  - Python: python -m venv .venv && . .venv/bin/activate && pip install -r requirements-dev.txt && pytest tests/test_agent_identity.py -q
  - Node: npm ci && npm test -- tests/test_agent_identity.js
- [ ] Confirm the three initial tests fail first (red), implement code, then confirm they pass (green).

## 5. Update Documentation
- [ ] Add docs/security/agent_identity.md describing key lifecycle, KeyStore backends, public API, and rotation/compromise process. Reference the requirement IDs at the top of the doc.

## 6. Automated Verification
- [ ] Add integration script scripts/verify_no_private_keys.sh that:
  - Greps repository and sqlite DB for PEM private key headers and returns non-zero if found.
  - Runs after tests and CI; failure indicates private key leakage.
- [ ] In CI, run the script and fail the job if any private-key patterns are discovered.
