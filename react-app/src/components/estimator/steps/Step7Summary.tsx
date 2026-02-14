import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  DoorOpen,
  Palette,
  Layers,
  DollarSign,
  CheckCircle2,
} from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { calculatePurlins } from '../../../utils/calculations/purlins';

/* ─── color helpers ─── */
const COLOR_NAMES: Record<string, string> = {
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
  '#708090': 'Slate Gray',
};
const colorName = (hex: string) => COLOR_NAMES[hex?.toUpperCase()] || hex || '—';

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

/* ─── tiny section card ─── */
function SummaryCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden"
    >
      <div className="flex items-center gap-2 px-5 py-3 bg-gray-50 border-b border-gray-100">
        {icon}
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">{title}</h3>
      </div>
      <div className="px-5 py-4 text-sm text-gray-600 space-y-1">{children}</div>
    </motion.div>
  );
}

/* ─── Row helper ─── */
function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-800">{String(value)}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */

export function Step7Summary() {
  const { building, accessories, colors, concrete, pricing, calculatePricing } = useEstimatorStore();

  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const buildingLabel =
    building.buildingType === 'pole-barn'
      ? 'Pole Barn'
      : building.buildingType === 'carport'
      ? 'Carport'
      : building.buildingType === 'i-beam'
      ? 'I-Beam Construction'
      : 'Bolt-Up';

  const sqft = building.width * building.length;
  const totalDoors = accessories.walkDoors.length + accessories.rollUpDoors.length;
  const totalWindows = accessories.windows.reduce((s, w) => s + w.quantity, 0);

  const insulationLabel =
    accessories.insulation === 'none'
      ? 'None'
      : accessories.insulation === 'ceiling'
      ? 'Ceiling Only'
      : accessories.insulation === 'wall'
      ? 'Wall Only'
      : 'Full (Walls + Ceiling)';

  const concreteLabel =
    concrete.type === 'none'
      ? 'None (Owner Provides)'
      : concrete.type === 'piers'
      ? 'Concrete Piers'
      : concrete.type === 'slab'
      ? '4" Slab w/ #3 Rebar'
      : 'Turnkey Package w/ #3 Rebar';

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="py-4 space-y-5"
    >
      {/* Hero total */}
      <motion.div
        variants={itemVariants}
        className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 text-center shadow-lg"
      >
        <p className="text-sm font-medium uppercase tracking-wider text-orange-100 mb-1">
          Estimated Total
        </p>
        <p className="text-4xl font-extrabold">{fmt(pricing.grandTotal)}</p>
        <p className="text-xs text-orange-200 mt-2">
          {building.width}&prime; &times; {building.length}&prime; {buildingLabel} &mdash;{' '}
          {sqft.toLocaleString()} sq ft
        </p>
      </motion.div>

      {/* Grid of summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Building */}
        <SummaryCard
          icon={<Building2 className="w-4 h-4 text-orange-500" />}
          title="Building"
        >
          <Row label="Type" value={buildingLabel} />
          <Row label="Size" value={`${building.width}' × ${building.length}'`} />
          <Row label="Eave Height" value={`${building.height}'`} />
          <Row label="Frame" value={building.legType === 'certified' ? 'Engineer Certified' : 'Standard'} />
          <Row label="Panels" value="26 gauge" />
          <Row label="Square Feet" value={`${sqft.toLocaleString()} sq ft`} />
          {(() => {
            const p = calculatePurlins(building.width, building.length, building.height);
            return (
              <>
                <Row label="Sidewall Purlins" value={`${p.sidewallPurlinsPerWall}/wall`} />
                <Row label="Roof Purlins" value={`${p.roofPurlinsPerSide}/side @ ${p.roofPurlinSpacing}' O.C.`} />
                <Row label="Total Purlins" value={`${p.totalPurlins} (${p.totalLinearFeet.toLocaleString()} lnft)`} />
              </>
            );
          })()}
        </SummaryCard>

        {/* Doors & Windows */}
        <SummaryCard
          icon={<DoorOpen className="w-4 h-4 text-orange-500" />}
          title="Doors & Windows"
        >
          {totalDoors === 0 && totalWindows === 0 ? (
            <p className="text-gray-400 italic">None selected</p>
          ) : (
            <>
              {accessories.walkDoors.map((d) => (
                <Row
                  key={d.id}
                  label={`Walk Door (${d.size})`}
                  value={`${d.wall.charAt(0).toUpperCase() + d.wall.slice(1)} wall × ${d.quantity}`}
                />
              ))}
              {accessories.rollUpDoors.map((d) => (
                <Row
                  key={d.id}
                  label={`Roll-Up (${d.size})`}
                  value={`${d.wall.charAt(0).toUpperCase() + d.wall.slice(1)} wall × ${d.quantity}`}
                />
              ))}
              {accessories.windows.map((w) => (
                <Row
                  key={w.id}
                  label={`Window (${w.size})`}
                  value={`${w.wall.charAt(0).toUpperCase() + w.wall.slice(1)} wall × ${w.quantity}`}
                />
              ))}
            </>
          )}
        </SummaryCard>

        {/* Colors */}
        <SummaryCard
          icon={<Palette className="w-4 h-4 text-orange-500" />}
          title="Colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.roof }} />
            <Row label="Roof" value={colorName(colors.roof)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.walls }} />
            <Row label="Walls" value={colorName(colors.walls)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.trim }} />
            <Row label="Trim" value={colorName(colors.trim)} />
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border border-gray-300" style={{ backgroundColor: colors.doors }} />
            <Row label="Doors" value={colorName(colors.doors)} />
          </div>
        </SummaryCard>

        {/* Add-Ons */}
        <SummaryCard
          icon={<Layers className="w-4 h-4 text-orange-500" />}
          title="Add-Ons & Concrete"
        >
          <Row label="Insulation" value={insulationLabel} />
          <Row label="Ventilation" value={accessories.ventilation ? 'Ridge Vents' : 'None'} />
          <Row label="Gutters" value={accessories.gutters ? 'Included' : 'None'} />
          <Row label="Concrete" value={concreteLabel} />
        </SummaryCard>
      </div>

      {/* Pricing Breakdown */}
      <SummaryCard
        icon={<DollarSign className="w-4 h-4 text-orange-500" />}
        title="Price Breakdown"
      >
        <Row label="Base Building Package (includes install)" value={fmt(pricing.basePrice)} />
        <Row label="Doors, Windows & Accessories" value={fmt(pricing.accessoriesTotal)} />
        <Row label="Concrete" value={fmt(pricing.concreteTotal)} />
        <Row label="Delivery + Haul Off" value={fmt(pricing.deliveryTotal)} />
        <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
          <span className="font-bold text-gray-800">Grand Total</span>
          <span className="font-extrabold text-orange-600 text-base">{fmt(pricing.grandTotal)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Deposit (30%)</span>
          <span>{fmt(pricing.depositAmount)}</span>
        </div>
      </SummaryCard>

      {/* Ready CTA */}
      <motion.div
        variants={itemVariants}
        className="flex items-center gap-2 justify-center text-emerald-600 mt-2"
      >
        <CheckCircle2 className="w-5 h-5" />
        <span className="text-sm font-medium">
          Estimate complete — click <strong>Proceed to Contract</strong> below when ready.
        </span>
      </motion.div>
    </motion.div>
  );
}

export default Step7Summary;
