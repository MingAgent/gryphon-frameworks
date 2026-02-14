import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Eraser, Check } from 'lucide-react';

interface InitialsPadProps {
  width?: number;
  height?: number;
  onInitialsChange?: (hasInitials: boolean, dataUrl: string | null) => void;
  initialValue?: string | null;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

export function InitialsPad({
  width = 100,
  height = 60,
  onInitialsChange,
  initialValue,
  label = 'Initials',
  disabled = false,
  className = '',
  required = false
}: InitialsPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasInitials, setHasInitials] = useState(false);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas resolution for retina displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);

    // Set drawing style (thinner line for initials)
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Load initial value if provided
    if (initialValue) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, width, height);
        setHasInitials(true);
      };
      img.src = initialValue;
    }
  }, [width, height, initialValue]);

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
      setHasInitials(true);

      // Notify parent of initials change
      if (onInitialsChange) {
        const canvas = canvasRef.current;
        if (canvas) {
          onInitialsChange(true, canvas.toDataURL('image/png'));
        }
      }
    }
  }, [isDrawing, onInitialsChange]);

  // Clear initials
  const clearInitials = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInitials(false);

    if (onInitialsChange) {
      onInitialsChange(false, null);
    }
  }, [onInitialsChange]);

  return (
    <div className={`initials-pad-container inline-block ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-gray-500 mb-1">
          {label} {required && <span className="text-[#FF6A00]">*</span>}
        </label>
      )}

      <div className="flex items-center gap-2">
        <div
          className={`
            relative rounded-lg overflow-hidden border-2 transition-all duration-200
            ${hasInitials
              ? 'border-[#14B8A6] bg-white'
              : 'border-gray-300 bg-white'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-crosshair'}
          `}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            touchAction: 'none'
          }}
        >
          {/* Canvas */}
          <canvas
            ref={canvasRef}
            className="touch-none block"
            style={{
              width: `${width}px`,
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
          {hasInitials && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#14B8A6] flex items-center justify-center"
            >
              <Check className="w-2.5 h-2.5 text-white" />
            </motion.div>
          )}
        </div>

        {/* Clear button - minimum 44x44px touch target */}
        {!disabled && hasInitials && (
          <button
            type="button"
            onClick={clearInitials}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all active:bg-gray-200"
            title="Clear initials"
          >
            <Eraser className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default InitialsPad;
