import * as child_process from 'child_process';

export function spawnProc(command: string, options?: any) {
  return (child_process as any).spawn(command, options);
}
import pidusage from 'pidusage';

export interface MonitoredShellOptions {
  rssLimitBytes?: number;
  cpuSustainedMs?: number;
  pollIntervalMs?: number;
}

export class ResourceLimitExceededError extends Error {
  constructor(
    public pid: number,
    public reason: 'rss' | 'cpu',
    public value: number,
    public limit: number
  ) {
    super(`Process ${pid} exceeded ${reason} limit: ${value} > ${limit}`);
    this.name = 'ResourceLimitExceededError';
  }
}

export async function runShellMonitored(
  command: string,
  opts: MonitoredShellOptions = {}
): Promise<{ exitCode: number | null; stdout: string; stderr: string }> {
  const rssLimitBytes = opts.rssLimitBytes ?? 4 * 1024 ** 3;
  const cpuSustainedMs = opts.cpuSustainedMs ?? 10_000;
  const pollIntervalMs = opts.pollIntervalMs ?? 1_000;

  const child = spawnProc(command, { shell: true });

  let stdout = '';
  let stderr = '';

  if (child.stdout) child.stdout.on('data', (d: Buffer | string) => (stdout += d.toString()));
  if (child.stderr) child.stderr.on('data', (d: Buffer | string) => (stderr += d.toString()));

  let interval: NodeJS.Timeout | null = null;
  let cpuOverCount = 0;
  let settled = false;

  const stopInterval = () => {
    if (interval) {
      clearTimeout(interval);
      interval = null;
    }
  };

  return new Promise((resolve, reject) => {
    const onExit = (code: number | null) => {
      if (settled) return;
      settled = true;
      stopInterval();
      resolve({ exitCode: code, stdout, stderr });
    };
    const onError = (err: any) => {
      if (settled) return;
      settled = true;
      stopInterval();
      reject(err);
    };

    child.on('exit', (code: number | null) => onExit(code));
    child.on('error', onError);

    const schedulePoll = () => {
      interval = setTimeout(() => {
        const pid = child.pid as number;
        // schedule next poll now to mimic setInterval semantics
        if (!settled) schedulePoll();
        (pidusage as any)(pid)
          .then((stats: { cpu: number; memory: number }) => {
            try {
              if (stats.memory > rssLimitBytes) {
                stopInterval();
                try {
                  child.kill('SIGKILL');
                } catch (e) {
                  // ignore
                }
                settled = true;
                reject(new ResourceLimitExceededError(pid, 'rss', stats.memory, rssLimitBytes));
                return;
              }

              if (stats.cpu >= 100) {
                cpuOverCount++;
                if (cpuOverCount * pollIntervalMs >= cpuSustainedMs) {
                  stopInterval();
                  try {
                    child.kill('SIGKILL');
                  } catch (e) {}
                  settled = true;
                  reject(new ResourceLimitExceededError(pid, 'cpu', stats.cpu, 100));
                  return;
                }
              } else {
                cpuOverCount = 0;
              }
            } catch (err) {
              // ignore sampling errors
            }
          })
          .catch(() => {
            // ignore sampling errors
          });
      }, pollIntervalMs);
    };

    // start periodic polling after the first interval
    schedulePoll();
  });
}
