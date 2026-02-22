import { describe, it, expect } from 'vitest';
import { SandboxProvider } from '../SandboxProvider';
import { sandboxContextSchema } from '../schemas';
import type { SandboxContext } from '../types';

class MockSandboxProvider extends SandboxProvider {
  async provision(): Promise<SandboxContext> {
    return { id: 'mock-1', workdir: '/tmp/mock', status: 'running', createdAt: new Date() };
  }

  async exec(ctx: SandboxContext, cmd: string, args: string[], opts?: any) {
    return { stdout: 'hello\n', stderr: '', exitCode: 0, durationMs: 1 };
  }

  async destroy(ctx: SandboxContext) {
    return;
  }
}

describe('SandboxProvider (runtime)', () => {
  it('MockSandboxProvider implements lifecycle', async () => {
    const p = new MockSandboxProvider();
    const ctx = await p.provision();
    const parsed = sandboxContextSchema.parse(ctx);
    expect(parsed.id).toBe(ctx.id);
    const res = await p.exec(ctx, 'echo', ['hello']);
    expect(res.stdout).toContain('hello');
    await expect(p.destroy(ctx)).resolves.toBeUndefined();
  });

  it('SandboxContext.status validation accepts only allowed values', () => {
    expect(() => sandboxContextSchema.parse({ id: '1', workdir: '/w', status: 'running', createdAt: new Date() })).not.toThrow();
    expect(() => sandboxContextSchema.parse({ id: '1', workdir: '/w', status: 'invalid', createdAt: new Date() } as any)).toThrow();
  });
});
