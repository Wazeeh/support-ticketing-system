-- ============================================================
-- Support Ticketing System — Full Database Schema
-- PostgreSQL 14+
-- Assembled from spec sections 1.2 – 1.10
-- Run top to bottom. Order matters (FK dependencies).
-- ============================================================

-- ------------------------------------------------------------
-- 1.2 ENUM TYPES
-- ------------------------------------------------------------

CREATE TYPE software_type AS ENUM ('TMS', 'FINMAN');

CREATE TYPE issue_category AS ENUM (
  -- TMS categories
  'LOGIN', 'ENROLLMENT', 'ASSESSMENT', 'CERTIFICATION', 'COURSE_DATA',
  'BATCH_DATA', 'TRAINEE_DATA', 'CLAIM_1_BILLING', 'CLAIM_2_BILLING',
  'CLAIM_3_BILLING',
  -- Finman categories (LOGIN and OTHER are shared/reused)
  'LEDGER', 'BUDGET', 'SOE', 'DOUBLE_COLUMN_CASHBOOK',
  -- Shared
  'OTHER'
);

CREATE TYPE ticket_status AS ENUM (
  'SUBMITTED',
  'ACCEPTED',
  'ASSIGNED',
  'IN_PROGRESS',
  'COMPLETED',
  'CLOSED',
  'REOPENED'
);

CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

CREATE TYPE user_role AS ENUM ('ADMIN', 'DEVELOPER', 'CLIENT_PORTAL', 'SYSTEM');

CREATE TYPE audit_action AS ENUM (
  'CREATED', 'PRIORITY_SET', 'ASSIGNED', 'REASSIGNED', 'ROUTED_TO_ADMIN',
  'STATUS_CHANGED', 'REPLY_ADDED', 'CLOSED', 'REOPENED', 'ATTACHMENT_ADDED'
);

-- ------------------------------------------------------------
-- 1.3 PIU / TI hierarchy
-- ------------------------------------------------------------

CREATE TABLE piu (
  id SERIAL PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ti (
  id SERIAL PRIMARY KEY,
  piu_id INT NOT NULL REFERENCES piu(id) ON DELETE RESTRICT,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (piu_id, code)
);

CREATE INDEX idx_ti_piu_id ON ti(piu_id) WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- 1.4 Users (ADMIN / DEVELOPER log in; CLIENT_PORTAL & SYSTEM are logical roles only)
-- ------------------------------------------------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_role ON users(role) WHERE is_active = TRUE;

-- ------------------------------------------------------------
-- 1.5 Tickets (core table)
-- ------------------------------------------------------------

CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  tracking_number VARCHAR(30) NOT NULL UNIQUE,

  piu_id INT NOT NULL REFERENCES piu(id) ON DELETE RESTRICT,
  ti_id INT NOT NULL REFERENCES ti(id) ON DELETE RESTRICT,
  software software_type NOT NULL,
  issue_category issue_category NOT NULL,
  other_description TEXT,

  submitter_name VARCHAR(255) NOT NULL,
  submitter_email VARCHAR(255) NOT NULL,
  submitter_phone VARCHAR(50),

  description TEXT NOT NULL,

  status ticket_status NOT NULL DEFAULT 'SUBMITTED',
  priority ticket_priority,
  assigned_to_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  accepted_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  accepted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT chk_other_description
    CHECK (issue_category <> 'OTHER' OR other_description IS NOT NULL)
);

CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_tickets_software ON tickets(software);
CREATE INDEX idx_tickets_category ON tickets(issue_category);
CREATE INDEX idx_tickets_piu ON tickets(piu_id);
CREATE INDEX idx_tickets_ti ON tickets(ti_id);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to_user_id);
CREATE INDEX idx_tickets_created_at ON tickets(created_at);
CREATE INDEX idx_tickets_completed_at ON tickets(completed_at);
CREATE INDEX idx_tickets_tracking_no ON tickets(tracking_number);

-- Composite index tuned for the Analytics Report's most common filter combo
CREATE INDEX idx_tickets_report_composite
  ON tickets(software, issue_category, piu_id, created_at);

-- ------------------------------------------------------------
-- 1.6 Tracking number generation (TKT-YYYY-NNNNNN)
-- ------------------------------------------------------------

CREATE SEQUENCE ticket_tracking_seq START 1;

