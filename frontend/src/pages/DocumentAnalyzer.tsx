import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from '../api/axios';

interface AgentResult {
  ruleBased: string;
  embedding: string;
  llm: string;
}

export default function DocumentAnalyzer() {
  const [file, setFile]   = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [text, setText]   = useState('');
  const [results, setResults] = useState<AgentResult | null>(null);
  const [adopted, setAdopted] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length) setFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'] },
    maxFiles: 1
  });

  const analyse = async () => {
    if (!file) return;
    setLoading(true);
    const form = new FormData();
    form.append('file', file);
    try {
      // upload
      const { data: up } = await axios.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // analyse
      const { data: report } = await axios.post(`/documents/${up.id}/analyse`);
      setText(report.text);
      setResults(report.results);
    } catch (e: any) {
      alert(e.response?.data?.message || 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const adopt = (sol: string) => {
    setAdopted(sol);
    alert('Solution adopted and saved to service record.');
    // TODO: POST /service-records with adopted solution
  };

  return (
    <div style={{ maxWidth: 900, margin: 'auto', marginTop: 20 }}>
      <h3>AI Document Analyser</h3>

      <div {...getRootProps({ style: { border: '2px dashed #ccc', padding: 20, textAlign: 'center', cursor: 'pointer' } })}>
        <input {...getInputProps()} />
        {isDragActive ? <p>Drop the file here …</p> : <p>Drag & drop a PDF/DOCX/TXT or click to select</p>}
      </div>

      {file && (
        <div style={{ marginTop: 12 }}>
          <p><strong>Selected:</strong> {file.name}</p>
          <button onClick={analyse} disabled={loading}>{loading ? 'Analysing…' : 'Analyse'}</button>
        </div>
      )}

      {results && (
        <>
          <h4>Agent Results – pick the best solution</h4>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <Card title="Rule-Based" sol={results.ruleBased} onAdopt={adopt} />
            <Card title="Embedding Similarity" sol={results.embedding} onAdopt={adopt} />
            <Card title="LLM" sol={results.llm} onAdopt={adopt} />
          </div>
          {adopted && <p style={{ marginTop: 12, fontWeight: 'bold' }}>Adopted: {adopted}</p>}
        </>
      )}
    </div>
  );
}

// small card component
function Card({ title, sol, onAdopt }: { title: string; sol: string; onAdopt: (s: string) => void }) {
  return (
    <div style={{ flex: 1, border: '1px solid #ddd', padding: 12, borderRadius: 4 }}>
      <h5>{title}</h5>
      <p>{sol}</p>
      <button onClick={() => onAdopt(sol)}>Adopt this solution</button>
    </div>
  );
}