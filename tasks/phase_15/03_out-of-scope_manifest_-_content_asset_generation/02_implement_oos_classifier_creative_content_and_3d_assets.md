# Task: Implement OOS Request Classifier for Creative Content & 3D Asset Domains (Sub-Epic: 03_Out-of-Scope Manifest - Content & Asset Generation)

## Covered Requirements
- [1_PRD-REQ-OOS-003], [1_PRD-REQ-OOS-017]

## 1. Initial Test Written

- [ ] In `src/oos/__tests__/contentAssetClassifier.test.ts`, write a test suite `ContentAssetOOSClassifier` that:
  - Imports `classifyContentAssetRequest(input: string): OOSClassificationResult | null` from `src/oos/classifiers/contentAssetClassifier.ts`.
  - Imports the `OOSClassificationResult` type from `src/oos/types.ts`.
  - **OOS-003 — Creative Asset & Marketing Content (positive cases):** asserts that the following inputs each return a non-null `OOSClassificationResult` with `matchedEntryId === "1_PRD-REQ-OOS-003"`:
    - `"Generate a logo for my startup"`
    - `"Create a brand identity kit with color palette"`
    - `"Write marketing copy for our launch campaign"`
    - `"Design a social media graphic for Twitter"`
    - `"Produce an advertisement slogan"`
    - `"Create a mascot for our app"`
  - **OOS-017 — 3D Modeling & Game Assets (positive cases):** asserts that the following inputs each return a non-null `OOSClassificationResult` with `matchedEntryId === "1_PRD-REQ-OOS-017"`:
    - `"Generate a 3D model of a spaceship in FBX format"`
    - `"Create a normal map texture for a stone wall"`
    - `"Export a Unity prefab for the player character"`
    - `"Design a game map for the first level"`
    - `"Create a rigged animation for my character"`
    - `"Generate a glTF asset for my web 3D scene"`
  - **Negative cases:** asserts that the following inputs return `null` (i.e., they are NOT flagged as OOS):
    - `"Generate a React component for the landing page"`
    - `"Create a REST API endpoint for user registration"`
    - `"Write unit tests for the authentication module"`
    - `"Scaffold a new Next.js project"`
    - `"Set up a CI pipeline with GitHub Actions"`
  - Asserts that `OOSClassificationResult` contains `{ matchedEntryId: string, matchedKeyword: string, entryName: string, category: string }`.
  - Asserts the function is **case-insensitive** (e.g., `"GENERATE A LOGO"` matches OOS-003).

## 2. Task Implementation

- [ ] Add the `OOSClassificationResult` interface to `src/oos/types.ts`:
  ```typescript
  export interface OOSClassificationResult {
    matchedEntryId: string;
    matchedKeyword: string;
    entryName: string;
    category: string;
  }
  ```
- [ ] Create `src/oos/classifiers/contentAssetClassifier.ts`:
  - Import `getOOSEntries` from `../oosManifestLoader`.
  - Implement `classifyContentAssetRequest(input: string): OOSClassificationResult | null`:
    1. Normalize `input` to lowercase.
    2. Filter `getOOSEntries()` to only entries with `id` in `["1_PRD-REQ-OOS-003", "1_PRD-REQ-OOS-017"]`.
    3. For each filtered entry, iterate its `keywords` array. For each keyword, check if the normalized input includes the keyword (substring match).
    4. On first match, return an `OOSClassificationResult` with the entry's `id`, `name`, `category`, and the matched keyword.
    5. If no keyword matches across both entries, return `null`.
  - The function must be **pure** (no side effects beyond calling `getOOSEntries()`).
- [ ] Create `src/oos/classifiers/index.ts` as a barrel export that re-exports `classifyContentAssetRequest` from `./contentAssetClassifier`.

## 3. Code Review

- [ ] Verify that `classifyContentAssetRequest` does not mutate the manifest entries or perform any I/O beyond what `getOOSEntries()` does.
- [ ] Confirm that keyword matching uses substring (`.includes`) and not exact word boundary matching, to maximize recall (this is intentional — false positives are acceptable over false negatives for OOS guarding).
- [ ] Confirm that the OOS-003 and OOS-017 entries are the only entries the classifier inspects — do not allow scope creep into other OOS categories.
- [ ] Confirm that the barrel `src/oos/classifiers/index.ts` is the canonical import path for all classifier functions.
- [ ] Verify that TypeScript strict mode (`"strict": true`) produces no errors in the classifier files.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/oos/__tests__/contentAssetClassifier.test.ts --coverage` from the repository root.
- [ ] Confirm all positive and negative test cases pass with 0 failures.
- [ ] Confirm line coverage for `src/oos/classifiers/contentAssetClassifier.ts` is ≥ 95%.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a section to `src/oos/README.agent.md` titled `## Classifiers` documenting:
  - The purpose of `classifyContentAssetRequest`.
  - The two requirement IDs it covers (OOS-003, OOS-017).
  - Example call signature and return type.
  - A note that `null` means the request is NOT in this OOS category.
- [ ] Add JSDoc comments to `classifyContentAssetRequest` in the source file explaining parameters, return value, and the keyword-matching strategy used.

## 6. Automated Verification

- [ ] Run the following and confirm exit code `0`:
  ```bash
  npx jest src/oos/__tests__/contentAssetClassifier.test.ts --ci --passWithNoTests=false
  ```
- [ ] Run this inline smoke test confirming correct classification:
  ```bash
  node -e "
  const { classifyContentAssetRequest } = require('./dist/oos/classifiers/contentAssetClassifier');
  const r1 = classifyContentAssetRequest('generate a logo for my app');
  if (!r1 || r1.matchedEntryId !== '1_PRD-REQ-OOS-003') { console.error('FAIL OOS-003'); process.exit(1); }
  const r2 = classifyContentAssetRequest('create a 3d model in gltf format');
  if (!r2 || r2.matchedEntryId !== '1_PRD-REQ-OOS-017') { console.error('FAIL OOS-017'); process.exit(1); }
  const r3 = classifyContentAssetRequest('write a React component');
  if (r3 !== null) { console.error('FAIL false positive'); process.exit(1); }
  console.log('PASS');
  "
  ```
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
