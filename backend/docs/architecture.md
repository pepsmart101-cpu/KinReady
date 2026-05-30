# KinReady Backend Architecture

## Technology Stack
- **Language**: TypeScript / Node.js
- **Framework**: Fastify (Type-safe, high performance)
- **Database**: SQLite via Turso (Edge-distributed, `team-db` for shared team dev)
- **Authentication**: JWT + MFA (TOTP)
- **AI Integration**: OpenAI/Anthropic API integration for plain-language guidance (non-legal advice disclaimer enforced via system prompt).
- **Encryption**: AES-256-GCM for sensitive data at rest.

## Encryption Strategy
To ensure maximum privacy (Zero-Trust where possible):
1. **User Master Key (UMK)**: Derived from the user's password using Argon2 on the client-side OR server-side with a pepper.
2. **Data Encryption Key (DEK)**: A unique random key generated for each document or vault item.
3. **Key Wrapping**: The DEK is encrypted with the UMK and stored alongside the resource.
4. **Client-side Encryption (Optional but Preferred)**: For vault items, encryption/decryption happens on the client. The server only sees encrypted blobs. For shared family items, a shared Family Key (FK) is used, which is encrypted for each member using their respective UMKs.

## Role-Based Access Control (RBAC)
- **Global Roles**:
  - `admin`: Full access to content management, system logs, and user management.
  - `user`: Standard access to own data and shared family data.
- **Family Group Permissions**:
  - `owner`: Can add/remove members, delete group, manage all items in group.
  - `member`: Can view/edit shared items depending on item-level settings.

## Scalability & Security
- **Auditing**: Every sensitive action (login, document access, vault decryption) is logged in `audit_logs`.
- **Validation**: Strict input validation using Zod or Joi.
- **Security Headers**: Helmet.js for CSP, HSTS, etc.
- **Rate Limiting**: Applied to auth and sensitive endpoints.

## Directory Structure (Proposed)
```text
src/
  api/          # API Route handlers
  core/         # Business logic (Services)
  db/           # Database schema, migrations, and clients
  lib/          # Shared utilities (Encryption, Validation)
  middleware/   # Auth, Error handling, Logging
  types/        # TypeScript interfaces/types
```
