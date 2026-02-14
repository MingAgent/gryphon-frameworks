import { motion } from 'framer-motion';
import { Phone, Mail, ChevronRight } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="relative bg-[#0A0A0A] border-b border-white/8"
    >
      {/* Subtle glow effect at top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FF6A00]/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Brand - Stacked Layout */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            {/* 13|7 Logo Mark - Stacked with FRAMEWORKS below */}
            <div className="flex flex-col items-center select-none">
              {/* 13|7 Numbers */}
              <div className="flex items-baseline" style={{ transform: 'skewX(-12deg)' }}>
                <span
                  className="text-4xl font-black text-white tracking-tighter"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  13
                </span>
                <div className="w-1 h-9 bg-[#FF6A00] mx-1.5 rounded-sm" />
                <span
                  className="text-4xl font-black text-[#FF6A00] tracking-tighter"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  7
                </span>
              </div>

              {/* FRAMEWORKS text below */}
              <h1
                className="text-sm font-bold tracking-[0.25em] text-white uppercase -mt-1"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                FRAMEWORKS
              </h1>

              {/* Metal Building Solutions tagline */}
              <p className="text-[8px] text-[#A3A3A3] uppercase tracking-[0.2em] mt-0.5">
                Metal Building Solutions
              </p>
            </div>
          </motion.div>

          {/* Contact Info */}
          <div className="hidden md:flex items-center gap-1">
            <motion.a
              href="tel:+1234567890"
              className="flex items-center gap-2 px-4 py-2 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-sm font-medium">(123) 456-7890</span>
            </motion.a>

            <div className="w-px h-6 bg-white/10" />

            <motion.a
              href="mailto:info@137frameworks.com"
              className="flex items-center gap-2 px-4 py-2 text-[#A3A3A3] hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Mail className="w-4 h-4 text-[#FF6A00]" />
              <span className="text-sm font-medium">info@137frameworks.com</span>
            </motion.a>

            <motion.button
              className="ml-4 flex items-center gap-1 px-5 py-2.5 bg-gradient-to-r from-[#FF6A00] to-[#FF8533] text-white text-sm font-semibold rounded-lg shadow-lg shadow-[#FF6A00]/20 hover:shadow-[#FF6A00]/40 transition-all duration-300"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              Get Quote
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Bottom border glow */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#14B8A6]/30 to-transparent" />
    </motion.header>
  );
}

export default Header;
