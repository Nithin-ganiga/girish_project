import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkFeasibility } from '../api/plannerApi';

const PRESETS = {
  PASS: {
    length_km: 50,
    connectors: 2,
    splices: 6,
    amplifier_gain_db: 20,
    tx_power_dbm: 2,
    receiver_sensitivity_dbm: -28,
    osnr_threshold_db: 12,
  },
  MEDIUM: {
    length_km: 80,
    connectors: 4,
    splices: 10,
    amplifier_gain_db: 15,
    tx_power_dbm: 1,
    receiver_sensitivity_dbm: -24,
    osnr_threshold_db: 13,
  },
  FAIL: {
    length_km: 120,
    connectors: 6,
    splices: 15,
    amplifier_gain_db: 5,
    tx_power_dbm: 0,
    receiver_sensitivity_dbm: -20,
    osnr_threshold_db: 20,
  },
};

const FIELD_LABELS = {
  length_km: 'Length (km)',
  connectors: 'Connectors',
  splices: 'Splices',
  amplifier_gain_db: 'Amplifier Gain (dB)',
  tx_power_dbm: 'Tx Power (dBm)',
  receiver_sensitivity_dbm: 'Receiver Sensitivity (dBm)',
  osnr_threshold_db: 'OSNR Threshold (dB)',
};

const FIELD_ORDER = [
  'length_km',
  'connectors',
  'splices',
  'amplifier_gain_db',
  'tx_power_dbm',
  'receiver_sensitivity_dbm',
  'osnr_threshold_db',
];

function buildPayload(form) {
  return {
    nodes: [
      { id: 'A', label: 'Site A' },
      { id: 'B', label: 'Site B' },
    ],
    spans: [
      {
        from: 'A',
        to: 'B',
        length_km: Number(form.length_km),
        connectors: Number(form.connectors),
        splices: Number(form.splices),
        amp_gain_db: Number(form.amplifier_gain_db),
        amp_penalty_db: 1.0,
      },
    ],
    service: {
      tx_power_dbm: Number(form.tx_power_dbm),
      receiver_sensitivity_dbm: Number(form.receiver_sensitivity_dbm),
      osnr_threshold_db: Number(form.osnr_threshold_db),
      noise_penalty_db: 3.0,
    },
    assumptions: {
      atten_db_per_km: 0.22,
      conn_loss_db: 0.5,
      splice_loss_db: 0.1,
    },
  };
}

export default function InputPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(PRESETS.PASS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handlePreset = (key) => {
    setForm(PRESETS[key]);
    setError(null);
  };

  const handleCalculate = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = buildPayload(form);
      const result = await checkFeasibility(payload);
      navigate('/result', {
        state: {
          result,
          nodes: payload.nodes,
          spans: payload.spans,
        },
      });
    } catch (err) {
      console.error(err);
      setError('Calculation failed. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1>DWDM Link Planner</h1>

      <div style={{ marginBottom: 20, display: 'flex', gap: 10 }}>
        {Object.keys(PRESETS).map((key) => (
          <button
            key={key}
            onClick={() => handlePreset(key)}
            style={{
              padding: '8px 20px',
              fontSize: 14,
              fontWeight: 'bold',
              backgroundColor:
                key === 'PASS' ? '#22c55e' : key === 'FAIL' ? '#ef4444' : '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            {key}
          </button>
        ))}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          marginBottom: 24,
          padding: 20,
          border: '1px solid #ddd',
          borderRadius: 8,
        }}
      >
        {FIELD_ORDER.map((field) => (
          <div key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontWeight: 'bold', fontSize: 13 }}>{FIELD_LABELS[field]}</label>
            <input
              type="number"
              value={form[field]}
              onChange={(e) => handleChange(field, e.target.value)}
              style={{
                padding: '8px 12px',
                fontSize: 14,
                border: '1px solid #ccc',
                borderRadius: 4,
              }}
            />
          </div>
        ))}
      </div>

      {error && (
        <div style={{ color: '#ef4444', marginBottom: 16, fontWeight: 'bold' }}>{error}</div>
      )}

      <button
        onClick={handleCalculate}
        disabled={loading}
        style={{
          padding: '10px 32px',
          fontSize: 16,
          fontWeight: 'bold',
          backgroundColor: '#3b82f6',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? 'Calculating...' : 'Calculate'}
      </button>
    </div>
  );
}
