import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { ensureDirSync, outputJsonSync } from 'fs-extra';
import simpleGit from 'simple-git';
import { createDatabase } from '../persistence/database.js';
import { initializeSchema } from '../persistence/schema.js';
import { StateRepository } from '../persistence/state_repository.js';
import { FoundationValidator } from './validators/FoundationValidator.js';

export type ProjectStatus = 'ACTIVE' | 'PAUSED' | 'UNKNOWN';

export const DEFAULT_ROADMAP = [
  { phase_id: 'P1', milestone_id: 'M1', name: 'Foundation' },
  { phase_id: 'P2', milestone_id: 'M2', name: 'Execution' },
  { phase_id: 'P3', milestone_id: 'M3', name: 'Discovery' },
  { phase_id: 'P4', milestone_id: 'M4', name: 'Synthesis' },
  { phase_id: 'P5', milestone_id: 'M5', name: 'Planning' },
  { phase_id: 'P6', milestone_id: 'M6', name: 'Implementation' },
  { phase_id: 'P7', milestone_id: 'M7', name: 'Interface' },
  { phase_id: 'P8', milestone_id: 'M8', name: 'Optimization' },
];


export class ProjectManager {
  private persistencePath: string;

  constructor(persistencePath?: string) {
    this.persistencePath = persistencePath ?? path.resolve(process.cwd(), 'packages/core/.project_status.json');
  }

  /**
   * Initialize a new devs project in `root`.
   * Creates required directories, initializes the Flight Recorder DB, writes a
   * minimal package.json, and inits git if none exists.
   */
  static async init(root: string, brief: string, journeys: string[]): Promise<void> {
    const resolvedRoot = path.resolve(root);

    // Ensure root directory exists
    if (!fs.existsSync(resolvedRoot)) {
      fs.mkdirSync(resolvedRoot, { recursive: true });
    }

    // If already initialized (has .devs), refuse to proceed to avoid clobbering
    const devsDir = path.join(resolvedRoot, '.devs');
    if (fs.existsSync(devsDir)) {
      throw new Error(`Project already initialized at ${resolvedRoot}`);
    }

    // Create required scaffold directories (idempotent)
    const required = ['.agent', 'src', 'tests', 'docs', 'scripts'];
    for (const d of required) {
      ensureDirSync(path.join(resolvedRoot, d));
    }

    // Ensure .devs exists for Flight Recorder
    ensureDirSync(devsDir);

    // Write a minimal package.json if not present
    const pkgPath = path.join(resolvedRoot, 'package.json');
    if (!fs.existsSync(pkgPath)) {
      const pkg = {
        name: path.basename(resolvedRoot) || 'devs-project',
        version: '0.0.1',
        private: true,
        devs: {
          brief,
          journeys,
          version: '1.0.0',
          generated_by: 'devs',
        },
        engines: {
          node: '>=22',
          pnpm: '>=9',
        },
      } as any;
      outputJsonSync(pkgPath, pkg, { spaces: 2 });
    }

    // Initialize the Flight Recorder SQLite DB and schema
    const statePath = path.join(devsDir, 'state.sqlite');
    const db = createDatabase({ dbPath: statePath });

    try {
      // Ensure core schema exists (idempotent)
      initializeSchema(db);

      // Persist initial Project row inside StateRepository (transactional) and seed default roadmap epics
      const repo = new StateRepository(db);
      const projectId = repo.upsertProject({
        name: brief,
        status: 'INITIALIZING',
        metadata: JSON.stringify({ journeys }),
      });

      // Seed default epics (ordered)
      const epicsToSave = DEFAULT_ROADMAP.map((e, idx) => {
        const phaseNum = parseInt((e.phase_id || '').replace(/^P/, ''), 10) || (idx + 1);
        return {
          project_id: projectId,
          name: `${e.phase_id} - ${e.name}`,
          order_index: idx,
          status: phaseNum > 2 ? 'LOCKED' : 'PENDING',
        };
      });
      repo.saveEpics(epicsToSave);

    } finally {
      try {
        db.close();
      } catch (err) {
        // swallow
      }
    }

    // Initialize git repository if not already present
    const gitDir = path.join(resolvedRoot, '.git');
    if (!fs.existsSync(gitDir)) {
      try {
        const git = (simpleGit as any)(resolvedRoot as any);
        await git.init();
      } catch (err) {
        // Non-fatal: git init failure should not block project initialization
      }
    }
  }

  private async readState(): Promise<Record<string, ProjectStatus>> {
    try {
      const raw = await fsPromises.readFile(this.persistencePath, 'utf8');
      return JSON.parse(raw) as Record<string, ProjectStatus>;
    } catch (err) {
      return {};
    }
  }

  private async writeState(state: Record<string, ProjectStatus>) {
    await fsPromises.mkdir(path.dirname(this.persistencePath), { recursive: true }).catch(()=>{});
    await fsPromises.writeFile(this.persistencePath, JSON.stringify(state, null, 2), 'utf8');
  }

  async pause(projectId = 'default') {
    const state = await this.readState();
    state[projectId] = 'PAUSED';
    await this.writeState(state);
  }

  async resume(projectId = 'default') {
    const state = await this.readState();
    state[projectId] = 'ACTIVE';
    await this.writeState(state);
  }

  async status(projectId = 'default') {
    const state = await this.readState();
    const current = state[projectId] ?? 'UNKNOWN';
    return {
      projectId,
      status: current,
      phase: null,
      milestone: null,
      epics: [],
      progress: 0,
      logs: [],
    };
  }

  /**
   * Validate a milestone using the FoundationValidator.
   * @param milestoneId - e.g., 'M1'
   * @param options - optional { dbPath, fromDir }
   */
  async validateMilestone(milestoneId = 'M1', options?: { dbPath?: string; fromDir?: string }) {
    const validator = new FoundationValidator();
    return await validator.validate({ dbPath: options?.dbPath, fromDir: options?.fromDir, milestone: milestoneId });
  }
}
