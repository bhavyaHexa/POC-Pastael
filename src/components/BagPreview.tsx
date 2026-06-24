import React from 'react';
import { useBagStore } from '../store/bagStore';
import { cmToPx } from '../utils/scaling';

export const BagPreview: React.FC = () => {
  const { bag, placements } = useBagStore();

  if (!bag) {
    return (
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', color: '#888', fontStyle: 'italic' }}>
        <span>No bag selected</span>
      </div>
    );
  }

  // Bag dimensions
  const bagWidthPx = cmToPx(bag.widthCm);
  const bagHeightPx = cmToPx(bag.heightCm);

  // Compartment references
  const leftArea = bag.packingAreasCm[0];
  const rightArea = bag.packingAreasCm[1];

  // Left compartment calculation
  const leftTotalAreaCm2 = leftArea.width * leftArea.height;
  const leftTotalAreaPx2 = cmToPx(leftArea.width) * cmToPx(leftArea.height);

  // Right compartment calculation
  const rightTotalAreaCm2 = rightArea ? (rightArea.width * rightArea.height) : 0;
  const rightTotalAreaPx2 = rightArea ? (cmToPx(rightArea.width) * cmToPx(rightArea.height)) : 0;

  // Total packing area (combination of Left & Right only, excluding middle space)
  const totalUsableAreaCm2 = leftTotalAreaCm2 + rightTotalAreaCm2;
  const totalUsableAreaPx2 = leftTotalAreaPx2 + rightTotalAreaPx2;

  // Split fitted placements into Left vs Right based on x coordinates (divider around x = 35.0 cm)
  const fittedPlacements = placements.filter(pl => pl.fitted);
  
  const leftFitted = fittedPlacements.filter(pl => pl.xCm < 35.0);
  const rightFitted = fittedPlacements.filter(pl => pl.xCm >= 35.0);

  // Left Used Area
  const leftUsedAreaCm2 = leftFitted.reduce((sum, pl) => sum + (pl.widthCm * pl.heightCm), 0);
  const leftUsedAreaPx2 = leftUsedAreaCm2 * 100;
  const leftRemainingAreaCm2 = Math.max(0, leftTotalAreaCm2 - leftUsedAreaCm2);
  const leftRemainingAreaPx2 = Math.max(0, leftTotalAreaPx2 - leftUsedAreaPx2);

  // Right Used Area
  const rightUsedAreaCm2 = rightFitted.reduce((sum, pl) => sum + (pl.widthCm * pl.heightCm), 0);
  const rightUsedAreaPx2 = rightUsedAreaCm2 * 100;
  const rightRemainingAreaCm2 = Math.max(0, rightTotalAreaCm2 - rightUsedAreaCm2);
  const rightRemainingAreaPx2 = Math.max(0, rightTotalAreaPx2 - rightUsedAreaPx2);

  // Combined Used/Remaining Area
  const usedAreaCm2 = leftUsedAreaCm2 + rightUsedAreaCm2;
  const usedAreaPx2 = leftUsedAreaPx2 + rightUsedAreaPx2;
  const remainingAreaCm2 = leftRemainingAreaCm2 + rightRemainingAreaCm2;
  const remainingAreaPx2 = leftRemainingAreaPx2 + rightRemainingAreaPx2;

  // Utilization percentage
  const utilizationPercent = Math.min(100, Math.round((usedAreaCm2 / totalUsableAreaCm2) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '15px' }}>
      <h3 style={{ margin: '0 0 10px 0', color: 'inherit' }}>Bag Preview</h3>
      
      {/* Bag Thumbnail */}
      <div style={{ 
        background: '#fafafa', 
        border: '1px solid #eee', 
        borderRadius: '6px', 
        padding: '10px', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '110px'
      }}>
        <img 
          src={bag.imageUrl} 
          alt={bag.name} 
          style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
        />
      </div>

      {/* Bag Name */}
      <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.1em', color: 'inherit' }}>
        {bag.name} ({bag.widthCm} × {bag.heightCm} cm / {bagWidthPx} × {bagHeightPx} px)
      </div>

      {/* Total Dimensions Card */}
      <div style={{ 
        background: '#fcfcfc', 
        border: '1px solid #eaeaea', 
        borderRadius: '6px', 
        padding: '10px',
        fontSize: '0.9em',
        color: '#222'
      }}>
        <div style={{ fontWeight: 600, color: '#555', marginBottom: '6px', borderBottom: '1px solid #eee', paddingBottom: '3px' }}>
          Total Bag Dimensions
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ color: '#555' }}>Centimeters:</span>
          <strong>{bag.widthCm} × {bag.heightCm} cm</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Pixels:</span>
          <strong>{bagWidthPx} × {bagHeightPx} px</strong>
        </div>
      </div>

      {/* Left Compartment Tracker Card */}
      <div style={{ 
        background: '#fafafa', 
        border: '1px solid #e6e6e6', 
        borderRadius: '6px', 
        padding: '10px',
        fontSize: '0.85em',
        color: '#222'
      }}>
        <div style={{ fontWeight: 600, color: '#2e7d32', borderBottom: '1px solid #e0e0e0', paddingBottom: '3px', marginBottom: '6px' }}>
          Left Side Packing Area
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ color: '#555' }}>Total Space Available:</span>
          <strong>{leftArea.width.toFixed(1)} × {leftArea.height.toFixed(1)} cm ({leftTotalAreaCm2.toFixed(0)} cm² / {leftTotalAreaPx2.toLocaleString()} px²)</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
          <span style={{ color: '#555' }}>Used Space:</span>
          <strong style={{ color: '#e65100' }}>{leftUsedAreaCm2.toFixed(1)} cm² ({leftUsedAreaPx2.toLocaleString()} px²)</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Remaining Space:</span>
          <strong style={{ color: '#2e7d32' }}>{leftRemainingAreaCm2.toFixed(1)} cm² ({leftRemainingAreaPx2.toLocaleString()} px²)</strong>
        </div>
      </div>

      {/* Right Compartment Tracker Card */}
      {rightArea && (
        <div style={{ 
          background: '#fafafa', 
          border: '1px solid #e6e6e6', 
          borderRadius: '6px', 
          padding: '10px',
          fontSize: '0.85em',
          color: '#222'
        }}>
          <div style={{ fontWeight: 600, color: '#1565c0', borderBottom: '1px solid #e0e0e0', paddingBottom: '3px', marginBottom: '6px' }}>
            Right Side Packing Area
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#555' }}>Total Space Available:</span>
            <strong>{rightArea.width.toFixed(1)} × {rightArea.height.toFixed(1)} cm ({rightTotalAreaCm2.toFixed(0)} cm² / {rightTotalAreaPx2.toLocaleString()} px²)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
            <span style={{ color: '#555' }}>Used Space:</span>
            <strong style={{ color: '#e65100' }}>{rightUsedAreaCm2.toFixed(1)} cm² ({rightUsedAreaPx2.toLocaleString()} px²)</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#555' }}>Remaining Space:</span>
            <strong style={{ color: '#1565c0' }}>{rightRemainingAreaCm2.toFixed(1)} cm² ({rightRemainingAreaPx2.toLocaleString()} px²)</strong>
          </div>
        </div>
      )}

      {/* Combined Remaining Space Calculations Card */}
      <div style={{ 
        background: '#f9fbfd', 
        border: '1px solid #e2ecf7', 
        borderRadius: '6px', 
        padding: '10px',
        fontSize: '0.85em',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        color: '#222'
      }}>
        <div style={{ fontWeight: 600, color: '#1b63b2', borderBottom: '1px solid #d3e3f4', paddingBottom: '3px' }}>
          Combined Remaining Space Tracker
        </div>

        {/* Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85em', color: '#555', marginBottom: '3px' }}>
            <span>Space Utilized:</span>
            <strong>{utilizationPercent}%</strong>
          </div>
          <div style={{ background: '#e9ecef', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
            <div style={{ 
              background: utilizationPercent > 90 ? '#f44336' : (utilizationPercent > 70 ? '#ff9800' : '#4CAF50'), 
              width: `${utilizationPercent}%`, 
              height: '100%',
              transition: 'width 0.3s ease, background-color 0.3s ease'
            }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Total Space (Left + Right Only):</span>
          <strong>{totalUsableAreaCm2.toFixed(0)} cm² ({totalUsableAreaPx2.toLocaleString()} px²)</strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Total Space Used:</span>
          <strong style={{ color: '#e65100' }}>
            {usedAreaCm2.toFixed(1)} cm² ({usedAreaPx2.toLocaleString()} px²)
          </strong>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#555' }}>Total Space Remaining:</span>
          <strong style={{ color: '#2e7d32' }}>
            {remainingAreaCm2.toFixed(1)} cm² ({remainingAreaPx2.toLocaleString()} px²)
          </strong>
        </div>
      </div>
    </div>
  );
};
