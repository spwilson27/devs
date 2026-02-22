import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@webcontainer/api', () => {
  const WebContainer = { boot: vi.fn() };
  return { WebContainer };
});

import { WebContainer } from '@webcontainer/api';
import { WebContainerDriver } from '../webcontainer-driver';
import { UnsupportedRuntimeError } from '../errors';

// Skipped in unit CI
describe.skip('WebContainerDriver (integration) - syscall compatibility', () => {
  beforeEach(() => {
    WebContainer.boot.mockReset();
  });

  it('exec rejects with UnsupportedRuntimeError for python3', async () => {
    const wc = { spawn: vi.fn(), teardown: vi.fn() };
    WebContainer.boot.mockResolvedValueOnce(wc);

    const driver = new WebContainerDriver({});
    const ctx = await driver.provision();

    try {
      await driver.exec(ctx, 'python3', ['--version']);
      throw new Error('expected UnsupportedRuntimeError');
    } catch (err: any) {
      expect(err).toBeInstanceOf(UnsupportedRuntimeError);
      expect(err.runtime).toBe('python3');
      expect(typeof err.reason === 'string' && err.reason.length > 0).toBe(true);
    }
  });
});
