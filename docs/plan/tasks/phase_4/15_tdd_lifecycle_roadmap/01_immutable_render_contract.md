# Task: Immutable Render Contract Enforcement (Sub-Epic: 15_TDD Lifecycle Roadmap)

## Covered Requirements
- [AC-RLOOP-001]

## Dependencies
- depends_on: []
- shared_components: [devs-tui]

## 1. Initial Test Written
- [ ] Create a "negative" compilation test in `crates/devs-tui/tests/compile_fail/render_mutation.rs` (using the `trybuild` crate if available, or a standard rustc-based check).
- [ ] The test should attempt to call a method that takes `&mut self` on `AppState` from within a function that is passed a `&AppState` (simulating the `render` call).
- [ ] Example test code:
  ```rust
  use devs_tui::state::AppState;
  fn mock_render(state: &AppState) {
      state.some_mutating_method(); // This must fail to compile
  }
  ```
- [ ] Verify that the test fails to compile with an error indicating that `state` is a shared reference and cannot be mutated.

## 2. Task Implementation
- [ ] Audit the `render` method signature in `crates/devs-tui/src/app.rs` and all widget `render` methods in `crates/devs-tui/src/widgets/`.
- [ ] Ensure every `render` method takes `&self` (or `state: &AppState`) and never `&mut self`.
- [ ] If any mutation is currently happening during render (e.g., caching, lazy initialization), refactor it to happen in the `update` or `dispatch` phase instead.
- [ ] Ensure that `ratatui::Frame` is used correctly as a write-only sink for rendering, not for state modification.

## 3. Code Review
- [ ] Verify that no `RefCell`, `Mutex`, or `Atomic` types are used within `AppState` to bypass the immutability contract during the render phase.
- [ ] Check that all sub-widgets follow the same pattern of taking immutable references to state.
- [ ] Ensure that the `render` method is marked with `#[must_use]` or similar if appropriate, though strictly not required by the AC.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-tui` to ensure existing tests pass.
- [ ] Run the compilation-fail test suite: `cargo test --test compile_fail` (or equivalent).

## 5. Update Documentation
- [ ] Add a comment to the `render` method in `app.rs` explicitly mentioning `[AC-RLOOP-001]` and the immutability requirement.
- [ ] Update the `devs-tui` README or internal docs to reflect this architectural invariant.

## 6. Automated Verification
- [ ] Run `./do lint` to ensure no clippy warnings related to unnecessary mutability are introduced.
- [ ] Verify that `cargo build -p devs-tui` completes successfully after the changes.
