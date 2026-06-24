import React from 'react';
import { useBagStore } from '../store/bagStore';

export const Summary: React.FC = () => {
  const { placements, pocketInstances } = useBagStore();

  const totalSelected = pocketInstances.length;
  const totalFitted = placements.filter(p => p.fitted).length;
  const totalNotFitted = totalSelected - totalFitted;

  return (
    <div>
      <h3 style={{ margin: '0 0 10px 0' }}>Summary</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '1.05em' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Selected Items:</span>
          <strong style={{ color: '#333' }}>{totalSelected}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Fitted Items:</span>
          <strong style={{ color: '#4CAF50' }}>{totalFitted}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Not Fitted:</span>
          <strong style={{ color: totalNotFitted > 0 ? '#f44336' : '#333' }}>
            {totalNotFitted}
          </strong>
        </div>
      </div>
    </div>
  );
};
