import { describe, it, expect } from 'vitest';
import { buildDockerRunArgs } from '../drivers/DockerDriver';
import { MissingResourceConfigError } from '../errors';

describe('buildDockerRunArgs', () => {
  it('returns correct flags when cpuCores and memoryGb provided', () => {
    const args = buildDockerRunArgs({ cpuCores: 2, memoryGb: 4 } as any);
    expect(args).toContain('--cpus=2');
    expect(args).toContain('--memory=4g');
    expect(args).toContain('--memory-swap=4g');
    expect(args).toContain('--pids-limit=512');
    expect(args).toContain('--ulimit');
    const ulimitIndex = args.indexOf('--ulimit');
    expect(args[ulimitIndex + 1]).toBe('nofile=1024:1024');
  });

  it('throws MissingResourceConfigError when cpuCores or memoryGb missing', () => {
    expect(() => buildDockerRunArgs({ memoryGb: 4 } as any)).toThrow(MissingResourceConfigError);
    expect(() => buildDockerRunArgs({ cpuCores: 2 } as any)).toThrow(MissingResourceConfigError);
  });
});
