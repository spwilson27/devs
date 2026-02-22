#!/usr/bin/env node
import { runValidateAll } from '../dist/scripts/validate-all.js';
const skipIntegration = process.argv.includes('--skip-integration');
try {
  const report = runValidateAll({ skipIntegration });
  console.log(`\n✅ All ${report.steps.length} validation steps passed in ${report.totalDurationMs}ms\n`);
  report.steps.forEach(s => console.log(`  [${s.name}] ${s.durationMs}ms`));
  process.exit(0);
} catch (e) {
  console.error(`\n❌ Validation FAILED at step [${e.step}] (exit ${e.exitCode})`);
  if (e.stdout) console.error('STDOUT:\n' + e.stdout);
  if (e.stderr) console.error('STDERR:\n' + e.stderr);
  process.exit(e.exitCode ?? 1);
}
