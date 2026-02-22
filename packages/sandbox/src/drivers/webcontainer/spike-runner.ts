/**
 * spike-runner.ts
 * Simple runnable script to execute the compatibility probe in a headless environment
 * and write results to spike-results/*.json. This file is excluded from the production
 * TypeScript build via tsconfig.json exclude.
 */

import { writeFileSync, mkdirSync } from 'fs';
import { WebContainer } from '@webcontainer/api';
import { runCompatibilityProbe } from './compatibility-probe';

(async function main() {
  try {
    // Boot a WebContainer instance (if available in the environment).
    // The actual boot may require a browser context (Playwright) in CI; this script
    // serves as a runnable entrypoint for local experimental runs.
    const wc = await (WebContainer as any).boot();
    const report = await runCompatibilityProbe(wc as any);
    const outDir = 'spike-results';
    mkdirSync(outDir, { recursive: true });
    const outPath = `${outDir}/webcontainer-compat-${Date.now()}.json`;
    writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf8');
    // eslint-disable-next-line no-console
    console.log('Wrote', outPath);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Spike failed:', err);
    process.exitCode = 1;
  }
})();
