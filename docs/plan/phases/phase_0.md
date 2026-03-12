# Phase 0: Project Foundation & Toolchain

## Objective
Establish the complete development infrastructure, toolchain, and repository structure required for the `devs` project. This phase ensures that the development environment is consistent across all platforms (Linux, macOS, Windows) and that the automated verification pipeline is functional from the first commit.

## Requirements Covered
- [2_TAS-REQ-021]: Cargo workspace structure
- [1_PRD-REQ-002]: Single Rust Cargo Workspace
- [2_TAS-REQ-003]: Rust stable version 1.80.0
- [2_TAS-REQ-004]: rust-toolchain.toml configuration
- [2_TAS-REQ-005]: Authoritative crate versions
- [2_TAS-REQ-012]: ./do lint command behavior
- [2_TAS-REQ-013]: Mandatory documentation enforcement
- [2_TAS-REQ-014]: Standardized ./do subcommands
- [2_TAS-REQ-010]: GitLab CI pipeline definitions
- [2_TAS-REQ-008]: Proto file layout
- [2_TAS-REQ-009]: Proto package and naming conventions
- [2_TAS-REQ-016]: Canonical file layout under .devs/
- [2_TAS-REQ-006]: reqwest rustls-tls feature
- [2_TAS-REQ-007]: Dev-only dependencies
- [2_TAS-REQ-015]: Coverage measurement sequence
- [1_PRD-REQ-045]: ./do Developer Entrypoint Script
- [1_PRD-BR-001]: Presubmit 15-Minute Timeout
- [1_PRD-BR-002]: ./do setup Idempotency
- [1_PRD-BR-003]: Unrecognised Subcommand Error
- [1_PRD-BR-006]: Doc Comments enforcement
- [1_PRD-BR-007]: Code quality enforcement (fmt/clippy)
- [1_PRD-KPI-BR-001]: Zero Coverage Failure
- [2_TAS-REQ-022]: devs-proto responsibilities
- [2_TAS-REQ-023]: devs-core responsibilities
- [2_TAS-REQ-028]: BoundedString constraints
- [2_TAS-REQ-029]: EnvKey constraints
- [2_TAS-REQ-031]: UUID format
- [2_TAS-REQ-067]: Proto file structure
- [2_TAS-REQ-068]: Representative Proto Definitions
- [2_TAS-REQ-079]: ./do test Traceability Schema
- [2_TAS-REQ-080]: Test Annotation Convention
- [2_TAS-REQ-081]: ./do coverage Report Schema
- [2_TAS-REQ-083]: ./do Script Subcommands Behavior
- [2_TAS-REQ-084]: Unknown Subcommand Handling for ./do
- [2_TAS-REQ-085]: ./do presubmit Timeout
- [1_PRD-REQ-046]: Presubmit Checks Gate All Commits
- [1_PRD-REQ-047]: GitLab CI/CD on Linux, macOS, and Windows
- [1_PRD-REQ-048]: Automated Code Formatting and Linting
- [1_PRD-BR-004] [1_PRD-BR-005] [1_PRD-KPI-BR-002] [1_PRD-KPI-BR-003] [1_PRD-KPI-BR-004] [1_PRD-KPI-BR-005] [1_PRD-KPI-BR-006] [1_PRD-KPI-BR-007] [1_PRD-KPI-BR-008] [1_PRD-KPI-BR-009] [1_PRD-KPI-BR-010] [1_PRD-KPI-BR-011] [1_PRD-KPI-BR-012] [1_PRD-KPI-BR-013] [1_PRD-KPI-BR-014] [1_PRD-REQ-043] [1_PRD-REQ-044] [1_PRD-REQ-049] [1_PRD-REQ-050] [1_PRD-REQ-051] [1_PRD-REQ-052] [1_PRD-REQ-053] [1_PRD-REQ-054] [1_PRD-REQ-055] [1_PRD-REQ-056] [1_PRD-REQ-057] [1_PRD-REQ-058] [1_PRD-REQ-059] [1_PRD-REQ-060] [1_PRD-REQ-061] [1_PRD-REQ-062] [1_PRD-REQ-063] [1_PRD-REQ-064] [1_PRD-REQ-065] [1_PRD-REQ-066] [1_PRD-REQ-067] [1_PRD-REQ-068] [1_PRD-REQ-069] [1_PRD-REQ-070] [1_PRD-REQ-071] [1_PRD-REQ-072] [1_PRD-REQ-073] [1_PRD-REQ-074] [1_PRD-REQ-075] [1_PRD-REQ-076] [1_PRD-REQ-077] [1_PRD-REQ-078] [1_PRD-REQ-079] [1_PRD-REQ-080] [1_PRD-REQ-081] [1_PRD-REQ-NNN] [2_PRD-BR-001] [2_PRD-BR-002] [2_PRD-BR-003] [2_PRD-BR-004] [2_PRD-BR-005] [2_PRD-BR-006] [2_PRD-BR-007] [2_PRD-BR-008] [2_PRD-BR-009] [2_PRD-BR-010] [2_PRD-BR-011] [2_PRD-BR-012] [2_TAS-BR-013] [2_TAS-BR-016] [2_TAS-BR-021] [2_TAS-BR-025] [2_TAS-BR-WH-003] [2_TAS-REQ-001A] [2_TAS-REQ-001B] [2_TAS-REQ-001C] [2_TAS-REQ-001D] [2_TAS-REQ-001E] [2_TAS-REQ-001F] [2_TAS-REQ-001G] [2_TAS-REQ-001H] [2_TAS-REQ-001I] [2_TAS-REQ-001J] [2_TAS-REQ-001K] [2_TAS-REQ-001L] [2_TAS-REQ-001M] [2_TAS-REQ-001N] [2_TAS-REQ-002A] [2_TAS-REQ-002B] [2_TAS-REQ-002C] [2_TAS-REQ-002D] [2_TAS-REQ-002E] [2_TAS-REQ-002F] [2_TAS-REQ-002G] [2_TAS-REQ-002H] [2_TAS-REQ-002I] [2_TAS-REQ-002J] [2_TAS-REQ-002K] [2_TAS-REQ-002L] [2_TAS-REQ-002M] [2_TAS-REQ-002N] [2_TAS-REQ-002O] [2_TAS-REQ-002P] [2_TAS-REQ-002Q] [2_TAS-REQ-002R] [2_TAS-REQ-002S] [2_TAS-REQ-002T] [2_TAS-REQ-002U] [2_TAS-REQ-004A] [2_TAS-REQ-004B] [2_TAS-REQ-004C] [2_TAS-REQ-004D] [2_TAS-REQ-004E] [2_TAS-REQ-004F] [2_TAS-REQ-004G] [2_TAS-REQ-005A] [2_TAS-REQ-007A] [2_TAS-REQ-007B] [2_TAS-REQ-008A] [2_TAS-REQ-008B] [2_TAS-REQ-008C] [2_TAS-REQ-008D] [2_TAS-REQ-009A] [2_TAS-REQ-009B] [2_TAS-REQ-010A] [2_TAS-REQ-010B] [2_TAS-REQ-010C] [2_TAS-REQ-010D] [2_TAS-REQ-010E] [2_TAS-REQ-010F] [2_TAS-REQ-012A] [2_TAS-REQ-012B] [2_TAS-REQ-012C] [2_TAS-REQ-012D] [2_TAS-REQ-013A] [2_TAS-REQ-014A] [2_TAS-REQ-014B] [2_TAS-REQ-014C] [2_TAS-REQ-014D] [2_TAS-REQ-014E] [2_TAS-REQ-014F] [2_TAS-REQ-015A] [2_TAS-REQ-015B] [2_TAS-REQ-015C] [2_TAS-REQ-015D] [2_TAS-REQ-015E] [2_TAS-REQ-015F] [2_TAS-REQ-020A] [2_TAS-REQ-020B] [2_TAS-REQ-021A] [2_TAS-REQ-021B] [2_TAS-REQ-021C] [2_TAS-REQ-022A] [2_TAS-REQ-022B] [2_TAS-REQ-022C] [2_TAS-REQ-023A] [2_TAS-REQ-023B] [2_TAS-REQ-023C] [2_TAS-REQ-023D] [2_TAS-REQ-024A] [2_TAS-REQ-024B] [2_TAS-REQ-024C] [2_TAS-REQ-030A] [2_TAS-REQ-030B] [2_TAS-REQ-030C] [2_TAS-REQ-033A] [2_TAS-REQ-033B] [2_TAS-REQ-044A] [2_TAS-REQ-044B] [2_TAS-REQ-051A] [2_TAS-REQ-086A] [2_TAS-REQ-086B] [2_TAS-REQ-086C] [2_TAS-REQ-086D] [2_TAS-REQ-086E] [2_TAS-REQ-086F] [2_TAS-REQ-086G] [2_TAS-REQ-086H] [2_TAS-REQ-086I] [2_TAS-REQ-086J] [2_TAS-REQ-086K] [2_TAS-REQ-086L] [2_TAS-REQ-086M] [2_TAS-REQ-086N] [2_TAS-REQ-100] [2_TAS-REQ-101] [2_TAS-REQ-102] [2_TAS-REQ-103] [2_TAS-REQ-104] [2_TAS-REQ-105] [2_TAS-REQ-106] [2_TAS-REQ-107] [2_TAS-REQ-108] [2_TAS-REQ-109] [2_TAS-REQ-110] [2_TAS-REQ-111] [2_TAS-REQ-112] [2_TAS-REQ-113] [2_TAS-REQ-114] [2_TAS-REQ-115] [2_TAS-REQ-116] [2_TAS-REQ-117] [2_TAS-REQ-118] [2_TAS-REQ-119] [2_TAS-REQ-120] [2_TAS-REQ-121] [2_TAS-REQ-122] [2_TAS-REQ-123] [2_TAS-REQ-124] [2_TAS-REQ-125] [2_TAS-REQ-126] [2_TAS-REQ-127] [2_TAS-REQ-128] [2_TAS-REQ-129] [2_TAS-REQ-130] [2_TAS-REQ-131] [2_TAS-REQ-132] [2_TAS-REQ-133] [2_TAS-REQ-134] [2_TAS-REQ-135] [2_TAS-REQ-136] [2_TAS-REQ-137] [2_TAS-REQ-138] [2_TAS-REQ-139] [2_TAS-REQ-140] [2_TAS-REQ-141] [2_TAS-REQ-142] [2_TAS-REQ-143] [2_TAS-REQ-144] [2_TAS-REQ-145] [2_TAS-REQ-146] [2_TAS-REQ-147] [2_TAS-REQ-148] [2_TAS-REQ-149] [2_TAS-REQ-150] [2_TAS-REQ-151] [2_TAS-REQ-152] [2_TAS-REQ-153] [2_TAS-REQ-154] [2_TAS-REQ-155] [2_TAS-REQ-156] [2_TAS-REQ-157] [2_TAS-REQ-158] [2_TAS-REQ-159] [2_TAS-REQ-160] [2_TAS-REQ-161] [2_TAS-REQ-206] [2_TAS-REQ-230] [2_TAS-REQ-234] [2_TAS-REQ-237] [2_TAS-REQ-238] [2_TAS-REQ-240] [2_TAS-REQ-244] [2_TAS-REQ-245] [2_TAS-REQ-246] [2_TAS-REQ-251] [2_TAS-REQ-254] [2_TAS-REQ-255] [2_TAS-REQ-256] [2_TAS-REQ-259] [2_TAS-REQ-261] [2_TAS-REQ-268] [2_TAS-REQ-269] [2_TAS-REQ-270] [2_TAS-REQ-271] [2_TAS-REQ-272] [2_TAS-REQ-273] [2_TAS-REQ-274] [2_TAS-REQ-275] [2_TAS-REQ-276] [2_TAS-REQ-278] [2_TAS-REQ-279] [2_TAS-REQ-280] [2_TAS-REQ-281] [2_TAS-REQ-282] [2_TAS-REQ-283] [2_TAS-REQ-286] [2_TAS-REQ-287] [2_TAS-REQ-288] [2_TAS-REQ-289] [2_TAS-REQ-400] [2_TAS-REQ-401] [2_TAS-REQ-402] [2_TAS-REQ-403] [2_TAS-REQ-404] [2_TAS-REQ-405] [2_TAS-REQ-406] [2_TAS-REQ-407] [2_TAS-REQ-408] [2_TAS-REQ-409] [2_TAS-REQ-410] [2_TAS-REQ-411] [2_TAS-REQ-412] [2_TAS-REQ-413] [2_TAS-REQ-414] [2_TAS-REQ-415] [2_TAS-REQ-416] [2_TAS-REQ-417] [2_TAS-REQ-418] [2_TAS-REQ-419] [2_TAS-REQ-420] [2_TAS-REQ-421] [2_TAS-REQ-422] [2_TAS-REQ-423] [2_TAS-REQ-424] [2_TAS-REQ-425] [2_TAS-REQ-426] [2_TAS-REQ-427] [2_TAS-REQ-428] [2_TAS-REQ-429] [2_TAS-REQ-430] [2_TAS-REQ-431] [2_TAS-REQ-432] [2_TAS-REQ-433] [2_TAS-REQ-434] [2_TAS-REQ-435] [2_TAS-REQ-436] [2_TAS-REQ-437] [2_TAS-REQ-438] [2_TAS-REQ-439] [2_TAS-REQ-440] [2_TAS-REQ-441] [2_TAS-REQ-442] [2_TAS-REQ-443] [2_TAS-REQ-444] [2_TAS-REQ-445] [2_TAS-REQ-446] [2_TAS-REQ-447] [2_TAS-REQ-448] [2_TAS-REQ-449] [2_TAS-REQ-450] [2_TAS-REQ-451] [2_TAS-REQ-452] [2_TAS-REQ-453] [2_TAS-REQ-454] [2_TAS-REQ-455] [2_TAS-REQ-456] [2_TAS-REQ-457] [2_TAS-REQ-458] [2_TAS-REQ-459] [2_TAS-REQ-460] [2_TAS-REQ-461] [2_TAS-REQ-462] [2_TAS-REQ-463] [2_TAS-REQ-464] [2_TAS-REQ-465] [2_TAS-REQ-466] [2_TAS-REQ-467] [2_TAS-REQ-468] [2_TAS-REQ-469] [2_TAS-REQ-470] [2_TAS-REQ-471] [2_TAS-REQ-472] [2_TAS-REQ-473] [2_TAS-REQ-474] [2_TAS-REQ-475] [2_TAS-REQ-476] [2_TAS-REQ-477] [2_TAS-REQ-478] [2_TAS-REQ-479] [2_TAS-REQ-480] [2_TAS-REQ-481] [2_TAS-REQ-482] [2_TAS-REQ-483] [2_TAS-REQ-484] [2_TAS-REQ-485] [2_TAS-REQ-486] [2_TAS-REQ-487] [2_TAS-REQ-488] [2_TAS-REQ-489] [2_TAS-REQ-490] [2_TAS-REQ-491] [2_TAS-REQ-492] [2_TAS-REQ-493] [2_TAS-REQ-494] [2_TAS-REQ-495] [2_TAS-REQ-496] [2_TAS-REQ-497] [2_TAS-REQ-498] [2_TAS-REQ-499] [2_TAS-REQ-500] [2_TAS-REQ-501] [2_TAS-REQ-502] [2_TAS-REQ-503] [2_TAS-REQ-504] [2_TAS-REQ-505] [2_TAS-REQ-506] [2_TAS-REQ-507] [2_TAS-REQ-508] [2_TAS-REQ-509] [2_TAS-REQ-510] [2_TAS-REQ-511] [2_TAS-REQ-512] [2_TAS-REQ-513] [2_TAS-REQ-514] [2_TAS-REQ-515] [2_TAS-REQ-516] [2_TAS-REQ-517] [2_TAS-REQ-600] [2_TAS-REQ-601] [2_TAS-REQ-602] [2_TAS-REQ-603] [2_TAS-REQ-604] [2_TAS-REQ-605] [AC-ASCII-006] [AC-ASCII-007] [AC-ASCII-010] [AC-ASCII-016] [AC-ASCII-017] [AC-ASCII-018] [AC-ASCII-019] [AC-ASCII-020] [AC-ASCII-021] [AC-ASCII-022] [AC-ASCII-023] [AC-ASCII-024] [AC-ASCII-025] [AC-ASCII-026] [AC-ASCII-027] [AC-ASCII-028] [AC-HELP-004] [AC-HELP-005] [AC-HELP-007] [AC-KEY-004] [AC-KEY-005] [AC-KEY-006] [AC-LOG-005] [AC-LOG-006] [AC-LOG-007] [AC-ROAD-P0-001] [AC-ROAD-P0-002] [AC-ROAD-P0-003] [AC-ROAD-P0-004] [AC-ROAD-P0-005] [AC-ROAD-P0-006] [AC-ROAD-P0-007] [AC-ROAD-P0-008] [AC-TIMING-001] [AC-TIMING-002] [AC-TIMING-003] [AC-TIMING-004] [AC-TIMING-005] [AC-TYP-001] [AC-TYP-002] [AC-TYP-003] [AC-TYP-004] [AC-TYP-005] [AC-TYP-006] [AC-TYP-007] [AC-TYP-008] [AC-TYP-009] [AC-TYP-010] [AC-TYP-011] [AC-TYP-012] [AC-TYP-013] [AC-TYP-014] [AC-TYP-015] [AC-TYP-016] [AC-TYP-017] [AC-TYP-018] [AC-TYP-019] [AC-TYP-020] [AC-TYP-021] [AC-TYP-022] [AC-TYP-023] [AC-TYP-024] [AC-TYP-025] [AC-TYP-026] [AC-TYP-027] [AC-TYP-028] [ROAD-P0-DEP-001]

