import React, { useState } from 'react';
import axios from '../api/axios';

const DeviceForm: React.FC = () => {
  const [form, setForm] = useState({
    serialNumber: '',
    manufacturer: '',
    model: '',
    location: '',
    ownerId: '',
  });

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/devices', form);
      alert('Device added');
      setForm({ serialNumber: '', manufacturer: '', model: '', location: '', ownerId: '' });
    } catch (err: any) {
      alert(err.response?.data?.message || 'Add failed');
    }
  };

  return (
    <div>
      <h3>Add Device</h3>
      <form onSubmit={submit}>
        <input name="serialNumber" placeholder="Serial Number" value={form.serialNumber} onChange={handle} required /><br />
        <input name="manufacturer" placeholder="Manufacturer" value={form.manufacturer} onChange={handle} required /><br />
        <input name="model" placeholder="Model" value={form.model} onChange={handle} required /><br />
        <input name="location" placeholder="Location" value={form.location} onChange={handle} /><br />
        <input name="ownerId" placeholder="Owner UUID (opt)" value={form.ownerId} onChange={handle} /><br />
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default DeviceForm;