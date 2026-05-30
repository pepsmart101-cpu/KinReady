# KinReady API Specification

## Base URL
`/api/v1`

## Authentication
JWT-based authentication. Include `Authorization: Bearer <token>` in headers.

---

## Auth Endpoints
- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Login and receive JWT.
- `POST /auth/mfa/setup`: Setup MFA (returns QR/secret).
- `POST /auth/mfa/verify`: Verify MFA code to enable.
- `POST /auth/logout`: Invalidate session.
- `POST /auth/refresh`: Refresh JWT.

## User Endpoints
- `GET /users/me`: Get current user profile.
- `PATCH /users/me`: Update profile (name, preferences, etc.).

## Family Group Endpoints
- `GET /family-groups`: List family groups the user belongs to.
- `POST /family-groups`: Create a new family group.
- `GET /family-groups/:id`: Get group details and members.
- `PATCH /family-groups/:id`: Update group info.
- `DELETE /family-groups/:id`: Delete group (owner only).
- `POST /family-groups/:id/members`: Add a member (invite or placeholder).
- `PATCH /family-groups/:id/members/:memberId`: Update member role/info.
- `DELETE /family-groups/:id/members/:memberId`: Remove member.

## Content Endpoints
- `GET /content/education`: List educational articles (filters: category, tags, state_region).
- `GET /content/education/:slug`: Get article by slug.
- `GET /content/scripts`: List phone scripts.
- `GET /content/scripts/:id`: Get script details.

## Document Endpoints
- `GET /documents`: List user's documents.
- `POST /documents`: Create a new document (from template or blank).
- `GET /documents/:id`: Get document (decrypted on client or server depending on key management).
- `PATCH /documents/:id`: Update document content.
- `DELETE /documents/:id`: Archive/Delete document.
- `GET /document-templates`: List available templates (filters: category, state_region).

## Vault Endpoints
- `GET /vault`: List vault items (metadata only).
- `POST /vault`: Create vault item.
- `GET /vault/:id`: Get vault item (encrypted data).
- `PATCH /vault/:id`: Update vault item.
- `DELETE /vault/:id`: Remove vault item.

## Workflow Endpoints
- `GET /workflows`: List available workflows (filters: category, state_region).
- `GET /workflows/:id`: Get workflow details and steps.
- `GET /workflows/:id/progress`: Get user's progress for this workflow.
- `POST /workflows/:id/steps/:stepId/progress`: Update progress for a specific step.

## AI Assistant Endpoints
- `POST /ai/chat`: Send a message to the AI assistant.
- `GET /ai/sessions`: List past chat sessions.
- `GET /ai/sessions/:id`: Get chat history for a session.

## System/Logs
- `POST /consent`: Log user consent to terms/privacy/disclaimers.
- `GET /audit-logs`: List user's audit logs.

---

## Data Models (JSON)

### User
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "role": "user"
}
```

### Vault Item (Encrypted)
```json
{
  "id": "uuid",
  "title": "Main Bank Access",
  "description": "Login for Chase account",
  "encrypted_data": "...", // AES-256-GCM encrypted blob
  "category": "password"
}
```
