import jsPDF from 'jspdf';
import type {
  CustomerInfo,
  BuildingConfig,
  AccessoriesConfig,
  ColorConfig,
  ConcreteConfig,
  PricingBreakdown,
  ContractConfig,
  DoorConfig
} from '../../types/estimator';
import { CONTRACT_TERMS, COMPANY_INFO, PAYMENT_METHODS } from '../../constants/contractTerms';

interface ContractPdfData {
  customer: CustomerInfo;
  building: BuildingConfig;
  accessories: AccessoriesConfig;
  colors: ColorConfig;
  concrete: ConcreteConfig;
  pricing: PricingBreakdown;
  contract: ContractConfig;
  doorPositions?: Record<string, number>;
}

// Helper to format date
function formatDate(dateString: string | null): string {
  if (!dateString) return 'Not signed';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper to format address
function formatAddress(address: { street: string; city: string; state: string; zip: string }): string {
  if (!address.street) return 'Not provided';
  return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
}

// Helper to get color name from hex
function getColorName(hex: string): string {
  const colorMap: Record<string, string> = {
    '#E8E8E8': 'Light Gray',
    '#D4D4D4': 'Gray',
    '#8B4513': 'Saddle Brown',
    '#2F4F4F': 'Dark Slate Gray',
    '#800020': 'Burgundy',
    '#1C1C1C': 'Black',
    '#FFFFFF': 'White',
    '#228B22': 'Forest Green',
    '#B22222': 'Firebrick Red',
    '#4169E1': 'Royal Blue',
    '#DAA520': 'Goldenrod',
    '#708090': 'Slate Gray'
  };
  return colorMap[hex.toUpperCase()] || hex;
}

// Draw 2D floor plan with door placements
function drawFloorPlan(
  doc: jsPDF,
  building: BuildingConfig,
  accessories: AccessoriesConfig,
  startX: number,
  startY: number,
  maxWidth: number,
  maxHeight: number
): number {
  const { width: bWidth, length: bLength } = building;

  // Calculate scale to fit in available space
  const scaleX = (maxWidth - 40) / bLength;
  const scaleY = (maxHeight - 60) / bWidth;
  const scale = Math.min(scaleX, scaleY, 2); // Cap scale at 2

  const planWidth = bLength * scale;
  const planHeight = bWidth * scale;

  // Center the plan
  const planX = startX + (maxWidth - planWidth) / 2;
  const planY = startY + 25;

  // Draw building outline
  doc.setDrawColor(33, 33, 33);
  doc.setLineWidth(0.8);
  doc.rect(planX, planY, planWidth, planHeight);

  // Draw dimension lines and labels
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(102, 102, 102);

  // Length dimension (top)
  doc.line(planX, planY - 5, planX + planWidth, planY - 5);
  doc.line(planX, planY - 8, planX, planY - 2);
  doc.line(planX + planWidth, planY - 8, planX + planWidth, planY - 2);
  doc.text(`${bLength}'`, planX + planWidth / 2, planY - 8, { align: 'center' });

  // Width dimension (left)
  doc.line(planX - 5, planY, planX - 5, planY + planHeight);
  doc.line(planX - 8, planY, planX - 2, planY);
  doc.line(planX - 8, planY + planHeight, planX - 2, planY + planHeight);

  // Rotate text for width - use save/restore
  const widthLabel = `${bWidth}'`;
  doc.text(widthLabel, planX - 12, planY + planHeight / 2, { angle: 90 });

  // Label the sides
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(20, 184, 166);

  doc.text('FRONT', planX + planWidth / 2, planY + planHeight + 12, { align: 'center' });
  doc.text('BACK', planX + planWidth / 2, planY - 15, { align: 'center' });
  doc.text('LEFT', planX - 18, planY + planHeight / 2, { angle: 90 });
  doc.text('RIGHT', planX + planWidth + 8, planY + planHeight / 2, { angle: -90 });

  // Draw doors
  const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];

  // Group doors by wall
  const doorsByWall: Record<string, DoorConfig[]> = {
    front: [],
    back: [],
    left: [],
    right: []
  };

  allDoors.forEach(door => {
    if (doorsByWall[door.wall]) {
      doorsByWall[door.wall].push(door);
    }
  });

  // Draw doors on each wall
  const doorColors = {
    walk: [255, 106, 0] as [number, number, number],    // Orange for walk doors
    rollUp: [20, 184, 166] as [number, number, number]  // Teal for roll-up doors
  };

  // Helper to draw a door
  const drawDoor = (
    x: number,
    y: number,
    doorWidth: number,
    doorHeight: number,
    door: DoorConfig,
    isVertical: boolean
  ) => {
    const color = doorColors[door.type];
    doc.setFillColor(...color);
    doc.setDrawColor(...color);

    if (isVertical) {
      doc.rect(x, y, doorWidth, doorHeight, 'F');
    } else {
      doc.rect(x, y, doorHeight, doorWidth, 'F');
    }

    // Door label
    doc.setFontSize(6);
    doc.setTextColor(255, 255, 255);
    const label = door.type === 'walk' ? 'W' : 'R';
    if (isVertical) {
      doc.text(label, x + doorWidth / 2, y + doorHeight / 2 + 1, { align: 'center' });
    } else {
      doc.text(label, x + doorHeight / 2, y + doorWidth / 2 + 1, { align: 'center' });
    }
  };

  // Position doors on each wall
  const doorThickness = 3;

  // Front wall doors (bottom of plan)
  let frontOffset = planWidth * 0.2;
  doorsByWall.front.forEach((door, idx) => {
    const doorWidthPx = parseFloat(door.size.split('x')[0]) * scale * 0.8;
    const xPos = planX + frontOffset + (idx * (doorWidthPx + 10));
    drawDoor(xPos, planY + planHeight - doorThickness, doorWidthPx, doorThickness, door, false);
  });

  // Back wall doors (top of plan)
  let backOffset = planWidth * 0.2;
  doorsByWall.back.forEach((door, idx) => {
    const doorWidthPx = parseFloat(door.size.split('x')[0]) * scale * 0.8;
    const xPos = planX + backOffset + (idx * (doorWidthPx + 10));
    drawDoor(xPos, planY, doorWidthPx, doorThickness, door, false);
  });

  // Left wall doors
  let leftOffset = planHeight * 0.2;
  doorsByWall.left.forEach((door, idx) => {
    const doorWidthPx = parseFloat(door.size.split('x')[0]) * scale * 0.8;
    const yPos = planY + leftOffset + (idx * (doorWidthPx + 10));
    drawDoor(planX, yPos, doorThickness, doorWidthPx, door, true);
  });

  // Right wall doors
  let rightOffset = planHeight * 0.2;
  doorsByWall.right.forEach((door, idx) => {
    const doorWidthPx = parseFloat(door.size.split('x')[0]) * scale * 0.8;
    const yPos = planY + rightOffset + (idx * (doorWidthPx + 10));
    drawDoor(planX + planWidth - doorThickness, yPos, doorThickness, doorWidthPx, door, true);
  });

  // Legend
  const legendY = planY + planHeight + 25;
  doc.setFontSize(7);
  doc.setTextColor(33, 33, 33);
  doc.text('LEGEND:', startX, legendY);

  doc.setFillColor(...doorColors.walk);
  doc.rect(startX + 25, legendY - 3, 8, 4, 'F');
  doc.text('Walk Door', startX + 35, legendY);

  doc.setFillColor(...doorColors.rollUp);
  doc.rect(startX + 70, legendY - 3, 8, 4, 'F');
  doc.text('Roll-Up Door', startX + 80, legendY);

  // Return the Y position after the plan
  return legendY + 10;
}

