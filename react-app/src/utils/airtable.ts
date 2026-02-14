/**
 * Airtable Integration — Construction Plans table
 * ═══════════════════════════════════════════════════
 * Creates records in the "Construction Plans" table when a
 * construction plan PDF is generated or sent to the crew.
 *
 * Environment variables (set in .env.local):
 *   VITE_AIRTABLE_PAT   — Personal Access Token
 */

import type {
  CustomerInfo,
  BuildingConfig,
  PricingBreakdown,
} from '../types/estimator';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const BASE_ID = 'appgKxWlWDXiWyGbC';
const TABLE_ID = 'tblUjKdGMAAdaxllO';
const API_URL = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function getToken(): string | null {
  return import.meta.env.VITE_AIRTABLE_PAT || null;
}

function buildingTypeLabel(type: string): string {
  switch (type) {
    case 'pole-barn':
      return 'Pole Barn';
    case 'carport':
      return 'Carport';
    case 'i-beam':
      return 'I-Beam Construction';
    case 'bolt-up':
    default:
      return 'Bolt-Up';
  }
}

function formatAddress(addr: { street: string; city: string; state: string; zip: string }): string {
  if (!addr.street) return '';
  return `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

export interface ConstructionPlanRecord {
  customer: CustomerInfo;
  building: BuildingConfig;
  pricing: PricingBreakdown;
  notes?: string;
}

/**
 * Create a Construction Plan record in Airtable.
 * Returns the created record ID, or null if the API key is missing.
 */
export async function createConstructionPlanRecord(
  data: ConstructionPlanRecord
): Promise<string | null> {
  const token = getToken();
  if (!token) {
    console.warn('[Airtable] No VITE_AIRTABLE_PAT set — skipping record creation.');
    return null;
  }

  const { customer, building, pricing, notes } = data;
  const typeLabel = buildingTypeLabel(building.buildingType);
  const constructionAddr = customer.sameAsMailingAddress
    ? formatAddress(customer.billingAddress)
    : formatAddress(customer.constructionAddress);

  const fields: Record<string, unknown> = {
    Project_Name: `${building.width}x${building.length} ${typeLabel} — ${customer.name || 'N/A'}`,
    Customer_Name: customer.name || '',
    Customer_Email: customer.email || undefined,
    Customer_Phone: customer.phone || undefined,
    Building_Type: typeLabel,
    Building_Size: `${building.width}' × ${building.length}'`,
    Eave_Height: building.height,
    Construction_Address: constructionAddr,
    Contract_Total: pricing.grandTotal,
    Plan_Status: 'Generated',
    Notes: notes || `6-sheet construction plan set generated on ${new Date().toLocaleDateString()}.`,
    Created_Date: new Date().toISOString(),
  };

  // Strip undefined values
  Object.keys(fields).forEach((k) => {
    if (fields[k] === undefined || fields[k] === '') delete fields[k];
  });

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[Airtable] Failed to create record:', err);
    return null;
  }

  const json = await res.json();
  return json.id as string;
}

/**
 * Check if Airtable integration is configured.
 */
export function isAirtableConfigured(): boolean {
  return !!getToken();
}
