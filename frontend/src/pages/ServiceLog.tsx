import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

const ServiceLog: React.FC = () => {
  const [logs, setLogs] = useState([]);
  useEffect(() => { axios.get('/services').then(r => setLogs(r.data)).catch(console.error); }, []);

  return (
    <>
      <h3>Service Records</h3>
      <table border={1} cellPadding={6}>
        <thead><tr><th>Device</th><th>Summary</th><th>Status</th><th>Technician</th><th>Started</th></tr></thead>
        <tbody>
          {logs.map((l: any) => (
            <tr key={l.id}>
              <td>{l.serial_number} ({l.model})</td>
              <td>{l.summary}</td>
              <td>{l.status}</td>
              <td>{l.technician_name}</td>
              <td>{new Date(l.started_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default ServiceLog;