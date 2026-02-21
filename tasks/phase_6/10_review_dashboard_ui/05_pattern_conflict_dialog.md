# Task: Implement Pattern Conflict Dialog and Resolution Flow (Sub-Epic: 10_Review Dashboard UI)

## Covered Requirements
- [4_USER_FEATURES-REQ-032]

## 1. Initial Test Written
- [ ] Create unit tests at tests/components/PatternConflictDialog.test.tsx and an integration test in tests/components/ReviewDashboard.conflicts.test.tsx that:
  - Render PatternConflictDialog with an array of conflict objects and assert the dialog lists each conflict with severity and suggested fixes.
  - Assert action buttons exist: "Accept suggestion", "Accept with override", "Mark false positive" and that clicking each calls provided callbacks with correct payload.
  - Integration test: simulate ReviewDashboard receiving conflicts (mock conflict detector) and assert dialog opens and blocks final approval until resolved.

## 2. Task Implementation
- [ ] Implement src/components/PatternConflictDialog/index.tsx:
  - Props: { open:boolean, conflicts: Array<{id:string,description:string,severity:'low'|'medium'|'high',suggestions:string[]}>, onResolve:(id,action)=>void, onClose()=>void }.
  - Render accessible dialog (use role="dialog" and aria-modal) with conflict list, inline suggested fixes, and action buttons for each conflict.
  - Integrate with ReviewDashboard state: when conflicts are present, open the dialog and prevent final approval actions until all conflicts are resolved (resolved state tracked per-conflict).

## 3. Code Review
- [ ] Ensure dialog is accessible (focus trap, keyboard navigation), that conflict objects are typed, that the UI clearly explains impact of each resolution action, and that there is an audit log hook (emit events for resolved actions).

## 4. Run Automated Tests to Verify
- [ ] Run npm test -- -t "PatternConflictDialog" and the integration conflict tests; ensure they pass.

## 5. Update Documentation
- [ ] Add docs/ui/pattern_conflict_dialog.md documenting conflict object shape, resolution semantics, and how the ReviewDashboard consumes resolution events.

## 6. Automated Verification
- [ ] Run unit and integration tests and a scripted scenario where a mock conflict is injected and the dialog blocks approval until an explicit resolution is submitted; assert the approval action remains disabled until resolved.