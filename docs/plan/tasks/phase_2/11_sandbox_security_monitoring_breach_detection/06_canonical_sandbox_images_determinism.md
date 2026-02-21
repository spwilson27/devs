# Task: Implement Canonical Sandbox Images & Execution Environment Determinism (Sub-Epic: 11_Sandbox Security Monitoring & Breach Detection)

## Covered Requirements
- [8_RISKS-REQ-130]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/images/__tests__/CanonicalImageManager.test.ts`.
- [ ] Write a unit test that creates a `CanonicalImageManager` with a mock `ImageRegistry` and verifies `resolveImage(imageTag)` returns the fully-qualified digest-pinned image reference (e.g., `alpine@sha256:abc123`) for a known tag.
- [ ] Write a unit test that verifies `resolveImage()` throws `ImageDigestMismatchError` when the pulled image digest does not match the pinned digest in `canonical-images.json`.
- [ ] Write a unit test that verifies `resolveImage()` throws `ImageNotFoundException` when the requested `imageTag` is not listed in `canonical-images.json`.
- [ ] Write a unit test that verifies `CanonicalImageManager.verifyRunningContainer(containerId)` calls `DockerClient.inspectContainer(containerId)` and returns `{ valid: true }` when the container's image digest matches the canonical digest.
- [ ] Write a unit test that verifies `verifyRunningContainer()` returns `{ valid: false, reason: 'DIGEST_MISMATCH' }` when the running container's image digest differs from the canonical.
- [ ] Write a unit test that verifies `FallbackRegistryResolver` tries the primary registry first, and on failure (mock throws `RegistryUnavailableError`), falls back to the secondary registry URL and returns the same pinned digest.
- [ ] Create an integration test that calls `docker pull alpine:3.19` and `docker inspect` to retrieve the digest, then asserts the digest matches a known fixture value (validates that the canonical image pinning workflow works end-to-end with a real Docker daemon).

## 2. Task Implementation

- [ ] Create `canonical-images.json` in `packages/sandbox/config/`:
  ```json
  {
    "version": "1",
    "images": [
      {
        "tag": "devs-sandbox-base",
        "primaryDigest": "sha256:<pinned-digest>",
        "baseImage": "alpine:3.19",
        "primaryRegistry": "ghcr.io/devs/sandbox-base",
        "fallbackRegistry": "registry.hub.docker.com/devs/sandbox-base"
      }
    ]
  }
  ```
- [ ] Create `packages/sandbox/src/images/CanonicalImageManager.ts`:
  - `resolveImage(tag: string): Promise<string>` — loads `canonical-images.json`, finds the entry for `tag`, pulls the image using `DockerClient.pullImage(registry + '@' + digest)`, verifies the pulled digest matches, and returns the fully-qualified reference.
  - `verifyRunningContainer(containerId: string): Promise<{ valid: boolean; reason?: string }>` — calls `DockerClient.inspectContainer(containerId)`, extracts `Image` field (digest), and compares against the canonical digest.
- [ ] Create `packages/sandbox/src/images/FallbackRegistryResolver.ts`:
  - `resolve(imageEntry: CanonicalImageEntry): Promise<string>` — attempts `DockerClient.pullImage` from `primaryRegistry`. On `RegistryUnavailableError`, retries from `fallbackRegistry`. Throws `AllRegistriesUnavailableError` if both fail.
- [ ] Create `packages/sandbox/src/images/DockerClient.ts` (thin wrapper around Docker Engine API or `dockerode`):
  - `pullImage(imageRef: string): Promise<void>`
  - `inspectContainer(containerId: string): Promise<DockerContainerInfo>`
  - `getImageDigest(imageRef: string): Promise<string>`
- [ ] Update `DockerDriver.ts` to call `CanonicalImageManager.resolveImage('devs-sandbox-base')` before `docker run`, passing the resolved digest-pinned reference instead of a mutable tag.
- [ ] Add `CanonicalImageManager.verifyRunningContainer(containerId)` to `SandboxMonitor._checkForBreach()` as an additional breach detector: if the running container's image digest no longer matches canonical (e.g., image was swapped), treat it as a `SECURITY_PAUSE` breach.
- [ ] Create `packages/sandbox/src/images/types.ts` with `CanonicalImageEntry`, `ImageDigestMismatchError`, `ImageNotFoundException`, `RegistryUnavailableError`, `AllRegistriesUnavailableError`.
- [ ] Export all from `packages/sandbox/src/images/index.ts`.

## 3. Code Review

- [ ] Verify `CanonicalImageManager.resolveImage` always uses the digest-pinned reference (`@sha256:...`) and never pulls by mutable tag alone — this is the core of determinism.
- [ ] Verify `canonical-images.json` is committed to the repository (not `.gitignore`d) so image pins are version-controlled.
- [ ] Verify `FallbackRegistryResolver` logs a `WARN` level message when falling back to the secondary registry, to make fallback events observable.
- [ ] Verify `DockerClient` methods throw typed errors (not generic `Error`) for all failure modes.
- [ ] Verify `verifyRunningContainer` is called at least once per `SandboxMonitor` polling interval (not just at start) to detect runtime image substitution attacks.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test -- --testPathPattern="CanonicalImageManager|FallbackRegistryResolver|DockerClient"` and confirm all unit tests pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration -- --testPathPattern="canonical_image.integration"` (requires Docker daemon) and confirm the integration test passes.
- [ ] Assert test coverage for `images/CanonicalImageManager.ts` and `images/FallbackRegistryResolver.ts` is ≥ 90%.

## 5. Update Documentation

- [ ] Add a `## Canonical Image Management` section to `packages/sandbox/README.md` documenting: `canonical-images.json` format, how to update pinned digests, fallback registry behavior, and the `verifyRunningContainer` breach detector.
- [ ] Document the process for rotating image pins (update `canonical-images.json`, commit, re-deploy) in `packages/sandbox/README.md`.
- [ ] Append to `.agent/memory/phase_2_decisions.md`: "8_RISKS-REQ-130: All sandbox containers use digest-pinned images from canonical-images.json. FallbackRegistryResolver supports a secondary registry. CanonicalImageManager.verifyRunningContainer() is integrated into SandboxMonitor breach detection."

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test -- --coverage --coverageReporters=json-summary` and assert `images/CanonicalImageManager.ts` has `statements.pct >= 90`.
- [ ] Verify `canonical-images.json` is present and valid JSON by running `node -e "require('./packages/sandbox/config/canonical-images.json')"` and asserting exit code `0`.
- [ ] Run `pnpm --filter @devs/sandbox lint` and assert zero lint errors on all new `images/` files.
