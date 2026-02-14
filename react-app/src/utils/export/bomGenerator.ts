/**
 * INTERNAL DOCUMENT GENERATOR - DO NOT USE FOR CLIENT DOCUMENTS
 *
 * This module generates Bill of Materials with full cost and margin data.
 * Output files are CONFIDENTIAL and should be stored in the internal-docs folder.
 *
 * WARNING: NEVER send BOM files to client emails.
 */

import ExcelJS from 'exceljs';
import type {
  BillOfMaterials,
  BOMLineItem,
  BOMCategory,
  BOMSummary,
  CategoryBreakdown,
  DistributorRFP,
  EmailValidation,
} from '../../types/bom';
import type { EstimatorState } from '../../types/estimator';
import {
  INTERNAL_COSTS,
  SELLING_PRICES,
  calculateMargin,
  MARGIN_THRESHOLDS,
  SUPPLIERS,
} from '../../constants/internalCosts';

// ============================================
// EMAIL SAFETY VALIDATION
// ============================================

const BLOCKED_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'aol.com', 'icloud.com', 'live.com', 'msn.com'
];

const INTERNAL_DOMAINS = ['137frameworks.com', 'mingma.io'];

export function validateEmailForInternalDoc(email: string): EmailValidation {
  const domain = email.split('@')[1]?.toLowerCase() || '';

  const isInternalDomain = INTERNAL_DOMAINS.some(d => domain.includes(d));
  const isBlockedDomain = BLOCKED_DOMAINS.includes(domain);

  return {
    recipient: email,
    documentType: 'INTERNAL',
    isClientEmail: !isInternalDomain,
    canSend: isInternalDomain,
    reason: isInternalDomain
      ? 'Internal domain - OK to send'
      : isBlockedDomain
        ? 'BLOCKED: Consumer email domain - likely a client'
        : 'BLOCKED: External domain - verify before sending',
  };
}

// ============================================
// GENERATE UNIQUE IDS
// ============================================

function generateQuoteNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `GF-${year}${month}${day}-${random}`;
}

