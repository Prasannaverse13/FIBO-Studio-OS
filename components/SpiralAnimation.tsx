import React, { useEffect, useRef } from 'react';

const SpiralAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let frame = 0;

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      const cx = width / 2;
      const cy = height / 2;
      frame += 0.0003; // Ultra slow, premium rotation

      const goldenAngle = Math.PI * (3 - Math.sqrt(5)); 
      
      // Increased dot count to ensure corners are filled even with larger spread
      const numDots = 3000; 
      const minDim = Math.min(width, height);
      
      // Increased spread parameter significantly to make the pattern "bigger"
      const spreadParam = minDim * 0.025; 

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(frame);
      
      // Soft glow for premium feel
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)"; // Consistent, clean color

      for (let i = 0; i < numDots; i++) {
        // Pure Vogel's formula - no breathing or distortion
        const r = spreadParam * Math.sqrt(i);
        const theta = i * goldenAngle;
        
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);

        // Calculate visibility based on screen bounds
        // We fade out slightly at the very edges of the screen for smoothness
        const dist = Math.sqrt(x*x + y*y);
        const maxDist = Math.max(width, height) / 1.2;
        
        if (dist > maxDist) continue; // Optimization

        ctx.beginPath();
        // Constant elegant size, slightly larger
        const size = 1.8; 
        ctx.arc(x, y, size, 0, Math.PI * 2);
        
        // Simple alpha falloff at the very edges only
        let alpha = 0.4;
        if (dist > maxDist * 0.8) {
            alpha = 0.4 * (1 - (dist - maxDist * 0.8) / (maxDist * 0.2));
        }
        if (alpha < 0) alpha = 0;
        
        ctx.fillStyle = `rgba(220, 220, 235, ${alpha})`;
        ctx.fill();
      }

      ctx.restore();
      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
        cancelAnimationFrame(animationId);
        window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 blur-[1px]" />;
};

export default SpiralAnimation;