# Secret Injector (agent notes)

This agent doc describes the SecretInjector component and the contract it provides for securely delivering secrets into sandboxes.

Injection methods

- Ephemeral file (preferred default):
  - Host writes JSON-serialized secrets to a temp file under os.tmpdir() with a cryptographically-random suffix and permissions 0o400.
  - The temp file path is mounted or otherwise made available to the sandbox at /run/secrets/devs_secrets.
  - The host-side file is deleted after the sandbox reads it or after a TTL (5s) to reduce host surface.
  - The injector sets DEVS_SECRETS_PATH=/run/secrets/devs_secrets inside the sandbox for discovery.

- Stdin (alternative):
  - Secrets are serialized to JSON and piped into a small long-running helper inside the sandbox ("devs-secret-loader") via provider.execWithStdin.
  - This avoids writing secrets to disk but requires the helper binary to be present inside the sandbox image.

When to prefer each

- Use ephemeral file when the sandbox runtime cannot accept streaming stdin for auxiliary helpers, or when secrets need to be consumed by multiple processes inside the sandbox.
- Use stdin when you can guarantee the helper is available and prefer not to write any secret material to host disk even transiently.

DEVS_SECRETS_PATH contract

- The injector sets DEVS_SECRETS_PATH to `/run/secrets/devs_secrets` inside the sandbox.
- Consumers inside the sandbox SHOULD read that path to discover secrets; they MUST NOT attempt to echo or otherwise leak secret values to stdout/stderr or args.

Security guarantees and implementation notes

- Secrets are never placed into command-line arguments. All values are either passed via stdin or referenced via a host-side path.
- Temp file names use os.tmpdir() and a cryptographically random suffix to avoid predictable paths.
- Files are created with 0o400 permissions immediately and are deleted in a finally block (and a TTL-based fallback) to avoid host-side leakage.
- The injector should avoid logging secret values or including them in Error messages.

