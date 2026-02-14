/**
 * BOM Export Button - INTERNAL USE ONLY
 *
 * This component exports Bill of Materials with full cost/margin data.
 * The exported file is CONFIDENTIAL and should never be shared with clients.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, AlertTriangle, Download, Shield, X } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { generateBOM, exportBOMToExcel } from '../../../utils/export/bomGenerator';
import Button from '../../common/Button/Button';

interface BOMExportButtonProps {
  className?: string;
}

export function BOMExportButton({ className = '' }: BOMExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);

  const state = useEstimatorStore();

  const handleExportClick = () => {
    // Show safety warning before export
    setShowWarning(true);
  };

  const handleConfirmExport = async () => {
    setShowWarning(false);
    setIsExporting(true);

    try {
      // Generate the BOM from current state
      const bom = generateBOM(state);

      // Export to Excel
      const blob = await exportBOMToExcel(bom);

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BOM-${bom.quoteNumber}-INTERNAL.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    } catch (error) {
      console.error('BOM export failed:', error);
      alert('Failed to export BOM. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className={`border-red-300 text-red-700 hover:bg-red-50 ${className}`}
        onClick={handleExportClick}
        disabled={isExporting}
        leftIcon={<FileSpreadsheet className="w-4 h-4" />}
      >
        {isExporting ? 'Exporting...' : 'Export Internal BOM'}
      </Button>

      {/* Safety Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWarning(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Internal Document Warning
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    This Bill of Materials contains <strong>confidential cost and margin data</strong>.
                    It should ONLY be used internally and NEVER shared with clients.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-red-800 text-sm font-medium mb-2">
                      <Shield className="w-4 h-4" />
                      Safety Rules
                    </div>
                    <ul className="text-red-700 text-xs space-y-1">
                      <li>• Do NOT email to client addresses</li>
                      <li>• Do NOT share via public links</li>
                      <li>• Store in internal-docs folder only</li>
                      <li>• RFPs (without pricing) are safe for distributors</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWarning(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleConfirmExport}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      leftIcon={<Download className="w-4 h-4" />}
                    >
                      I Understand, Export
                    </Button>
                  </div>
                </div>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {exportComplete && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>BOM exported successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default BOMExportButton;
