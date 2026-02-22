import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import { DependencyAuditError } from '../errors';

const execFileP = promisify(execFile as any);

export interface AuditConfig {
  workspacePath: string;
  whitelist: string[];
  blockingSeverities?: ('high' | 'critical')[];
}

export interface AuditVulnerability {
  id: string;
  package: string;
  severity: string;
  title?: string;
  url?: string;
}

export interface AuditResult {
  passed: boolean;
  blocking: AuditVulnerability[];
  warnings: AuditVulnerability[];
  rawOutput: string;
}

function gatherPackagesFromLock(lockObj: any, set: Set<string>) {
  if (!lockObj || typeof lockObj !== 'object') return;
  if (lockObj.dependencies && typeof lockObj.dependencies === 'object') {
    for (const [name, val] of Object.entries(lockObj.dependencies)) {
      set.add(name);
      gatherPackagesFromLock(val as any, set);
    }
  }
}

export class DependencyAuditor {
  static async audit(config: AuditConfig): Promise<AuditResult> {
    const whitelist = (config.whitelist ?? []).map((s) => s.toLowerCase());
    const blockingSeverities = config.blockingSeverities ?? ['high', 'critical'];
    const blocking: AuditVulnerability[] = [];
    const warnings: AuditVulnerability[] = [];

    // Whitelist check (reads package-lock.json or node_modules/.package-lock.json)
    if (Array.isArray(config.whitelist) && config.whitelist.length > 0) {
      try {
        let lockPath = `${config.workspacePath}/package-lock.json`;
        let lockJson: any = null;
        try {
          lockJson = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
        } catch (_e) {
          try {
            lockPath = `${config.workspacePath}/node_modules/.package-lock.json`;
            lockJson = JSON.parse(await fs.readFile(lockPath, 'utf-8'));
          } catch (e2) {
            lockJson = null;
          }
        }
        if (lockJson && lockJson.dependencies) {
          const pkgs = new Set<string>();
          gatherPackagesFromLock(lockJson, pkgs);
          for (const pkg of pkgs) {
            if (!whitelist.includes(pkg.toLowerCase())) {
              blocking.push({
                id: `whitelist:${pkg}`,
                package: pkg,
                severity: 'whitelist-violation',
                title: 'Package not in whitelist',
                url: '',
              });
            }
          }
        }
      } catch (e) {
        // ignore errors reading lock file
      }
    }

    // Run `npm audit --json --prefix <workspace>`
    let stdout = '';
    let stderr = '';
    try {
      const res: any = await execFileP('npm', ['audit', '--json', '--prefix', config.workspacePath]);
      stdout = res?.stdout ?? '';
      stderr = res?.stderr ?? '';
    } catch (err: any) {
      // If exit code 2, treat as malformed JSON
      if (err && err.code === 2) {
        throw new DependencyAuditError('npm audit returned exit code 2', { rawOutput: err.stderr ?? String(err) });
      }
      stdout = err?.stdout ?? '';
      stderr = err?.stderr ?? String(err);
    }

    // Parse output
    let parsed: any = {};
    try {
      parsed = stdout ? JSON.parse(stdout) : {};
    } catch (e) {
      throw new DependencyAuditError('Failed to parse npm audit output', { rawOutput: stdout || stderr });
    }

    const vulnerabilities = parsed?.vulnerabilities ?? {};
    for (const [key, val] of Object.entries(vulnerabilities)) {
      const v: any = val as any;
      const name = v.name ?? key;
      const severity = (v.severity || (v.via && v.via[0] && v.via[0].severity) || 'unknown').toLowerCase();
      const id = v.find ? (typeof v.find === 'string' ? v.find : (v.find[0]?.id ?? key)) : key;
      const title = v.title ?? (Array.isArray(v.via) && v.via[0]?.title) ?? '';
      const url = v.url ?? (Array.isArray(v.via) && v.via[0]?.url) ?? '';
      const auditVuln: AuditVulnerability = { id: String(id), package: name, severity, title, url };
      if (blockingSeverities.includes(severity as any)) {
        blocking.push(auditVuln);
      } else {
        warnings.push(auditVuln);
      }
    }

    const passed = blocking.length === 0;
    return { passed, blocking, warnings, rawOutput: stdout };
  }
}
