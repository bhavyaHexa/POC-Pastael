export type Rotation = 0 | 90;

/**
 * Toggles rotation between 0 and 90 degrees.
 */
export function toggleRotation(current: Rotation): Rotation {
  return current === 0 ? 90 : 0;
}
