import { motion } from 'framer-motion';
import { Building2, Car, Wrench, Columns } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import BoltUpQuoteForm from './BoltUpQuoteForm';

type BuildingType = 'pole-barn' | 'carport' | 'i-beam' | 'bolt-up';

interface BuildingTypeOption {
  id: BuildingType;
  name: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  note?: string;
}

const buildingTypes: BuildingTypeOption[] = [
  {
    id: 'carport',
    name: 'Carport',
    description: 'Open-sided structure perfect for vehicle protection',
    icon: <Car className="w-8 h-8" />,
    features: [
      'Vehicle protection from elements',
      'Easy access design',
      'Economical option',
      'Various size options'
    ]
  },
  {
    id: 'pole-barn',
    name: 'Pole Barn',
    description: 'Traditional post-frame construction with versatile design options',
    icon: <Building2 className="w-8 h-8" />,
    features: [
      'Cost-effective construction',
      'Large open floor plans',
      'Quick installation',
      'Ideal for agricultural & storage'
    ]
  },
  {
    id: 'i-beam',
    name: 'I-Beam Construction',
    description: 'Heavy-duty steel I-beam frame for maximum strength and span',
    icon: <Columns className="w-8 h-8" />,
    features: [
      'Superior load-bearing capacity',
      'Wider clear spans available',
      'Commercial & industrial grade',
      '26-gauge steel panels'
    ]
  },
  {
    id: 'bolt-up',
    name: 'Bolt Up',
    description: 'Custom engineered steel building with premium features',
    icon: <Wrench className="w-8 h-8" />,
    features: [
      'Fully customizable design',
      'Commercial-grade construction',
      'Engineering included',
      'Premium finishes available'
    ],
    note: 'Customized Quote Required'
  }
];

export function Step2BuildingType() {
  const { building, setBuildingConfig } = useEstimatorStore();

  const handleSelect = (type: BuildingType) => {
    setBuildingConfig({ buildingType: type });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Select the type of building you're interested in.
      </motion.p>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {buildingTypes.map((type) => {
          const isSelected = building.buildingType === type.id;

          return (
            <button
              key={type.id}
              onClick={() => handleSelect(type.id)}
              className={`
                relative p-6 rounded-xl border-2 transition-all duration-300 text-left
                ${isSelected
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 shadow-lg shadow-[#14B8A6]/20'
                  : 'border-white/10 bg-[#1e2a45] hover:border-white/30 hover:bg-[#243352]'
                }
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-[#14B8A6] rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className={`
                w-14 h-14 rounded-xl flex items-center justify-center mb-4
                ${isSelected ? 'bg-[#14B8A6] text-white' : 'bg-[#243352] text-[#14B8A6]'}
              `}>
                {type.icon}
              </div>

              {/* Name & Description */}
              <h3 className={`text-lg font-bold mb-2 ${isSelected ? 'text-[#14B8A6]' : 'text-white'}`}>
                {type.name}
              </h3>
              <p className="text-sm text-[#A3A3A3] mb-4">
                {type.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {type.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-[#A3A3A3]">
                    <span className={`mt-1 ${isSelected ? 'text-[#14B8A6]' : 'text-[#666666]'}`}>•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Special note for Bolt Up */}
              {type.note && (
                <div className={`
                  mt-4 px-3 py-2 rounded-lg text-xs font-medium
                  ${isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-500/10 text-orange-400/80'}
                `}>
                  {type.note}
                </div>
              )}
            </button>
          );
        })}
      </motion.div>

      {/* Info panel for selected type */}
      {building.buildingType && building.buildingType !== 'bolt-up' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e2a45] rounded-xl p-4 border border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#14B8A6]/20 flex items-center justify-center text-[#14B8A6]">
              {buildingTypes.find(t => t.id === building.buildingType)?.icon}
            </div>
            <div>
              <p className="text-white font-medium">
                {buildingTypes.find(t => t.id === building.buildingType)?.name} Selected
              </p>
              <p className="text-sm text-[#A3A3A3]">
                Continue to configure your building specifications.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Bolt-Up Quote Form */}
      {building.buildingType === 'bolt-up' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <BoltUpQuoteForm />
        </motion.div>
      )}
    </motion.div>
  );
}

export default Step2BuildingType;
