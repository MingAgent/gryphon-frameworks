import { motion } from 'framer-motion';
import { Layers, Info } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import Card from '../../common/Card/Card';

const concreteOptions = [
  {
    value: 'none',
    label: 'No Concrete',
    description: 'Building will be anchored to existing surface or ground',
    icon: '🚫'
  },
  {
    value: 'piers',
    label: 'Concrete Piers',
    description: 'Individual concrete footings at each post location',
    icon: '🔩'
  },
  {
    value: 'slab',
    label: 'Concrete Slab',
    description: '4" concrete slab with #3 rebar, vapor barrier & control joints',
    icon: '⬛'
  },
  {
    value: 'turnkey',
    label: 'Turnkey Package',
    description: 'Complete concrete work with reinforced slab and perimeter',
    icon: '🔑'
  }
];

// All slabs are 4" with #3 rebar — no thickness selection needed

export function Step5Concrete() {
  const { concrete, building, setConcreteConfig } = useEstimatorStore();
  const sqft = building.width * building.length;

  const selectedOption = concreteOptions.find((opt) => opt.value === concrete.type);

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-gray-600">
        Select your foundation and concrete options for your building.
      </motion.p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Concrete Options */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-orange-600" />
              Foundation Type
            </h3>
          </motion.div>

          <div className="space-y-3">
            {concreteOptions.map((option) => (
              <motion.div key={option.value} variants={itemVariants}>
                <Card
                  interactive
                  variant={concrete.type === option.value ? 'elevated' : 'bordered'}
                  padding="sm"
                  onClick={() => setConcreteConfig({ type: option.value as any })}
                  className={`
                    cursor-pointer
                    ${concrete.type === option.value
                      ? 'ring-2 ring-orange-500 bg-orange-50'
                      : 'hover:bg-gray-50'
                    }
                  `}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800">{option.label}</h4>
                        {concrete.type === option.value && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="px-2 py-0.5 bg-orange-600 text-white text-xs rounded-full"
                          >
                            Selected
                          </motion.span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Existing Pad Checkbox */}
          {concrete.type !== 'none' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-yellow-50 rounded-lg p-4 border border-yellow-200"
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={concrete.existingPad}
                  onChange={(e) => setConcreteConfig({ existingPad: e.target.checked })}
                  className="mt-1 w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                />
                <div>
                  <span className="font-medium text-gray-800">I have an existing concrete pad</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Check this if you already have a suitable concrete surface and don't need new concrete work.
                  </p>
                </div>
              </label>
            </motion.div>
          )}

          {/* Slab Spec Note */}
          {(concrete.type === 'slab' || concrete.type === 'turnkey') && !concrete.existingPad && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-blue-50 rounded-lg p-4 border border-blue-200"
            >
              <p className="text-sm font-medium text-gray-800">4" concrete slab with #3 rebar</p>
              <p className="text-xs text-gray-500 mt-1">
                All slabs include vapor barrier and control joints.
              </p>
            </motion.div>
          )}
        </div>

        {/* Information Panel */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Selected Option Details */}
          {selectedOption && (
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                {selectedOption.label}
              </h3>

              <div className="space-y-4">
                {concrete.type === 'none' && (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      Your building will be securely anchored using ground anchors suitable for your soil type.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Most economical option</li>
                      <li>Suitable for temporary or semi-permanent structures</li>
                      <li>Can be installed on grass or gravel</li>
                    </ul>
                  </div>
                )}

                {concrete.type === 'piers' && (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      Individual concrete footings will be poured at each post location.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Excellent stability on uneven ground</li>
                      <li>Good drainage underneath building</li>
                      <li>More cost-effective than full slab</li>
                    </ul>
                  </div>
                )}

                {concrete.type === 'slab' && (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      A complete concrete floor slab providing a durable, level surface.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Clean, finished floor</li>
                      <li>Ideal for workshops and storage</li>
                      <li>Easy to clean and maintain</li>
                      <li>Covers {sqft.toLocaleString()} sq ft</li>
                    </ul>
                  </div>
                )}

                {concrete.type === 'turnkey' && (
                  <div className="space-y-2">
                    <p className="text-gray-700">
                      Premium concrete package with reinforced slab, finished edges, and proper drainage.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                      <li>Fiber mesh reinforcement</li>
                      <li>Perimeter thickening for added strength</li>
                      <li>Professional finish</li>
                      <li>Covers {sqft.toLocaleString()} sq ft</li>
                    </ul>
                  </div>
                )}

                {concrete.existingPad && concrete.type !== 'none' && (
                  <div className="mt-4 p-3 bg-white rounded-lg border border-orange-300">
                    <div className="flex items-center gap-2 text-orange-700">
                      <Info className="w-4 h-4" />
                      <span className="text-sm font-medium">Using Existing Pad</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      No new concrete will be poured. Building will be anchored to your existing concrete surface.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Tips */}
          <Card variant="bordered">
            <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-600" />
              Foundation Tips
            </h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Consider local building codes and permit requirements</li>
              <li>• Proper drainage around the foundation is essential</li>
              <li>• All slabs are 4" with #3 rebar for reliable strength</li>
              <li>• Ideal for vehicle storage, workshops, and equipment</li>
            </ul>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default Step5Concrete;
