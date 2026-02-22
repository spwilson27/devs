import fs from 'fs';
import path from 'path';

import { findProjectRoot, resolveStatePath } from '../../persistence.js';
import { createDatabase } from '../../persistence/database.js';
import { CORE_TABLES } from '../../persistence/schema.js';
import { StateRepository } from '../../persistence/state_repository.js';
import { GitIntegrityChecker } from '../../git/GitIntegrityChecker.js';
import { MilestoneService } from '../MilestoneService.js';

export interface FoundationValidationResult {
  passed: boolean;
  errors: string[];
}

export class FoundationValidator {
  /**
   * Validates the Foundation milestone (M1 by default).
   * Options:
   *  - dbPath: explicit path to the .devs/state.sqlite file (test-friendly)
   *  - fromDir: directory used to locate the project root (defaults to process.cwd())
   *  - milestone: milestone id string ('M1' | 'M2' | 'M3')
   */
  async validate(opts: { dbPath?: string; fromDir?: string; milestone?: string } = {}): Promise<FoundationValidationResult> {
    const errors: string[] = [];

    const startDir = opts.fromDir ?? process.cwd();
    const projectRoot = findProjectRoot(startDir);
    if (!projectRoot) {
      errors.push(`Project root not found from '${startDir}'; ensure a private package.json exists`);
      return { passed: false, errors };
    }

    const dbPath = opts.dbPath ?? resolveStatePath(projectRoot);
    if (!fs.existsSync(dbPath)) {
      errors.push(`Missing state DB: ${dbPath}`);
      return { passed: false, errors };
    }

    const db = createDatabase({ dbPath });
    try {
      // Check core tables
      for (const t of CORE_TABLES) {
        const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get(t as string);
        if (!row) {
          errors.push(`Missing core table: ${t}`);
        }
      }

      // Git integrity checks (HEAD reachability, detached head, dirty workspace)
      try {
        const gitChecker = new GitIntegrityChecker();
        const gitResult = await gitChecker.verifyWorkspace(projectRoot);
        if (!gitResult.passed) {
          for (const v of gitResult.violations) {
            errors.push(`Git integrity: ${v.message}${v.details ? ' — ' + v.details : ''}`);
          }
        }
      } catch (err) {
        errors.push(`Git check failed: ${err instanceof Error ? err.message : String(err)}`);
      }

      // Verify packages present in monorepo
      const corePkg = path.join(projectRoot, 'packages', 'core', 'package.json');
      const cliPkg = path.join(projectRoot, 'packages', 'cli', 'package.json');
      if (!fs.existsSync(corePkg)) {
        errors.push('Missing @devs/core package in monorepo (packages/core/package.json not found)');
      } else {
        try {
          const p = JSON.parse(fs.readFileSync(corePkg, 'utf8')) as any;
          if (p.name !== '@devs/core') {
            errors.push(`packages/core/package.json has name '${p.name}', expected '@devs/core'`);
          }
        } catch {
          errors.push('Cannot parse packages/core/package.json');
        }
      }

      if (!fs.existsSync(cliPkg)) {
        errors.push('Missing @devs/cli package in monorepo (packages/cli/package.json not found)');
      } else {
        try {
          const p = JSON.parse(fs.readFileSync(cliPkg, 'utf8')) as any;
          if (p.name !== '@devs/cli') {
            errors.push(`packages/cli/package.json has name '${p.name}', expected '@devs/cli'`);
          }
        } catch {
          errors.push('Cannot parse packages/cli/package.json');
        }
      }

      // Milestone completion check (Phase 1 & 2 -> M1)
      const projRow = db.prepare('SELECT id FROM projects ORDER BY id LIMIT 1').get();
      if (!projRow || !projRow.id) {
        errors.push('No project row found in state database (projects table empty)');
      } else {
        const projectId = projRow.id as number;
        const repo = new StateRepository(db);
        const ms = new MilestoneService(repo, projectId);
        const milestone = (opts.milestone ?? 'M1') as any;
        const isComplete = ms.isMilestoneComplete(milestone);
        if (!isComplete) {
          const state = repo.getProjectState(projectId) as any;
          const phases = milestone === 'M1' ? [1, 2] : milestone === 'M2' ? [3, 4, 5] : [6, 7, 8];
          const epicsIn = state.epics.filter((e: any) => phases.includes(e.order_index ?? 0));
          const epicIds = new Set(epicsIn.map((e: any) => e.id as number));
          const tasksIn = state.tasks.filter((t: any) => epicIds.has(t.epic_id));
          const incomplete = tasksIn.filter((t: any) => String(t.status).toLowerCase() !== 'completed');
          if (incomplete.length === 0 && tasksIn.length === 0) {
            errors.push(`Milestone ${milestone} has no tasks defined`);
          } else {
            errors.push(`Milestone ${milestone} is not complete; ${incomplete.length} incomplete task(s):`);
            for (const t of incomplete) {
              errors.push(`  - Task id=${t.id} title='${t.title}' status='${t.status}'`);
            }
          }
        }
      }
    } finally {
      try {
        db.close();
      } catch (e) {
        // swallow
      }
    }

    return { passed: errors.length === 0, errors };
  }
}
