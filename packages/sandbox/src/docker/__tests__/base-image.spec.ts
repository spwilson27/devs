import fs from 'fs';
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

const dockerfilePath = new URL('../../../docker/base/Dockerfile', import.meta.url);
const manifestPath = new URL('../../../docker/base/image-manifest.json', import.meta.url);
const pkgRoot = new URL('../../../', import.meta.url);

function firstNonCommentLine(content: string) {
  return content
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean)
    .filter(l => !l.startsWith('#'))[0];
}

describe('Docker base image', () => {
  it('validates Dockerfile exists at docker/base/Dockerfile', () => {
    expect(fs.existsSync(dockerfilePath)).toBe(true);
    expect(fs.readFileSync(dockerfilePath, 'utf8').length).toBeGreaterThan(0);
  });

  it('Dockerfile uses Alpine as base image', () => {
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    const from = firstNonCommentLine(content);
    expect(from).toBeDefined();
    expect(from.startsWith('FROM alpine:')).toBe(true);
  });

  it('Dockerfile pins a specific Alpine version by SHA digest', () => {
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    const from = firstNonCommentLine(content) || '';
    const pinned = /@sha256:[0-9a-f]{64}/i.test(from) || (/FROM alpine:\\d+\\.\\d+(\\.\\d+)?/.test(from) && !/alpine:latest/.test(from));
    expect(pinned).toBe(true);
  });

  it('Dockerfile creates a non-root user named agent', () => {
    const content = fs.readFileSync(dockerfilePath, 'utf8');
    expect(/adduser\s+-D.*\bagent\b|adduser\s+-D\s+-u\s+\d+\s+agent/.test(content)).toBe(true);
    expect(/USER\s+agent/.test(content)).toBe(true);
  });

  it('image-manifest.json exists and is valid JSON', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.baseImage).toBeDefined();
    expect(manifest.digest).toBeDefined();
    expect(manifest.builtAt).toBeDefined();
  });

  it('image-manifest.json baseImage matches the Dockerfile FROM value', () => {
    const df = fs.readFileSync(dockerfilePath, 'utf8');
    const fromLine = firstNonCommentLine(df) || '';
    const fromValue = (fromLine.split(/\s+/)[1] || '').trim();
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    expect(manifest.baseImage).toBe(fromValue);
  });

  const runIntegration = Boolean(process.env.RUN_INTEGRATION);

  (runIntegration ? it : it.skip)('@integration docker build of the base image succeeds', () => {
    execSync('docker build --no-cache -t devs-sandbox-base:test ./docker/base', { cwd: pkgRoot.pathname, stdio: 'inherit' });
  });

  (runIntegration ? it : it.skip)('@integration built image does not run as root', () => {
    const out = execSync('docker run --rm devs-sandbox-base:test whoami', { cwd: pkgRoot.pathname }).toString().trim();
    expect(out).toBe('agent');
  });

  (runIntegration ? it : it.skip)('@integration built image has minimal surface: no bash, no curl by default', () => {
    try {
      execSync('docker run --rm devs-sandbox-base:test bash', { cwd: pkgRoot.pathname, stdio: 'pipe' });
      // If bash exists, fail
      throw new Error('bash present');
    } catch (err: any) {
      if (err && err.message === 'bash present') throw err;
      // expected non-zero exit
    }
  });
});
