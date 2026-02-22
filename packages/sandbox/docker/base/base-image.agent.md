# Base Image Agent Doc

Intent
: Produce an immutable, hardened base image for the sandbox runtime used by DockerDriver.

Architecture
- Base: alpine:3.19.1 pinned by SHA256 digest (see image-manifest.json).
- Non-root user: agent (UID 1001).
- Minimal packages: nodejs, npm, git (installed with apk --no-cache).
- Working directory: /workspace

Agentic Hooks
- Any change to the Dockerfile MUST update docker/base/image-manifest.json with the new digest and builtAt timestamp.
- Rebuild with: pnpm --filter @devs/sandbox run build:base-image

Known Constraints
- No bash or curl installed by default to minimise attack surface.
- Changes to installed packages require justification and security review.
