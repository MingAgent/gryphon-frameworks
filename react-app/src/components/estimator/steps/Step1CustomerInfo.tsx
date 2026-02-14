import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Building2, Check } from 'lucide-react';
import Input from '../../common/Input/Input';
import { useEstimatorStore } from '../../../store/estimatorStore';
import { containerVariants, itemVariants } from '../../../animations/variants';

export function Step1CustomerInfo() {
  const { customer, setCustomerInfo } = useEstimatorStore();

  // Handle checkbox for "same as construction address"
  const handleSameAsConstructionChange = (checked: boolean) => {
    setCustomerInfo({ sameAsMailingAddress: checked });
    if (checked) {
      setCustomerInfo({
        billingAddress: { ...customer.constructionAddress }
      });
    }
  };

  // Update construction address field
  const updateConstructionAddress = (field: string, value: string) => {
    const newConstructionAddress = { ...customer.constructionAddress, [field]: value };
    setCustomerInfo({ constructionAddress: newConstructionAddress });

    // If same as construction is checked, also update billing
    if (customer.sameAsMailingAddress) {
      setCustomerInfo({ billingAddress: { ...newConstructionAddress } });
    }
  };

  // Update billing address field
  const updateBillingAddress = (field: string, value: string) => {
    setCustomerInfo({
      billingAddress: { ...customer.billingAddress, [field]: value }
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-8"
    >
      <motion.p variants={itemVariants} className="text-[#A3A3A3]">
        Please provide your contact information so we can prepare your custom estimate.
        <span className="text-[#FF6A00] ml-1">*</span> indicates required fields.
      </motion.p>

      {/* Contact Information */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <User className="w-5 h-5 text-[#FF6A00]" />
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Full Name *"
            placeholder="John Smith"
            value={customer.name}
            onChange={(e) => setCustomerInfo({ name: e.target.value })}
            leftIcon={<User className="w-5 h-5" />}
            required
          />

          <Input
            label="Email Address *"
            type="email"
            placeholder="john@example.com"
            value={customer.email}
            onChange={(e) => setCustomerInfo({ email: e.target.value })}
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            label="Phone Number *"
            type="tel"
            placeholder="(555) 123-4567"
            value={customer.phone}
            onChange={(e) => setCustomerInfo({ phone: e.target.value })}
            leftIcon={<Phone className="w-5 h-5" />}
            required
          />
        </div>
      </motion.div>

      {/* Construction Site Address - FIRST */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#FF6A00]" />
          Construction Site Address
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <Input
              label="Street Address *"
              placeholder="456 Industrial Blvd"
              value={customer.constructionAddress.street}
              onChange={(e) => updateConstructionAddress('street', e.target.value)}
              leftIcon={<Building2 className="w-5 h-5" />}
              required
            />
          </div>

          <Input
            label="City *"
            placeholder="Austin"
            value={customer.constructionAddress.city}
            onChange={(e) => updateConstructionAddress('city', e.target.value)}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="State *"
              placeholder="TX"
              value={customer.constructionAddress.state}
              onChange={(e) => updateConstructionAddress('state', e.target.value)}
              required
            />
            <Input
              label="ZIP Code *"
              placeholder="78701"
              value={customer.constructionAddress.zip}
              onChange={(e) => updateConstructionAddress('zip', e.target.value)}
              required
            />
          </div>
        </div>
      </motion.div>

      {/* Billing Address - SECOND with checkbox */}
      <motion.div variants={itemVariants} className="space-y-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#FF6A00]" />
          Billing Address
        </h3>

        {/* Same as Construction Checkbox */}
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={customer.sameAsMailingAddress}
              onChange={(e) => handleSameAsConstructionChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-5 h-5 rounded border-2 border-white/20 bg-[#111111] peer-checked:bg-[#FF6A00] peer-checked:border-[#FF6A00] transition-all duration-200 flex items-center justify-center">
              {customer.sameAsMailingAddress && (
                <Check className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
          <span className="text-[#A3A3A3] group-hover:text-white transition-colors">
            Same as construction site address
          </span>
        </label>

        {!customer.sameAsMailingAddress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="md:col-span-2">
              <Input
                label="Street Address *"
                placeholder="123 Main Street"
                value={customer.billingAddress.street}
                onChange={(e) => updateBillingAddress('street', e.target.value)}
                leftIcon={<MapPin className="w-5 h-5" />}
                required
              />
            </div>

            <Input
              label="City *"
              placeholder="Austin"
              value={customer.billingAddress.city}
              onChange={(e) => updateBillingAddress('city', e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="State *"
                placeholder="TX"
                value={customer.billingAddress.state}
                onChange={(e) => updateBillingAddress('state', e.target.value)}
                required
              />
              <Input
                label="ZIP Code *"
                placeholder="78701"
                value={customer.billingAddress.zip}
                onChange={(e) => updateBillingAddress('zip', e.target.value)}
                required
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Privacy Note */}
      <motion.div
        variants={itemVariants}
        className="mt-8 p-4 bg-[#1A1A1A] rounded-xl border border-[#FF6A00]/20"
      >
        <p className="text-sm text-[#A3A3A3]">
          <span className="text-[#FF6A00] font-semibold">Note:</span> Your information is secure and will only be used to prepare your estimate and contact you about your building project.
        </p>
      </motion.div>
    </motion.div>
  );
}

export default Step1CustomerInfo;
