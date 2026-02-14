import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  EstimatorStore,
  CustomerInfo,
  BuildingConfig,
  AccessoriesConfig,
  ColorConfig,
  ConcreteConfig,
  ContractConfig,
  ContractSectionState,
  DoorConfig,
  WindowConfig,
  PaymentMethod
} from '../types/estimator';
import { calculateTotalPrice } from '../utils/calculations/pricing';
import { DEFAULT_COLORS } from '../constants/colors';

// Initial address structure
const emptyAddress = {
  street: '',
  city: '',
  state: '',
  zip: ''
};

// Initial state values
const initialCustomer: CustomerInfo = {
  name: '',
  email: '',
  phone: '',
  // Legacy fields
  address: '',
  city: '',
  state: '',
  zip: '',
  // New address structure
  billingAddress: { ...emptyAddress },
  constructionAddress: { ...emptyAddress },
  sameAsMailingAddress: false
};

const initialBuilding: BuildingConfig = {
  buildingType: 'pole-barn',
  buildingSizeId: '30x40',
  eaveHeightId: '10',
  width: 30,
  length: 40,
  height: 10,
  legType: 'standard',
  buildingView: 'front',
  breezeway: {
    frontBack: false,
    sideSide: false
  }
};

const initialAccessories: AccessoriesConfig = {
  walkDoors: [],
  rollUpDoors: [],
  windows: [],
  insulation: 'none',
  ventilation: false,
  gutters: false
};

const initialColors: ColorConfig = {
  roof: DEFAULT_COLORS.roof,
  walls: DEFAULT_COLORS.walls,
  trim: DEFAULT_COLORS.trim
};

const initialConcrete: ConcreteConfig = {
  type: 'none',
  existingPad: false,
  thickness: 4
};

// Initial section state
const initialSectionState: ContractSectionState = {
  checked: false,
  initialed: false,
  initialsData: null,
  timestamp: null
};

