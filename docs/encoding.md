# Encoding Policy

The project standard is UTF-8.

## Rules

- Source files, Markdown documents, templates, and JSON metadata should be saved as UTF-8.
- HTML entry files explicitly declare `<meta charset="UTF-8" />`.
- `.editorconfig` enforces `charset = utf-8` for editors that support it.
- Generated Markdown content is written with Node's `utf8` option.

## Why

Some earlier Korean UI strings were saved through a mismatched console/codepage path and became mojibake. Keeping source files and generated text on UTF-8 prevents the same issue from returning across Windows terminals, VS Code, Electron, and Git.
