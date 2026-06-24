import type { Placement, BagTemplate } from '../types';
import { intersects } from './collision';
import { isInside } from './geometry';

/**
 * Finds the first valid (non-overlapping and fully contained) position inside the suitcase compartments
 * for a new pouch of size (widthCm, heightCm).
 * Returns the position and fitted status.
 */
export function findValidPlacement(
  widthCm: number,
  heightCm: number,
  existingPlacements: Placement[],
  bag: BagTemplate
): { xCm: number; yCm: number; fitted: boolean } {
  const fittedPlacements = existingPlacements.filter(p => p.fitted);

  for (const bin of bag.packingAreasCm) {
    // Scan positions from top-left to bottom-right in 0.5 cm steps
    const step = 0.5;
    const maxX = bin.x + bin.width - widthCm;
    const maxY = bin.y + bin.height - heightCm;

    for (let y = bin.y; y <= maxY + 0.01; y += step) {
      for (let x = bin.x; x <= maxX + 0.01; x += step) {
        const proposedRect = { x, y, width: widthCm, height: heightCm };

        // Double check container bounds
        if (!isInside(proposedRect, bin)) continue;

        // Check intersection with all existing fitted placements
        let hasOverlap = false;
        for (const pl of fittedPlacements) {
          const plRect = {
            x: pl.xCm,
            y: pl.yCm,
            width: pl.widthCm,
            height: pl.heightCm
          };
          if (intersects(proposedRect, plRect)) {
            hasOverlap = true;
            break;
          }
        }

        if (!hasOverlap) {
          return { xCm: Number(x.toFixed(2)), yCm: Number(y.toFixed(2)), fitted: true };
        }
      }
    }
  }

  // If it doesn't fit anywhere, return unfitted status
  return { xCm: 0, yCm: 0, fitted: false };
}
