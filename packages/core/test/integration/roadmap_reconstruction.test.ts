import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Roadmap reconstruction integration', () => {
  it('reconstructs DB from git and specs', async () => {
    // Resolve repository root from this package test location
    const repoRoot = path.resolve(__dirname, '../../../../');
    const statePath = path.join(repoRoot, '.devs', 'state.sqlite');

    // Ensure state is wiped
    if (fs.existsSync(statePath)) {
      fs.unlinkSync(statePath);
    }

    // Attempt to load the RoadmapReconstructor (TDD: the module does not exist yet)
    const core = await import('@devs/core/persistence');
    const RoadmapReconstructor = core.RoadmapReconstructor;

    const reconstructor = new RoadmapReconstructor({ repoRoot });
    await reconstructor.reconstruct({ force: false });

    expect(fs.existsSync(statePath)).toBe(true);

    const stats = fs.statSync(statePath);
    expect(stats.size).toBeGreaterThan(0);
  });
});
