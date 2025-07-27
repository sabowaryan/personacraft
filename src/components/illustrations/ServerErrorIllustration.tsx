export default function ServerErrorIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="server-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <linearGradient id="error-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#dc2626" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circuit pattern */}
      <g opacity="0.1">
        <path d="M50,50 L100,50 L100,100 L150,100" stroke="#6b7280" strokeWidth="2" fill="none" />
        <path d="M200,30 L250,30 L250,80 L300,80" stroke="#6b7280" strokeWidth="2" fill="none" />
        <path d="M80,150 L130,150 L130,200 L180,200" stroke="#6b7280" strokeWidth="2" fill="none" />
        <circle cx="100" cy="50" r="3" fill="#6b7280" />
        <circle cx="150" cy="100" r="3" fill="#6b7280" />
        <circle cx="250" cy="30" r="3" fill="#6b7280" />
        <circle cx="300" cy="80" r="3" fill="#6b7280" />
      </g>

      {/* Main server rack */}
      <g transform="translate(150, 80)">
        {/* Server case */}
        <rect x="0" y="0" width="100" height="140" fill="url(#server-gradient)" rx="8" stroke="#4b5563" strokeWidth="2" />
        
        {/* Server panels */}
        <rect x="10" y="15" width="80" height="25" fill="#4b5563" rx="4" />
        <rect x="10" y="50" width="80" height="25" fill="#4b5563" rx="4" />
        <rect x="10" y="85" width="80" height="25" fill="#4b5563" rx="4" />
        <rect x="10" y="120" width="80" height="15" fill="#4b5563" rx="4" />
        
        {/* LED indicators - some red (error), some off */}
        <circle cx="20" cy="27" r="3" fill="#ef4444" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="27" r="3" fill="#22c55e" />
        <circle cx="40" cy="27" r="3" fill="#6b7280" />
        
        <circle cx="20" cy="62" r="3" fill="#ef4444" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="62" r="3" fill="#6b7280" />
        <circle cx="40" cy="62" r="3" fill="#ef4444" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
        </circle>
        
        <circle cx="20" cy="97" r="3" fill="#6b7280" />
        <circle cx="30" cy="97" r="3" fill="#ef4444" filter="url(#glow)">
          <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
        </circle>
        <circle cx="40" cy="97" r="3" fill="#6b7280" />
        
        {/* Ventilation grilles */}
        <g opacity="0.6">
          <line x1="60" y1="20" x2="85" y2="20" stroke="#9ca3af" strokeWidth="1" />
          <line x1="60" y1="25" x2="85" y2="25" stroke="#9ca3af" strokeWidth="1" />
          <line x1="60" y1="30" x2="85" y2="30" stroke="#9ca3af" strokeWidth="1" />
          
          <line x1="60" y1="55" x2="85" y2="55" stroke="#9ca3af" strokeWidth="1" />
          <line x1="60" y1="60" x2="85" y2="60" stroke="#9ca3af" strokeWidth="1" />
          <line x1="60" y1="65" x2="85" y2="65" stroke="#9ca3af" strokeWidth="1" />
        </g>
      </g>

      {/* Error symbols floating around */}
      <g>
        {/* Warning triangle */}
        <g transform="translate(80, 120)">
          <polygon points="0,-15 -13,10 13,10" fill="url(#error-gradient)" stroke="#dc2626" strokeWidth="2" />
          <text x="0" y="5" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">!</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="80,120;85,115;80,120"
            dur="3s"
            repeatCount="indefinite"
          />
        </g>

        {/* X symbol */}
        <g transform="translate(320, 100)">
          <circle cx="0" cy="0" r="12" fill="url(#error-gradient)" />
          <path d="M-6,-6 L6,6 M6,-6 L-6,6" stroke="white" strokeWidth="3" strokeLinecap="round" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="320,100;315,105;320,100"
            dur="4s"
            repeatCount="indefinite"
          />
        </g>

        {/* Error code blocks */}
        <g transform="translate(60, 200)">
          <rect x="0" y="0" width="30" height="20" fill="#ef4444" rx="4" opacity="0.8" />
          <text x="15" y="13" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">500</text>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="60,200;65,195;60,200"
            dur="5s"
            repeatCount="indefinite"
          />
        </g>
      </g>

      {/* Smoke/steam effect */}
      <g opacity="0.6">
        <ellipse cx="200" cy="75" rx="8" ry="15" fill="#9ca3af">
          <animate attributeName="ry" values="15;25;15" dur="2s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="190" cy="70" rx="6" ry="12" fill="#9ca3af">
          <animate attributeName="ry" values="12;20;12" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="210" cy="70" rx="5" ry="10" fill="#9ca3af">
          <animate attributeName="ry" values="10;18;10" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.5;0.1;0.5" dur="3s" repeatCount="indefinite" />
        </ellipse>
      </g>

      {/* Sparks */}
      <g>
        <circle cx="170" cy="160" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;-5,-10;-10,-20"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="230" cy="170" r="1.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin="0.2s" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;8,-8;15,-15"
            dur="0.7s"
            repeatCount="indefinite"
            begin="0.2s"
          />
        </circle>
      </g>
    </svg>
  );
}