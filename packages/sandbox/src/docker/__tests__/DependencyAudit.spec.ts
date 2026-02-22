import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as path from 'path';
import * as child_process from 'child_process';
import { DependencyAuditor } from '../../audit/DependencyAuditor';
import { DependencyAuditError } from '../../errors';

describe('DependencyAuditor', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns passed=true for clean audit', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: {} }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const out = JSON.stringify({ vulnerabilities: {}, metadata: { vulnerabilities: { high: 0, critical: 0, moderate: 0, low: 0 } } });
      if (typeof cb === 'function') cb(null, out, '');
      return {} as any;
    });
    const res = await DependencyAuditor.audit({ workspacePath: tmp, whitelist: [], blockingSeverities: ['high', 'critical'] });
    expect(res.passed).toBe(true);
    expect(res.blocking.length).toBe(0);
  });

  it('fails when high vulnerability present', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: {} }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const out = JSON.stringify({ vulnerabilities: { pkg1: { name: 'pkg1', severity: 'high', title: 'bad', url: 'http://', find: 'VULN-1' } }, metadata: { vulnerabilities: { high: 1, critical: 0 } } });
      if (typeof cb === 'function') cb(null, out, '');
      return {} as any;
    });
    const res = await DependencyAuditor.audit({ workspacePath: tmp, whitelist: [], blockingSeverities: ['high', 'critical'] });
    expect(res.passed).toBe(false);
    expect(res.blocking.some((b) => b.package === 'pkg1')).toBe(true);
  });

  it('treats moderate/low as non-blocking', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: {} }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const out = JSON.stringify({ vulnerabilities: { pkg1: { name: 'pkg1', severity: 'moderate' }, pkg2: { name: 'pkg2', severity: 'low' } }, metadata: { vulnerabilities: { moderate: 2, low: 1, high: 0, critical: 0 } } });
      if (typeof cb === 'function') cb(null, out, '');
      return {} as any;
    });
    const res = await DependencyAuditor.audit({ workspacePath: tmp, whitelist: [], blockingSeverities: ['high', 'critical'] });
    expect(res.passed).toBe(true);
    expect(res.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it('throws DependencyAuditError on malformed JSON (exit code 2)', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: {} }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const err: any = new Error('malformed');
      err.code = 2;
      err.stderr = 'not json';
      if (typeof cb === 'function') cb(err, '', 'not json');
      return {} as any;
    });
    await expect(DependencyAuditor.audit({ workspacePath: tmp, whitelist: [], blockingSeverities: ['high', 'critical'] })).rejects.toBeInstanceOf(DependencyAuditError);
  });

  it('enforces whitelist and blocks unlisted packages', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: { axios: { version: '0.1.0' } } }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const out = JSON.stringify({ vulnerabilities: {}, metadata: { vulnerabilities: { high: 0, critical: 0 } } });
      if (typeof cb === 'function') cb(null, out, '');
      return {} as any;
    });
    const res = await DependencyAuditor.audit({ workspacePath: tmp, whitelist: ['lodash', 'express'], blockingSeverities: ['high', 'critical'] });
    expect(res.passed).toBe(false);
    expect(res.blocking.some((b) => b.package === 'axios')).toBe(true);
  });

  it('skips whitelist when empty', async () => {
    const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'dep-audit-'));
    await fs.writeFile(path.join(tmp, 'package-lock.json'), JSON.stringify({ dependencies: { axios: {} } }), 'utf-8');
    vi.spyOn(child_process, 'execFile').mockImplementation((cmd: any, args: any, opts: any, cb: any) => {
      const out = JSON.stringify({ vulnerabilities: {}, metadata: { vulnerabilities: { high: 0, critical: 0 } } });
      if (typeof cb === 'function') cb(null, out, '');
      return {} as any;
    });
    const res = await DependencyAuditor.audit({ workspacePath: tmp, whitelist: [], blockingSeverities: ['high', 'critical'] });
    expect(res.blocking.length).toBe(0);
    expect(res.passed).toBe(true);
  });
});