const initialContract: ContractConfig = {
  currentSection: 0,
  sections: {
    projectOverview: { ...initialSectionState },
    paymentTerms: { ...initialSectionState },
    timeline: { ...initialSectionState },
    responsibilities: { ...initialSectionState },
    warranties: { ...initialSectionState },
    legalProvisions: { ...initialSectionState }
  },
  signatures: {
    ownerSignature: null,
    ownerTypedName: '',
    ownerSignedAt: null,
    contractorSignature: null,
    contractorTypedName: '',
    contractorSignedAt: null
  },
  paymentMethod: null,
  agreedToTerms: false,
  depositPaid: false,
  contractSent: false,
  contractSentAt: null
};

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      currentContractSection: 1,
      customer: initialCustomer,
      building: initialBuilding,
      accessories: initialAccessories,
      doorPositions: {},
      colors: initialColors,
      concrete: initialConcrete,
      pricing: {
        basePrice: 0,
        accessoriesTotal: 0,
        concreteTotal: 0,
        laborTotal: 0,
        deliveryTotal: 0,
        grandTotal: 0,
        depositAmount: 0
      },
      contract: initialContract,

      // Navigation Actions
      nextStep: () => {
        const { currentStep } = get();
        if (currentStep < 8) {
          set({ currentStep: currentStep + 1 });
          get().calculatePricing();
        }
      },

      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },

      goToStep: (step: number) => {
        if (step >= 1 && step <= 8) {
          set({ currentStep: step });
          get().calculatePricing();
        }
      },

      nextContractSection: () => {
        const { currentContractSection } = get();
        if (currentContractSection < 7) {
          set({ currentContractSection: currentContractSection + 1 });
        }
      },

      prevContractSection: () => {
        const { currentContractSection } = get();
        if (currentContractSection > 1) {
          set({ currentContractSection: currentContractSection - 1 });
        }
      },

      goToContractSection: (section: number) => {
        if (section >= 0 && section <= 7) {
          set((state) => ({
            contract: { ...state.contract, currentSection: section }
          }));
        }
      },

      // Contract Section Actions
      acknowledgeSection: (sectionId, checked) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                checked,
                timestamp: checked ? new Date().toISOString() : null
              }
            }
          }
        }));
      },

      setInitials: (sectionId, initialsData) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                initialed: true,
                initialsData,
                timestamp: new Date().toISOString()
              }
            }
          }
        }));
      },

      clearInitials: (sectionId) => {
        set((state) => ({
          contract: {
            ...state.contract,
            sections: {
              ...state.contract.sections,
              [sectionId]: {
                ...state.contract.sections[sectionId],
                initialed: false,
                initialsData: null
              }
            }
          }
        }));
      },

      setOwnerSignature: (signatureData, typedName) => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              ownerSignature: signatureData,
              ownerTypedName: typedName,
              ownerSignedAt: new Date().toISOString()
            }
          }
        }));
      },

      clearOwnerSignature: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              ownerSignature: null,
              ownerTypedName: '',
              ownerSignedAt: null
            }
          }
        }));
      },

      setContractorSignature: (signatureData, typedName) => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              contractorSignature: signatureData,
              contractorTypedName: typedName,
              contractorSignedAt: new Date().toISOString()
            }
          }
        }));
      },

      clearContractorSignature: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            signatures: {
              ...state.contract.signatures,
              contractorSignature: null,
              contractorTypedName: '',
              contractorSignedAt: null
            }
          }
        }));
      },

      setPaymentMethod: (method: PaymentMethod) => {
        set((state) => ({
          contract: {
            ...state.contract,
            paymentMethod: method
          }
        }));
      },

      markContractSent: () => {
        set((state) => ({
          contract: {
            ...state.contract,
            contractSent: true,
            contractSentAt: new Date().toISOString()
          }
        }));
      },

      // Setters
      setCustomerInfo: (info) => {
        set((state) => ({
          customer: { ...state.customer, ...info }
        }));
      },

      setBuildingConfig: (config) => {
        set((state) => ({
          building: { ...state.building, ...config }
        }));
        get().calculatePricing();
      },

      setAccessories: (accessories) => {
        set((state) => ({
          accessories: { ...state.accessories, ...accessories }
        }));
        get().calculatePricing();
      },

      setDoorPosition: (doorId, view, position) => {
        set((state) => ({
          doorPositions: {
            ...state.doorPositions,
            [`${doorId}-${view}`]: position
          }
        }));
      },

      setColors: (colors) => {
        set((state) => ({
          colors: { ...state.colors, ...colors }
        }));
      },

      setConcreteConfig: (config) => {
        set((state) => ({
          concrete: { ...state.concrete, ...config }
        }));
        get().calculatePricing();
      },

      setContractData: (data) => {
        set((state) => ({
          contract: { ...state.contract, ...data }
        }));
      },

      // Door Management
      addDoor: (door: DoorConfig) => {
        set((state) => {
          const key = door.type === 'walk' ? 'walkDoors' : 'rollUpDoors';
          return {
            accessories: {
              ...state.accessories,
              [key]: [...state.accessories[key], door]
            }
          };
        });
        get().calculatePricing();
      },

      removeDoor: (doorId: string) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.filter(d => d.id !== doorId),
            rollUpDoors: state.accessories.rollUpDoors.filter(d => d.id !== doorId)
          }
        }));
        get().calculatePricing();
      },

      updateDoor: (doorId: string, updates: Partial<DoorConfig>) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            walkDoors: state.accessories.walkDoors.map(d =>
              d.id === doorId ? { ...d, ...updates } : d
            ),
            rollUpDoors: state.accessories.rollUpDoors.map(d =>
              d.id === doorId ? { ...d, ...updates } : d
            )
          }
        }));
        get().calculatePricing();
      },

      // Window Management
      addWindow: (window: WindowConfig) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            windows: [...state.accessories.windows, window]
          }
        }));
        get().calculatePricing();
      },

      removeWindow: (windowId: string) => {
        set((state) => ({
          accessories: {
            ...state.accessories,
            windows: state.accessories.windows.filter(w => w.id !== windowId)
          }
        }));
        get().calculatePricing();
      },

      // Calculate Pricing
      calculatePricing: () => {
        const state = get();
        const pricing = calculateTotalPrice(
          state.building,
          state.accessories,
          state.concrete
        );
        set({ pricing });
      },

      // Reset
      resetEstimate: () => {
        set({
          currentStep: 1,
          currentContractSection: 0,
          customer: { ...initialCustomer },
          building: { ...initialBuilding },
          accessories: { ...initialAccessories },
          doorPositions: {},
          colors: { ...initialColors },
          concrete: { ...initialConcrete },
          pricing: {
            basePrice: 0,
            accessoriesTotal: 0,
            concreteTotal: 0,
            laborTotal: 0,
            deliveryTotal: 0,
            grandTotal: 0,
            depositAmount: 0
          },
          contract: {
            currentSection: 0,
            sections: {
              projectOverview: { ...initialSectionState },
              paymentTerms: { ...initialSectionState },
              timeline: { ...initialSectionState },
              responsibilities: { ...initialSectionState },
              warranties: { ...initialSectionState },
              legalProvisions: { ...initialSectionState }
            },
            signatures: {
              ownerSignature: null,
              ownerTypedName: '',
              ownerSignedAt: null,
              contractorSignature: null,
              contractorTypedName: '',
              contractorSignedAt: null
            },
            paymentMethod: null,
            agreedToTerms: false,
            depositPaid: false,
            contractSent: false,
            contractSentAt: null
          }
        });
      },

      // Persistence
      saveEstimate: () => {
        // Zustand persist middleware handles this automatically
        console.log('Estimate saved to localStorage');
      },

      loadEstimate: () => {
        // Zustand persist middleware handles this automatically
        console.log('Estimate loaded from localStorage');
        get().calculatePricing();
      }
    }),
    {
      name: '137-estimator-storage',
      partialize: (state) => ({
        customer: state.customer,
        building: state.building,
        accessories: state.accessories,
        doorPositions: state.doorPositions,
        colors: state.colors,
        concrete: state.concrete,
        contract: state.contract
      }),
      // Merge persisted state with initial state to handle schema migrations
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<EstimatorStore>;
        return {
          ...currentState,
          ...persisted,
          // Deep merge customer to ensure new address fields have defaults
          customer: {
            ...initialCustomer,
            ...(persisted.customer || {}),
            billingAddress: {
              ...emptyAddress,
              ...(persisted.customer?.billingAddress || {})
            },
            constructionAddress: {
              ...emptyAddress,
              ...(persisted.customer?.constructionAddress || {})
            }
          },
          // Deep merge building to ensure new fields have defaults
          building: {
            ...initialBuilding,
            ...(persisted.building || {}),
            breezeway: {
              ...initialBuilding.breezeway,
              ...(persisted.building?.breezeway || {})
            }
          },
          // Deep merge accessories
          accessories: {
            ...initialAccessories,
            ...(persisted.accessories || {})
          },
          // Deep merge colors
          colors: {
            ...initialColors,
            ...(persisted.colors || {})
          },
          // Deep merge concrete
          concrete: {
            ...initialConcrete,
            ...(persisted.concrete || {})
          },
          // Deep merge contract
          contract: {
            ...initialContract,
            ...(persisted.contract || {}),
            sections: {
              ...initialContract.sections,
              ...(persisted.contract?.sections || {})
            },
            signatures: {
              ...initialContract.signatures,
              ...(persisted.contract?.signatures || {})
            }
          }
        };
      }
    }
  )
);
