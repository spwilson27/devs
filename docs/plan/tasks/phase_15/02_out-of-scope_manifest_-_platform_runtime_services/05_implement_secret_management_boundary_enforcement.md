# Task: Implement Secret Management Boundary Enforcement (Sub-Epic: 02_Out-of-Scope Manifest - Platform & Runtime Services)

## Covered Requirements
- [1_PRD-REQ-OOS-015]

## 1. Initial Test Written
- [ ] In `src/guards/__tests__/secret-vault-boundary.guard.test.ts`, write unit tests covering:
  - `SecretVaultBoundaryGuard.validate(request)` returns a `BoundaryViolation` with `requirementId: "1_PRD-REQ-OOS-015"` when `request.intent` contains signals: `"manage secrets"`, `"rotate secret"`, `"vault"`, `"hashicorp"`, `"secret store"`, `"provision credentials"`, `"secret management"`.
  - `SecretVaultBoundaryGuard.validate(request)` returns `null` for benign intents such as `"generate project"`, `"read environment variable"`, `"run phase"`.
  - The returned violation's `message` explicitly states that `devs` reads secrets from environment variables only, and its `suggestedAction` recommends using an external vault (e.g., HashiCorp Vault, AWS Secrets Manager) and injecting values as environment variables.
- [ ] In `src/config/__tests__/secret-access.config.test.ts`, write tests that:
  - Verify `SecretsAccessor.get(key)` reads from `process.env[key]` and returns the value, or throws `MissingSecretError` if the key is absent.
  - Verify `SecretsAccessor.set(key, value)` throws `SecretMutationNotSupportedError` with `requirementId: "1_PRD-REQ-OOS-015"` — `devs` must never write or rotate secrets.
  - Verify `SecretsAccessor.delete(key)` throws `SecretMutationNotSupportedError`.
  - Verify `SecretsAccessor.list()` throws `SecretMutationNotSupportedError` (no enumeration of secrets beyond what the agent explicitly requests by key).

## 2. Task Implementation
- [ ] Create `src/errors/secret-mutation-not-supported.error.ts`:
  ```typescript
  export class SecretMutationNotSupportedError extends Error {
    public readonly requirementId = '1_PRD-REQ-OOS-015';
    constructor(operation: string) {
      super(
        `Secret operation "${operation}" is not supported by devs (1_PRD-REQ-OOS-015). ` +
        `devs reads secrets from environment variables only. Use an external vault and inject secrets as env vars.`
      );
      this.name = 'SecretMutationNotSupportedError';
    }
  }
  ```
- [ ] Create `src/errors/missing-secret.error.ts`:
  ```typescript
  export class MissingSecretError extends Error {
    constructor(key: string) {
      super(`Required secret "${key}" is not set in the environment.`);
      this.name = 'MissingSecretError';
    }
  }
  ```
- [ ] Create `src/config/secrets-accessor.ts`:
  ```typescript
  import { SecretMutationNotSupportedError } from '../errors/secret-mutation-not-supported.error';
  import { MissingSecretError } from '../errors/missing-secret.error';

  export class SecretsAccessor {
    get(key: string): string {
      const value = process.env[key];
      if (value === undefined) throw new MissingSecretError(key);
      return value;
    }
    set(_key: string, _value: string): never {
      throw new SecretMutationNotSupportedError('set');
    }
    delete(_key: string): never {
      throw new SecretMutationNotSupportedError('delete');
    }
    list(): never {
      throw new SecretMutationNotSupportedError('list');
    }
  }

  export const secretsAccessor = new SecretsAccessor();
  ```
- [ ] Create `src/guards/secret-vault-boundary.guard.ts`:
  - Define `VAULT_INTENT_SIGNALS: string[]`.
  - Implement `SecretVaultBoundaryGuard.validate(request: OrchestratorRequest): BoundaryViolation | null` checking intent signals.
  - Violation `suggestedAction`: `"Use an external secrets manager (e.g., HashiCorp Vault, AWS Secrets Manager, 1Password) and inject secrets as environment variables."`.
  - Export singleton: `export const secretVaultBoundaryGuard = new SecretVaultBoundaryGuard()`.
- [ ] Register `SecretVaultBoundaryGuard` in the orchestrator's request validation pipeline.
- [ ] Audit all existing usages of `process.env` across the codebase and replace any direct access that could bypass `SecretsAccessor` with calls to `secretsAccessor.get(key)`. (Limit scope to keys considered secrets: API keys, tokens, passwords — not `NODE_ENV`, `PORT`, etc.)

## 3. Code Review
- [ ] Verify that `SecretsAccessor.get()` never logs the secret value — it must not appear in any log output.
- [ ] Verify that `SecretMutationNotSupportedError` and `MissingSecretError` are exported from `src/errors/index.ts`.
- [ ] Verify that no other module in `src/` directly calls `process.env` for secret keys — enforce via ESLint rule `no-restricted-syntax` targeting `process.env['API_KEY']` patterns if possible, or document as a manual audit step.
- [ ] Verify that `SecretsAccessor` is a class (not a plain object) to allow mocking in tests via `jest.spyOn`.
- [ ] Verify TypeScript strict mode with no `any`.

## 4. Run Automated Tests to Verify
- [ ] Run `npx jest src/guards/__tests__/secret-vault-boundary.guard.test.ts src/config/__tests__/secret-access.config.test.ts --coverage` and confirm all tests pass with 100% branch coverage on `SecretsAccessor`.
- [ ] Run `npm test` to confirm no regressions.

## 5. Update Documentation
- [ ] Create `src/config/secrets-accessor.agent.md` documenting: the read-only contract, `MissingSecretError`, `SecretMutationNotSupportedError`, and instructions to add new required secrets (add to `.env.example` and call `secretsAccessor.get('MY_KEY')` at startup for early failure).
- [ ] Update `docs/architecture/boundary-guards.md` with a row for `SecretVaultBoundaryGuard`.
- [ ] Add a section `## Secret Management Policy` to `docs/security/secrets.md` (create if absent) documenting: the env-var-only approach, the prohibition on vault management, and recommended external tools for users who need a vault.
- [ ] Update `.env.example` (create if absent) with all required secret environment variable keys and placeholder values.

## 6. Automated Verification
- [ ] Run the following smoke test:
  ```bash
  npx ts-node -e "
  import { SecretsAccessor } from './src/config/secrets-accessor';
  import { SecretMutationNotSupportedError } from './src/errors/secret-mutation-not-supported.error';
  const sa = new SecretsAccessor();
  try { sa.set('KEY', 'val'); process.exit(1); } catch(e) { if (!(e instanceof SecretMutationNotSupportedError)) process.exit(1); }
  try { sa.delete('KEY'); process.exit(1); } catch(e) { if (!(e instanceof SecretMutationNotSupportedError)) process.exit(1); }
  try { sa.list(); process.exit(1); } catch(e) { if (!(e instanceof SecretMutationNotSupportedError)) process.exit(1); }
  console.log('SecretVaultBoundary: PASS');
  "
  ```
  Confirm exit code 0 and output `SecretVaultBoundary: PASS`.
