import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { ROOF_COLORS, WALL_COLORS, TRIM_COLORS, DOOR_COLORS } from '../../../constants/colors';
import { BuildingProfile } from '../building-profile/BuildingProfile';
import type { ColorOption } from '../../../constants/colors';

interface ColorSwatchProps {
  color: ColorOption;
  isSelected: boolean;
  onClick: () => void;
}

function ColorSwatch({ color, isSelected, onClick }: ColorSwatchProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative w-10 h-10 rounded-lg shadow-sm transition-all duration-200
        ${isSelected ? 'ring-2 ring-[#14B8A6] ring-offset-2 ring-offset-[#1e2a45] scale-110' : 'hover:scale-105'}
      `}
      style={{ backgroundColor: color.hex }}
      title={color.name}
    >
      {color.hex === '#FFFFFF' && (
        <div className="absolute inset-0 border border-gray-300 rounded-lg" />
      )}
      {isSelected && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
            color.hex === '#FFFFFF' || color.hex === '#FEF3C7' || color.hex === '#D7CCC8' || color.hex === '#E8DCC8'
              ? 'bg-gray-800' : 'bg-white'
          }`}>
            <svg className={`w-2.5 h-2.5 ${
              color.hex === '#FFFFFF' || color.hex === '#FEF3C7' || color.hex === '#D7CCC8' || color.hex === '#E8DCC8'
                ? 'text-white' : 'text-[#14B8A6]'
            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      )}
    </button>
  );
}

interface ColorSectionProps {
  title: string;
  colors: ColorOption[];
  selectedColor: string;
  onSelect: (hex: string) => void;
}

function ColorSection({ title, colors, selectedColor, onSelect }: ColorSectionProps) {
  const selectedColorName = colors.find((c) => c.hex === selectedColor)?.name || 'Custom';

  return (
    <div className="bg-[#1e2a45] rounded-xl p-4 border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-white">{title}</h4>
        <span className="text-sm text-[#14B8A6]">{selectedColorName}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <ColorSwatch
            key={color.hex + color.name}
            color={color}
            isSelected={selectedColor === color.hex}
            onClick={() => onSelect(color.hex)}
          />
        ))}
      </div>
    </div>
  );
}

export function Step5Colors() {
  const { colors, setColors, building, setBuildingConfig } = useEstimatorStore();

  type WallView = 'front' | 'back' | 'left' | 'right';

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Choose colors for your building panels and trim.
      </motion.p>

      <motion.div variants={itemVariants} className="space-y-4">
        <ColorSection
          title="Wall Panels"
          colors={WALL_COLORS}
          selectedColor={colors.walls}
          onSelect={(hex) => setColors({ walls: hex })}
        />

        <ColorSection
          title="Roof Panels"
          colors={ROOF_COLORS}
          selectedColor={colors.roof}
          onSelect={(hex) => setColors({ roof: hex })}
        />

        <ColorSection
          title="Trim"
          colors={TRIM_COLORS}
          selectedColor={colors.trim}
          onSelect={(hex) => setColors({ trim: hex })}
        />

        <ColorSection
          title="Doors"
          colors={DOOR_COLORS}
          selectedColor={colors.doors}
          onSelect={(hex) => setColors({ doors: hex })}
        />
      </motion.div>

      {/* Building Preview with Colors */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#14B8A6]" />
            <h3 className="text-lg font-semibold text-white">Building Preview</h3>
          </div>
          <p className="text-sm text-[#A3A3A3]">See your color selections</p>
        </div>

        {/* Wall View Tabs */}
        <div className="flex gap-2 mb-4">
          {(['front', 'back', 'left', 'right'] as WallView[]).map((wall) => {
            const isActive = building.buildingView === wall;
            return (
              <button
                key={wall}
                onClick={() => setBuildingConfig({ buildingView: wall })}
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive
                    ? 'bg-[#14B8A6] text-white shadow-lg'
                    : 'bg-[#243352] text-[#A3A3A3] hover:bg-[#2d3f63] border border-white/10'
                  }
                `}
              >
                <span className="capitalize">{wall}</span>
              </button>
            );
          })}
        </div>

        {/* Building Profile Visualization */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <BuildingProfile
            showDoors={true}
            showClearanceZones={false}
          />
        </div>
      </motion.div>

      {/* Color Summary */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-4 border border-white/10">
        <h4 className="font-semibold text-white mb-3">Your Color Selections</h4>
        <div className="flex flex-wrap gap-6">
          {[
            { label: 'Walls', color: colors.walls, colorList: WALL_COLORS },
            { label: 'Roof', color: colors.roof, colorList: ROOF_COLORS },
            { label: 'Trim', color: colors.trim, colorList: TRIM_COLORS },
            { label: 'Doors', color: colors.doors, colorList: DOOR_COLORS }
          ].map(({ label, color, colorList }) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded border border-white/20"
                style={{ backgroundColor: color }}
              />
              <div>
                <p className="text-xs text-[#A3A3A3]">{label}</p>
                <p className="text-sm font-medium text-white">
                  {colorList.find((c) => c.hex === color)?.name || 'Custom'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step5Colors;
