import { AuditConfig, DependencyAuditor } from './DependencyAuditor';
import { DependencyAuditError } from '../errors';

export async function runPostInstallAudit(exec: any, auditConfig?: AuditConfig): Promise<void> {
  if (!auditConfig) {
    // eslint-disable-next-line no-console
    console.warn('PostInstallHook: auditConfig undefined; skipping audit');
    return;
  }
  const res = await DependencyAuditor.audit(auditConfig);
  if (!res.passed) {
    throw new DependencyAuditError('Post-install dependency audit failed', { blocking: res.blocking, rawOutput: res.rawOutput });
  }
  if (res.warnings && res.warnings.length > 0) {
    for (const w of res.warnings) {
      // eslint-disable-next-line no-console
      console.warn('Dependency warning:', w);
    }
  }
}
