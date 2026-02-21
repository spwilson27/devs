# Task: Image Reconstruction & Fallback Registry Support (Sub-Epic: 03_Docker Driver Implementation)

## Covered Requirements
- [8_RISKS-REQ-079], [8_RISKS-REQ-080]

## 1. Initial Test Written

- [ ] Create `packages/sandbox/src/docker/__tests__/ImageResolver.spec.ts`.
- [ ] Write a test `ImageResolver.resolve() returns primary registry URI when reachable` — mock `checkRegistryReachable(primaryUrl)` to resolve `true`; assert the returned image URI is the primary registry image string.
- [ ] Write a test `ImageResolver.resolve() falls back to secondary registry when primary is unreachable` — mock `checkRegistryReachable(primaryUrl)` to resolve `false` and `checkRegistryReachable(secondaryUrl)` to resolve `true`; assert the returned image URI is the secondary registry image string.
- [ ] Write a test `ImageResolver.resolve() falls back to local cache when both registries are unreachable` — mock both registry checks to resolve `false`; mock `isImageAvailableLocally(imageTag)` to resolve `true`; assert the returned image URI equals the local cache tag.
- [ ] Write a test `ImageResolver.resolve() throws RegistryUnavailableError when all sources are unreachable and no local cache` — mock all checks to `false`/`false`/`false`; assert `RegistryUnavailableError` is thrown.
- [ ] Write a test `ImageRebuilder.rebuild() calls docker.buildImage with correct Dockerfile path and no-cache=true` — mock `docker.buildImage`; assert it is called with `{ context: './docker/base', src: ['Dockerfile'] }` and the image is tagged with the TAS-locked image name and SHA digest from `image-manifest.json`.
- [ ] Write a test `ImageRebuilder.rebuild() verifies the rebuilt image digest matches image-manifest.json` — mock `docker.getImage(tag).inspect()` to return a digest; assert it matches `manifest.digest`; if mismatched, assert `DigestMismatchError` is thrown.
- [ ] Write an integration test `ImageResolver falls back to local Docker cache` (tagged `@integration`) — pull `devs-sandbox-base:latest` locally, configure a fake primary and secondary URL that return 404, call `resolve()`, and assert a locally cached image tag is returned without error.

## 2. Task Implementation

- [ ] Create `packages/sandbox/src/docker/ImageResolver.ts`:
  - Define `ImageResolverConfig` interface with:
    - `primaryRegistry: string` — e.g., `"ghcr.io/devs-project/sandbox-base"`.
    - `secondaryRegistry: string` — fallback mirror, e.g., `"registry.hub.docker.com/devs-project/sandbox-base"`.
    - `localCacheTag: string` — the local image tag, e.g., `"devs-sandbox-base:latest"`.
    - `imageManifestPath: string` — path to `image-manifest.json`.
  - Implement `resolve(): Promise<string>` that:
    1. Reads `image-manifest.json` to get `baseImage` and `digest`.
    2. Calls `checkRegistryReachable(primaryRegistry)` — performs an HTTP HEAD to the registry API with a 5-second timeout.
    3. If reachable, returns `${primaryRegistry}@${digest}`.
    4. Else calls `checkRegistryReachable(secondaryRegistry)`; if reachable, returns `${secondaryRegistry}@${digest}`.
    5. Else calls `isImageAvailableLocally(localCacheTag)` via `docker.getImage(localCacheTag).inspect()`; if present, returns `localCacheTag`.
    6. Else throws `RegistryUnavailableError`.
  - Implement `checkRegistryReachable(url: string): Promise<boolean>` — makes an HTTP HEAD request using Node's native `fetch` (Node 18+); returns `true` if status < 500, `false` otherwise or on network error/timeout.
  - Implement `isImageAvailableLocally(tag: string): Promise<boolean>` — calls `docker.getImage(tag).inspect()` and returns `true`; catches `StatusCodeError` 404 and returns `false`.
