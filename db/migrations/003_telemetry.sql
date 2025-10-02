CREATE TABLE telemetry (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id     UUID NOT NULL REFERENCES devices(id) ON DELETE CASCADE,
  metric        TEXT NOT NULL,
  value         DOUBLE PRECISION NOT NULL,
  unit          TEXT,
  recorded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_telemetry_device_metric ON telemetry(device_id, metric);
CREATE INDEX idx_telemetry_recorded ON telemetry(recorded_at);