import fs from 'fs';
import os from 'os';
import path from 'path';
import { describe, it, expect, vi } from 'vitest';
import { ProxyAuditLogger } from './ProxyAuditLogger';
import EgressProxy from './EgressProxy';

describe('ProxyAuditLogger', () => {
  it('writes structured JSON to custom sink for allowed request', () => {
    const sink = vi.fn();
    const logger = new ProxyAuditLogger({ sinkType: 'custom', sink });
    logger.logRequest({ host: 'registry.npmjs.org', allowed: true, method: 'CONNECT', timestampMs: 1000 });
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith({ event: 'egress_allowed', host: 'registry.npmjs.org', method: 'CONNECT', timestampMs: 1000 });
  });

  it('emits egress_blocked for blocked host', () => {
    const sink = vi.fn();
    const logger = new ProxyAuditLogger({ sinkType: 'custom', sink });
    logger.logRequest({ host: 'evil.com', allowed: false, method: 'CONNECT', timestampMs: 2000 });
    expect(sink).toHaveBeenCalledWith(expect.objectContaining({ event: 'egress_blocked' }));
  });

  it('handles 100 rapid calls to sink', () => {
    const sink = vi.fn();
    const logger = new ProxyAuditLogger({ sinkType: 'custom', sink });
    for (let i = 0; i < 100; i++) {
      logger.logRequest({ host: `h${i}.example`, allowed: i % 2 === 0, method: 'CONNECT', timestampMs: 3000 + i });
    }
    expect(sink).toHaveBeenCalledTimes(100);
  });

  it('appends to file sink', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'proxy-audit-'));
    const file = path.join(tmp, 'egress.log');
    const logger = new ProxyAuditLogger({ sinkType: 'file', filePath: file });
    logger.logRequest({ host: 'registry.npmjs.org', allowed: true, method: 'CONNECT', timestampMs: Date.now() });
    const content = fs.readFileSync(file, 'utf8');
    expect(content.includes('"event"')).toBe(true);
  });

  it('getMetrics returns counts', () => {
    const sink = vi.fn();
    const logger = new ProxyAuditLogger({ sinkType: 'custom', sink });
    logger.logRequest({ host: 'a.com', allowed: true, method: 'GET', timestampMs: 1000 });
    logger.logRequest({ host: 'b.com', allowed: false, method: 'GET', timestampMs: 2000 });
    const m = logger.getMetrics();
    expect(m.allowedCount).toBe(1);
    expect(m.blockedCount).toBe(1);
  });

  it('integration with EgressProxy returns correct metrics', async () => {
    const logger = new ProxyAuditLogger({ sinkType: 'custom', sink: () => {} });
    const p = new EgressProxy({ port: 0, allowList: ['allowed.com'], auditLogger: logger });
    await p.start();
    const port = p.port;

    const send = (host: string) => new Promise<void>((resolve, reject) => {
      const socket = require('net').connect({ port, host: '127.0.0.1' }, () => {
        socket.write(`CONNECT ${host}:443 HTTP/1.1\r\nHost: ${host}:443\r\n\r\n`);
      });
      const chunks: Buffer[] = [];
      socket.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
      socket.on('end', () => resolve());
      socket.on('error', (err: Error) => reject(err));
      setTimeout(() => {
        socket.destroy();
        reject(new Error('timeout'));
      }, 2000);
    });

    await send('allowed.com');
    await send('allowed.com');
    await send('allowed.com');
    await send('evil.com').catch(() => {});
    await send('evil.com').catch(() => {});
    await p.stop();

    const m = logger.getMetrics();
    expect(m.allowedCount).toBe(3);
    expect(m.blockedCount).toBe(2);
  }, 20000);
});
