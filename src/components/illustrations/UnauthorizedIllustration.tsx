export default function UnauthorizedIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="key-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="door-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background elements */}
      <rect width="100%" height="100%" fill="#f8fafc" />
      
      {/* Floor */}
      <rect x="0" y="250" width="400" height="50" fill="#e2e8f0" />
      
      {/* Door frame */}
      <g transform="translate(150, 80)">
        {/* Door */}
        <rect x="0" y="0" width="100" height="170" fill="url(#door-gradient)" rx="8" />
        <rect x="5" y="5" width="90" height="160" fill="#6d28d9" rx="4" />
        
        {/* Door panels */}
        <rect x="15" y="20" width="70" height="60" fill="#5b21b6" rx="4" />
        <rect x="15" y="90" width="70" height="60" fill="#5b21b6" rx="4" />
        
        {/* Door handle */}
        <circle cx="80" cy="85" r="4" fill="#374151" />
        <circle cx="80" cy="85" r="2" fill="#9ca3af" />
        
        {/* Keyhole */}
        <circle cx="80" cy="95" r="3" fill="#1f2937" />
        <rect x="79" y="95" width="2" height="6" fill="#1f2937" />
        
        {/* Door frame */}
        <rect x="-10" y="-10" width="120" height="190" fill="none" stroke="#4b5563" strokeWidth="8" rx="12" />
      </g>

      {/* Large key floating */}
      <g transform="translate(280, 120)">
        {/* Key head */}
        <circle cx="0" cy="0" r="20" fill="url(#key-gradient)" filter="url(#glow)" />
        <circle cx="0" cy="0" r="15" fill="none" stroke="#f59e0b" strokeWidth="3" />
        <circle cx="0" cy="0" r="8" fill="none" stroke="#f59e0b" strokeWidth="2" />
        
        {/* Key shaft */}
        <rect x="15" y="-3" width="40" height="6" fill="url(#key-gradient)" />
        
        {/* Key teeth */}
        <rect x="50" y="-3" width="8" height="6" fill="url(#key-gradient)" />
        <rect x="45" y="3" width="6" height="8" fill="url(#key-gradient)" />
        <rect x="52" y="3" width="4" height="5" fill="url(#key-gradient)" />
        
        {/* Floating animation */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="280,120;285,115;280,120"
          dur="3s"
          repeatCount="indefinite"
        />
        
        {/* Rotation animation */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 0 0;10 0 0;-10 0 0;0 0 0"
          dur="4s"
          repeatCount="indefinite"
          additive="sum"
        />
      </g>

      {/* Question marks */}
      <g opacity="0.7">
        <g transform="translate(100, 100)">
          <circle cx="0" cy="0" r="15" fill="#6b7280" opacity="0.8" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">?</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="100,100;105,95;100,100"
            dur="2s"
            repeatCount="indefinite"
          />
        </g>
        
        <g transform="translate(320, 200)">
          <circle cx="0" cy="0" r="12" fill="#6b7280" opacity="0.6" />
          <text x="0" y="4" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">?</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="320,200;315,205;320,200"
            dur="3s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* User silhouette */}
      <g transform="translate(80, 180)" opacity="0.8">
        {/* Head */}
        <circle cx="0" cy="-20" r="12" fill="#4b5563" />
        
        {/* Body */}
        <ellipse cx="0" cy="10" rx="15" ry="25" fill="#4b5563" />
        
        {/* Arms */}
        <ellipse cx="-12" cy="5" rx="6" ry="15" fill="#4b5563" />
        <ellipse cx="12" cy="5" rx="6" ry="15" fill="#4b5563" />
        
        {/* Legs */}
        <ellipse cx="-6" cy="35" rx="6" ry="20" fill="#4b5563" />
        <ellipse cx="6" cy="35" rx="6" ry="20" fill="#4b5563" />
        
        {/* Confused gesture */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="80,180;85,180;75,180;80,180"
          dur="4s"
          repeatCount="indefinite"
        />
      </g>

      {/* Lock icons scattered */}
      <g opacity="0.4">
        <g transform="translate(50, 50)">
          <rect x="-4" y="0" width="8" height="6" fill="#ef4444" rx="1" />
          <path d="M-3,-3 C-3,-5 -1,-6 0,-6 C1,-6 3,-5 3,-3 L3,0" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2s" repeatCount="indefinite" />
        </g>
        
        <g transform="translate(350, 80)">
          <rect x="-4" y="0" width="8" height="6" fill="#ef4444" rx="1" />
          <path d="M-3,-3 C-3,-5 -1,-6 0,-6 C1,-6 3,-5 3,-3 L3,0" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite" />
        </g>
        
        <g transform="translate(60, 220)">
          <rect x="-4" y="0" width="8" height="6" fill="#ef4444" rx="1" />
          <path d="M-3,-3 C-3,-5 -1,-6 0,-6 C1,-6 3,-5 3,-3 L3,0" fill="none" stroke="#ef4444" strokeWidth="1.5" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
        </g>
      </g>

      {/* "LOGIN REQUIRED" banner */}
      <g transform="translate(200, 40)" opacity="0.8">
        <rect x="-70" y="-8" width="140" height="16" fill="#3b82f6" rx="8" />
        <text x="0" y="2" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">
          CONNEXION REQUISE
        </text>
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="2s" repeatCount="indefinite" />
      </g>

      {/* Sparkles around key */}
      <g>
        <circle cx="260" cy="100" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="310" cy="110" r="1.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" begin="0.3s" />
        </circle>
        <circle cx="290" cy="90" r="1" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="1.2s" repeatCount="indefinite" begin="0.6s" />
        </circle>
      </g>
    </svg>
  );
}