import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

interface Maint {
  id: string;
  title: string;
  description: string;
  frequency: string;
  next_due: string;
  last_done: string | null;
  serial_number: string;
  model: string;
}

export default function MaintenanceCalendar() {
  const [list, setList] = useState<Maint[]>([]);

  useEffect(() => { load(); }, []);

  const load = () => axios.get('/maintenance').then(r => setList(r.data)).catch(console.error);

  const complete = (id: string) => {
    axios.put(`/maintenance/${id}/complete`).then(load).catch(() => alert('Complete failed'));
  };

  return (
    <>
      <h3>Maintenance Calendar</h3>
      <Link to="/maintenance/new"><button>Add Schedule</button></Link>
      <table border={1} cellPadding={8} style={{ marginTop: 8 }}>
        <thead>
			<tr>
			<th>Device</th><th>Title</th><th>Description</th><th>Frequency</th><th>Last Done</th><th>Next Due</th><th style={{ textAlign: 'center' }}>Action</th>
			</tr>
		</thead>
        <tbody>
          {list.map(m => (
            <tr key={m.id}>
              <td>{m.serial_number} ({m.model})</td>
              <td>{m.title}</td>
              <td>{m.description}</td>
              <td>{m.frequency}</td>
              <td>{m.last_done ? new Date(m.last_done).toLocaleDateString() : '-'}</td>
              <td>{new Date(m.next_due).toLocaleDateString()}</td>
              <td style={{ textAlign: 'center' }}>
					{new Date(m.next_due) <= new Date() ? (
					<button onClick={() => complete(m.id)}>Mark Complete</button>
						) : (
							<span>Upcoming</span>
							)}
			  </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

