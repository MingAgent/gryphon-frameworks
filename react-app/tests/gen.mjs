import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/utils/pdf/constructionPlan.ts
import jsPDF from "jspdf";

// src/constants/contractTerms.ts
var COMPANY_INFO = {
  name: "13|7 FrameWorks",
  legalName: "13|7 FrameWorks, LLC",
  address: "",
  phone: "",
  email: "",
  website: "https://137frameworks.com"
};

// src/utils/pdf/constructionPlan.ts
var C = {
  DARK: [33, 33, 33],
  GRAY: [102, 102, 102],
  LTGRAY: [180, 180, 180],
  VLTGRAY: [235, 235, 235],
  TEAL: [20, 184, 166],
  ORANGE: [255, 106, 0],
  DIM: [0, 70, 150],
  CONC: [175, 175, 175],
  WHITE: [255, 255, 255],
  WALL_FILL: [248, 248, 248],
  WALL_LINE: [45, 45, 45],
  ROOF_LINE: [70, 70, 70],
  GROUND: [130, 110, 90],
  BG: [252, 252, 255]
};
var PITCH = 3 / 12;
var TOTAL_SHEETS = 6;
function dimH(d, x1, x2, y, lbl, above = true, tick = 1.8, fs2 = 5.5) {
  if (Math.abs(x2 - x1) < 0.4) return;
  d.setDrawColor(...C.DIM);
  d.setLineWidth(0.15);
  d.line(x1, y, x2, y);
  d.line(x1, y - tick, x1, y + tick);
  d.line(x2, y - tick, x2, y + tick);
  d.setFontSize(fs2);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DIM);
  d.text(lbl, (x1 + x2) / 2, above ? y - 1.5 : y + 3.2, { align: "center" });
}
function dimV(d, x, y1, y2, lbl, left = true, tick = 1.8, fs2 = 5.5) {
  if (Math.abs(y2 - y1) < 0.4) return;
  d.setDrawColor(...C.DIM);
  d.setLineWidth(0.15);
  d.line(x, y1, x, y2);
  d.line(x - tick, y1, x + tick, y1);
  d.line(x - tick, y2, x + tick, y2);
  d.setFontSize(fs2);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DIM);
  d.text(lbl, left ? x - 3 : x + 3.5, (y1 + y2) / 2, { angle: 90 });
}
function extV(d, x, y1, y2) {
  d.setDrawColor(...C.LTGRAY);
  d.setLineWidth(0.08);
  d.setLineDashPattern([0.7, 0.7], 0);
  d.line(x, y1, x, y2);
  d.setLineDashPattern([], 0);
}
function extH(d, y, x1, x2) {
  d.setDrawColor(...C.LTGRAY);
  d.setLineWidth(0.08);
  d.setLineDashPattern([0.7, 0.7], 0);
  d.line(x1, y, x2, y);
  d.setLineDashPattern([], 0);
}
function wallLen(b, w) {
  return w === "front" || w === "back" ? b.width : b.length;
}
function doorsOn(a, w) {
  return [...a.walkDoors, ...a.rollUpDoors].filter((d) => d.wall === w).sort((a2, b) => a2.position - b.position);
}
function ft(v) {
  const w = Math.floor(v);
  const i = Math.round((v - w) * 12);
  return i === 0 ? `${w}'-0"` : `${w}'-${i}"`;
}
function chain(wallL, doors) {
  const s = [];
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
function colorName(hex) {
  const m = {
    "#E8E8E8": "Light Gray",
    "#D4D4D4": "Gray",
    "#8B4513": "Saddle Brown",
    "#2F4F4F": "Dark Slate",
    "#800020": "Burgundy",
    "#1C1C1C": "Black",
    "#FFFFFF": "White",
    "#228B22": "Forest Green",
    "#B22222": "Firebrick",
    "#4169E1": "Royal Blue",
    "#DAA520": "Goldenrod",
    "#708090": "Slate Gray"
  };
  return m[hex?.toUpperCase()] || hex || "N/A";
}
function border(d, pw, ph) {
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.6);
  d.rect(6, 6, pw - 12, ph - 12);
  d.setLineWidth(0.2);
  d.rect(8, 8, pw - 16, ph - 16);
}
function titleBlock(d, data, pw, ph, sheetNum, sheetTitle) {
  const tbW = 55;
  const tbH = 50;
  const tbX = pw - 8 - tbW;
  const tbY = ph - 8 - tbH;
  d.setFillColor(245, 248, 252);
  d.rect(tbX, tbY, tbW, tbH, "F");
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.3);
  d.rect(tbX, tbY, tbW, tbH, "S");
  d.setFillColor(...C.TEAL);
  d.rect(tbX, tbY, tbW, 9, "F");
  d.setTextColor(...C.WHITE);
  d.setFontSize(8);
  d.setFont("helvetica", "bold");
  d.text(COMPANY_INFO.name, tbX + tbW / 2, tbY + 6, { align: "center" });
  let fy = tbY + 13;
  const fx = tbX + 2;
  d.setFontSize(5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.GRAY);
  const fields = [
    ["CLIENT", data.customer.name || "N/A"],
    ["PROJECT", `${data.building.width}' \xD7 ${data.building.length}' Metal Building`],
    ["TYPE", data.building.buildingType === "pole-barn" ? "Pole Barn" : data.building.buildingType === "carport" ? "Carport" : "Bolt-Up"],
    ["EAVE HT", `${data.building.height}'-0"`],
    ["DATE", (/* @__PURE__ */ new Date()).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })]
  ];
  for (const [k, v] of fields) {
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.GRAY);
    d.text(`${k}:`, fx, fy);
    d.setFont("helvetica", "normal");
    d.setTextColor(...C.DARK);
    d.text(v, fx + 16, fy);
    fy += 5;
  }
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.3);
  d.rect(tbX, tbY + tbH - 11, tbW, 11, "S");
  d.setFillColor(...C.TEAL);
  d.rect(tbX, tbY + tbH - 11, 18, 11, "F");
  d.setTextColor(...C.WHITE);
  d.setFontSize(11);
  d.setFont("helvetica", "bold");
  d.text(`S-${sheetNum}`, tbX + 9, tbY + tbH - 3, { align: "center" });
  d.setTextColor(...C.DARK);
  d.setFontSize(6);
  d.setFont("helvetica", "bold");
  d.text(sheetTitle.toUpperCase(), tbX + 20, tbY + tbH - 5);
  d.setFontSize(4.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text(`Sheet ${sheetNum} of ${TOTAL_SHEETS}`, tbX + 20, tbY + tbH - 1.5);
}
function pageFooter(d, pw, ph) {
  d.setFontSize(4.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("All dimensions in feet unless noted otherwise. Verify all measurements on site prior to construction.", 10, ph - 4);
  d.text(`${COMPANY_INFO.name}  |  Generated ${(/* @__PURE__ */ new Date()).toLocaleDateString()}`, pw - 10, ph - 4, { align: "right" });
}
function sheetHeader(d, title, subtitle, x, y) {
  d.setFontSize(12);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text(title, x, y);
  d.setFontSize(6.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text(subtitle, x, y + 5);
  return y + 10;
}
function scaleBar(d, sc, x, y) {
  const barFt = sc > 2 ? 5 : 10;
  const barMm = barFt * sc;
  const divs = 5;
  const dw = barMm / divs;
  d.setFontSize(5.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("SCALE:", x, y);
  const bx = x + 12, by = y - 1.5, bh = 2;
  for (let i = 0; i < divs; i++) {
    d.setFillColor(...i % 2 === 0 ? C.DARK : C.WHITE);
    d.rect(bx + i * dw, by, dw, bh, "FD");
  }
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.2);
  d.rect(bx, by, barMm, bh, "S");
  d.setFontSize(4.5);
  d.setTextColor(...C.DARK);
  d.text("0", bx, by + bh + 2.5, { align: "center" });
  d.text(`${barFt} ft`, bx + barMm, by + bh + 2.5, { align: "center" });
  const ratio = Math.round(304.8 / sc);
  d.setFontSize(5);
  d.setTextColor(...C.GRAY);
  d.text(`(1:${ratio})`, bx + barMm + 8, y);
}
function northArrow(d, x, y) {
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.4);
  d.line(x, y + 8, x, y);
  d.setFillColor(...C.DARK);
  d.line(x, y, x - 1.8, y + 3);
  d.line(x, y, x + 1.8, y + 3);
  d.setFontSize(6);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text("N", x, y - 1.5, { align: "center" });
}
function drawS1(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 1, "Aerial / Site Plan");
  pageFooter(d, pw, ph);
  const { building: b, accessories: a } = data;
  let y = sheetHeader(d, "AERIAL VIEW \u2014 DOOR PLACEMENT PLAN", "Top-down view \u2022 All door locations with distances from drip edge to drip edge", m + 2, 16);
  const drawX = m + 2;
  const drawW = pw - m * 2 - 60;
  const drawH = ph - y - m - 60;
  const dimM = 22;
  const aW = drawW - dimM * 2;
  const aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const pW = b.width * sc, pL = b.length * sc;
  const pX = drawX + dimM + (aW - pW) / 2;
  const pY = y + dimM + (aH - pL) / 2;
  d.setFillColor(...C.WALL_FILL);
  d.setDrawColor(...C.WALL_LINE);
  d.setLineWidth(0.6);
  d.rect(pX, pY, pW, pL, "FD");
  d.setDrawColor(240, 240, 240);
  d.setLineWidth(0.08);
  for (let f = 10; f < b.length; f += 10) {
    const gy = pY + f * sc;
    d.line(pX + 0.3, gy, pX + pW - 0.3, gy);
  }
  for (let f = 10; f < b.width; f += 10) {
    const gx = pX + f * sc;
    d.line(gx, pY + 0.3, gx, pY + pL - 0.3);
  }
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text("FRONT", pX + pW / 2, pY + pL + 5, { align: "center" });
  d.text("BACK", pX + pW / 2, pY - 4, { align: "center" });
  d.text("LEFT", pX - 5, pY + pL / 2, { angle: 90 });
  d.text("RIGHT", pX + pW + 5, pY + pL / 2, { angle: -90 });
  const dTh = Math.max(2, sc * 1.2);
  const walls = ["front", "back", "left", "right"];
  for (const w of walls) {
    const doors = doorsOn(a, w);
    const wL = wallLen(b, w);
    for (const dr of doors) {
      const col = dr.type === "walk" ? C.ORANGE : C.TEAL;
      d.setFillColor(...col);
      d.setDrawColor(...col);
      d.setLineWidth(0.3);
      const dWpx = dr.width * sc, pos = dr.position * sc;
      let dx, dy, dw, dh;
      if (w === "front") {
        dx = pX + pos;
        dy = pY + pL - dTh;
        dw = dWpx;
        dh = dTh;
      } else if (w === "back") {
        dx = pX + pos;
        dy = pY;
        dw = dWpx;
        dh = dTh;
      } else if (w === "left") {
        dx = pX;
        dy = pY + pos;
        dw = dTh;
        dh = dWpx;
      } else {
        dx = pX + pW - dTh;
        dy = pY + pos;
        dw = dTh;
        dh = dWpx;
      }
      d.rect(dx, dy, dw, dh, "F");
      d.setFontSize(4);
      d.setFont("helvetica", "bold");
      d.setTextColor(...C.WHITE);
      d.text(dr.type === "walk" ? "W" : "OH", dx + dw / 2, dy + dh / 2 + 1, { align: "center" });
    }
    if (doors.length > 0) {
      const segs = chain(wL, doors);
      const off = 9;
      for (const sg of segs) {
        const s = sg.start * sc, e = sg.end * sc;
        if (w === "front") {
          const dy2 = pY + pL + off;
          extV(d, pX + s, pY + pL + 1, dy2 - 1.5);
          extV(d, pX + e, pY + pL + 1, dy2 - 1.5);
          dimH(d, pX + s, pX + e, dy2, sg.label, false, 1.4, 5);
        } else if (w === "back") {
          const dy2 = pY - off;
          extV(d, pX + s, pY - 1, dy2 + 1.5);
          extV(d, pX + e, pY - 1, dy2 + 1.5);
          dimH(d, pX + s, pX + e, dy2, sg.label, true, 1.4, 5);
        } else if (w === "left") {
          const dx2 = pX - off;
          extH(d, pY + s, pX - 1, dx2 + 1.5);
          extH(d, pY + e, pX - 1, dx2 + 1.5);
          dimV(d, dx2, pY + s, pY + e, sg.label, true, 1.4, 5);
        } else {
          const dx2 = pX + pW + off;
          extH(d, pY + s, pX + pW + 1, dx2 - 1.5);
          extH(d, pY + e, pX + pW + 1, dx2 - 1.5);
          dimV(d, dx2, pY + s, pY + e, sg.label, false, 1.4, 5);
        }
      }
    }
  }
  const out = 17;
  dimH(d, pX, pX + pW, pY - out, ft(b.width), true, 2, 6.5);
  extV(d, pX, pY - out - 2, pY - 1);
  extV(d, pX + pW, pY - out - 2, pY - 1);
  dimV(d, pX - out, pY, pY + pL, ft(b.length), true, 2, 6.5);
  extH(d, pY, pX - out - 2, pX - 1);
  extH(d, pY + pL, pX - out - 2, pX - 1);
  const legY = pY + pL + 20;
  d.setFontSize(5.5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text("LEGEND:", drawX, legY);
  d.setFillColor(...C.ORANGE);
  d.rect(drawX + 16, legY - 2, 5, 2.5, "F");
  d.setFont("helvetica", "normal");
  d.setFontSize(5);
  d.setTextColor(...C.DARK);
  d.text("Walk Door (3070)", drawX + 23, legY);
  d.setFillColor(...C.TEAL);
  d.rect(drawX + 55, legY - 2, 5, 2.5, "F");
  d.text("Overhead / Roll-Up Door", drawX + 62, legY);
  scaleBar(d, sc, drawX, legY + 5);
  northArrow(d, drawX + drawW - 5, y + 2);
}
function drawElev(d, data, wall, ox, oy, mW, mH) {
  const { building: b, accessories: a, concrete: c } = data;
  const wL = wallLen(b, wall);
  const eH = b.height;
  const gable = wall === "front" || wall === "back";
  const peakR = gable ? b.width / 2 * PITCH : 0;
  const totH = eH + peakR;
  const hasSlab = c.type === "slab" || c.type === "turnkey";
  const wn = wall.charAt(0).toUpperCase() + wall.slice(1);
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text(`${wn} Elevation`, ox + mW / 2, oy, { align: "center" });
  const dR = 14, tR = 5, cR = hasSlab ? 5 : 0;
  const aW = mW - dR * 2, aH = mH - dR - tR - cR;
  const sc = Math.min(aW / wL, aH / totH);
  const eW = wL * sc, elevH = eH * sc, pkH = peakR * sc;
  const eX = ox + dR + (aW - eW) / 2;
  const gY = oy + tR + aH;
  const eY = gY - elevH;
  if (hasSlab) {
    const slH = Math.max(2.5, 3);
    d.setFillColor(...C.CONC);
    d.setDrawColor(...C.GRAY);
    d.setLineWidth(0.2);
    d.rect(eX - 1, gY, eW + 2, slH, "FD");
    d.setDrawColor(155, 155, 155);
    d.setLineWidth(0.06);
    for (let i = 0; i < eW + slH + 4; i += 1.8) {
      const hx1 = Math.max(eX - 1, Math.min(eX + eW + 1, eX - 1 + i));
      const hx2 = Math.max(eX - 1, Math.min(eX + eW + 1, eX - 1 + i - slH * 1.5));
      d.line(hx1, gY, hx2, gY + slH);
    }
    d.setFontSize(4.5);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.GRAY);
    d.text(`${c.thickness || 4}" SLAB`, eX + eW + 3, gY + slH / 2 + 1);
  }
  d.setDrawColor(...C.GROUND);
  d.setLineWidth(0.35);
  d.line(eX - 4, gY, eX + eW + 4, gY);
  d.setLineWidth(0.08);
  for (let i = 0; i < eW + 10; i += 2.5) d.line(eX - 4 + i, gY, eX - 6 + i, gY + 1.8);
  d.setFillColor(...C.WALL_FILL);
  d.setDrawColor(...C.WALL_LINE);
  d.setLineWidth(0.5);
  d.rect(eX, eY, eW, elevH, "FD");
  d.setDrawColor(...C.ROOF_LINE);
  d.setLineWidth(0.5);
  if (gable) {
    const pkX = eX + eW / 2, pkY = eY - pkH;
    d.line(eX, eY, pkX, pkY);
    d.line(pkX, pkY, eX + eW, eY);
    d.line(eX - 2, eY, eX + eW + 2, eY);
    d.setFontSize(4);
    d.setFont("helvetica", "normal");
    d.setTextColor(...C.GRAY);
    d.text("RIDGE", pkX, pkY - 1.5, { align: "center" });
    d.text("3:12", eX + eW * 0.75, eY - pkH * 0.35, { align: "center" });
  } else {
    d.setLineWidth(0.6);
    d.line(eX - 3, eY, eX + eW + 3, eY);
    d.setFontSize(4);
    d.setFont("helvetica", "normal");
    d.setTextColor(...C.GRAY);
    d.text("EAVE LINE", eX + eW / 2, eY - 2, { align: "center" });
  }
  const doors = doorsOn(a, wall);
  for (const dr of doors) {
    const dX = eX + dr.position * sc;
    const dW = dr.width * sc;
    const dH2 = Math.min(dr.height, eH - 0.5) * sc;
    const dY = gY - dH2;
    const col = dr.type === "walk" ? C.ORANGE : C.TEAL;
    d.setFillColor(...col);
    d.setDrawColor(col[0] * 0.7, col[1] * 0.7, col[2] * 0.7);
    d.setLineWidth(0.3);
    d.rect(dX, dY, dW, dH2, "FD");
    d.setFontSize(4.5);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.WHITE);
    d.text(dr.type === "walk" ? "WALK" : "OH", dX + dW / 2, dY + dH2 / 2, { align: "center" });
    d.setFontSize(4);
    d.setFont("helvetica", "normal");
    d.setTextColor(...C.DARK);
    d.text(`${dr.width}'\xD7${dr.height}'`, dX + dW / 2, dY + dH2 + 3, { align: "center" });
    if (dr.type === "rollUp") {
      d.setDrawColor(...C.WHITE);
      d.setLineWidth(0.12);
      const sec = Math.min(Math.floor(dH2 / 2.5), 6);
      for (let i = 1; i < sec; i++) d.line(dX + 0.3, dY + dH2 / sec * i, dX + dW - 0.3, dY + dH2 / sec * i);
    }
  }
  if (doors.length > 0) {
    const segs = chain(wL, doors);
    const dYoff = gY + (hasSlab ? 7 : 4);
    for (const sg of segs) {
      const sx = eX + sg.start * sc, ex = eX + sg.end * sc;
      extV(d, sx, gY + 0.5, dYoff - 1.5);
      extV(d, ex, gY + 0.5, dYoff - 1.5);
      dimH(d, sx, ex, dYoff, sg.label, false, 1.3, 4.5);
    }
    const ov = dYoff + 4.5;
    dimH(d, eX, eX + eW, ov, ft(wL), false, 1.6, 5.5);
    extV(d, eX, dYoff + 0.5, ov - 1.5);
    extV(d, eX + eW, dYoff + 0.5, ov - 1.5);
  } else {
    dimH(d, eX, eX + eW, gY + (hasSlab ? 7 : 4), ft(wL), false, 1.6, 5.5);
  }
  const hx = eX + eW + 7;
  dimV(d, hx, eY, gY, ft(eH), false, 1.6, 5);
  extH(d, eY, eX + eW + 0.5, hx - 1.5);
  extH(d, gY, eX + eW + 0.5, hx - 1.5);
  d.setFontSize(4);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("EAVE HT.", hx + 1.5, (eY + gY) / 2, { angle: -90 });
  if (gable && pkH > 2) {
    dimV(d, hx + 5, eY - pkH, eY, ft(peakR), false, 1.3, 4.5);
    extH(d, eY - pkH, eX + eW + 0.5, hx + 5 - 1.5);
  }
  d.setFontSize(3.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("DRIP EDGE", eX, eY - (gable ? pkH + 3 : 4), { align: "center" });
  d.text("DRIP EDGE", eX + eW, eY - (gable ? pkH + 3 : 4), { align: "center" });
  d.setDrawColor(...C.GRAY);
  d.setLineWidth(0.12);
  d.line(eX, eY - 0.5, eX, eY - 1.8);
  d.line(eX + eW, eY - 0.5, eX + eW, eY - 1.8);
}
function drawS2(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 2, "Front & Rear Elevations");
  pageFooter(d, pw, ph);
  let y = sheetHeader(
    d,
    "FRONT & REAR ELEVATIONS",
    "Side profiles showing door placement, eave height, roof pitch, and concrete slab detail",
    m + 2,
    16
  );
  const cW = pw - m * 2 - 60;
  const cellH = (ph - y - m - 60) / 2 - 5;
  drawElev(d, data, "front", m + 2, y, cW, cellH);
  drawElev(d, data, "back", m + 2, y + cellH + 8, cW, cellH);
}
function drawS3(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 3, "Left & Right Elevations");
  pageFooter(d, pw, ph);
  let y = sheetHeader(
    d,
    "LEFT & RIGHT ELEVATIONS",
    "Side profiles showing door placement, eave height, and concrete slab detail",
    m + 2,
    16
  );
  const cW = pw - m * 2 - 60;
  const cellH = (ph - y - m - 60) / 2 - 5;
  drawElev(d, data, "left", m + 2, y, cW, cellH);
  drawElev(d, data, "right", m + 2, y + cellH + 8, cW, cellH);
}
function drawS4(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 4, "Roof Plan");
  pageFooter(d, pw, ph);
  const { building: b, accessories: a } = data;
  let y = sheetHeader(
    d,
    "ROOF PLAN",
    "Top-down view of roof showing ridge line, slope direction, gutters, and ventilation",
    m + 2,
    16
  );
  const drawW = pw - m * 2 - 60;
  const drawH = ph - y - m - 60;
  const dimM = 20;
  const aW = drawW - dimM * 2, aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const rW = b.width * sc, rL = b.length * sc;
  const rX = m + 2 + dimM + (aW - rW) / 2;
  const rY = y + dimM + (aH - rL) / 2;
  d.setFillColor(240, 245, 248);
  d.setDrawColor(...C.ROOF_LINE);
  d.setLineWidth(0.5);
  d.rect(rX, rY, rW, rL, "FD");
  d.setDrawColor(...C.DARK);
  d.setLineWidth(0.4);
  d.setLineDashPattern([2, 2], 0);
  d.line(rX, rY + rL / 2, rX + rW, rY + rL / 2);
  d.setLineDashPattern([], 0);
  d.setFontSize(6);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text("RIDGE LINE", rX + rW / 2, rY + rL / 2 - 2, { align: "center" });
  d.setDrawColor(...C.GRAY);
  d.setLineWidth(0.2);
  const arrowLen = Math.min(rL * 0.15, 15);
  for (let i = 0.25; i <= 0.75; i += 0.25) {
    const ax = rX + rW * i;
    const ay1 = rY + rL * 0.55;
    const ay2 = ay1 + arrowLen;
    d.line(ax, ay1, ax, ay2);
    d.line(ax, ay2, ax - 1.5, ay2 - 2.5);
    d.line(ax, ay2, ax + 1.5, ay2 - 2.5);
  }
  d.setFontSize(5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("3:12 SLOPE", rX + rW / 2, rY + rL * 0.55 + arrowLen + 4, { align: "center" });
  for (let i = 0.25; i <= 0.75; i += 0.25) {
    const ax = rX + rW * i;
    const ay1 = rY + rL * 0.45;
    const ay2 = ay1 - arrowLen;
    d.line(ax, ay1, ax, ay2);
    d.line(ax, ay2, ax - 1.5, ay2 + 2.5);
    d.line(ax, ay2, ax + 1.5, ay2 + 2.5);
  }
  d.text("3:12 SLOPE", rX + rW / 2, rY + rL * 0.45 - arrowLen - 1.5, { align: "center" });
  d.setFontSize(4.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.GRAY);
  d.text("DRIP EDGE (FRONT)", rX + rW / 2, rY + rL + 4, { align: "center" });
  d.text("DRIP EDGE (BACK)", rX + rW / 2, rY - 2, { align: "center" });
  d.text("DRIP EDGE", rX - 3, rY + rL / 2, { angle: 90 });
  d.text("DRIP EDGE", rX + rW + 3, rY + rL / 2, { angle: -90 });
  if (a.gutters) {
    d.setDrawColor(...C.TEAL);
    d.setLineWidth(0.8);
    d.line(rX, rY + rL, rX + rW, rY + rL);
    d.line(rX, rY, rX + rW, rY);
    d.setFontSize(4);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.TEAL);
    d.text("GUTTER", rX + rW + 2, rY + rL - 1);
    d.text("GUTTER", rX + rW + 2, rY + 2);
    const dsSize = 2;
    d.setFillColor(...C.TEAL);
    d.rect(rX - 0.5, rY + rL - 0.5, dsSize, dsSize, "F");
    d.rect(rX + rW - dsSize + 0.5, rY + rL - 0.5, dsSize, dsSize, "F");
    d.rect(rX - 0.5, rY - dsSize + 0.5, dsSize, dsSize, "F");
    d.rect(rX + rW - dsSize + 0.5, rY - dsSize + 0.5, dsSize, dsSize, "F");
    d.setFontSize(3.5);
    d.setTextColor(...C.TEAL);
    d.text("DS", rX + 0.5, rY + rL + dsSize + 2);
    d.text("DS", rX + rW - 1, rY + rL + dsSize + 2);
  }
  if (a.ventilation) {
    d.setDrawColor(200, 80, 80);
    d.setLineWidth(0.6);
    d.setLineDashPattern([1.5, 1], 0);
    d.line(rX + rW * 0.15, rY + rL / 2, rX + rW * 0.85, rY + rL / 2);
    d.setLineDashPattern([], 0);
    d.setFontSize(4);
    d.setFont("helvetica", "bold");
    d.setTextColor(200, 80, 80);
    d.text("RIDGE VENT", rX + rW * 0.85 + 2, rY + rL / 2 + 1);
  }
  dimH(d, rX, rX + rW, rY - 12, ft(b.width), true, 2, 6);
  extV(d, rX, rY - 14, rY - 1);
  extV(d, rX + rW, rY - 14, rY - 1);
  dimV(d, rX - 12, rY, rY + rL, ft(b.length), true, 2, 6);
  extH(d, rY, rX - 14, rX - 1);
  extH(d, rY + rL, rX - 14, rX - 1);
  const legY = rY + rL + 15;
  d.setFontSize(5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text("ROOF NOTES:", m + 2, legY);
  d.setFont("helvetica", "normal");
  d.setFontSize(4.5);
  d.setTextColor(...C.GRAY);
  d.text(`\u2022 Roof Pitch: 3:12 (standard metal building)`, m + 2, legY + 4);
  d.text(`\u2022 Ridge Height: ${ft(b.height + b.width / 2 * PITCH)} from finish floor`, m + 2, legY + 8);
  d.text(`\u2022 Gutters: ${a.gutters ? "Included (shown in teal)" : "Not included"}`, m + 2, legY + 12);
  d.text(`\u2022 Ventilation: ${a.ventilation ? "Ridge vent included (shown in red dashed)" : "Not included"}`, m + 2, legY + 16);
  d.text(`\u2022 Roof Color: ${colorName(data.colors.roof)}`, m + 2, legY + 20);
  scaleBar(d, sc, m + 2, legY + 26);
}
function drawS5(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m2 = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 5, "Foundation Plan");
  pageFooter(d, pw, ph);
  const { building: b, concrete: c } = data;
  let y = sheetHeader(
    d,
    "FOUNDATION / CONCRETE PLAN",
    "Plan view showing slab layout, thickness, or pier locations as applicable",
    m2 + 2,
    16
  );
  const drawW = pw - m2 * 2 - 60;
  const drawH = ph - y - m2 - 60;
  const dimM = 22;
  const aW = drawW - dimM * 2, aH = drawH - dimM * 2;
  const sc = Math.min(aW / b.width, aH / b.length);
  const fW = b.width * sc, fL = b.length * sc;
  const fX = m2 + 2 + dimM + (aW - fW) / 2;
  const fY = y + dimM + (aH - fL) / 2;
  if (c.type === "none" || c.existingPad) {
    d.setDrawColor(...C.LTGRAY);
    d.setLineWidth(0.4);
    d.setLineDashPattern([2, 2], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);
    d.setFontSize(10);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.GRAY);
    d.text(
      c.existingPad ? "EXISTING PAD \u2014 VERIFY ON SITE" : "FOUNDATION BY OWNER",
      fX + fW / 2,
      fY + fL / 2,
      { align: "center" }
    );
    d.setFontSize(6);
    d.setFont("helvetica", "normal");
    d.text("Building footprint shown dashed for reference", fX + fW / 2, fY + fL / 2 + 6, { align: "center" });
  } else if (c.type === "piers") {
    d.setDrawColor(...C.WALL_LINE);
    d.setLineWidth(0.4);
    d.setLineDashPattern([2, 2], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);
    const pierR = 2;
    d.setFillColor(...C.CONC);
    d.setDrawColor(...C.GRAY);
    d.setLineWidth(0.2);
    const perimSpacing = 10;
    for (let ft2 = 0; ft2 <= b.width; ft2 += perimSpacing) {
      const px = fX + Math.min(ft2, b.width) * sc;
      d.circle(px, fY + fL, pierR, "FD");
      d.circle(px, fY, pierR, "FD");
    }
    for (let ft2 = perimSpacing; ft2 < b.length; ft2 += perimSpacing) {
      const py = fY + ft2 * sc;
      d.circle(fX, py, pierR, "FD");
      d.circle(fX + fW, py, pierR, "FD");
    }
    d.setFontSize(6);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.DARK);
    d.text("CONCRETE PIERS", fX + fW / 2, fY + fL / 2 - 3, { align: "center" });
    d.setFont("helvetica", "normal");
    d.setFontSize(5);
    d.setTextColor(...C.GRAY);
    d.text(`Approx. ${perimSpacing}' O.C. around perimeter`, fX + fW / 2, fY + fL / 2 + 2, { align: "center" });
    d.text(`${c.thickness || 4}" diameter \xD7 24" deep (min)`, fX + fW / 2, fY + fL / 2 + 6, { align: "center" });
  } else {
    const overhang = 1;
    const ovPx = overhang * sc;
    d.setFillColor(...C.CONC);
    d.setDrawColor(...C.GRAY);
    d.setLineWidth(0.3);
    d.rect(fX - ovPx, fY - ovPx, fW + ovPx * 2, fL + ovPx * 2, "FD");
    d.setDrawColor(155, 155, 155);
    d.setLineWidth(0.06);
    const slabW = fW + ovPx * 2, slabL = fL + ovPx * 2;
    for (let i = 0; i < slabW + slabL; i += 4) {
      const x1 = fX - ovPx + i, y1 = fY - ovPx;
      const x2 = x1 - slabL * 0.3, y2 = fY - ovPx + slabL;
      const cx1 = Math.max(fX - ovPx, Math.min(fX - ovPx + slabW, x1));
      const cx2 = Math.max(fX - ovPx, Math.min(fX - ovPx + slabW, x2));
      d.line(cx1, y1, cx2, y2);
    }
    d.setDrawColor(...C.WALL_LINE);
    d.setLineWidth(0.4);
    d.setLineDashPattern([2, 1.5], 0);
    d.rect(fX, fY, fW, fL);
    d.setLineDashPattern([], 0);
    d.setDrawColor(100, 100, 100);
    d.setLineWidth(0.15);
    d.setLineDashPattern([1, 1], 0);
    d.line(fX - ovPx, fY + fL / 2, fX + fW + ovPx, fY + fL / 2);
    d.line(fX + fW / 2, fY - ovPx, fX + fW / 2, fY + fL + ovPx);
    d.setLineDashPattern([], 0);
    d.setFontSize(7);
    d.setFont("helvetica", "bold");
    d.setTextColor(...C.DARK);
    d.text(`${c.thickness || 4}" CONCRETE SLAB`, fX + fW / 2, fY + fL / 2 - 6, { align: "center" });
    d.setFontSize(5);
    d.setFont("helvetica", "normal");
    d.setTextColor(...C.GRAY);
    d.text(`${c.type === "turnkey" ? "TURNKEY PACKAGE" : "STANDARD POUR"}`, fX + fW / 2, fY + fL / 2 - 1, { align: "center" });
    d.text('#4 Rebar @ 18" O.C. each way', fX + fW / 2, fY + fL / 2 + 4, { align: "center" });
    d.text("Expansion joints shown dashed", fX + fW / 2, fY + fL / 2 + 8, { align: "center" });
    d.text(`1'-0" overhang beyond building footprint`, fX + fW / 2, fY + fL / 2 + 12, { align: "center" });
  }
  dimH(d, fX, fX + fW, fY - 14, ft(b.width), true, 2, 6);
  extV(d, fX, fY - 16, fY - 1);
  extV(d, fX + fW, fY - 16, fY - 1);
  dimV(d, fX - 14, fY, fY + fL, ft(b.length), true, 2, 6);
  extH(d, fY, fX - 16, fX - 1);
  extH(d, fY + fL, fX - 16, fX - 1);
  const ny = fY + fL + 18;
  d.setFontSize(5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  d.text("FOUNDATION NOTES:", m2 + 2, ny);
  d.setFont("helvetica", "normal");
  d.setFontSize(4.5);
  d.setTextColor(...C.GRAY);
  const notes = [
    `Concrete Type: ${c.type === "none" ? "None (by owner)" : c.type === "piers" ? "Piers" : c.type === "slab" ? `${c.thickness || 4}" Monolithic Slab` : `${c.thickness || 4}" Turnkey Slab`}`,
    `Building Footprint: ${b.width}' \xD7 ${b.length}' (${(b.width * b.length).toLocaleString()} sq ft)`,
    "All concrete work per local building codes. Obtain permits before pouring.",
    "Verify soil conditions and compaction prior to pour.",
    c.type === "slab" || c.type === "turnkey" ? 'Thickened edge at perimeter: 12" wide \xD7 12" deep minimum.' : ""
  ].filter(Boolean);
  notes.forEach((n, i) => d.text(`\u2022 ${n}`, m2 + 2, ny + 4 + i * 4));
}
function drawS6(d, data) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const m2 = 12;
  border(d, pw, ph);
  titleBlock(d, data, pw, ph, 6, "Schedules & Notes");
  pageFooter(d, pw, ph);
  const { building: b, accessories: a, concrete: c, colors: clr } = data;
  let y = sheetHeader(
    d,
    "DOOR & WINDOW SCHEDULE + CONSTRUCTION NOTES",
    "Complete listing of all openings and general construction specifications",
    m2 + 2,
    16
  );
  const lx = m2 + 2;
  const tw = pw - m2 * 2 - 60;
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text("DOOR SCHEDULE", lx, y);
  y += 4;
  const allDoors = [...a.walkDoors, ...a.rollUpDoors];
  const cols = [0, 14, 40, 62, 90, 115, 132];
  const headers = ["MARK", "TYPE", "SIZE (W\xD7H)", "WALL", "POS. FROM LEFT", "QTY"];
  d.setFillColor(235, 240, 245);
  d.rect(lx, y, tw, 5, "F");
  d.setDrawColor(...C.LTGRAY);
  d.setLineWidth(0.15);
  d.rect(lx, y, tw, 5, "S");
  d.setFontSize(4.5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  headers.forEach((h, i) => d.text(h, lx + cols[i] + 2, y + 3.5));
  y += 5;
  d.setFont("helvetica", "normal");
  d.setFontSize(4.5);
  if (allDoors.length > 0) {
    allDoors.forEach((dr, idx) => {
      const fill = idx % 2 === 0;
      if (fill) {
        d.setFillColor(252, 252, 255);
        d.rect(lx, y, tw, 5, "F");
      }
      d.setDrawColor(...C.VLTGRAY);
      d.setLineWidth(0.08);
      d.rect(lx, y, tw, 5, "S");
      d.setTextColor(...C.DARK);
      const mark = dr.type === "walk" ? `W${idx + 1}` : `OH${idx + 1}`;
      const typeStr = dr.type === "walk" ? "Walk-Through (3070)" : "Overhead / Roll-Up";
      const row = [
        mark,
        typeStr,
        `${dr.width}' \xD7 ${dr.height}'`,
        dr.wall.charAt(0).toUpperCase() + dr.wall.slice(1),
        ft(dr.position),
        String(dr.quantity)
      ];
      row.forEach((v, i) => d.text(v, lx + cols[i] + 2, y + 3.5));
      y += 5;
    });
  } else {
    d.setTextColor(...C.GRAY);
    d.text("No doors selected", lx + 2, y + 3.5);
    y += 5;
  }
  y += 4;
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text("WINDOW SCHEDULE", lx, y);
  y += 4;
  const wHeaders = ["MARK", "SIZE", "WALL", "QTY"];
  const wCols = [0, 14, 40, 70];
  d.setFillColor(235, 240, 245);
  d.rect(lx, y, tw, 5, "F");
  d.setDrawColor(...C.LTGRAY);
  d.setLineWidth(0.15);
  d.rect(lx, y, tw, 5, "S");
  d.setFontSize(4.5);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.DARK);
  wHeaders.forEach((h, i) => d.text(h, lx + wCols[i] + 2, y + 3.5));
  y += 5;
  d.setFont("helvetica", "normal");
  if (a.windows.length > 0) {
    a.windows.forEach((w, idx) => {
      if (idx % 2 === 0) {
        d.setFillColor(252, 252, 255);
        d.rect(lx, y, tw, 5, "F");
      }
      d.setDrawColor(...C.VLTGRAY);
      d.setLineWidth(0.08);
      d.rect(lx, y, tw, 5, "S");
      d.setTextColor(...C.DARK);
      const row = [
        `WIN${idx + 1}`,
        w.size === "3x3" ? "3' \xD7 3'" : "4' \xD7 4'",
        w.wall.charAt(0).toUpperCase() + w.wall.slice(1),
        String(w.quantity)
      ];
      row.forEach((v, i) => d.text(v, lx + wCols[i] + 2, y + 3.5));
      y += 5;
    });
  } else {
    d.setTextColor(...C.GRAY);
    d.text("No windows selected", lx + 2, y + 3.5);
    y += 5;
  }
  y += 6;
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text("MATERIAL SPECIFICATIONS", lx, y);
  y += 5;
  d.setFontSize(4.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.DARK);
  const specs = [
    `Building Type: ${b.buildingType === "pole-barn" ? "Pole Barn" : b.buildingType === "carport" ? "Carport" : "Pre-Engineered Bolt-Up Steel"}`,
    `Frame Type: ${b.legType === "certified" ? "Engineer Certified" : "Standard"}`,
    `Roof Color: ${colorName(clr.roof)}`,
    `Wall Color: ${colorName(clr.walls)}`,
    `Trim Color: ${colorName(clr.trim)}`,
    `Door Color: ${colorName(clr.doors)}`,
    `Insulation: ${a.insulation === "none" ? "None" : a.insulation === "wall" ? "Wall Only" : a.insulation === "ceiling" ? "Ceiling Only" : "Full (Wall + Ceiling)"}`,
    `Gutters & Downspouts: ${a.gutters ? "Included" : "Not included"}`,
    `Ventilation: ${a.ventilation ? "Ridge vents included" : "Not included"}`,
    `Concrete: ${c.type === "none" ? "None (by owner)" : c.type === "piers" ? "Piers" : `${c.thickness || 4}" ${c.type === "turnkey" ? "Turnkey" : "Standard"} Slab`}`
  ];
  specs.forEach((s) => {
    d.text(`\u2022  ${s}`, lx, y);
    y += 4;
  });
  y += 4;
  d.setFontSize(7);
  d.setFont("helvetica", "bold");
  d.setTextColor(...C.TEAL);
  d.text("GENERAL CONSTRUCTION NOTES", lx, y);
  y += 5;
  d.setFontSize(4.5);
  d.setFont("helvetica", "normal");
  d.setTextColor(...C.DARK);
  const notes = [
    "1.  All work shall conform to applicable local, state, and national building codes.",
    "2.  Contractor shall obtain all required permits prior to commencement of work.",
    "3.  All dimensions shown are nominal. Verify all measurements on site before fabrication.",
    '4.  Foundation must be level within \xB11/4" across full building footprint.',
    `5.  Roof pitch: 3:12 standard. Ridge height: ${ft(b.height + b.width / 2 * PITCH)} from finish floor.`,
    "6.  All structural connections per manufacturer specifications.",
    '7.  Anchor bolts: 1/2" \xD7 12" J-bolts at 48" O.C. maximum, set per template.',
    "8.  Erection shall be performed by qualified metal building installer.",
    "9.  Sealant at all panel laps, trim, and flashing per manufacturer requirements.",
    "10. Owner responsible for site grading, access, and utility connections unless noted.",
    `11. Door clearance: Minimum 3'-0" from building corners to any door opening.`,
    "12. All framing members to be primed or galvanized per specification."
  ];
  notes.forEach((n) => {
    d.text(n, lx, y);
    y += 4;
  });
}
function generateStandaloneConstructionPlan(data) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  drawS1(doc, data);
  doc.addPage();
  drawS2(doc, data);
  doc.addPage();
  drawS3(doc, data);
  doc.addPage();
  drawS4(doc, data);
  doc.addPage();
  drawS5(doc, data);
  doc.addPage();
  drawS6(doc, data);
  return doc;
}

