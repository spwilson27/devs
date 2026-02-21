# Task: Economic Viability Reports & Simulation (Sub-Epic: 29_8_RISKS)

## Covered Requirements
- [8_RISKS-REQ-132]

## 1. Initial Test Written
- [ ] Create tests at tests/billing/report.spec.ts that feed synthetic billing records into the report generator and assert the produced CSV/JSON includes columns: `taskId`, `feature`, `totalCostCents`, `calls`, `avgCostPerCallCents`, and a `viabilityFlag` when cost-per-feature exceeds an expected threshold.

## 2. Task Implementation
- [ ] Implement `scripts/generate-viability-report.js` which:
  - Connects to the billing persistence store (SQLite DB used by budget-monitor) and aggregates usage by `feature` and `taskId` for a configurable window (default 30 days).
  - Produces both CSV and JSON outputs in `reports/economic-viability-<YYYYMMDD>.csv`.
  - Computes simple viability heuristics (cost-per-feature, calls-per-feature, projected monthly cost) and marks records with flags when thresholds are exceeded.
- [ ] Add a GitHub Actions workflow `/.github/workflows/viability-report.yml` (or extend CI) to run the report on a schedule and upload artifacts.

## 3. Code Review
- [ ] Ensure deterministic sorting in the report, no PII or secrets included, and proper rounding/units for costs.
- [ ] Validate that the script can run offline with a local sample DB for testing.

## 4. Run Automated Tests to Verify
- [ ] Run `node scripts/generate-viability-report.js --input tests/fixtures/billing.db --output /tmp/report.json` and assert schema and flags match expected test fixtures.

## 5. Update Documentation
- [ ] Add `docs/reports/economic-viability.md` describing the report fields, thresholds, and how to interpret the `viabilityFlag`.

## 6. Automated Verification
- [ ] CI scheduled job runs the report and archives the artifact. Add a smoke-check script `scripts/check-viability-report.sh` that validates the CSV header and that at least one record is present when DB contains data.
