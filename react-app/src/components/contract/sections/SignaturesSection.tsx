import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, AlertCircle, CreditCard } from 'lucide-react';
import { SignaturePad } from '../SignaturePad';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { PAYMENT_METHODS, COMPANY_INFO } from '../../../constants/contractTerms';
import { itemVariants } from '../../../animations/variants';

interface SignaturesSectionProps {
  ownerSignature: string | null;
  ownerTypedName: string;
  contractorSignature: string | null;
  contractorTypedName: string;
  paymentMethod: string | null;
  onOwnerSignatureChange: (signature: string | null, typedName: string) => void;
  onContractorSignatureChange: (signature: string | null, typedName: string) => void;
  onPaymentMethodChange: (method: string) => void;
  allSectionsComplete: boolean;
}

export function SignaturesSection({
  ownerSignature,
  ownerTypedName,
  contractorSignature,
  contractorTypedName,
  paymentMethod,
  onOwnerSignatureChange,
  onContractorSignatureChange,
  onPaymentMethodChange,
  allSectionsComplete
}: SignaturesSectionProps) {
  const { customer, pricing } = useEstimatorStore();
  const [localOwnerName, setLocalOwnerName] = useState(ownerTypedName || customer.name || '');
  const [localContractorName, setLocalContractorName] = useState(contractorTypedName || '');

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleOwnerSignatureChange = (_hasSignature: boolean, dataUrl: string | null) => {
    onOwnerSignatureChange(dataUrl, localOwnerName);
  };

  const handleContractorSignatureChange = (_hasSignature: boolean, dataUrl: string | null) => {
    onContractorSignatureChange(dataUrl, localContractorName);
  };

  const isOwnerComplete = ownerSignature && localOwnerName.trim().length > 0;
  const isContractorComplete = contractorSignature && localContractorName.trim().length > 0;
  const isPaymentSelected = paymentMethod !== null;

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">7. Final Acknowledgment & Signatures</h2>
        <p className="text-[#A3A3A3] mt-1">
          Complete the contract by providing signatures below
        </p>
      </div>

      {/* Completion Check */}
      {!allSectionsComplete && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Incomplete Sections</p>
            <p className="text-sm text-red-300 mt-1">
              Please complete all previous sections (checkbox and initials) before signing the contract.
            </p>
          </div>
        </div>
      )}

      {/* Contract Summary */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Contract Summary</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-[#A3A3A3]">Contract Date:</span>
            <p className="text-white font-medium">{currentDate}</p>
          </div>
          <div>
            <span className="text-[#A3A3A3]">Contract Sum:</span>
            <p className="text-[#14B8A6] font-bold text-xl">${pricing.grandTotal.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-[#A3A3A3]">Contractor:</span>
            <p className="text-white font-medium">{COMPANY_INFO.legalName}</p>
          </div>
          <div>
            <span className="text-[#A3A3A3]">Owner:</span>
            <p className="text-white font-medium">{customer.name || 'Not provided'}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-sm text-[#A3A3A3]">
            By signing below, both parties agree to be bound by all terms and conditions
            set forth in this Contract Agreement.
          </p>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#14B8A6]" />
          Payment Method for First Draw
        </h3>

        <p className="text-sm text-[#A3A3A3] mb-4">
          Select how you would like to pay the first draw (${(pricing.grandTotal * 0.30).toLocaleString()}) upon contract signing:
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {PAYMENT_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => onPaymentMethodChange(method.id)}
              className={`
                p-3 rounded-lg border-2 text-sm font-medium transition-all
                ${paymentMethod === method.id
                  ? 'border-[#14B8A6] bg-[#14B8A6]/10 text-[#14B8A6]'
                  : 'border-white/10 text-[#A3A3A3] hover:border-white/30 hover:text-white'
                }
              `}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Owner Signature */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Owner Signature</h3>
          {isOwnerComplete && (
            <span className="flex items-center gap-1 text-[#14B8A6] text-sm">
              <Check className="w-4 h-4" />
              Complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">
              Print Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={localOwnerName}
              onChange={(e) => {
                setLocalOwnerName(e.target.value);
                if (ownerSignature) {
                  onOwnerSignatureChange(ownerSignature, e.target.value);
                }
              }}
              placeholder="Enter your full legal name"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-[#666] focus:border-[#14B8A6] focus:outline-none transition-colors"
              disabled={!allSectionsComplete}
            />
          </div>

          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">Date</label>
            <input
              type="text"
              value={currentDate}
              readOnly
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white/50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-[#A3A3A3] mb-2">
            Signature <span className="text-red-400">*</span>
          </label>
          <SignaturePad
            label="Owner Signature"
            required
            initialValue={ownerSignature}
            onSignatureChange={handleOwnerSignatureChange}
            disabled={!allSectionsComplete}
          />
        </div>
      </div>

      {/* Contractor Signature */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Contractor Signature</h3>
          {isContractorComplete && (
            <span className="flex items-center gap-1 text-[#14B8A6] text-sm">
              <Check className="w-4 h-4" />
              Complete
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">
              Print Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={localContractorName}
              onChange={(e) => {
                setLocalContractorName(e.target.value);
                if (contractorSignature) {
                  onContractorSignatureChange(contractorSignature, e.target.value);
                }
              }}
              placeholder="Contractor representative name"
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white placeholder-[#666] focus:border-[#14B8A6] focus:outline-none transition-colors"
              disabled={!allSectionsComplete}
            />
          </div>

          <div>
            <label className="block text-sm text-[#A3A3A3] mb-2">Date</label>
            <input
              type="text"
              value={currentDate}
              readOnly
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-white/10 rounded-lg text-white/50"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm text-[#A3A3A3] mb-2">
            Signature <span className="text-red-400">*</span>
          </label>
          <SignaturePad
            label="Contractor Signature"
            required
            initialValue={contractorSignature}
            onSignatureChange={handleContractorSignatureChange}
            disabled={!allSectionsComplete}
          />
        </div>

        <p className="mt-4 text-xs text-[#A3A3A3]">
          Signing on behalf of {COMPANY_INFO.legalName}
        </p>
      </div>

      {/* Final Notice */}
      {isOwnerComplete && isContractorComplete && isPaymentSelected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-xl p-6 text-center"
        >
          <Check className="w-12 h-12 text-[#14B8A6] mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white mb-2">Contract Ready for Submission</h3>
          <p className="text-[#A3A3A3]">
            All signatures have been collected. Click "Submit Contract" to finalize and
            download your signed contract.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

export default SignaturesSection;
