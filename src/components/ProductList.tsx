import React from 'react';
import { useBagStore } from '../store/bagStore';
import { cmToPx } from '../utils/scaling';

export const ProductList: React.FC = () => {
  const { products, pocketInstances, placements, addProductInstance, removeProductInstance, bag } = useBagStore();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 style={{ margin: '0 0 15px 0' }}>Product Selection</h3>
      
      {/* Available Pockets buttons */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {products.map(p => (
          <button
            key={p.id}
            onClick={() => addProductInstance(p.id)}
            style={{
              padding: '10px 15px',
              border: '1px solid #4aa0e6',
              background: '#eef6fc',
              color: '#1b63b2',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              flex: 1
            }}
          >
            Add {p.name}
          </button>
        ))}
      </div>

      <h4 style={{ margin: '0 0 10px 0' }}>Selected Pockets</h4>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {pocketInstances.length === 0 ? (
          <div style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>
            No pockets selected yet. Add some above!
          </div>
        ) : (
          pocketInstances.map((instance) => {
            const product = products.find(p => p.id === instance.pocketId)!;
            const placement = placements.find(pl => pl.id === instance.id);
            const isFitted = placement ? placement.fitted : false;

            return (
              <div 
                key={instance.id} 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#f9f9f9',
                  border: `1px solid ${isFitted ? '#eee' : '#ffcdd2'}`,
                  borderRadius: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <img 
                    src={product.imageUrl} 
                    alt={product.name} 
                    style={{ width: '30px', height: '20px', objectFit: 'contain' }}
                  />
                  <div style={{ color: '#222' }}>
                    <span style={{ fontWeight: 600 }}>{product.name}</span>
                    <div style={{ fontSize: '0.8em', color: '#555', marginTop: '2px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div>Size: {product.widthCm}x{product.heightCm} cm ({cmToPx(product.widthCm)}x{cmToPx(product.heightCm)} px)</div>
                      {isFitted && placement ? (
                        (() => {
                          const leftBin = bag?.packingAreasCm[0];
                          const rightBin = bag?.packingAreasCm[1] || leftBin;
                          const bin = placement.xCm < 35.0 ? leftBin : rightBin;
                          const offsetX = bin ? placement.xCm - bin.x : 0;
                          const offsetY = bin ? placement.yCm - bin.y : 0;

                          return (
                            <>
                              <div style={{ color: placement.xCm < 35.0 ? '#2e7d32' : '#1565c0', fontWeight: 600 }}>
                                Placed: {placement.xCm < 35.0 ? 'Left Side' : 'Right Side'}
                              </div>
                              <div>
                                Offset: x: {offsetX.toFixed(1)}cm, 
                                y: {offsetY.toFixed(1)}cm
                              </div>
                              <div>
                                Box: {placement.widthCm.toFixed(1)}x{placement.heightCm.toFixed(1)} cm
                              </div>
                              <div>Rotation: {placement.rotation}°</div>
                            </>
                          );
                        })()
                      ) : (
                        <div style={{ color: '#888', fontStyle: 'italic' }}>Not Placed</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!isFitted && (
                    <span 
                      title="Item could not be fitted in the bag usable area!" 
                      style={{ color: '#d32f2f', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      ⚠ <span style={{ fontSize: '0.85em' }}>Not Fitted</span>
                    </span>
                  )}
                  <button
                    onClick={() => removeProductInstance(instance.id)}
                    style={{
                      border: 'none',
                      background: 'none',
                      color: '#d32f2f',
                      cursor: 'pointer',
                      fontSize: '1.2em',
                      padding: '4px'
                    }}
                    title="Remove item"
                  >
                    ×
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
