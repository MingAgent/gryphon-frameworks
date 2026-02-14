import { forwardRef, useState } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className = '', id, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-[#A3A3A3] uppercase tracking-wider mb-2"
          >
            {label}
          </label>
        )}
        <motion.div
          className="relative"
          animate={{
            scale: isFocused ? 1.01 : 1
          }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3.5 pr-11
              appearance-none
              bg-[#111111]
              text-white
              border rounded-xl
              transition-all duration-200
              outline-none
              cursor-pointer
              ${error
                ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/30 focus:border-red-500'
                : 'border-white/8 hover:border-white/15 focus:ring-2 focus:ring-[#14B8A6]/30 focus:border-[#14B8A6]'
              }
              ${isFocused ? 'bg-[#1A1A1A]' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          >
            {placeholder && (
              <option value="" disabled className="text-[#666666] bg-[#111111]">
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-[#111111] text-white py-2"
              >
                {option.label}
              </option>
            ))}
          </select>
          <ChevronDown className={`
            absolute right-4 top-1/2 -translate-y-1/2
            w-5 h-5 pointer-events-none
            transition-colors duration-200
            ${isFocused ? 'text-[#14B8A6]' : 'text-[#666666]'}
          `} />
        </motion.div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 text-sm text-red-400 flex items-center gap-1"
          >
            <span className="w-1 h-1 rounded-full bg-red-400" />
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
