import React from 'react';
import { useBagStore } from '../store/bagStore';
import { cmToPx, pxToCm } from '../utils/scaling';
import { intersects } from '../utils/collision';
import { isInside } from '../utils/geometry';

export const BagCanvas: React.FC = () => {
  const { bag, placements, products, updatePlacement, mode, removeProductInstance } = useBagStore();
  const svgRef = React.useRef<SVGSVGElement | null>(null);

  const [draggedId, setDraggedId] = React.useState<string | null>(null);
  const [dragOffset, setDragOffset] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [tempPos, setTempPos] = React.useState<{ xCm: number; yCm: number } | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);

  if (!bag) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>No bag selected</h3>
      </div>
    );
  }

  // Convert bag dimensions from cm to px
  const svgWidth = cmToPx(bag.widthCm);
  const svgHeight = cmToPx(bag.heightCm);

  const getSvgCoords = (clientX: number, clientY: number) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * svgWidth;
    const svgY = ((clientY - rect.top) / rect.height) * svgHeight;
    return { x: svgX, y: svgY };
  };

  const handleMouseDown = (e: React.MouseEvent<SVGElement>, plId: string) => {
    setSelectedId(plId);
    if (mode !== 'manual') return;
    e.preventDefault();
    const placement = placements.find(p => p.id === plId);
    if (!placement) return;

    const coords = getSvgCoords(e.clientX, e.clientY);
    const itemXPx = cmToPx(placement.xCm);
    const itemYPx = cmToPx(placement.yCm);

    setDraggedId(plId);
    setDragOffset({ x: coords.x - itemXPx, y: coords.y - itemYPx });
    setTempPos({ xCm: placement.xCm, yCm: placement.yCm });
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggedId || tempPos === null || mode !== 'manual') return;
    const placement = placements.find(p => p.id === draggedId);
    if (!placement) return;

    const coords = getSvgCoords(e.clientX, e.clientY);
    const proposedXPx = coords.x - dragOffset.x;
    const proposedYPx = coords.y - dragOffset.y;

    const newXCm = pxToCm(proposedXPx);
    const newYCm = pxToCm(proposedYPx);

    setTempPos({ 
      xCm: Number(newXCm.toFixed(2)), 
      yCm: Number(newYCm.toFixed(2)) 
    });
  };

  const handleMouseUp = () => {
    if (!draggedId || !tempPos || mode !== 'manual') return;
    const placement = placements.find(p => p.id === draggedId);
    if (!placement) {
      setDraggedId(null);
      setTempPos(null);
      return;
    }

    const proposedRect = {
      x: tempPos.xCm,
      y: tempPos.yCm,
      width: placement.widthCm,
      height: placement.heightCm
    };

    let insideBin = false;
    for (const bin of bag.packingAreasCm) {
      if (isInside(proposedRect, bin)) {
        insideBin = true;
        break;
      }
    }

    let overlaps = false;
    if (insideBin) {
      for (const pl of placements) {
        if (pl.id === draggedId || !pl.fitted) continue;
        const otherRect = {
          x: pl.xCm,
          y: pl.yCm,
          width: pl.widthCm,
          height: pl.heightCm
        };
        if (intersects(proposedRect, otherRect)) {
          overlaps = true;
          break;
        }
      }
    }

    if (insideBin && !overlaps) {
      updatePlacement(draggedId, {
        xCm: tempPos.xCm,
        yCm: tempPos.yCm
      });
    } else {
      console.log("Invalid placement (overlaps or outside compartment). Reverting position.");
    }

    setDraggedId(null);
    setTempPos(null);
  };

  const handleDoubleClick = (plId: string) => {
    if (mode !== 'manual') return;
    const placement = placements.find(p => p.id === plId);
    if (!placement) return;

    const newRotation = placement.rotation === 0 ? 90 : 0;
    const newWidthCm = placement.heightCm;
    const newHeightCm = placement.widthCm;

    const proposedRect = {
      x: placement.xCm,
      y: placement.yCm,
      width: newWidthCm,
      height: newHeightCm
    };

    let insideBin = false;
    for (const bin of bag.packingAreasCm) {
      if (isInside(proposedRect, bin)) {
        insideBin = true;
        break;
      }
    }

    let overlaps = false;
    if (insideBin) {
      for (const pl of placements) {
        if (pl.id === plId || !pl.fitted) continue;
        const otherRect = {
          x: pl.xCm,
          y: pl.yCm,
          width: pl.widthCm,
          height: pl.heightCm
        };
        if (intersects(proposedRect, otherRect)) {
          overlaps = true;
          break;
        }
      }
    }

    if (insideBin && !overlaps) {
      updatePlacement(plId, {
        rotation: newRotation,
        widthCm: newWidthCm,
        heightCm: newHeightCm
      });
    } else {
      console.log("Cannot rotate: would overlap or overflow compartment boundaries.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', userSelect: 'none' }}>
      <h3 style={{ margin: '0 0 10px 0' }}>Interactive SVG Layout</h3>
      <div style={{ 
        border: '1px solid #ccc', 
        borderRadius: '8px', 
        overflow: 'hidden', 
        background: '#f0f0f0',
        padding: '10px'
      }}>
        <svg 
          ref={svgRef}
          width={svgWidth} 
          height={svgHeight} 
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onMouseDown={(e) => {
            // Click on the empty space of SVG canvas clears the selection
            if (e.target === svgRef.current) {
              setSelectedId(null);
            }
          }}
          style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
        >
          {/* 1. Bag Base Image */}
          <image 
            href={bag.imageUrl} 
            width={svgWidth} 
            height={svgHeight} 
            preserveAspectRatio="none"
          />

          {/* 2. Visual Packing Usable Area Outline (for reference) */}
          {bag.packingAreasCm.map((area, idx) => (
            <rect 
              key={idx}
              x={cmToPx(area.x)} 
              y={cmToPx(area.y)} 
              width={cmToPx(area.width)} 
              height={cmToPx(area.height)} 
              fill="none" 
              stroke="red" 
              strokeDasharray="4,4" 
              strokeWidth="2"
            />
          ))}

          {/* 3. Fitted Pockets Layer */}
          <g id="pockets">
            {placements
              .filter(pl => pl.fitted)
              .map((pl) => {
                const instance = useBagStore.getState().pocketInstances.find(i => i.id === pl.id);
                const product = instance ? products.find(p => p.id === instance.pocketId) : null;
                
                if (!product) return null;

                const isDraggingThis = pl.id === draggedId && tempPos !== null;
                const xCm = isDraggingThis ? tempPos.xCm : pl.xCm;
                const yCm = isDraggingThis ? tempPos.yCm : pl.yCm;

                const x = cmToPx(xCm);
                const y = cmToPx(yCm);
                const width = cmToPx(pl.widthCm);
                const height = cmToPx(pl.heightCm);

                const isRotated = pl.rotation !== 0;

                const cx = x + width / 2;
                const cy = y + height / 2;

                const imgW = cmToPx(product.widthCm);
                const imgH = cmToPx(product.heightCm);
                const imgX = cx - imgW / 2;
                const imgY = cy - imgH / 2;

                const imageTransform = isRotated ? `rotate(${pl.rotation}, ${cx}, ${cy})` : undefined;

                // Color of the outline box (green normally, red if dragged into an overlapping/invalid position)
                let strokeColor = '#4CAF50';
                if (isDraggingThis) {
                  const proposedRect = {
                    x: xCm,
                    y: yCm,
                    width: pl.widthCm,
                    height: pl.heightCm
                  };
                  let inside = false;
                  for (const bin of bag.packingAreasCm) {
                    if (isInside(proposedRect, bin)) {
                      inside = true;
                      break;
                    }
                  }
                  let overlaps = false;
                  if (inside) {
                    for (const other of placements) {
                      if (other.id === pl.id || !other.fitted) continue;
                      const otherRect = {
                        x: other.xCm,
                        y: other.yCm,
                        width: other.widthCm,
                        height: other.heightCm
                      };
                      if (intersects(proposedRect, otherRect)) {
                        overlaps = true;
                        break;
                      }
                    }
                  }
                  strokeColor = (inside && !overlaps) ? '#4CAF50' : '#f44336';
                } else if (pl.id === selectedId) {
                  strokeColor = '#007af5'; // Blue outline for active selection
                }

                const isSelected = pl.id === selectedId;
                const isHovered = pl.id === hoveredId;
                const showCancelButton = isSelected || isHovered;

                return (
                  <g 
                    key={pl.id}
                    onMouseDown={(e) => handleMouseDown(e, pl.id)}
                    onMouseEnter={() => setHoveredId(pl.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onDoubleClick={() => handleDoubleClick(pl.id)}
                    style={{ cursor: mode === 'manual' ? 'move' : 'default' }}
                  >
                    <image 
                      href={product.imageUrl} 
                      x={imgX} 
                      y={imgY} 
                      width={imgW} 
                      height={imgH}
                      preserveAspectRatio="none"
                      transform={imageTransform}
                    />
                    <rect 
                      x={x} 
                      y={y} 
                      width={width} 
                      height={height} 
                      fill="none" 
                      stroke={strokeColor} 
                      strokeWidth={isSelected ? "3" : "2"}
                    />
                    {showCancelButton && (
                      <g
                        transform={`translate(${x + width - 14}, ${y + 14})`}
                        onMouseDown={(e) => {
                          e.stopPropagation(); // Stop dragging on cancel click
                        }}
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent selections
                          removeProductInstance(pl.id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle 
                          r="12" 
                          fill="rgba(50, 40, 40, 0.85)" 
                          stroke="white" 
                          strokeWidth="1.5" 
                        />
                        <path 
                          d="M -3.5 -3.5 L 3.5 3.5 M -3.5 3.5 L 3.5 -3.5" 
                          stroke="white" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                        />
                      </g>
                    )}
                  </g>
                );
              })}
          </g>
        </svg>
      </div>
    </div>
  );
};
