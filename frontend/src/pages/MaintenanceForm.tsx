import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

interface Device { id: string; serial_number: string; model: string }

export default function MaintenanceForm() {
  const nav = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState({
    deviceId: '',
    title: '',
    description: '',
    frequency: 'weekly',
    intervalDays: ''
  });

  useEffect(() => { axios.get('/devices').then(r => setDevices(r.data)).catch(console.error); }, []);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { ...form, intervalDays: form.frequency === 'custom' ? parseInt(form.intervalDays) : undefined };
    try {
      await axios.post('/maintenance', body);
      nav('/maintenance');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Save failed');
    }
  };

  return (
    <div style={{ maxWidth: 500, margin: 'auto', marginTop: 20 }}>
      <h3>Add Maintenance Schedule</h3>
      <form onSubmit={submit}>
        <label>Device</label><br />
        <select name="deviceId" value={form.deviceId} onChange={handle} required>
          <option value="">-- choose --</option>
          {devices.map(d => (
            <option key={d.id} value={d.id}>{d.serial_number} ({d.model})</option>
          ))}
        </select><br />

        <label>Title</label><br />
        <input name="title" value={form.title} onChange={handle} required /><br />

        <label>Description</label><br />
        <input name="description" value={form.description} onChange={handle} /><br />

        <label>Frequency</label><br />
        <select name="frequency" value={form.frequency} onChange={handle}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
          <option value="custom">Custom (days)</option>
        </select><br />

        {form.frequency === 'custom' && (
          <>
            <label>Interval (days)</label><br />
            <input type="number" name="intervalDays" value={form.intervalDays} onChange={handle} min="1" required /><br />
          </>
        )}

        <button type="submit">Save Schedule</button>
      </form>
    </div>
  );
}