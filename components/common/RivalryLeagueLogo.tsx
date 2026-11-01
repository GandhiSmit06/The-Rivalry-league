'use client'


export function RivalryLeagueLogo({
  size = 40,
  animated = true,
  showBadge = true
}: {
  size?: number
  animated?: boolean
  showBadge?: boolean
}) {
  return (
    <div
      className={`trl-logo-wrapper ${animated ? 'trl-animated' : ''}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      aria-label="The Rivalry League Official Logo"
    >
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="trl-svg"
      >
        <defs>
          {/* Deep Navy/Black Shield Gradient */}
          <radialGradient id="trlShieldGrad" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#162238" />
            <stop offset="65%" stopColor="#0a101d" />
            <stop offset="100%" stopColor="#04070d" />
          </radialGradient>

          {/* Championship Gold Ring Gradient */}
          <linearGradient id="trlGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe58f" />
            <stop offset="35%" stopColor="#d49a24" />
            <stop offset="70%" stopColor="#fff3b0" />
            <stop offset="100%" stopColor="#8c5807" />
          </linearGradient>

          {/* Cricket Ball Leather Red Gradient */}
          <radialGradient id="trlBallGrad" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ff4d4f" />
            <stop offset="50%" stopColor="#cf1322" />
            <stop offset="100%" stopColor="#5c0011" />
          </radialGradient>

          {/* Energy Clash Flare Gradient */}
          <radialGradient id="trlSparkGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="40%" stopColor="#ffd666" />
            <stop offset="80%" stopColor="#fa8c16" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ff4d4f" stopOpacity="0" />
          </radialGradient>

          {/* English Willow Wood Gradient for Bat 1 */}
          <linearGradient id="trlWoodA" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe7ba" />
            <stop offset="50%" stopColor="#d48806" />
            <stop offset="100%" stopColor="#613400" />
          </linearGradient>

          {/* English Willow Wood Gradient for Bat 2 */}
          <linearGradient id="trlWoodB" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1b8" />
            <stop offset="50%" stopColor="#d46b08" />
            <stop offset="100%" stopColor="#381a00" />
          </linearGradient>

          {/* Filter for subtle gold bloom */}
          <filter id="trlGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Circular Tournament Shield */}
        <circle cx="60" cy="60" r="56" fill="url(#trlShieldGrad)" stroke="url(#trlGoldRim)" strokeWidth="3" />

        {/* Rotating Energy Orbit Arc */}
        <circle
          cx="60"
          cy="60"
          r="51"
          fill="none"
          stroke="#ffe58f"
          strokeWidth="1.2"
          strokeDasharray="18 10 32 10"
          opacity="0.6"
          className="trl-orbit-ring"
        />

        {/* Crossed Cricket Bats of Rivalry */}
        <g className="trl-bats-group">
          {/* Bat 1: Team Alpha Willow Blade */}
          <g transform="translate(60,60) rotate(-42) translate(-60,-60)">
            {/* Handle Grip */}
            <rect x="57" y="10" width="6" height="24" rx="2.5" fill="#1d39c4" stroke="#85a5ff" strokeWidth="0.8" />
            {/* Grip Bindings */}
            <line x1="57" y1="16" x2="63" y2="16" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <line x1="57" y1="22" x2="63" y2="22" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            {/* Willow Blade */}
            <path
              d="M 54.5 34 L 65.5 34 L 67 98 C 67 104 60 106 60 106 C 60 106 53 104 53 98 Z"
              fill="url(#trlWoodA)"
              stroke="#8c5807"
              strokeWidth="1"
            />
            {/* Blade Ridge */}
            <line x1="60" y1="36" x2="60" y2="102" stroke="#ffffff" strokeWidth="0.9" opacity="0.4" />
          </g>

          {/* Bat 2: Team Rival Willow Blade */}
          <g transform="translate(60,60) rotate(42) translate(-60,-60)">
            {/* Handle Grip */}
            <rect x="57" y="10" width="6" height="24" rx="2.5" fill="#b37feb" stroke="#d3adf7" strokeWidth="0.8" />
            {/* Grip Bindings */}
            <line x1="57" y1="16" x2="63" y2="16" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            <line x1="57" y1="22" x2="63" y2="22" stroke="#ffffff" strokeWidth="0.8" opacity="0.6" />
            {/* Willow Blade */}
            <path
              d="M 54.5 34 L 65.5 34 L 67 98 C 67 104 60 106 60 106 C 60 106 53 104 53 98 Z"
              fill="url(#trlWoodB)"
              stroke="#8c5807"
              strokeWidth="1"
            />
            {/* Blade Ridge */}
            <line x1="60" y1="36" x2="60" y2="102" stroke="#ffffff" strokeWidth="0.9" opacity="0.4" />
          </g>
        </g>

        {/* Central Official Cricket Ball of Rivalry */}
        <g className="trl-ball-clash">
          <circle cx="60" cy="60" r="16" fill="url(#trlBallGrad)" stroke="#ffd666" strokeWidth="1.5" />
          {/* Cricket Ball White Seam Curve */}
          <path
            d="M 46 60 C 53 53, 67 67, 74 60"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeDasharray="2.5 1.8"
          />
        </g>

        {/* Central Rivalry Energy Flare */}
        <g className="trl-flare" filter="url(#trlGlow)">
          <circle cx="60" cy="60" r="12" fill="url(#trlSparkGrad)" className="trl-pulse-flare" />
          {/* Clash Lightning Spark */}
          <path
            d="M 60 48 L 62 58 L 68 59 L 61 63 L 63 72 L 58 64 L 52 63 L 58 59 Z"
            fill="#ffffff"
            className="trl-spark-star"
          />
        </g>

        {/* Bottom TRL Crown Emblem Banner */}
        {showBadge && (
          <g className="trl-badge-banner">
            <rect x="36" y="94" width="48" height="15" rx="4" fill="#0c1220" stroke="url(#trlGoldRim)" strokeWidth="1.2" />
            <text
              x="60"
              y="105"
              textAnchor="middle"
              fill="#ffe58f"
              fontFamily="'Bebas Neue', sans-serif"
              fontSize="11"
              fontWeight="800"
              letterSpacing="1.2"
            >
              RIVALRY
            </text>
          </g>
        )}
      </svg>
    </div>
  )
}

