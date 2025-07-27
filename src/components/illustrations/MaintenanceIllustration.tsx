export default function MaintenanceIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="tool-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="gear-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6b7280" />
          <stop offset="100%" stopColor="#374151" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width="100%" height="100%" fill="#f1f5f9" />

      {/* Main gear */}
      <g transform="translate(200, 150)">
        <circle cx="0" cy="0" r="50" fill="url(#gear-gradient)" />
        <circle cx="0" cy="0" r="35" fill="#4b5563" />
        <circle cx="0" cy="0" r="15" fill="#374151" />
        
        {/* Gear teeth */}
        <g>
          <rect x="-5" y="-55" width="10" height="10" fill="url(#gear-gradient)" />
          <rect x="-5" y="45" width="10" height="10" fill="url(#gear-gradient)" />
          <rect x="-55" y="-5" width="10" height="10" fill="url(#gear-gradient)" />
          <rect x="45" y="-5" width="10" height="10" fill="url(#gear-gradient)" />
          
          <rect x="-39" y="-39" width="10" height="10" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="29" y="-39" width="10" height="10" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="-39" y="29" width="10" height="10" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="29" y="29" width="10" height="10" fill="url(#gear-gradient)" transform="rotate(45)" />
        </g>
        
        {/* Rotation animation */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 150;360 200 150"
          dur="8s"
          repeatCount="indefinite"
        />
      </g>

      {/* Smaller gear */}
      <g transform="translate(120, 100)">
        <circle cx="0" cy="0" r="30" fill="url(#gear-gradient)" />
        <circle cx="0" cy="0" r="20" fill="#4b5563" />
        <circle cx="0" cy="0" r="8" fill="#374151" />
        
        {/* Gear teeth */}
        <g>
          <rect x="-3" y="-33" width="6" height="6" fill="url(#gear-gradient)" />
          <rect x="-3" y="27" width="6" height="6" fill="url(#gear-gradient)" />
          <rect x="-33" y="-3" width="6" height="6" fill="url(#gear-gradient)" />
          <rect x="27" y="-3" width="6" height="6" fill="url(#gear-gradient)" />
          
          <rect x="-23" y="-23" width="6" height="6" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="17" y="-23" width="6" height="6" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="-23" y="17" width="6" height="6" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="17" y="17" width="6" height="6" fill="url(#gear-gradient)" transform="rotate(45)" />
        </g>
        
        {/* Counter-rotation animation */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 120 100;-360 120 100"
          dur="6s"
          repeatCount="indefinite"
        />
      </g>

      {/* Third gear */}
      <g transform="translate(300, 200)">
        <circle cx="0" cy="0" r="25" fill="url(#gear-gradient)" />
        <circle cx="0" cy="0" r="18" fill="#4b5563" />
        <circle cx="0" cy="0" r="6" fill="#374151" />
        
        {/* Gear teeth */}
        <g>
          <rect x="-2" y="-27" width="4" height="4" fill="url(#gear-gradient)" />
          <rect x="-2" y="23" width="4" height="4" fill="url(#gear-gradient)" />
          <rect x="-27" y="-2" width="4" height="4" fill="url(#gear-gradient)" />
          <rect x="23" y="-2" width="4" height="4" fill="url(#gear-gradient)" />
          
          <rect x="-19" y="-19" width="4" height="4" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="15" y="-19" width="4" height="4" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="-19" y="15" width="4" height="4" fill="url(#gear-gradient)" transform="rotate(45)" />
          <rect x="15" y="15" width="4" height="4" fill="url(#gear-gradient)" transform="rotate(45)" />
        </g>
        
        {/* Rotation animation */}
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 300 200;360 300 200"
          dur="10s"
          repeatCount="indefinite"
        />
      </g>

      {/* Wrench */}
      <g transform="translate(80, 200)">
        {/* Wrench handle */}
        <rect x="0" y="0" width="60" height="8" fill="url(#tool-gradient)" rx="4" />
        
        {/* Wrench head */}
        <rect x="55" y="-8" width="20" height="24" fill="url(#tool-gradient)" rx="4" />
        <rect x="60" y="-3" width="10" height="14" fill="#f1f5f9" rx="2" />
        
        {/* Floating animation */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="80,200;85,195;80,200"
          dur="4s"
          repeatCount="indefinite"
        />
      </g>

      {/* Screwdriver */}
      <g transform="translate(320, 80)">
        {/* Handle */}
        <rect x="0" y="0" width="40" height="6" fill="#ef4444" rx="3" />
        
        {/* Shaft */}
        <rect x="35" y="1" width="25" height="4" fill="#9ca3af" />
        
        {/* Tip */}
        <rect x="58" y="2" width="4" height="2" fill="#6b7280" />
        
        {/* Floating animation */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="320,80;315,85;320,80"
          dur="3s"
          repeatCount="indefinite"
        />
      </g>

      {/* Progress bar */}
      <g transform="translate(200, 250)">
        <rect x="-100" y="0" width="200" height="8" fill="#e5e7eb" rx="4" />
        <rect x="-100" y="0" width="0" height="8" fill="url(#tool-gradient)" rx="4">
          <animate attributeName="width" values="0;200;0" dur="3s" repeatCount="indefinite" />
        </rect>
        <text x="0" y="-10" textAnchor="middle" fill="#6b7280" fontSize="12" fontWeight="medium">
          Maintenance en cours...
        </text>
      </g>

      {/* Sparks */}
      <g>
        <circle cx="180" cy="120" r="2" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="0.5s" repeatCount="indefinite" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;-8,-12;-15,-20"
            dur="0.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="220" cy="130" r="1.5" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="0.7s" repeatCount="indefinite" begin="0.2s" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;10,-8;18,-15"
            dur="0.7s"
            repeatCount="indefinite"
            begin="0.2s"
          />
        </circle>
        <circle cx="160" cy="140" r="1" fill="#fbbf24">
          <animate attributeName="opacity" values="0;1;0" dur="0.6s" repeatCount="indefinite" begin="0.4s" />
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0;-5,-10;-10,-18"
            dur="0.6s"
            repeatCount="indefinite"
            begin="0.4s"
          />
        </circle>
      </g>

      {/* Oil drops */}
      <g opacity="0.7">
        <ellipse cx="150" cy="180" rx="3" ry="6" fill="#374151">
          <animate attributeName="cy" values="180;190;180" dur="2s" repeatCount="indefinite" />
        </ellipse>
        <ellipse cx="250" cy="170" rx="2" ry="4" fill="#374151">
          <animate attributeName="cy" values="170;185;170" dur="2.5s" repeatCount="indefinite" />
        </ellipse>
      </g>
    </svg>
  );
}