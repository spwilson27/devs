export const DEFAULT_SENSITIVE_KEY_PATTERNS: RegExp[] = [
  /(?:AWS_.*|GITHUB_TOKEN|NPM_TOKEN|OPENAI_API_KEY|GCP_SERVICE_ACCOUNT_KEY|AZURE_CLIENT_SECRET|DATABASE_URL|PGPASSWORD)/i,
  /(KEY|TOKEN|SECRET|PASSWORD|CREDENTIAL|CERT|PRIVATE)/i,
];

export interface EnvironmentSanitizerOptions {
  additionalDenylist?: string[];
}

export class EnvironmentSanitizer {
  private denylist: Set<string>;

  constructor(opts?: EnvironmentSanitizerOptions) {
    this.denylist = new Set((opts?.additionalDenylist ?? []).map(String));
  }

  sanitize(env: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
    if (!env || Object.keys(env).length === 0) return {};
    const out: NodeJS.ProcessEnv = {};
    for (const k of Object.keys(env)) {
      const isDenied = this.denylist.has(k) || DEFAULT_SENSITIVE_KEY_PATTERNS.some((p) => p.test(k));
      if (isDenied) {
        try {
          console.info(JSON.stringify({ event: 'env_key_stripped', key: k }));
        } catch (_) {
          // swallow logging errors
        }
        continue;
      }
      out[k] = env[k];
    }
    return out;
  }
}