function generateBOMId(): string {
  return `BOM-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

// ============================================
// LINE ITEM GENERATORS
// ============================================

function createLineItem(
  category: BOMCategory,
  itemCode: string,
  description: string,
  quantity: number,
  unit: BOMLineItem['unit'],
  unitCost: number,
  unitPrice: number,
  supplier?: string,
  notes?: string
): BOMLineItem {
  const totalCost = unitCost * quantity;
  const totalPrice = unitPrice * quantity;
  const marginAmount = totalPrice - totalCost;
  const marginPercent = calculateMargin(totalCost, totalPrice);

  return {
    id: `LI-${Math.random().toString(36).substring(2, 8)}`,
    category,
    itemCode,
    description,
    quantity,
    unit,
    unitCost,
    totalCost,
    unitPrice,
    totalPrice,
    marginAmount,
    marginPercent,
    supplier,
    notes,
  };
}

// ============================================
// BOM GENERATION FROM ESTIMATOR STATE
// ============================================

export function generateBOM(state: EstimatorState): BillOfMaterials {
  const { customer, building, accessories, colors, concrete } = state;
  const lineItems: BOMLineItem[] = [];

  const sqft = building.width * building.length;
  const perimeter = 2 * (building.width + building.length);
  const wallSqft = perimeter * building.height;

  // --- STRUCTURE ITEMS ---

  // Steel Frame
  lineItems.push(createLineItem(
    'STRUCTURE',
    'STL-FRM-001',
    `Steel Frame - ${building.legType === 'certified' ? 'Certified 26ga' : 'Standard 29ga'}`,
    sqft,
    'sqft',
    INTERNAL_COSTS.structure.steelFramePerSqft * (building.legType === 'certified' ? 1.15 : 1),
    SELLING_PRICES.structure.basePerSqft * (building.legType === 'certified' ? 1.15 : 1),
    SUPPLIERS.steel.name,
    `${building.width}' x ${building.length}' x ${building.height}'`
  ));

  // Roof Panels
  lineItems.push(createLineItem(
    'STRUCTURE',
    'RF-PNL-001',
    `Roof Panels - ${colors.roof}`,
    sqft,
    'sqft',
    INTERNAL_COSTS.structure.roofPanelsPerSqft,
    INTERNAL_COSTS.structure.roofPanelsPerSqft * 2.1, // ~52% margin
    SUPPLIERS.steel.name
  ));

  // Wall Panels
  lineItems.push(createLineItem(
    'STRUCTURE',
    'WL-PNL-001',
    `Wall Panels - ${colors.walls}`,
    wallSqft,
    'sqft',
    INTERNAL_COSTS.structure.wallPanelsPerSqft,
    INTERNAL_COSTS.structure.wallPanelsPerSqft * 2.0, // 50% margin
    SUPPLIERS.steel.name
  ));

  // Posts (estimate based on perimeter)
  const numPosts = Math.ceil(perimeter / 10) + 1;
  lineItems.push(createLineItem(
    'STRUCTURE',
    'PST-STL-001',
    'Steel Posts',
    numPosts,
    'ea',
    INTERNAL_COSTS.structure.postsEach,
    INTERNAL_COSTS.structure.postsEach * 2.2,
    SUPPLIERS.steel.name
  ));

  // Trim
  lineItems.push(createLineItem(
    'STRUCTURE',
    'TRM-001',
    `Trim Package - ${colors.trim}`,
    perimeter + (building.width * 2), // perimeter + ridge
    'lnft',
    INTERNAL_COSTS.structure.trimPerLnft,
    INTERNAL_COSTS.structure.trimPerLnft * 2.4,
    SUPPLIERS.steel.name
  ));

  // Hardware Kit
  lineItems.push(createLineItem(
    'STRUCTURE',
    'HDW-KIT-001',
    'Hardware Kit (bolts, screws, anchors)',
    1,
    'kit',
    INTERNAL_COSTS.structure.hardwareKit,
    INTERNAL_COSTS.structure.hardwareKit * 2.0,
    SUPPLIERS.steel.name
  ));

  // --- DOORS ---

  accessories.walkDoors.forEach((door, index) => {
    const costKey = door.size as keyof typeof INTERNAL_COSTS.doors.walk;
    const priceKey = door.size as keyof typeof SELLING_PRICES.doors.walk;

    lineItems.push(createLineItem(
      'DOORS',
      `WD-${door.size}-${index + 1}`,
      `Walk Door ${door.size} - ${door.wall} wall`,
      door.quantity,
      'ea',
      INTERNAL_COSTS.doors.walk[costKey] + INTERNAL_COSTS.doors.hardware,
      SELLING_PRICES.doors.walk[priceKey],
      SUPPLIERS.doors.name
    ));
  });

  accessories.rollUpDoors.forEach((door, index) => {
    const costKey = door.size as keyof typeof INTERNAL_COSTS.doors.rollUp;
    const priceKey = door.size as keyof typeof SELLING_PRICES.doors.rollUp;

    lineItems.push(createLineItem(
      'DOORS',
      `RD-${door.size}-${index + 1}`,
      `Roll-Up Door ${door.size} - ${door.wall} wall`,
      door.quantity,
      'ea',
      INTERNAL_COSTS.doors.rollUp[costKey],
      SELLING_PRICES.doors.rollUp[priceKey],
      SUPPLIERS.doors.name
    ));
  });

  // --- WINDOWS ---

  accessories.windows.forEach((window, index) => {
    const costKey = window.size as keyof typeof INTERNAL_COSTS.windows;
    const priceKey = window.size as keyof typeof SELLING_PRICES.windows;

    lineItems.push(createLineItem(
      'WINDOWS',
      `WIN-${window.size}-${index + 1}`,
      `Window ${window.size} - ${window.wall} wall`,
      window.quantity,
      'ea',
      (INTERNAL_COSTS.windows[costKey] as number) + INTERNAL_COSTS.windows.frame,
      SELLING_PRICES.windows[priceKey],
      SUPPLIERS.doors.name
    ));
  });

  // --- INSULATION ---

  if (accessories.insulation !== 'none') {
    const insulationType = accessories.insulation;
    const insulationSqft = insulationType === 'ceiling' ? sqft : sqft + wallSqft;

    lineItems.push(createLineItem(
      'INSULATION',
      `INS-${insulationType.toUpperCase()}-001`,
      `Insulation - ${insulationType === 'ceiling' ? 'Ceiling Only R-19' : 'Full (Ceiling + Walls)'}`,
      insulationSqft,
      'sqft',
      INTERNAL_COSTS.insulation[insulationType],
      SELLING_PRICES.insulation[insulationType],
      SUPPLIERS.insulation.name
    ));
  }

  // --- CONCRETE ---

  if (concrete.type !== 'none' && !concrete.existingPad) {
    const thicknessMultiplier = concrete.thickness === 5 ? 1.15 : concrete.thickness === 6 ? 1.30 : 1;

    if (concrete.type === 'piers') {
      const numPiers = Math.ceil(perimeter / 10);
      lineItems.push(createLineItem(
        'CONCRETE',
        'CON-PIER-001',
        `Concrete Piers (${concrete.thickness}" thick)`,
        numPiers,
        'ea',
        INTERNAL_COSTS.concrete.piersEach * thicknessMultiplier,
        SELLING_PRICES.concrete.piers * thicknessMultiplier,
        SUPPLIERS.concrete.name
      ));
    } else if (concrete.type === 'slab') {
      lineItems.push(createLineItem(
        'CONCRETE',
        'CON-SLAB-001',
        `Concrete Slab (${concrete.thickness}" thick)`,
        sqft,
        'sqft',
        INTERNAL_COSTS.concrete.slabPerSqft * thicknessMultiplier,
        SELLING_PRICES.concrete.slab * thicknessMultiplier,
        SUPPLIERS.concrete.name
      ));

      // Rebar/mesh
      lineItems.push(createLineItem(
        'CONCRETE',
        'CON-REBAR-001',
        'Rebar & Mesh Reinforcement',
        sqft,
        'sqft',
        INTERNAL_COSTS.concrete.rebar + INTERNAL_COSTS.concrete.meshReinforcement,
        (INTERNAL_COSTS.concrete.rebar + INTERNAL_COSTS.concrete.meshReinforcement) * 1.8,
        SUPPLIERS.concrete.name
      ));
    } else if (concrete.type === 'turnkey') {
      lineItems.push(createLineItem(
        'CONCRETE',
        'CON-TURN-001',
        `Turnkey Concrete Package (${concrete.thickness}" thick)`,
        sqft,
        'sqft',
        INTERNAL_COSTS.concrete.turnkeyPerSqft * thicknessMultiplier,
        SELLING_PRICES.concrete.turnkey * thicknessMultiplier,
        SUPPLIERS.concrete.name
      ));
    }
  }

  // --- OPTIONS ---

  if (accessories.ventilation) {
    lineItems.push(createLineItem(
      'OPTIONS',
      'OPT-VENT-001',
      'Ridge Ventilation System',
      1,
      'set',
      INTERNAL_COSTS.options.ventilation,
      SELLING_PRICES.options.ventilation
    ));
  }

  if (accessories.gutters) {
    lineItems.push(createLineItem(
      'OPTIONS',
      'OPT-GUT-001',
      'Gutters & Downspouts',
      building.length * 2, // Both eaves
      'lnft',
      INTERNAL_COSTS.options.guttersPerLnft,
      SELLING_PRICES.options.guttersPerLnft
    ));
  }

  // --- LABOR ---

  lineItems.push(createLineItem(
    'LABOR',
    'LBR-INST-001',
    'Installation Labor',
    sqft,
    'sqft',
    INTERNAL_COSTS.labor.installationPerSqft,
    SELLING_PRICES.labor.perSqft
  ));

  // --- DELIVERY ---

  lineItems.push(createLineItem(
    'DELIVERY',
    'DEL-001',
    'Delivery & Unloading',
    1,
    'ea',
    INTERNAL_COSTS.delivery.baseCost,
    SELLING_PRICES.delivery.base
  ));

  // Calculate summary
  const summary = calculateBOMSummary(lineItems);

  return {
    id: generateBOMId(),
    classification: 'INTERNAL',
    createdAt: new Date().toISOString(),
    createdBy: 'System',
    quoteNumber: generateQuoteNumber(),
    customer: {
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
    },
    building: {
      width: building.width,
      length: building.length,
      height: building.height,
      sqft,
      legType: building.legType,
      roofColor: colors.roof,
      wallColor: colors.walls,
      trimColor: colors.trim,
    },
    lineItems,
    summary,
    _isInternal: true,
    _neverEmailToClient: true,
  };
}

