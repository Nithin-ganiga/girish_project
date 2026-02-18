import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import NetworkGraph from '../components/NetworkGraph';
import MetricsPanel from '../components/MetricsPanel';

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();

  if (!location.state) {
    return <Navigate to="/" replace />;
  }

  const { result, nodes, spans } = location.state;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>DWDM Link Planner — Results</h1>

      <NetworkGraph nodes={nodes} spans={spans} feasible={result.feasible} />

      <MetricsPanel result={result} />

      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: 20,
          padding: '10px 32px',
          fontSize: 16,
          fontWeight: 'bold',
          backgroundColor: '#6b7280',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Back
      </button>
    </div>
  );
}
