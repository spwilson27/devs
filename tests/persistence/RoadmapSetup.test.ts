import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';
import Database from 'better-sqlite3';

describe('Roadmap default epics', () => {
  it('initializes epics for phases 3-8 in correct order', async () => {
    const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'devs-roadmap-'));
    const mod = await import('../../packages/core/src/lifecycle/ProjectManager');
    const ProjectManager = mod.ProjectManager;

    await ProjectManager.init(tmpRoot, 'Roadmap Test', ['Journey']);

    const dbPath = path.join(tmpRoot, '.devs', 'state.sqlite');
    const db = new Database(dbPath);
    const rows = db.prepare('SELECT * FROM epics ORDER BY order_index, id').all();

    const expected = ['Discovery','Synthesis','Planning','Implementation','Interface','Optimization'];
    const found = rows.map((r: any) => (typeof r.name === 'string' ? r.name.replace(/^P\d+\s*-\s*/, '') : r.name));
    const seq = found.filter((n: string) => expected.includes(n));

    expect(seq).toEqual(expected);
    db.close();
  });
});