CREATE OR REPLACE FUNCTION generate_tracking_number() RETURNS TRIGGER AS $$
BEGIN
  NEW.tracking_number := 'TKT-' || to_char(now(), 'YYYY') || '-' ||
    LPAD(nextval('ticket_tracking_seq')::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_tracking_number
  BEFORE INSERT ON tickets
  FOR EACH ROW
  WHEN (NEW.tracking_number IS NULL)
  EXECUTE FUNCTION generate_tracking_number();

-- ------------------------------------------------------------
-- 1.7 Attachments
-- ------------------------------------------------------------

CREATE TABLE ticket_attachments (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  storage_key VARCHAR(500) NOT NULL,
  mime_type VARCHAR(150) NOT NULL,
  size_bytes BIGINT NOT NULL CHECK (size_bytes > 0),
  uploaded_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_attachments_ticket_id ON ticket_attachments(ticket_id);

-- Defense-in-depth backstop for the 10-file / 20MB cumulative limit
-- (primary enforcement is at the application layer, §5.2)
CREATE OR REPLACE FUNCTION enforce_attachment_limits() RETURNS TRIGGER AS $$
DECLARE
  total_size BIGINT;
  total_count INT;
BEGIN
  SELECT COALESCE(SUM(size_bytes), 0) + NEW.size_bytes, COUNT(*) + 1
  INTO total_size, total_count
  FROM ticket_attachments WHERE ticket_id = NEW.ticket_id;

  IF total_count > 10 THEN
    RAISE EXCEPTION 'Attachment limit exceeded: max 10 files per ticket';
  END IF;

  IF total_size > 20 * 1024 * 1024 THEN
    RAISE EXCEPTION 'Attachment size limit exceeded: max 20MB cumulative per ticket';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_enforce_attachment_limits
  BEFORE INSERT ON ticket_attachments
  FOR EACH ROW EXECUTE FUNCTION enforce_attachment_limits();

-- ------------------------------------------------------------
-- 1.8 Replies
-- NOTE: the source spec PDF did not extract this table's DDL cleanly
-- (a text-extraction gap between the "Replies" heading and the next
-- section). The columns below are reconstructed from how ticket_replies
-- is referenced elsewhere in the spec: §3.3 POST /admin/tickets/:id/reply
-- (message, close_ticket -> is_closing_reply), §3.1 tracking response
-- (author_role via join to users), and §4.2 (REPLY_ADDED audit action).
-- Confirm against the original spec doc if you have the un-flattened version.
-- ------------------------------------------------------------

CREATE TABLE ticket_replies (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  author_user_id INT REFERENCES users(id) ON DELETE SET NULL, -- NULL = system-generated
  message TEXT NOT NULL, -- sanitized HTML, same rules as tickets.description
  is_closing_reply BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ticket_replies_ticket_id ON ticket_replies(ticket_id, created_at);

-- ------------------------------------------------------------
-- 1.9 Audit logs (append-only)
-- ------------------------------------------------------------

CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  actor_id INT REFERENCES users(id),
  action audit_action NOT NULL,
  from_value VARCHAR(100),
  to_value VARCHAR(100),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_ticket_id ON audit_logs(ticket_id, created_at);
CREATE INDEX idx_audit_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- ------------------------------------------------------------
-- 1.10 Notifications (Admin "unread" badges)
-- ------------------------------------------------------------

CREATE TABLE notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ticket_id BIGINT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'NEW_TICKET', 'ASSIGNED_TO_YOU', etc.
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;

-- ------------------------------------------------------------
-- Optional: seed data for local testing
-- ------------------------------------------------------------

INSERT INTO piu (code, name) VALUES
  ('PIU-DHK', 'PIU - Dhaka Region'),
  ('PIU-CTG', 'PIU - Chattogram Region');

INSERT INTO ti (piu_id, code, name) VALUES
  (1, 'TI-014', 'Dhaka Technical Institute'),
  (2, 'TI-021', 'Chattogram Technical Institute');

-- Password hash below is a placeholder — replace with a real bcrypt/argon2 hash
-- generated by the backend, never insert plaintext passwords.
INSERT INTO users (full_name, email, password_hash, role) VALUES
  ('Admin User', 'admin@example.com', 'REPLACE_WITH_REAL_HASH', 'ADMIN'),
  ('John Dev', 'john.dev@example.com', 'REPLACE_WITH_REAL_HASH', 'DEVELOPER');

-- ============================================================
-- End of schema
-- Verify with: \dt   (should list 8 tables:
-- piu, ti, users, tickets, ticket_attachments, ticket_replies,
-- audit_logs, notifications)
-- ============================================================
