/**
 * 13|7 FrameWorks — Professional Construction Plan Generator
 * ════════════════════════════════════════════════════════════
 * Generates a 6-sheet construction plan set:
 *   S-1  Aerial / Site Plan (top-down floor plan)
 *   S-2  Front & Rear Elevations
 *   S-3  Left & Right Elevations
 *   S-4  Roof Plan
 *   S-5  Foundation / Concrete Plan
 *   S-6  Door & Window Schedule + Construction Notes
 *
 * Produced with jsPDF (browser-side).  Letter size (215.9 × 279.4 mm).
 */

import jsPDF from 'jspdf';
import type {
  BuildingConfig,
  AccessoriesConfig,
  ConcreteConfig,
  DoorConfig,
  CustomerInfo,
  ColorConfig,
} from '../../types/estimator';
import { COMPANY_INFO } from '../../constants/contractTerms';
import { calculatePurlins } from '../calculations/purlins';

/* ================================================================
   TYPES
   ================================================================ */

export interface ConstructionPlanData {
  customer: CustomerInfo;
  building: BuildingConfig;
  accessories: AccessoriesConfig;
  concrete: ConcreteConfig;
  colors: ColorConfig;
}

interface Seg {
  start: number;
  end: number;
  label: string;
  isDoor: boolean;
  door?: DoorConfig;
}

type RGB = [number, number, number];

/** Ensure a value is a finite number, falling back to a default */
function num(v: unknown, fallback = 0): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

/** Sanitize all numeric data to prevent NaN in PDF rect calls */
function sanitizeData(raw: ConstructionPlanData): ConstructionPlanData {
  const b = raw.building;
  const c = raw.concrete;
  return {
    ...raw,
    building: {
      ...b,
      width: num(b.width, 30) || 30,
      length: num(b.length, 30) || 30,
      height: num(b.height, 14) || 14,
    },
    accessories: {
      ...raw.accessories,
      walkDoors: (raw.accessories?.walkDoors || []).map(d => ({
        ...d,
        width: num(d.width, 3) || 3,
        height: num(d.height, 7) || 7,
        position: num(d.position, 0),
        quantity: num(d.quantity, 1) || 1,
      })),
      rollUpDoors: (raw.accessories?.rollUpDoors || []).map(d => ({
        ...d,
        width: num(d.width, 10) || 10,
        height: num(d.height, 10) || 10,
        position: num(d.position, 0),
        quantity: num(d.quantity, 1) || 1,
      })),
      windows: raw.accessories?.windows || [],
    },
    concrete: {
      ...c,
      thickness: num(c?.thickness, 4) || 4,
    },
  };
}

/* ================================================================
   PALETTE
   ================================================================ */

const C = {
  DARK:      [33,  33,  33 ] as RGB,
  GRAY:      [102, 102, 102] as RGB,
  LTGRAY:    [180, 180, 180] as RGB,
  VLTGRAY:   [235, 235, 235] as RGB,
  TEAL:      [20,  184, 166] as RGB,
  ORANGE:    [255, 106, 0  ] as RGB,
  DIM:       [0,   70,  150] as RGB,
  CONC:      [175, 175, 175] as RGB,
  WHITE:     [255, 255, 255] as RGB,
  WALL_FILL: [248, 248, 248] as RGB,
  WALL_LINE: [45,  45,  45 ] as RGB,
  ROOF_LINE: [70,  70,  70 ] as RGB,
  GROUND:    [130, 110, 90 ] as RGB,
  BG:        [252, 252, 255] as RGB,
};

const PITCH = 3 / 12;            // 3:12 roof pitch
const TOTAL_SHEETS = 6;

/* ================================================================
   PRIMITIVES — dimension lines, extension lines
   ================================================================ */

function dimH(d: jsPDF, x1: number, x2: number, y: number, lbl: string,
              above = true, tick = 1.8, fs = 5.5) {
  if (Math.abs(x2 - x1) < 0.4) return;
  d.setDrawColor(...C.DIM); d.setLineWidth(0.15);
  d.line(x1, y, x2, y);
  d.line(x1, y - tick, x1, y + tick);
  d.line(x2, y - tick, x2, y + tick);
  d.setFontSize(fs); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DIM);
  d.text(lbl, (x1 + x2) / 2, above ? y - 1.5 : y + 3.2, { align: 'center' });
}

function dimV(d: jsPDF, x: number, y1: number, y2: number, lbl: string,
              left = true, tick = 1.8, fs = 5.5) {
  if (Math.abs(y2 - y1) < 0.4) return;
  d.setDrawColor(...C.DIM); d.setLineWidth(0.15);
  d.line(x, y1, x, y2);
  d.line(x - tick, y1, x + tick, y1);
  d.line(x - tick, y2, x + tick, y2);
  d.setFontSize(fs); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DIM);
  d.text(lbl, left ? x - 3 : x + 3.5, (y1 + y2) / 2, { angle: 90 });
}

function extV(d: jsPDF, x: number, y1: number, y2: number) {
  d.setDrawColor(...C.LTGRAY); d.setLineWidth(0.08);
  d.setLineDashPattern([0.7, 0.7], 0); d.line(x, y1, x, y2); d.setLineDashPattern([], 0);
}
function extH(d: jsPDF, y: number, x1: number, x2: number) {
  d.setDrawColor(...C.LTGRAY); d.setLineWidth(0.08);
  d.setLineDashPattern([0.7, 0.7], 0); d.line(x1, y, x2, y); d.setLineDashPattern([], 0);
}

/* ================================================================
   DATA HELPERS
   ================================================================ */

function wallLen(b: BuildingConfig, w: string) {
  return (w === 'front' || w === 'back') ? b.width : b.length;
}

function doorsOn(a: AccessoriesConfig, w: string): DoorConfig[] {
  return [...a.walkDoors, ...a.rollUpDoors]
    .filter(d => d.wall === w)
    .sort((a, b) => a.position - b.position);
}

function ft(v: number): string {
  const w = Math.floor(v);
  const i = Math.round((v - w) * 12);
  return i === 0 ? `${w}'-0"` : `${w}'-${i}"`;
}

function chain(wallL: number, doors: DoorConfig[]): Seg[] {
  const s: Seg[] = [];
  let cur = 0;
  for (const dr of doors) {
    if (dr.position > cur)
      s.push({ start: cur, end: dr.position, label: ft(dr.position - cur), isDoor: false });
    s.push({ start: dr.position, end: dr.position + dr.width, label: `${dr.width}'`, isDoor: true, door: dr });
    cur = dr.position + dr.width;
  }
  if (cur < wallL)
    s.push({ start: cur, end: wallL, label: ft(wallL - cur), isDoor: false });
  return s;
}

