# Session Key Rotation (agent doc)

- Algorithm: 128-bit (16-byte) session keys generated using Node.js built-in crypto.randomBytes(16).
- Storage: SessionKeyManager holds keys in an in-memory Map<string, Buffer> (no disk persistence).
- Lifecycle: generateKey() -> registerKey(sandboxId, key) -> use (injected via SecretInjector as DEVS_SESSION_KEY hex) -> revokeKey(sandboxId) which zeroes the key buffer then deletes the entry.
- Injection contract: the key is provided to sandbox agents under the secret name DEVS_SESSION_KEY and must be treated as an ephemeral secret. Secret injection must use SecretInjector (stdin or ephemeral file) and never expose secrets on the command line.
- Revocation: revokeKey overwrites the Buffer contents with 0x00 prior to deletion and emits a structured log `{ event: 'session_key_rotated', sandboxId }` (the key value is never logged).

Security notes:
- The only source of entropy is crypto.randomBytes(16); no Math.random or UUID libraries are used for key material.
- Consumers should minimize the time the key remains live inside the sandbox and must explicitly call revokeKey after sandbox teardown.
