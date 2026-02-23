# Supported Secret Patterns

This document summarizes the most important secret/token patterns detected by @devs/secret-masker.

Total patterns: >= 100 (see SECRET_PATTERNS in source for canonical list)

NOTE: Examples are redacted as `***` for safety.

- aws-access-key-id: /AKIA[0-9A-Z]{14,16}/  — Example: `***`
- aws-secret-access-key: /aws[_-]?secret[_-]?access[_-]?key\s*[:=]\s*[A-Za-z0-9/+=]{40}/  — Example: `***`
- github-token-gh: /gh[pousr]_[A-Za-z0-9_]{30,255}/  — Example: `***`
- slack-token: /xox[baprs]-[0-9A-Za-z\-]{10,}/  — Example: `***`
- stripe-key: /(sk|pk)_(test|live)_[0-9a-zA-Z]{24,}/  — Example: `***`
- pem-private-key: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/  — Example: `***`
- generic-api-key: /(?:api[_-]?key|apikey|api[_-]?secret)\s*[:=]\s*\S{16,}/  — Example: `***`
- bearer-token: /bearer\s+[A-Za-z0-9\-._~+\/]+=*/  — Example: `***`
- postgres-dsn: /(?:postgres|postgresql):\/\/[^:\s]+:[^@\s]+@/  — Example: `***`
- jwt: /eyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+/  — Example: `***`
- ssh-openssh-private-key: /-----BEGIN OPENSSH PRIVATE KEY-----/  — Example: `***`
- npm-token: /(?:_authToken|npm_token)\s*[:=]\s*\S{16,}/  — Example: `***`
- heroku-api-key: /\b[0-9a-fA-F]{32}\b/  — Example: `***`
- twilio-sid: /AC[0-9a-fA-F]{32}/  — Example: `***`
- sendgrid-key: /SG\.[A-Za-z0-9\-_]{22}\.[A-Za-z0-9\-_]{43}/  — Example: `***`
- gcp-api-key: /AIza[0-9A-Za-z_-]{35}/  — Example: `***`
- firebase-key: /AAAA[0-9A-Za-z_-]{7}:[A-Za-z0-9_-]{140}/  — Example: `***`
- azure-storage-account-key: /AccountKey=[A-Za-z0-9+/=]{16,}/  — Example: `***`
- discord-token: /[\w-]{24}\.[\w-]{6}\.[\w-]{27}/  — Example: `***`
- telegram-bot-token: /\d{8,10}:[A-Za-z0-9_-]{35}/  — Example: `***`

For the full canonical list and the regex sources, inspect `SECRET_PATTERNS` exported from `packages/secret-masker/src/patterns.ts`.
