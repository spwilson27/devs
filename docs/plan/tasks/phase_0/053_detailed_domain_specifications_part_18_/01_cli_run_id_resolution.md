# Task: CLI Run Identifier Resolution Logic (Sub-Epic: 053_Detailed Domain Specifications (Part 18))

## Covered Requirements
- [2_TAS-REQ-136]

## Dependencies
- depends_on: []
- shared_components: [devs-core (consumer — uses domain types like `RunId`, `Slug`, `WorkflowRunSummary`)]

## 1. Initial Test Written
- [ ] Create module `crates/devs-core/src/run_resolve.rs` and register it in `lib.rs`.
- [ ] Define `ResolveError` enum with variants:
  - `RunNotFound { query: String }` — no match by UUID or slug.
  - `AmbiguousSlug { slug: String, count: usize }` — slug matches multiple runs.
- [ ] Write the following unit tests (all should fail initially since the function doesn't exist yet):
  - `test_resolve_exact_uuid`: Create 3 mock `RunSummary` structs with known UUIDs and slugs. Pass a valid UUID4 string matching one run. Assert `Ok(run_id)` with the correct UUID returned.
  - `test_resolve_by_slug`: Pass a slug string (not a UUID). Assert the matching run's UUID is returned.
  - `test_uuid_takes_precedence_over_slug`: Construct a scenario where one run's slug is the string representation of another run's UUID. Pass that UUID string. Assert the UUID-matched run is returned, not the slug-matched one.
  - `test_uuid_format_but_not_found_falls_through_to_slug`: Pass a valid UUID4 format string that matches no run by UUID but matches a run by slug. Assert the slug-matched run is returned.
  - `test_slug_not_found`: Pass a string that matches no run by UUID or slug. Assert `ResolveError::RunNotFound` with the query string embedded.
  - `test_ambiguous_slug`: Create 2 runs with the same slug but different UUIDs. Pass that slug. Assert `ResolveError::AmbiguousSlug` with count=2.
  - `test_empty_runs_list`: Pass any query with an empty runs slice. Assert `RunNotFound`.
- [ ] Each test should construct `RunSummary` values inline (no shared fixture) to keep tests independent and readable.

## 2. Task Implementation
- [ ] In `crates/devs-core/src/run_resolve.rs`, define:
  ```rust
  pub struct RunSummary {
      pub run_id: uuid::Uuid,
      pub slug: String,
  }
  ```
  (Or re-use an existing type if one already exists in devs-core with these fields.)
- [ ] Implement `pub fn resolve_run_id(query: &str, runs: &[RunSummary]) -> Result<uuid::Uuid, ResolveError>` with this exact logic:
  1. Attempt `uuid::Uuid::parse_str(query)`. If it parses:
     a. Search `runs` for a match on `run_id`. If found, return it.
     b. If not found, fall through to slug search (do NOT return an error yet).
  2. Filter `runs` where `slug == query`.
  3. If exactly 1 match, return its `run_id`.
  4. If >1 match, return `Err(ResolveError::AmbiguousSlug { slug: query.to_string(), count })`.
  5. If 0 matches, return `Err(ResolveError::RunNotFound { query: query.to_string() })`.
- [ ] Derive `Debug, Clone, PartialEq` on `ResolveError`. Implement `std::fmt::Display` with messages matching the JSON error format from REQ-136:
  - `RunNotFound` → `"run not found: {query}"`
  - `AmbiguousSlug` → `"ambiguous slug: {slug} matches {count} runs"`
- [ ] Implement `std::error::Error` for `ResolveError`.
- [ ] Add `/// Covers: 2_TAS-REQ-136` doc comment on the `resolve_run_id` function.

## 3. Code Review
- [ ] Verify the resolution order: UUID lookup first, then slug lookup, matching REQ-136 steps 1-4 exactly.
- [ ] Verify that a valid UUID format that doesn't match any run by UUID still falls through to slug search (step 2 in REQ-136 says "If UUID lookup returns not-found, look up by slug").
- [ ] Verify that `ResolveError` display messages exactly match the JSON `"error"` field strings specified in REQ-136.
- [ ] Confirm no `unwrap()` or `panic!()` in non-test code.
- [ ] Confirm doc comments are present on all public items.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- run_resolve` and ensure all 7 test cases pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` and ensure zero warnings.

## 5. Update Documentation
- [ ] Add `pub mod run_resolve;` to `crates/devs-core/src/lib.rs` if not already present.
- [ ] Ensure `//! Module-level` doc comment in `run_resolve.rs` describes the resolution algorithm.

## 6. Automated Verification
- [ ] Run `./do lint` — must pass with zero errors.
- [ ] Run `./do test` — must pass; verify the `run_resolve` tests appear in output.
- [ ] Grep for `// Covers: 2_TAS-REQ-136` in test code to confirm traceability annotation exists.
