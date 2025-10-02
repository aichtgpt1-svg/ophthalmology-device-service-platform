import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';


const DeviceList: React.FC = () => {
  const [list, setList] = useState([]);
  useEffect(() => { axios.get('/devices').then(r => setList(r.data)).catch(console.error); }, []);

  return (
    <>
      <h3>Devices</h3>
      <Link to="/devices/new"><button>Add Device</button></Link>
	  <Link to="/diagnostics"><button style={{ marginLeft: 8 }}>Diagnose Issue</button></Link>
      <table border={1} cellPadding={6} style={{ marginTop: 8 }}>
        <thead><tr><th>Serial</th><th>Manufacturer</th><th>Model</th><th>Owner</th></tr></thead>
        <tbody>
          {list.length ? (
            list.map((d: any) => (
              <tr key={d.id}>
				<td><Link to={`/devices/${d.id}`}>{d.serial_number}</Link></td>
				<td>{d.manufacturer}</td>
				<td>{d.model}</td>
				<td>{d.owner_name||'-'}</td>
			  </tr>
            ))
          ) : (
            <tr><td colSpan={4}>No devices</td></tr>
          )}
        </tbody>
      </table>
    </>
  );
};

export default DeviceList;