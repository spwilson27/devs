# Task: Define OOS Manifest Schema, Core Data Types, and Static Loader (Sub-Epic: 03_Out-of-Scope Manifest - Content & Asset Generation)

## Covered Requirements
- [1_PRD-REQ-OOS-003], [1_PRD-REQ-OOS-005], [1_PRD-REQ-OOS-006], [1_PRD-REQ-OOS-007], [1_PRD-REQ-OOS-017]

## 1. Initial Test Written

- [ ] In `src/oos/__tests__/oosManifest.schema.test.ts`, write a test suite `OOS Manifest Schema` that:
  - Imports the `OOSEntry` TypeScript interface from `src/oos/types.ts`.
  - Imports the `loadOOSManifest()` function from `src/oos/oosManifestLoader.ts`.
  - Imports the raw manifest JSON from `src/oos/data/contentAssetGenerationOOS.json`.
  - Asserts that `loadOOSManifest()` returns a non-empty array of `OOSEntry` objects.
  - Asserts that each entry contains the required fields: `id` (string), `name` (string), `description` (string), `keywords` (non-empty `string[]`), `rationale` (string), and `category` (string).
  - Asserts that the manifest contains exactly **five** entries covering IDs: `"1_PRD-REQ-OOS-003"`, `"1_PRD-REQ-OOS-005"`, `"1_PRD-REQ-OOS-006"`, `"1_PRD-REQ-OOS-007"`, and `"1_PRD-REQ-OOS-017"`.
  - Asserts that `loadOOSManifest()` throws a typed `OOSManifestLoadError` if the JSON file is missing or malformed (use `jest.mock` to simulate a broken file path).
  - Asserts that calling `loadOOSManifest()` twice returns the same object reference (i.e., the result is memoized/cached).

## 2. Task Implementation

- [ ] Create `src/oos/types.ts` and export the following TypeScript interfaces:
  ```typescript
  export interface OOSEntry {
    id: string;           // e.g. "1_PRD-REQ-OOS-003"
    name: string;         // Short human-readable name
    description: string;  // Full description of what is excluded
    rationale: string;    // Why this is out of scope for devs
    category: string;     // Grouping label, e.g. "content_asset_generation"
    keywords: string[];   // Lowercase trigger terms for classifier use
  }

  export interface OOSManifest {
    version: string;
    entries: OOSEntry[];
  }

  export class OOSManifestLoadError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'OOSManifestLoadError';
    }
  }
  ```
- [ ] Create `src/oos/data/contentAssetGenerationOOS.json` with the following structure (populate all five entries per their requirement descriptions):
  ```json
  {
    "version": "1.0.0",
    "entries": [
      {
        "id": "1_PRD-REQ-OOS-003",
        "name": "Creative Asset & Marketing Content Generation",
        "description": "devs will not generate logos, brand identities, marketing copy, advertisement creatives, or any other non-functional creative/marketing artifacts.",
        "rationale": "devs is a software engineering orchestrator focused on greenfield code generation. Creative and marketing asset production requires domain-specific design and copywriting tooling outside the engineering scope.",
        "category": "content_asset_generation",
        "keywords": ["logo", "branding", "brand identity", "marketing copy", "advertisement", "copywriting", "slogan", "tagline", "mascot", "promotional material", "social media graphic"]
      },
      {
        "id": "1_PRD-REQ-OOS-005",
        "name": "Hardware-Specific & Embedded Systems Development",
        "description": "devs will not generate firmware, HAL drivers, RTOS configurations, or any software targeting proprietary hardware instruction sets or embedded system constraints.",
        "rationale": "Embedded and hardware-specific development requires physical hardware validation environments, proprietary SDKs, and cross-compilation toolchains that devs cannot provision or verify in a sandboxed software environment.",
        "category": "content_asset_generation",
        "keywords": ["rtos", "embedded", "firmware", "hal driver", "microcontroller", "fpga", "bare metal", "hardware abstraction", "cross-compilation", "jtag", "bootloader", "device driver"]
      },
      {
        "id": "1_PRD-REQ-OOS-006",
        "name": "App Store & Marketplace Submission Management",
        "description": "devs will not manage, automate, or interact with App Store Connect, Google Play Console, or any third-party marketplace submission portals.",
        "rationale": "App store submission involves external portal accounts, legal agreements, manual review processes, and certificate management that require human authorization and cannot be safely automated within devs' sandboxed execution model.",
        "category": "content_asset_generation",
        "keywords": ["app store connect", "google play console", "app store submission", "marketplace listing", "store review", "certificate signing", "provisioning profile", "app review", "play store upload", "ipa upload", "aab upload"]
      },
      {
        "id": "1_PRD-REQ-OOS-007",
        "name": "Legal, Regulatory & Compliance Certification",
        "description": "devs will not produce legally binding compliance certifications, formal regulatory assessments, or guarantee adherence to GDPR, HIPAA, SOC 2, PCI-DSS, or similar frameworks.",
        "rationale": "Legal and regulatory compliance requires qualified human legal counsel and certified auditors. devs may scaffold boilerplate privacy policy templates or common compliance helpers as code, but cannot guarantee legal sufficiency or provide authoritative compliance advice.",
        "category": "content_asset_generation",
        "keywords": ["gdpr certification", "hipaa certification", "soc 2 audit", "pci-dss audit", "legal compliance guarantee", "regulatory certification", "compliance report", "legal advice", "data protection officer", "privacy impact assessment"]
      },
      {
        "id": "1_PRD-REQ-OOS-017",
        "name": "3D Modeling, Texturing & Game Asset Pipelines",
        "description": "devs will not generate 3D models, textures, shaders, rigged animations, game maps, or any binary game asset formats (e.g., FBX, OBJ, glTF, Unity Prefabs).",
        "rationale": "3D and game asset creation requires specialized DCC (Digital Content Creation) tools, artistic authoring workflows, and GPU-accelerated rendering pipelines that are entirely outside the scope of a text-based code generation orchestrator.",
        "category": "content_asset_generation",
        "keywords": ["3d model", "texture", "shader", "rigged animation", "game asset", "fbx", "obj file", "gltf", "unity prefab", "unreal asset", "blender scene", "level design", "game map", "sprite sheet", "normal map", "uv unwrapping"]
      }
    ]
  }
  ```
