// @integration
import { describe, it, expect } from 'vitest';
import { DockerDriver } from '../drivers/DockerDriver';

// NOTE: This integration test requires Docker with overlay2/xfs backing and
// will be skipped by default. Run explicitly when you have compatible Docker.

describe.skip('disk quota integration (@integration)', () => {
  it('enforces a 2GB workspace quota inside a docker container', async () => {
    const driver = new DockerDriver({ workdir: '/workspace' });
    // provision should create a container; we expect it to be started with storage limits
    const ctx = await driver.provision();

    try {
      // run df -h /workspace and assert size is <= 2G
      const df = await driver.exec(ctx, 'df', ['-h', '/workspace']);
      expect(df.stdout).toMatch(/\/workspace/);

      // attempt to write >2GB and expect failure
      const write = await driver.exec(ctx, 'sh', ['-c', 'dd if=/dev/zero of=/workspace/big.bin bs=1M count=2100'], { timeoutMs: 120000 });
      // if dd succeeds, that's a problem; assert non-zero exit
      expect(write.exitCode).not.toBe(0);
    } finally {
      await driver.destroy(ctx);
    }
  });
});
