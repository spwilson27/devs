import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SandboxOrchestrator } from '../orchestrator/SandboxOrchestrator';
import type { SandboxProvider } from '../SandboxProvider';

// Minimal mocks to test lifecycle sequencing and sandboxId uniqueness

describe('@devs/sandbox - SandboxOrchestrator', () => {
  it('generates a unique sandboxId for each run and calls provider.create once per run', async () => {
    // simple mock provider
    const created: string[] = [];
    const mockProvider: any = {
      create: vi.fn(async (id: string) => { created.push(id); return { id }; }),
      exec: vi.fn(async () => ({ success: true })),
    };

    const mockPreflight: any = { runPreflight: vi.fn(async () => true) };
    const mockCleanup: any = { teardown: vi.fn(async () => {}) };
    const mockSessionKey: any = { registerKey: vi.fn(async () => {}), revokeKey: vi.fn(async () => {}) };
    const mockInjector: any = { inject: vi.fn(async () => {}) };
    const mockSanitizer: any = { sanitize: (env: any) => ({}) };

    const orch = new SandboxOrchestrator({
      provider: mockProvider,
      preflight: mockPreflight,
      cleanup: mockCleanup,
      sessionKeyManager: mockSessionKey,
      secretInjector: mockInjector,
      environmentSanitizer: mockSanitizer,
    } as any);

    const r1 = await orch.runTask({ name: 't1' } as any, {} as any);
    const r2 = await orch.runTask({ name: 't2' } as any, {} as any);

    expect(created.length).toBe(2);
    expect(created[0]).not.toBe(created[1]);
    expect(mockProvider.create).toHaveBeenCalledTimes(2);
  });

  it('executes lifecycle in order and calls teardown with success', async () => {
    const calls: string[] = [];
    const mockProvider: any = {
      create: vi.fn(async (id: string) => { calls.push('create'); return { id }; }),
      exec: vi.fn(async () => { calls.push('exec'); return { success: true }; }),
    };
    const mockPreflight: any = { runPreflight: vi.fn(async () => { calls.push('preflight'); return true; }) };
    const mockCleanup: any = { teardown: vi.fn(async (_id: string, opts: any) => { calls.push(`cleanup(${opts.outcome})`); }) };
    const mockSessionKey: any = { registerKey: vi.fn(async () => { calls.push('register'); }), revokeKey: vi.fn(async () => { calls.push('revoke'); }) };
    const mockInjector: any = { inject: vi.fn(async () => { calls.push('inject'); }) };
    const mockSanitizer: any = { sanitize: (env: any) => ({}) };

    const orch = new SandboxOrchestrator({
      provider: mockProvider,
      preflight: mockPreflight,
      cleanup: mockCleanup,
      sessionKeyManager: mockSessionKey,
      secretInjector: mockInjector,
      environmentSanitizer: mockSanitizer,
    } as any);

    const res = await orch.runTask({ name: 'ordered' } as any, {} as any);
    expect(res.success).toBe(true);
    expect(calls).toEqual(['create','register','preflight','inject','exec','cleanup(success)','revoke']);
  });

  it('on preflight failure does not call exec and teardown marks failure', async () => {
    const calls: string[] = [];
    const mockProvider: any = { create: vi.fn(async (id: string) => { calls.push('create'); return { id }; }), exec: vi.fn(async () => { calls.push('exec'); return { success: true }; }) };
    const mockPreflight: any = { runPreflight: vi.fn(async () => { calls.push('preflight'); throw new Error('preflight fail'); }) };
    const mockCleanup: any = { teardown: vi.fn(async (_id: string, opts: any) => { calls.push(`cleanup(${opts.outcome})`); }) };
    const mockSessionKey: any = { registerKey: vi.fn(async () => { calls.push('register'); }), revokeKey: vi.fn(async () => { calls.push('revoke'); }) };
    const mockInjector: any = { inject: vi.fn(async () => { calls.push('inject'); }) };
    const mockSanitizer: any = { sanitize: (env: any) => ({}) };

    const orch = new SandboxOrchestrator({
      provider: mockProvider,
      preflight: mockPreflight,
      cleanup: mockCleanup,
      sessionKeyManager: mockSessionKey,
      secretInjector: mockInjector,
      environmentSanitizer: mockSanitizer,
    } as any);

    const res = await orch.runTask({ name: 'pfail' } as any, {} as any);
    expect(res.success).toBe(false);
    expect(calls).toEqual(['create','register','preflight','cleanup(failure)','revoke']);
    expect(mockProvider.exec).not.toHaveBeenCalled();
  });

});
