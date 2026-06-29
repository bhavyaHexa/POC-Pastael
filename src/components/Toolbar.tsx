import React from 'react';
import { useBagStore } from '../store/bagStore';

export const Toolbar: React.FC = () => {
  const { mode, setMode, reset, runAutoArrange } = useBagStore();

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: 'transparent',
      padding: '8px 0',
      width: '100%',
    }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => {
            setMode('auto');
            runAutoArrange();
          }}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            background: mode === 'auto' 
              ? 'linear-gradient(135deg, #6366f1, #a855f7)' 
              : 'rgba(255, 255, 255, 0.05)',
            color: mode === 'auto' ? '#fff' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'auto' ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        >
          Pack It For Me (Auto)
        </button>

        <button
          onClick={() => setMode('manual')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '10px',
            background: mode === 'manual' 
              ? 'linear-gradient(135deg, #6366f1, #a855f7)' 
              : 'rgba(255, 255, 255, 0.05)',
            color: mode === 'manual' ? '#fff' : '#94a3b8',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: mode === 'manual' ? '0 0 15px rgba(99, 102, 241, 0.4)' : 'none',
          }}
        >
          Customize Layout (Manual)
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Mode: <strong style={{ color: '#fff' }}>{mode === 'auto' ? 'Auto Arrange' : 'Manual Edit'}</strong>
        </span>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.02)',
            color: '#f8f9fa',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            e.currentTarget.style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = '#f8f9fa';
          }}
        >
          Reset Layout
        </button>
      </div>
    </div>
  );
};
