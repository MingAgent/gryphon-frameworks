// Available metal building colors
export interface ColorOption {
  name: string;
  hex: string;
  category: 'neutral' | 'warm' | 'cool' | 'earth';
}

export const ROOF_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', category: 'neutral' },
  { name: 'Light Gray', hex: '#D1D5DB', category: 'neutral' },
  { name: 'Charcoal', hex: '#374151', category: 'neutral' },
  { name: 'Black', hex: '#1F2937', category: 'neutral' },
  { name: 'Burgundy', hex: '#7C1D3E', category: 'warm' },
  { name: 'Red', hex: '#DC2626', category: 'warm' },
  { name: 'Rustic Red', hex: '#991B1B', category: 'warm' },
  { name: 'Clay', hex: '#A1887F', category: 'earth' },
  { name: 'Tan', hex: '#D7CCC8', category: 'earth' },
  { name: 'Brown', hex: '#5D4037', category: 'earth' },
  { name: 'Forest Green', hex: '#166534', category: 'cool' },
  { name: 'Hunter Green', hex: '#14532D', category: 'cool' },
  { name: 'Blue', hex: '#2563EB', category: 'cool' },
  { name: 'Ocean Blue', hex: '#1E3A8A', category: 'cool' },
  { name: 'Pewter Gray', hex: '#6B7280', category: 'neutral' },
  { name: 'Slate Blue', hex: '#475569', category: 'cool' }
];

export const WALL_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', category: 'neutral' },
  { name: 'Light Gray', hex: '#D1D5DB', category: 'neutral' },
  { name: 'Charcoal', hex: '#374151', category: 'neutral' },
  { name: 'Black', hex: '#1F2937', category: 'neutral' },
  { name: 'Burgundy', hex: '#7C1D3E', category: 'warm' },
  { name: 'Red', hex: '#DC2626', category: 'warm' },
  { name: 'Rustic Red', hex: '#991B1B', category: 'warm' },
  { name: 'Clay', hex: '#A1887F', category: 'earth' },
  { name: 'Tan', hex: '#D7CCC8', category: 'earth' },
  { name: 'Brown', hex: '#5D4037', category: 'earth' },
  { name: 'Forest Green', hex: '#166534', category: 'cool' },
  { name: 'Hunter Green', hex: '#14532D', category: 'cool' },
  { name: 'Blue', hex: '#2563EB', category: 'cool' },
  { name: 'Ocean Blue', hex: '#1E3A8A', category: 'cool' },
  { name: 'Pewter Gray', hex: '#6B7280', category: 'neutral' },
  { name: 'Slate Blue', hex: '#475569', category: 'cool' },
  { name: 'Cream', hex: '#FEF3C7', category: 'warm' },
  { name: 'Beige', hex: '#E8DCC8', category: 'earth' }
];

export const TRIM_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', category: 'neutral' },
  { name: 'Black', hex: '#1F2937', category: 'neutral' },
  { name: 'Charcoal', hex: '#374151', category: 'neutral' },
  { name: 'Brown', hex: '#5D4037', category: 'earth' },
  { name: 'Red', hex: '#DC2626', category: 'warm' },
  { name: 'Forest Green', hex: '#166534', category: 'cool' },
  { name: 'Blue', hex: '#2563EB', category: 'cool' },
  { name: 'Tan', hex: '#D7CCC8', category: 'earth' }
];

export const DOOR_COLORS: ColorOption[] = [
  { name: 'White', hex: '#FFFFFF', category: 'neutral' },
  { name: 'Light Gray', hex: '#D1D5DB', category: 'neutral' },
  { name: 'Charcoal', hex: '#374151', category: 'neutral' },
  { name: 'Black', hex: '#1F2937', category: 'neutral' },
  { name: 'Burgundy', hex: '#7C1D3E', category: 'warm' },
  { name: 'Red', hex: '#DC2626', category: 'warm' },
  { name: 'Rustic Red', hex: '#991B1B', category: 'warm' },
  { name: 'Clay', hex: '#A1887F', category: 'earth' },
  { name: 'Tan', hex: '#D7CCC8', category: 'earth' },
  { name: 'Brown', hex: '#5D4037', category: 'earth' },
  { name: 'Forest Green', hex: '#166534', category: 'cool' },
  { name: 'Hunter Green', hex: '#14532D', category: 'cool' },
  { name: 'Blue', hex: '#2563EB', category: 'cool' },
  { name: 'Ocean Blue', hex: '#1E3A8A', category: 'cool' },
  { name: 'Pewter Gray', hex: '#6B7280', category: 'neutral' },
  { name: 'Almond', hex: '#EFEBE9', category: 'earth' }
];

// Default color selections
export const DEFAULT_COLORS = {
  roof: '#FFFFFF',
  walls: '#FFFFFF',
  trim: '#1F2937',
  doors: '#FFFFFF'
};

// Color category labels
export const COLOR_CATEGORIES = {
  neutral: 'Neutral Tones',
  warm: 'Warm Colors',
  cool: 'Cool Colors',
  earth: 'Earth Tones'
} as const;
