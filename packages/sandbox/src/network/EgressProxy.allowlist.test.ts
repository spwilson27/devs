import net from 'net';
import { describe, it, expect } from 'vitest';
import EgressProxy from './EgressProxy';

const makeConnect = (port: number, target: string, timeout = 2000) => new Promise<number>((resolve, reject) => {
  const socket = net.connect({ port, host: '127.0.0.1' }, () => {
    socket.write(`CONNECT ${target} HTTP/1.1\r\nHost: ${target}\r\n\r\n`);
  });
  const chunks: Buffer[] = [];
  socket.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
  socket.on('error', (err) => reject(err));
  setTimeout(() => {
    const str = Buffer.concat(chunks).toString();
    const m = str.match(/^HTTP\/\d+\.\d+\s+(\d+)\s+/);
    if (m) resolve(parseInt(m[1], 10));
    else reject(new Error('no response'));
    socket.destroy();
  }, timeout);
});

describe('EgressProxy allowlist', () => {
  it('returns 200 for allowed host and 403 for denied and reflects runtime updates', async () => {
    const p = new EgressProxy({ port: 0, allowList: ['registry.npmjs.org'] });
    await p.start();
    const port = p.port;

    const codeAllowed = await makeConnect(port, 'registry.npmjs.org:443');
    expect(codeAllowed).toBe(200);

    const codeDenied = await makeConnect(port, 'pypi.org:443');
    expect(codeDenied).toBe(403);

    p.updateAllowList(['pypi.org']);
    const codeNowAllowed = await makeConnect(port, 'pypi.org:443');
    expect(codeNowAllowed).toBe(200);

    await p.stop();
  }, 20000);
});
