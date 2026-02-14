/**
 * 13|7 FrameWorks — Construction Plan Test Generator
 * ═══════════════════════════════════════════════════
 * Generates 5 test PDF plan sets using different building configurations.
 *
 * Usage:  npx esbuild tests/generate-test-plans.ts --bundle --platform=node --outfile=tests/gen.cjs --external:canvas && node tests/gen.cjs
 */

import { generateStandaloneConstructionPlan } from '../src/utils/pdf/constructionPlan';
import type { ConstructionPlanData } from '../src/utils/pdf/constructionPlan';
import type {
  CustomerInfo,
  BuildingConfig,
  AccessoriesConfig,
  ConcreteConfig,
  ColorConfig,
  DoorConfig,
  WindowConfig,
} from '../src/types/estimator';
import * as fs from 'fs';
import * as path from 'path';

/* ================================================================
   HELPER — build a DoorConfig with defaults
   ================================================================ */

function door(
  type: 'walk' | 'rollUp',
  width: number,
  height: number,
  wall: 'front' | 'back' | 'left' | 'right',
  position: number,
  qty = 1
): DoorConfig {
  return {
    id: `${type}-${wall}-${position}`,
    type,
    size: `${width}x${height}` as any,
    width,
    height,
    wall,
    position,
    quantity: qty,
  };
}

function win(
  size: '3x3' | '4x4',
  wall: 'front' | 'back' | 'left' | 'right',
  qty = 1
): WindowConfig {
  return { id: `win-${wall}-${size}`, size, wall, quantity: qty };
}

/* ================================================================
   5 TEST CASES
   ================================================================ */

