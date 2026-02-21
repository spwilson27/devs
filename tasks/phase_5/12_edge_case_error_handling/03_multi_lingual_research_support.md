# Task: Implement Multi-Lingual Research Scraping and Distillation (Sub-Epic: 12_Edge Case & Error Handling)

## Covered Requirements
- [4_USER_FEATURES-REQ-050]

## 1. Initial Test Written
- [ ] In `tests/unit/research/test_multilingual_content_extractor.py`, write unit tests for multi-lingual content handling in `ContentExtractor`:
  - `test_extracts_chinese_content`: Provide raw HTML with Simplified Chinese body text; assert that `ContentExtractor.extract()` returns a non-empty `ExtractedContent.text` string that preserves CJK characters.
  - `test_extracts_spanish_content`: Provide raw HTML with Spanish body text; assert CJK/latin characters are preserved.
  - `test_extracts_japanese_content`: Provide raw HTML with Japanese (Hiragana/Katakana/Kanji) body text; assert characters are preserved.
  - `test_extracts_arabic_content`: Provide raw HTML with Arabic RTL text; assert characters are preserved and `ExtractedContent.detected_language` is `"ar"`.
  - `test_detected_language_field_is_populated`: Assert that `ExtractedContent.detected_language` is a valid ISO 639-1 code (non-empty string, 2 characters).
- [ ] In `tests/unit/research/test_multilingual_distillation.py`, write unit tests for `ResearchManager` language-aware distillation:
  - `test_distillation_prompt_includes_language_instruction`: When `ExtractedContent.detected_language` is not `"en"`, assert that the LLM prompt passed to `llm_client` contains an instruction to translate or summarize the content into English.
  - `test_distillation_result_is_english`: Given non-English `ExtractedContent`, mock `llm_client` to return an English summary; assert `ResearchFinding.summary` is the mocked English text.
- [ ] In `tests/integration/research/test_research_manager_multilingual.py`, write an integration test:
  - `test_full_pipeline_with_chinese_source`: Stub `ContentExtractor` to return a Chinese `ExtractedContent`; run `ResearchManager`; assert the final `ResearchReport.findings` are in English and `confidence_score > 0`.

## 2. Task Implementation
- [ ] Add `detected_language: str = "en"` field to the `ExtractedContent` dataclass in `src/devs/research/models.py` (create dataclass if not exists):
  ```python
  @dataclass
  class ExtractedContent:
      url: str
      text: str
      detected_language: str = "en"  # ISO 639-1 code
  ```
- [ ] In `src/devs/research/content_extractor.py`, within the `extract()` method:
  - After extracting text, use `langdetect` (or equivalent lightweight library) to detect the language of the extracted text.
  - Populate `ExtractedContent.detected_language` with the detected ISO 639-1 code.
  - Ensure the extraction step does NOT drop non-ASCII/non-Latin characters (validate charset handling: use `response.encoding` or `chardet` to correctly decode HTML bytes).
- [ ] In `src/devs/research/research_manager.py`, in the distillation step after `ContentExtractor` returns:
  - If `extracted_content.detected_language != "en"`, prepend a translation/summarization instruction to the LLM distillation prompt: `"The following content is in {language}. Translate and distill it into English:"`
  - Pass the modified prompt to `llm_client` for distillation.
- [ ] Add `langdetect` (or `lingua-language-detector`) to `pyproject.toml` / `requirements.txt` dependencies.

## 3. Code Review
- [ ] Verify that raw byte decoding in `ContentExtractor.extract()` uses detected or declared charset and does not silently corrupt multi-byte characters (no `encode/decode` with `errors='ignore'`).
- [ ] Verify that `detected_language` is always a valid 2-character ISO 639-1 code; if `langdetect` throws `LangDetectException`, default to `"unknown"` and log a warning — do NOT crash.
- [ ] Verify the LLM prompt modification is applied only when `detected_language != "en"` and `detected_language != "unknown"`.
- [ ] Verify that the integration does not add an external API call for translation (translation is done by the existing `llm_client`, not a separate service).
- [ ] Verify `langdetect` (or chosen library) is pinned to a specific version in dependencies.

## 4. Run Automated Tests to Verify
- [ ] Run unit tests: `pytest tests/unit/research/test_multilingual_content_extractor.py tests/unit/research/test_multilingual_distillation.py -v`
- [ ] Run integration tests: `pytest tests/integration/research/test_research_manager_multilingual.py -v`
- [ ] Confirm all tests pass with exit code 0 and zero failures.

## 5. Update Documentation
- [ ] Update `src/devs/research/content_extractor.agent.md` to document:
  - The `detected_language` field on `ExtractedContent`.
  - The language detection library used and version.
  - Fallback behavior when language detection fails (`"unknown"` + warning log).
- [ ] Update `src/devs/research/research_manager.agent.md` to document the multi-lingual distillation prompt injection.
- [ ] Update `docs/research_phase.md` to note that research agents support multilingual sources (English, Chinese, Spanish, Japanese, Arabic at minimum) and that all findings are normalized to English.

## 6. Automated Verification
- [ ] Run the full relevant test suite: `pytest tests/unit/research/test_multilingual_content_extractor.py tests/unit/research/test_multilingual_distillation.py tests/integration/research/test_research_manager_multilingual.py --tb=short 2>&1 | tail -5`
- [ ] Assert output contains `passed` and does not contain `failed`.
- [ ] Verify the language detection dependency is installed and importable: `python -c "import langdetect; print('OK')"` (or the chosen library).
- [ ] Verify `ExtractedContent` has `detected_language` field: `python -c "from devs.research.models import ExtractedContent; e = ExtractedContent(url='x', text='y'); print(e.detected_language)"`
