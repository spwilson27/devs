import { describe, it, expect, vi } from 'vitest';
import { WebContainerNetworkShim } from './WebContainerNetworkShim';

describe('WebContainerNetworkShim', () => {
  it('forwards requests to allowed hosts', async () => {
    const shim = new WebContainerNetworkShim({ allowedHosts: ['registry.npmjs.org'] });
    const mockResp = new Response('', { status: 200 });
    const orig = vi.fn().mockResolvedValue(mockResp);
    (shim as any).originalFetch = orig;

    const res = await shim.interceptFetch(new Request('https://registry.npmjs.org/package'));
    expect(orig).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('blocks disallowed hosts with 403 and body', async () => {
    const shim = new WebContainerNetworkShim({ allowedHosts: ['registry.npmjs.org'] });
    (shim as any).originalFetch = vi.fn().mockResolvedValue(new Response('', { status: 200 }));

    const res = await shim.interceptFetch(new Request('https://evil.com'));
    expect(res.status).toBe(403);
    expect(await res.text()).toBe('Egress blocked by policy');
    expect((shim as any).originalFetch).not.toHaveBeenCalled();
  });

  it('matches hosts case-insensitively', async () => {
    const shim = new WebContainerNetworkShim({ allowedHosts: ['registry.npmjs.org'] });
    const orig = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    (shim as any).originalFetch = orig;

    const res = await shim.interceptFetch(new Request('https://REGISTRY.NPMJS.ORG/foo'));
    expect(orig).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it('emits structured log on blocked request', async () => {
    const shim = new WebContainerNetworkShim({ allowedHosts: ['registry.npmjs.org'] });
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    (shim as any).originalFetch = vi.fn().mockResolvedValue(new Response('', { status: 200 }));

    await shim.interceptFetch(new Request('https://evil.com'));

    expect(spy).toHaveBeenCalled();
    const arg = spy.mock.calls[0][0];
    expect(arg).toMatchObject({ event: 'webcontainer_egress_blocked', host: 'evil.com' });

    spy.mockRestore();
  });

  it('install patches fetch on webContainerInstance and delegates', async () => {
    const wc: any = { fetch: (input: any) => new Response('', { status: 500 }) };
    const shim = WebContainerNetworkShim.install(wc, { allowedHosts: ['registry.npmjs.org'] });

    // Ensure fetch was patched
    expect(wc.fetch).not.toBeUndefined();
    expect(wc.fetch).not.toBeNull();

    // Ensure delegation uses shim.originalFetch
    const orig = vi.fn().mockResolvedValue(new Response('', { status: 200 }));
    (shim as any).originalFetch = orig;

    const res = await wc.fetch('https://registry.npmjs.org/package');
    expect(orig).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });
});
