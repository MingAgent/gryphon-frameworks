import { motion } from 'framer-motion';
import {
  Building2,
  MapPin,
  Wind,
  Ruler,
  DoorOpen,
  Thermometer,
  HardHat,
  Calendar,
  DollarSign,
  FileText
} from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';

// Building use options
const BUILDING_USES = [
  { value: 'warehouse', label: 'Warehouse/Storage' },
  { value: 'manufacturing', label: 'Manufacturing/Industrial' },
  { value: 'commercial', label: 'Commercial/Retail' },
  { value: 'agricultural', label: 'Agricultural' },
  { value: 'aircraft-hangar', label: 'Aircraft Hangar' },
  { value: 'auto-shop', label: 'Auto Shop/Service Center' },
  { value: 'office', label: 'Office Space' },
  { value: 'recreation', label: 'Recreation/Sports' },
  { value: 'church', label: 'Church/Community' },
  { value: 'other', label: 'Other' }
];

// Framing types
const FRAMING_TYPES = [
  { value: 'clear-span', label: 'Clear Span', description: 'No interior columns - maximum usable space' },
  { value: 'multi-span', label: 'Multi-Span', description: 'Interior columns for wider buildings' },
  { value: 'single-slope', label: 'Single Slope (Lean-To)', description: 'Roof slopes one direction' },
  { value: 'modular', label: 'Modular', description: 'Pre-designed sections for quick assembly' }
];

// Roof types
const ROOF_TYPES = [
  { value: 'gable', label: 'Gable (Standard)' },
  { value: 'single-slope', label: 'Single Slope' },
  { value: 'standing-seam', label: 'Standing Seam' }
];

// Wall panel options
const WALL_PANELS = [
  { value: 'pbr', label: 'PBR (Exposed Fastener)' },
  { value: 'standing-seam', label: 'Standing Seam' },
  { value: 'insulated', label: 'Insulated Metal Panels' },
  { value: 'liner', label: 'Liner Panels (Interior)' }
];

// Timeline options
const TIMELINE_OPTIONS = [
  { value: 'asap', label: 'As soon as possible' },
  { value: '1-3-months', label: '1-3 months' },
  { value: '3-6-months', label: '3-6 months' },
  { value: '6-12-months', label: '6-12 months' },
  { value: 'planning', label: 'Just planning/researching' }
];

// Budget ranges
const BUDGET_RANGES = [
  { value: 'under-50k', label: 'Under $50,000' },
  { value: '50k-100k', label: '$50,000 - $100,000' },
  { value: '100k-250k', label: '$100,000 - $250,000' },
  { value: '250k-500k', label: '$250,000 - $500,000' },
  { value: '500k-1m', label: '$500,000 - $1,000,000' },
  { value: 'over-1m', label: 'Over $1,000,000' },
  { value: 'unsure', label: 'Not sure yet' }
];

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string; description?: string }[];
  placeholder?: string;
  icon?: React.ReactNode;
}

function SelectField({ label, value, onChange, options, placeholder, icon }: SelectFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#A3A3A3] mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 bg-[#1e2a45] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
      >
        <option value="" className="bg-[#1e2a45]">{placeholder || 'Select...'}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1e2a45]">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface InputFieldProps {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'number' | 'email' | 'tel';
  placeholder?: string;
  icon?: React.ReactNode;
  suffix?: string;
}

function InputField({ label, value, onChange, type = 'text', placeholder, icon, suffix }: InputFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#A3A3A3] mb-2 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 bg-[#1e2a45] border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666]">{suffix}</span>
        )}
      </div>
    </div>
  );
}

interface CheckboxFieldProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

function CheckboxField({ label, checked, onChange, description }: CheckboxFieldProps) {
  return (
    <label className="flex items-start gap-3 p-3 bg-[#243352] rounded-lg cursor-pointer hover:bg-[#2d3f63] transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 w-5 h-5 rounded border-white/20 bg-[#1e2a45] text-[#14B8A6] focus:ring-[#14B8A6]/30"
      />
      <div>
        <span className="text-white font-medium">{label}</span>
        {description && <p className="text-xs text-[#A3A3A3] mt-1">{description}</p>}
      </div>
    </label>
  );
}