export async function generateContractPdf(data: ContractPdfData): Promise<jsPDF> {
  const { customer, building, accessories, colors, concrete, pricing, contract } = data;

  // Create PDF with professional settings
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  // Colors
  const primaryColor: [number, number, number] = [20, 184, 166]; // Teal #14B8A6
  const textColor: [number, number, number] = [33, 33, 33];
  const grayColor: [number, number, number] = [102, 102, 102];
  const lightGray: [number, number, number] = [200, 200, 200];

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let yPos = margin;

  // Helper functions
  const addNewPageIfNeeded = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  const drawLine = (y: number, color: [number, number, number] = lightGray) => {
    doc.setDrawColor(...color);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
  };

  // ===== HEADER =====
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 35, 'F');

  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(COMPANY_INFO.name, margin, 18);

  // Document title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('CONSTRUCTION CONTRACT AGREEMENT', margin, 28);

  // Contract date on right
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - margin, 18, { align: 'right' });

  yPos = 50;

  // ===== PARTIES =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTIES TO THIS AGREEMENT', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  // Contractor
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRACTOR:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(COMPANY_INFO.legalName, margin + 30, yPos);
  yPos += 6;

  // Owner
  doc.setFont('helvetica', 'bold');
  doc.text('OWNER:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(customer.name || 'Not provided', margin + 30, yPos);
  yPos += 6;

  // Contact info
  doc.setTextColor(...grayColor);
  doc.setFontSize(9);
  doc.text(`Email: ${customer.email || 'Not provided'}  |  Phone: ${customer.phone || 'Not provided'}`, margin, yPos);
  yPos += 5;
  doc.text(`Billing Address: ${formatAddress(customer.billingAddress)}`, margin, yPos);
  yPos += 5;

  const constructionAddr = customer.sameAsMailingAddress
    ? formatAddress(customer.billingAddress)
    : formatAddress(customer.constructionAddress);
  doc.text(`Construction Site: ${constructionAddr}`, margin, yPos);
  yPos += 10;

  drawLine(yPos);
  yPos += 8;

  // ===== BUILDING SPECIFICATIONS =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDING SPECIFICATIONS', margin, yPos);
  yPos += 8;

  // Building specs box
  doc.setFillColor(250, 250, 250);
  doc.roundedRect(margin, yPos, contentWidth, 55, 3, 3, 'F');
  doc.setDrawColor(...lightGray);
  doc.roundedRect(margin, yPos, contentWidth, 55, 3, 3, 'S');

  const specStartY = yPos + 6;
  const col1 = margin + 5;
  const col2 = margin + 50;
  const col3 = margin + 95;
  const col4 = margin + 140;

  doc.setFontSize(9);

  // Row 1
  doc.setFont('helvetica', 'bold');
  doc.text('Building Size:', col1, specStartY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${building.width}' × ${building.length}'`, col2, specStartY);

  doc.setFont('helvetica', 'bold');
  doc.text('Eave Height:', col3, specStartY);
  doc.setFont('helvetica', 'normal');
  doc.text(`${building.height}'`, col4, specStartY);

  // Row 2
  doc.setFont('helvetica', 'bold');
  doc.text('Square Feet:', col1, specStartY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`${(building.width * building.length).toLocaleString()} sq ft`, col2, specStartY + 8);

  doc.setFont('helvetica', 'bold');
  doc.text('Frame Type:', col3, specStartY + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(building.legType === 'certified' ? 'Engineer Certified' : 'Standard', col4, specStartY + 8);

  // Row 3 - Colors
  doc.setFont('helvetica', 'bold');
  doc.text('Roof Color:', col1, specStartY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(getColorName(colors.roof), col2, specStartY + 16);

  doc.setFont('helvetica', 'bold');
  doc.text('Wall Color:', col3, specStartY + 16);
  doc.setFont('helvetica', 'normal');
  doc.text(getColorName(colors.walls), col4, specStartY + 16);

  // Row 4 - Trim & Insulation
  doc.setFont('helvetica', 'bold');
  doc.text('Trim Color:', col1, specStartY + 24);
  doc.setFont('helvetica', 'normal');
  doc.text(getColorName(colors.trim), col2, specStartY + 24);

  doc.setFont('helvetica', 'bold');
  doc.text('Insulation:', col3, specStartY + 24);
  doc.setFont('helvetica', 'normal');
  const insulationText = accessories.insulation === 'none' ? 'None' :
                         accessories.insulation === 'ceiling' ? 'Ceiling Only' : 'Full (Walls + Ceiling)';
  doc.text(insulationText, col4, specStartY + 24);

  // Row 5 - Concrete & Gutters
  doc.setFont('helvetica', 'bold');
  doc.text('Concrete:', col1, specStartY + 32);
  doc.setFont('helvetica', 'normal');
  const concreteText = concrete.type === 'none' ? 'None (Owner Provides)' :
                       concrete.type === 'piers' ? 'Concrete Piers' :
                       concrete.type === 'slab' ? `${concrete.thickness}" Slab` : 'Turnkey Package';
  doc.text(concreteText, col2, specStartY + 32);

  doc.setFont('helvetica', 'bold');
  doc.text('Gutters:', col3, specStartY + 32);
  doc.setFont('helvetica', 'normal');
  doc.text(accessories.gutters ? 'Included' : 'Not Included', col4, specStartY + 32);

  // Row 6 - Additional features
  doc.setFont('helvetica', 'bold');
  doc.text('Ventilation:', col1, specStartY + 40);
  doc.setFont('helvetica', 'normal');
  doc.text(accessories.ventilation ? 'Ridge Vents Included' : 'Not Included', col2, specStartY + 40);

  yPos += 63;

  // ===== DOORS & WINDOWS =====
  doc.setTextColor(...textColor);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DOORS & WINDOWS', margin, yPos);
  yPos += 6;

  // Doors table
  const allDoors = [...accessories.walkDoors, ...accessories.rollUpDoors];
  const allWindows = accessories.windows;

  if (allDoors.length > 0 || allWindows.length > 0) {
    doc.setFontSize(8);

    // Table header
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPos, contentWidth, 6, 'F');
    doc.setFont('helvetica', 'bold');
    doc.text('Type', margin + 3, yPos + 4);
    doc.text('Size', margin + 45, yPos + 4);
    doc.text('Location', margin + 80, yPos + 4);
    doc.text('Qty', margin + 130, yPos + 4);
    yPos += 7;

    doc.setFont('helvetica', 'normal');

    // Doors
    allDoors.forEach(door => {
      doc.text(door.type === 'walk' ? 'Walk Door' : 'Roll-Up Door', margin + 3, yPos + 3);
      doc.text(door.size, margin + 45, yPos + 3);
      doc.text(door.wall.charAt(0).toUpperCase() + door.wall.slice(1) + ' Wall', margin + 80, yPos + 3);
      doc.text(door.quantity.toString(), margin + 130, yPos + 3);
      yPos += 5;
    });

    // Windows
    allWindows.forEach(window => {
      doc.text('Window', margin + 3, yPos + 3);
      doc.text(window.size, margin + 45, yPos + 3);
      doc.text(window.wall.charAt(0).toUpperCase() + window.wall.slice(1) + ' Wall', margin + 80, yPos + 3);
      doc.text(window.quantity.toString(), margin + 130, yPos + 3);
      yPos += 5;
    });

    yPos += 3;
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('No doors or windows selected', margin, yPos + 3);
    yPos += 8;
  }

  drawLine(yPos);
  yPos += 8;

  // ===== 2D FLOOR PLAN =====
  addNewPageIfNeeded(100);

  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BUILDING FLOOR PLAN - DOOR PLACEMENT', margin, yPos);
  yPos += 3;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Aerial view showing door locations (not to scale)', margin, yPos + 5);
  yPos += 8;

  // Draw the floor plan
  yPos = drawFloorPlan(doc, building, accessories, margin, yPos, contentWidth, 80);

  yPos += 5;
  drawLine(yPos);
  yPos += 8;

  // ===== CONTRACT SUM =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTRACT SUM', margin, yPos);
  yPos += 8;

  // Pricing breakdown
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  const pricingItems = [
    { label: 'Base Building Package', amount: pricing.basePrice },
    { label: 'Doors, Windows & Accessories', amount: pricing.accessoriesTotal },
    { label: 'Concrete Work', amount: pricing.concreteTotal },
    { label: 'Labor & Installation', amount: pricing.laborTotal },
    { label: 'Delivery', amount: pricing.deliveryTotal }
  ];

  pricingItems.forEach(item => {
    doc.text(item.label, margin, yPos);
    doc.text(formatCurrency(item.amount), pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  });

  // Total
  yPos += 2;
  doc.setFillColor(...primaryColor);
  doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL CONTRACT SUM', margin + 5, yPos + 8);
  doc.text(formatCurrency(pricing.grandTotal), pageWidth - margin - 5, yPos + 8, { align: 'right' });
  yPos += 20;

  drawLine(yPos);
  yPos += 8;

  // ===== PAYMENT SCHEDULE =====
  doc.setTextColor(...textColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT SCHEDULE', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const draws = [
    { name: 'Draw 1 (30%)', desc: 'Due upon contract signing', amount: pricing.grandTotal * 0.30 },
    { name: 'Draw 2 (30%)', desc: 'Due upon delivery of materials', amount: pricing.grandTotal * 0.30 },
    { name: 'Draw 3 (30%)', desc: 'Due upon completion of framing', amount: pricing.grandTotal * 0.30 },
    { name: 'Final Draw (10%)', desc: 'Due upon Substantial Completion', amount: pricing.grandTotal * 0.10 }
  ];

  draws.forEach((draw) => {
    doc.setFont('helvetica', 'bold');
    doc.text(draw.name, margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text(draw.desc, margin + 40, yPos);
    doc.setTextColor(...textColor);
    doc.text(formatCurrency(draw.amount), pageWidth - margin, yPos, { align: 'right' });
    yPos += 6;
  });

  // Payment method
  const paymentLabel = PAYMENT_METHODS.find(m => m.id === contract.paymentMethod)?.label || 'Not selected';
  yPos += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Method for Draw 1:', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(paymentLabel, margin + 55, yPos);
  yPos += 10;

  drawLine(yPos);
  yPos += 8;

  // ===== CONTRACT TERMS =====
  // Add contract terms sections
  const termSections = [
    { key: 'projectOverview', number: '1' },
    { key: 'paymentTerms', number: '2' },
    { key: 'timeline', number: '3' },
    { key: 'responsibilities', number: '4' },
    { key: 'warranties', number: '5' },
    { key: 'legalProvisions', number: '6' }
  ] as const;

  for (const termSection of termSections) {
    const terms = CONTRACT_TERMS[termSection.key];
    const sectionState = contract.sections[termSection.key];

    addNewPageIfNeeded(40);

    // Section header
    doc.setTextColor(...primaryColor);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`SECTION ${termSection.number}: ${terms.title.toUpperCase()}`, margin, yPos);
    yPos += 7;

    // Section terms
    for (const section of terms.sections) {
      addNewPageIfNeeded(25);

      doc.setTextColor(...textColor);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(section.heading, margin, yPos);
      yPos += 5;

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...grayColor);

      for (const paragraph of section.content) {
        addNewPageIfNeeded(10);

        const indent = paragraph.startsWith('•') ? margin + 5 : margin;
        const lines = doc.splitTextToSize(paragraph, contentWidth - (indent - margin));

        for (const line of lines) {
          if (yPos > pageHeight - margin - 10) {
            doc.addPage();
            yPos = margin;
          }
          doc.text(line, indent, yPos);
          yPos += 4;
        }
        yPos += 1;
      }
      yPos += 3;
    }

    // Acknowledgment status
    addNewPageIfNeeded(20);
    const isAcknowledged = sectionState.checked && sectionState.initialed;
    if (isAcknowledged) {
      doc.setFillColor(230, 255, 250);
    } else {
      doc.setFillColor(255, 245, 245);
    }
    doc.roundedRect(margin, yPos, contentWidth, 12, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    if (isAcknowledged) {
      doc.setTextColor(20, 184, 166);
    } else {
      doc.setTextColor(200, 50, 50);
    }

    const ackStatus = sectionState.checked && sectionState.initialed
      ? '✓ Section acknowledged and initialed'
      : '✗ Section not acknowledged';
    doc.text(ackStatus, margin + 5, yPos + 7);

    // Add initials image if available
    if (sectionState.initialsData) {
      try {
        doc.addImage(sectionState.initialsData, 'PNG', pageWidth - margin - 25, yPos + 1, 20, 10);
      } catch {
        // Skip if image fails
      }
    }

    yPos += 18;
    drawLine(yPos - 3);
  }

  // ===== SIGNATURES PAGE =====
  doc.addPage();
  yPos = margin;

  // Signature header
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 25, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FINAL ACKNOWLEDGMENT & SIGNATURES', margin, 16);
  yPos = 40;

  // Final agreement text
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const agreementText = `By signing below, both parties acknowledge that they have read, understood, and agree to be bound by all terms and conditions set forth in this Contract Agreement. The Owner agrees to pay the Contract Sum of ${formatCurrency(pricing.grandTotal)} according to the payment schedule specified herein.`;

  const agreementLines = doc.splitTextToSize(agreementText, contentWidth);
  doc.text(agreementLines, margin, yPos);
  yPos += (agreementLines.length * 5) + 15;

  // Owner Signature Box
  doc.setDrawColor(...lightGray);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('OWNER', margin + 5, yPos + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Printed Name: ${contract.signatures.ownerTypedName || 'Not provided'}`, margin + 5, yPos + 18);
  doc.text(`Date: ${formatDate(contract.signatures.ownerSignedAt)}`, margin + 5, yPos + 26);

  // Add owner signature image
  if (contract.signatures.ownerSignature) {
    try {
      doc.addImage(contract.signatures.ownerSignature, 'PNG', pageWidth - margin - 65, yPos + 10, 60, 30);
    } catch {
      doc.text('[Signature on file]', pageWidth - margin - 50, yPos + 25);
    }
  } else {
    doc.text('[Not signed]', pageWidth - margin - 40, yPos + 25);
  }

  yPos += 60;

  // Contractor Signature Box
  doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'S');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...textColor);
  doc.text('CONTRACTOR', margin + 5, yPos + 8);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text(`Printed Name: ${contract.signatures.contractorTypedName || 'Not provided'}`, margin + 5, yPos + 18);
  doc.text(`Date: ${formatDate(contract.signatures.contractorSignedAt)}`, margin + 5, yPos + 26);
  doc.text(`On behalf of: ${COMPANY_INFO.legalName}`, margin + 5, yPos + 34);

  // Add contractor signature image
  if (contract.signatures.contractorSignature) {
    try {
      doc.addImage(contract.signatures.contractorSignature, 'PNG', pageWidth - margin - 65, yPos + 10, 60, 30);
    } catch {
      doc.text('[Signature on file]', pageWidth - margin - 50, yPos + 25);
    }
  } else {
    doc.text('[Not signed]', pageWidth - margin - 40, yPos + 25);
  }

  yPos += 60;

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text('This contract was generated electronically and is legally binding when signed by all parties.', margin, pageHeight - 15);
  doc.text(`Document ID: ${Date.now().toString(36).toUpperCase()}`, pageWidth - margin, pageHeight - 15, { align: 'right' });

  return doc;
}

export async function downloadContractPdf(data: ContractPdfData, filename?: string): Promise<void> {
  const doc = await generateContractPdf(data);
  const defaultFilename = `137-Contract-${data.customer.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename || defaultFilename);
}

export async function getContractPdfBlob(data: ContractPdfData): Promise<Blob> {
  const doc = await generateContractPdf(data);
  return doc.output('blob');
}
