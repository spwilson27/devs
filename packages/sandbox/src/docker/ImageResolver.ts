import { readFile } from 'fs/promises';
import type Dockerode from 'dockerode';
import { RegistryUnavailableError } from '../errors';

export interface ImageResolverConfig {
  primaryRegistry: string; // e.g., "ghcr.io/devs-project/sandbox-base"
  secondaryRegistry: string; // fallback mirror
  localCacheTag: string; // e.g., "devs-sandbox-base:latest"
  imageManifestPath: string; // path or URL to image-manifest.json
  timeoutMs?: number; // optional timeout for registry checks (ms)
}

export async function checkRegistryReachable(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal as any });
    clearTimeout(id);
    return (res?.status ?? 500) < 500;
  } catch (e) {
    return false;
  }
}

export async function isImageAvailableLocally(tag: string, docker?: any): Promise<boolean> {
  if (!docker) return false;
  try {
    const img = docker.getImage(tag);
    if (!img || typeof img.inspect !== 'function') return false;
    await img.inspect();
    return true;
  } catch (err: any) {
    if (err?.statusCode === 404 || err?.status === 404) return false;
    throw err;
  }
}

export class ImageResolver {
  private cfg: ImageResolverConfig;
  private docker?: Dockerode | any;

  constructor(cfg: ImageResolverConfig, docker?: Dockerode) {
    this.cfg = cfg;
    this.docker = docker;
  }

  async resolve(): Promise<string> {
    const raw = await readFile(this.cfg.imageManifestPath, 'utf8');
    const manifest = JSON.parse(String(raw));
    // Normalize digest (manifest.digest may include leading '@')
    const rawDigest: string = String(manifest.digest ?? manifest?.sha ?? '');
    const digest = rawDigest.startsWith('@') ? rawDigest.slice(1) : rawDigest;

    // Try primary
    if (await checkRegistryReachable(this.cfg.primaryRegistry, this.cfg.timeoutMs ?? 5000)) {
      return `${this.cfg.primaryRegistry}@${digest}`;
    }
    // Try secondary
    if (await checkRegistryReachable(this.cfg.secondaryRegistry, this.cfg.timeoutMs ?? 5000)) {
      return `${this.cfg.secondaryRegistry}@${digest}`;
    }
    // Local cache
    if (await isImageAvailableLocally(this.cfg.localCacheTag, this.docker)) {
      return this.cfg.localCacheTag;
    }
    throw new RegistryUnavailableError('No registries reachable and image not found locally');
  }
}
