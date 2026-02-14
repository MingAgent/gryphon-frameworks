import type { Variants } from 'framer-motion';

/**
 * 13|7 FRAMEWORKS - Animation Variants
 * Fluid Tech Style - Smooth springs, subtle parallax, premium feel
 */

// Custom easing curves
const easeSmooth = [0.4, 0, 0.2, 1] as const;

// Page transition variants for step wizard
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    x: 60,
    scale: 0.98,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: easeSmooth
    }
  },
  exit: {
    opacity: 0,
    x: -60,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: 0.35
    }
  }
};

// Reverse page transition (for going back)
export const pageVariantsReverse: Variants = {
  initial: {
    opacity: 0,
    x: -60,
    scale: 0.98,
    filter: 'blur(4px)'
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.5,
      ease: easeSmooth
    }
  },
  exit: {
    opacity: 0,
    x: 60,
    scale: 0.98,
    filter: 'blur(4px)',
    transition: {
      duration: 0.35
    }
  }
};

// Card hover effects - Glass morphism style
export const cardVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
  },
  hover: {
    scale: 1.02,
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

// Stagger container for lists
export const containerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

// Item variants for staggered lists
export const itemVariants: Variants = {
  initial: {
    opacity: 0,
    y: 24,
    scale: 0.96
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  }
};

// Fade in from bottom with smooth spring
export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 40
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20
    }
  }
};

// Scale and fade with premium feel
export const scaleInVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.85
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  }
};

// Color swatch selection - refined tech
export const swatchVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(255, 106, 0, 0)'
  },
  selected: {
    scale: 1.12,
    boxShadow: '0 0 20px rgba(255, 106, 0, 0.4)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 20
    }
  },
  hover: {
    scale: 1.08,
    boxShadow: '0 0 15px rgba(255, 106, 0, 0.2)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  }
};

// Price counter animation - smooth glow
export const priceVariants: Variants = {
  initial: {
    scale: 1.15,
    opacity: 0,
    filter: 'blur(4px)'
  },
  animate: {
    scale: 1,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 250,
      damping: 20
    }
  }
};

// Modal/overlay animations - glass style
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    filter: 'blur(8px)'
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.92,
    y: 30,
    filter: 'blur(8px)',
    transition: { duration: 0.25 }
  }
};

// Backdrop fade with blur
export const backdropVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.25 }
  }
};

// Step indicator variants - 13|7 brand colors
export const stepIndicatorVariants: Variants = {
  inactive: {
    backgroundColor: '#1A1A1A',
    color: '#666666',
    scale: 1,
    boxShadow: '0 0 0 0 rgba(255, 106, 0, 0)'
  },
  active: {
    backgroundColor: '#FF6A00',
    color: '#FFFFFF',
    scale: 1.08,
    boxShadow: '0 0 25px rgba(255, 106, 0, 0.35)',
    transition: {
      type: 'spring',
      stiffness: 350,
      damping: 22
    }
  },
  completed: {
    backgroundColor: '#22C55E',
    color: '#FFFFFF',
    scale: 1,
    boxShadow: '0 0 0 0 rgba(34, 197, 94, 0)'
  }
};

// Button press effect - fluid
export const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: {
    scale: 1.03,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25
    }
  },
  tap: {
    scale: 0.97,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30
    }
  }
};

// Input focus effect - teal accent
export const inputFocusVariants: Variants = {
  initial: {
    borderColor: 'rgba(255, 255, 255, 0.08)',
    boxShadow: '0 0 0 0 rgba(20, 184, 166, 0)'
  },
  focus: {
    borderColor: '#14B8A6',
    boxShadow: '0 0 0 3px rgba(20, 184, 166, 0.25)',
    transition: { duration: 0.2 }
  }
};

// Accordion/collapse variants - smooth
export const collapseVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.35,
        ease: easeSmooth
      },
      opacity: { duration: 0.2 }
    }
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: {
        duration: 0.35,
        ease: easeSmooth
      },
      opacity: { duration: 0.3, delay: 0.1 }
    }
  }
};

// Slide in from right (for drawers/panels)
export const slideInRightVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0,
    filter: 'blur(4px)'
  },
  animate: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 280,
      damping: 28
    }
  },
  exit: {
    x: '100%',
    opacity: 0,
    filter: 'blur(4px)',
    transition: {
      duration: 0.25
    }
  }
};

// Tooltip pop - refined
export const tooltipVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.85,
    y: 8
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 25
    }
  },
  exit: {
    opacity: 0,
    scale: 0.85,
    y: 8,
    transition: { duration: 0.12 }
  }
};

// Glow pulse animation for active elements
export const glowPulseVariants: Variants = {
  initial: {
    boxShadow: '0 0 0 0 rgba(255, 106, 0, 0)'
  },
  pulse: {
    boxShadow: [
      '0 0 0 0 rgba(255, 106, 0, 0.4)',
      '0 0 20px 5px rgba(255, 106, 0, 0)',
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeOut'
    }
  }
};

// Float animation for subtle movement
export const floatVariants: Variants = {
  initial: { y: 0 },
  float: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// Shimmer effect for loading states
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: '-200% 0'
  },
  shimmer: {
    backgroundPosition: '200% 0',
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear'
    }
  }
};
