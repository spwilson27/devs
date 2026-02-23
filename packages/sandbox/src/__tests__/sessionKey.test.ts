import { describe, it, expect } from 'vitest';
import { SessionKeyManager, sessionKeyManager } from '../keys/SessionKeyManager';
import { PreflightService } from '../preflight/PreflightService';

describe('SessionKeyManager', () => {
  it('generateKey() returns a Buffer of 16 bytes', () => {
    const mgr = new SessionKeyManager();
    const key = mgr.generateKey();
    expect(Buffer.isBuffer(key)).toBe(true);
    expect(key.length).toBe(16);
  });

  it('generateKey() uniqueness over 1000 iterations', () => {
    const mgr = new SessionKeyManager();
    const seen = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      seen.add(mgr.generateKey().toString('hex'));
    }
    expect(seen.size).toBe(1000);
  });

  it('registerKey/getKey/revokeKey zeroes buffer and removes entry', () => {
    const mgr = new SessionKeyManager();
    const key = mgr.generateKey();
    mgr.registerKey('sb-test', key);
    expect(mgr.getKey('sb-test')).toBe(key);
    mgr.revokeKey('sb-test');
    expect(mgr.getKey('sb-test')).toBeUndefined();
    for (const b of key) expect(b).toBe(0);
  });

  it('revokeKey on non-existent id is a no-op', () => {
    const mgr = new SessionKeyManager();
    expect(() => mgr.revokeKey('nope')).not.toThrow();
  });

  it('full lifecycle generate -> register -> get -> revoke', () => {
    const mgr = new SessionKeyManager();
    const key = mgr.generateKey();
    mgr.registerKey('full', key);
    expect(mgr.getKey('full')).toBe(key);
    mgr.revokeKey('full');
    expect(mgr.getKey('full')).toBeUndefined();
  });

  it('concurrent sandboxes receive distinct keys', async () => {
    // ensure no leftover keys
    try { sessionKeyManager.revokeKey('s1'); } catch {};
    try { sessionKeyManager.revokeKey('s2'); } catch {};

    const provider = {
      execWithStdin: async () => ({ stdout: '', stderr: '', exitCode: 0 }),
      exec: async () => ({ stdout: '', stderr: '', exitCode: 0 }),
    } as any;
    const fsManager = { sync: async () => {} } as any;

    const preflight = new PreflightService(provider, fsManager);

    await Promise.all([
      preflight.runPreflight('s1', { projectRoot: '', task: {}, mcpConfig: {}, secrets: {} } as any),
      preflight.runPreflight('s2', { projectRoot: '', task: {}, mcpConfig: {}, secrets: {} } as any),
    ]);

    const k1 = sessionKeyManager.getKey('s1')?.toString('hex');
    const k2 = sessionKeyManager.getKey('s2')?.toString('hex');

    expect(k1).toBeDefined();
    expect(k2).toBeDefined();
    expect(k1).not.toBe(k2);

    // cleanup
    try { sessionKeyManager.revokeKey('s1'); } catch {};
    try { sessionKeyManager.revokeKey('s2'); } catch {};
  });
});
