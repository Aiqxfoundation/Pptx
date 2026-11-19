import React from 'react';
import { motion } from 'motion/react';

interface SlideDiagramProps {
  slideId: number;
}

export const SlideDiagram: React.FC<SlideDiagramProps> = ({ slideId }) => {
  switch (slideId) {
    case 1:
      return (
        <svg viewBox="0 0 380 420" className="w-full h-full">
          <defs>
            <linearGradient id="photonGrad" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          {/* Subtle coordinate ticks */}
          <line x1="42" y1="30" x2="42" y2="380" stroke="#1E3A5F" strokeWidth="1.5" />
          <text x="26" y="42" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono">E</text>

          {/* Electronic Energy Levels */}
          <motion.g initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <line x1="65" y1="340" x2="310" y2="340" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
            <text x="322" y="344" fill="#E2E8F0" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">S₀</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <line x1="65" y1="220" x2="310" y2="220" stroke="#38BDF8" strokeWidth="3.5" strokeLinecap="round" />
            <text x="322" y="224" fill="#38BDF8" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">S₁*</text>
          </motion.g>

          <motion.g initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <line x1="65" y1="95" x2="310" y2="95" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
            <text x="322" y="99" fill="#F59E0B" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">S₂*</text>
          </motion.g>

          {/* Triplet manifold */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <line x1="210" y1="265" x2="310" y2="265" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="5 4" />
            <text x="322" y="269" fill="#FBBF24" fontSize="12" fontFamily="IBM Plex Mono">T₁</text>
          </motion.g>

          {/* Absorption Arrow */}
          <motion.g initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.65 }}>
            <line x1="120" y1="334" x2="120" y2="108" stroke="url(#photonGrad)" strokeWidth="3" />
            <polygon points="120,98 114,112 126,112" fill="#F59E0B" />
            <text x="82" y="210" fill="#F59E0B" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="600">hν</text>
          </motion.g>

          {/* Emission Arrow */}
          <motion.g initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.8 }}>
            <line x1="185" y1="226" x2="185" y2="328" stroke="#38BDF8" strokeWidth="2.5" />
            <polygon points="185,337 179,324 191,324" fill="#38BDF8" />
            <text x="195" y="286" fill="#94A3B8" fontSize="11" fontFamily="IBM Plex Mono">hν′</text>
          </motion.g>

          {/* ISC dashed arrow */}
          <motion.path
            d="M 185 220 Q 210 238 232 258"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="2"
            strokeDasharray="4 3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.9 }}
          />
        </svg>
      );

    case 2:
      return (
        <svg viewBox="0 0 460 220" className="w-full h-full">
          {/* Axes */}
          <line x1="42" y1="16" x2="42" y2="192" stroke="#64748B" strokeWidth="1.5" />
          <line x1="42" y1="192" x2="438" y2="192" stroke="#64748B" strokeWidth="1.5" />
          <polygon points="442,192 433,188 433,196" fill="#64748B" />
          <text x="12" y="26" fill="#64748B" fontSize="10" fontFamily="IBM Plex Mono">E</text>
          <text x="320" y="210" fill="#64748B" fontSize="10" fontFamily="IBM Plex Mono">Reaction coordinate</text>

          {/* Ground state thermal barrier */}
          <motion.path
            d="M 65 162 C 130 162, 165 82, 225 82 C 285 82, 325 170, 415 170"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="2.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          />
          <text x="235" y="104" fill="#1D4ED8" fontSize="10.5" fontWeight="600">Ground Surface (S₀) · ΔG‡ thermal</text>

          {/* Excited state surface */}
          <motion.path
            d="M 65 55 C 145 45, 200 76, 265 62 C 330 48, 375 40, 415 44"
            fill="none"
            stroke="#0891B2"
            strokeWidth="2.8"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.35 }}
          />
          <text x="245" y="34" fill="#0891B2" fontSize="10.5" fontWeight="600">Excited Surface (S₁*)</text>

          {/* Photon Arrow */}
          <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
            <line x1="95" y1="158" x2="95" y2="62" stroke="#D97706" strokeWidth="2.6" />
            <polygon points="95,54 90,65 100,65" fill="#D97706" />
            <text x="70" y="114" fill="#D97706" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">hν</text>
          </motion.g>
        </svg>
      );

    case 3:
      return (
        <svg viewBox="0 0 460 190" className="w-full h-full">
          <line x1="42" y1="15" x2="42" y2="160" stroke="#64748B" strokeWidth="1.5" />
          <line x1="42" y1="160" x2="438" y2="160" stroke="#64748B" strokeWidth="1.5" />
          <text x="52" y="24" fill="#0F172A" fontSize="10.5" fontWeight="600">ε(λ) Molar Absorptivity</text>
          <motion.path
            d="M 65 160 C 110 160, 125 85, 160 85 C 185 85, 195 36, 232 36 C 268 36, 275 95, 305 95 C 340 95, 355 160, 410 160 Z"
            fill="#ECFEFF"
            stroke="#0891B2"
            strokeWidth="2.5"
            initial={{ opacity: 0, scaleY: 0.2 }}
            animate={{ opacity: 1, scaleY: 1 }}
            style={{ transformOrigin: '235px 160px' }}
            transition={{ duration: 0.7, delay: 0.25 }}
          />
          <line x1="160" y1="160" x2="160" y2="85" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="232" y1="160" x2="232" y2="36" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
          <line x1="305" y1="160" x2="305" y2="95" stroke="#D97706" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="148" y="176" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">0→0</text>
          <text x="220" y="176" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">0→1</text>
          <text x="293" y="176" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">0→2</text>
          <text x="365" y="176" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">λ / ν</text>
        </svg>
      );

    case 4:
      return (
        <svg viewBox="0 0 480 210" className="w-full h-full">
          {[
            { x: 16, title: 'Longer λ', sub: 'IR · Lower E', range: '< 1.7 eV', fill: '#1D4ED8' },
            { x: 130, title: 'Visible', sub: '400–700 nm', range: '1.8–3.1 eV', fill: '#0891B2' },
            { x: 244, title: 'UV', sub: '200–400 nm', range: '3.1–6.2 eV', fill: '#D97706' },
            { x: 358, title: 'Shorter λ', sub: 'UV-C · High E', range: '> 6.2 eV', fill: '#DC2626' },
          ].map((b, i) => (
            <motion.g
              key={b.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.18 + i * 0.1 }}
            >
              <rect x={b.x} y="24" width="106" height="106" rx="8" fill={b.fill} />
              <text x={b.x + 53} y="62" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="700">{b.title}</text>
              <text x={b.x + 53} y="82" textAnchor="middle" fill="#F8FAFC" fontSize="10.5">{b.sub}</text>
              <text x={b.x + 53} y="106" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="IBM Plex Mono">{b.range}</text>
            </motion.g>
          ))}
          <line x1="22" y1="158" x2="452" y2="158" stroke="#0F172A" strokeWidth="2.4" />
          <polygon points="462,158 450,152 450,164" fill="#0F172A" />
          <text x="240" y="184" textAnchor="middle" fill="#0F172A" fontSize="11.5" fontWeight="600">
            Increasing frequency (ν) → Increasing photon energy (E)
          </text>
        </svg>
      );

    case 5:
      return (
        <svg viewBox="0 0 480 340" className="w-full h-full">
          {/* Axes */}
          <line x1="48" y1="20" x2="48" y2="305" stroke="#64748B" strokeWidth="1.6" />
          <line x1="48" y1="305" x2="455" y2="305" stroke="#64748B" strokeWidth="1.6" />
          <polygon points="462,305 451,300 451,310" fill="#64748B" />
          <text x="16" y="34" fill="#64748B" fontSize="11" fontFamily="IBM Plex Mono">E</text>
          <text x="250" y="328" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="IBM Plex Mono">Nuclear Coordinate (R)</text>

          {/* S0 Morse Potential Well */}
          <motion.path
            d="M 85 182 C 115 268, 145 282, 180 282 C 225 282, 275 215, 345 202"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          />
          {/* S0 Vibrational rungs */}
          <line x1="138" y1="268" x2="225" y2="268" stroke="#1D4ED8" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1="118" y1="246" x2="255" y2="246" stroke="#1D4ED8" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1="103" y1="224" x2="285" y2="224" stroke="#1D4ED8" strokeWidth="1.3" strokeDasharray="4 3" />
          <text x="72" y="280" fill="#1D4ED8" fontSize="12" fontWeight="700">S₀</text>
          <text x="232" y="272" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">v=0</text>

          {/* S1* Morse Potential Well (shifted right to larger R_e*) */}
          <motion.path
            d="M 155 45 C 185 142, 215 156, 252 156 C 300 156, 355 88, 430 74"
            fill="none"
            stroke="#0891B2"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          />
          <line x1="208" y1="142" x2="300" y2="142" stroke="#0891B2" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1="188" y1="120" x2="332" y2="120" stroke="#0891B2" strokeWidth="1.3" strokeDasharray="4 3" />
          <line x1="173" y1="98" x2="365" y2="98" stroke="#0891B2" strokeWidth="1.3" strokeDasharray="4 3" />
          <text x="410" y="64" fill="#0891B2" fontSize="12" fontWeight="700">S₁*</text>
          <text x="306" y="146" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">v′=0</text>
          <text x="370" y="102" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">v′=2</text>

          {/* Vertical Franck-Condon Transition */}
          <motion.g initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <line x1="180" y1="268" x2="180" y2="106" stroke="#D97706" strokeWidth="2.8" />
            <polygon points="180,96 174,110 186,110" fill="#D97706" />
            <text x="64" y="160" fill="#D97706" fontSize="10.5" fontWeight="700">Vertical Absorption</text>
            <text x="96" y="174" fill="#D97706" fontSize="9.5" fontFamily="IBM Plex Mono">(~10⁻¹⁵ s)</text>
          </motion.g>

          {/* Vibrational Relaxation Cascade */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.75 }}>
            <path d="M 192 98 Q 222 108 246 136" fill="none" stroke="#059669" strokeWidth="2.2" strokeDasharray="4 3" />
            <polygon points="251,142 240,136 249,130" fill="#059669" />
            <text x="235" y="112" fill="#059669" fontSize="10" fontWeight="700">VR (~10⁻¹² s)</text>
          </motion.g>
        </svg>
      );

    case 6:
      return (
        <svg viewBox="0 0 860 155" className="w-full h-full">
          {/* Left: Singlet Manifold S0, S1, S2 */}
          <text x="45" y="20" fill="#0F172A" fontSize="11.5" fontWeight="700">Singlet Manifold (S = 0)</text>
          <line x1="45" y1="130" x2="260" y2="130" stroke="#1D4ED8" strokeWidth="3.5" />
          <text x="272" y="134" fill="#1D4ED8" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">S₀</text>
          <line x1="45" y1="78" x2="260" y2="78" stroke="#0891B2" strokeWidth="3.5" />
          <text x="272" y="82" fill="#0891B2" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">S₁</text>
          <line x1="45" y1="36" x2="260" y2="36" stroke="#0891B2" strokeWidth="3.5" />
          <text x="272" y="40" fill="#0891B2" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">S₂</text>

          {/* Center: Relative ordering S0 < T1 < S1 */}
          <text x="370" y="20" fill="#0F172A" fontSize="11.5" fontWeight="700">Hund’s Rule Stabilization</text>
          <line x1="370" y1="130" x2="575" y2="130" stroke="#1D4ED8" strokeWidth="3.5" />
          <text x="586" y="134" fill="#1D4ED8" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">S₀</text>
          <line x1="370" y1="92" x2="575" y2="92" stroke="#D97706" strokeWidth="3.5" />
          <text x="586" y="96" fill="#D97706" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">T₁</text>
          <line x1="370" y1="56" x2="575" y2="56" stroke="#0891B2" strokeWidth="3.5" />
          <text x="586" y="60" fill="#0891B2" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">S₁</text>

          {/* Right: Spin Pairing Boxes */}
          {[
            { x: 660, lbl: 'S₀ (↑↓)', col: '#1D4ED8', spins: ['↑', '↓'] },
            { x: 728, lbl: 'S₁ (↑↓)', col: '#0891B2', spins: ['↑', '↓'] },
            { x: 796, lbl: 'T₁ (↑↑)', col: '#D97706', spins: ['↑', '↑'] },
          ].map((orb) => (
            <g key={orb.lbl}>
              <rect x={orb.x} y="38" width="52" height="72" rx="6" fill="#F8FAFC" stroke={orb.col} strokeWidth="1.5" />
              <line x1={orb.x + 10} y1="60" x2={orb.x + 42} y2="60" stroke="#94A3B8" strokeWidth="1.5" />
              <line x1={orb.x + 10} y1="92" x2={orb.x + 42} y2="92" stroke="#94A3B8" strokeWidth="1.5" />
              {orb.lbl.startsWith('S₀') ? (
                <text x={orb.x + 26} y="89" textAnchor="middle" fill={orb.col} fontSize="15" fontWeight="700">↑↓</text>
              ) : (
                <>
                  <text x={orb.x + 26} y="57" textAnchor="middle" fill={orb.col} fontSize="14" fontWeight="700">{orb.spins[0]}</text>
                  <text x={orb.x + 26} y="89" textAnchor="middle" fill={orb.col} fontSize="14" fontWeight="700">{orb.spins[1]}</text>
                </>
              )}
              <text x={orb.x + 26} y="128" textAnchor="middle" fill={orb.col} fontSize="10.5" fontFamily="IBM Plex Mono" fontWeight="700">{orb.lbl}</text>
            </g>
          ))}
        </svg>
      );

    case 7:
      return (
        <svg viewBox="0 0 500 340" className="w-full h-full">
          {/* Singlet Manifold */}
          <text x="125" y="22" textAnchor="middle" fill="#0F172A" fontSize="11.5" fontWeight="700">Singlet States</text>
          <text x="385" y="22" textAnchor="middle" fill="#D97706" fontSize="11.5" fontWeight="700">Triplet State</text>

          {/* S2 */}
          <line x1="55" y1="58" x2="215" y2="58" stroke="#0891B2" strokeWidth="3.2" />
          <line x1="55" y1="45" x2="215" y2="45" stroke="#CBD5E1" strokeWidth="1" />
          <text x="30" y="62" fill="#0891B2" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">S₂</text>

          {/* S1 */}
          <line x1="55" y1="145" x2="215" y2="145" stroke="#0891B2" strokeWidth="3.2" />
          <line x1="55" y1="132" x2="215" y2="132" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="55" y1="119" x2="215" y2="119" stroke="#CBD5E1" strokeWidth="1" />
          <text x="30" y="149" fill="#0891B2" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">S₁</text>

          {/* T1 */}
          <line x1="305" y1="190" x2="455" y2="190" stroke="#D97706" strokeWidth="3.2" />
          <line x1="305" y1="177" x2="455" y2="177" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="305" y1="164" x2="455" y2="164" stroke="#CBD5E1" strokeWidth="1" />
          <text x="466" y="194" fill="#D97706" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">T₁</text>

          {/* S0 */}
          <line x1="55" y1="305" x2="455" y2="305" stroke="#1D4ED8" strokeWidth="3.5" />
          <line x1="55" y1="292" x2="215" y2="292" stroke="#CBD5E1" strokeWidth="1" />
          <line x1="55" y1="279" x2="215" y2="279" stroke="#CBD5E1" strokeWidth="1" />
          <text x="30" y="309" fill="#1D4ED8" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">S₀</text>

          {/* Absorption */}
          <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.2 }}>
            <line x1="90" y1="302" x2="90" y2="56" stroke="#D97706" strokeWidth="2.6" />
            <polygon points="90,46 85,59 95,59" fill="#D97706" />
            <text x="97" y="215" fill="#D97706" fontSize="10.5" fontWeight="700">Absorption</text>
            <text x="97" y="229" fill="#94A3B8" fontSize="9.5" fontFamily="IBM Plex Mono">(~10⁻¹⁵ s)</text>
          </motion.g>

          {/* IC S2 -> S1 */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.4 }}>
            <path d="M 145 58 Q 139 74 145 90 Q 151 106 145 128" fill="none" stroke="#059669" strokeWidth="2.2" />
            <polygon points="145,136 140,126 150,126" fill="#059669" />
            <text x="155" y="96" fill="#059669" fontSize="10" fontWeight="700">IC / VR</text>
          </motion.g>

          {/* Fluorescence */}
          <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <line x1="185" y1="148" x2="185" y2="294" stroke="#1D4ED8" strokeWidth="2.6" />
            <polygon points="185,303 180,290 190,290" fill="#1D4ED8" />
            <text x="193" y="220" fill="#1D4ED8" fontSize="10.5" fontWeight="700">Fluorescence</text>
            <text x="193" y="234" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">(~10⁻⁹ s)</text>
          </motion.g>

          {/* ISC S1 -> T1 */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45, delay: 0.7 }}>
            <path d="M 218 145 Q 258 148 298 175" fill="none" stroke="#D97706" strokeWidth="2.2" strokeDasharray="5 3" />
            <polygon points="304,180 293,178 299,169" fill="#D97706" />
            <text x="260" y="142" textAnchor="middle" fill="#D97706" fontSize="10.5" fontWeight="700">ISC</text>
          </motion.g>

          {/* Phosphorescence */}
          <motion.g initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.85 }}>
            <line x1="365" y1="193" x2="365" y2="294" stroke="#DC2626" strokeWidth="2.6" />
            <polygon points="365,303 360,290 370,290" fill="#DC2626" />
            <text x="373" y="242" fill="#DC2626" fontSize="10.5" fontWeight="700">Phosphorescence</text>
            <text x="373" y="256" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">(~10⁻³–10⁰ s)</text>
          </motion.g>
        </svg>
      );

    case 9:
      return (
        <svg viewBox="0 0 460 110" className="w-full h-full">
          <rect x="8" y="10" width="212" height="90" rx="8" fill="#ECFEFF" stroke="#0891B2" strokeWidth="1.2" />
          <text x="114" y="34" textAnchor="middle" fill="#155E75" fontSize="11" fontWeight="700">Photoisomerization (cis → trans)</text>
          <text x="114" y="58" textAnchor="middle" fill="#0F172A" fontSize="11" fontFamily="IBM Plex Mono">R₂C=CR₂ + hν → [π→π*] → trans</text>
          <text x="114" y="80" textAnchor="middle" fill="#64748B" fontSize="9.5">Reduced C=C bond order enables twist</text>

          <rect x="236" y="10" width="216" height="90" rx="8" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.2" />
          <text x="344" y="34" textAnchor="middle" fill="#92400E" fontSize="11" fontWeight="700">Photodissociation (Cleavage)</text>
          <text x="344" y="58" textAnchor="middle" fill="#0F172A" fontSize="11" fontFamily="IBM Plex Mono">A—B + hν → (A—B)* → A• + B•</text>
          <text x="344" y="80" textAnchor="middle" fill="#64748B" fontSize="9.5">σ → σ* population breaks bond</text>
        </svg>
      );

    case 10:
      return (
        <svg viewBox="0 0 460 120" className="w-full h-full">
          {[
            { y: 12, w: 410, col: '#D97706', label: 'Absorbed Photon Energy (hν)' },
            { y: 40, w: 315, col: '#0891B2', label: 'After VR / IC Relaxation' },
            { y: 68, w: 245, col: '#1D4ED8', label: 'Reactive Excited-State Energy' },
            { y: 96, w: 170, col: '#059669', label: 'Net Chemical Work / Products' },
          ].map((b, i) => (
            <motion.g key={b.label} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} style={{ transformOrigin: '16px 0px' }} transition={{ duration: 0.45, delay: 0.2 + i * 0.12 }}>
              <rect x="16" y={b.y} width={b.w} height="20" rx="4" fill={b.col} />
              <text x="24" y={b.y + 14} fill="#FFFFFF" fontSize="10" fontWeight="600">{b.label}</text>
            </motion.g>
          ))}
        </svg>
      );

    case 11:
      return (
        <svg viewBox="0 0 480 340" className="w-full h-full">
          <line x1="45" y1="18" x2="45" y2="305" stroke="#64748B" strokeWidth="1.6" />
          <line x1="45" y1="305" x2="452" y2="305" stroke="#64748B" strokeWidth="1.6" />
          <polygon points="460,305 449,300 449,310" fill="#64748B" />
          <text x="16" y="32" fill="#64748B" fontSize="11" fontFamily="IBM Plex Mono">E</text>
          <text x="255" y="328" textAnchor="middle" fill="#64748B" fontSize="11" fontFamily="IBM Plex Mono">Reaction coordinate (schematic)</text>

          {/* Ground State Surface */}
          <motion.path
            d="M 65 268 C 145 268, 175 168, 232 168 C 288 168, 315 276, 372 276 C 408 276, 425 256, 442 252"
            fill="none"
            stroke="#1D4ED8"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          <text x="72" y="288" fill="#1D4ED8" fontSize="11" fontWeight="700">Ground State (S₀)</text>

          {/* Excited State Surface dipping into Conical Intersection */}
          <motion.path
            d="M 65 82 C 135 72, 185 152, 232 156 C 285 152, 345 68, 435 64"
            fill="none"
            stroke="#0891B2"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          />
          <text x="315" y="56" fill="#0891B2" fontSize="11" fontWeight="700">Excited State (S₁)</text>

          {/* Photoexcitation */}
          <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.55 }}>
            <line x1="92" y1="264" x2="92" y2="90" stroke="#D97706" strokeWidth="2.8" />
            <polygon points="92,80 86,94 98,94" fill="#D97706" />
            <text x="98" y="145" fill="#D97706" fontSize="10.5" fontWeight="700">Photoexcitation</text>
          </motion.g>

          {/* Conical Intersection marker */}
          <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ transformOrigin: '232px 162px' }} transition={{ duration: 0.45, delay: 0.75 }}>
            <circle cx="232" cy="162" r="14" fill="#FFFBEB" stroke="#D97706" strokeWidth="2.2" />
            <text x="232" y="166" textAnchor="middle" fill="#92400E" fontSize="10" fontWeight="700">CI</text>
            <text x="232" y="138" textAnchor="middle" fill="#D97706" fontSize="10.5" fontWeight="700">Conical Intersection</text>
          </motion.g>

          {/* Funnel arrow to product */}
          <path d="M 244 172 Q 290 225 348 268" fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="4 3" />
          <polygon points="354,273 343,270 349,262" fill="#059669" />
          <text x="366" y="290" fill="#059669" fontSize="10" fontWeight="700">Product</text>
        </svg>
      );

    case 12:
      return (
        <svg viewBox="0 0 460 115" className="w-full h-full">
          {[
            { y: 10, w: 175, col: '#DC2626', lbl: 'Φ < 1 · Quenching & relaxation losses' },
            { y: 45, w: 295, col: '#0891B2', lbl: 'Φ = 1 · Ideal primary quantum event' },
            { y: 80, w: 415, col: '#059669', lbl: 'Φ > 1 · Photoinitiated chain propagation' },
          ].map((r, i) => (
            <motion.g key={r.lbl} initial={{ opacity: 0, scaleX: 0 }} animate={{ opacity: 1, scaleX: 1 }} style={{ transformOrigin: '14px 0px' }} transition={{ duration: 0.45, delay: 0.2 + i * 0.12 }}>
              <rect x="14" y={r.y} width={r.w} height="24" rx="5" fill={r.col} />
              <text x="24" y={r.y + 16} fill="#FFFFFF" fontSize="10.5" fontWeight="600">{r.lbl}</text>
            </motion.g>
          ))}
        </svg>
      );

    case 14:
      return (
        <svg viewBox="0 0 480 120" className="w-full h-full">
          <text x="12" y="16" fill="#64748B" fontSize="9.5" fontFamily="IBM Plex Mono">Redox Potential (E°′)</text>
          {[
            { x: 16, y: 78, w: 72, lbl: 'H₂O → O₂', sub: '+0.82 V', col: '#1D4ED8' },
            { x: 104, y: 18, w: 74, lbl: 'P680*', sub: '−0.8 V', col: '#0891B2' },
            { x: 196, y: 55, w: 86, lbl: 'Cyt b₆f / PC', sub: '+0.35 V', col: '#D97706' },
            { x: 300, y: 12, w: 74, lbl: 'P700*', sub: '−1.2 V', col: '#0891B2' },
            { x: 392, y: 46, w: 76, lbl: 'NADPH', sub: '−0.32 V', col: '#059669' },
          ].map((n, i) => (
            <g key={n.lbl}>
              <rect x={n.x} y={n.y} width={n.w} height="34" rx="5" fill="#FFFFFF" stroke={n.col} strokeWidth="1.5" />
              <text x={n.x + n.w / 2} y={n.y + 15} textAnchor="middle" fill={n.col} fontSize="10" fontWeight="700">{n.lbl}</text>
              <text x={n.x + n.w / 2} y={n.y + 28} textAnchor="middle" fill="#64748B" fontSize="8.5" fontFamily="IBM Plex Mono">{n.sub}</text>
              {i === 0 && <line x1="88" y1="82" x2="104" y2="42" stroke="#D97706" strokeWidth="2" />}
              {i === 1 && <line x1="178" y1="36" x2="196" y2="68" stroke="#64748B" strokeWidth="1.8" strokeDasharray="3 2" />}
              {i === 2 && <line x1="282" y1="68" x2="300" y2="34" stroke="#D97706" strokeWidth="2" />}
              {i === 3 && <line x1="374" y1="28" x2="392" y2="56" stroke="#059669" strokeWidth="2" />}
            </g>
          ))}
        </svg>
      );

    case 15:
      return (
        <svg viewBox="0 0 460 250" className="w-full h-full">
          {/* Conduction Band */}
          <rect x="42" y="24" width="320" height="58" rx="6" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.8" />
          <text x="202" y="50" textAnchor="middle" fill="#1D4ED8" fontSize="13" fontWeight="700">Conduction Band (CB)</text>
          <text x="202" y="68" textAnchor="middle" fill="#1E40AF" fontSize="10">Reduction reactions (A + e⁻ → A•⁻)</text>
          <circle cx="395" cy="53" r="16" fill="#1D4ED8" />
          <text x="395" y="58" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">e⁻</text>

          {/* Valence Band */}
          <rect x="42" y="168" width="320" height="58" rx="6" fill="#ECFEFF" stroke="#0891B2" strokeWidth="1.8" />
          <text x="202" y="194" textAnchor="middle" fill="#0891B2" fontSize="13" fontWeight="700">Valence Band (VB)</text>
          <text x="202" y="212" textAnchor="middle" fill="#155E75" fontSize="10">Oxidation reactions (D + h⁺ → D•⁺)</text>
          <circle cx="395" cy="197" r="16" fill="#0891B2" />
          <text x="395" y="202" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontFamily="IBM Plex Mono" fontWeight="700">h⁺</text>

          {/* Excitation arrow */}
          <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
            <line x1="145" y1="164" x2="145" y2="92" stroke="#D97706" strokeWidth="3" />
            <polygon points="145,84 139,96 151,96" fill="#D97706" />
            <text x="72" y="129" fill="#D97706" fontSize="12.5" fontFamily="IBM Plex Mono" fontWeight="700">hν ≥ E_g</text>
          </motion.g>

          {/* Recombination arrow */}
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.55 }}>
            <line x1="275" y1="86" x2="275" y2="158" stroke="#DC2626" strokeWidth="2.2" strokeDasharray="4 3" />
            <polygon points="275,166 270,155 280,155" fill="#DC2626" />
            <text x="284" y="128" fill="#DC2626" fontSize="10.5" fontWeight="600">Recombination</text>
          </motion.g>
        </svg>
      );

    case 16:
      return (
        <svg viewBox="0 0 460 115" className="w-full h-full">
          {[
            { x: 10, w: 86, title: 'Front', sub: 'Contact', fill: '#F1F5F9', stroke: '#64748B' },
            { x: 106, w: 120, title: 'n-Type Layer', sub: 'e⁻ collection', fill: '#EFF6FF', stroke: '#1D4ED8' },
            { x: 236, w: 120, title: 'p-Type Layer', sub: 'h⁺ collection', fill: '#ECFEFF', stroke: '#0891B2' },
            { x: 366, w: 84, title: 'Load', sub: 'Power Out', fill: '#ECFDF5', stroke: '#059669' },
          ].map((l) => (
            <g key={l.title}>
              <rect x={l.x} y="16" width={l.w} height="82" rx="6" fill={l.fill} stroke={l.stroke} strokeWidth="1.5" />
              <text x={l.x + l.w / 2} y="52" textAnchor="middle" fill="#0F172A" fontSize="11" fontWeight="700">{l.title}</text>
              <text x={l.x + l.w / 2} y="70" textAnchor="middle" fill="#64748B" fontSize="9.5">{l.sub}</text>
            </g>
          ))}
        </svg>
      );

    case 17:
      return (
        <svg viewBox="0 0 460 110" className="w-full h-full">
          <rect x="12" y="14" width="436" height="82" rx="8" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.2" />
          <text x="230" y="42" textAnchor="middle" fill="#1D4ED8" fontSize="11.5" fontWeight="700">[2+2] Photocycloaddition & Photoredox Pathway</text>
          <text x="230" y="68" textAnchor="middle" fill="#0F172A" fontSize="11.5" fontFamily="IBM Plex Mono">
            Alkene₁ + Alkene₂ + hν (PS) → [³Excited] → Cyclobutane
          </text>
        </svg>
      );

    case 18:
      return (
        <svg viewBox="0 0 460 110" className="w-full h-full">
          {[
            { x: 14, txt: 'NO₂ + hν', sub: 'λ < 420 nm', fill: '#FFFBEB', stroke: '#D97706' },
            { x: 168, txt: 'NO + O(³P)', sub: 'Photolysis', fill: '#EFF6FF', stroke: '#1D4ED8' },
            { x: 322, txt: 'O₃ + M', sub: 'O + O₂ + M', fill: '#ECFEFF', stroke: '#0891B2' },
          ].map((n, i) => (
            <g key={n.txt}>
              <rect x={n.x} y="18" width="124" height="72" rx="7" fill={n.fill} stroke={n.stroke} strokeWidth="1.5" />
              <text x={n.x + 62} y="50" textAnchor="middle" fill="#0F172A" fontSize="12" fontFamily="IBM Plex Mono" fontWeight="700">{n.txt}</text>
              <text x={n.x + 62} y="70" textAnchor="middle" fill="#64748B" fontSize="9.5">{n.sub}</text>
              {i < 2 && (
                <>
                  <line x1={n.x + 128} y1="54" x2={n.x + 150} y2="54" stroke="#D97706" strokeWidth="2.2" />
                  <polygon points={`${n.x + 155},54 ${n.x + 146},49 ${n.x + 146},59`} fill="#D97706" />
                </>
              )}
            </g>
          ))}
        </svg>
      );

    case 19:
      return (
        <svg viewBox="0 0 460 105" className="w-full h-full">
          <rect x="12" y="25" width="112" height="54" rx="7" fill="#FFFBEB" stroke="#D97706" strokeWidth="1.5" />
          <text x="68" y="57" textAnchor="middle" fill="#92400E" fontSize="12" fontWeight="700">³PS* (Triplet)</text>
          <line x1="126" y1="42" x2="178" y2="28" stroke="#1D4ED8" strokeWidth="2" />
          <line x1="126" y1="62" x2="178" y2="76" stroke="#0891B2" strokeWidth="2" />
          <rect x="182" y="8" width="266" height="40" rx="6" fill="#EFF6FF" stroke="#1D4ED8" strokeWidth="1.2" />
          <text x="315" y="33" textAnchor="middle" fill="#1E3A8A" fontSize="11" fontWeight="600">Type I: e⁻ / H• transfer → O₂•⁻, •OH radicals</text>
          <rect x="182" y="56" width="266" height="40" rx="6" fill="#ECFEFF" stroke="#0891B2" strokeWidth="1.2" />
          <text x="315" y="81" textAnchor="middle" fill="#155E75" fontSize="11" fontWeight="600">Type II: Energy transfer → ¹O₂ (Singlet O₂)</text>
        </svg>
      );

    case 20:
      return (
        <svg viewBox="0 0 460 115" className="w-full h-full">
          <line x1="24" y1="26" x2="436" y2="26" stroke="#1D4ED8" strokeWidth="2.2" strokeDasharray="6 4" />
          <text x="28" y="18" fill="#1D4ED8" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="700">E°(H⁺/H₂) = 0.00 V vs. NHE · Photocathode</text>
          <line x1="24" y1="88" x2="436" y2="88" stroke="#0891B2" strokeWidth="2.2" strokeDasharray="6 4" />
          <text x="28" y="105" fill="#0891B2" fontSize="10" fontFamily="IBM Plex Mono" fontWeight="700">E°(O₂/H₂O) = +1.23 V vs. NHE · Photoanode</text>
          <line x1="225" y1="30" x2="225" y2="84" stroke="#D97706" strokeWidth="2.4" />
          <text x="236" y="61" fill="#D97706" fontSize="11" fontFamily="IBM Plex Mono" fontWeight="700">ΔE° = 1.23 V + η</text>
        </svg>
      );

    default:
      return null;
  }
};
