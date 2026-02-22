import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';

describe('ProjectManager.init integration', () => {
  it('creates .devs/state.sqlite, required dirs, and a project row', async () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'devs-init-'));

    const mod = await import('../../packages/core/src/lifecycle/ProjectManager');
    const ProjectManager = mod.ProjectManager;

    await ProjectManager.init(tmpRoot, 'Test Brief', ['Journey 1']);

    const statePath = path.join(tmpRoot, '.devs', 'state.sqlite');
    expect(fs.existsSync(statePath)).toBe(true);

    for (const d of ['.agent', 'src', 'tests', 'docs', 'scripts']) {
      expect(fs.existsSync(path.join(tmpRoot, d))).toBe(true);
    }

    const db = new Database(statePath);
    const rows = db.prepare('SELECT * FROM projects').all();
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('Test Brief');
    expect(rows[0].status).toBe('INITIALIZING');
    db.close();
  });
});
