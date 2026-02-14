import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, Eye } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';
import { DOOR_PRICE_MATRIX, WALK_DOOR_PRICES, BUILDING_SIZES, EAVE_HEIGHTS } from '../../../constants/pricing';
import { BuildingProfile } from '../building-profile/BuildingProfile';
import type { DoorConfig } from '../../../types/estimator';

const generateId = () => Math.random().toString(36).substring(2, 11);

type WallView = 'front' | 'back' | 'left' | 'right';

export function Step4Doors() {
  const { building, accessories, addDoor, removeDoor, updateDoor, setBuildingConfig } = useEstimatorStore();
  const [selectedDoorId, setSelectedDoorId] = useState<string | null>(null);

  // Initialize with one walk door if none exists (included free)
  useEffect(() => {
    if (accessories.walkDoors.length === 0) {
      const initialDoor: DoorConfig = {
        id: generateId(),
        type: 'walk',
        size: '3x7',
        width: 3,
        height: 7,
        wall: 'front',
        position: 5,
        quantity: 1
      };
      addDoor(initialDoor);
    }
  }, [accessories.walkDoors.length, addDoor]);

  // Handler to change building view
  const handleViewChange = (view: WallView) => {
    setBuildingConfig({ buildingView: view });
    setSelectedDoorId(null); // Clear selection when changing views
  };

  // Walk door count (1 included free)
  const walkDoorCount = accessories.walkDoors.length;
  const extraWalkDoors = Math.max(0, walkDoorCount - 1);

  // Get available door heights (must be 2' less than building height)
  const getAvailableHeights = () => {
    const maxHeight = building.height - 2;
    const heights = [];
    for (let h = 8; h <= maxHeight && h <= 14; h += 2) {
      heights.push(h);
    }
    return heights;
  };

  const availableHeights = getAvailableHeights();
  const doorWidths = [8, 10, 12, 14];

  const wallOptions = [
    { value: 'front', label: 'Front Wall' },
    { value: 'back', label: 'Back Wall' },
    { value: 'left', label: 'Left Wall' },
    { value: 'right', label: 'Right Wall' }
  ];

  // Get wall length based on wall selection
  const getWallLength = (wall: string) => {
    if (wall === 'front' || wall === 'back') {
      return building.width;
    }
    return building.length;
  };

  // Handle walk door quantity change
  const handleWalkDoorChange = (delta: number) => {
    if (delta > 0) {
      // Add a walk door
      const newDoor: DoorConfig = {
        id: generateId(),
        type: 'walk',
        size: '3x7',
        width: 3,
        height: 7,
        wall: 'front',
        position: 5,
        quantity: 1
      };
      addDoor(newDoor);
    } else if (delta < 0 && walkDoorCount > 1) {
      // Remove last walk door (keep at least 1)
      const lastDoor = accessories.walkDoors[accessories.walkDoors.length - 1];
      if (lastDoor) {
        removeDoor(lastDoor.id);
      }
    }
  };

  // Add overhead door
  const handleAddOverheadDoor = () => {
    const defaultHeight = availableHeights.length > 0 ? availableHeights[0] : 8;
    const newDoor: DoorConfig = {
      id: generateId(),
      type: 'rollUp',
      size: `10x${defaultHeight}` as any,
      width: 10,
      height: defaultHeight,
      wall: 'front',
      position: 5,
      quantity: 1
    };
    addDoor(newDoor);
  };

  // Calculate totals
  const walkDoorCost = extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough;
  const overheadDoorCost = accessories.rollUpDoors.reduce((total, door) => {
    const key = `${door.height}x${door.width}`;
    return total + (DOOR_PRICE_MATRIX[key] || 0);
  }, 0);

  // Get base price
  const basePrice = BUILDING_SIZES.find(s => s.id === building.buildingSizeId)?.startingPrice || 0;
  const heightModifier = EAVE_HEIGHTS.find(h => h.id === building.eaveHeightId)?.modifier || 0;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Configure your doors. One 3070 walk-through door is included with your building.
      </motion.p>

      {/* Building Visualization with Door Placement */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#14B8A6]" />
            <h3 className="text-lg font-semibold text-white">Door Placement Preview</h3>
          </div>
          <p className="text-sm text-[#A3A3A3]">Click a wall to position doors</p>
        </div>

        {/* Wall View Tabs */}
        <div className="flex gap-2 mb-4">
          {(['front', 'back', 'left', 'right'] as WallView[]).map((wall) => {
            const isActive = building.buildingView === wall;
            const doorCount = [...accessories.walkDoors, ...accessories.rollUpDoors].filter(d => d.wall === wall).length;
            return (
              <button
                key={wall}
                onClick={() => handleViewChange(wall)}
                className={`
                  flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all
                  ${isActive
                    ? 'bg-[#14B8A6] text-white shadow-lg'
                    : 'bg-[#243352] text-[#A3A3A3] hover:bg-[#2d3f63] border border-white/10'
                  }
                `}
              >
                <span className="capitalize">{wall}</span>
                {doorCount > 0 && (
                  <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${isActive ? 'bg-white/20' : 'bg-[#14B8A6]/20 text-[#14B8A6]'}`}>
                    {doorCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Building Profile Visualization */}
        <div className="rounded-lg overflow-hidden border border-white/10">
          <BuildingProfile
            showDoors={true}
            showClearanceZones={true}
            selectedDoorId={selectedDoorId}
            onDoorClick={(doorId) => setSelectedDoorId(doorId === selectedDoorId ? null : doorId)}
          />
        </div>

        {/* Selected Door Position Slider */}
        {selectedDoorId && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-[#243352] rounded-lg border border-[#14B8A6]/30"
          >
            {(() => {
              const door = [...accessories.walkDoors, ...accessories.rollUpDoors].find(d => d.id === selectedDoorId);
              if (!door) return null;
              const wallLength = getWallLength(door.wall);
              const maxPosition = wallLength - door.width - 3;

              return (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">
                      {door.type === 'walk' ? `Walk Door #${accessories.walkDoors.findIndex(d => d.id === door.id) + 1}` : `Overhead Door #${accessories.rollUpDoors.findIndex(d => d.id === door.id) + 1}`}
                    </span>
                    <span className="text-[#14B8A6]">{door.position}' from left edge</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#A3A3A3]">3'</span>
                    <input
                      type="range"
                      min={3}
                      max={maxPosition}
                      value={door.position || 5}
                      onChange={(e) => updateDoor(door.id, { position: Number(e.target.value) })}
                      className="flex-1 h-2 bg-[#1e2a45] rounded-lg appearance-none cursor-pointer accent-[#14B8A6]"
                    />
                    <span className="text-xs text-[#A3A3A3]">{maxPosition}'</span>
                  </div>
                  <p className="text-xs text-[#666666] mt-2">
                    Wall length: {wallLength}' | Door width: {door.width}' | Door height: {door.height}'
                  </p>
                </div>
              );
            })()}
          </motion.div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-[#A3A3A3]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#4a3728] rounded border border-white/20"></div>
            <span>Walk Door (W)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-[#5a4535] rounded border border-white/20"></div>
            <span>Overhead Door (O)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500/20 rounded border border-red-500/30"></div>
            <span>Post Clearance Zone</span>
          </div>
        </div>
      </motion.div>

      {/* Walk-Through Doors */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">3070 Walk-Through Door</h3>
        <p className="text-sm text-[#A3A3A3] mb-4">1 door included standard. Additional doors: $1,045 each</p>

        <div className="flex items-center gap-4">
          <span className="text-[#A3A3A3]">Quantity:</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleWalkDoorChange(-1)}
              disabled={walkDoorCount <= 1}
              className="w-10 h-10 rounded-lg bg-[#243352] hover:bg-[#2d3f63] border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors text-white"
            >
              <Minus className="w-5 h-5" />
            </button>
            <span className="w-8 text-center text-xl font-bold text-white">{walkDoorCount}</span>
            <button
              onClick={() => handleWalkDoorChange(1)}
              className="w-10 h-10 rounded-lg bg-[#243352] hover:bg-[#2d3f63] border border-white/10 flex items-center justify-center transition-colors text-white"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <span className="text-[#A3A3A3] ml-4">
            {walkDoorCount === 1 ? '(Included)' : `(+$${(extraWalkDoors * WALK_DOOR_PRICES.extra_walkthrough).toLocaleString()})`}
          </span>
        </div>

        {/* Walk door placement */}
        {walkDoorCount > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium text-[#A3A3A3]">Door Placement</h4>
            {accessories.walkDoors.map((door, index) => (
              <div key={door.id} className="grid grid-cols-3 gap-4 p-4 bg-[#243352] rounded-lg border border-white/5">
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">Door #{index + 1}</label>
                  <span className="text-sm font-medium text-white">3' x 7' Walk Door</span>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">Wall</label>
                  <select
                    value={door.wall}
                    onChange={(e) => updateDoor(door.id, { wall: e.target.value as any })}
                    className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                  >
                    {wallOptions.map(opt => (
                      <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#A3A3A3] mb-1">Position (ft from left)</label>
                  <input
                    type="number"
                    min={3}
                    max={getWallLength(door.wall) - 6}
                    value={door.position || 5}
                    onChange={(e) => updateDoor(door.id, { position: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Overhead Doors */}
      <motion.div variants={itemVariants} className="bg-[#1e2a45] rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Overhead Doors</h3>
            <p className="text-sm text-[#A3A3A3]">Roll-up garage doors for vehicle or equipment access</p>
          </div>
          <button
            onClick={handleAddOverheadDoor}
            className="flex items-center gap-2 px-4 py-2 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0d9488] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Door
          </button>
        </div>

        {accessories.rollUpDoors.length === 0 ? (
          <p className="text-[#666666] italic py-4">No overhead doors added</p>
        ) : (
          <div className="space-y-4">
            {accessories.rollUpDoors.map((door, index) => {
              const priceKey = `${door.height}x${door.width}`;
              const doorPrice = DOOR_PRICE_MATRIX[priceKey] || 0;

              return (
                <div key={door.id} className="p-4 bg-[#243352] rounded-lg border border-white/5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-medium text-white">Overhead Door #{index + 1}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-[#14B8A6] font-semibold">${doorPrice.toLocaleString()}</span>
                      <button
                        onClick={() => removeDoor(door.id)}
                        className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Width</label>
                      <select
                        value={door.width}
                        onChange={(e) => {
                          const newWidth = Number(e.target.value);
                          updateDoor(door.id, {
                            width: newWidth,
                            size: `${newWidth}x${door.height}` as any
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                      >
                        {doorWidths.map(w => (
                          <option key={w} value={w} className="bg-[#1e2a45] text-white">{w}'</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Height</label>
                      <select
                        value={door.height}
                        onChange={(e) => {
                          const newHeight = Number(e.target.value);
                          updateDoor(door.id, {
                            height: newHeight,
                            size: `${door.width}x${newHeight}` as any
                          });
                        }}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                      >
                        {availableHeights.map(h => (
                          <option key={h} value={h} className="bg-[#1e2a45] text-white">{h}'</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Wall</label>
                      <select
                        value={door.wall}
                        onChange={(e) => updateDoor(door.id, { wall: e.target.value as any })}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                      >
                        {wallOptions.map(opt => (
                          <option key={opt.value} value={opt.value} className="bg-[#1e2a45] text-white">{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#A3A3A3] mb-1">Position (ft from left)</label>
                      <input
                        type="number"
                        min={3}
                        max={getWallLength(door.wall) - door.width - 3}
                        value={door.position || 5}
                        onChange={(e) => updateDoor(door.id, { position: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-[#1e2a45] border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Running Total */}
      <motion.div
        variants={itemVariants}
        className="bg-[#1e2a45] rounded-xl p-4 border border-white/10"
      >
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#A3A3A3]">Building ({building.width}' x {building.length}' x {building.height}')</span>
            <span className="text-white">${(basePrice + heightModifier).toLocaleString()}</span>
          </div>
          {extraWalkDoors > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Additional Walk Doors ({extraWalkDoors})</span>
              <span className="text-white">+${walkDoorCost.toLocaleString()}</span>
            </div>
          )}
          {overheadDoorCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-[#A3A3A3]">Overhead Doors ({accessories.rollUpDoors.length})</span>
              <span className="text-white">+${overheadDoorCost.toLocaleString()}</span>
            </div>
          )}
          <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
            <span className="font-semibold text-white">Subtotal</span>
            <span className="text-2xl font-bold text-[#14B8A6]">
              ${(basePrice + heightModifier + walkDoorCost + overheadDoorCost).toLocaleString()}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Step4Doors;