// tests/generate-test-plans.ts
import * as fs from "fs";
import * as path from "path";
function door(type, width, height, wall, position, qty = 1) {
  return {
    id: `${type}-${wall}-${position}`,
    type,
    size: `${width}x${height}`,
    width,
    height,
    wall,
    position,
    quantity: qty
  };
}
function win(size, wall, qty = 1) {
  return { id: `win-${wall}-${size}`, size, wall, quantity: qty };
}
var testCases = [
  // ── USE CASE 1: Small Pole Barn ──
  {
    name: "Use Case 1 \u2014 Small Pole Barn (30\xD740, 10' eave)",
    filename: "TEST-01-Small-Pole-Barn-30x40.pdf",
    data: {
      customer: {
        name: "John Smith",
        email: "john@example.com",
        phone: "555-0101",
        address: "123 Rural Rd",
        city: "Springfield",
        state: "TX",
        zip: "75001",
        billingAddress: { street: "123 Rural Rd", city: "Springfield", state: "TX", zip: "75001" },
        constructionAddress: { street: "456 Farm Ln", city: "Springfield", state: "TX", zip: "75001" },
        sameAsMailingAddress: false
      },
      building: {
        buildingType: "pole-barn",
        buildingSizeId: "30x40",
        eaveHeightId: "10",
        width: 30,
        length: 40,
        height: 10,
        legType: "standard",
        buildingView: "front",
        breezeway: { frontBack: false, sideSide: false }
      },
      accessories: {
        walkDoors: [door("walk", 3, 7, "front", 5)],
        rollUpDoors: [door("rollUp", 10, 10, "front", 15)],
        windows: [],
        insulation: "none",
        ventilation: false,
        gutters: false
      },
      concrete: { type: "none", existingPad: false, thickness: 4 },
      colors: { roof: "#D4D4D4", walls: "#E8E8E8", trim: "#1C1C1C", doors: "#FFFFFF" }
    }
  },
  // ── USE CASE 2: Medium Workshop ──
  {
    name: "Use Case 2 \u2014 Medium Workshop (40\xD760, 14' eave)",
    filename: "TEST-02-Medium-Workshop-40x60.pdf",
    data: {
      customer: {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        phone: "555-0202",
        address: "789 Workshop Way",
        city: "Dallas",
        state: "TX",
        zip: "75201",
        billingAddress: { street: "789 Workshop Way", city: "Dallas", state: "TX", zip: "75201" },
        constructionAddress: { street: "789 Workshop Way", city: "Dallas", state: "TX", zip: "75201" },
        sameAsMailingAddress: true
      },
      building: {
        buildingType: "pole-barn",
        buildingSizeId: "40x60",
        eaveHeightId: "14",
        width: 40,
        length: 60,
        height: 14,
        legType: "certified",
        buildingView: "front",
        breezeway: { frontBack: false, sideSide: false }
      },
      accessories: {
        walkDoors: [
          door("walk", 3, 7, "front", 4),
          door("walk", 3, 7, "right", 10)
        ],
        rollUpDoors: [
          door("rollUp", 12, 12, "front", 18),
          door("rollUp", 12, 12, "back", 14)
        ],
        windows: [win("3x3", "left", 2), win("3x3", "right", 2)],
        insulation: "full",
        ventilation: false,
        gutters: true
      },
      concrete: { type: "slab", existingPad: false, thickness: 4 },
      colors: { roof: "#2F4F4F", walls: "#E8E8E8", trim: "#2F4F4F", doors: "#FFFFFF" }
    }
  },
  // ── USE CASE 3: Large Warehouse ──
  {
    name: "Use Case 3 \u2014 Large Warehouse (60\xD7100, 20' eave)",
    filename: "TEST-03-Large-Warehouse-60x100.pdf",
    data: {
      customer: {
        name: "Acme Industries LLC",
        email: "ops@acme.com",
        phone: "555-0303",
        address: "100 Industrial Blvd",
        city: "Houston",
        state: "TX",
        zip: "77001",
        billingAddress: { street: "100 Industrial Blvd", city: "Houston", state: "TX", zip: "77001" },
        constructionAddress: { street: "200 Commerce Dr", city: "Houston", state: "TX", zip: "77002" },
        sameAsMailingAddress: false
      },
      building: {
        buildingType: "pole-barn",
        buildingSizeId: "60x100",
        eaveHeightId: "20",
        width: 60,
        length: 100,
        height: 20,
        legType: "certified",
        buildingView: "front",
        breezeway: { frontBack: false, sideSide: false }
      },
      accessories: {
        walkDoors: [
          door("walk", 3, 7, "front", 5),
          door("walk", 3, 7, "front", 52),
          door("walk", 3, 7, "back", 28)
        ],
        rollUpDoors: [
          door("rollUp", 14, 14, "front", 20),
          door("rollUp", 14, 14, "front", 36),
          door("rollUp", 14, 14, "left", 40),
          door("rollUp", 14, 14, "right", 50)
        ],
        windows: [win("4x4", "left", 3), win("4x4", "right", 3), win("3x3", "back", 2)],
        insulation: "full",
        ventilation: true,
        gutters: true
      },
      concrete: { type: "slab", existingPad: false, thickness: 6 },
      colors: { roof: "#D4D4D4", walls: "#D4D4D4", trim: "#1C1C1C", doors: "#4169E1" }
    }
  },
  // ── USE CASE 4: Carport Style ──
  {
    name: "Use Case 4 \u2014 Carport Style (50\xD750, 12' eave)",
    filename: "TEST-04-Carport-50x50.pdf",
    data: {
      customer: {
        name: "Mike Williams",
        email: "mike@example.com",
        phone: "555-0404",
        address: "55 Shade Ln",
        city: "Austin",
        state: "TX",
        zip: "78701",
        billingAddress: { street: "55 Shade Ln", city: "Austin", state: "TX", zip: "78701" },
        constructionAddress: { street: "55 Shade Ln", city: "Austin", state: "TX", zip: "78701" },
        sameAsMailingAddress: true
      },
      building: {
        buildingType: "carport",
        buildingSizeId: "50x50",
        eaveHeightId: "12",
        width: 50,
        length: 50,
        height: 12,
        legType: "standard",
        buildingView: "front",
        breezeway: { frontBack: false, sideSide: false }
      },
      accessories: {
        walkDoors: [],
        rollUpDoors: [door("rollUp", 10, 8, "front", 20)],
        windows: [],
        insulation: "none",
        ventilation: false,
        gutters: false
      },
      concrete: { type: "piers", existingPad: false, thickness: 4 },
      colors: { roof: "#800020", walls: "#E8E8E8", trim: "#1C1C1C", doors: "#E8E8E8" }
    }
  },
  // ── USE CASE 5: Multi-Door Shop ──
  {
    name: "Use Case 5 \u2014 Multi-Door Shop (40\xD740, 16' eave)",
    filename: "TEST-05-Multi-Door-Shop-40x40.pdf",
    data: {
      customer: {
        name: "Rodriguez Auto Repair",
        email: "carlos@rodriguezauto.com",
        phone: "555-0505",
        address: "999 Mechanic Ave",
        city: "San Antonio",
        state: "TX",
        zip: "78201",
        billingAddress: { street: "999 Mechanic Ave", city: "San Antonio", state: "TX", zip: "78201" },
        constructionAddress: { street: "1001 Service Rd", city: "San Antonio", state: "TX", zip: "78202" },
        sameAsMailingAddress: false
      },
      building: {
        buildingType: "pole-barn",
        buildingSizeId: "40x40",
        eaveHeightId: "16",
        width: 40,
        length: 40,
        height: 16,
        legType: "certified",
        buildingView: "front",
        breezeway: { frontBack: false, sideSide: false }
      },
      accessories: {
        walkDoors: [door("walk", 3, 7, "left", 5)],
        rollUpDoors: [
          door("rollUp", 10, 10, "front", 5),
          door("rollUp", 10, 10, "front", 22),
          door("rollUp", 10, 10, "right", 15)
        ],
        windows: [win("4x4", "left", 2), win("3x3", "back", 1)],
        insulation: "wall",
        ventilation: true,
        gutters: true
      },
      concrete: { type: "slab", existingPad: false, thickness: 5 },
      colors: { roof: "#708090", walls: "#E8E8E8", trim: "#708090", doors: "#B22222" }
    }
  }
];
var outDir = path.resolve(__dirname, "..", "test-output");
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
console.log("  13|7 FrameWorks \u2014 Construction Plan Test Generator");
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\n");
for (const tc of testCases) {
  console.log(`\u25B6 Generating: ${tc.name}`);
  try {
    const doc = generateStandaloneConstructionPlan(tc.data);
    const buf = Buffer.from(doc.output("arraybuffer"));
    const outPath = path.join(outDir, tc.filename);
    fs.writeFileSync(outPath, buf);
    const sizeMB = (buf.length / 1024).toFixed(1);
    console.log(`  \u2705 Saved: ${outPath}  (${sizeMB} KB)
`);
  } catch (err) {
    console.error(`  \u274C FAILED: ${err.message}
`);
    console.error(err.stack);
  }
}
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
console.log(`  Done. PDFs saved to: ${outDir}`);
console.log("\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550");
