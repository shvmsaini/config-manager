import React, { useRef, useEffect } from 'react';

interface FlyingFlightProps {
  className?: string;
}

export const FlyingFlight: React.FC<FlyingFlightProps> = ({ className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Calculate normalized cursor position offsets from center (-0.5 to 0.5)
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Update custom properties on DOM directly for buttery-smooth GPU handling
      container.style.setProperty('--mouse-x', x.toString());
      container.style.setProperty('--mouse-y', y.toString());
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // 5 layered airplanes with customized airways, durations, and negative delays
  // Minimal cursor interaction, more cloud-like gentle drift
  const planes = [
    {
      id: 'main-flight',
      airway: 'airway-1',
      duration: 35,
      delay: -10, // already in the center-left area at load
      heading: -63,
      size: 'w-18 h-18',
      opacity: 'text-white/25',
      factorX: 40,
      factorY: 20,
      rotationFactor: 4,
      hasTrail: true,
    },
    {
      id: 'depth-flight-1',
      airway: 'airway-2',
      duration: 50,
      delay: -20, // already in the upper-left area at load
      heading: -63,
      size: 'w-10 h-10',
      opacity: 'text-white/8',
      factorX: 30,
      factorY: 20,
      rotationFactor: 1,
      hasTrail: false,
    },
    {
      id: 'depth-flight-2',
      airway: 'airway-3',
      duration: 40,
      delay: -5, // already in the bottom-right area at load
      heading: -63,
      size: 'w-13 h-13',
      opacity: 'text-white/14',
      factorX: 50,
      factorY: 35,
      rotationFactor: 1,
      hasTrail: true,
    },
    {
      id: 'depth-flight-3',
      airway: 'airway-4',
      duration: 60,
      delay: -40, // already in the top area at load
      heading: -45,
      size: 'w-8 h-8',
      opacity: 'text-white/6',
      factorX: 25,
      factorY: 10,
      rotationFactor: 1,
      hasTrail: false,
    },
    {
      id: 'depth-flight-4',
      airway: 'airway-5',
      duration: 45,
      delay: -18, // already in the middle-left area at load
      heading: -57,
      size: 'w-11 h-11',
      opacity: 'text-white/11',
      factorX: 40,
      factorY: 30,
      rotationFactor: 1,
      hasTrail: false,
    }
  ];

  // Soft floating parallax clouds drifting backwards - continuous, minimal movement
  const clouds: {
    id: string;
    baseY: number;
    width: number;
    height: number;
    opacity: string;
    factorX: number;
    factorY: number;
    type: 'cumulus' | 'cirrus' | 'stratus' | 'compact';
    driftPath: string;
    duration: number;
    delay: number;
  }[] = [
      {
        id: 'cloud-lg-1',
        baseY: 15,
        width: 140,
        height: 48,
        opacity: 'text-white/[0.18]',
        factorX: -35,
        factorY: -20,
        type: 'cumulus',
        driftPath: 'drift-1',
        duration: 120,
        delay: -40,
      },
      {
        id: 'cloud-md-1',
        baseY: 32,
        width: 100,
        height: 36,
        opacity: 'text-white/[0.16]',
        factorX: -20,
        factorY: -12,
        type: 'cirrus',
        driftPath: 'drift-2',
        duration: 150,
        delay: -85,
      },
      {
        id: 'cloud-lg-2',
        baseY: 68,
        width: 120,
        height: 42,
        opacity: 'text-white/[0.22]',
        factorX: -25,
        factorY: -16,
        type: 'stratus',
        driftPath: 'drift-3',
        duration: 135,
        delay: -20,
      },
      {
        id: 'cloud-md-2',
        baseY: 72,
        width: 90,
        height: 32,
        opacity: 'text-white/[0.14]',
        factorX: -15,
        factorY: -10,
        type: 'compact',
        driftPath: 'drift-4',
        duration: 165,
        delay: -110,
      },
      {
        id: 'cloud-sm-1',
        baseY: 22,
        width: 70,
        height: 26,
        opacity: 'text-white/[0.12]',
        factorX: -12,
        factorY: -8,
        type: 'cirrus',
        driftPath: 'drift-5',
        duration: 180,
        delay: -70,
      },
      {
        id: 'cloud-lg-3',
        baseY: 42,
        width: 130,
        height: 46,
        opacity: 'text-white/[0.20]',
        factorX: -30,
        factorY: -18,
        type: 'cumulus',
        driftPath: 'drift-1',
        duration: 125,
        delay: -95,
      },
      {
        id: 'cloud-md-3',
        baseY: 18,
        width: 105,
        height: 38,
        opacity: 'text-white/[0.15]',
        factorX: -22,
        factorY: -14,
        type: 'stratus',
        driftPath: 'drift-2',
        duration: 145,
        delay: -15,
      },
      {
        id: 'cloud-sm-2',
        baseY: 82,
        width: 80,
        height: 28,
        opacity: 'text-white/[0.13]',
        factorX: -16,
        factorY: -10,
        type: 'compact',
        driftPath: 'drift-3',
        duration: 170,
        delay: -125,
      },
      {
        id: 'cloud-xl-1',
        baseY: 52,
        width: 160,
        height: 54,
        opacity: 'text-white/[0.16]',
        factorX: -40,
        factorY: -24,
        type: 'cumulus',
        driftPath: 'drift-4',
        duration: 115,
        delay: -55,
      },
      {
        id: 'cloud-md-4',
        baseY: 88,
        width: 95,
        height: 34,
        opacity: 'text-white/[0.14]',
        factorX: -18,
        factorY: -11,
        type: 'cirrus',
        driftPath: 'drift-5',
        duration: 155,
        delay: -30,
      }
    ];

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}
      style={{
        ['--mouse-x' as any]: '0',
        ['--mouse-y' as any]: '0',
      }}
    >
      <style>{`
        /* Air traffic corridors going diagonally across the sky */
        @keyframes airway-1 {
          0% { left: 125%; top: 55%; }
          100% { left: -25%; top: -15%; }
        }
        @keyframes airway-2 {
          0% { left: 125%; top: 85%; }
          100% { left: -25%; top: 15%; }
        }
        @keyframes airway-3 {
          0% { left: 125%; top: 105%; }
          100% { left: -25%; top: 35%; }
        }
        @keyframes airway-4 {
          0% { left: 105%; top: 125%; }
          100% { left: -35%; top: -15%; }
        }
        @keyframes airway-5 {
          0% { left: 125%; top: 75%; }
          100% { left: -25%; top: -15%; }
        }
        /* Cloud drift paths - continuous horizontal movement */
        @keyframes drift-1 {
          0% { left: 110%; }
          100% { left: -30%; }
        }
        @keyframes drift-2 {
          0% { left: 115%; }
          100% { left: -35%; }
        }
        @keyframes drift-3 {
          0% { left: 120%; }
          100% { left: -40%; }
        }
        @keyframes drift-4 {
          0% { left: 125%; }
          100% { left: -45%; }
        }
        @keyframes drift-5 {
          0% { left: 130%; }
          100% { left: -50%; }
        }
      `}</style>

      {/* 1. Render Floating Parallax Clouds with continuous drift */}
      {clouds.map((cloud) => {
        const cloudTransform = `
          translate(-50%, -50%)
          translate(
            calc(var(--mouse-x) * ${cloud.factorX}px),
            calc(var(--mouse-y) * ${cloud.factorY}px)
          )
        `;

        return (
          <div
            key={cloud.id}
            className="absolute top-0"
            style={{
              top: `${cloud.baseY}%`,
              animation: `${cloud.driftPath} ${cloud.duration}s linear infinite`,
              animationDelay: `${cloud.delay}s`,
              willChange: 'left',
            }}
          >
            <div
              style={{
                transform: cloudTransform,
                transition: 'transform 2.0s cubic-bezier(0.1, 0.8, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              {/* Cumulus style (Standard cloud, multi-rounded) */}
              {cloud.type === 'cumulus' && (
                <svg
                  width={cloud.width}
                  height={cloud.height}
                  viewBox="0 0 100 40"
                  className={cloud.opacity}
                  fill="currentColor"
                >
                  <rect x="10" y="15" width="80" height="18" rx="9" />
                  <rect x="25" y="7" width="45" height="18" rx="9" />
                  <circle cx="36" cy="16" r="11" />
                  <circle cx="62" cy="16" r="10" />
                </svg>
              )}

              {/* Cirrus style (Thin, wispy capsule design) */}
              {cloud.type === 'cirrus' && (
                <svg
                  width={cloud.width}
                  height={cloud.height}
                  viewBox="0 0 100 20"
                  className={cloud.opacity}
                  fill="currentColor"
                >
                  <rect x="5" y="8" width="90" height="8" rx="4" />
                  <rect x="35" y="3" width="40" height="6" rx="3" />
                  <rect x="15" y="12" width="50" height="4" rx="2" />
                </svg>
              )}

              {/* Stratus style (Wide, low layer) */}
              {cloud.type === 'stratus' && (
                <svg
                  width={cloud.width}
                  height={cloud.height}
                  viewBox="0 0 120 30"
                  className={cloud.opacity}
                  fill="currentColor"
                >
                  <rect x="5" y="12" width="110" height="10" rx="5" />
                  <rect x="20" y="6" width="60" height="8" rx="4" />
                  <rect x="55" y="18" width="50" height="6" rx="3" />
                </svg>
              )}

              {/* Compact Altocumulus style (Dense, highly rounded small shape) */}
              {cloud.type === 'compact' && (
                <svg
                  width={cloud.width}
                  height={cloud.height}
                  viewBox="0 0 60 40"
                  className={cloud.opacity}
                  fill="currentColor"
                >
                  <circle cx="20" cy="22" r="12" />
                  <circle cx="38" cy="20" r="13" />
                  <circle cx="28" cy="13" r="10" />
                  <rect x="10" y="24" width="40" height="10" rx="5" />
                </svg>
              )}
            </div>
          </div>
        );
      })}

      {/* 2. Render Infinite Airway Cruising Planes with Cursor Deflection */}
      {planes.map((plane) => {
        const deflectionTransform = `
          translate(-50%, -50%)
          translate(
            calc(var(--mouse-x) * ${plane.factorX}px),
            calc(var(--mouse-y) * ${plane.factorY}px)
          )
          rotate(
            calc(${plane.heading}deg + var(--mouse-x) * ${plane.rotationFactor}deg)
          )
        `;

        return (
          <div
            key={plane.id}
            className="absolute"
            style={{
              animation: `${plane.airway} ${plane.duration}s linear infinite`,
              animationDelay: `${plane.delay}s`,
              willChange: 'left, top',
            }}
          >
            {/* Inner child applies hardware-accelerated mouse interactive deflection */}
            <div
              className="relative flex items-center justify-center"
              style={{
                transform: deflectionTransform,
                transition: 'transform 1.4s cubic-bezier(0.1, 0.8, 0.2, 1)',
                willChange: 'transform',
              }}
            >
              {/* Airplane SVG silhouette matching brand logo */}
              <svg
                viewBox="0 0 24 24"
                className={`${plane.size} ${plane.opacity}`}
                fill="currentColor"
              >
                <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>

              {/* Dotted trailing flight trail */}
              {plane.hasTrail && (
                <div
                  className="absolute top-1/2 left-1/2 w-[1px] h-32 bg-gradient-to-b from-white/12 via-white/4 to-transparent origin-top pointer-events-none"
                  style={{
                    transform: 'translate(-50%, 20px)',
                  }}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
