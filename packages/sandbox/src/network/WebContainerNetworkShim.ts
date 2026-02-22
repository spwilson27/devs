export interface WebContainerNetworkShimConfig {
  allowedHosts: string[];
}

export class WebContainerNetworkShim {
  private allowedHostsSet: Set<string>;
  private originalFetch: typeof fetch;

  constructor(config: WebContainerNetworkShimConfig) {
    this.allowedHostsSet = new Set((config.allowedHosts || []).map((h) => h.toLowerCase()));
    this.originalFetch = (globalThis.fetch as any) ?? (async () => {
      throw new Error('fetch not available');
    });
  }

  async interceptFetch(request: Request): Promise<Response> {
    let hostname = '';
    try {
      const url = new URL(String(request.url));
      hostname = url.hostname.toLowerCase();
    } catch (e) {
      if (typeof console?.log === 'function') {
        console.log({ event: 'webcontainer_egress_blocked', host: '', url: String(request?.url ?? '') });
      }
      return new Response('Egress blocked by policy', { status: 403 });
    }

    if (!this.allowedHostsSet.has(hostname)) {
      if (typeof console?.log === 'function') {
        console.log({ event: 'webcontainer_egress_blocked', host: hostname, url: String(request.url) });
      }
      return new Response('Egress blocked by policy', { status: 403 });
    }

    return this.originalFetch(request as any);
  }

  static install(webContainerInstance: any, config: WebContainerNetworkShimConfig): WebContainerNetworkShim {
    const shim = new WebContainerNetworkShim(config);

    // Capture current global fetch to avoid recursive calls
    shim.originalFetch = (globalThis.fetch as any).bind(globalThis);

    const wrapper = (input: any, init?: any) => {
      const req = input instanceof Request ? input : new Request(String(input), init as any);
      return shim.interceptFetch(req);
    };

    if (webContainerInstance && typeof webContainerInstance === 'object') {
      if ('fetch' in webContainerInstance) {
        webContainerInstance.fetch = wrapper as any;
      } else if (webContainerInstance.window && typeof webContainerInstance.window === 'object') {
        webContainerInstance.window.fetch = wrapper as any;
      } else if (webContainerInstance.globalThis && typeof webContainerInstance.globalThis === 'object') {
        webContainerInstance.globalThis.fetch = wrapper as any;
      } else {
        globalThis.fetch = wrapper as any;
      }
    } else {
      globalThis.fetch = wrapper as any;
    }

    return shim;
  }
}

export default WebContainerNetworkShim;