## Detailed Deliverables & Components
### Workspace & Toolchain Setup
- Initialize a single Cargo workspace with the 15 required crates.
- Configure `rust-toolchain.toml` to pin stable Rust 1.80.0 and required components.
- Set up `Cargo.toml` with workspace-level lints and dependency management.

### Developer Entrypoint (./do Script)
- Implement the `./do` shell script supporting `setup`, `build`, `test`, `lint`, `format`, `coverage`, `presubmit`, and `ci`.
- Ensure `setup` is idempotent and `presubmit` enforces a 15-minute wall-clock timeout.
- Implement unknown subcommand handling with usage output.

### Verification Infrastructure
- Configure GitLab CI with parallel jobs for Linux, macOS, and Windows.
- Implement `./do lint` with `cargo fmt`, `cargo clippy`, and `cargo doc` enforcement.
- Implement `./do coverage` with quality gates and instrumentation failure detection.
- Set up traceability tools to map requirements to tests via annotations.

### Proto & Core Foundation
- Define the gRPC `.proto` files in `proto/devs/v1/`.
- Implement `devs-proto` for code generation and `devs-core` for shared domain types.
- Implement foundational types like `BoundedString`, `EnvKey`, and UUID helpers.

## Technical Considerations
- **Platform Consistency:** The `./do` script and CI runners must ensure identical behavior across Linux, macOS, and Windows (especially for PTY and shell operations).
- **Tooling Isolation:** Use `DEVS_DISCOVERY_FILE` for test isolation to avoid port conflicts during parallel CI runs.
- **Bootstrapping:** This phase is manual but must provide the foundation for subsequent agentic development.
