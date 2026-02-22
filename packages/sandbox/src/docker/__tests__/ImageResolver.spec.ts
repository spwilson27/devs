import fs from 'fs';
import { describe, it, expect, vi } from 'vitest';
import * as IR from '../ImageResolver';
import { ImageRebuilder } from '../ImageRebuilder';
import { RegistryUnavailableError, DigestMismatchError } from '../../errors';
import { Readable } from 'stream';

const manifestPath = new URL('../../../docker/base/image-manifest.json', import.meta.url);
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const digest = String(manifest.digest).startsWith('@') ? String(manifest.digest).slice(1) : manifest.digest;

describe('ImageResolver', () => {
  afterEach(() => vi.restoreAllMocks());

  it('resolve() returns primary registry URI when reachable', async () => {
    const cfg = {
      primaryRegistry: 'ghcr.io/devs-project/sandbox-base',
      secondaryRegistry: 'registry.hub.docker.com/devs-project/sandbox-base',
      localCacheTag: 'devs-sandbox-base:latest',
      imageManifestPath: manifestPath,
    };
    vi.spyOn(IR, 'checkRegistryReachable').mockResolvedValue(true);
    const r = new IR.ImageResolver(cfg as any, undefined);
    const out = await r.resolve();
    expect(out).toBe(`${cfg.primaryRegistry}@${digest}`);
  });

  it('resolve() falls back to secondary registry when primary is unreachable', async () => {
    const cfg = {
      primaryRegistry: 'primary.example.com/repo',
      secondaryRegistry: 'secondary.example.com/repo',
      localCacheTag: 'devs-sandbox-base:latest',
      imageManifestPath: manifestPath,
    };
    const spy = vi.spyOn(IR, 'checkRegistryReachable');
    spy.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    const r = new IR.ImageResolver(cfg as any, undefined);
    const out = await r.resolve();
    expect(out).toBe(`${cfg.secondaryRegistry}@${digest}`);
  });

  it('resolve() falls back to local cache when both registries are unreachable', async () => {
    const cfg = {
      primaryRegistry: 'p',
      secondaryRegistry: 's',
      localCacheTag: 'devs-sandbox-base:latest',
      imageManifestPath: manifestPath,
    };
    vi.spyOn(IR, 'checkRegistryReachable').mockResolvedValue(false);
    vi.spyOn(IR, 'isImageAvailableLocally').mockResolvedValue(true);
    const r = new IR.ImageResolver(cfg as any, {} as any);
    const out = await r.resolve();
    expect(out).toBe(cfg.localCacheTag);
  });

  it('resolve() throws RegistryUnavailableError when all sources are unreachable and no local cache', async () => {
    const cfg = {
      primaryRegistry: 'p',
      secondaryRegistry: 's',
      localCacheTag: 'devs-sandbox-base:latest',
      imageManifestPath: manifestPath,
    };
    vi.spyOn(IR, 'checkRegistryReachable').mockResolvedValue(false);
    vi.spyOn(IR, 'isImageAvailableLocally').mockResolvedValue(false);
    const r = new IR.ImageResolver(cfg as any, {} as any);
    await expect(r.resolve()).rejects.toThrow(RegistryUnavailableError);
  });
});

describe('ImageRebuilder', () => {
  afterEach(() => vi.restoreAllMocks());

  it('rebuild() calls docker.buildImage with correct Dockerfile path and no-cache=true', async () => {
    const stream = new Readable({ read() {} });
    process.nextTick(() => stream.push(null));
    const mockDocker: any = {
      buildImage: vi.fn().mockResolvedValue(stream),
      getImage: vi.fn().mockReturnValue({ inspect: vi.fn().mockResolvedValue({ RepoDigests: [`ghcr.io/devs-project/sandbox-base@${digest}`] }) }),
    };
    const reb = new ImageRebuilder(mockDocker, manifestPath);
    await reb.rebuild();
    expect(mockDocker.buildImage).toHaveBeenCalled();
    const [buildOpts, buildArgs] = mockDocker.buildImage.mock.calls[0];
    expect(buildOpts).toHaveProperty('context');
    expect(buildOpts.src).toEqual(['Dockerfile']);
    expect(buildArgs.t).toBe(manifest.baseImage);
    expect(buildArgs.nocache).toBe(true);
  });

  it('rebuild() verifies rebuilt image digest matches image-manifest.json and throws on mismatch', async () => {
    const stream = new Readable({ read() {} });
    process.nextTick(() => stream.push(null));
    const mockDocker: any = {
      buildImage: vi.fn().mockResolvedValue(stream),
      getImage: vi.fn().mockReturnValue({ inspect: vi.fn().mockResolvedValue({ RepoDigests: ['ghcr.io/other@sha256:deadbeef'] }) }),
    };
    const reb = new ImageRebuilder(mockDocker, manifestPath);
    await expect(reb.rebuild()).rejects.toThrow(DigestMismatchError);
  });

  const runIntegration = Boolean(process.env.RUN_INTEGRATION);
  (runIntegration ? it : it.skip)('@integration ImageResolver falls back to local Docker cache', async () => {
    // Integration test: requires docker and a locally-pulled devs-sandbox-base:latest
    const cfg = {
      primaryRegistry: 'http://primary.invalid/',
      secondaryRegistry: 'http://secondary.invalid/',
      localCacheTag: 'devs-sandbox-base:latest',
      imageManifestPath: manifestPath,
    };
    const r = new IR.ImageResolver(cfg as any, undefined);
    // Configure environment so both registries appear unreachable
    vi.spyOn(IR, 'checkRegistryReachable').mockResolvedValue(false);
    // Assume image exists locally for integration run
    vi.spyOn(IR, 'isImageAvailableLocally').mockResolvedValue(true);
    const out = await r.resolve();
    expect(out).toBe(cfg.localCacheTag);
  });
});
