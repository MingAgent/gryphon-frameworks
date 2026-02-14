// Contract Section Definitions
export const CONTRACT_SECTIONS = [
  { id: 'customerInfo', title: 'Customer Information', requiresAck: false },
  { id: 'projectOverview', title: '1. Project Overview', requiresAck: true },
  { id: 'paymentTerms', title: '2. Payment Terms', requiresAck: true },
  { id: 'timeline', title: '3. Timeline & Changes', requiresAck: true },
  { id: 'responsibilities', title: '4. Responsibilities', requiresAck: true },
  { id: 'warranties', title: '5. Warranties & Insurance', requiresAck: true },
  { id: 'legalProvisions', title: '6. Legal Provisions', requiresAck: true },
  { id: 'signatures', title: '7. Final Acknowledgment', requiresAck: false }
] as const;

// Contract Terms Content
export const CONTRACT_TERMS = {
  projectOverview: {
    title: 'Project Overview',
    sections: [
      {
        heading: 'DEFINITIONS',
        content: [
          '"Owner" means the property owner signing this Contract.',
          '"Contractor" means 13|7 FrameWorks, LLC.',
          '"Work" means all labor, materials, equipment, and services required to complete the Project.',
          '"Contract Sum" means the total price stated in this Contract for the Work.',
          '"Substantial Completion" means the Work is sufficiently complete so the Owner can occupy or use the Project for its intended purpose.'
        ]
      },
      {
        heading: 'SCOPE OF CONTRACT',
        content: [
          'This Contract Agreement covers Improvements only from drip edge to drip edge.',
          'The scope includes the metal building structure as configured in the estimate. Any work outside this scope requires a written Change Order.'
        ]
      },
      {
        heading: 'PLANS & REVISIONS',
        content: [
          'Owner has 3 opportunities to redo/amend/revise the Plans before Work commences at no cost.',
          'On the 4th revision and every revision thereafter: $550.00 per revision.',
          'All requested revisions after work commences shall be a Change Order.'
        ]
      }
    ]
  },

  paymentTerms: {
    title: 'Payment Terms',
    sections: [
      {
        heading: 'DRAW SCHEDULE',
        content: [
          'Draw 1 (30%): Due upon contract signing',
          'Draw 2 (30%): Due upon delivery of materials to job site',
          'Draw 3 (30%): Due upon completion of framing',
          'Final Draw (10%): Due upon Substantial Completion'
        ]
      },
      {
        heading: 'MATERIAL COSTS',
        content: [
          'Material prices are subject to market fluctuations. If material costs increase more than 5% between contract signing and material ordering, Owner will be notified and may:',
          '• Accept the price increase via Change Order',
          '• Cancel the contract with refund of deposits less administrative fees'
        ]
      },
      {
        heading: 'ADDITIONAL COSTS',
        content: [
          "Contractor's Risk Policy, Dirt Work & Pump Truck:",
          'These expenses are at cost plus 20% due from Owner.',
          'Payment is due before the delivery of Foundation Material.'
        ]
      }
    ]
  },

  timeline: {
    title: 'Timeline & Changes',
    sections: [
      {
        heading: 'CHANGE ORDERS',
        content: [
          'Changes to the Work require a written Change Order signed by both parties.',
          'Change Orders will specify:',
          '• Description of the change',
          '• Adjustment to Contract Sum',
          '• Adjustment to schedule (if any)',
          'Work on changes shall not begin until the Change Order is signed and any required payment is received.'
        ]
      },
      {
        heading: 'DELAYS & FORCE MAJEURE',
        content: [
          'Contractor shall not be liable for delays caused by:',
          '• Weather conditions unsuitable for construction',
          '• Acts of God, natural disasters, or emergencies',
          "• Material shortages or supplier delays beyond Contractor's control",
          '• Government actions, inspections, or permit delays',
          '• Owner-requested changes or Owner-caused delays',
          'The project timeline will be extended by the duration of any such delays.'
        ]
      }
    ]
  },

  responsibilities: {
    title: 'Responsibilities',
    sections: [
      {
        heading: 'CONTRACTOR RESPONSIBILITIES',
        content: [
          'Contractor shall:',
          '• Perform all Work in a good and workmanlike manner',
          '• Comply with all applicable building codes and regulations',
          '• Obtain necessary permits (unless otherwise agreed)',
          '• Maintain a clean and safe work site',
          '• Provide all labor, materials, and equipment',
          '• Coordinate with subcontractors as needed'
        ]
      },
      {
        heading: 'OWNER RESPONSIBILITIES',
        content: [
          'Owner shall:',
          '• Provide clear access to the construction site',
          '• Ensure the site is cleared and graded as required',
          '• Obtain any required property surveys or easements',
          '• Make timely payments per the draw schedule',
          '• Respond to questions and approve selections promptly',
          '• Not interfere with Work or direct workers'
        ]
      },
      {
        heading: 'SITE CONDITIONS',
        content: [
          'Owner represents that:',
          '• The property lines and setbacks are accurate',
          '• There are no underground utilities, septic systems, or other obstructions in the construction area',
          '• The site has proper drainage',
          'Any unforeseen conditions requiring additional work shall be handled via Change Order.'
        ]
      }
    ]
  },

  warranties: {
    title: 'Warranties & Insurance',
    sections: [
      {
        heading: 'WORKMANSHIP WARRANTY',
        content: [
          'Contractor warrants all workmanship for a period of ONE (1) YEAR from Substantial Completion.',
          "This warranty covers defects in Contractor's workmanship only.",
          'Owner must notify Contractor in writing of any warranty claim within the warranty period.'
        ]
      },
      {
        heading: 'MATERIAL WARRANTIES',
        content: [
          "Material warranties are provided by the manufacturers and are passed through to Owner.",
          'Roof panels: Manufacturer warranty (typically 40 years)',
          'Paint finish: Manufacturer warranty (typically 40 years)',
          'Contractor shall provide copies of all manufacturer warranties upon request.'
        ]
      },
      {
        heading: 'EXCLUSIONS',
        content: [
          'Warranties do not cover:',
          '• Normal wear and tear',
          '• Damage from misuse, neglect, or alterations',
          '• Damage from natural disasters or acts of God',
          '• Cosmetic issues that do not affect structural integrity',
          '• Issues caused by settlement or ground movement'
        ]
      },
      {
        heading: 'INSURANCE',
        content: [
          'Contractor maintains general liability insurance and workers compensation insurance.',
          "Owner is responsible for property insurance on the structure upon Substantial Completion.",
          'Owner should notify their insurance company of the new construction.'
        ]
      }
    ]
  },

  legalProvisions: {
    title: 'Legal Provisions',
    sections: [
      {
        heading: 'DISPUTE RESOLUTION',
        content: [
          'Any disputes arising from this Contract shall first be addressed through good faith negotiation.',
          'If negotiation fails, disputes shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.',
          'The prevailing party shall be entitled to recover reasonable attorney fees and costs.'
        ]
      },
      {
        heading: 'LIMITATION OF LIABILITY',
        content: [
          "Contractor's total liability under this Contract shall not exceed the Contract Sum.",
          'Contractor shall not be liable for any indirect, incidental, or consequential damages.',
          'This limitation does not apply to gross negligence or willful misconduct.'
        ]
      },
      {
        heading: 'TERMINATION',
        content: [
          'Either party may terminate this Contract for material breach after providing 14 days written notice and opportunity to cure.',
          'Upon termination, Owner shall pay for all Work completed and materials ordered.',
          'If Owner terminates without cause, Owner shall also pay Contractor 15% of the remaining Contract Sum as liquidated damages.'
        ]
      },
      {
        heading: 'GOVERNING LAW',
        content: [
          'This Contract shall be governed by the laws of the State of Texas.',
          'Venue for any legal action shall be in the county where the Work is performed.',
          'If any provision of this Contract is found unenforceable, the remaining provisions shall remain in effect.'
        ]
      },
      {
        heading: 'ENTIRE AGREEMENT',
        content: [
          'This Contract, including any attachments and Change Orders, constitutes the entire agreement between the parties.',
          'No oral agreements or representations shall be binding.',
          'Any modifications must be in writing and signed by both parties.'
        ]
      }
    ]
  }
} as const;

// Company Information
export const COMPANY_INFO = {
  name: '13|7 FrameWorks',
  legalName: '13|7 FrameWorks, LLC',
  address: '',
  phone: '',
  email: '',
  website: 'https://137frameworks.com'
} as const;

// Payment Methods
export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'check', label: 'Check' },
  { id: 'card', label: 'Credit/Debit Card' },
  { id: 'financing', label: 'Financing' },
  { id: 'ach', label: 'ACH Transfer' }
] as const;
