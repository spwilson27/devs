import { afterEach } from 'vitest';
import { WebContainerDriver } from '../../webcontainer-driver';

export async function bootDriver() {
  const driver = new WebContainerDriver({ defaultTimeoutMs: 30_000, workdirPath: '/workspace' });
  // Use provision() to get a context suitable for exec/destroy calls
  const ctx = await (typeof driver.provision === 'function' ? driver.provision() : (async () => {
    await driver.boot();
    return { id: `webcontainer-${Date.now()}` } as any;
  })());

  let _teardown = false;
  afterEach(async () => {
    if (!_teardown) {
      try {
        if (typeof (driver as any).teardown === 'function') {
          await (driver as any).teardown();
        } else if (typeof (driver as any).destroy === 'function') {
          await (driver as any).destroy(ctx);
        }
      } catch (e) {
        // swallow errors during teardown to avoid masking test failures
      } finally {
        _teardown = true;
      }
    }
  });

  return { driver, ctx };
}
