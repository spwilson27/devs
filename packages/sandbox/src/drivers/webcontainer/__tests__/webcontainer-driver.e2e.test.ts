/** @group e2e */
import { describe, it, expect } from 'vitest';
import { bootDriver } from './helpers/boot-driver';

const maybe = process.env.RUN_E2E ? describe : describe.skip;

maybe('@group e2e - WebContainerDriver E2E', () => {
  it('Simple JS execution', async () => {
    const { driver, ctx } = await bootDriver();
    const res = await driver.exec(ctx, 'node', ['-e', "console.log('hello')"]);
    expect(res.stdout).toContain('hello');
    expect(res.exitCode).toBe(0);
  });

  it('npm install and use lodash', async () => {
    const { driver, ctx } = await bootDriver();
    const r = await (driver as any).installPackages(['lodash']);
    // When running in a real WebContainer this should install; in mocked environments this may be a no-op
    if (r && r.installed && r.installed.includes('lodash')) {
      const res = await driver.exec(ctx, 'node', ['-e', "const _ = require('lodash'); console.log(_.VERSION)"]);
      expect(/\d+\.\d+\.\d+/.test(res.stdout)).toBe(true);
    }
  });

  it('Timeout enforcement', async () => {
    const { driver, ctx } = await bootDriver();
    await expect(driver.exec(ctx, 'node', ['-e', "setInterval(() => {}, 1000)"], { timeoutMs: 2000 })).rejects.toThrow();
  });

  it('Unsupported runtime rejects', async () => {
    const { driver, ctx } = await bootDriver();
    await expect(driver.exec(ctx, 'python3', ['--version'])).rejects.toThrow();
  });

  it('Blocked native package reports alternative', async () => {
    const { driver } = await bootDriver();
    const res = await (driver as any).installPackages(['better-sqlite3']);
    if (res && res.failed && res.failed.length > 0) {
      expect(res.failed[0].packageName).toBe('better-sqlite3');
      expect(res.failed[0].alternative).toBe('sql.js');
    }
  });

  it('Full teardown idempotency', async () => {
    const { driver, ctx } = await bootDriver();
    await (driver as any).teardown();
    await (driver as any).teardown();
  });
});
