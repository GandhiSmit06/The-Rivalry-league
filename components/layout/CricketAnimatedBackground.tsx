'use client'


export function CricketAnimatedBackground() {
  return (
    <div className="cricket-bg-container" aria-hidden="true">
      <svg
        className="cricket-bg-svg"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Deep Stadium Atmospheric Gradients */}
          <radialGradient id="stadiumDome" cx="50%" cy="15%" r="75%">
            <stop offset="0%" stopColor="#1e3256" stopOpacity="0.45" />
            <stop offset="40%" stopColor="#121e33" stopOpacity="0.25" />
            <stop offset="85%" stopColor="#080d18" stopOpacity="0" />
          </radialGradient>

          {/* Stadium Floodlight Beams */}
          <linearGradient id="floodlightLeft" x1="0%" y1="0%" x2="45%" y2="85%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#080d18" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="floodlightRight" x1="100%" y1="0%" x2="55%" y2="85%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="35%" stopColor="#f59e0b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#080d18" stopOpacity="0" />
          </linearGradient>

          {/* Premium Cricket Leather Ball Radial Sphere */}
          <radialGradient id="cricketLeatherBall" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#f87171" stopOpacity="0.4" />
            <stop offset="40%" stopColor="#dc2626" stopOpacity="0.25" />
            <stop offset="80%" stopColor="#991b1b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#450a0a" stopOpacity="0" />
          </radialGradient>

          {/* English Willow Cricket Bat Gradient */}
          <linearGradient id="willowWood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.25" />
            <stop offset="40%" stopColor="#f59e0b" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#78350f" stopOpacity="0.05" />
          </linearGradient>

          {/* Wicket Golden Glow */}
          <linearGradient id="stumpGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#d97706" stopOpacity="0.08" />
          </linearGradient>

          {/* Hawk-Eye Trajectory Gradient */}
          <linearGradient id="hawkeyeTrail" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* 1. STADIUM DOME AMBIENT LIGHT */}
        <rect x="0" y="0" width="1440" height="900" fill="url(#stadiumDome)" />

        {/* 2. SWEEPING FLOODLIGHT BEAMS (Animated Sway & Pulse) */}
        <g className="floodlight-group">
          {/* Top Left Floodlight Tower Beams */}
          <polygon
            points="0,0 650,900 320,900"
            fill="url(#floodlightLeft)"
            className="floodlight-beam beam-one"
          />
          <polygon
            points="120,0 800,900 480,900"
            fill="url(#floodlightLeft)"
            className="floodlight-beam beam-two"
          />

          {/* Top Right Floodlight Tower Beams */}
          <polygon
            points="1440,0 820,900 1150,900"
            fill="url(#floodlightRight)"
            className="floodlight-beam beam-three"
          />
          <polygon
            points="1320,0 680,900 980,900"
            fill="url(#floodlightRight)"
            className="floodlight-beam beam-four"
          />
        </g>

        {/* 3. GROUND PITCH GEOMETRY & BOUNDARY CIRCLES */}
        <g opacity="0.18">
          {/* Inner 30-Yard Circle Arc */}
          <ellipse cx="720" cy="720" rx="620" ry="240" fill="none" stroke="#38bdf8" strokeWidth="1" strokeDasharray="6 8" />
          {/* Boundary Rope Arc */}
          <ellipse cx="720" cy="740" rx="780" ry="290" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 12" />
          {/* Pitch Crease Lines */}
          <line x1="620" y1="560" x2="820" y2="560" stroke="#f59e0b" strokeWidth="1.5" opacity="0.6" />
          <line x1="600" y1="590" x2="840" y2="590" stroke="#ffffff" strokeWidth="1" opacity="0.4" />
        </g>

        {/* 4. HAWK-EYE BALL TRAJECTORY ARCS (Animated Dashflow) */}
        <g className="hawkeye-group">
          {/* Outswinging Delivery Arc from Bowling Crease */}
          <path
            d="M 120 780 C 450 620, 850 480, 1260 220"
            fill="none"
            stroke="url(#hawkeyeTrail)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="hawkeye-arc arc-one"
          />
          {/* Second Inswinging Yorker Arc */}
          <path
            d="M 220 860 C 580 720, 960 410, 1380 140"
            fill="none"
            stroke="url(#hawkeyeTrail)"
            strokeWidth="1.8"
            strokeDasharray="8 12"
            strokeLinecap="round"
            className="hawkeye-arc arc-two"
          />
          {/* Ball Bounce Impact Rings */}
          <circle cx="850" cy="480" r="14" fill="none" stroke="#38bdf8" strokeWidth="1" className="impact-ring ring-one" />
          <circle cx="850" cy="480" r="28" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" className="impact-ring ring-two" />
        </g>

        {/* 5. FLOATING WATERMARK: 3 CRICKET STUMPS & BAILS (Center-Back Depth) */}
        <g className="wickets-watermark" transform="translate(680, 240) scale(0.75)" opacity="0.22">
          {/* Left Stump */}
          <rect x="0" y="20" width="8" height="110" rx="3" fill="url(#stumpGlow)" />
          {/* Middle Stump */}
          <rect x="24" y="20" width="8" height="110" rx="3" fill="url(#stumpGlow)" />
          {/* Off Stump */}
          <rect x="48" y="20" width="8" height="110" rx="3" fill="url(#stumpGlow)" />
          {/* Bails */}
          <rect x="-3" y="14" width="30" height="5" rx="2" fill="#fbbf24" className="bail-glow" />
          <rect x="28" y="14" width="30" height="5" rx="2" fill="#fbbf24" className="bail-glow" />
          {/* Crease Ground Mark */}
          <line x1="-30" y1="130" x2="85" y2="130" stroke="#f59e0b" strokeWidth="2" opacity="0.6" />
        </g>

        {/* 6. TOP-RIGHT CELESTIAL CRICKET BALL WITH ROTATING SEAM STITCHES */}
        <g className="cricket-ball-watermark" transform="translate(1220, 140)">
          {/* Ball Sphere Glow */}
          <circle cx="0" cy="0" r="95" fill="url(#cricketLeatherBall)" />
          <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(248, 113, 113, 0.25)" strokeWidth="1.5" />

          {/* Rotating Seam Group */}
          <g className="rotating-seam">
            {/* White Raised Seam Line */}
            <path
              d="M -85 0 C -40 -35, 40 35, 85 0"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              opacity="0.6"
            />
            {/* Secondary Seam Stitching */}
            <path
              d="M -85 -4 C -40 -39, 40 31, 85 -4"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.4"
            />
            <path
              d="M -85 4 C -40 -31, 40 39, 85 4"
              fill="none"
              stroke="#fef08a"
              strokeWidth="1.2"
              strokeDasharray="2 3"
              opacity="0.4"
            />
          </g>
        </g>

        {/* 7. BOTTOM-LEFT WATERMARK: CROSSED CRICKET WILLOW BATS */}
        <g className="crossed-bats-watermark" transform="translate(140, 720) scale(0.65)" opacity="0.2">
          {/* Bat 1 (Angled Left to Right) */}
          <g transform="rotate(38)">
            {/* Blade */}
            <path d="M -12 -180 L 12 -180 L 14 20 L -14 20 Z" fill="url(#willowWood)" stroke="rgba(255,200,61,0.3)" strokeWidth="1" />
            {/* Spine Ridge */}
            <line x1="0" y1="-175" x2="0" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            {/* Rubber Grip Handle */}
            <rect x="-5" y="20" width="10" height="75" rx="3" fill="#0f172a" stroke="#f59e0b" strokeWidth="1" />
          </g>
          {/* Bat 2 (Angled Right to Left) */}
          <g transform="rotate(-38)">
            {/* Blade */}
            <path d="M -12 -180 L 12 -180 L 14 20 L -14 20 Z" fill="url(#willowWood)" stroke="rgba(255,200,61,0.3)" strokeWidth="1" />
            {/* Spine Ridge */}
            <line x1="0" y1="-175" x2="0" y2="15" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
            {/* Rubber Grip Handle */}
            <rect x="-5" y="20" width="10" height="75" rx="3" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
          </g>
        </g>

        {/* 8. FLOATING STADIUM EMBERS & GOLDEN DUST PARTICLES (Rising Bokeh) */}
        <g className="stadium-embers">
          <circle cx="280" cy="620" r="2.5" fill="#f59e0b" className="ember ember-1" />
          <circle cx="420" cy="480" r="3" fill="#38bdf8" className="ember ember-2" />
          <circle cx="650" cy="720" r="2" fill="#ffd875" className="ember ember-3" />
          <circle cx="890" cy="540" r="3.5" fill="#f59e0b" className="ember ember-4" />
          <circle cx="1080" cy="660" r="2" fill="#38bdf8" className="ember ember-5" />
          <circle cx="1240" cy="420" r="3" fill="#ffd875" className="ember ember-6" />
          <circle cx="180" cy="340" r="2.5" fill="#f59e0b" className="ember ember-7" />
          <circle cx="780" cy="280" r="2" fill="#38bdf8" className="ember ember-8" />
          <circle cx="980" cy="190" r="3" fill="#ffd875" className="ember ember-9" />
          <circle cx="520" cy="210" r="2" fill="#f59e0b" className="ember ember-10" />
        </g>
      </svg>
    </div>
  )
}

