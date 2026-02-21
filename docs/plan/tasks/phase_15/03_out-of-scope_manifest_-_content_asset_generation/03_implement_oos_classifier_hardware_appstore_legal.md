# Task: Implement OOS Request Classifier for Hardware, App Store & Legal Domains (Sub-Epic: 03_Out-of-Scope Manifest - Content & Asset Generation)

## Covered Requirements
- [1_PRD-REQ-OOS-005], [1_PRD-REQ-OOS-006], [1_PRD-REQ-OOS-007]

## 1. Initial Test Written

- [ ] In `src/oos/__tests__/hardwareAppStoreLegalClassifier.test.ts`, write a test suite `HardwareAppStoreLegalOOSClassifier` that:
  - Imports `classifyHardwareAppStoreLegalRequest(input: string): OOSClassificationResult | null` from `src/oos/classifiers/hardwareAppStoreLegalClassifier.ts`.
  - **OOS-005 — Hardware-Specific & Embedded Systems (positive cases):** asserts the following inputs each return a non-null result with `matchedEntryId === "1_PRD-REQ-OOS-005"`:
    - `"Write firmware for the STM32 microcontroller"`
    - `"Generate a HAL driver for the SPI peripheral"`
    - `"Configure FreeRTOS task scheduling"`
    - `"Write a bare metal bootloader for ARM Cortex-M"`
    - `"Generate a JTAG debugging configuration"`
    - `"Create a cross-compilation toolchain setup for FPGA"`
  - **OOS-006 — App Store & Marketplace Submission (positive cases):** asserts the following inputs each return a non-null result with `matchedEntryId === "1_PRD-REQ-OOS-006"`:
    - `"Submit my app to App Store Connect"`
    - `"Upload the AAB to Google Play Console"`
    - `"Manage my provisioning profile for iOS distribution"`
    - `"Automate the IPA upload to TestFlight"`
    - `"Generate the app store listing description"`
    - `"Handle the App Store review submission process"`
  - **OOS-007 — Legal, Regulatory & Compliance Certification (positive cases):** asserts the following inputs each return a non-null result with `matchedEntryId === "1_PRD-REQ-OOS-007"`:
    - `"Certify my app is GDPR compliant"`
    - `"Produce a HIPAA compliance report for my product"`
    - `"Give me legal advice on my data privacy policy"`
    - `"Provide a SOC 2 audit report"`
    - `"Complete a PCI-DSS compliance assessment"`
    - `"Conduct a privacy impact assessment for GDPR"`
  - **Negative cases:** asserts the following return `null`:
    - `"Create a TypeScript module for user authentication"`
    - `"Scaffold a new Express.js API"`
    - `"Write unit tests for the payment service"`
    - `"Set up a Docker container for the web app"`
    - `"Generate a React form component"`
  - Asserts the function is case-insensitive.
  - Asserts that ambiguous inputs like `"Write code that helps users understand GDPR requirements"` do NOT match OOS-007 (this implies a code feature, not a certification request — document this edge case and verify the keyword set is specific enough to avoid false positives).

## 2. Task Implementation

- [ ] Create `src/oos/classifiers/hardwareAppStoreLegalClassifier.ts`:
  - Import `getOOSEntries` from `../oosManifestLoader`.
  - Implement `classifyHardwareAppStoreLegalRequest(input: string): OOSClassificationResult | null`:
    1. Normalize `input` to lowercase.
    2. Filter `getOOSEntries()` to only entries with `id` in `["1_PRD-REQ-OOS-005", "1_PRD-REQ-OOS-006", "1_PRD-REQ-OOS-007"]`.
    3. For each filtered entry, iterate its `keywords` array. On the first keyword found in the normalized input (substring match), return an `OOSClassificationResult`.
    4. Return `null` if no keyword matches.
  - The function must be **pure** with no side effects.
- [ ] Export `classifyHardwareAppStoreLegalRequest` from `src/oos/classifiers/index.ts` barrel file (add alongside the existing export from task 02).
- [ ] Verify that the keywords in `contentAssetGenerationOOS.json` for OOS-007 are specific enough to avoid the false positive case described in the test (e.g., prefer `"gdpr certification"`, `"hipaa certification"`, `"legal advice"` over bare `"gdpr"` or `"hipaa"`). Update the JSON manifest keywords if necessary to pass the negative test.

## 3. Code Review

- [ ] Confirm that `classifyHardwareAppStoreLegalRequest` targets exactly three requirement IDs (OOS-005, OOS-006, OOS-007) and no others.
- [ ] Verify that the keyword lists in the manifest are specific multi-word phrases where needed (especially for OOS-007) to minimize false positives from legitimate code generation requests that happen to mention regulatory terms in passing.
- [ ] Confirm the function is pure and reuses `getOOSEntries()` — no duplicated keyword lists inline in the classifier.
- [ ] Confirm that the barrel export in `src/oos/classifiers/index.ts` remains the single public surface for all classifiers.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/oos/__tests__/hardwareAppStoreLegalClassifier.test.ts --coverage` from the repository root.
- [ ] Confirm all positive and negative test cases pass with 0 failures.
- [ ] Confirm line coverage for `src/oos/classifiers/hardwareAppStoreLegalClassifier.ts` is ≥ 95%.
- [ ] Run the full OOS test suite: `npx jest src/oos/ --coverage` and confirm 0 failures across all test files.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript compilation errors.

## 5. Update Documentation

- [ ] Add a subsection to the `## Classifiers` section in `src/oos/README.agent.md` documenting:
  - The purpose of `classifyHardwareAppStoreLegalRequest`.
  - The three requirement IDs it covers (OOS-005, OOS-006, OOS-007).
  - The rationale for using multi-word keyword phrases for OOS-007 to minimize false positives.
  - Example call signatures and return values.
- [ ] Add JSDoc comments to `classifyHardwareAppStoreLegalRequest` in the source file.

## 6. Automated Verification

- [ ] Run the following and confirm exit code `0`:
  ```bash
  npx jest src/oos/__tests__/hardwareAppStoreLegalClassifier.test.ts --ci --passWithNoTests=false
  ```
- [ ] Run this inline smoke test:
  ```bash
  node -e "
  const { classifyHardwareAppStoreLegalRequest } = require('./dist/oos/classifiers/hardwareAppStoreLegalClassifier');
  const r1 = classifyHardwareAppStoreLegalRequest('write firmware for stm32 microcontroller');
  if (!r1 || r1.matchedEntryId !== '1_PRD-REQ-OOS-005') { console.error('FAIL OOS-005'); process.exit(1); }
  const r2 = classifyHardwareAppStoreLegalRequest('submit app to app store connect');
  if (!r2 || r2.matchedEntryId !== '1_PRD-REQ-OOS-006') { console.error('FAIL OOS-006'); process.exit(1); }
  const r3 = classifyHardwareAppStoreLegalRequest('certify my app is gdpr compliant');
  if (!r3 || r3.matchedEntryId !== '1_PRD-REQ-OOS-007') { console.error('FAIL OOS-007'); process.exit(1); }
  const r4 = classifyHardwareAppStoreLegalRequest('create a typescript api endpoint');
  if (r4 !== null) { console.error('FAIL false positive'); process.exit(1); }
  console.log('PASS');
  "
  ```
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
