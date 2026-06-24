import React from 'react';
import { useBagStore } from '../store/bagStore';

export const Toolbar: React.FC = () => {
  const { mode, setMode, reset, runAutoArrange } = useBagStore();

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      background: '#fafafa',
      padding: '10px 20px',
      borderRadius: '8px',
      border: '1px solid #eee'
    }}>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={() => {
            setMode('auto');
            runAutoArrange();
          }}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: mode === 'auto' ? '#1b63b2' : '#eaeaea',
            color: mode === 'auto' ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Pack It For Me (Auto)
        </button>

        <button
          onClick={() => setMode('manual')}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            background: mode === 'manual' ? '#1b63b2' : '#eaeaea',
            color: mode === 'manual' ? '#fff' : '#333',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Customize Layout (Manual)
        </button>
      </div>

      <div>
        <span style={{ marginRight: '15px', color: '#666', fontSize: '0.9em' }}>
          Current Mode: <strong>{mode === 'auto' ? 'Auto Arrange' : 'Manual Edit'}</strong>
        </span>
        <button
          onClick={reset}
          style={{
            padding: '10px 20px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            background: '#fff',
            color: '#333',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          Reset Layout
        </button>
      </div>
    </div>
  );
};
