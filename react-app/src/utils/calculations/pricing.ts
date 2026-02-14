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
  DOOR_PRICE_MATRIX,
  WALK_DOOR_PRICES,
  WINDOW_PRICES,
  INSULATION_PRICES,
  OPTION_PRICES,
  CONCRETE_PRICES,
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
 * Uses flat-rate pricing to match the estimate summary display.
 */
export function calculateAccessoriesTotal(
  _building: BuildingConfig,
  accessories: AccessoriesConfig
): number {
  let total = 0;

  // Walk doors - first walk door included in base price, extras cost $1,045 each
  const extraWalkDoors = Math.max(0, accessories.walkDoors.length - 1);
  total += extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;

  // Roll-up/overhead doors - use the height×width price matrix
  accessories.rollUpDoors.forEach(door => {
    // door.size is stored as "WxH" or similar, door has height/width props
    // Use DOOR_PRICE_MATRIX with key format "heightxwidth"
    const key = `${door.height}x${door.width}`;
    const price = DOOR_PRICE_MATRIX[key] || 0;
    total += price;
  });

  // Windows
  accessories.windows.forEach(win => {
    const price = WINDOW_PRICES[win.size] || 0;
    total += price;
  });

  // Insulation - FLAT RATE (not per sqft)
  total += INSULATION_PRICES[accessories.insulation] || 0;

  // Ventilation - flat rate
  if (accessories.ventilation) {
    total += OPTION_PRICES.ventilation;
  }

  // Gutters - FLAT RATE (not per linear foot)
  if (accessories.gutters) {
    total += OPTION_PRICES.gutters;
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
  // All slabs are 4" with #3 rebar — no thickness multiplier needed

  if (concrete.type === 'piers') {
    // Estimate number of piers based on building size
    const perimeter = 2 * (building.width + building.length);
    const numPiers = Math.ceil(perimeter / 10); // One pier every 10 feet
    return numPiers * CONCRETE_PRICES.piers;
  }

  if (concrete.type === 'slab') {
    return sqft * CONCRETE_PRICES.slab;
  }

  if (concrete.type === 'turnkey') {
    return sqft * CONCRETE_PRICES.turnkey;
  }

  return 0;
}

/**
 * Labor is included in the base building package — no separate charge
 */
export function calculateLaborTotal(_building: BuildingConfig): number {
  return 0;
}

/**
 * Delivery + Haul Off — flat rate
 */
export function calculateDeliveryTotal(_distanceMiles: number = 50): number {
  return DELIVERY_BASE;
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
  // Labor is included in base building package — no separate charge
  const deliveryTotal = calculateDeliveryTotal(distanceMiles);

  const grandTotal = basePrice + accessoriesTotal + concreteTotal + deliveryTotal;
  const depositAmount = grandTotal * DEPOSIT_PERCENTAGE;

  return {
    basePrice: Math.round(basePrice * 100) / 100,
    accessoriesTotal: Math.round(accessoriesTotal * 100) / 100,
    concreteTotal: Math.round(concreteTotal * 100) / 100,
    laborTotal: 0,
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
