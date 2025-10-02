CREATE TYPE freq AS ENUM ('daily', 'weekly', 'monthly', 'yearly', 'custom');

CREATE TABLE maintenance_schedules (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  frequency     freq NOT NULL,
  interval_days INT,                       -- used when freq='custom'
  last_done     TIMESTAMPTZ,
  next_due      TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_maint_updated BEFORE UPDATE ON maintenance_schedules
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_maint_next ON maintenance_schedules (next_due);