import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { buttonVariants } from '../../../animations/variants';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-[#FF6A00] to-[#FF8533]
    text-white font-semibold
    shadow-lg shadow-[#FF6A00]/20
    hover:shadow-xl hover:shadow-[#FF6A00]/30
    hover:-translate-y-0.5
    active:translate-y-0
  `,
  secondary: `
    bg-[#1A1A1A]
    text-white
    border border-white/12
    hover:bg-[#222222]
    hover:border-white/20
  `,
  outline: `
    bg-transparent
    border-2 border-[#FF6A00]
    text-[#FF6A00]
    hover:bg-[#FF6A00]/10
    hover:shadow-lg hover:shadow-[#FF6A00]/10
  `,
  ghost: `
    bg-transparent
    text-[#A3A3A3]
    hover:text-white
    hover:bg-white/5
  `
};

const sizeStyles = {
  sm: 'px-4 py-2.5 text-sm rounded-lg min-h-[44px]',  // 44px touch target
  md: 'px-5 py-3 text-base rounded-lg min-h-[44px]',  // 44px touch target
  lg: 'px-7 py-4 text-lg rounded-xl min-h-[52px]'    // Larger for emphasis
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      variants={buttonVariants}
      initial="initial"
      whileHover={!isDisabled ? 'hover' : undefined}
      whileTap={!isDisabled ? 'tap' : undefined}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-[#14B8A6]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A]
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:transform-none
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      disabled={isDisabled}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </motion.button>
  );
}

export default Button;