- [ ] Create `packages/sandbox/src/docker/ImageRebuilder.ts`:
  - Define `ImageRebuilder` class that accepts a `Dockerode` instance and `imageManifestPath`.
  - Implement `rebuild(): Promise<void>` that:
    1. Reads `image-manifest.json` to get `baseImage` and `digest`.
    2. Calls `docker.buildImage` with `{ context: path.resolve('./docker/base'), src: ['Dockerfile'] }` and image tag `${manifest.baseImage}`.
    3. Streams the build output to the logger.
    4. After build, calls `docker.getImage(manifest.baseImage).inspect()` and extracts `RepoDigests`.
    5. Asserts that one of the `RepoDigests` ends with `@${manifest.digest}`; if not, throws `DigestMismatchError`.
  - Export `ImageRebuilder`.
- [ ] Define and export `RegistryUnavailableError` and `DigestMismatchError` in `packages/sandbox/src/errors.ts`.
- [ ] Integrate `ImageResolver` into `DockerDriver.provision()`: replace the hardcoded image string with `await this.imageResolver.resolve()`.
- [ ] Export `ImageResolver` and `ImageRebuilder` from `packages/sandbox/src/index.ts`.

## 3. Code Review

- [ ] Verify `checkRegistryReachable` uses a hard timeout of ≤5 seconds using `AbortController` with `fetch` so a slow registry does not block sandbox provisioning indefinitely (requirement: [8_RISKS-REQ-080] — failover must be fast).
- [ ] Verify the fallback priority order is strictly: primary → secondary → local cache → error, and is not configurable at runtime to prevent bypassing (requirement: [8_RISKS-REQ-080]).
- [ ] Verify `ImageRebuilder.rebuild()` always uses the digest from `image-manifest.json` and NOT a mutable tag (requirement: [8_RISKS-REQ-079]).
- [ ] Verify `DigestMismatchError` is thrown with the expected and actual digest in the message for diagnosability.
- [ ] Confirm `ImageResolver` and `ImageRebuilder` are stateless (no class-level mutable state) so they are safe to call concurrently from multiple sandbox provisions.

## 4. Run Automated Tests to Verify

- [ ] Run `pnpm --filter @devs/sandbox test` — all tests in `ImageResolver.spec.ts` must pass.
- [ ] Run `pnpm --filter @devs/sandbox test:integration` — the local cache fallback integration test must pass.
- [ ] Run `pnpm --filter @devs/sandbox build` — TypeScript compiles cleanly.

## 5. Update Documentation

- [ ] Create `packages/sandbox/src/docker/ImageResolver.agent.md`:
  - **Intent**: Describe the three-tier fallback strategy (primary registry → secondary mirror → local cache).
  - **Architecture**: Document the `resolve()` decision tree, timeout configuration, and how `image-manifest.json` is the single source of truth for the image tag and digest.
  - **Agentic Hooks**: Agents should call `ImageRebuilder.rebuild()` if `RegistryUnavailableError` is thrown and no local cache is found, then retry `resolve()`.
  - **Known Constraints**: `checkRegistryReachable` only tests connectivity, not authentication; registry auth failures may still cause `docker pull` to fail.
- [ ] Create `packages/sandbox/src/docker/ImageRebuilder.agent.md`:
  - **Intent**: Explain that `ImageRebuilder` reconstructs the sandbox image from the pinned Dockerfile when no pre-built image is available.
  - **Architecture**: Document the digest verification step and why it exists (supply chain integrity — [8_RISKS-REQ-079]).
- [ ] Update `packages/sandbox/README.md` to document the fallback registry mechanism and how to configure `primaryRegistry`/`secondaryRegistry`.

## 6. Automated Verification

- [ ] Run `pnpm --filter @devs/sandbox test --reporter=json | jq '[.testResults[].assertionResults[] | select(.status=="failed")] | length'` and assert output is `0`.
- [ ] Verify `image-manifest.json` digest format via: `node -e "const m=require('./docker/base/image-manifest.json'); if(!/^sha256:[a-f0-9]{64}$/.test(m.digest)) process.exit(1);"` from `packages/sandbox/` — must exit 0.
- [ ] Integration guard: after running integration tests, assert no dangling `devs-sandbox-base:test` images remain: `docker images devs-sandbox-base:test --format '{{.ID}}' | wc -l` should be `0` (the test suite cleans up via `afterAll`).