// ============================================
// SUMMARY CALCULATION
// ============================================

function calculateBOMSummary(lineItems: BOMLineItem[]): BOMSummary {
  const categories: BOMCategory[] = ['STRUCTURE', 'DOORS', 'WINDOWS', 'INSULATION', 'CONCRETE', 'LABOR', 'DELIVERY', 'OPTIONS', 'MISC'];

  const categoryBreakdown: CategoryBreakdown[] = categories.map(category => {
    const items = lineItems.filter(item => item.category === category);
    const cost = items.reduce((sum, item) => sum + item.totalCost, 0);
    const price = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const margin = price - cost;
    const marginPercent = price > 0 ? (margin / price) * 100 : 0;

    return { category, cost, price, margin, marginPercent };
  }).filter(c => c.cost > 0 || c.price > 0);

  const materialCategories = ['STRUCTURE', 'DOORS', 'WINDOWS', 'INSULATION', 'CONCRETE', 'OPTIONS', 'MISC'];
  const laborCategories = ['LABOR'];
  const deliveryCategories = ['DELIVERY'];

  const totalMaterialCost = categoryBreakdown.filter(c => materialCategories.includes(c.category)).reduce((sum, c) => sum + c.cost, 0);
  const totalMaterialPrice = categoryBreakdown.filter(c => materialCategories.includes(c.category)).reduce((sum, c) => sum + c.price, 0);
  const totalLaborCost = categoryBreakdown.filter(c => laborCategories.includes(c.category)).reduce((sum, c) => sum + c.cost, 0);
  const totalLaborPrice = categoryBreakdown.filter(c => laborCategories.includes(c.category)).reduce((sum, c) => sum + c.price, 0);
  const totalDeliveryCost = categoryBreakdown.filter(c => deliveryCategories.includes(c.category)).reduce((sum, c) => sum + c.cost, 0);
  const totalDeliveryPrice = categoryBreakdown.filter(c => deliveryCategories.includes(c.category)).reduce((sum, c) => sum + c.price, 0);

  const totalCost = totalMaterialCost + totalLaborCost + totalDeliveryCost;
  const totalPrice = totalMaterialPrice + totalLaborPrice + totalDeliveryPrice;
  const grossMarginAmount = totalPrice - totalCost;
  const grossMarginPercent = totalPrice > 0 ? (grossMarginAmount / totalPrice) * 100 : 0;

  const depositAmount = totalPrice * 0.35;
  const balanceDue = totalPrice - depositAmount;

  return {
    totalMaterialCost,
    totalLaborCost,
    totalDeliveryCost,
    totalCost,
    totalMaterialPrice,
    totalLaborPrice,
    totalDeliveryPrice,
    totalPrice,
    grossMarginAmount,
    grossMarginPercent,
    categoryBreakdown,
    depositAmount,
    balanceDue,
  };
}

