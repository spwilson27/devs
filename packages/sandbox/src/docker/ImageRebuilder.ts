import { readFile } from 'fs/promises';
import path from 'path';
import { DigestMismatchError } from '../errors';

export class ImageRebuilder {
  private docker: any;
  private imageManifestPath: string;

  constructor(docker: any, imageManifestPath: string) {
    this.docker = docker;
    this.imageManifestPath = imageManifestPath;
  }

  async rebuild(): Promise<void> {
    const raw = await readFile(this.imageManifestPath, 'utf8');
    const manifest = JSON.parse(String(raw));
    const baseImage: string = manifest.baseImage;
    const rawDigest: string = String(manifest.digest ?? '');
    const digest = rawDigest.startsWith('@') ? rawDigest.slice(1) : rawDigest;

    const buildOpts = { context: path.resolve('./docker/base'), src: ['Dockerfile'] };
    const buildArgs = { t: baseImage, nocache: true };

    const stream = await this.docker.buildImage(buildOpts, buildArgs);
    // Drain stream to completion for logging
    if (stream && typeof stream.on === 'function') {
      await new Promise<void>((resolve, reject) => {
        stream.on('data', () => {});
        stream.on('end', resolve);
        stream.on('close', resolve);
        stream.on('error', reject);
      });
    }

    const image = this.docker.getImage(baseImage);
    const info = await image.inspect();
    const repoDigests: string[] = info?.RepoDigests ?? [];
    const ok = repoDigests.some((rd: string) => rd.endsWith(`@${digest}`));
    if (!ok) {
      throw new DigestMismatchError(`Expected ${rawDigest}`, repoDigests.join(','));
    }
  }
}
