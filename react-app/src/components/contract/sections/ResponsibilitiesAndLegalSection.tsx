import { motion } from 'framer-motion';
import { Users, Shield, Scale } from 'lucide-react';
import { ContractSection, TermSection } from '../ContractSection';
import { CONTRACT_TERMS } from '../../../constants/contractTerms';

interface ResponsibilitiesAndLegalSectionProps {
  isChecked: boolean;
  isInitialed: boolean;
  initialsData: string | null;
  onCheckChange: (checked: boolean) => void;
  onInitialsChange: (hasInitials: boolean, dataUrl: string | null) => void;
}

export function ResponsibilitiesAndLegalSection({
  isChecked,
  isInitialed,
  initialsData,
  onCheckChange,
  onInitialsChange
}: ResponsibilitiesAndLegalSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Section Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">2. Responsibilities & Legal</h2>
        <p className="text-gray-500 mt-1">
          Please read and acknowledge responsibilities, warranties, and legal provisions
        </p>
      </div>

      {/* Combined Contract Terms */}
      <ContractSection
        requiresAck={true}
        isChecked={isChecked}
        isInitialed={isInitialed}
        initialsData={initialsData}
        onCheckChange={onCheckChange}
        onInitialsChange={onInitialsChange}
      >
        <div className="space-y-8">
          {/* Responsibilities */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Users className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Responsibilities</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.responsibilities.sections.map((section, idx) => (
                <TermSection
                  key={`resp-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>
          </div>

          {/* Warranties & Insurance */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Shield className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Warranties & Insurance</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.warranties.sections.map((section, idx) => (
                <TermSection
                  key={`warranty-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>

            {/* Warranty Highlight Box */}
            <div className="mt-4 bg-[#14B8A6]/10 border border-[#14B8A6]/30 rounded-lg p-4">
              <p className="text-sm text-[#14B8A6] font-medium">
                Summary: 1-year workmanship warranty, 40-year manufacturer warranties on materials
              </p>
            </div>
          </div>

          {/* Legal Provisions */}
          <div>
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200">
              <Scale className="w-5 h-5 text-[#14B8A6]" />
              <h3 className="text-lg font-semibold text-gray-900">Legal Provisions</h3>
            </div>
            <div className="space-y-6">
              {CONTRACT_TERMS.legalProvisions.sections.map((section, idx) => (
                <TermSection
                  key={`legal-${idx}`}
                  heading={section.heading}
                  content={section.content}
                />
              ))}
            </div>

            {/* Important Legal Notice */}
            <div className="mt-4 bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
              <p className="text-sm text-orange-400 font-medium mb-2">
                Important Notice
              </p>
              <p className="text-xs text-gray-500">
                This contract is governed by the laws of the State of Texas. By signing, you agree to
                binding arbitration for dispute resolution and waive your right to a jury trial.
              </p>
            </div>
          </div>
        </div>
      </ContractSection>
    </motion.div>
  );
}

export default ResponsibilitiesAndLegalSection;
