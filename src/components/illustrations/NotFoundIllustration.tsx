export default function NotFoundIllustration() {
  return (
    <svg
      viewBox="0 0 400 300"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <defs>
        <linearGradient id="bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f0f9ff" />
          <stop offset="100%" stopColor="#faf5ff" />
        </linearGradient>
        <linearGradient id="planet-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      {/* Stars */}
      <circle cx="50" cy="40" r="2" fill="#fbbf24" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="350" cy="60" r="1.5" fill="#fbbf24" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="3s" repeatCount="indefinite" />
      </circle>
      <circle cx="80" cy="80" r="1" fill="#fbbf24" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="320" cy="30" r="1.5" fill="#fbbf24" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite" />
      </circle>

      {/* Planet */}
      <circle cx="200" cy="150" r="80" fill="url(#planet-gradient)" opacity="0.9">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 150;360 200 150"
          dur="20s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Planet rings */}
      <ellipse cx="200" cy="150" rx="100" ry="20" fill="none" stroke="#8b5cf6" strokeWidth="3" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 200 150;360 200 150"
          dur="15s"
          repeatCount="indefinite"
        />
      </ellipse>

      {/* Astronaut */}
      <g transform="translate(120, 100)">
        {/* Astronaut body */}
        <ellipse cx="0" cy="20" rx="25" ry="35" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        
        {/* Helmet */}
        <circle cx="0" cy="-10" r="20" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="2" opacity="0.8" />
        
        {/* Face */}
        <circle cx="-5" cy="-15" r="2" fill="#374151" />
        <circle cx="5" cy="-15" r="2" fill="#374151" />
        <path d="M -3,-8 Q 0,-5 3,-8" stroke="#374151" strokeWidth="1.5" fill="none" />
        
        {/* Arms */}
        <ellipse cx="-20" cy="10" rx="8" ry="15" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx="20" cy="10" rx="8" ry="15" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        
        {/* Legs */}
        <ellipse cx="-10" cy="45" rx="8" ry="20" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx="10" cy="45" rx="8" ry="20" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />

        {/* Floating animation */}
        <animateTransform
          attributeName="transform"
          type="translate"
          values="120,100;120,95;120,100"
          dur="3s"
          repeatCount="indefinite"
        />
      </g>

      {/* Floating debris */}
      <rect x="300" y="120" width="8" height="8" fill="#6b7280" opacity="0.7" rx="2">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="0 304 124;360 304 124"
          dur="8s"
          repeatCount="indefinite"
        />
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;-10,5;0,0"
          dur="4s"
          repeatCount="indefinite"
          additive="sum"
        />
      </rect>

      <circle cx="90" cy="200" r="4" fill="#6b7280" opacity="0.6">
        <animateTransform
          attributeName="transform"
          type="translate"
          values="0,0;5,-8;0,0"
          dur="5s"
          repeatCount="indefinite"
        />
      </circle>

      {/* Search telescope */}
      <g transform="translate(280, 180)">
        <rect x="0" y="0" width="40" height="8" fill="#374151" rx="4" />
        <rect x="35" y="-2" width="12" height="12" fill="#4b5563" rx="2" />
        <circle cx="47" cy="4" r="8" fill="#6b7280" opacity="0.8" />
        
        <animateTransform
          attributeName="transform"
          type="rotate"
          values="280,180;290,175;280,180"
          dur="6s"
          repeatCount="indefinite"
        />
      </g>
    </svg>
  );
}