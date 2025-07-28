import React, { useEffect, useRef } from 'react';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
}

const Aurora: React.FC<AuroraProps> = ({
  colorStops = ["#FF1CF7", "#B249F8", "#00D4FF", "#7C3AED", "#EC4899"],
  blend = 0.7,
  amplitude = 1.2,
  speed = 0.3,
  className = ""
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Validate props
    const safeBlend = Math.max(0, Math.min(1, blend));
    const safeAmplitude = Math.max(0.1, Math.min(3, amplitude));
    const safeSpeed = Math.max(0.1, Math.min(2, speed));

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 0, g: 0, b: 0 };
    };

    const colors = colorStops.map(hexToRgb);



    const animate = (time: number) => {
      try {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const t = time * safeSpeed * 0.001;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < colors.length; i++) {
        const color = colors[i];
        const alpha = blend * (0.3 + 0.7 * Math.sin(t + i * 2) * 0.5 + 0.5);
        gradient.addColorStop(i / (colors.length - 1), `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      }

      // Draw multiple aurora layers
      for (let layer = 0; layer < Math.min(colors.length, 5); layer++) { // Limit layers for performance
        const layerColor = colors[layer];
        const layerAlpha = Math.max(0, Math.min(1, safeBlend * (0.2 + 0.3 * Math.sin(t * 0.5 + layer) * 0.5 + 0.5)));

        if (layerAlpha > 0.01) { // Only draw if visible
          ctx.fillStyle = `rgba(${layerColor.r}, ${layerColor.g}, ${layerColor.b}, ${layerAlpha})`;
          ctx.beginPath();

          const waveHeight = Math.max(0, canvas.height * (0.2 + layer * 0.1) * safeAmplitude);
          const waveOffset = Math.max(0, Math.min(canvas.height, canvas.height * (0.6 + layer * 0.05)));

          ctx.moveTo(0, canvas.height);

          for (let x = 0; x <= canvas.width; x += 8) {
            const y1 = waveOffset + Math.sin((x + t * (80 + layer * 20)) * 0.008) * waveHeight * 0.6;
            const y2 = waveOffset + Math.sin((x + t * (120 + layer * 30)) * 0.006) * waveHeight * 0.4;
            const y3 = waveOffset + Math.sin((x + t * (160 + layer * 40)) * 0.01) * waveHeight * 0.3;

            const finalY = Math.max(0, Math.min(canvas.height, (y1 + y2 + y3) / 3));
            ctx.lineTo(x, finalY);
          }

          ctx.lineTo(canvas.width, canvas.height);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Add enhanced sparkle effects with colors
      for (let i = 0; i < 80; i++) {
        const sparkleColor = colors[i % colors.length];
        const sparkleAlpha = safeBlend * (0.1 + 0.2 * Math.sin(t * 3 + i * 0.1));
        ctx.fillStyle = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, ${sparkleAlpha})`;

        const x = (Math.sin(t * 0.8 + i * 0.3) * 0.5 + 0.5) * canvas.width;
        const y = (Math.cos(t * 0.6 + i * 0.4) * 0.5 + 0.5) * canvas.height * 0.8;
        const size = Math.max(0.5, Math.sin(t * 4 + i * 0.2) * 3 + 1); // Ensure positive radius

        if (size > 0) { // Additional safety check
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();

          // Add glow effect
          ctx.shadowColor = `rgba(${sparkleColor.r}, ${sparkleColor.g}, ${sparkleColor.b}, 0.8)`;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
      } catch (error) {
        console.warn('Aurora animation error:', error);
        // Fallback: continue animation but with safer parameters
        if (animationRef.current) {
          animationRef.current = requestAnimationFrame(animate);
        }
      }
    };

    window.addEventListener('resize', resize);
    resize();
    animate(0);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colorStops, blend, amplitude, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{
        mixBlendMode: 'screen',
        opacity: 0.8
      }}
    />
  );
};

export default Aurora;
