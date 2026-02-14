/**
 * 13|7 FrameWorks — Purlin Calculation Engine
 *
 * Rules:
 *
 * SIDEWALL PURLINS (girts):
 *   - First purlin placed at 88" from ground
 *   - Every additional 44" of height, add another purlin
 *   - Purlins run the full LENGTH of each sidewall
 *
 * ROOF PURLINS:
 *   - Standard pitch: 3/12
 *   - Take the gable width, divide by 2 (half span)
 *   - Calculate I-beam/rafter length: √(halfSpan² + rise²)
 *   - Divide I-beam length by 5 → round up = number of SPACES
 *   - Purlins = spaces + 1
 *   - Spacing must land between 4' and 5' apart (never > 5')
 *   - Purlins run the full LENGTH of the building (ridge direction)
 *
 * All panels: 26 gauge — never 29 gauge
 */

export interface PurlinResult {
  // Sidewall
  sidewallPurlinsPerWall: number;
  sidewallPurlinHeights: number[];   // Heights in inches from ground
  sidewallPurlinLength: number;      // Each purlin runs the building length (ft)
  totalSidewallPurlins: number;      // Both walls combined

  // Roof
  roofPitch: string;                 // e.g. "3/12"
  halfSpan: number;                  // ft
  rise: number;                      // ft
  iBeamLength: number;               // ft (rafter length from eave to ridge)
  roofPurlinsPerSide: number;        // One side of the roof
  roofPurlinSpacing: number;         // ft, actual spacing between purlins
  roofPurlinLength: number;          // Each purlin runs the building length (ft)
  totalRoofPurlins: number;          // Both sides combined

  // Totals
  totalPurlins: number;              // Sidewall + roof
  totalLinearFeet: number;           // All purlins × their respective lengths
}

/**
 * Calculate sidewall purlin (girt) placement
 * First purlin at 88", then every 44" until we exceed eave height.
 */
function calcSidewallPurlins(eaveHeightFt: number): { count: number; heights: number[] } {
  const eaveHeightIn = eaveHeightFt * 12;
  const heights: number[] = [];
  let h = 88; // First purlin at 88"

  while (h <= eaveHeightIn) {
    heights.push(h);
    h += 44;
  }

  return { count: heights.length, heights };
}

/**
 * Calculate roof purlin placement
 * Uses 3/12 pitch standard for metal buildings.
 *
 * @param buildingWidthFt - The gable span (width of building)
 * @param pitchRise - Rise per 12" run (default 3 for 3/12 pitch)
 */
function calcRoofPurlins(
  buildingWidthFt: number,
  pitchRise: number = 3
): { purlinsPerSide: number; spacing: number; iBeamLength: number; halfSpan: number; rise: number } {
  const halfSpan = buildingWidthFt / 2;
  const rise = halfSpan * (pitchRise / 12);
  const iBeamLength = Math.sqrt(halfSpan ** 2 + rise ** 2);

  // Divide I-beam length by 5 → number of spaces (round up to keep spacing ≤ 5')
  let spaces = Math.ceil(iBeamLength / 5);

  // Verify spacing is between 4' and 5'
  let spacing = iBeamLength / spaces;

  // If spacing is under 4', reduce spaces (fewer purlins, wider spacing)
  while (spacing < 4 && spaces > 1) {
    spaces--;
    spacing = iBeamLength / spaces;
  }

  // If spacing exceeds 5', add more spaces
  while (spacing > 5) {
    spaces++;
    spacing = iBeamLength / spaces;
  }

  const purlinsPerSide = spaces + 1;

  return { purlinsPerSide, spacing: Math.round(spacing * 100) / 100, iBeamLength: Math.round(iBeamLength * 100) / 100, halfSpan, rise: Math.round(rise * 100) / 100 };
}

/**
 * Full purlin estimate for a building
 */
export function calculatePurlins(
  widthFt: number,
  lengthFt: number,
  eaveHeightFt: number,
  pitchRise: number = 3
): PurlinResult {
  // ─── Sidewalls ───
  const sw = calcSidewallPurlins(eaveHeightFt);
  const sidewallPurlinLength = lengthFt;
  const totalSidewallPurlins = sw.count * 2; // Both sidewalls

  // ─── Roof ───
  const rf = calcRoofPurlins(widthFt, pitchRise);
  const roofPurlinLength = lengthFt; // Purlins run ridge-direction
  const totalRoofPurlins = rf.purlinsPerSide * 2; // Both sides

  // ─── Totals ───
  const totalPurlins = totalSidewallPurlins + totalRoofPurlins;
  const totalLinearFeet =
    (totalSidewallPurlins * sidewallPurlinLength) +
    (totalRoofPurlins * roofPurlinLength);

  return {
    sidewallPurlinsPerWall: sw.count,
    sidewallPurlinHeights: sw.heights,
    sidewallPurlinLength,
    totalSidewallPurlins,

    roofPitch: `${pitchRise}/12`,
    halfSpan: rf.halfSpan,
    rise: rf.rise,
    iBeamLength: rf.iBeamLength,
    roofPurlinsPerSide: rf.purlinsPerSide,
    roofPurlinSpacing: rf.spacing,
    roofPurlinLength,
    totalRoofPurlins,

    totalPurlins,
    totalLinearFeet,
  };
}
