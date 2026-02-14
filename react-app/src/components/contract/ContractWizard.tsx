import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, FileText, Download, Send, Loader2 } from 'lucide-react';
import { ContractProgress } from './ContractProgress';
import {
  CustomerInfoSection,
  ProjectOverviewSection,
  PaymentTermsSection,
  TimelineSection,
  ResponsibilitiesSection,
  WarrantiesSection,
  LegalProvisionsSection,
  SignaturesSection
} from './sections';
import { CONTRACT_SECTIONS } from '../../constants/contractTerms';
import { useEstimatorStore } from '../../store/estimatorStore';
import { downloadContractPdf } from '../../utils/pdf/contractPdf';
import Button from '../common/Button/Button';
import { containerVariants } from '../../animations/variants';
import type { ContractConfig, PaymentMethod } from '../../types/estimator';

// Types for section state
interface SectionState {
  checked: boolean;
  initialed: boolean;
  initialsData: string | null;
}

interface SignatureState {
  ownerSignature: string | null;
  ownerTypedName: string;
  contractorSignature: string | null;
  contractorTypedName: string;
}

export function ContractWizard() {
  const { customer, building, accessories, colors, concrete, pricing } = useEstimatorStore();

  // Go back to estimate view
  const handleBackToEstimate = () => {
    window.dispatchEvent(new Event('hideContract'));
  };

  // Local state for contract sections
  const [currentSection, setCurrentSection] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Section acknowledgment states
  const [sectionStates, setSectionStates] = useState<Record<string, SectionState>>({
    projectOverview: { checked: false, initialed: false, initialsData: null },
    paymentTerms: { checked: false, initialed: false, initialsData: null },
    timeline: { checked: false, initialed: false, initialsData: null },
    responsibilities: { checked: false, initialed: false, initialsData: null },
    warranties: { checked: false, initialed: false, initialsData: null },
    legalProvisions: { checked: false, initialed: false, initialsData: null }
  });

  // Signature states
  const [signatures, setSignatures] = useState<SignatureState>({
    ownerSignature: null,
    ownerTypedName: '',
    contractorSignature: null,
    contractorTypedName: ''
  });

  // Check if a section is complete
  const isSectionComplete = useCallback((sectionId: string): boolean => {
    const section = CONTRACT_SECTIONS.find(s => s.id === sectionId);
    if (!section) return false;

    // Customer info section doesn't require acknowledgment
    if (!section.requiresAck) {
      if (sectionId === 'customerInfo') {
        return customer.name.trim().length > 0;
      }
      if (sectionId === 'signatures') {
        return (
          signatures.ownerSignature !== null &&
          signatures.ownerTypedName.trim().length > 0 &&
          signatures.contractorSignature !== null &&
          signatures.contractorTypedName.trim().length > 0 &&
          paymentMethod !== null
        );
      }
      return true;
    }

    // Sections that require acknowledgment
    const state = sectionStates[sectionId];
    return state?.checked && state?.initialed;
  }, [customer.name, signatures, paymentMethod, sectionStates]);

  // Get completed sections
  const completedSections = useMemo(() => {
    const completed = new Set<string>();
    CONTRACT_SECTIONS.forEach(section => {
      if (isSectionComplete(section.id)) {
        completed.add(section.id);
      }
    });
    return completed;
  }, [isSectionComplete]);

  // Check if all acknowledgment sections are complete
  const allAckSectionsComplete = useMemo(() => {
    return CONTRACT_SECTIONS
      .filter(s => s.requiresAck)
      .every(s => isSectionComplete(s.id));
  }, [isSectionComplete]);

  // Check if entire contract is complete
  const isContractComplete = useMemo(() => {
    return completedSections.size === CONTRACT_SECTIONS.length;
  }, [completedSections]);

  // Check if current section allows navigation
  const canProceed = useMemo(() => {
    const current = CONTRACT_SECTIONS[currentSection];
    if (!current) return false;

    // Customer info just needs name
    if (current.id === 'customerInfo') {
      return customer.name.trim().length > 0;
    }

    // Signature section - check all fields
    if (current.id === 'signatures') {
      return isSectionComplete('signatures');
    }

    // Acknowledgment sections need checkbox + initials
    if (current.requiresAck) {
      return isSectionComplete(current.id);
    }

    return true;
  }, [currentSection, customer.name, isSectionComplete]);

  // Handle section state updates
  const handleCheckChange = (sectionId: string, checked: boolean) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], checked }
    }));
  };

  const handleInitialsChange = (sectionId: string, hasInitials: boolean, dataUrl: string | null) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: {
        ...prev[sectionId],
        initialed: hasInitials,
        initialsData: dataUrl
      }
    }));
  };

  // Handle signature updates
  const handleOwnerSignature = (signature: string | null, typedName: string) => {
    setSignatures(prev => ({
      ...prev,
      ownerSignature: signature,
      ownerTypedName: typedName
    }));
  };

  const handleContractorSignature = (signature: string | null, typedName: string) => {
    setSignatures(prev => ({
      ...prev,
      contractorSignature: signature,
      contractorTypedName: typedName
    }));
  };

  // Navigation
  const goToNextSection = () => {
    if (currentSection < CONTRACT_SECTIONS.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const goToPrevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const goToSection = (index: number) => {
    setCurrentSection(index);
  };

  // Build contract config from local state for PDF
  const buildContractConfig = (): ContractConfig => {
    return {
      currentSection,
      sections: {
        projectOverview: {
          checked: sectionStates.projectOverview.checked,
          initialed: sectionStates.projectOverview.initialed,
          initialsData: sectionStates.projectOverview.initialsData,
          timestamp: sectionStates.projectOverview.checked ? new Date().toISOString() : null
        },
        paymentTerms: {
          checked: sectionStates.paymentTerms.checked,
          initialed: sectionStates.paymentTerms.initialed,
          initialsData: sectionStates.paymentTerms.initialsData,
          timestamp: sectionStates.paymentTerms.checked ? new Date().toISOString() : null
        },
        timeline: {
          checked: sectionStates.timeline.checked,
          initialed: sectionStates.timeline.initialed,
          initialsData: sectionStates.timeline.initialsData,
          timestamp: sectionStates.timeline.checked ? new Date().toISOString() : null
        },
        responsibilities: {
          checked: sectionStates.responsibilities.checked,
          initialed: sectionStates.responsibilities.initialed,
          initialsData: sectionStates.responsibilities.initialsData,
          timestamp: sectionStates.responsibilities.checked ? new Date().toISOString() : null
        },
        warranties: {
          checked: sectionStates.warranties.checked,
          initialed: sectionStates.warranties.initialed,
          initialsData: sectionStates.warranties.initialsData,
          timestamp: sectionStates.warranties.checked ? new Date().toISOString() : null
        },
        legalProvisions: {
          checked: sectionStates.legalProvisions.checked,
          initialed: sectionStates.legalProvisions.initialed,
          initialsData: sectionStates.legalProvisions.initialsData,
          timestamp: sectionStates.legalProvisions.checked ? new Date().toISOString() : null
        }
      },
      signatures: {
        ownerSignature: signatures.ownerSignature,
        ownerTypedName: signatures.ownerTypedName,
        ownerSignedAt: signatures.ownerSignature ? new Date().toISOString() : null,
        contractorSignature: signatures.contractorSignature,
        contractorTypedName: signatures.contractorTypedName,
        contractorSignedAt: signatures.contractorSignature ? new Date().toISOString() : null
      },
      paymentMethod: paymentMethod as PaymentMethod,
      agreedToTerms: isContractComplete,
      depositPaid: false,
      contractSent: false,
      contractSentAt: null
    };
  };

  // Download PDF handler
  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      await downloadContractPdf({
        customer,
        building,
        accessories,
        colors,
        concrete,
        pricing,
        contract: buildContractConfig()
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('There was an error generating the PDF. Please try again.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Submit contract handler
  const handleSubmitContract = async () => {
    setIsSubmitting(true);
    try {
      // Download the PDF first
      await downloadContractPdf({
        customer,
        building,
        accessories,
        colors,
        concrete,
        pricing,
        contract: buildContractConfig()
      });

      // Here you would also send to a backend, email, etc.
      alert('Contract submitted successfully! A copy has been downloaded to your device.');
    } catch (error) {
      console.error('Error submitting contract:', error);
      alert('There was an error submitting the contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current section content
  const renderSection = () => {
    const sectionId = CONTRACT_SECTIONS[currentSection]?.id;

    switch (sectionId) {
      case 'customerInfo':
        return <CustomerInfoSection />;

      case 'projectOverview':
        return (
          <ProjectOverviewSection
            isChecked={sectionStates.projectOverview.checked}
            isInitialed={sectionStates.projectOverview.initialed}
            initialsData={sectionStates.projectOverview.initialsData}
            onCheckChange={(checked) => handleCheckChange('projectOverview', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('projectOverview', hasInitials, dataUrl)}
          />
        );

      case 'paymentTerms':
        return (
          <PaymentTermsSection
            isChecked={sectionStates.paymentTerms.checked}
            isInitialed={sectionStates.paymentTerms.initialed}
            initialsData={sectionStates.paymentTerms.initialsData}
            onCheckChange={(checked) => handleCheckChange('paymentTerms', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('paymentTerms', hasInitials, dataUrl)}
          />
        );

      case 'timeline':
        return (
          <TimelineSection
            isChecked={sectionStates.timeline.checked}
            isInitialed={sectionStates.timeline.initialed}
            initialsData={sectionStates.timeline.initialsData}
            onCheckChange={(checked) => handleCheckChange('timeline', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('timeline', hasInitials, dataUrl)}
          />
        );

      case 'responsibilities':
        return (
          <ResponsibilitiesSection
            isChecked={sectionStates.responsibilities.checked}
            isInitialed={sectionStates.responsibilities.initialed}
            initialsData={sectionStates.responsibilities.initialsData}
            onCheckChange={(checked) => handleCheckChange('responsibilities', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('responsibilities', hasInitials, dataUrl)}
          />
        );

      case 'warranties':
        return (
          <WarrantiesSection
            isChecked={sectionStates.warranties.checked}
            isInitialed={sectionStates.warranties.initialed}
            initialsData={sectionStates.warranties.initialsData}
            onCheckChange={(checked) => handleCheckChange('warranties', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('warranties', hasInitials, dataUrl)}
          />
        );

      case 'legalProvisions':
        return (
          <LegalProvisionsSection
            isChecked={sectionStates.legalProvisions.checked}
            isInitialed={sectionStates.legalProvisions.initialed}
            initialsData={sectionStates.legalProvisions.initialsData}
            onCheckChange={(checked) => handleCheckChange('legalProvisions', checked)}
            onInitialsChange={(hasInitials, dataUrl) => handleInitialsChange('legalProvisions', hasInitials, dataUrl)}
          />
        );

      case 'signatures':
        return (
          <SignaturesSection
            ownerSignature={signatures.ownerSignature}
            ownerTypedName={signatures.ownerTypedName}
            contractorSignature={signatures.contractorSignature}
            contractorTypedName={signatures.contractorTypedName}
            paymentMethod={paymentMethod}
            onOwnerSignatureChange={handleOwnerSignature}
            onContractorSignatureChange={handleContractorSignature}
            onPaymentMethodChange={setPaymentMethod}
            allSectionsComplete={allAckSectionsComplete}
          />
        );

      default:
        return null;
    }
  };

  const isLastSection = currentSection === CONTRACT_SECTIONS.length - 1;

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-[#0A0A0A]"
    >
      {/* Header */}
      <div className="bg-[#111111] border-b border-white/10 px-4 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-[#14B8A6]" />
            <div>
              <h1 className="text-lg font-bold text-white">Contract Agreement</h1>
              <p className="text-xs text-[#A3A3A3]">
                {building.width}' × {building.length}' Metal Building • ${pricing.grandTotal.toLocaleString()}
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToEstimate}
            className="text-[#A3A3A3] hover:text-white"
          >
            Back to Estimate
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Progress */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <ContractProgress
              currentSection={currentSection}
              completedSections={completedSections}
              onSectionClick={goToSection}
            />
          </div>

          {/* Main Section Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderSection()}
              </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
              <Button
                variant="outline"
                onClick={goToPrevSection}
                disabled={currentSection === 0}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Previous
              </Button>

              <div className="flex items-center gap-3">
                {isLastSection && isContractComplete ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleDownloadPdf}
                      disabled={isGeneratingPdf}
                      leftIcon={isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                      className="border-[#14B8A6] text-[#14B8A6] hover:bg-[#14B8A6]/10"
                    >
                      {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSubmitContract}
                      disabled={isSubmitting}
                      leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Contract'}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={goToNextSection}
                    disabled={!canProceed || isLastSection}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                    className="bg-[#14B8A6] hover:bg-[#14B8A6]/90"
                  >
                    {canProceed ? 'Continue' : 'Complete Section to Continue'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ContractWizard;
