/**
 * Visage féminin 2D simple et lisible, style hologramme rose néon.
 * viewBox 200×260 — les coordonnées correspondent aux points dans HolographicFaceTraits (buildZones).
 */
export default function HolographicHead3D() {
  const pink = '#ff4d88'
  const pinkSoft = '#ff9ec4'
  const pinkDim = '#b8356a'

  return (
    <div className="h-full w-full min-h-0 flex items-center justify-center select-none">
      <svg
        viewBox="0 0 200 260"
        className="w-full h-full max-h-[min(320px,58vw)]"
        preserveAspectRatio="xMidYMid meet"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          <filter id="holoGlow" x="-35%" y="-35%" width="170%" height="170%">
            <feGaussianBlur stdDeviation="1.2" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="faceFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={pink} stopOpacity="0.06" />
            <stop offset="45%" stopColor="#3d1528" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#140810" stopOpacity="0.32" />
          </linearGradient>
          <radialGradient id="cheekSoft" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={pink} stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Grille légère (scan) */}
        <g opacity={0.22} stroke={pinkDim} strokeWidth={0.3} fill="none">
          {Array.from({ length: 9 }, (_, i) => (
            <line key={`v${i}`} x1={40 + i * 15} y1={52} x2={40 + i * 15} y2={210} />
          ))}
          {Array.from({ length: 11 }, (_, i) => (
            <line key={`h${i}`} x1={44} y1={56 + i * 15} x2={156} y2={56 + i * 15} />
          ))}
        </g>

        {/* Oreilles — plus discrètes, humaines */}
        <g filter="url(#holoGlow)" opacity={0.95}>
          <path
            d="M 38 108 Q 30 124 38 142"
            fill="url(#faceFill)"
            stroke={pink}
            strokeWidth={0.85}
          />
          <path
            d="M 162 108 Q 170 124 162 142"
            fill="url(#faceFill)"
            stroke={pink}
            strokeWidth={0.85}
          />
        </g>

        {/* Contour visage : ovale allongé, menton doux */}
        <path
          filter="url(#holoGlow)"
          fill="url(#faceFill)"
          stroke={pink}
          strokeWidth={1}
          d="M 100 44
             C 128 44 152 58 158 86
             C 162 108 160 128 156 152
             C 150 188 132 214 100 224
             C 68 214 50 188 44 152
             C 40 128 38 108 42 86
             C 48 58 72 44 100 44 Z"
        />

        {/* Joues — volume doux */}
        <ellipse cx={56} cy={118} rx={18} ry={16} fill="url(#cheekSoft)" />
        <ellipse cx={144} cy={118} rx={18} ry={16} fill="url(#cheekSoft)" />

        {/* Sourcils naturels */}
        <g fill="none" stroke={pink} strokeWidth={1} strokeLinecap="round" filter="url(#holoGlow)">
          <path d="M 58 86 Q 74 80 88 84" />
          <path d="M 112 84 Q 126 80 142 86" />
        </g>

        {/* Yeux en amande, taille humaine (centres ~71, 129 @ y=100) */}
        <g>
          <ellipse cx={71} cy={100} rx={17} ry={10.5} fill="#0a0306" stroke={pink} strokeWidth={0.65} />
          <ellipse cx={129} cy={100} rx={17} ry={10.5} fill="#0a0306" stroke={pink} strokeWidth={0.65} />
          <ellipse cx={71} cy={100} rx={13} ry={8} fill="rgba(255,235,245,0.12)" />
          <ellipse cx={129} cy={100} rx={13} ry={8} fill="rgba(255,235,245,0.12)" />
          <ellipse cx={71} cy={100} rx={6} ry={6.5} fill="rgba(255,70,130,0.4)" stroke={pinkSoft} strokeWidth={0.45} />
          <ellipse cx={129} cy={100} rx={6} ry={6.5} fill="rgba(255,70,130,0.4)" stroke={pinkSoft} strokeWidth={0.45} />
          <circle cx={71} cy={100} r={2.8} fill="#0c0206" />
          <circle cx={129} cy={100} r={2.8} fill="#0c0206" />
          <circle cx={72.2} cy={98.8} r={0.9} fill="rgba(255,255,255,0.5)" />
          <circle cx={130.2} cy={98.8} r={0.9} fill="rgba(255,255,255,0.5)" />
        </g>

        {/* Paupières supérieures */}
        <path
          d="M 56 98 Q 71 91 86 98"
          fill="none"
          stroke={pink}
          strokeWidth={0.7}
          strokeLinecap="round"
          filter="url(#holoGlow)"
        />
        <path
          d="M 114 98 Q 129 91 144 98"
          fill="none"
          stroke={pink}
          strokeWidth={0.7}
          strokeLinecap="round"
          filter="url(#holoGlow)"
        />
        <path
          d="M 58 102 Q 71 105 84 102"
          fill="none"
          stroke={pinkSoft}
          strokeWidth={0.45}
          strokeLinecap="round"
          opacity={0.85}
        />
        <path
          d="M 116 102 Q 129 105 142 102"
          fill="none"
          stroke={pinkSoft}
          strokeWidth={0.45}
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* Cils courts, naturels */}
        <g stroke={pink} strokeWidth={0.65} strokeLinecap="round" opacity={0.9}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line x1={59 + i * 4.2} y1={94} x2={58 + i * 4.1} y2={88} />
              <line x1={117 + i * 4.2} y1={94} x2={118 + i * 4.1} y2={88} />
            </g>
          ))}
        </g>

        {/* Nez doux : arête + bout */}
        <g fill="none" stroke={pink} strokeLinecap="round" filter="url(#holoGlow)">
          <path d="M 100 94 L 100 138" strokeWidth={0.55} opacity={0.75} />
          <path d="M 100 138 Q 92 146 88 152" strokeWidth={0.5} />
          <path d="M 100 138 Q 108 146 112 152" strokeWidth={0.5} />
          <path d="M 92 154 Q 100 158 108 154" strokeWidth={0.45} opacity={0.8} />
        </g>

        {/* Philtrum */}
        <path d="M 100 156 L 100 168" stroke={pinkDim} strokeWidth={0.4} opacity={0.75} />

        {/* Bouche : lèvre sup + inf, forme humaine simple */}
        <g filter="url(#holoGlow)">
          <path
            d="M 82 172 Q 100 164 118 172 Q 100 178 82 172"
            fill="rgba(255,77,136,0.1)"
            stroke={pink}
            strokeWidth={0.9}
            strokeLinejoin="round"
          />
          <path
            d="M 86 176 Q 100 182 114 176"
            fill="none"
            stroke={pinkSoft}
            strokeWidth={0.75}
            strokeLinecap="round"
          />
        </g>

        {/* Menton */}
        <path
          d="M 78 206 Q 100 218 122 206"
          fill="none"
          stroke={pink}
          strokeWidth={0.75}
          strokeLinecap="round"
          opacity={0.8}
        />

        {/* Cou */}
        <path
          d="M 74 220 Q 100 230 126 220 L 124 252 L 76 252 Z"
          fill="rgba(18,6,12,0.5)"
          stroke={pinkDim}
          strokeWidth={0.45}
          opacity={0.65}
        />

      </svg>
    </div>
  )
}
