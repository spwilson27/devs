import fs from 'fs';
import { describe, it, expect } from 'vitest';
import path from 'path';
const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'));

describe('package.json integrity', () => {
  it('has required fields', () => {
    expect(pkg.name).toBe('@devs/sandbox');
    expect(pkg.main).toBe('dist/index.js');
    expect(pkg.types).toBe('dist/index.d.ts');
    expect(pkg.exports).toBeDefined();
    expect(pkg.exports['.'].import).toBe('./dist/index.js');
    expect(pkg.exports['.'].require).toBe('./dist/index.cjs');
    expect(pkg.engines && pkg.engines.node).toBe('>=22');
    expect(pkg.peerDependencies && pkg.peerDependencies['@devs/core']).toBe('workspace:*');
  });
});
