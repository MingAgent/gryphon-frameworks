/**
 * INTERNAL DOCUMENT - DO NOT SHARE WITH CLIENTS
 *
 * This file contains proprietary cost information including:
 * - Our actual material costs
 * - Labor costs
 * - Supplier pricing
 * - Profit margins
 *
 * WARNING: This information is confidential and should NEVER be:
 * - Sent to client emails
 * - Shared in client-facing documents
 * - Exported to client PDFs
 */

// ============================================
// MATERIAL COSTS (What we pay suppliers)
// ============================================

// Steel and structural costs per square foot
export const INTERNAL_COSTS = {
  // Structure base costs (our cost)
  structure: {
    steelFramePerSqft: 4.25,        // We charge $8.50, cost $4.25 = 50% margin
    roofPanelsPerSqft: 1.85,        // Per sqft of roof
    wallPanelsPerSqft: 1.65,        // Per sqft of walls
    postsEach: 45.00,               // Per post
    hardwareKit: 125.00,            // Bolts, screws, anchors per building
    trimPerLnft: 1.25,              // Trim pieces per linear foot
  },

  // Door costs (our cost)
  doors: {
    walk: {
      '3x7': 185.00,                // Sell for $350
      '4x7': 210.00,                // Sell for $400
      '6x7': 295.00,                // Sell for $550
    },
    rollUp: {
      '8x8': 425.00,                // Sell for $850
      '10x10': 575.00,              // Sell for $1100
      '12x12': 765.00,              // Sell for $1450
    },
    hardware: 35.00,                // Per door (hinges, handles, etc.)
  },

  // Window costs (our cost)
  windows: {
    '30x36': 85.00,                 // Sell for $175
    '36x48': 115.00,                // Sell for $225
    frame: 25.00,                   // Per window frame
  },

  // Insulation costs (our cost per sqft)
  insulation: {
    none: 0,
    ceiling: 0.65,                  // Sell for $1.25
    full: 1.35,                     // Sell for $2.50
  },

  // Concrete costs (our cost)
  concrete: {
    piersEach: 65.00,               // Sell for $125
    slabPerSqft: 3.50,              // Sell for $6.50
    turnkeyPerSqft: 4.75,           // Sell for $8.75
    rebar: 0.45,                    // Per sqft
    meshReinforcement: 0.25,        // Per sqft
  },

  // Labor costs (our cost)
  labor: {
    installationPerSqft: 1.75,      // Sell for $3.50
    concreteCrewPerSqft: 1.25,      // Included in concrete pricing
    electricalHookup: 350.00,       // If needed
    permitFiling: 75.00,            // Our filing cost
  },

  // Delivery costs (our cost)
  delivery: {
    baseCost: 275.00,               // Sell for $500
    perMileOver50: 2.25,            // If > 50 miles
    craneRental: 450.00,            // If needed
  },

  // Additional options (our cost)
  options: {
    ventilation: 75.00,             // Sell for $150
    guttersPerLnft: 2.25,           // Sell for $4.50
    downspoutEach: 18.00,           // Per downspout
  },
} as const;

// ============================================
// SELLING PRICES (What we charge clients)
// ============================================
export const SELLING_PRICES = {
  structure: {
    basePerSqft: 8.50,
  },
  doors: {
    walk: {
      '3x7': 350,
      '4x7': 400,
      '6x7': 550,
    },
    rollUp: {
      '8x8': 850,
      '10x10': 1100,
      '12x12': 1450,
    },
  },
  windows: {
    '30x36': 175,
    '36x48': 225,
  },
  insulation: {
    none: 0,
    ceiling: 1.25,
    full: 2.50,
  },
  concrete: {
    piers: 125,
    slab: 6.50,
    turnkey: 8.75,
  },
  labor: {
    perSqft: 3.50,
  },
  delivery: {
    base: 500,
  },
  options: {
    ventilation: 150,
    guttersPerLnft: 4.50,
  },
} as const;

// ============================================
// SUPPLIER INFORMATION (INTERNAL ONLY)
// ============================================
export const SUPPLIERS = {
  steel: {
    name: 'Texas Steel Supply',
    contact: 'orders@txsteel.com',
    accountNumber: 'GF-2024-001',
    leadTime: '5-7 business days',
  },
  doors: {
    name: 'Southwest Door & Hardware',
    contact: 'wholesale@swdoor.com',
    accountNumber: 'GF-WH-445',
    leadTime: '3-5 business days',
  },
  concrete: {
    name: 'Regional Concrete Co',
    contact: 'dispatch@regionalconcrete.com',
    accountNumber: 'GF-CON-112',
    leadTime: '24-48 hours notice',
  },
  insulation: {
    name: 'BuildPro Insulation',
    contact: 'sales@buildpro.com',
    accountNumber: 'GF-INS-078',
    leadTime: '2-3 business days',
  },
} as const;

// ============================================
// MARGIN CALCULATION HELPERS
// ============================================
export function calculateMargin(cost: number, sellingPrice: number): number {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - cost) / sellingPrice) * 100;
}

export function calculateMarkup(cost: number, sellingPrice: number): number {
  if (cost === 0) return 0;
  return ((sellingPrice - cost) / cost) * 100;
}

// Target margin thresholds
export const MARGIN_THRESHOLDS = {
  minimum: 35,      // Alert if margin falls below 35%
  target: 45,       // Our target margin
  excellent: 55,    // Great margin
} as const;
