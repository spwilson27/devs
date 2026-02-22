#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const ts = require('typescript');

function loadTsAsModule(tsPath) {
  const code = fs.readFileSync(tsPath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019 },
    fileName: tsPath,
  });
  const module = { exports: {} };
  const dirname = path.dirname(tsPath);
  const localRequire = (p) => {
    try {
      // special-case stub for @webcontainer/api so we can exercise exec() compatibility checks without the real dependency
      if (p === '@webcontainer/api') {
        return { WebContainer: { boot: async () => ({ spawn: async () => { throw new Error('spawn should not be called in this check'); }, teardown: async () => {} }) } };
      }
      // if it's a relative import, attempt to load corresponding .ts module via this loader
      if (p.startsWith('.') || p.startsWith('/')) {
        const candidateTs = path.resolve(dirname, p.endsWith('.ts') ? p : p + '.ts');
        if (fs.existsSync(candidateTs)) return loadTsAsModule(candidateTs);
        const candidateIndexTs = path.resolve(dirname, p, 'index.ts');
        if (fs.existsSync(candidateIndexTs)) return loadTsAsModule(candidateIndexTs);
      }
      // fallback to native require for external modules
      return require(p);
    } catch (e) {
      return require(p);
    }
  };
  const func = new Function('module', 'exports', 'require', '__dirname', '__filename', transpiled.outputText + '\n//# sourceURL=' + tsPath);
  func(module, module.exports, localRequire, dirname, tsPath);
  return module.exports;
}

const base = path.join(__dirname, '..', 'src', 'drivers', 'webcontainer');
const matrix = loadTsAsModule(path.join(base, 'runtime-compat-matrix.ts')).RUNTIME_COMPAT_MATRIX;
const { RuntimeCompatibilityChecker } = loadTsAsModule(path.join(base, 'runtime-compat-checker.ts'));
const { NATIVE_PACKAGES, NativeDependencyChecker } = loadTsAsModule(path.join(base, 'native-dependency-checker.ts'));

const checker = new RuntimeCompatibilityChecker();
if (!checker.isRuntimeSupported('node')) throw new Error('expected node supported true');
if (checker.isRuntimeSupported('python3')) throw new Error('expected python3 supported false');
if (checker.isRuntimeSupported('go')) throw new Error('expected go supported false');
if (checker.isRuntimeSupported('rustc')) throw new Error('expected rustc supported false');
const reason = checker.getUnsupportedReason('python3');
if (!reason || typeof reason !== 'string') throw new Error('expected non-empty reason for python3');
if (checker.getFallbackDriver('python3') !== 'docker') throw new Error('expected python3 fallback docker');
if (checker.getFallbackDriver('node') !== null) throw new Error('expected node fallback null');

const ndc = new NativeDependencyChecker();
if (!ndc.requiresNativeCompilation('better-sqlite3')) throw new Error('better-sqlite3 should require native compilation');
if (ndc.requiresNativeCompilation('lodash')) throw new Error('lodash should not require native compilation');
if (!ndc.requiresNativeCompilation('sharp')) throw new Error('sharp should require native compilation');
if (ndc.getAlternative('better-sqlite3') !== 'sql.js') throw new Error('better-sqlite3 alternative sql.js');
if (ndc.getAlternative('sharp') !== null) throw new Error('sharp alternative null');

console.log('syscall-compat checks passed');