/** Clamp door height to eave - 2' per construction rule */
function clampDoorH(dr: DoorConfig, eaveH: number): number {
  const maxH = eaveH - 2;
  return Math.min(dr.height, maxH);
}

function colorName(hex: string): string {
  const m: Record<string, string> = {
    '#E8E8E8':'Light Gray','#D4D4D4':'Gray','#8B4513':'Saddle Brown',
    '#2F4F4F':'Dark Slate','#800020':'Burgundy','#1C1C1C':'Black',
    '#FFFFFF':'White','#228B22':'Forest Green','#B22222':'Firebrick',
    '#4169E1':'Royal Blue','#DAA520':'Goldenrod','#708090':'Slate Gray',
  };
  return m[hex?.toUpperCase()] || hex || 'N/A';
}

/* ================================================================
   PAGE FURNITURE — border, title block, footer, sheet label
   ================================================================ */

function border(d: jsPDF, pw: number, ph: number) {
  // Outer border
  d.setDrawColor(...C.DARK); d.setLineWidth(0.6);
  d.rect(6, 6, pw - 12, ph - 12);
  // Inner border
  d.setLineWidth(0.2);
  d.rect(8, 8, pw - 16, ph - 16);
}

function titleBlock(d: jsPDF, data: ConstructionPlanData, pw: number, ph: number,
                    sheetNum: number, sheetTitle: string) {
  const tbW = 55;
  const tbH = 50;
  const tbX = pw - 8 - tbW;
  const tbY = ph - 8 - tbH;

  // Background
  d.setFillColor(245, 248, 252);
  d.rect(tbX, tbY, tbW, tbH, 'F');
  d.setDrawColor(...C.DARK); d.setLineWidth(0.3);
  d.rect(tbX, tbY, tbW, tbH, 'S');

  // Company
  d.setFillColor(...C.TEAL);
  d.rect(tbX, tbY, tbW, 9, 'F');
  d.setTextColor(...C.WHITE); d.setFontSize(8); d.setFont('helvetica', 'bold');
  d.text(COMPANY_INFO.name, tbX + tbW / 2, tbY + 6, { align: 'center' });

  // Fields
  let fy = tbY + 13;
  const fx = tbX + 2;
  d.setFontSize(5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.GRAY);

  const fields: [string, string][] = [
    ['CLIENT', data.customer.name || 'N/A'],
    ['PROJECT', `${data.building.width}' × ${data.building.length}' Metal Building`],
    ['TYPE', data.building.buildingType === 'pole-barn' ? 'Pole Barn' :
             data.building.buildingType === 'carport' ? 'Carport' :
             data.building.buildingType === 'i-beam' ? 'I-Beam Construction' : 'Bolt-Up'],
    ['EAVE HT', `${data.building.height}'-0"`],
    ['DATE', new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })],
  ];

  for (const [k, v] of fields) {
    d.setFont('helvetica', 'bold'); d.setTextColor(...C.GRAY);
    d.text(`${k}:`, fx, fy);
    d.setFont('helvetica', 'normal'); d.setTextColor(...C.DARK);
    d.text(v, fx + 16, fy);
    fy += 5;
  }

  // Sheet number block
  d.setDrawColor(...C.DARK); d.setLineWidth(0.3);
  d.rect(tbX, tbY + tbH - 11, tbW, 11, 'S');
  d.setFillColor(...C.TEAL);
  d.rect(tbX, tbY + tbH - 11, 18, 11, 'F');
  d.setTextColor(...C.WHITE); d.setFontSize(11); d.setFont('helvetica', 'bold');
  d.text(`S-${sheetNum}`, tbX + 9, tbY + tbH - 3, { align: 'center' });
  d.setTextColor(...C.DARK); d.setFontSize(6); d.setFont('helvetica', 'bold');
  d.text(sheetTitle.toUpperCase(), tbX + 20, tbY + tbH - 5);
  d.setFontSize(4.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text(`Sheet ${sheetNum} of ${TOTAL_SHEETS}`, tbX + 20, tbY + tbH - 1.5);
}

