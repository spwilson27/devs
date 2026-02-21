# Task: Hardened Docker Base Image Creation & Version Locking (Sub-Epic: 03_Docker Driver Implementation)

## Covered Requirements
- [9_ROADMAP-TAS-201], [8_RISKS-REQ-044]

## 1. Initial Test Written

- [ ] In `packages/sandbox/src/docker/`, create a test file `__tests__/base-image.spec.ts`.
- [ ] Write a test `validates Dockerfile exists at docker/base/Dockerfile` that asserts the file is present and readable.
- [ ] Write a test `Dockerfile uses Alpine as base image` that reads the Dockerfile content and asserts it begins with `FROM alpine:`.
- [ ] Write a test `Dockerfile pins a specific Alpine version by SHA digest` that asserts the FROM line contains `@sha256:` or an exact version tag (e.g., `alpine:3.19.1`), not `alpine:latest`.
- [ ] Write a test `Dockerfile creates a non-root user named agent` that asserts the file contains `RUN adduser -D agent` and `USER agent`.
- [ ] Write a test `image-manifest.json exists and is valid JSON` that reads `docker/base/image-manifest.json` and asserts it has `baseImage`, `digest`, `builtAt` fields.
- [ ] Write a test `image-manifest.json baseImage matches the Dockerfile FROM value` that reads both files and asserts the values are identical.
- [ ] Write an integration test `docker build of the base image succeeds` that runs `docker build -t devs-sandbox-base:test ./docker/base` in a child process and asserts exit code 0 (mark with `@integration` tag so it can be skipped in unit-only runs).
- [ ] Write an integration test `built image does not run as root` that runs `docker run --rm devs-sandbox-base:test whoami` and asserts the output is `agent`.
- [ ] Write an integration test `built image has minimal surface: no bash, no curl by default` that asserts `docker run --rm devs-sandbox-base:test bash` exits non-zero.

## 2. Task Implementation

- [ ] Create directory `packages/sandbox/docker/base/`.
- [ ] Author `packages/sandbox/docker/base/Dockerfile` with the following requirements:
  - `FROM alpine:3.19.1@sha256:<pinned-digest>` — look up the official Alpine 3.19.1 SHA256 digest from the Docker Hub manifest and hard-code it.
  - `RUN apk add --no-cache nodejs npm git` — install only the tools required by the sandbox runtime; no additional packages.
  - `RUN adduser -D -u 1001 agent` — create a locked-down, non-root user.
  - `WORKDIR /workspace` — set default working directory.
  - `USER agent` — drop privileges before any CMD/ENTRYPOINT.
  - No `ENTRYPOINT`; the `DockerDriver` will supply the command at runtime.
- [ ] Create `packages/sandbox/docker/base/image-manifest.json` with fields:
  ```json
  {
    "baseImage": "alpine:3.19.1@sha256:<same-digest>",
    "digest": "<sha256-digest>",
    "builtAt": "<ISO-8601-timestamp-of-authoring>",
    "description": "Hardened Alpine-based sandbox base image for devs"
  }
  ```
- [ ] Add a `build:base-image` script to `packages/sandbox/package.json` that runs `docker build -t devs-sandbox-base:latest ./docker/base`.
- [ ] Add a `push:base-image` script that tags and pushes to the primary registry (placeholder: `ghcr.io/devs-project/sandbox-base:latest`).
- [ ] Ensure `.dockerignore` at the repo root excludes `.git`, `.devs`, `node_modules`, and `*.md` to minimise build context.

## 3. Code Review

- [ ] Verify the Dockerfile `FROM` line includes an immutable SHA-256 digest, not a mutable tag alone (requirement: [8_RISKS-REQ-044]).
- [ ] Verify no shell (`bash`, `sh`) other than `/bin/sh` (Alpine default) is installed, reducing attack surface.
- [ ] Verify the `USER agent` directive appears as the final `USER` instruction before any runtime command (requirement: [9_ROADMAP-TAS-201]).
- [ ] Verify `image-manifest.json` values are consistent with the `Dockerfile` and that the file is committed to source control so the locked version is auditable.
- [ ] Verify the build scripts do not use `--no-cache` by default (to allow layer reuse in CI) but the integration test uses `--no-cache` to guarantee freshness.
- [ ] Confirm that the Dockerfile installs packages with `--no-cache` flag on `apk add` to avoid leaving the apk index on disk.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` and confirm all unit tests in `__tests__/base-image.spec.ts` pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` and confirm the three integration tests (`@integration`) pass (requires Docker daemon available).
- [ ] Confirm the test output shows zero failing assertions.

## 5. Update Documentation

- [ ] Create `packages/sandbox/docker/base/base-image.agent.md` with:
  - **Intent**: Explain that this Dockerfile produces the immutable, hardened base image used by `DockerDriver` for all sandbox containers.
  - **Architecture**: Describe the Alpine version pinning strategy (SHA digest) and non-root user convention (`agent:1001`).
  - **Agentic Hooks**: Note that any change to the base image MUST update `image-manifest.json` and re-run `build:base-image`.
  - **Known Constraints**: List installed packages and explain why each is necessary; reject additions without justification.
- [ ] Update `packages/sandbox/README.md` to include a "Base Image" section documenting the pinned image, how to rebuild, and how to verify the digest.

## 6. Automated Verification

- [ ] Run `node -e "const m = require('./docker/base/image-manifest.json'); const fs = require('fs'); const df = fs.readFileSync('./docker/base/Dockerfile','utf8'); if(!df.includes(m.digest)) process.exit(1);"` from `packages/sandbox/` — exits 0 only if the Dockerfile digest matches the manifest.
- [ ] Run `pnpm --filter @devs/sandbox test --reporter=json | jq '.testResults[] | select(.status == "failed")' | wc -l` and assert the output is `0`.
- [ ] CI pipeline step: `docker inspect devs-sandbox-base:latest --format '{{.Config.User}}'` must output `agent` after a successful build.
