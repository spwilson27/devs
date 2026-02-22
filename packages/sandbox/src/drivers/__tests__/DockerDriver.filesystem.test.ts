import { describe, it, expect } from 'vitest';
import { DockerDriver } from '../DockerDriver';

const standardConfig = { hostProjectPath: '/home/user/myproject', workspaceMount: '/workspace', tmpfsSize: '256m' };

describe('DockerDriver.buildRunArgs filesystem', () => {
  it('includes --read-only flag', () => {
    const args = DockerDriver.buildRunArgs(standardConfig as any);
    expect(args).toContain('--read-only');
  });

  it('mounts /tmp as tmpfs with noexec,nosuid,nodev', () => {
    const args = DockerDriver.buildRunArgs(standardConfig as any);
    expect(args).toContain('--tmpfs');
    expect(args.some(a => a.includes('/tmp') && a.includes('noexec') && a.includes('nosuid') && a.includes('nodev'))).toBe(true);
  });

  it('does NOT mount .git or .devs', () => {
    const args = DockerDriver.buildRunArgs(standardConfig as any);
    expect(args.some(a => a.includes('.git'))).toBe(false);
    expect(args.some(a => a.includes('.devs'))).toBe(false);
  });

  it('mounts /workspace as the project volume', () => {
    const args = DockerDriver.buildRunArgs(standardConfig as any);
    const vIndex = args.indexOf('-v');
    expect(vIndex).toBeGreaterThan(-1);
    expect(args[vIndex + 1]).toBe('/home/user/myproject:/workspace:ro');
  });
});
