# CONSTRAINTS

## Hard constraints

- Must not bundle Docker SDK at the package level; drivers inject it via dependency injection.
- Must not expose host filesystem paths outside the designated `workdir`.
- All exported functions must be pure or side-effect free at the `src/utils/` level.
- TypeScript `strict` mode must never be disabled.
- Coverage threshold must be maintained at ≥80% lines.
