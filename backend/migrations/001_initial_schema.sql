-- KinReady Database Schema (SQLite/Turso Compatible)

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    mfa_secret TEXT,
    mfa_enabled INTEGER DEFAULT 0,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'user',
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    lockout_until TEXT,
    password_reset_token TEXT,
    password_reset_expires TEXT,
    notification_preferences TEXT DEFAULT '{"email":true,"push":true,"weekly":true}',
    theme TEXT DEFAULT 'light',
    privacy_settings TEXT DEFAULT '{"profileVisible":false,"shareProgress":true}',
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Family Groups (the container for shared items)
CREATE TABLE IF NOT EXISTS family_groups (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Family Members (links users to groups)
CREATE TABLE IF NOT EXISTS family_members (
    id TEXT PRIMARY KEY, -- UUID
    family_group_id TEXT NOT NULL REFERENCES family_groups(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES users(id) ON DELETE SET NULL, 
    first_name TEXT NOT NULL,
    last_name TEXT,
    relationship TEXT, -- 'parent', 'child', 'spouse', etc.
    role TEXT DEFAULT 'member', -- 'owner', 'member'
    created_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(family_group_id, user_id)
);

-- Educational Content
CREATE TABLE IF NOT EXISTS educational_content (
    id TEXT PRIMARY KEY, -- UUID
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    content TEXT NOT NULL,
    category TEXT, -- 'emergency', 'medical', 'financial', etc.
    state_region TEXT, -- e.g., 'CA', 'NY', 'US-Global'
    tags TEXT, -- JSON array
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Document Templates
CREATE TABLE IF NOT EXISTS document_templates (
    id TEXT PRIMARY KEY, -- UUID
    name TEXT NOT NULL,
    description TEXT,
    template_body TEXT NOT NULL, 
    category TEXT,
    state_region TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    family_group_id TEXT REFERENCES family_groups(id), 
    template_id TEXT REFERENCES document_templates(id),
    title TEXT NOT NULL,
    content_encrypted TEXT NOT NULL, -- Encrypted document content
    status TEXT DEFAULT 'draft', -- 'draft', 'final', 'archived'
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Vault Items (Sensitive credentials/info)
CREATE TABLE IF NOT EXISTS vault_items (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    family_group_id TEXT REFERENCES family_groups(id), 
    title TEXT NOT NULL,
    description TEXT,
    encrypted_data TEXT NOT NULL, -- Encrypted JSON payload
    category TEXT, -- 'password', 'document_access', 'contact', 'note'
    created_at DATETIME DEFAULT (datetime('now')),
    updated_at DATETIME DEFAULT (datetime('now'))
);

-- Workflows (Guided processes)
CREATE TABLE IF NOT EXISTS workflows (
    id TEXT PRIMARY KEY, -- UUID
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    state_region TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
);

-- Workflow Steps
CREATE TABLE IF NOT EXISTS workflow_steps (
    id TEXT PRIMARY KEY, -- UUID
    workflow_id TEXT NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
    step_order INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    step_type TEXT NOT NULL, -- 'info', 'document_creation', 'form_input', 'ai_guidance'
    config TEXT -- JSON configuration for the step
);

-- User Progress in Workflows
CREATE TABLE IF NOT EXISTS user_progress (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    workflow_step_id TEXT NOT NULL REFERENCES workflow_steps(id),
    status TEXT DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed'
    data TEXT, -- JSON blob of input data for this step
    updated_at DATETIME DEFAULT (datetime('now')),
    UNIQUE(user_id, workflow_step_id)
);

-- AI Chat Sessions
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT,
    created_at DATETIME DEFAULT (datetime('now'))
);

-- AI Chat Messages
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id TEXT PRIMARY KEY, -- UUID
    session_id TEXT NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL, -- 'user', 'assistant'
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT (datetime('now'))
);

-- Phone Scripts
CREATE TABLE IF NOT EXISTS phone_scripts (
    id TEXT PRIMARY KEY, -- UUID
    title TEXT NOT NULL,
    scenario TEXT,
    script_body TEXT NOT NULL,
    created_at DATETIME DEFAULT (datetime('now'))
);

-- Consent Logs (Legal/Compliance)
CREATE TABLE IF NOT EXISTS consent_logs (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL, -- e.g., 'terms_accepted', 'privacy_policy_accepted'
    consent_text TEXT NOT NULL,
    ip_address TEXT,
    timestamp DATETIME DEFAULT (datetime('now'))
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY, -- UUID
    user_id TEXT REFERENCES users(id),
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL, -- 'document', 'vault_item', 'family_group'
    resource_id TEXT,
    details TEXT,
    timestamp DATETIME DEFAULT (datetime('now'))
);
