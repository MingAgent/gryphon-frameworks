import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { cardVariants } from '../../../animations/variants';

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: 'default' | 'elevated' | 'glass' | 'glow' | 'bordered';
  interactive?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variantStyles = {
  default: 'bg-[#111111] border border-white/8',
  elevated: 'bg-[#1A1A1A] border border-white/12 shadow-lg shadow-black/40',
  glass: 'bg-[#1A1A1A]/80 backdrop-blur-xl border border-white/8',
  glow: 'bg-[#1A1A1A] border border-[#FF6A00]/30 shadow-lg shadow-[#FF6A00]/10',
  bordered: 'bg-[#111111] border border-white/15'
};

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export function Card({
  variant = 'default',
  interactive = false,
  padding = 'md',
  children,
  className = '',
  ...props
}: CardProps) {
  return (
    <motion.div
      variants={interactive ? cardVariants : undefined}
      initial={interactive ? 'initial' : undefined}
      whileHover={interactive ? 'hover' : undefined}
      whileTap={interactive ? 'tap' : undefined}
      className={`
        rounded-2xl
        transition-all duration-300
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${interactive ? 'cursor-pointer hover:border-white/20 hover:shadow-xl hover:shadow-black/50 hover:-translate-y-1' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export default Card;
