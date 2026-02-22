// Compile-time type tests using tsd (run with `pnpm --filter @devs/sandbox run type:test`).
import { expectType, expectError } from 'tsd';
import type { SandboxContext, ExecOptions, ExecResult, SandboxStatus } from '../types';

expectType<SandboxContext>({ id: 'id', workdir: '/tmp', status: 'running', createdAt: new Date() });
expectType<ExecOptions>({ timeoutMs: 1000, env: { FOO: 'bar' }, cwd: '/tmp' });
expectType<ExecResult>({ stdout: 'a', stderr: '', exitCode: 0, durationMs: 10 });
expectType<SandboxStatus>('running');
expectError<SandboxStatus>('invalid' as unknown as SandboxStatus);
