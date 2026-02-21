# Task: Define Global State Schema and Tiered Architecture (Sub-Epic: 06_Global_State_Tiers)

## Covered Requirements
- [6_UI_UX_ARCH-REQ-040], [6_UI_UX_ARCH-REQ-041], [6_UI_UX_ARCH-REQ-042], [6_UI_UX_ARCH-REQ-043]

## 1. Initial Test Written
- [ ] Create a unit test `packages/vscode/src/state/__tests__/state.types.test.ts` to verify that all required TypeScript interfaces and enums exist and satisfy the architecture's tiered structure.
- [ ] Assert that the `StateTiers` enum contains `TIER_0`, `TIER_1`, `TIER_2`, and `TIER_3`.
- [ ] Assert that `LayoutState`, `ProjectMirrorState`, and `UserPreferences` interfaces are defined with the expected properties (e.g., `activeTab` for Tier 1, `tasks` record for Tier 2, `theme` for Tier 3).

## 2. Task Implementation
- [ ] Create `packages/vscode/src/state/types.ts` to house the global state type definitions.
- [ ] Define `StateTiers` enum mapping each tier to its description (Ephemeral, Volatile, Source of Truth, Host-Level).
- [ ] Define `Tier1LayoutStore` interface: `activeView: 'DASHBOARD' | 'RESEARCH' | 'SPEC' | 'ROADMAP' | 'CONSOLE'`, `zoomLevel: number`, `pan: { x: number, y: number }`.
- [ ] Define `Tier2ProjectStore` interface: Normalized records for `tasks`, `requirements`, `epics`, and `documents` to mirror the SQLite schema.
- [ ] Define `Tier3PreferencesStore` interface: `themeOverride: string`, `onboardingComplete: boolean`, `preferredLayout: string`.
- [ ] Ensure all types are exported and follow strict TypeScript standards.

## 3. Code Review
- [ ] Verify that the normalized structure for Tier 2 (Project Mirror) uses `Record<ID, T>` to facilitate O(1) lookups by ID.
- [ ] Ensure the naming conventions strictly match the `state.sqlite` schema to simplify hydration logic.
- [ ] Confirm no circular dependencies are introduced in the type definitions.

## 4. Run Automated Tests to Verify
- [ ] Execute `pnpm test` in the `packages/vscode` directory to ensure the type-checking tests pass.

## 5. Update Documentation
- [ ] Update `packages/vscode/README.md` to document the state management architecture and how each tier is used.
- [ ] Update the agent's memory (AOD) with the new state structure in `.agent/vscode/state-architecture.md`.

## 6. Automated Verification
- [ ] Run `tsc --noEmit` in `packages/vscode` to ensure no type errors exist in the newly created definitions.
