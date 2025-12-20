/**
 * Format rotation to 2 decimal places
 * Example: 90 → 90.0, 143.05295863147188 → 143.05
 * Note: In JSON, 90.0 and 90 serialize the same, but this ensures precision
 */
export function formatRotation(rotation: number): number {
  return Math.round(rotation * 100) / 100
}
