export class AllowlistEngine {
  private hosts: Set<string>;

  constructor(allowedHosts: ReadonlyArray<string>) {
    this.hosts = new Set((allowedHosts || []).map(h => AllowlistEngine.normalize(h)).filter(Boolean) as string[]);
  }

  static normalize(host?: string | null): string | null {
    if (!host) return null;
    let h = String(host).toLowerCase().trim();
    // strip numeric port suffix like :443
    h = h.replace(/:\d+$/, '');
    // strip trailing dot
    if (h.endsWith('.')) h = h.slice(0, -1);
    if (!h) return null;
    return h;
  }

  isAllowed(host: string | null | undefined): boolean {
    const n = AllowlistEngine.normalize(host as any);
    if (!n) return false;
    return this.hosts.has(n);
  }

  update(hosts: ReadonlyArray<string>): void {
    this.hosts = new Set((hosts || []).map(h => AllowlistEngine.normalize(h)).filter(Boolean) as string[]);
  }

  list(): string[] {
    return Array.from(this.hosts);
  }
}
