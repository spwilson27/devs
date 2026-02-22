import { describe, it, expect } from 'vitest';
import { buildVolumeArgs, DockerDriver } from '../drivers/DockerDriver';
import { DEFAULT_SANDBOX_CONFIG } from '../config';
import { MissingResourceConfigError } from '../errors';

describe('disk quota helpers', () => {
  it('DEFAULT_SANDBOX_CONFIG.storageLimitGb === 2', () => {
    expect(DEFAULT_SANDBOX_CONFIG.storageLimitGb).toBe(2);
  });

  it('buildVolumeArgs returns storage-opt and tmpfs mount when storageLimitGb set', () => {
    const cfg = { hostProjectPath: '/tmp', cpuCores: 1, memoryGb: 1, storageLimitGb: 2, tmpfsSize: '256m' } as any;
    const args = buildVolumeArgs(cfg);
    expect(args).toContain('--storage-opt');
    expect(args).toContain('size=2g');
    const mountIdx = args.indexOf('--mount');
    expect(mountIdx).toBeGreaterThan(-1);
    expect(args[mountIdx + 1]).toBe('type=tmpfs,destination=/tmp,tmpfs-size=256m');
  });

  it('buildVolumeArgs throws MissingResourceConfigError when storageLimitGb missing', () => {
    const cfg = { hostProjectPath: '/tmp', cpuCores: 1, memoryGb: 1 } as any;
    expect(() => buildVolumeArgs(cfg)).toThrowError(MissingResourceConfigError);
  });

  it('DockerDriver.buildRunArgs includes buildVolumeArgs output when provided', () => {
    const cfg = { hostProjectPath: '/tmp', cpuCores: 1, memoryGb: 1, storageLimitGb: 2, tmpfsSize: '256m' } as any;
    const args = DockerDriver.buildRunArgs(cfg);
    expect(args).toContain('--storage-opt');
    expect(args).toContain('size=2g');
    const mountIdx = args.indexOf('--mount');
    expect(mountIdx).toBeGreaterThan(-1);
    expect(args[mountIdx + 1]).toBe('type=tmpfs,destination=/tmp,tmpfs-size=256m');
  });
});