export function BoltUpQuoteForm() {
  const { boltUpQuote, setBoltUpQuote } = useEstimatorStore();

  const updateField = (field: string, value: string | boolean) => {
    setBoltUpQuote({ [field]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 mt-6"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/10 border border-orange-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <FileText className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-white font-semibold">Custom Bolt-Up Building Quote</h3>
            <p className="text-sm text-[#A3A3A3] mt-1">
              Please provide as much detail as possible. A specialist will contact you within 1-2 business days with a customized quote.
            </p>
          </div>
        </div>
      </div>

      {/* Building Use & Purpose */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#14B8A6]" />
          Building Use & Purpose
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Primary Building Use"
            value={boltUpQuote?.buildingUse || ''}
            onChange={(v) => updateField('buildingUse', v)}
            options={BUILDING_USES}
            placeholder="Select primary use..."
          />
          <InputField
            label="Specific Use Details"
            value={boltUpQuote?.useDetails || ''}
            onChange={(v) => updateField('useDetails', v)}
            placeholder="e.g., Cold storage, machine shop, etc."
          />
        </div>
      </div>

      {/* Building Dimensions */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Ruler className="w-5 h-5 text-[#14B8A6]" />
          Building Dimensions
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <InputField
            label="Width"
            type="number"
            value={boltUpQuote?.width || ''}
            onChange={(v) => updateField('width', v)}
            placeholder="e.g., 60"
            suffix="ft"
          />
          <InputField
            label="Length"
            type="number"
            value={boltUpQuote?.length || ''}
            onChange={(v) => updateField('length', v)}
            placeholder="e.g., 100"
            suffix="ft"
          />
          <InputField
            label="Eave Height"
            type="number"
            value={boltUpQuote?.eaveHeight || ''}
            onChange={(v) => updateField('eaveHeight', v)}
            placeholder="e.g., 16"
            suffix="ft"
          />
          <InputField
            label="Roof Pitch"
            value={boltUpQuote?.roofPitch || ''}
            onChange={(v) => updateField('roofPitch', v)}
            placeholder="e.g., 1:12"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SelectField
            label="Framing Type"
            value={boltUpQuote?.framingType || ''}
            onChange={(v) => updateField('framingType', v)}
            options={FRAMING_TYPES}
            placeholder="Select framing type..."
          />
          <SelectField
            label="Roof Style"
            value={boltUpQuote?.roofType || ''}
            onChange={(v) => updateField('roofType', v)}
            options={ROOF_TYPES}
            placeholder="Select roof style..."
          />
        </div>
      </div>

      {/* Location & Engineering */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#14B8A6]" />
          Location & Engineering Requirements
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Building Site City"
            value={boltUpQuote?.siteCity || ''}
            onChange={(v) => updateField('siteCity', v)}
            placeholder="City name"
            icon={<MapPin className="w-4 h-4" />}
          />
          <InputField
            label="Building Site Zip Code"
            value={boltUpQuote?.siteZip || ''}
            onChange={(v) => updateField('siteZip', v)}
            placeholder="Zip code"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <InputField
            label="Wind Speed (if known)"
            value={boltUpQuote?.windSpeed || ''}
            onChange={(v) => updateField('windSpeed', v)}
            placeholder="e.g., 115"
            suffix="mph"
            icon={<Wind className="w-4 h-4" />}
          />
          <InputField
            label="Snow Load (if known)"
            value={boltUpQuote?.snowLoad || ''}
            onChange={(v) => updateField('snowLoad', v)}
            placeholder="e.g., 20"
            suffix="psf"
          />
          <InputField
            label="Collateral Load"
            value={boltUpQuote?.collateralLoad || ''}
            onChange={(v) => updateField('collateralLoad', v)}
            placeholder="e.g., 5"
            suffix="psf"
          />
        </div>
        <p className="text-xs text-[#666666] mt-3">
          * If you don't know these values, we'll determine them based on your location and local building codes.
        </p>
      </div>

      {/* Openings */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <DoorOpen className="w-5 h-5 text-[#14B8A6]" />
          Door & Window Openings
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Overhead Doors (qty & sizes)"
            value={boltUpQuote?.overheadDoors || ''}
            onChange={(v) => updateField('overheadDoors', v)}
            placeholder="e.g., 2x 12'x14', 1x 10'x10'"
          />
          <InputField
            label="Walk Doors (quantity)"
            type="number"
            value={boltUpQuote?.walkDoors || ''}
            onChange={(v) => updateField('walkDoors', v)}
            placeholder="e.g., 3"
          />
          <InputField
            label="Windows (qty & sizes)"
            value={boltUpQuote?.windows || ''}
            onChange={(v) => updateField('windows', v)}
            placeholder="e.g., 6x 4'x4'"
          />
          <InputField
            label="Loading Docks"
            type="number"
            value={boltUpQuote?.loadingDocks || ''}
            onChange={(v) => updateField('loadingDocks', v)}
            placeholder="e.g., 2"
          />
        </div>
      </div>

      {/* Wall & Roof Systems */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Thermometer className="w-5 h-5 text-[#14B8A6]" />
          Wall & Roof Systems
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Wall Panel Type"
            value={boltUpQuote?.wallPanelType || ''}
            onChange={(v) => updateField('wallPanelType', v)}
            options={WALL_PANELS}
            placeholder="Select wall panels..."
          />
          <InputField
            label="Wall Insulation R-Value"
            value={boltUpQuote?.wallInsulation || ''}
            onChange={(v) => updateField('wallInsulation', v)}
            placeholder="e.g., R-19"
          />
          <InputField
            label="Roof Insulation R-Value"
            value={boltUpQuote?.roofInsulation || ''}
            onChange={(v) => updateField('roofInsulation', v)}
            placeholder="e.g., R-30"
          />
        </div>
      </div>

      {/* Special Features */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <HardHat className="w-5 h-5 text-[#14B8A6]" />
          Special Features & Add-Ons
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <CheckboxField
            label="Mezzanine / Second Floor"
            checked={boltUpQuote?.hasMezzanine || false}
            onChange={(v) => updateField('hasMezzanine', v)}
            description="Interior elevated platform or full second floor"
          />
          <CheckboxField
            label="Overhead Crane System"
            checked={boltUpQuote?.hasCrane || false}
            onChange={(v) => updateField('hasCrane', v)}
            description="Bridge crane, jib crane, or monorail"
          />
          <CheckboxField
            label="Skylights"
            checked={boltUpQuote?.hasSkylights || false}
            onChange={(v) => updateField('hasSkylights', v)}
            description="Natural lighting through roof panels"
          />
          <CheckboxField
            label="Canopies / Awnings"
            checked={boltUpQuote?.hasCanopies || false}
            onChange={(v) => updateField('hasCanopies', v)}
            description="Covered areas extending from building"
          />
          <CheckboxField
            label="Gutters & Downspouts"
            checked={boltUpQuote?.hasGutters || false}
            onChange={(v) => updateField('hasGutters', v)}
            description="Full drainage system"
          />
          <CheckboxField
            label="Fire Sprinkler System"
            checked={boltUpQuote?.hasSprinklers || false}
            onChange={(v) => updateField('hasSprinklers', v)}
            description="Requires additional collateral load"
          />
        </div>

        {/* Crane details if selected */}
        {boltUpQuote?.hasCrane && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-[#243352] rounded-lg border border-white/5"
          >
            <p className="text-sm text-[#A3A3A3] mb-3">Crane Details:</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InputField
                label="Crane Capacity"
                value={boltUpQuote?.craneCapacity || ''}
                onChange={(v) => updateField('craneCapacity', v)}
                placeholder="e.g., 10"
                suffix="tons"
              />
              <InputField
                label="Hook Height"
                value={boltUpQuote?.craneHookHeight || ''}
                onChange={(v) => updateField('craneHookHeight', v)}
                placeholder="e.g., 20"
                suffix="ft"
              />
              <InputField
                label="Crane Span"
                value={boltUpQuote?.craneSpan || ''}
                onChange={(v) => updateField('craneSpan', v)}
                placeholder="e.g., 50"
                suffix="ft"
              />
            </div>
          </motion.div>
        )}

        {/* Mezzanine details if selected */}
        {boltUpQuote?.hasMezzanine && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-[#243352] rounded-lg border border-white/5"
          >
            <p className="text-sm text-[#A3A3A3] mb-3">Mezzanine Details:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Mezzanine Size"
                value={boltUpQuote?.mezzanineSize || ''}
                onChange={(v) => updateField('mezzanineSize', v)}
                placeholder="e.g., 30' x 40'"
              />
              <InputField
                label="Mezzanine Load"
                value={boltUpQuote?.mezzanineLoad || ''}
                onChange={(v) => updateField('mezzanineLoad', v)}
                placeholder="e.g., 125"
                suffix="psf"
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Timeline & Budget */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#14B8A6]" />
          Timeline & Budget
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectField
            label="Project Timeline"
            value={boltUpQuote?.timeline || ''}
            onChange={(v) => updateField('timeline', v)}
            options={TIMELINE_OPTIONS}
            placeholder="When do you need this?"
            icon={<Calendar className="w-4 h-4" />}
          />
          <SelectField
            label="Budget Range"
            value={boltUpQuote?.budget || ''}
            onChange={(v) => updateField('budget', v)}
            options={BUDGET_RANGES}
            placeholder="Approximate budget"
            icon={<DollarSign className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Additional Notes */}
      <div className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h4 className="text-white font-semibold mb-4">Additional Notes or Requirements</h4>
        <textarea
          value={boltUpQuote?.additionalNotes || ''}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
          placeholder="Please share any other details about your project, special requirements, or questions you have..."
          rows={4}
          className="w-full px-4 py-3 bg-[#243352] border border-white/10 rounded-lg text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6] resize-none"
        />
      </div>

      {/* Submit Notice */}
      <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-xl p-4">
        <p className="text-sm text-[#A3A3A3]">
          <span className="text-[#14B8A6] font-medium">What happens next?</span> After you submit this form, one of our pre-engineered building specialists will review your requirements and contact you within 1-2 business days with a detailed quote and recommendations.
        </p>
      </div>
    </motion.div>
  );
}

export default BoltUpQuoteForm;