const testCases: { name: string; filename: string; data: ConstructionPlanData }[] = [
  // ── USE CASE 1: Small Pole Barn ──
  {
    name: 'Use Case 1 — Small Pole Barn (30×40, 10\' eave)',
    filename: 'TEST-01-Small-Pole-Barn-30x40.pdf',
    data: {
      customer: {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-0101',
        address: '123 Rural Rd',
        city: 'Springfield',
        state: 'TX',
        zip: '75001',
        billingAddress: { street: '123 Rural Rd', city: 'Springfield', state: 'TX', zip: '75001' },
        constructionAddress: { street: '456 Farm Ln', city: 'Springfield', state: 'TX', zip: '75001' },
        sameAsMailingAddress: false,
      },
      building: {
        buildingType: 'pole-barn',
        buildingSizeId: '30x40',
        eaveHeightId: '10',
        width: 30,
        length: 40,
        height: 10,
        legType: 'standard',
        buildingView: 'front',
        breezeway: { frontBack: false, sideSide: false },
      },
      accessories: {
        walkDoors: [door('walk', 3, 7, 'front', 5)],
        rollUpDoors: [door('rollUp', 10, 8, 'front', 15)],
        windows: [],
        insulation: 'none',
        ventilation: false,
        gutters: false,
      },
      concrete: { type: 'none', existingPad: false, thickness: 4 },
      colors: { roof: '#D4D4D4', walls: '#E8E8E8', trim: '#1C1C1C', doors: '#FFFFFF' },
    },
  },

  // ── USE CASE 2: Medium Workshop ──
  {
    name: 'Use Case 2 — Medium Workshop (40×60, 14\' eave)',
    filename: 'TEST-02-Medium-Workshop-40x60.pdf',
    data: {
      customer: {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '555-0202',
        address: '789 Workshop Way',
        city: 'Dallas',
        state: 'TX',
        zip: '75201',
        billingAddress: { street: '789 Workshop Way', city: 'Dallas', state: 'TX', zip: '75201' },
        constructionAddress: { street: '789 Workshop Way', city: 'Dallas', state: 'TX', zip: '75201' },
        sameAsMailingAddress: true,
      },
      building: {
        buildingType: 'pole-barn',
        buildingSizeId: '40x60',
        eaveHeightId: '14',
        width: 40,
        length: 60,
        height: 14,
        legType: 'certified',
        buildingView: 'front',
        breezeway: { frontBack: false, sideSide: false },
      },
      accessories: {
        walkDoors: [
          door('walk', 3, 7, 'front', 4),
          door('walk', 3, 7, 'right', 10),
        ],
        rollUpDoors: [
          door('rollUp', 12, 12, 'front', 18),
          door('rollUp', 12, 12, 'back', 14),
        ],
        windows: [win('3x3', 'left', 2), win('3x3', 'right', 2)],
        insulation: 'full',
        ventilation: false,
        gutters: true,
      },
      concrete: { type: 'slab', existingPad: false, thickness: 4 },
      colors: { roof: '#2F4F4F', walls: '#E8E8E8', trim: '#2F4F4F', doors: '#FFFFFF' },
    },
  },

  // ── USE CASE 3: Large Warehouse ──
  {
    name: 'Use Case 3 — Large Warehouse (60×100, 20\' eave)',
    filename: 'TEST-03-Large-Warehouse-60x100.pdf',
    data: {
      customer: {
        name: 'Acme Industries LLC',
        email: 'ops@acme.com',
        phone: '555-0303',
        address: '100 Industrial Blvd',
        city: 'Houston',
        state: 'TX',
        zip: '77001',
        billingAddress: { street: '100 Industrial Blvd', city: 'Houston', state: 'TX', zip: '77001' },
        constructionAddress: { street: '200 Commerce Dr', city: 'Houston', state: 'TX', zip: '77002' },
        sameAsMailingAddress: false,
      },
      building: {
        buildingType: 'pole-barn',
        buildingSizeId: '60x100',
        eaveHeightId: '20',
        width: 60,
        length: 100,
        height: 20,
        legType: 'certified',
        buildingView: 'front',
        breezeway: { frontBack: false, sideSide: false },
      },
      accessories: {
        walkDoors: [
          door('walk', 3, 7, 'front', 5),
          door('walk', 3, 7, 'front', 52),
          door('walk', 3, 7, 'back', 28),
        ],
        rollUpDoors: [
          door('rollUp', 14, 14, 'front', 20),
          door('rollUp', 14, 14, 'front', 36),
          door('rollUp', 14, 14, 'left', 40),
          door('rollUp', 14, 14, 'right', 50),
        ],
        windows: [win('4x4', 'left', 3), win('4x4', 'right', 3), win('3x3', 'back', 2)],
        insulation: 'full',
        ventilation: true,
        gutters: true,
      },
      concrete: { type: 'slab', existingPad: false, thickness: 6 },
      colors: { roof: '#D4D4D4', walls: '#D4D4D4', trim: '#1C1C1C', doors: '#4169E1' },
    },
  },

  // ── USE CASE 4: Carport Style ──
  {
    name: 'Use Case 4 — Carport Style (50×50, 12\' eave)',
    filename: 'TEST-04-Carport-50x50.pdf',
    data: {
      customer: {
        name: 'Mike Williams',
        email: 'mike@example.com',
        phone: '555-0404',
        address: '55 Shade Ln',
        city: 'Austin',
        state: 'TX',
        zip: '78701',
        billingAddress: { street: '55 Shade Ln', city: 'Austin', state: 'TX', zip: '78701' },
        constructionAddress: { street: '55 Shade Ln', city: 'Austin', state: 'TX', zip: '78701' },
        sameAsMailingAddress: true,
      },
      building: {
        buildingType: 'carport',
        buildingSizeId: '50x50',
        eaveHeightId: '12',
        width: 50,
        length: 50,
        height: 12,
        legType: 'standard',
        buildingView: 'front',
        breezeway: { frontBack: false, sideSide: false },
      },
      accessories: {
        walkDoors: [],
        rollUpDoors: [door('rollUp', 10, 8, 'front', 20)],
        windows: [],
        insulation: 'none',
        ventilation: false,
        gutters: false,
      },
      concrete: { type: 'piers', existingPad: false, thickness: 4 },
      colors: { roof: '#800020', walls: '#E8E8E8', trim: '#1C1C1C', doors: '#E8E8E8' },
    },
  },

  // ── USE CASE 5: Multi-Door Shop ──
  {
    name: 'Use Case 5 — Multi-Door Shop (40×40, 16\' eave)',
    filename: 'TEST-05-Multi-Door-Shop-40x40.pdf',
    data: {
      customer: {
        name: 'Rodriguez Auto Repair',
        email: 'carlos@rodriguezauto.com',
        phone: '555-0505',
        address: '999 Mechanic Ave',
        city: 'San Antonio',
        state: 'TX',
        zip: '78201',
        billingAddress: { street: '999 Mechanic Ave', city: 'San Antonio', state: 'TX', zip: '78201' },
        constructionAddress: { street: '1001 Service Rd', city: 'San Antonio', state: 'TX', zip: '78202' },
        sameAsMailingAddress: false,
      },
      building: {
        buildingType: 'pole-barn',
        buildingSizeId: '40x40',
        eaveHeightId: '16',
        width: 40,
        length: 40,
        height: 16,
        legType: 'certified',
        buildingView: 'front',
        breezeway: { frontBack: false, sideSide: false },
      },
      accessories: {
        walkDoors: [door('walk', 3, 7, 'left', 5)],
        rollUpDoors: [
          door('rollUp', 10, 10, 'front', 5),
          door('rollUp', 10, 10, 'front', 22),
          door('rollUp', 10, 10, 'right', 15),
        ],
        windows: [win('4x4', 'left', 2), win('3x3', 'back', 1)],
        insulation: 'wall',
        ventilation: true,
        gutters: true,
      },
      concrete: { type: 'slab', existingPad: false, thickness: 5 },
      colors: { roof: '#708090', walls: '#E8E8E8', trim: '#708090', doors: '#B22222' },
    },
  },
];

/* ================================================================
   GENERATE ALL 5 PDFs
   ================================================================ */

const outDir = path.resolve(__dirname, '..', 'test-output');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

console.log('════════════════════════════════════════════════════════');
console.log('  13|7 FrameWorks — Construction Plan Test Generator');
console.log('════════════════════════════════════════════════════════\n');

for (const tc of testCases) {
  console.log(`▶ Generating: ${tc.name}`);
  try {
    const doc = generateStandaloneConstructionPlan(tc.data);
    const buf = Buffer.from(doc.output('arraybuffer'));
    const outPath = path.join(outDir, tc.filename);
    fs.writeFileSync(outPath, buf);
    const sizeMB = (buf.length / 1024).toFixed(1);
    console.log(`  ✅ Saved: ${outPath}  (${sizeMB} KB)\n`);
  } catch (err) {
    console.error(`  ❌ FAILED: ${(err as Error).message}\n`);
    console.error((err as Error).stack);
  }
}

console.log('════════════════════════════════════════════════════════');
console.log(`  Done. PDFs saved to: ${outDir}`);
console.log('════════════════════════════════════════════════════════');
