import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function DueBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const poll = () => axios.get('/maintenance/due').then(r => setCount(r.data.length)).catch(() => {});
    poll();                                    // initial
    const id = setInterval(poll, 30000);       // every 30 s
    return () => clearInterval(id);
  }, []);

  if (!count) return null;
  return <span style={{ background: '#e00', color: '#fff', borderRadius: 10, padding: '2px 6px', fontSize: 12 }}>{count}</span>;
}