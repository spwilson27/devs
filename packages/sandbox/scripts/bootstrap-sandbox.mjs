#!/usr/bin/env node
import { bootstrapSandbox } from '../dist/scripts/bootstrap-sandbox.js';
const driver = process.argv[2] ?? 'docker';
bootstrapSandbox({ driver })
  .then(r => { console.log(`Bootstrap OK (${r.driver}) in ${r.durationMs}ms`); process.exit(0); })
  .catch(e => { console.error(`Bootstrap FAILED: ${e.message}`); process.exit(1); });
