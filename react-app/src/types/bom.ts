/**
 * INTERNAL DOCUMENT TYPES - DO NOT SHARE WITH CLIENTS
 *
 * Bill of Materials types for internal use only.
 * These types contain cost and margin information.
 */

// Document classification for safety
export type DocumentClassification = 'INTERNAL' | 'CLIENT_SAFE' | 'RFP';

// BOM Line Item with full cost breakdown
export interface BOMLineItem {
  id: string;
  category: BOMCategory;
  itemCode: string;
  description: string;
  quantity: number;
  unit: 'ea' | 'sqft' | 'lnft' | 'set' | 'kit';

  // Costs (INTERNAL ONLY)
  unitCost: number;           // What we pay
  totalCost: number;          // unitCost * quantity

  // Pricing (What we charge)
  unitPrice: number;          // Selling price per unit
  totalPrice: number;         // unitPrice * quantity

  // Margins (INTERNAL ONLY)
  marginAmount: number;       // totalPrice - totalCost
  marginPercent: number;      // (marginAmount / totalPrice) * 100

  // Supplier info (INTERNAL ONLY)
  supplier?: string;
  supplierPartNumber?: string;
  leadTime?: string;

  // Notes
  notes?: string;
}

export type BOMCategory =
  | 'STRUCTURE'
  | 'DOORS'
  | 'WINDOWS'
  | 'INSULATION'
  | 'CONCRETE'
  | 'LABOR'
  | 'DELIVERY'
  | 'OPTIONS'
  | 'MISC';

// Full Bill of Materials
export interface BillOfMaterials {
  // Document Info
  id: string;
  classification: DocumentClassification;
  createdAt: string;
  createdBy: string;
  quoteNumber: string;

  // Customer Info (for reference, NOT for sending)
  customer: {
    name: string;
    email: string;  // NEVER auto-send to this email
    phone: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };

  // Building Specs
  building: {
    width: number;
    length: number;
    height: number;
    sqft: number;
    legType: string;
    roofColor: string;
    wallColor: string;
    trimColor: string;
  };

  // Line Items
  lineItems: BOMLineItem[];

  // Summary Totals
  summary: BOMSummary;

  // Internal Notes
  internalNotes?: string;

  // Safety flags
  _isInternal: true;  // Always true - this is an internal document
  _neverEmailToClient: true;  // Safety reminder
}

// BOM Summary with margin analysis
export interface BOMSummary {
  // Budget (Our Costs)
  totalMaterialCost: number;
  totalLaborCost: number;
  totalDeliveryCost: number;
  totalCost: number;

  // Actual (What we charge)
  totalMaterialPrice: number;
  totalLaborPrice: number;
  totalDeliveryPrice: number;
  totalPrice: number;

  // Margins
  grossMarginAmount: number;
  grossMarginPercent: number;

  // Breakdown by category
  categoryBreakdown: CategoryBreakdown[];

  // Deposit
  depositAmount: number;
  balanceDue: number;
}

export interface CategoryBreakdown {
  category: BOMCategory;
  cost: number;
  price: number;
  margin: number;
  marginPercent: number;
}

// RFP (Request for Proposal) - Safe for distributors
// This strips out our pricing and margins
export interface DistributorRFP {
  rfpNumber: string;
  dateNeeded: string;
  projectLocation: string;

  // Building specs only - no pricing
  building: {
    width: number;
    length: number;
    height: number;
    legType: string;
  };

  // Materials needed - quantities only, no prices
  materials: {
    itemCode: string;
    description: string;
    quantity: number;
    unit: string;
    notes?: string;
  }[];

  // Delivery requirements
  deliveryAddress: string;
  deliveryDate: string;

  // Contact for quotes
  contactName: string;
  contactEmail: string;  // Our email, not client
  contactPhone: string;
}

// Email validation to prevent accidental client sends
export interface EmailValidation {
  recipient: string;
  documentType: DocumentClassification;
  isClientEmail: boolean;
  canSend: boolean;
  reason?: string;
}

// Blocked email domains (client domains we should never auto-send internal docs to)
export const BLOCKED_CLIENT_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  // Add client company domains here as needed
] as const;

// Allowed internal domains
export const ALLOWED_INTERNAL_DOMAINS = [
  '137frameworks.com',
  'mingma.io',
  // Add your internal domains
] as const;