- [ ] Create `src/oos/oosManifestLoader.ts`:
  - Implement `loadOOSManifest(): OOSManifest` that reads `contentAssetGenerationOOS.json` using `fs.readFileSync` with a path resolved relative to `__dirname`.
  - Wrap the parse in a `try/catch` and throw `OOSManifestLoadError` with a descriptive message on failure.
  - Memoize the result in a module-level variable so subsequent calls return the cached value without re-reading disk.
  - Export a named `getOOSEntries(): OOSEntry[]` helper that calls `loadOOSManifest()` and returns `manifest.entries`.

## 3. Code Review

- [ ] Verify that `OOSEntry` and `OOSManifest` interfaces use `readonly` modifiers on all fields to prevent mutation after load.
- [ ] Confirm that `OOSManifestLoadError` extends `Error` correctly and that `this.name` is set in the constructor (required for correct `instanceof` checks at runtime).
- [ ] Confirm that `loadOOSManifest()` is side-effect-free except for disk I/O on the first call — no global state mutations beyond the memoization cache.
- [ ] Confirm that the JSON data file (`contentAssetGenerationOOS.json`) contains all five required requirement IDs and that keyword arrays are non-empty and all lowercase.
- [ ] Confirm that `getOOSEntries()` is the single public surface for consumers; direct manifest access should be discouraged via JSDoc `@internal` on `loadOOSManifest()`.

## 4. Run Automated Tests to Verify

- [ ] Run `npx jest src/oos/__tests__/oosManifest.schema.test.ts --coverage` from the repository root.
- [ ] Confirm all assertions pass with 0 failures.
- [ ] Confirm that line coverage for `src/oos/oosManifestLoader.ts` is ≥ 90%.
- [ ] Run `npx tsc --noEmit` to confirm no TypeScript compilation errors are introduced.

## 5. Update Documentation

- [ ] Create `src/oos/README.agent.md` (AOD agent documentation file) with:
  - A one-paragraph summary of the OOS manifest system's purpose.
  - A description of the `OOSEntry` fields and their intended use by classifier agents.
  - The canonical import path for `getOOSEntries()`.
  - A note that the manifest covers the Content & Asset Generation category (Phase 15, Sub-Epic 03) and lists the five covered requirement IDs.
- [ ] Append a note to `docs/architecture/out-of-scope-manifest.md` (create if absent) describing the schema version `1.0.0` and how to extend the manifest with new OOS entries.

## 6. Automated Verification

- [ ] Run the following command and confirm exit code is `0`:
  ```bash
  npx jest src/oos/__tests__/oosManifest.schema.test.ts --ci --passWithNoTests=false
  ```
- [ ] Run the following Node.js smoke-test script and confirm it prints all five requirement IDs without error:
  ```bash
  node -e "
  const { getOOSEntries } = require('./dist/oos/oosManifestLoader');
  const entries = getOOSEntries();
  entries.forEach(e => console.log(e.id));
  if (entries.length !== 5) process.exit(1);
  "
  ```
- [ ] Run `npx tsc --noEmit` and confirm zero errors.
