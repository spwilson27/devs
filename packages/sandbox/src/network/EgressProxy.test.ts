import http from 'http';
import net from 'net';
import { describe, it, expect } from 'vitest';
import EgressProxy from './EgressProxy';

describe('EgressProxy', () => {
  it('exposes start, stop, isRunning', () => {
    const p = new EgressProxy({ port: 0, allowList: [] });
    expect(typeof p.start).toBe('function');
    expect(typeof p.stop).toBe('function');
    expect(typeof p.isRunning).toBe('function');
  });

  it('binds to an ephemeral port and stops', async () => {
    const p = new EgressProxy({ port: 0, allowList: [] });
    await p.start();
    expect(p.isRunning()).toBe(true);
    expect(p.port).toBeGreaterThan(0);
    await p.stop();
    expect(p.isRunning()).toBe(false);
  });

  it('responds 407 or 403 to CONNECT requests (default-deny)', async () => {
    const p = new EgressProxy({ port: 0, allowList: [] });
    await p.start();
    const port = p.port;

    const data = await new Promise<Buffer>((resolve, reject) => {
      const socket = net.connect({ port, host: '127.0.0.1' }, () => {
        socket.write('CONNECT example.com:443 HTTP/1.1\r\nHost: example.com:443\r\n\r\n');
      });
      const chunks: Buffer[] = [];
      socket.on('data', (chunk) => {
        chunks.push(Buffer.from(chunk));
      });
      socket.on('end', () => resolve(Buffer.concat(chunks)));
      socket.on('error', (err) => reject(err));
      setTimeout(() => {
        socket.destroy();
        reject(new Error('timeout'));
      }, 2000);
    });

    const str = data.toString();
    const m = str.match(/^HTTP\/\d+\.\d+\s+(\d+)\s+/);
    expect(m).toBeTruthy();
    const code = parseInt(m![1], 10);
    expect([403, 407]).toContain(code);

    await p.stop();
  }, 10000);

  it('responds 403 to plain HTTP GET requests', async () => {
    const p = new EgressProxy({ port: 0, allowList: [] });
    await p.start();
    const port = p.port;
    const status = await new Promise<number>((resolve, reject) => {
      const req = http.request({ host: '127.0.0.1', port, method: 'GET', path: '/', headers: { Host: 'example.com' } }, (res) => {
        resolve(res.statusCode || 0);
      });
      req.on('error', reject);
      req.end();
    });
    expect(status).toBe(403);
    await p.stop();
  });
});
