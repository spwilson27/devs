import { spawn } from 'child_process';
import { it, expect } from 'vitest';
import { SandboxMonitor } from '../SandboxMonitor';

it('@integration SandboxMonitor integration spawns child and kills on breach', async () => {
  const child = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000);']);
  const monitor = new SandboxMonitor({ sandboxId: 'int-s1', processHandle: child as any, detectors: [async () => 'int-breach'], pollIntervalMs: 50 });
  monitor.start();
  // give monitor time to detect and kill
  await new Promise((res) => setTimeout(res, 250));
  monitor.stop();
  // small delay to allow kill to take effect
  await new Promise((res) => setTimeout(res, 50));
  let alive = true;
  try {
    process.kill(child.pid, 0);
  } catch (e) {
    alive = false;
  }
  expect(alive).toBe(false);
});
