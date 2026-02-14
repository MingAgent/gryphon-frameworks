// Address Type
export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
}

// Customer Information Types
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  // Legacy fields (keeping for backward compatibility)
  address: string;
  city: string;
  state: string;
  zip: string;
  // New address structure
  billingAddress: Address;
  constructionAddress: Address;
  sameAsMailingAddress: boolean;
}

// Building Configuration Types
export type LegType = 'standard' | 'certified';
export type BuildingView = 'front' | 'back' | 'left' | 'right';
export type BuildingType = 'pole-barn' | 'carport' | 'bolt-up';

export interface Breezeway {
  frontBack: boolean;
  sideSide: boolean;
}

export interface BuildingConfig {
  // Building type selection
  buildingType: BuildingType;
  // Cookie-cutter selection IDs
  buildingSizeId: string;
  eaveHeightId: string;
  // Computed dimensions (from selected size/height)
  width: number;
  length: number;
  height: number;
  legType: LegType;
  buildingView: BuildingView;
  breezeway: Breezeway;
}

// Door and Window Types
export type DoorType = 'walk' | 'rollUp';
export type DoorSize = '3x7' | '4x7' | '6x7' | '8x8' | '10x10' | '12x12';
export type WallPosition = 'front' | 'back' | 'left' | 'right';

export interface DoorConfig {
  id: string;
  type: DoorType;
  size: DoorSize;
  width: number;  // Width in feet
  height: number; // Height in feet
  wall: WallPosition;
  position: number; // Position in feet from left edge of wall
  quantity: number;
}

export interface WindowConfig {
  id: string;
  size: '3x3' | '4x4';
  wall: 'front' | 'back' | 'left' | 'right';
  quantity: number;
}

// Accessories Types
export type InsulationType = 'none' | 'wall' | 'ceiling' | 'full';

export interface AccessoriesConfig {
  walkDoors: DoorConfig[];
  rollUpDoors: DoorConfig[];
  windows: WindowConfig[];
  insulation: InsulationType;
  ventilation: boolean;
  gutters: boolean;
}

// Color Types
export interface ColorConfig {
  roof: string;
  walls: string;
  trim: string;
}

// Concrete Types
export type ConcreteType = 'none' | 'piers' | 'slab' | 'turnkey';

export interface ConcreteConfig {
  type: ConcreteType;
  existingPad: boolean;
  thickness: number;
}

// Pricing Types
export interface PricingBreakdown {
  basePrice: number;
  accessoriesTotal: number;
  concreteTotal: number;
  laborTotal: number;
  deliveryTotal: number;
  grandTotal: number;
  depositAmount: number;
}

// Contract Section Types
export type ContractSectionId =
  | 'customerInfo'
  | 'projectOverview'
  | 'paymentTerms'
  | 'timeline'
  | 'responsibilities'
  | 'warranties'
  | 'legalProvisions'
  | 'signatures';

export interface ContractSectionState {
  checked: boolean;      // Checkbox acknowledgment
  initialed: boolean;    // Has initials been provided
  initialsData: string | null;  // Base64 PNG of initials
  timestamp: string | null;     // When acknowledged
}

// Signature Data (for final signatures)
export interface SignatureData {
  ownerSignature: string | null;      // Base64 PNG
  ownerTypedName: string;
  ownerSignedAt: string | null;
  contractorSignature: string | null; // Base64 PNG
  contractorTypedName: string;
  contractorSignedAt: string | null;
}

// Payment method for first draw
export type PaymentMethod = 'cash' | 'check' | 'card' | 'financing' | 'ach' | null;

// Full Contract Configuration
export interface ContractConfig {
  // Current section being viewed (0-7)
  currentSection: number;

  // Section acknowledgments (sections 1-6 require checkbox + initials)
  sections: {
    projectOverview: ContractSectionState;
    paymentTerms: ContractSectionState;
    timeline: ContractSectionState;
    responsibilities: ContractSectionState;
    warranties: ContractSectionState;
    legalProvisions: ContractSectionState;
  };

  // Final signatures
  signatures: SignatureData;

  // Payment
  paymentMethod: PaymentMethod;

  // Status flags
  agreedToTerms: boolean;
  depositPaid: boolean;
  contractSent: boolean;
  contractSentAt: string | null;
}

// Door Position Map (for drag-drop)
export type DoorPositionMap = Record<string, number>; // key: `${doorId}-${view}`

// Complete Estimator State
export interface EstimatorState {
  // Navigation
  currentStep: number;
  currentContractSection: number;

  // Form Data
  customer: CustomerInfo;
  building: BuildingConfig;
  accessories: AccessoriesConfig;
  doorPositions: DoorPositionMap;
  colors: ColorConfig;
  concrete: ConcreteConfig;
  pricing: PricingBreakdown;
  contract: ContractConfig;
}

// Actions Interface
export interface EstimatorActions {
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  nextContractSection: () => void;
  prevContractSection: () => void;
  goToContractSection: (section: number) => void;

  // Setters
  setCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setBuildingConfig: (config: Partial<BuildingConfig>) => void;
  setAccessories: (accessories: Partial<AccessoriesConfig>) => void;
  setDoorPosition: (doorId: string, view: string, position: number) => void;
  setColors: (colors: Partial<ColorConfig>) => void;
  setConcreteConfig: (config: Partial<ConcreteConfig>) => void;
  setContractData: (data: Partial<ContractConfig>) => void;

  // Contract Section Actions
  acknowledgeSection: (sectionId: keyof ContractConfig['sections'], checked: boolean) => void;
  setInitials: (sectionId: keyof ContractConfig['sections'], initialsData: string) => void;
  clearInitials: (sectionId: keyof ContractConfig['sections']) => void;
  setOwnerSignature: (signatureData: string, typedName: string) => void;
  clearOwnerSignature: () => void;
  setContractorSignature: (signatureData: string, typedName: string) => void;
  clearContractorSignature: () => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  markContractSent: () => void;

  // Door/Window Management
  addDoor: (door: DoorConfig) => void;
  removeDoor: (doorId: string) => void;
  updateDoor: (doorId: string, updates: Partial<DoorConfig>) => void;
  addWindow: (window: WindowConfig) => void;
  removeWindow: (windowId: string) => void;

  // Calculations
  calculatePricing: () => void;

  // Persistence
  resetEstimate: () => void;
  saveEstimate: () => void;
  loadEstimate: () => void;
}

export type EstimatorStore = EstimatorState & EstimatorActions;
