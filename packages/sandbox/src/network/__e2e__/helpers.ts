import EgressProxy from '../EgressProxy';
import { ProxyAuditLogger } from '../ProxyAuditLogger';

export interface EgressStackHandles {
  proxy: EgressProxy;
  auditLogger: ProxyAuditLogger;
  resolver: { upstream: string; resolve: (host: string) => Promise<string> } | null;
}

export async function startEgressStack(opts?: { allowList?: string[] }): Promise<EgressStackHandles> {
  const allowList = opts?.allowList ?? ["registry.npmjs.org", "pypi.org", "github.com"];
  const auditLogger = new ProxyAuditLogger({ sinkType: 'console' });

  // Minimal stub IsolatedDnsResolver used for E2E tests; points at 8.8.8.8 for informational purposes
  const resolver = {
    upstream: '8.8.8.8',
    resolve: async (host: string) => {
      // No real DNS resolution performed in this test stub; resolve succeeds to allow allowlist decision to drive behavior.
      return '127.0.0.1';
    }
  };

  const proxy = new EgressProxy({ port: 0, allowList, dnsResolver: resolver as any, auditLogger });
  await proxy.start();

  return { proxy, auditLogger, resolver };
}

export async function stopEgressStack(handles: EgressStackHandles): Promise<void> {
  try {
    await handles.proxy.stop();
  } catch (_) {}
  try {
    handles.auditLogger.close();
  } catch (_) {}
}