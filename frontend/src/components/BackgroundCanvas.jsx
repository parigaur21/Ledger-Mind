import { useEffect, useRef, useState } from 'react';

// Animated floating particles + gradient mesh for dark theme
function DarkBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Floating orbs
    const orbs = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 200 + 100,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      hue: Math.random() * 60 + 200, // Blue-purple range
      opacity: Math.random() * 0.08 + 0.03,
    }));

    // Small particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      dx: (Math.random() - 0.5) * 0.15,
      dy: Math.random() * -0.3 - 0.05,
      opacity: Math.random() * 0.5 + 0.1,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2,
    }));

    // Grid lines
    const gridSpacing = 60;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    let frame = 0;
    function animate() {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Draw gradient mesh orbs
      orbs.forEach(orb => {
        orb.x += orb.dx;
        orb.y += orb.dy;
        if (orb.x < -orb.radius || orb.x > width + orb.radius) orb.dx *= -1;
        if (orb.y < -orb.radius || orb.y > height + orb.radius) orb.dy *= -1;

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, `hsla(${orb.hue}, 80%, 50%, ${orb.opacity})`);
        gradient.addColorStop(0.5, `hsla(${orb.hue + 20}, 60%, 30%, ${orb.opacity * 0.5})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(orb.x - orb.radius, orb.y - orb.radius, orb.radius * 2, orb.radius * 2);
      });

      // Draw subtle grid
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.03)';
      ctx.lineWidth = 0.5;
      const offsetX = (frame * 0.1) % gridSpacing;
      const offsetY = (frame * 0.05) % gridSpacing;
      for (let x = -gridSpacing + offsetX; x < width + gridSpacing; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = -gridSpacing + offsetY; y < height + gridSpacing; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw particles
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        p.twinklePhase += p.twinkleSpeed;

        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const twinkle = Math.sin(p.twinklePhase) * 0.5 + 0.5;
        const alpha = p.opacity * twinkle;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(147, 197, 253, ${alpha})`;
        ctx.fill();

        // Subtle glow
        if (p.size > 1.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha * 0.1})`;
          ctx.fill();
        }
      });

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// Soft floating shapes + warm gradients for light theme
function LightBackground() {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    // Warm gradient blobs
    const blobs = Array.from({ length: 7 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 300 + 150,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      color: [
        [99, 102, 241],   // Indigo
        [139, 92, 246],   // Violet
        [59, 130, 246],   // Blue
        [236, 72, 153],   // Pink
        [6, 182, 212],    // Cyan
        [249, 115, 22],   // Orange
      ][Math.floor(Math.random() * 6)],
      opacity: Math.random() * 0.15 + 0.1, // Increased significantly
    }));

    // Floating dots
    const dots = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1.5,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      opacity: Math.random() * 0.4 + 0.2, // Increased significantly
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: Math.random() * 0.02 + 0.01,
    }));

    // Connecting lines threshold
    const connectionDist = 120;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    function animate() {
      ctx.clearRect(0, 0, width, height);

      // Draw blobs
      blobs.forEach(blob => {
        blob.x += blob.dx;
        blob.y += blob.dy;
        if (blob.x < -blob.radius || blob.x > width + blob.radius) blob.dx *= -1;
        if (blob.y < -blob.radius || blob.y > height + blob.radius) blob.dy *= -1;

        const gradient = ctx.createRadialGradient(blob.x, blob.y, 0, blob.x, blob.y, blob.radius);
        gradient.addColorStop(0, `rgba(${blob.color.join(',')}, ${blob.opacity})`);
        gradient.addColorStop(0.6, `rgba(${blob.color.join(',')}, ${blob.opacity * 0.3})`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw dots and connections
      dots.forEach(dot => {
        dot.x += dot.dx;
        dot.y += dot.dy;
        dot.pulse += dot.pulseSpeed;

        if (dot.x < 0 || dot.x > width) dot.dx *= -1;
        if (dot.y < 0 || dot.y > height) dot.dy *= -1;

        const pulseAlpha = (Math.sin(dot.pulse) * 0.5 + 0.5) * dot.opacity;

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${pulseAlpha})`;
        ctx.fill();
      });

      // Draw connections between nearby dots
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.25; // Increased line visibility
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha})`;
            ctx.lineWidth = 1; // Thicker lines
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }

      animRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

export default function BackgroundCanvas({ theme }) {
  if (theme === 'light') return <LightBackground />;
  return <DarkBackground />;
}
