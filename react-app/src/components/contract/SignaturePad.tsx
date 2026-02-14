import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Check } from 'lucide-react';

interface SignaturePadProps {
  width?: number;
  height?: number;
  onSignatureChange?: (hasSignature: boolean, dataUrl: string | null) => void;
  initialValue?: string | null;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function SignaturePad({
  width = 400,
  height = 150,
  onSignatureChange,
  initialValue,
  label = 'Signature',
  disabled = false,
  className = '',
  required = false
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [actualWidth, setActualWidth] = useState(width);

  // Responsive width adjustment
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        setActualWidth(Math.min(width, containerWidth - 4)); // -4 for border
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [width]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || actualWidth === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = actualWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${actualWidth}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Set drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial value if provided
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, actualWidth, height);
        setHasSignature(true);
      };
      img.src = initialValue;
    }
  }, [actualWidth, height, initialValue]);

  // Get position from event (mouse or touch)
  const getPosition = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Start drawing
  const startDrawing = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [disabled, getPosition]);

  // Draw
  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }, [isDrawing, disabled, getPosition]);

  // Stop drawing
  const stopDrawing = useCallback(() => {
    if (isDrawing) {
      setIsDrawing(false);
      setHasSignature(true);

      // Notify parent of signature change
      if (onSignatureChange) {
        const canvas = canvasRef.current;
        if (canvas) {
          onSignatureChange(true, canvas.toDataURL('image/png'));
        }
      }
    }
  }, [isDrawing, onSignatureChange]);

  // Clear signature
  const clearSignature = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);

    if (onSignatureChange) {
      onSignatureChange(false, null);
    }
  }, [onSignatureChange]);

  return (
    <div ref={containerRef} className={`signature-pad-container w-full ${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-white mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}

      <div
        className={`
          relative rounded-xl overflow-hidden border-2 transition-all duration-200
          ${hasSignature
            ? 'border-[#14B8A6] bg-[#14B8A6]/5'
            : 'border-white/20 bg-[#111111]'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'}
        `}
        style={{ touchAction: 'none' }}
      >
        {/* Signature line */}
        <div
          className="absolute bottom-8 left-4 right-4 border-b border-dashed border-white/20"
          style={{ pointerEvents: 'none' }}
        />

        {/* X mark for signature */}
        <div
          className="absolute bottom-4 left-4 text-white/30 text-sm font-medium"
          style={{ pointerEvents: 'none' }}
        >
          ✕
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="touch-none block"
          style={{
            width: `${actualWidth}px`,
            height: `${height}px`,
            touchAction: 'none'
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        {/* Signed indicator */}
        {hasSignature && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#14B8A6] flex items-center justify-center"
          >
            <Check className="w-4 h-4 text-white" />
          </motion.div>
        )}
      </div>

      {/* Clear button - minimum 44x44px touch target */}
      {!disabled && (
        <button
          type="button"
          onClick={clearSignature}
          className="mt-2 flex items-center gap-2 text-sm text-[#A3A3A3] hover:text-white transition-colors min-h-[44px] px-3 py-2 -ml-3 rounded-lg hover:bg-white/5"
        >
          <Eraser className="w-4 h-4" />
          Clear signature
        </button>
      )}
    </div>
  );
}

export default SignaturePad;
