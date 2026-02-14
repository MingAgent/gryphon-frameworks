import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Building,
  DoorOpen,
  Palette,
  Layers,
  Calculator,
  Check,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants, priceVariants } from '../../../animations/variants';
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import { BOMExportButton } from '../export/BOMExportButton';
import { formatCurrency } from '../../../utils/calculations/pricing';
import { ROOF_COLORS, WALL_COLORS, TRIM_COLORS } from '../../../constants/colors';

interface ReviewSectionProps {
  title: string;
  icon: React.ReactNode;
  stepNumber: number;
  onEdit: () => void;
  children: React.ReactNode;
}

function ReviewSection({ title, icon, stepNumber, onEdit, children }: ReviewSectionProps) {
  return (
    <motion.div variants={itemVariants}>
      <Card variant="bordered" className="relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            {icon}
            {title}
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            leftIcon={<Edit className="w-4 h-4" />}
          >
            Edit
          </Button>
        </div>
        <div className="text-gray-600">{children}</div>
        <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full flex items-end justify-start p-2">
          <span className="text-orange-600 font-bold text-sm">Step {stepNumber}</span>
        </div>
      </Card>
    </motion.div>
  );
}

export function Step6Review() {
  const {
    customer,
    building,
    accessories,
    colors,
    concrete,
    pricing,
    calculatePricing,
    goToStep
  } = useEstimatorStore();

  // Recalculate pricing on mount
  useEffect(() => {
    calculatePricing();
  }, [calculatePricing]);

  const getColorName = (hex: string, colorList: typeof ROOF_COLORS) => {
    return colorList.find((c) => c.hex === hex)?.name || hex;
  };

  const totalWindows = accessories.windows.length;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Review your building configuration and estimate details below.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Configuration Review */}
        <div className="lg:col-span-2 space-y-4">
          {/* Customer Info */}
          <ReviewSection
            title="Customer Information"
            icon={<FileText className="w-5 h-5 text-orange-600" />}
            stepNumber={1}
            onEdit={() => goToStep(1)}
          >
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <p className="font-medium text-gray-800">{customer.name || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium text-gray-800">{customer.email || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <p className="font-medium text-gray-800">{customer.phone || '—'}</p>
              </div>
              <div>
                <span className="text-gray-500">Address:</span>
                <p className="font-medium text-gray-800">
                  {customer.address ? `${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}` : '—'}
                </p>
              </div>
            </div>
          </ReviewSection>

          {/* Building Size */}
          <ReviewSection
            title="Building Dimensions"
            icon={<Building className="w-5 h-5 text-orange-600" />}
            stepNumber={2}
            onEdit={() => goToStep(2)}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Width:</span>
                <p className="font-medium text-gray-800">{building.width}'</p>
              </div>
              <div>
                <span className="text-gray-500">Length:</span>
                <p className="font-medium text-gray-800">{building.length}'</p>
              </div>
              <div>
                <span className="text-gray-500">Height:</span>
                <p className="font-medium text-gray-800">{building.height}'</p>
              </div>
              <div>
                <span className="text-gray-500">Sq Ft:</span>
                <p className="font-medium text-gray-800">{(building.width * building.length).toLocaleString()}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t text-sm">
              <span className="text-gray-500">Frame Type:</span>
              <span className="ml-2 font-medium text-gray-800 capitalize">{building.legType}</span>
            </div>
          </ReviewSection>

          {/* Accessories */}
          <ReviewSection
            title="Doors & Accessories"
            icon={<DoorOpen className="w-5 h-5 text-orange-600" />}
            stepNumber={3}
            onEdit={() => goToStep(3)}
          >
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Walk Doors:</span>
                <span className="font-medium text-gray-800">
                  {accessories.walkDoors.length > 0
                    ? accessories.walkDoors.map((d) => d.size).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Roll-Up Doors:</span>
                <span className="font-medium text-gray-800">
                  {accessories.rollUpDoors.length > 0
                    ? accessories.rollUpDoors.map((d) => d.size).join(', ')
                    : 'None'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Windows:</span>
                <span className="font-medium text-gray-800">{totalWindows} window(s)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Insulation:</span>
                <span className="font-medium text-gray-800 capitalize">{accessories.insulation}</span>
              </div>
              <div className="flex gap-4">
                {accessories.ventilation && (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" /> Ventilation
                  </span>
                )}
                {accessories.gutters && (
                  <span className="inline-flex items-center gap-1 text-green-600">
                    <Check className="w-4 h-4" /> Gutters
                  </span>
                )}
              </div>
            </div>
          </ReviewSection>

          {/* Colors */}
          <ReviewSection
            title="Color Selections"
            icon={<Palette className="w-5 h-5 text-orange-600" />}
            stepNumber={4}
            onEdit={() => goToStep(4)}
          >
            <div className="flex flex-wrap gap-4 text-sm">
              {[
                { label: 'Roof', color: colors.roof, list: ROOF_COLORS },
                { label: 'Walls', color: colors.walls, list: WALL_COLORS },
                { label: 'Trim', color: colors.trim, list: TRIM_COLORS }
              ].map(({ label, color, list }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-gray-500">{label}:</span>
                  <span className="font-medium text-gray-800">{getColorName(color, list)}</span>
                </div>
              ))}
            </div>
          </ReviewSection>

          {/* Concrete */}
          <ReviewSection
            title="Foundation"
            icon={<Layers className="w-5 h-5 text-orange-600" />}
            stepNumber={5}
            onEdit={() => goToStep(5)}
          >
            <div className="text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Type:</span>
                <span className="font-medium text-gray-800 capitalize">
                  {concrete.type === 'none' ? 'No Concrete' : concrete.type}
                </span>
              </div>
              {concrete.existingPad && (
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500">Existing Pad:</span>
                  <span className="font-medium text-green-600">Yes</span>
                </div>
              )}
              {(concrete.type === 'slab' || concrete.type === 'turnkey') && !concrete.existingPad && (
                <div className="flex justify-between mt-2">
                  <span className="text-gray-500">Thickness:</span>
                  <span className="font-medium text-gray-800">{concrete.thickness}"</span>
                </div>
              )}
            </div>
          </ReviewSection>
        </div>

        {/* Right Column - Pricing */}
        <div className="lg:col-span-1">
          <motion.div variants={itemVariants} className="sticky top-4">
            <Card className="bg-gradient-to-br from-orange-600 to-orange-700 text-white">
              <div className="flex items-center gap-2 mb-6">
                <Calculator className="w-6 h-6" />
                <h3 className="text-xl font-bold">Estimate Summary</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-orange-100">Building Structure:</span>
                  <span className="font-semibold">{formatCurrency(pricing.basePrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Accessories:</span>
                  <span className="font-semibold">{formatCurrency(pricing.accessoriesTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Concrete/Foundation:</span>
                  <span className="font-semibold">{formatCurrency(pricing.concreteTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Installation Labor:</span>
                  <span className="font-semibold">{formatCurrency(pricing.laborTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-orange-100">Delivery:</span>
                  <span className="font-semibold">{formatCurrency(pricing.deliveryTotal)}</span>
                </div>

                <div className="border-t border-orange-400 my-4" />

                <motion.div
                  variants={priceVariants}
                  initial="initial"
                  animate="animate"
                  className="flex justify-between items-center"
                  key={pricing.grandTotal}
                >
                  <span className="text-lg font-bold">Total Estimate:</span>
                  <span className="text-2xl font-bold">{formatCurrency(pricing.grandTotal)}</span>
                </motion.div>

                <div className="border-t border-orange-400 my-4" />

                <div className="bg-orange-800 bg-opacity-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Deposit Required (35%):</span>
                    <span className="text-xl font-bold">{formatCurrency(pricing.depositAmount)}</span>
                  </div>
                  <p className="text-xs text-orange-200">
                    Balance due upon completion of installation
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="secondary"
                  className="w-full bg-white text-orange-600 hover:bg-orange-50"
                >
                  Download PDF Estimate
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-white text-white hover:bg-orange-700"
                >
                  Email Estimate
                </Button>
              </div>

              {/* Internal BOM Export - Staff Only */}
              <div className="mt-4 pt-4 border-t border-orange-500">
                <div className="flex items-center gap-2 text-orange-200 text-xs mb-2">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Staff Only - Internal Document</span>
                </div>
                <BOMExportButton className="w-full" />
              </div>
            </Card>

            <motion.div
              variants={itemVariants}
              className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200"
            >
              <p className="text-sm text-green-800 mb-3">
                <strong>Ready to proceed?</strong> Review and sign the contract to finalize your order.
              </p>
              <Button
                variant="primary"
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => window.dispatchEvent(new Event('showContract'))}
              >
                Proceed to Contract
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

export default Step6Review;
