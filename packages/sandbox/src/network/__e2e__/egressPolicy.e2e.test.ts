import net from 'net';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { startEgressStack, stopEgressStack } from './helpers';

if (process.env.E2E !== 'true') {
  describe('@e2e egress policy (skipped)', () => {
    it('skipped when E2E!=true', () => {
      // E2E tests are gated by E2E=true
    });
  });
} else {
  /** @group e2e */
  describe('@e2e egress policy', () => {
    let handles: any;

    beforeAll(async () => {
      handles = await startEgressStack({ allowList: ['registry.npmjs.org', 'pypi.org', 'github.com'] });
    }, 20000);

    afterAll(async () => {
      try {
        await stopEgressStack(handles);
      } finally {
        // ensure cleanup even if stopping throws
      }
    }, 20000);

    it('allows registry.npmjs.org and blocks files.pythonhosted.org and evil.com; metrics reflect decisions', async () => {
      const port = handles.proxy.port;

      async function doConnect(host: string): Promise<number> {
        const data = await new Promise<Buffer>((resolve, reject) => {
          const socket = net.connect({ port, host: '127.0.0.1' }, () => {
            socket.write(`CONNECT ${host}:443 HTTP/1.1\r\nHost: ${host}:443\r\n\r\n`);
          });
          const chunks: Buffer[] = [];
          socket.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
          socket.on('end', () => resolve(Buffer.concat(chunks)));
          socket.on('error', (err) => reject(err));
          setTimeout(() => {
            socket.destroy();
            reject(new Error('timeout'));
          }, 2000);
        });
        const str = data.toString();
        const m = str.match(/^HTTP\/\d+\.\d+\s+(\d+)\s+/);
        const code = m ? parseInt(m[1], 10) : NaN;
        return code;
      }

      const ok = await doConnect('registry.npmjs.org');
      const pypi = await doConnect('files.pythonhosted.org');
      const evil = await doConnect('evil.com');

      expect(ok).toBe(200);
      expect(pypi).toBe(403);
      expect(evil).toBe(403);

      const metrics = handles.auditLogger.getMetrics();
      expect(metrics.allowedCount).toBe(1);
      expect(metrics.blockedCount).toBe(2);
    }, 30000);
  });
}