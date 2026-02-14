import { motion } from 'framer-motion';
import { User, MapPin, Phone, Mail } from 'lucide-react';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { itemVariants } from '../../../animations/variants';

export function CustomerInfoSection() {
  const { customer, building, pricing } = useEstimatorStore();

  const formatAddress = (address: { street: string; city: string; state: string; zip: string }) => {
    if (!address.street) return 'Not provided';
    return `${address.street}, ${address.city}, ${address.state} ${address.zip}`;
  };

  return (
    <motion.div variants={itemVariants} className="space-y-6">
      {/* Section Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-2xl font-bold text-white">Customer Information</h2>
        <p className="text-[#A3A3A3] mt-1">Please verify your information below</p>
      </div>

      {/* Customer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Information */}
        <div className="bg-[#111111] rounded-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-[#14B8A6]" />
            Contact Details
          </h3>

          <div className="space-y-3">
            <div>
              <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Full Name</span>
              <p className="text-white font-medium">{customer.name || 'Not provided'}</p>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#A3A3A3]" />
              <div>
                <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Email</span>
                <p className="text-white">{customer.email || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#A3A3A3]" />
              <div>
                <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Phone</span>
                <p className="text-white">{customer.phone || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="bg-[#111111] rounded-xl border border-white/10 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#14B8A6]" />
            Addresses
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Billing Address</span>
              <p className="text-white">{formatAddress(customer.billingAddress)}</p>
            </div>

            <div>
              <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Construction Site Address</span>
              <p className="text-white">
                {customer.sameAsMailingAddress
                  ? formatAddress(customer.billingAddress)
                  : formatAddress(customer.constructionAddress)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Project Summary */}
      <div className="bg-[#111111] rounded-xl border border-white/10 p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Project Summary</h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
            <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Building Size</span>
            <p className="text-xl font-bold text-white mt-1">
              {building.width}' × {building.length}'
            </p>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
            <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Eave Height</span>
            <p className="text-xl font-bold text-white mt-1">{building.height}'</p>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
            <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Square Feet</span>
            <p className="text-xl font-bold text-white mt-1">
              {(building.width * building.length).toLocaleString()}
            </p>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 text-center">
            <span className="text-xs text-[#A3A3A3] uppercase tracking-wide">Total Estimate</span>
            <p className="text-xl font-bold text-[#14B8A6] mt-1">
              ${pricing.grandTotal.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Notice */}
      <div className="bg-[#14B8A6]/10 border border-[#14B8A6]/20 rounded-xl p-4">
        <p className="text-sm text-[#14B8A6]">
          Please review all information carefully before proceeding. By continuing, you confirm
          that the information above is accurate and complete.
        </p>
      </div>
    </motion.div>
  );
}

export default CustomerInfoSection;