function pageFooter(d: jsPDF, pw: number, ph: number) {
  d.setFontSize(4.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('All dimensions in feet unless noted otherwise. Verify all measurements on site prior to construction.', 10, ph - 4);
  d.text(`${COMPANY_INFO.name}  |  Generated ${new Date().toLocaleDateString()}`, pw - 10, ph - 4, { align: 'right' });
}

function sheetHeader(d: jsPDF, title: string, subtitle: string, x: number, y: number): number {
  d.setFontSize(12); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text(title, x, y);
  d.setFontSize(6.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text(subtitle, x, y + 5);
  return y + 10;
}

/* ================================================================
   SCALE BAR
   ================================================================ */

function scaleBar(d: jsPDF, sc: number, x: number, y: number) {
  const barFt = sc > 2 ? 5 : 10;
  const barMm = barFt * sc;
  const divs = 5;
  const dw = barMm / divs;
  d.setFontSize(5.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('SCALE:', x, y);
  const bx = x + 12, by = y - 1.5, bh = 2;
  for (let i = 0; i < divs; i++) {
    d.setFillColor(...(i % 2 === 0 ? C.DARK : C.WHITE));
    d.rect(bx + i * dw, by, dw, bh, 'FD');
  }
  d.setDrawColor(...C.DARK); d.setLineWidth(0.2); d.rect(bx, by, barMm, bh, 'S');
  d.setFontSize(4.5); d.setTextColor(...C.DARK);
  d.text('0', bx, by + bh + 2.5, { align: 'center' });
  d.text(`${barFt} ft`, bx + barMm, by + bh + 2.5, { align: 'center' });
  const ratio = Math.round(304.8 / sc);
  d.setFontSize(5); d.setTextColor(...C.GRAY);
  d.text(`(1:${ratio})`, bx + barMm + 8, y);
}

function northArrow(d: jsPDF, x: number, y: number) {
  d.setDrawColor(...C.DARK); d.setLineWidth(0.4);
  d.line(x, y + 8, x, y);
  d.setFillColor(...C.DARK);
  // Arrow head
  d.line(x, y, x - 1.8, y + 3);
  d.line(x, y, x + 1.8, y + 3);
  d.setFontSize(6); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text('N', x, y - 1.5, { align: 'center' });
}

/* ================================================================
   SHEET S-1 — AERIAL / SITE PLAN
   ================================================================ */

function drawS1(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;

  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 1, 'Aerial / Site Plan');
  pageFooter(d, pw, ph);

  const { building: b, accessories: a } = data;

  let y = sheetHeader(d, 'AERIAL VIEW — DOOR PLACEMENT PLAN', 'Top-down view • All door locations with distances from drip edge to drip edge', m + 2, 16);

  // Drawing area
  const drawX = m + 2;
  const drawW = pw - m * 2 - 60;  // Leave room for title block
  const drawH = ph - y - m - 60;

  // Calculate scale
  const dimM = 22;
  const aW = drawW - dimM * 2;
  const aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const pW = b.width * sc, pL = b.length * sc;
  const pX = drawX + dimM + (aW - pW) / 2;
  const pY = y + dimM + (aH - pL) / 2;

  // Building rect
  d.setFillColor(...C.WALL_FILL); d.setDrawColor(...C.WALL_LINE); d.setLineWidth(0.6);
  d.rect(pX, pY, pW, pL, 'FD');

  // Grid
  d.setDrawColor(240, 240, 240); d.setLineWidth(0.08);
  for (let f = 10; f < b.length; f += 10) { const gy = pY + f * sc; d.line(pX + 0.3, gy, pX + pW - 0.3, gy); }
  for (let f = 10; f < b.width; f += 10) { const gx = pX + f * sc; d.line(gx, pY + 0.3, gx, pY + pL - 0.3); }

  // Wall labels
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text('FRONT', pX + pW / 2, pY + pL + 5, { align: 'center' });
  d.text('BACK', pX + pW / 2, pY - 4, { align: 'center' });
  d.text('LEFT', pX - 5, pY + pL / 2, { angle: 90 });
  d.text('RIGHT', pX + pW + 5, pY + pL / 2, { angle: -90 });

  // Draw doors on all walls & dimension chains
  const dTh = Math.max(2, sc * 1.2);
  const walls: ('front' | 'back' | 'left' | 'right')[] = ['front', 'back', 'left', 'right'];

  for (const w of walls) {
    const doors = doorsOn(a, w);
    const wL = wallLen(b, w);
    // Draw each door
    for (const dr of doors) {
      const col: RGB = dr.type === 'walk' ? C.ORANGE : C.TEAL;
      d.setFillColor(...col); d.setDrawColor(...col); d.setLineWidth(0.3);
      const dWpx = dr.width * sc, pos = dr.position * sc;
      let dx: number, dy: number, dw: number, dh: number;
      if (w === 'front')      { dx = pX + pos; dy = pY + pL - dTh; dw = dWpx; dh = dTh; }
      else if (w === 'back')  { dx = pX + pos; dy = pY;            dw = dWpx; dh = dTh; }
      else if (w === 'left')  { dx = pX;       dy = pY + pos;      dw = dTh;  dh = dWpx; }
      else                    { dx = pX + pW - dTh; dy = pY + pos; dw = dTh;  dh = dWpx; }
      d.rect(dx, dy, dw, dh, 'F');
      d.setFontSize(4); d.setFont('helvetica', 'bold'); d.setTextColor(...C.WHITE);
      d.text(dr.type === 'walk' ? 'W' : 'OH', dx + dw / 2, dy + dh / 2 + 1, { align: 'center' });
    }
    // Dimension chain
    if (doors.length > 0) {
      const segs = chain(wL, doors);
      const off = 9;
      for (const sg of segs) {
        const s = sg.start * sc, e = sg.end * sc;
        if (w === 'front') {
          const dy2 = pY + pL + off;
          extV(d, pX + s, pY + pL + 1, dy2 - 1.5); extV(d, pX + e, pY + pL + 1, dy2 - 1.5);
          dimH(d, pX + s, pX + e, dy2, sg.label, false, 1.4, 5);
        } else if (w === 'back') {
          const dy2 = pY - off;
          extV(d, pX + s, pY - 1, dy2 + 1.5); extV(d, pX + e, pY - 1, dy2 + 1.5);
          dimH(d, pX + s, pX + e, dy2, sg.label, true, 1.4, 5);
        } else if (w === 'left') {
          const dx2 = pX - off;
          extH(d, pY + s, pX - 1, dx2 + 1.5); extH(d, pY + e, pX - 1, dx2 + 1.5);
          dimV(d, dx2, pY + s, pY + e, sg.label, true, 1.4, 5);
        } else {
          const dx2 = pX + pW + off;
          extH(d, pY + s, pX + pW + 1, dx2 - 1.5); extH(d, pY + e, pX + pW + 1, dx2 - 1.5);
          dimV(d, dx2, pY + s, pY + e, sg.label, false, 1.4, 5);
        }
      }
    }
  }

  // Overall dims (outer layer)
  const out = 17;
  dimH(d, pX, pX + pW, pY - out, ft(b.width), true, 2, 6.5);
  extV(d, pX, pY - out - 2, pY - 1); extV(d, pX + pW, pY - out - 2, pY - 1);
  dimV(d, pX - out, pY, pY + pL, ft(b.length), true, 2, 6.5);
  extH(d, pY, pX - out - 2, pX - 1); extH(d, pY + pL, pX - out - 2, pX - 1);

  // Legend + scale
  const legY = pY + pL + 20;
  d.setFontSize(5.5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text('LEGEND:', drawX, legY);
  d.setFillColor(...C.ORANGE); d.rect(drawX + 16, legY - 2, 5, 2.5, 'F');
  d.setFont('helvetica', 'normal'); d.setFontSize(5); d.setTextColor(...C.DARK);
  d.text('Walk Door (3070)', drawX + 23, legY);
  d.setFillColor(...C.TEAL); d.rect(drawX + 55, legY - 2, 5, 2.5, 'F');
  d.text('Overhead / Roll-Up Door', drawX + 62, legY);
  scaleBar(d, sc, drawX, legY + 5);
  northArrow(d, drawX + drawW - 5, y + 2);
}

/* ================================================================
   SINGLE ELEVATION DRAWING (reused by S-2, S-3)
   ================================================================ */

function drawElev(d: jsPDF, data: ConstructionPlanData,
                  wall: 'front' | 'back' | 'left' | 'right',
                  ox: number, oy: number, mW: number, mH: number) {
  const { building: b, accessories: a, concrete: c } = data;
  const wL = wallLen(b, wall);
  const eH = b.height;
  const gable = wall === 'front' || wall === 'back';
  const peakR = gable ? (b.width / 2) * PITCH : 0;
  const totH = eH + peakR;
  const hasSlab = c.type === 'slab' || c.type === 'turnkey';

  // Title
  const wn = wall.charAt(0).toUpperCase() + wall.slice(1);
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text(`${wn} Elevation`, ox + mW / 2, oy, { align: 'center' });

  // Scale
  const dR = 14, tR = 5, cR = hasSlab ? 5 : 0;
  const aW = mW - dR * 2, aH = mH - dR - tR - cR;
  const sc = Math.min(aW / wL, aH / totH);
  const eW = wL * sc, elevH = eH * sc, pkH = peakR * sc;
  const eX = ox + dR + (aW - eW) / 2;
  const gY = oy + tR + aH;
  const eY = gY - elevH;

  // Concrete slab
  if (hasSlab) {
    const slH = Math.max(2.5, 3);
    d.setFillColor(...C.CONC); d.setDrawColor(...C.GRAY); d.setLineWidth(0.2);
    d.rect(eX - 1, gY, eW + 2, slH, 'FD');
    // Hatching
    d.setDrawColor(155, 155, 155); d.setLineWidth(0.06);
    for (let i = 0; i < eW + slH + 4; i += 1.8) {
      const hx1 = Math.max(eX - 1, Math.min(eX + eW + 1, eX - 1 + i));
      const hx2 = Math.max(eX - 1, Math.min(eX + eW + 1, eX - 1 + i - slH * 1.5));
      d.line(hx1, gY, hx2, gY + slH);
    }
    d.setFontSize(4.5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.GRAY);
    d.text(`4" SLAB w/ #3 REBAR`, eX + eW + 3, gY + slH / 2 + 1);
  }

  // Ground
  d.setDrawColor(...C.GROUND); d.setLineWidth(0.35);
  d.line(eX - 4, gY, eX + eW + 4, gY);
  d.setLineWidth(0.08);
  for (let i = 0; i < eW + 10; i += 2.5) d.line(eX - 4 + i, gY, eX - 6 + i, gY + 1.8);

  // Wall
  d.setFillColor(...C.WALL_FILL); d.setDrawColor(...C.WALL_LINE); d.setLineWidth(0.5);
  d.rect(eX, eY, eW, elevH, 'FD');

  // Roof
  d.setDrawColor(...C.ROOF_LINE); d.setLineWidth(0.5);
  if (gable) {
    const pkX = eX + eW / 2, pkY = eY - pkH;
    d.line(eX, eY, pkX, pkY); d.line(pkX, pkY, eX + eW, eY);
    d.line(eX - 2, eY, eX + eW + 2, eY);
    d.setFontSize(4); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
    d.text('RIDGE', pkX, pkY - 1.5, { align: 'center' });
    d.text('3:12', eX + eW * 0.75, eY - pkH * 0.35, { align: 'center' });
  } else {
    d.setLineWidth(0.6);
    d.line(eX - 3, eY, eX + eW + 3, eY);
    d.setFontSize(4); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
    d.text('EAVE LINE', eX + eW / 2, eY - 2, { align: 'center' });
  }

  // Sidewall purlins (girts) — dashed lines on eave-side elevations
  if (!gable) {
    const purlinCalc = calculatePurlins(b.width, b.length, eH);
    d.setDrawColor(100, 100, 200); d.setLineWidth(0.15);
    d.setLineDashPattern([1.5, 1], 0);
    for (const hIn of purlinCalc.sidewallPurlinHeights) {
      const py = gY - (hIn / 12) * sc;
      if (py > eY) {
        d.line(eX + 0.5, py, eX + eW - 0.5, py);
      }
    }
    d.setLineDashPattern([], 0);
    // Label
    if (purlinCalc.sidewallPurlinHeights.length > 0) {
      d.setFontSize(3.5); d.setFont('helvetica', 'italic'); d.setTextColor(100, 100, 200);
      d.text(`${purlinCalc.sidewallPurlinsPerWall} PURLINS (1st @ 88", +44" O.C.)`, eX + eW / 2, eY + 2.5, { align: 'center' });
    }
  }

  // Doors (height clamped to eave - 2')
  const doors = doorsOn(a, wall);
  for (const dr of doors) {
    const dX = eX + dr.position * sc;
    const dW = dr.width * sc;
    const clampedH = clampDoorH(dr, eH);
    const dH2 = Math.min(clampedH, eH - 0.5) * sc;
    const dY = gY - dH2;
    const col: RGB = dr.type === 'walk' ? C.ORANGE : C.TEAL;
    d.setFillColor(...col);
    d.setDrawColor(col[0] * 0.7, col[1] * 0.7, col[2] * 0.7);
    d.setLineWidth(0.3);
    d.rect(dX, dY, dW, dH2, 'FD');
    d.setFontSize(4.5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.WHITE);
    d.text(dr.type === 'walk' ? 'WALK' : 'OH', dX + dW / 2, dY + dH2 / 2, { align: 'center' });
    d.setFontSize(4); d.setFont('helvetica', 'normal'); d.setTextColor(...C.DARK);
    d.text(`${dr.width}'×${clampedH}'`, dX + dW / 2, dY + dH2 + 3, { align: 'center' });
    if (dr.type === 'rollUp') {
      d.setDrawColor(...C.WHITE); d.setLineWidth(0.12);
      const sec = Math.min(Math.floor(dH2 / 2.5), 6);
      for (let i = 1; i < sec; i++) d.line(dX + 0.3, dY + (dH2 / sec) * i, dX + dW - 0.3, dY + (dH2 / sec) * i);
    }
  }

  // Dimension chain
  if (doors.length > 0) {
    const segs = chain(wL, doors);
    const dYoff = gY + (hasSlab ? 7 : 4);
    for (const sg of segs) {
      const sx = eX + sg.start * sc, ex = eX + sg.end * sc;
      extV(d, sx, gY + 0.5, dYoff - 1.5); extV(d, ex, gY + 0.5, dYoff - 1.5);
      dimH(d, sx, ex, dYoff, sg.label, false, 1.3, 4.5);
    }
    const ov = dYoff + 4.5;
    dimH(d, eX, eX + eW, ov, ft(wL), false, 1.6, 5.5);
    extV(d, eX, dYoff + 0.5, ov - 1.5); extV(d, eX + eW, dYoff + 0.5, ov - 1.5);
  } else {
    dimH(d, eX, eX + eW, gY + (hasSlab ? 7 : 4), ft(wL), false, 1.6, 5.5);
  }

  // Height dim
  const hx = eX + eW + 7;
  dimV(d, hx, eY, gY, ft(eH), false, 1.6, 5);
  extH(d, eY, eX + eW + 0.5, hx - 1.5); extH(d, gY, eX + eW + 0.5, hx - 1.5);
  d.setFontSize(4); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('EAVE HT.', hx + 1.5, (eY + gY) / 2, { angle: -90 });

  if (gable && pkH > 2) {
    dimV(d, hx + 5, eY - pkH, eY, ft(peakR), false, 1.3, 4.5);
    extH(d, eY - pkH, eX + eW + 0.5, hx + 5 - 1.5);
  }

  // Drip edge labels
  d.setFontSize(3.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('DRIP EDGE', eX, eY - (gable ? pkH + 3 : 4), { align: 'center' });
  d.text('DRIP EDGE', eX + eW, eY - (gable ? pkH + 3 : 4), { align: 'center' });
  d.setDrawColor(...C.GRAY); d.setLineWidth(0.12);
  d.line(eX, eY - 0.5, eX, eY - 1.8); d.line(eX + eW, eY - 0.5, eX + eW, eY - 1.8);
}

/* ================================================================
   SHEET S-2 — FRONT & REAR ELEVATIONS
   ================================================================ */

function drawS2(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 2, 'Front & Rear Elevations');
  pageFooter(d, pw, ph);

  let y = sheetHeader(d, 'FRONT & REAR ELEVATIONS',
    'Side profiles showing door placement, eave height, roof pitch, and concrete slab detail', m + 2, 16);

  const cW = pw - m * 2 - 60;
  const cellH = (ph - y - m - 60) / 2 - 5;

  drawElev(d, data, 'front', m + 2, y, cW, cellH);
  drawElev(d, data, 'back', m + 2, y + cellH + 8, cW, cellH);
}

/* ================================================================
   SHEET S-3 — LEFT & RIGHT ELEVATIONS
   ================================================================ */

function drawS3(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 3, 'Left & Right Elevations');
  pageFooter(d, pw, ph);

  let y = sheetHeader(d, 'LEFT & RIGHT ELEVATIONS',
    'Side profiles showing door placement, eave height, and concrete slab detail', m + 2, 16);

  const cW = pw - m * 2 - 60;
  const cellH = (ph - y - m - 60) / 2 - 5;

  drawElev(d, data, 'left', m + 2, y, cW, cellH);
  drawElev(d, data, 'right', m + 2, y + cellH + 8, cW, cellH);
}

/* ================================================================
   SHEET S-4 — ROOF PLAN
   ================================================================ */

function drawS4(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 4, 'Roof Plan');
  pageFooter(d, pw, ph);

  const { building: b, accessories: a } = data;
  let y = sheetHeader(d, 'ROOF PLAN',
    'Top-down view of roof showing ridge line, slope direction, gutters, and ventilation', m + 2, 16);

  const drawW = pw - m * 2 - 60;
  const drawH = ph - y - m - 60;
  const dimM = 20;
  const aW = drawW - dimM * 2, aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const rW = b.width * sc, rL = b.length * sc;
  const rX = m + 2 + dimM + (aW - rW) / 2;
  const rY = y + dimM + (aH - rL) / 2;

  // Roof outline
  d.setFillColor(240, 245, 248); d.setDrawColor(...C.ROOF_LINE); d.setLineWidth(0.5);
  d.rect(rX, rY, rW, rL, 'FD');

  // Ridge line — runs vertically (along length) since gable ends are front/back
  d.setDrawColor(...C.DARK); d.setLineWidth(0.4);
  d.setLineDashPattern([2, 2], 0);
  d.line(rX + rW / 2, rY, rX + rW / 2, rY + rL);
  d.setLineDashPattern([], 0);

  // Ridge label
  d.setFontSize(6); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text('RIDGE LINE', rX + rW / 2 + 3, rY + rL / 2, { angle: -90 });

  // Slope arrows — left half slopes left, right half slopes right (toward eave walls)
  d.setDrawColor(...C.GRAY); d.setLineWidth(0.2);
  const arrowLen = Math.min(rW * 0.15, 15);

  // Right-side slope arrows (from ridge toward right eave)
  for (let i = 0.25; i <= 0.75; i += 0.25) {
    const ay = rY + rL * i;
    const ax1 = rX + rW * 0.55;
    const ax2 = ax1 + arrowLen;
    d.line(ax1, ay, ax2, ay);
    d.line(ax2, ay, ax2 - 2.5, ay - 1.5); d.line(ax2, ay, ax2 - 2.5, ay + 1.5);
  }
  d.setFontSize(5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('3:12 SLOPE', rX + rW * 0.55 + arrowLen + 2, rY + rL * 0.5, { angle: -90 });

  // Left-side slope arrows (from ridge toward left eave)
  for (let i = 0.25; i <= 0.75; i += 0.25) {
    const ay = rY + rL * i;
    const ax1 = rX + rW * 0.45;
    const ax2 = ax1 - arrowLen;
    d.line(ax1, ay, ax2, ay);
    d.line(ax2, ay, ax2 + 2.5, ay - 1.5); d.line(ax2, ay, ax2 + 2.5, ay + 1.5);
  }
  d.text('3:12 SLOPE', rX + rW * 0.45 - arrowLen - 2, rY + rL * 0.5, { angle: 90 });

  // Roof purlins — horizontal lines running along the building length (perpendicular to ridge in plan view)
  {
    const purlinCalc = calculatePurlins(b.width, b.length, b.height);
    if (purlinCalc.roofPurlinsPerSide > 0) {
      d.setDrawColor(100, 100, 200); d.setLineWidth(0.12);
      d.setLineDashPattern([1.2, 0.8], 0);
      const halfRW = rW / 2;
      // Left side of roof (from ridge to left eave)
      for (let i = 1; i < purlinCalc.roofPurlinsPerSide; i++) {
        const frac = i / (purlinCalc.roofPurlinsPerSide - 1);
        const px = rX + halfRW - frac * halfRW;
        d.line(px, rY + 0.5, px, rY + rL - 0.5);
      }
      // Right side of roof (from ridge to right eave)
      for (let i = 1; i < purlinCalc.roofPurlinsPerSide; i++) {
        const frac = i / (purlinCalc.roofPurlinsPerSide - 1);
        const px = rX + halfRW + frac * halfRW;
        d.line(px, rY + 0.5, px, rY + rL - 0.5);
      }
      d.setLineDashPattern([], 0);
      // Label
      d.setFontSize(3.5); d.setFont('helvetica', 'italic'); d.setTextColor(100, 100, 200);
      d.text(`ROOF PURLINS: ${purlinCalc.roofPurlinsPerSide}/side @ ${purlinCalc.roofPurlinSpacing}' O.C.`, rX + rW / 2, rY + rL + 8, { align: 'center' });
    }
  }

  // Drip edge labels
  d.setFontSize(4.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
  d.text('DRIP EDGE (FRONT)', rX + rW / 2, rY + rL + 4, { align: 'center' });
  d.text('DRIP EDGE (BACK)', rX + rW / 2, rY - 2, { align: 'center' });
  d.text('EAVE (LEFT)', rX - 3, rY + rL / 2, { angle: 90 });
  d.text('EAVE (RIGHT)', rX + rW + 3, rY + rL / 2, { angle: -90 });

  // Gutters — on left and right eave walls (where water runs off)
  if (a.gutters) {
    d.setDrawColor(...C.TEAL); d.setLineWidth(0.8);
    // Gutters on left and right eave edges
    d.line(rX, rY, rX, rY + rL);           // left eave
    d.line(rX + rW, rY, rX + rW, rY + rL); // right eave
    d.setFontSize(4); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
    d.text('GUTTER', rX - 8, rY + rL / 2, { angle: 90 });
    d.text('GUTTER', rX + rW + 8, rY + rL / 2, { angle: -90 });

    // Downspout markers at eave corners
    const dsSize = 2;
    d.setFillColor(...C.TEAL);
    d.rect(rX - dsSize + 0.5, rY - 0.5, dsSize, dsSize, 'F');         // top-left
    d.rect(rX - dsSize + 0.5, rY + rL - dsSize + 0.5, dsSize, dsSize, 'F'); // bottom-left
    d.rect(rX + rW - 0.5, rY - 0.5, dsSize, dsSize, 'F');             // top-right
    d.rect(rX + rW - 0.5, rY + rL - dsSize + 0.5, dsSize, dsSize, 'F');     // bottom-right
    d.setFontSize(3.5); d.setTextColor(...C.TEAL);
    d.text('DS', rX - dsSize - 1, rY + 1);
    d.text('DS', rX - dsSize - 1, rY + rL);
    d.text('DS', rX + rW + dsSize + 1, rY + 1);
    d.text('DS', rX + rW + dsSize + 1, rY + rL);
  }

  // Ventilation ridge vent — runs along the vertical ridge
  if (a.ventilation) {
    d.setDrawColor(200, 80, 80); d.setLineWidth(0.6);
    d.setLineDashPattern([1.5, 1], 0);
    d.line(rX + rW / 2, rY + rL * 0.1, rX + rW / 2, rY + rL * 0.9);
    d.setLineDashPattern([], 0);
    d.setFontSize(4); d.setFont('helvetica', 'bold'); d.setTextColor(200, 80, 80);
    d.text('RIDGE VENT', rX + rW / 2 + 2, rY + rL * 0.1 - 2);
  }

  // Overall dims
  dimH(d, rX, rX + rW, rY - 12, ft(b.width), true, 2, 6);
  extV(d, rX, rY - 14, rY - 1); extV(d, rX + rW, rY - 14, rY - 1);
  dimV(d, rX - 12, rY, rY + rL, ft(b.length), true, 2, 6);
  extH(d, rY, rX - 14, rX - 1); extH(d, rY + rL, rX - 14, rX - 1);

  // Legend
  const legY = rY + rL + 15;
  d.setFontSize(5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text('ROOF NOTES:', m + 2, legY);
  d.setFont('helvetica', 'normal'); d.setFontSize(4.5); d.setTextColor(...C.GRAY);
  d.text(`• Roof Pitch: 3:12 (standard metal building)`, m + 2, legY + 4);
  d.text(`• Ridge Height: ${ft(b.height + (b.width / 2) * PITCH)} from finish floor`, m + 2, legY + 8);
  d.text(`• Gutters: ${a.gutters ? 'Included (shown in teal)' : 'Not included'}`, m + 2, legY + 12);
  d.text(`• Ventilation: ${a.ventilation ? 'Ridge vent included (shown in red dashed)' : 'Not included'}`, m + 2, legY + 16);
  d.text(`• Roof Color: ${colorName(data.colors.roof)}`, m + 2, legY + 20);

  scaleBar(d, sc, m + 2, legY + 26);
}

/* ================================================================
   SHEET S-5 — FOUNDATION / CONCRETE PLAN
   ================================================================ */

function drawS5(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m2 = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 5, 'Foundation Plan');
  pageFooter(d, pw, ph);

  const { building: b, concrete: c } = data;
  let y = sheetHeader(d, 'FOUNDATION / CONCRETE PLAN',
    'Plan view showing slab layout, thickness, or pier locations as applicable', m2 + 2, 16);

  const drawW = pw - m2 * 2 - 60;
  const drawH = ph - y - m2 - 60;
  const dimM = 22;
  const aW = drawW - dimM * 2, aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const fW = b.width * sc, fL = b.length * sc;
  const fX = m2 + 2 + dimM + (aW - fW) / 2;
  const fY = y + dimM + (aH - fL) / 2;

  if (c.type === 'none' || c.existingPad) {
    // No concrete — building outline only
    d.setDrawColor(...C.LTGRAY); d.setLineWidth(0.4);
    d.setLineDashPattern([2, 2], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);

    d.setFontSize(10); d.setFont('helvetica', 'bold'); d.setTextColor(...C.GRAY);
    d.text(c.existingPad ? 'EXISTING PAD — VERIFY ON SITE' : 'FOUNDATION BY OWNER',
           fX + fW / 2, fY + fL / 2, { align: 'center' });
    d.setFontSize(6); d.setFont('helvetica', 'normal');
    d.text('Building footprint shown dashed for reference', fX + fW / 2, fY + fL / 2 + 6, { align: 'center' });

  } else if (c.type === 'piers') {
    // Building outline
    d.setDrawColor(...C.WALL_LINE); d.setLineWidth(0.4);
    d.setLineDashPattern([2, 2], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);

    // Pier locations (every ~10' around perimeter)
    const pierR = 2;
    d.setFillColor(...C.CONC); d.setDrawColor(...C.GRAY); d.setLineWidth(0.2);

    const perimSpacing = 10;
    // Front & back
    for (let ft2 = 0; ft2 <= b.width; ft2 += perimSpacing) {
      const px = fX + Math.min(ft2, b.width) * sc;
      d.circle(px, fY + fL, pierR, 'FD');
      d.circle(px, fY, pierR, 'FD');
    }
    // Left & right
    for (let ft2 = perimSpacing; ft2 < b.length; ft2 += perimSpacing) {
      const py = fY + ft2 * sc;
      d.circle(fX, py, pierR, 'FD');
      d.circle(fX + fW, py, pierR, 'FD');
    }

    d.setFontSize(6); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
    d.text('CONCRETE PIERS', fX + fW / 2, fY + fL / 2 - 3, { align: 'center' });
    d.setFont('helvetica', 'normal'); d.setFontSize(5); d.setTextColor(...C.GRAY);
    d.text(`Approx. ${perimSpacing}' O.C. around perimeter`, fX + fW / 2, fY + fL / 2 + 2, { align: 'center' });
    d.text(`${c.thickness || 4}" diameter × 24" deep (min)`, fX + fW / 2, fY + fL / 2 + 6, { align: 'center' });

  } else {
    // Slab or Turnkey
    const overhang = 1; // 1' slab overhang
    const ovPx = overhang * sc;

    // Slab rectangle (larger than building)
    d.setFillColor(...C.CONC); d.setDrawColor(...C.GRAY); d.setLineWidth(0.3);
    d.rect(fX - ovPx, fY - ovPx, fW + ovPx * 2, fL + ovPx * 2, 'FD');

    // Hatching
    d.setDrawColor(155, 155, 155); d.setLineWidth(0.06);
    const slabW = fW + ovPx * 2, slabL = fL + ovPx * 2;
    for (let i = 0; i < slabW + slabL; i += 4) {
      const x1 = fX - ovPx + i, y1 = fY - ovPx;
      const x2 = x1 - slabL * 0.3, y2 = fY - ovPx + slabL;
      const cx1 = Math.max(fX - ovPx, Math.min(fX - ovPx + slabW, x1));
      const cx2 = Math.max(fX - ovPx, Math.min(fX - ovPx + slabW, x2));
      d.line(cx1, y1, cx2, y2);
    }

    // Building outline on slab (dashed)
    d.setDrawColor(...C.WALL_LINE); d.setLineWidth(0.4);
    d.setLineDashPattern([2, 1.5], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);

    // Expansion joint (cross pattern)
    d.setDrawColor(100, 100, 100); d.setLineWidth(0.15);
    d.setLineDashPattern([1, 1], 0);
    d.line(fX - ovPx, fY + fL / 2, fX + fW + ovPx, fY + fL / 2); // horizontal
    d.line(fX + fW / 2, fY - ovPx, fX + fW / 2, fY + fL + ovPx); // vertical
    d.setLineDashPattern([], 0);

    // Labels
    d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
    d.text(`4" CONCRETE SLAB`, fX + fW / 2, fY + fL / 2 - 6, { align: 'center' });
    d.setFontSize(5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.GRAY);
    d.text(`${c.type === 'turnkey' ? 'TURNKEY PACKAGE' : 'STANDARD POUR'}`, fX + fW / 2, fY + fL / 2 - 1, { align: 'center' });
    d.text('#3 Rebar @ 18" O.C. each way', fX + fW / 2, fY + fL / 2 + 4, { align: 'center' });
    d.text('Expansion joints shown dashed', fX + fW / 2, fY + fL / 2 + 8, { align: 'center' });
    d.text(`1'-0" overhang beyond building footprint`, fX + fW / 2, fY + fL / 2 + 12, { align: 'center' });
  }

  // Overall dims
  dimH(d, fX, fX + fW, fY - 14, ft(b.width), true, 2, 6);
  extV(d, fX, fY - 16, fY - 1); extV(d, fX + fW, fY - 16, fY - 1);
  dimV(d, fX - 14, fY, fY + fL, ft(b.length), true, 2, 6);
  extH(d, fY, fX - 16, fX - 1); extH(d, fY + fL, fX - 16, fX - 1);

  // Notes
  const ny = fY + fL + 18;
  d.setFontSize(5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  d.text('FOUNDATION NOTES:', m2 + 2, ny);
  d.setFont('helvetica', 'normal'); d.setFontSize(4.5); d.setTextColor(...C.GRAY);
  const notes = [
    `Concrete Type: ${c.type === 'none' ? 'None (by owner)' : c.type === 'piers' ? 'Piers' : c.type === 'slab' ? '4" Monolithic Slab w/ #3 Rebar' : '4" Turnkey Slab w/ #3 Rebar'}`,
    `Building Footprint: ${b.width}' × ${b.length}' (${(b.width * b.length).toLocaleString()} sq ft)`,
    'All concrete work per local building codes. Obtain permits before pouring.',
    'Verify soil conditions and compaction prior to pour.',
    c.type === 'slab' || c.type === 'turnkey' ? 'Thickened edge at perimeter: 12" wide × 12" deep minimum.' : '',
  ].filter(Boolean);
  notes.forEach((n, i) => d.text(`• ${n}`, m2 + 2, ny + 4 + i * 4));
}

/* ================================================================
   SHEET S-6 — DOOR SCHEDULE & CONSTRUCTION NOTES
   ================================================================ */

function drawS6(d: jsPDF, data: ConstructionPlanData) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m2 = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 6, 'Schedules & Notes');
  pageFooter(d, pw, ph);

  const { building: b, accessories: a, concrete: c, colors: clr } = data;
  let y = sheetHeader(d, 'DOOR & WINDOW SCHEDULE + CONSTRUCTION NOTES',
    'Complete listing of all openings and general construction specifications', m2 + 2, 16);

  const lx = m2 + 2;
  const tw = pw - m2 * 2 - 60; // table width

  // ─── DOOR SCHEDULE TABLE ───
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text('DOOR SCHEDULE', lx, y); y += 4;

  const allDoors = [...a.walkDoors, ...a.rollUpDoors];
  const cols = [0, 14, 40, 62, 90, 115, 132];
  const headers = ['MARK', 'TYPE', 'SIZE (W×H)', 'WALL', 'POS. FROM LEFT', 'QTY'];

  // Header row
  d.setFillColor(235, 240, 245); d.rect(lx, y, tw, 5, 'F');
  d.setDrawColor(...C.LTGRAY); d.setLineWidth(0.15); d.rect(lx, y, tw, 5, 'S');
  d.setFontSize(4.5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  headers.forEach((h, i) => d.text(h, lx + cols[i] + 2, y + 3.5));
  y += 5;

  // Door rows
  d.setFont('helvetica', 'normal'); d.setFontSize(4.5);
  if (allDoors.length > 0) {
    allDoors.forEach((dr, idx) => {
      const fill = idx % 2 === 0;
      if (fill) { d.setFillColor(252, 252, 255); d.rect(lx, y, tw, 5, 'F'); }
      d.setDrawColor(...C.VLTGRAY); d.setLineWidth(0.08); d.rect(lx, y, tw, 5, 'S');
      d.setTextColor(...C.DARK);
      const mark = dr.type === 'walk' ? `W${idx + 1}` : `OH${idx + 1}`;
      const typeStr = dr.type === 'walk' ? 'Walk-Through (3070)' : 'Overhead / Roll-Up';
      const dispH = clampDoorH(dr, b.height);
      const row = [mark, typeStr, `${dr.width}' × ${dispH}'`,
                   dr.wall.charAt(0).toUpperCase() + dr.wall.slice(1),
                   ft(dr.position), String(dr.quantity)];
      row.forEach((v, i) => d.text(v, lx + cols[i] + 2, y + 3.5));
      y += 5;
    });
  } else {
    d.setTextColor(...C.GRAY); d.text('No doors selected', lx + 2, y + 3.5); y += 5;
  }
  y += 4;

  // ─── WINDOW SCHEDULE TABLE ───
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text('WINDOW SCHEDULE', lx, y); y += 4;

  const wHeaders = ['MARK', 'SIZE', 'WALL', 'QTY'];
  const wCols = [0, 14, 40, 70];
  d.setFillColor(235, 240, 245); d.rect(lx, y, tw, 5, 'F');
  d.setDrawColor(...C.LTGRAY); d.setLineWidth(0.15); d.rect(lx, y, tw, 5, 'S');
  d.setFontSize(4.5); d.setFont('helvetica', 'bold'); d.setTextColor(...C.DARK);
  wHeaders.forEach((h, i) => d.text(h, lx + wCols[i] + 2, y + 3.5));
  y += 5;

  d.setFont('helvetica', 'normal');
  if (a.windows.length > 0) {
    a.windows.forEach((w, idx) => {
      if (idx % 2 === 0) { d.setFillColor(252, 252, 255); d.rect(lx, y, tw, 5, 'F'); }
      d.setDrawColor(...C.VLTGRAY); d.setLineWidth(0.08); d.rect(lx, y, tw, 5, 'S');
      d.setTextColor(...C.DARK);
      const row = [`WIN${idx + 1}`, w.size === '3x3' ? "3' × 3'" : "4' × 4'",
                   w.wall.charAt(0).toUpperCase() + w.wall.slice(1), String(w.quantity)];
      row.forEach((v, i) => d.text(v, lx + wCols[i] + 2, y + 3.5));
      y += 5;
    });
  } else {
    d.setTextColor(...C.GRAY); d.text('No windows selected', lx + 2, y + 3.5); y += 5;
  }
  y += 6;

  // ─── MATERIAL SPECIFICATIONS ───
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text('MATERIAL SPECIFICATIONS', lx, y); y += 5;

  d.setFontSize(4.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.DARK);
  const pCalc = calculatePurlins(b.width, b.length, b.height);
  const specs = [
    `Building Type: ${b.buildingType === 'pole-barn' ? 'Pole Barn' : b.buildingType === 'carport' ? 'Carport' : b.buildingType === 'i-beam' ? 'I-Beam Construction' : 'Pre-Engineered Bolt-Up Steel'}`,
    `Frame Type: ${b.legType === 'certified' ? 'Engineer Certified' : 'Standard'}`,
    `Panel Gauge: 26 gauge (roof & wall)`,
    `Roof Pitch: 3:12`,
    `Roof Color: ${colorName(clr.roof)}`,
    `Wall Color: ${colorName(clr.walls)}`,
    `Trim Color: ${colorName(clr.trim)}`,
    `Door Color: ${colorName(clr.doors)}`,
    `Sidewall Purlins: ${pCalc.sidewallPurlinsPerWall} per wall — 1st @ 88", then every 44" O.C.`,
    `Roof Purlins: ${pCalc.roofPurlinsPerSide} per side — ${pCalc.roofPurlinSpacing}' O.C. (rafter: ${pCalc.iBeamLength}')`,
    `Total Purlins: ${pCalc.totalPurlins} (${pCalc.totalLinearFeet.toLocaleString()} linear ft)`,
    `Insulation: ${a.insulation === 'none' ? 'None' : a.insulation === 'wall' ? 'Wall Only' : a.insulation === 'ceiling' ? 'Ceiling Only' : 'Full (Wall + Ceiling)'}`,
    `Gutters & Downspouts: ${a.gutters ? 'Included' : 'Not included'}`,
    `Ventilation: ${a.ventilation ? 'Ridge vents included' : 'Not included'}`,
    `Concrete: ${c.type === 'none' ? 'None (by owner)' : c.type === 'piers' ? 'Piers' : `4" ${c.type === 'turnkey' ? 'Turnkey' : 'Standard'} Slab w/ #3 Rebar`}`,
  ];
  specs.forEach(s => { d.text(`•  ${s}`, lx, y); y += 4; });
  y += 4;

  // ─── GENERAL CONSTRUCTION NOTES ───
  d.setFontSize(7); d.setFont('helvetica', 'bold'); d.setTextColor(...C.TEAL);
  d.text('GENERAL CONSTRUCTION NOTES', lx, y); y += 5;

  d.setFontSize(4.5); d.setFont('helvetica', 'normal'); d.setTextColor(...C.DARK);
  const notes = [
    '1.  All work shall conform to applicable local, state, and national building codes.',
    '2.  Contractor shall obtain all required permits prior to commencement of work.',
    '3.  All dimensions shown are nominal. Verify all measurements on site before fabrication.',
    '4.  Foundation must be level within ±1/4" across full building footprint.',
    `5.  Roof pitch: 3:12 standard. Ridge height: ${ft(b.height + (b.width / 2) * PITCH)} from finish floor.`,
    '6.  All structural connections per manufacturer specifications.',
    '7.  Anchor bolts: 1/2" × 12" J-bolts at 48" O.C. maximum, set per template.',
    '8.  Erection shall be performed by qualified metal building installer.',
    '9.  Sealant at all panel laps, trim, and flashing per manufacturer requirements.',
    '10. Owner responsible for site grading, access, and utility connections unless noted.',
    `11. Door clearance: Minimum 2'-6" from building corners to any door opening.`,
    `12. Maximum door height: Eave height minus 2'-0" (${ft(b.height)} eave = ${ft(b.height - 2)} max door).`,
    '13. All framing members to be primed or galvanized per specification.',
  ];
  notes.forEach(n => { d.text(n, lx, y); y += 4; });
}

/* ================================================================
   PUBLIC API
   ================================================================ */

/**
 * Append the 6-sheet construction plan to an existing jsPDF doc
 * (used inside the contract PDF).
 */
export function drawConstructionPages(doc: jsPDF, rawData: ConstructionPlanData): void {
  const data = sanitizeData(rawData);
  doc.addPage(); drawS1(doc, data);
  doc.addPage(); drawS2(doc, data);
  doc.addPage(); drawS3(doc, data);
  doc.addPage(); drawS4(doc, data);
  doc.addPage(); drawS5(doc, data);
  doc.addPage(); drawS6(doc, data);
}

/**
 * Create a standalone 6-sheet construction plan PDF.
 */
export function generateStandaloneConstructionPlan(rawData: ConstructionPlanData): jsPDF {
  const data = sanitizeData(rawData);
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' });
  // First page is auto-created, draw S-1 on it
  drawS1(doc, data);
  doc.addPage(); drawS2(doc, data);
  doc.addPage(); drawS3(doc, data);
  doc.addPage(); drawS4(doc, data);
  doc.addPage(); drawS5(doc, data);
  doc.addPage(); drawS6(doc, data);
  return doc;
}

/**
 * Download a standalone construction plan PDF.
 */
export function downloadConstructionPlan(data: ConstructionPlanData, filename?: string): void {
  const doc = generateStandaloneConstructionPlan(data);
  const name = filename || `137-Construction-Plan-${data.customer.name?.replace(/\s+/g, '-') || 'Project'}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(name);
}
