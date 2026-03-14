# Task: Template Variable Resolution Engine (Sub-Epic: 046_Detailed Domain Specifications (Part 11))

## Covered Requirements
- [2_TAS-REQ-103]

## Dependencies
- depends_on: [01_workflow_stage_state_machines.md]
- shared_components: [devs-core (owner — creates TemplateResolver, TemplateContext, TemplateError)]

## 1. Initial Test Written
- [ ] Create tests in `devs-core/src/template.rs` (inline `#[cfg(test)]` module) with `// Covers: 2_TAS-REQ-103` annotations on each test:
- [ ] **Priority 1 — workflow inputs**: Build a `TemplateContext` with `inputs: {"task_name": "build-api"}`. Assert `resolve("Deploy {{workflow.input.task_name}}", &ctx)` returns `Ok("Deploy build-api")`.
- [ ] **Priority 2 — run metadata**: Set `run_id`, `run_slug`, `run_name` on context. Assert `{{run.id}}`, `{{run.slug}}`, `{{run.name}}` each resolve to the corresponding value.
- [ ] **Priority 3 — stage exit code**: Add a completed stage `plan` with `exit_code: Some(0)`. Assert `{{stage.plan.exit_code}}` resolves to `"0"`.
- [ ] **Priority 4 — structured output fields**: Stage `plan` has `structured: Some({"summary": "done"})`. Assert `{{stage.plan.output.summary}}` resolves to `"done"`.
- [ ] **Priority 5 — stage stdout with 64 KiB truncation**: Create a stage with stdout of 100,000 bytes. Assert `{{stage.plan.stdout}}` resolves to exactly 65,536 bytes.
- [ ] **Priority 6 — stage stderr with 64 KiB truncation**: Same test for stderr.
- [ ] **Priority 7 — fan-out index**: Set `fan_out: Some(FanOutContext { index: 3, item: None })`. Assert `{{fan_out.index}}` resolves to `"3"`.
- [ ] **Priority 8 — fan-out item**: Set `fan_out: Some(FanOutContext { index: 0, item: Some("task-a".into()) })`. Assert `{{fan_out.item}}` resolves to `"task-a"`.
- [ ] **Unknown variable**: Assert `resolve("{{nonexistent.var}}", &ctx)` returns `Err(TemplateError::UnknownVariable { expr: "nonexistent.var".into() })`.
- [ ] **EC-C03-01 — structured output on exit_code-only stage**: Stage `foo` has `completion_mode: ExitCode` and no structured output. Assert `{{stage.foo.output.bar}}` returns `Err(TemplateError::InvalidReference)` with message containing `"stage 'foo' has no structured output (completion=exit_code)"`.
- [ ] **EC-C03-02 — unauthorized stage reference**: Stage `unrelated` exists in `stages` map but is NOT in `depends_on_closure`. Assert `{{stage.unrelated.exit_code}}` returns `Err(TemplateError::UnauthorizedReference)` with message containing `"stage 'unrelated' is not in the transitive depends_on closure"`.
- [ ] **EC-C03-05 — fan-out variable outside fan-out**: Context has `fan_out: None`. Assert `{{fan_out.item}}` returns `Err(TemplateError::UnknownVariable)`.
- [ ] **Multiple variables in one template**: `"Build {{workflow.input.project}} run={{run.id}}"` resolves both.
- [ ] **No variables**: `"Hello world"` passes through unchanged as `Ok("Hello world")`.
- [ ] **Escaped/adjacent braces**: `"{{{workflow.input.x}}}"` with `x="val"` resolves to `"{val}"`.

## 2. Task Implementation
- [ ] Create `devs-core/src/template.rs` and add `pub mod template;` to `lib.rs`.
- [ ] Define `TemplateContext` struct:
    ```rust
    pub struct TemplateContext {
        pub inputs: HashMap<String, serde_json::Value>,
        pub run_id: String,
        pub run_slug: String,
        pub run_name: String,
        pub stages: HashMap<String, StageOutput>,
        pub depends_on_closure: HashSet<String>,
        pub fan_out: Option<FanOutContext>,
    }
    ```
- [ ] Define `StageOutput` struct:
    ```rust
    pub struct StageOutput {
        pub exit_code: Option<i32>,
        pub stdout: String,
        pub stderr: String,
        pub structured: Option<HashMap<String, serde_json::Value>>,
        pub completion_mode: CompletionMode,
    }
    ```
- [ ] Define `CompletionMode` enum: `ExitCode`, `StructuredOutput`, `McpToolCall`.
- [ ] Define `FanOutContext { pub index: usize, pub item: Option<String> }`.
- [ ] Define `TemplateError` enum:
    - `UnknownVariable { expr: String }`
    - `InvalidReference { message: String }`
    - `UnauthorizedReference { message: String }`
    All variants implement `Debug`, `Display`, `std::error::Error`.
- [ ] Implement `pub struct TemplateResolver;` with `pub fn resolve(template: &str, context: &TemplateContext) -> Result<String, TemplateError>`:
    - Scan for `{{...}}` patterns (regex `\{\{([^}]+)\}\}` or manual parser).
    - For each captured expression (trimmed), attempt resolution in strict priority order 1–8.
    - For any `stage.<name>.*` expression: first check `depends_on_closure` contains `<name>`, returning `UnauthorizedReference` if not. Then look up `stages[<name>]`.
    - For `stage.<name>.output.<field>`: check `completion_mode != ExitCode`, returning `InvalidReference` if it is.
    - Truncate stdout/stderr to 65,536 bytes via `&s[..s.len().min(65536)]` (handle UTF-8 boundary with `floor_char_boundary` or equivalent safe truncation).
    - If no pattern matches the expression, return `Err(UnknownVariable { expr })`.
- [ ] Re-export all public types from `devs-core/src/lib.rs`.

## 3. Code Review
- [ ] Verify priority order exactly matches the 8 levels in [2_TAS-REQ-103] — no reordering.
- [ ] Confirm resolver NEVER silently returns empty string for unresolved variables.
- [ ] Confirm 64 KiB truncation handles UTF-8 boundaries safely (no panic on multi-byte chars).
- [ ] Verify `depends_on_closure` check occurs before any stage field lookup.
- [ ] Ensure `TemplateError` variants carry enough context for diagnostic messages.

## 4. Run Automated Tests to Verify
- [ ] Run `cargo test -p devs-core -- template` and confirm all tests pass.
- [ ] Run `cargo clippy -p devs-core -- -D warnings` with zero warnings.

## 5. Update Documentation
- [ ] Add doc comments to `TemplateResolver::resolve`, `TemplateContext`, all `TemplateError` variants, and `CompletionMode` explaining the resolution semantics and priority order.

## 6. Automated Verification
- [ ] Run `./do test` and confirm `target/traceability.json` includes coverage for `2_TAS-REQ-103`.
- [ ] Run `./do lint` and confirm zero errors.
