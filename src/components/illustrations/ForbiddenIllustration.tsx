export default function ForbiddenIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="shield-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <linearGradient id="lock-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodOpacity="0.3"/>
        </filter>
      </defs>

      {/* Background pattern */}
      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1" opacity="0.5"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#grid)" />

      {/* Main shield */}
      <g transform="translate(200, 150)">
        {/* Shield body */}
        <path 
          d="M0,-80 C-40,-80 -60,-60 -60,-20 C-60,20 -40,60 0,80 C40,60 60,20 60,-20 C60,-60 40,-80 0,-80 Z" 
          fill="url(#shield-gradient)" 
          filter="url(#shadow)"
        />
        
        {/* Shield border */}
        <path 
          d="M0,-80 C-40,-80 -60,-60 -60,-20 C-60,20 -40,60 0,80 C40,60 60,20 60,-20 C60,-60 40,-80 0,-80 Z" 
          fill="none" 
          stroke="#b91c1c" 
          strokeWidth="3"
        />

        {/* Lock icon */}
        <g transform="translate(0, -10)">
          {/* Lock body */}
          <rect x="-15" y="0" width="30" height="25" fill="url(#lock-gradient)" rx="4" />
          
          {/* Lock shackle */}
          <path 
            d="M-10,-15 C-10,-25 -5,-30 0,-30 C5,-30 10,-25 10,-15 L10,0" 
            fill="none" 
            stroke="url(#lock-gradient)" 
            strokeWidth="4" 
            strokeLinecap="round"
          />
          
          {/* Keyhole */}
          <circle cx="0" cy="8" r="3" fill="#f3f4f6" />
          <rect x="-1" y="8" width="2" height="8" fill="#f3f4f6" />
        </g>

        {/* Prohibition sign (diagonal line) */}
        <line 
          x1="-45" y1="-45" 
          x2="45" y2="45" 
          stroke="#ffffff" 
          strokeWidth="8" 
          strokeLinecap="round"
          opacity="0.9"
        />

        {/* Pulsing animation */}
        <animateTransform
          attributeName="transform"
          type="scale"
          values="1;1.05;1"
          dur="2s"
          repeatCount="indefinite"
        />
      </g>

      {/* Warning signs around */}
      <g opacity="0.7">
        {/* Left warning */}
        <g transform="translate(80, 100)">
          <polygon points="0,-12 -10,8 10,8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <text x="0" y="3" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="bold">!</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80,100;85,95;80,100"
            dur="3s"
            repeatCount="indefinite"
          />
        </g>

        {/* Right warning */}
        <g transform="translate(320, 180)">
          <polygon points="0,-12 -10,8 10,8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
          <text x="0" y="3" textAnchor="middle" fill="#92400e" fontSize="12" fontWeight="bold">!</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="320,180;315,185;320,180"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Security cameras */}
      <g>
        {/* Camera 1 */}
        <g transform="translate(50, 50)">
          <rect x="0" y="0" width="20" height="12" fill="#374151" rx="2" />
          <circle cx="25" cy="6" r="8" fill="#4b5563" />
          <circle cx="25" cy="6" r="5" fill="#1f2937" />
          <circle cx="25" cy="6" r="2" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          
          {/* Camera movement */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="50,50;60,50;40,50;50,50"
            dur="8s"
            repeatCount="indefinite"
          />
        </g>

        {/* Camera 2 */}
        <g transform="translate(330, 40)">
          <rect x="0" y="0" width="20" height="12" fill="#374151" rx="2" />
          <circle cx="25" cy="6" r="8" fill="#4b5563" />
          <circle cx="25" cy="6" r="5" fill="#1f2937" />
          <circle cx="25" cy="6" r="2" fill="#ef4444">
            <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
          </circle>
          
          {/* Camera movement */}
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="330,40;340,40;320,40;330,40"
            dur="6s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Floating "ACCESS DENIED" text */}
      <g transform="translate(200, 250)" opacity="0.6">
        <rect x="-60" y="-8" width="120" height="16" fill="#ef4444" rx="8" />
        <text x="0" y="2" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">
          ACCÈS REFUSÉ
        </text>
        <animate attributeName="opacity" values="0.6;0.3;0.6" dur="2s" repeatCount="indefinite" />
      </g>

      {/* Decorative elements */}
      <g opacity="0.3">
        <circle cx="60" cy="200" r="3" fill="#ef4444">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="340" cy="120" r="2" fill="#ef4444">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="100" cy="260" r="2.5" fill="#ef4444">
          <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </g>
    </svg>
  );
}