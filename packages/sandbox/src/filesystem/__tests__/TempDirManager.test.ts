import { afterEach, describe, expect, it } from 'vitest';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { TempDirManager } from '../TempDirManager';

let created: string[] = [];

afterEach(async () => {
  for (const d of created) {
    try {
      await TempDirManager.purge(d);
    } catch (_) {}
  }
  created = [];
});

describe('TempDirManager', () => {
  it('create returns a path inside the system temp root', async () => {
    const dir = await TempDirManager.create('agent-xyz');
    created.push(dir);
    expect(path.resolve(dir).startsWith(path.resolve(os.tmpdir()))).toBe(true);
  });

  it('create directory has 0700 permissions', async () => {
    const dir = await TempDirManager.create('agent-xyz');
    created.push(dir);
    const stat = await fs.stat(dir);
    expect((stat.mode & 0o777)).toBe(0o700);
  });

  it('create uses the provided prefix in the directory name', async () => {
    const dir = await TempDirManager.create('agent-xyz');
    created.push(dir);
    expect(path.basename(dir)).toMatch(/^devs-agent-xyz-/);
  });

  it('purge removes the directory and all contents', async () => {
    const dir = await TempDirManager.create('agent-xyz');
    created.push(dir);
    await fs.writeFile(path.join(dir, 'file.txt'), 'x');
    await TempDirManager.purge(dir);
    await expect(fs.access(dir)).rejects.toThrow();
  });

  it('purge is idempotent', async () => {
    const dir = await TempDirManager.create('agent-xyz');
    await TempDirManager.purge(dir);
    await expect(TempDirManager.purge(dir)).resolves.toBeUndefined();
  });

  it('purgeAll purges all directories created in the current session', async () => {
    const d1 = await TempDirManager.create('a1');
    const d2 = await TempDirManager.create('a2');
    const d3 = await TempDirManager.create('a3');
    await TempDirManager.purgeAll();
    await expect(fs.access(d1)).rejects.toThrow();
    await expect(fs.access(d2)).rejects.toThrow();
    await expect(fs.access(d3)).rejects.toThrow();
  });

  it('create does not allow path traversal', async () => {
    await expect(TempDirManager.create('../../etc/passwd')).rejects.toThrow(/invalid prefix/);
  });
});
