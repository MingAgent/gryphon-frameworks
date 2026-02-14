import type {
  BuildingConfig,
  AccessoriesConfig,
  ConcreteConfig,
  PricingBreakdown
} from '../../types/estimator';
import {
  BUILDING_SIZES,
  EAVE_HEIGHTS,
  LEG_TYPE_MULTIPLIERS,
  DOOR_PRICES,
  WINDOW_PRICES,
  INSULATION_PRICES,
  OPTION_PRICES,
  CONCRETE_PRICES,
  CONCRETE_THICKNESS_MULTIPLIERS,
  LABOR_RATE_PER_SQFT,
  DELIVERY_BASE,
  DEPOSIT_PERCENTAGE
} from '../../constants/pricing';

/**
 * Calculate the base price of the building structure using cookie-cutter pricing
 */
export function calculateBasePrice(building: BuildingConfig): number {
  // Find the selected building size
  const selectedSize = BUILDING_SIZES.find(s => s.id === building.buildingSizeId);
  const selectedHeight = EAVE_HEIGHTS.find(h => h.id === building.eaveHeightId);

  if (!selectedSize) {
    // Fallback to first size if not found
    return BUILDING_SIZES[0].startingPrice;
  }

  // Base price from cookie-cutter size + eave height modifier
  let basePrice = selectedSize.startingPrice + (selectedHeight?.modifier || 0);

  // Apply leg type multiplier for certified frames
  const legMultiplier = LEG_TYPE_MULTIPLIERS[building.legType];
  if (legMultiplier > 1) {
    // Add 15% for certified frames
    basePrice = basePrice * legMultiplier;
  }

  return basePrice;
}

/**
 * Calculate the total cost of accessories (doors, windows, insulation, etc.)
 */
export function calculateAccessoriesTotal(
  building: BuildingConfig,
  accessories: AccessoriesConfig
): number {
  let total = 0;

  // Walk doors
  accessories.walkDoors.forEach(door => {
    const price = DOOR_PRICES.walk[door.size] || 0;
    total += price * door.quantity;
  });

  // Roll-up doors
  accessories.rollUpDoors.forEach(door => {
    const price = DOOR_PRICES.rollUp[door.size] || 0;
    total += price * door.quantity;
  });

  // Windows
  accessories.windows.forEach(window => {
    const price = WINDOW_PRICES[window.size] || 0;
    total += price * window.quantity;
  });

  // Insulation
  const sqft = building.width * building.length;
  const ceilingSqft = sqft;
  const wallSqft = 2 * (building.width + building.length) * building.height;

  if (accessories.insulation === 'ceiling') {
    total += ceilingSqft * INSULATION_PRICES.ceiling;
  } else if (accessories.insulation === 'full') {
    total += (ceilingSqft + wallSqft) * INSULATION_PRICES.full;
  }

  // Ventilation
  if (accessories.ventilation) {
    total += OPTION_PRICES.ventilation;
  }

  // Gutters (per linear foot of eave)
  if (accessories.gutters) {
    const gutterLength = building.length * 2; // Both sides
    total += gutterLength * OPTION_PRICES.gutters;
  }

  return total;
}

/**
 * Calculate concrete costs
 */
export function calculateConcreteTotal(
  building: BuildingConfig,
  concrete: ConcreteConfig
): number {
  if (concrete.type === 'none' || concrete.existingPad) {
    return 0;
  }

  const sqft = building.width * building.length;
  const thicknessMultiplier = CONCRETE_THICKNESS_MULTIPLIERS[concrete.thickness as keyof typeof CONCRETE_THICKNESS_MULTIPLIERS] || 1;

  if (concrete.type === 'piers') {
    // Estimate number of piers based on building size
    const perimeter = 2 * (building.width + building.length);
    const numPiers = Math.ceil(perimeter / 10); // One pier every 10 feet
    return numPiers * CONCRETE_PRICES.piers * thicknessMultiplier;
  }

  if (concrete.type === 'slab') {
    return sqft * CONCRETE_PRICES.slab * thicknessMultiplier;
  }

  if (concrete.type === 'turnkey') {
    return sqft * CONCRETE_PRICES.turnkey * thicknessMultiplier;
  }

  return 0;
}

/**
 * Calculate labor costs
 */
export function calculateLaborTotal(building: BuildingConfig): number {
  const sqft = building.width * building.length;
  return sqft * LABOR_RATE_PER_SQFT;
}

/**
 * Calculate delivery costs (base + distance)
 */
export function calculateDeliveryTotal(distanceMiles: number = 50): number {
  return DELIVERY_BASE + (distanceMiles * 0); // Simplified - no per-mile charge for now
}

/**
 * Calculate the complete pricing breakdown
 */
export function calculateTotalPrice(
  building: BuildingConfig,
  accessories: AccessoriesConfig,
  concrete: ConcreteConfig,
  distanceMiles: number = 50
): PricingBreakdown {
  const basePrice = calculateBasePrice(building);
  const accessoriesTotal = calculateAccessoriesTotal(building, accessories);
  const concreteTotal = calculateConcreteTotal(building, concrete);
  const laborTotal = calculateLaborTotal(building);
  const deliveryTotal = calculateDeliveryTotal(distanceMiles);

  const grandTotal = basePrice + accessoriesTotal + concreteTotal + laborTotal + deliveryTotal;
  const depositAmount = grandTotal * DEPOSIT_PERCENTAGE;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    accessoriesTotal: Math.round(accessoriesTotal * 100) / 100,
    concreteTotal: Math.round(concreteTotal * 100) / 100,
    laborTotal: Math.round(laborTotal * 100) / 100,
    deliveryTotal: Math.round(deliveryTotal * 100) / 100,
    grandTotal: Math.round(grandTotal * 100) / 100,
    depositAmount: Math.round(depositAmount * 100) / 100
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}
