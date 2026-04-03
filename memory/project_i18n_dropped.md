---
name: i18n dropped, zh-TW only
description: Project no longer uses next-intl translations — only zh-TW is supported, hardcoded Chinese strings are acceptable
type: project
---

The project dropped next-intl / multi-language support. Only Traditional Chinese (zh-TW) is used. Hardcoded Chinese strings in JSX are acceptable and should not be flagged as i18n violations.

**Why:** Decision to simplify the codebase for the current investor demo phase.
**How to apply:** Do not flag hardcoded zh-TW strings. Do not add useTranslations() or translation keys.
