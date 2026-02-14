import { motion } from 'framer-motion';
import { Ruler, ArrowUpDown, Building, Check, DollarSign } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { BUILDING_SIZES, EAVE_HEIGHTS } from '../../../constants/pricing';
import BuildingProfile from '../building-profile/BuildingProfile';
import ViewControls from '../building-profile/ViewControls';

export function Step2BuildingSize() {
  const { building, setBuildingConfig } = useEstimatorStore();

  // Handle building size selection
  const handleSizeSelect = (sizeId: string) => {
    const selectedSize = BUILDING_SIZES.find(s => s.id === sizeId);
    if (selectedSize) {
      setBuildingConfig({
        buildingSizeId: sizeId,
        width: selectedSize.width,
        length: selectedSize.length
      });
    }
  };

  // Handle eave height selection
  const handleHeightSelect = (heightId: string) => {
    const selectedHeight = EAVE_HEIGHTS.find(h => h.id === heightId);
    if (selectedHeight) {
      setBuildingConfig({
        eaveHeightId: heightId,
        height: selectedHeight.height
      });
    }
  };

  // Get current selections
  const currentSize = BUILDING_SIZES.find(s => s.id === building.buildingSizeId);
  const currentHeight = EAVE_HEIGHTS.find(h => h.id === building.eaveHeightId);

  // Calculate current base price
  const basePrice = currentSize ? currentSize.startingPrice + (currentHeight?.modifier || 0) : 0;

  const legTypeOptions = [
    { value: 'standard', label: 'Standard (29 gauge)', description: 'Suitable for most residential and light commercial applications.' },
    { value: 'certified', label: 'Certified (26 gauge)', description: 'Engineered for higher wind and snow loads with thicker gauge steel.' }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Select your building size and specifications from our pre-configured options.
      </motion.p>

      {/* Building Size Selection */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Ruler className="w-5 h-5 text-[#FF6A00]" />
          Building Size
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {BUILDING_SIZES.map((size) => (
            <motion.button
              key={size.id}
              onClick={() => handleSizeSelect(size.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${building.buildingSizeId === size.id
                  ? 'border-[#FF6A00] bg-[#FF6A00]/10 shadow-lg shadow-[#FF6A00]/20'
                  : 'border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#1A1A1A]'
                }
              `}
            >
              {/* Selected checkmark */}
              {building.buildingSizeId === size.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6A00] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className="space-y-2">
                <p className={`text-xl font-bold ${building.buildingSizeId === size.id ? 'text-[#FF6A00]' : 'text-white'}`}>
                  {size.label}
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  {size.sqft.toLocaleString()} sq ft
                </p>
                <p className="text-lg font-semibold text-[#14B8A6]">
                  ${size.startingPrice.toLocaleString()}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Eave Height Selection */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ArrowUpDown className="w-5 h-5 text-[#FF6A00]" />
          Eave Height
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {EAVE_HEIGHTS.map((height) => (
            <motion.button
              key={height.id}
              onClick={() => handleHeightSelect(height.id)}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-center
                ${building.eaveHeightId === height.id
                  ? 'border-[#FF6A00] bg-[#FF6A00]/10 shadow-lg shadow-[#FF6A00]/20'
                  : 'border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#1A1A1A]'
                }
              `}
            >
              {/* Selected checkmark */}
              {building.eaveHeightId === height.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#FF6A00] flex items-center justify-center"
                >
                  <Check className="w-3 h-3 text-white" />
                </motion.div>
              )}

              <div className="space-y-1">
                <p className={`text-xl font-bold ${building.eaveHeightId === height.id ? 'text-[#FF6A00]' : 'text-white'}`}>
                  {height.label}
                </p>
                <p className="text-sm text-[#A3A3A3]">
                  {height.modifier === 0 ? 'Included' : `+$${height.modifier.toLocaleString()}`}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Summary Card */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-br from-[#1A1A1A] to-[#111111] rounded-xl p-6 border border-white/10"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Specs Summary */}
          <div className="flex-1 space-y-4">
            <h4 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Selected Configuration
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#666666]">Dimensions</p>
                <p className="text-lg font-semibold text-white">
                  {building.width}' × {building.length}' × {building.height}'
                </p>
              </div>
              <div>
                <p className="text-sm text-[#666666]">Square Footage</p>
                <motion.p
                  className="text-lg font-semibold text-white"
                  key={building.width * building.length}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  {(building.width * building.length).toLocaleString()} sq ft
                </motion.p>
              </div>
            </div>

            {/* Base Price */}
            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
              <DollarSign className="w-5 h-5 text-[#14B8A6]" />
              <div>
                <p className="text-sm text-[#666666]">Starting Price</p>
                <motion.p
                  className="text-2xl font-bold text-[#14B8A6]"
                  key={basePrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                >
                  ${basePrice.toLocaleString()}
                </motion.p>
              </div>
            </div>
          </div>

          {/* Frame Type Selection */}
          <div className="flex-1 space-y-4">
            <h4 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider">
              Frame Type
            </h4>

            <div className="space-y-2">
              {legTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`
                    flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
                    ${building.legType === option.value
                      ? 'bg-[#FF6A00]/10 border border-[#FF6A00]/30'
                      : 'bg-[#0A0A0A] border border-transparent hover:border-white/10'
                    }
                  `}
                >
                  <div className="relative mt-0.5">
                    <input
                      type="radio"
                      name="legType"
                      value={option.value}
                      checked={building.legType === option.value}
                      onChange={(e) => setBuildingConfig({ legType: e.target.value as 'standard' | 'certified' })}
                      className="sr-only peer"
                    />
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 peer-checked:border-[#FF6A00] peer-checked:bg-[#FF6A00] transition-all duration-200" />
                  </div>
                  <div>
                    <p className={`font-medium ${building.legType === option.value ? 'text-white' : 'text-[#A3A3A3]'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-[#666666] mt-0.5">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Building Preview */}
      <motion.div variants={itemVariants} className="space-y-4">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Building className="w-5 h-5 text-[#FF6A00]" />
          Building Preview
        </h3>

        <ViewControls />
        <BuildingProfile />

        {/* Breezeway Options */}
        <div className="bg-[#111111] rounded-xl p-4 border border-white/8">
          <h4 className="text-sm font-semibold text-[#A3A3A3] uppercase tracking-wider mb-3">
            Breezeway Options
          </h4>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={building.breezeway.frontBack}
                  onChange={(e) =>
                    setBuildingConfig({
                      breezeway: { ...building.breezeway, frontBack: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded border-2 border-white/20 bg-[#0A0A0A] peer-checked:bg-[#FF6A00] peer-checked:border-[#FF6A00] transition-all duration-200 flex items-center justify-center">
                  {building.breezeway.frontBack && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <span className="text-[#A3A3A3] group-hover:text-white transition-colors">
                Front/Back Breezeway
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={building.breezeway.sideSide}
                  onChange={(e) =>
                    setBuildingConfig({
                      breezeway: { ...building.breezeway, sideSide: e.target.checked }
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded border-2 border-white/20 bg-[#0A0A0A] peer-checked:bg-[#FF6A00] peer-checked:border-[#FF6A00] transition-all duration-200 flex items-center justify-center">
                  {building.breezeway.sideSide && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
              </div>
              <span className="text-[#A3A3A3] group-hover:text-white transition-colors">
                Side/Side Breezeway
              </span>
            </label>
          </div>
          <p className="text-xs text-[#666666] mt-3">
            Breezeway options will automatically center doors on opposite walls.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step2BuildingSize;
