import React, { useState } from 'react';
import axios from '../api/axios';

interface Node {
  id: string;
  question?: string;
  solution?: string;
  yes?: Node;
  no?: Node;
}

const DiagnosticWizard: React.FC = () => {
  const [node, setNode]   = useState<Node | null>(null);
  const [path, setPath]   = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // kick-off wizard
  React.useEffect(() => {
    axios.post('/diagnostics/start')
      .then(res => { setNode(res.data.node); setLoading(false); })
      .catch(() => { alert('Failed to load diagnostic tree'); setLoading(false); });
  }, []);

  const choose = (dir: 'yes' | 'no') => {
    const newPath = [...path, dir];
    setLoading(true);
    axios.post('/diagnostics/next', { path: newPath })
      .then(res => { setNode(res.data.node); setPath(newPath); setLoading(false); })
      .catch(() => { alert('Diagnostic error'); setLoading(false); });
  };

  const reset = () => { setPath([]); setNode(null); window.location.reload(); };

  if (loading) return <p>Loading diagnostic tree…</p>;
  if (!node) return <p>Tree unavailable.</p>;

  // final answer node
  if (node.solution) {
    return (
      <div style={{ maxWidth: 600, margin: 'auto', marginTop: 20 }}>
        <h3>Recommended Action</h3>
        <p>{node.solution}</p>
        <button onClick={reset}>Start Over</button>
      </div>
    );
  }

  // question node
  return (
    <div style={{ maxWidth: 600, margin: 'auto', marginTop: 20 }}>
      <h3>Diagnostic Wizard</h3>
      <p>{node.question}</p>
      <div style={{ marginTop: 12 }}>
        <button onClick={() => choose('yes')} style={{ marginRight: 8 }}>Yes</button>
        <button onClick={() => choose('no')}>No</button>
      </div>
    </div>
  );
};

export default DiagnosticWizard;