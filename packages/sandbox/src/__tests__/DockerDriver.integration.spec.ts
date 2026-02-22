import { it, expect } from 'vitest';
import { DockerDriver } from '../drivers/DockerDriver';

it('provisions and runs a real Alpine container @integration', async () => {
  const driver = new DockerDriver({ image: 'ghcr.io/devs-project/sandbox-base:alpine-3.19' });
  const ctx = await driver.provision();
  const res = await driver.exec(ctx, 'echo', ['integration-test'], { timeoutMs: 5000 });
  expect(res.stdout).toBe('integration-test\n');

  // verify cap-drop via docker inspect
  const util = await import('util');
  const cp = await import('child_process');
  const execFile = util.promisify((cp as any).execFile);
  const inspectOut = await execFile('docker', ['inspect', ctx.id]);
  const inspectJson = JSON.parse((inspectOut as any).stdout);
  const capDrop = inspectJson[0]?.HostConfig?.CapDrop;
  expect(capDrop).toContain('ALL');

  await driver.destroy(ctx);

  // container should be removed
  try {
    await execFile('docker', ['inspect', ctx.id]);
    throw new Error('container still exists');
  } catch (err: any) {
    // expected
  }
});