// ============================================
// EXCEL EXPORT
// ============================================

export async function exportBOMToExcel(bom: BillOfMaterials): Promise<Blob> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '13|7 FrameWorks Internal';
  workbook.created = new Date();

  // --- SHEET 1: SUMMARY ---
  const summarySheet = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FF0000' } } // Red tab = Internal
  });

  // Header warning
  summarySheet.mergeCells('A1:H1');
  const warningCell = summarySheet.getCell('A1');
  warningCell.value = '⚠️ INTERNAL DOCUMENT - CONFIDENTIAL - DO NOT SHARE WITH CLIENTS ⚠️';
  warningCell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 14 };
  warningCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000' } };
  warningCell.alignment = { horizontal: 'center' };

  // Quote info
  summarySheet.getCell('A3').value = 'Quote Number:';
  summarySheet.getCell('B3').value = bom.quoteNumber;
  summarySheet.getCell('A4').value = 'Date:';
  summarySheet.getCell('B4').value = new Date(bom.createdAt).toLocaleDateString();

  // Customer info
  summarySheet.getCell('A6').value = 'Customer:';
  summarySheet.getCell('B6').value = bom.customer.name;
  summarySheet.getCell('A7').value = 'Location:';
  summarySheet.getCell('B7').value = `${bom.customer.city}, ${bom.customer.state}`;

  // Building specs
  summarySheet.getCell('A9').value = 'Building Specifications';
  summarySheet.getCell('A9').font = { bold: true, size: 12 };
  summarySheet.getCell('A10').value = 'Dimensions:';
  summarySheet.getCell('B10').value = `${bom.building.width}' x ${bom.building.length}' x ${bom.building.height}'`;
  summarySheet.getCell('A11').value = 'Square Footage:';
  summarySheet.getCell('B11').value = bom.building.sqft;
  summarySheet.getCell('A12').value = 'Frame Type:';
  summarySheet.getCell('B12').value = bom.building.legType;

  // Financial summary
  summarySheet.getCell('A14').value = 'BUDGET vs ACTUAL (INTERNAL ONLY)';
  summarySheet.getCell('A14').font = { bold: true, size: 12, color: { argb: 'FF0000' } };

  summarySheet.getCell('A15').value = '';
  summarySheet.getCell('B15').value = 'Our Cost (Budget)';
  summarySheet.getCell('C15').value = 'Selling Price (Actual)';
  summarySheet.getCell('D15').value = 'Margin $';
  summarySheet.getCell('E15').value = 'Margin %';
  ['B15', 'C15', 'D15', 'E15'].forEach(cell => {
    summarySheet.getCell(cell).font = { bold: true };
    summarySheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'CCCCCC' } };
  });

  summarySheet.getCell('A16').value = 'Materials';
  summarySheet.getCell('B16').value = bom.summary.totalMaterialCost;
  summarySheet.getCell('C16').value = bom.summary.totalMaterialPrice;
  summarySheet.getCell('D16').value = bom.summary.totalMaterialPrice - bom.summary.totalMaterialCost;
  summarySheet.getCell('E16').value = bom.summary.totalMaterialPrice > 0
    ? ((bom.summary.totalMaterialPrice - bom.summary.totalMaterialCost) / bom.summary.totalMaterialPrice * 100).toFixed(1) + '%'
    : '0%';

  summarySheet.getCell('A17').value = 'Labor';
  summarySheet.getCell('B17').value = bom.summary.totalLaborCost;
  summarySheet.getCell('C17').value = bom.summary.totalLaborPrice;
  summarySheet.getCell('D17').value = bom.summary.totalLaborPrice - bom.summary.totalLaborCost;
  summarySheet.getCell('E17').value = bom.summary.totalLaborPrice > 0
    ? ((bom.summary.totalLaborPrice - bom.summary.totalLaborCost) / bom.summary.totalLaborPrice * 100).toFixed(1) + '%'
    : '0%';

  summarySheet.getCell('A18').value = 'Delivery';
  summarySheet.getCell('B18').value = bom.summary.totalDeliveryCost;
  summarySheet.getCell('C18').value = bom.summary.totalDeliveryPrice;
  summarySheet.getCell('D18').value = bom.summary.totalDeliveryPrice - bom.summary.totalDeliveryCost;
  summarySheet.getCell('E18').value = bom.summary.totalDeliveryPrice > 0
    ? ((bom.summary.totalDeliveryPrice - bom.summary.totalDeliveryCost) / bom.summary.totalDeliveryPrice * 100).toFixed(1) + '%'
    : '0%';

  // Totals row
  summarySheet.getCell('A20').value = 'TOTAL';
  summarySheet.getCell('A20').font = { bold: true };
  summarySheet.getCell('B20').value = bom.summary.totalCost;
  summarySheet.getCell('C20').value = bom.summary.totalPrice;
  summarySheet.getCell('D20').value = bom.summary.grossMarginAmount;
  summarySheet.getCell('E20').value = bom.summary.grossMarginPercent.toFixed(1) + '%';
  ['A20', 'B20', 'C20', 'D20', 'E20'].forEach(cell => {
    summarySheet.getCell(cell).font = { bold: true };
    summarySheet.getCell(cell).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF00' } };
  });

  // Format currency columns
  ['B16', 'B17', 'B18', 'B20', 'C16', 'C17', 'C18', 'C20', 'D16', 'D17', 'D18', 'D20'].forEach(cell => {
    summarySheet.getCell(cell).numFmt = '"$"#,##0.00';
  });

  // Margin health indicator
  summarySheet.getCell('A22').value = 'Margin Health:';
  const marginHealth = bom.summary.grossMarginPercent >= MARGIN_THRESHOLDS.excellent
    ? '🟢 EXCELLENT'
    : bom.summary.grossMarginPercent >= MARGIN_THRESHOLDS.target
      ? '🟡 ON TARGET'
      : bom.summary.grossMarginPercent >= MARGIN_THRESHOLDS.minimum
        ? '🟠 ACCEPTABLE'
        : '🔴 BELOW MINIMUM';
  summarySheet.getCell('B22').value = marginHealth;

  // Column widths
  summarySheet.getColumn('A').width = 20;
  summarySheet.getColumn('B').width = 20;
  summarySheet.getColumn('C').width = 20;
  summarySheet.getColumn('D').width = 15;
  summarySheet.getColumn('E').width = 12;

  // --- SHEET 2: LINE ITEMS ---
  const lineItemsSheet = workbook.addWorksheet('Bill of Materials', {
    properties: { tabColor: { argb: 'FF0000' } }
  });

  // Warning header
  lineItemsSheet.mergeCells('A1:L1');
  const bomWarning = lineItemsSheet.getCell('A1');
  bomWarning.value = '⚠️ INTERNAL DOCUMENT - CONTAINS COST & MARGIN DATA - DO NOT SHARE ⚠️';
  bomWarning.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
  bomWarning.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000' } };
  bomWarning.alignment = { horizontal: 'center' };

  // Headers
  const headers = [
    'Category', 'Item Code', 'Description', 'Qty', 'Unit',
    'Unit Cost', 'Total Cost', 'Unit Price', 'Total Price',
    'Margin $', 'Margin %', 'Supplier'
  ];
  headers.forEach((header, index) => {
    const cell = lineItemsSheet.getCell(3, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
  });

  // Data rows
  bom.lineItems.forEach((item, index) => {
    const row = index + 4;
    lineItemsSheet.getCell(row, 1).value = item.category;
    lineItemsSheet.getCell(row, 2).value = item.itemCode;
    lineItemsSheet.getCell(row, 3).value = item.description;
    lineItemsSheet.getCell(row, 4).value = item.quantity;
    lineItemsSheet.getCell(row, 5).value = item.unit;
    lineItemsSheet.getCell(row, 6).value = item.unitCost;
    lineItemsSheet.getCell(row, 7).value = item.totalCost;
    lineItemsSheet.getCell(row, 8).value = item.unitPrice;
    lineItemsSheet.getCell(row, 9).value = item.totalPrice;
    lineItemsSheet.getCell(row, 10).value = item.marginAmount;
    lineItemsSheet.getCell(row, 11).value = item.marginPercent.toFixed(1) + '%';
    lineItemsSheet.getCell(row, 12).value = item.supplier || '';

    // Format currency
    [6, 7, 8, 9, 10].forEach(col => {
      lineItemsSheet.getCell(row, col).numFmt = '"$"#,##0.00';
    });

    // Highlight low margins
    if (item.marginPercent < MARGIN_THRESHOLDS.minimum) {
      lineItemsSheet.getCell(row, 11).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFCCCC' }
      };
    }
  });

  // Column widths
  lineItemsSheet.getColumn(1).width = 12;
  lineItemsSheet.getColumn(2).width = 15;
  lineItemsSheet.getColumn(3).width = 40;
  lineItemsSheet.getColumn(4).width = 8;
  lineItemsSheet.getColumn(5).width = 8;
  lineItemsSheet.getColumn(6).width = 12;
  lineItemsSheet.getColumn(7).width = 12;
  lineItemsSheet.getColumn(8).width = 12;
  lineItemsSheet.getColumn(9).width = 12;
  lineItemsSheet.getColumn(10).width = 12;
  lineItemsSheet.getColumn(11).width = 10;
  lineItemsSheet.getColumn(12).width = 25;

  // --- SHEET 3: CATEGORY BREAKDOWN ---
  const categorySheet = workbook.addWorksheet('Category Analysis', {
    properties: { tabColor: { argb: 'FF0000' } }
  });

  categorySheet.mergeCells('A1:E1');
  categorySheet.getCell('A1').value = '⚠️ INTERNAL - MARGIN ANALYSIS BY CATEGORY ⚠️';
  categorySheet.getCell('A1').font = { bold: true, color: { argb: 'FFFFFF' } };
  categorySheet.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0000' } };
  categorySheet.getCell('A1').alignment = { horizontal: 'center' };

  const catHeaders = ['Category', 'Cost', 'Price', 'Margin $', 'Margin %'];
  catHeaders.forEach((header, index) => {
    const cell = categorySheet.getCell(3, index + 1);
    cell.value = header;
    cell.font = { bold: true };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } };
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
  });

  bom.summary.categoryBreakdown.forEach((cat, index) => {
    const row = index + 4;
    categorySheet.getCell(row, 1).value = cat.category;
    categorySheet.getCell(row, 2).value = cat.cost;
    categorySheet.getCell(row, 3).value = cat.price;
    categorySheet.getCell(row, 4).value = cat.margin;
    categorySheet.getCell(row, 5).value = cat.marginPercent.toFixed(1) + '%';

    [2, 3, 4].forEach(col => {
      categorySheet.getCell(row, col).numFmt = '"$"#,##0.00';
    });
  });

  categorySheet.getColumn(1).width = 15;
  categorySheet.getColumn(2).width = 15;
  categorySheet.getColumn(3).width = 15;
  categorySheet.getColumn(4).width = 15;
  categorySheet.getColumn(5).width = 12;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

// ============================================
// DISTRIBUTOR RFP (SAFE TO SEND)
// ============================================

export function generateDistributorRFP(bom: BillOfMaterials): DistributorRFP {
  return {
    rfpNumber: `RFP-${bom.quoteNumber}`,
    dateNeeded: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    projectLocation: `${bom.customer.city}, ${bom.customer.state}`,
    building: {
      width: bom.building.width,
      length: bom.building.length,
      height: bom.building.height,
      legType: bom.building.legType,
    },
    materials: bom.lineItems
      .filter(item => ['STRUCTURE', 'DOORS', 'WINDOWS', 'INSULATION'].includes(item.category))
      .map(item => ({
        itemCode: item.itemCode,
        description: item.description,
        quantity: item.quantity,
        unit: item.unit,
        notes: item.notes,
      })),
    deliveryAddress: `${bom.customer.address}, ${bom.customer.city}, ${bom.customer.state} ${bom.customer.zip}`,
    deliveryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days
    contactName: '13|7 FrameWorks Purchasing',
    contactEmail: 'purchasing@137frameworks.com', // Internal email only
    contactPhone: '(123) 456-7890',
  };
}
