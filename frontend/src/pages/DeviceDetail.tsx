import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

interface Tel {
  recorded_at: string;
  metric: string;
  value: number;
  unit: string;
}
interface Anomaly {
  latest: number;
  alerts: string[];
}

export default function DeviceDetail() {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<any | null>(null);
  const [telemetry, setTelemetry] = useState<Tel[]>([]);
  const [anomaly, setAnomaly] = useState<Anomaly | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000); // 10 s poll
    return () => clearInterval(id);
  }, [id]);

  const load = async () => {
    try {
      const [devRes, telRes, anomRes] = await Promise.all([
        axios.get(`/devices/${id}`),
        axios.get(`/telemetry/${id}`),
        axios.get(`/telemetry/${id}/anomalies`)
      ]);
      setDevice(devRes.data);
      setTelemetry(telRes.data || []);
      setAnomaly(anomRes.data || null);
    } catch (e: any) {
      console.error(e);
      setDevice(null);
      setTelemetry([]);
      setAnomaly(null);
    } finally {
      setLoading(false);
    }
  };

  const chartData = telemetry && telemetry.length > 0 ? {
  labels: telemetry.map(t => new Date(t.recorded_at).toLocaleTimeString()),
  datasets: [
    {
      label: 'Temperature (°C)',
      data: telemetry.filter(t => t.metric === 'temp').map(t => t.value),
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }
  ]
} : { labels: [], datasets: [] };

  // Check if anomaly exists and has enough alerts before defining the banner
  const banner = (anomaly && anomaly.alerts && anomaly.alerts.length >= 2) ? (
  <div style={{ background: '#e74c3c', color: '#fff', padding: 12, marginBottom: 12 }}>
    Predictive maintenance suggested – {anomaly.alerts.length} agents agree.
  </div>
) : null;

  if (loading) return <p>Loading…</p>;
  if (!device) return <p>Device not found</p>;

  return (
    <>
      <h3>Device: {device.serial_number} ({device.model})</h3>
      {banner}
      <h4>Live Telemetry</h4>
      {telemetry.length ? (
        <Line data={chartData} />
      ) : (
        <p>No telemetry yet – send some data.</p>
      )}
      <h4>Anomaly Report</h4>
      {anomaly && anomaly.alerts.length > 0 ? (
        <ul>
          {anomaly.alerts.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      ) : (
        <p>No anomalies detected.</p>
      )}
    </>
  );
}
