import React from 'react';
import Logo from './Logo';
import LogoWithText from './LogoWithText';

// Composant d'exemple pour montrer les différentes utilisations du logo
const LogoExamples: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h2 className="text-2xl font-bold text-text mb-6">Exemples d'utilisation du logo</h2>
      
      {/* Logo seul - différentes tailles */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Logo seul - Différentes tailles</h3>
        <div className="flex items-end gap-4 p-4 bg-background rounded-lg">
          <Logo size="sm" variant="primary" />
          <Logo size="md" variant="primary" />
          <Logo size="lg" variant="primary" />
          <Logo size="xl" variant="primary" />
        </div>
      </div>

      {/* Logo avec texte - différentes variantes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Logo avec texte - Différentes variantes</h3>
        <div className="space-y-3">
          <div className="p-4 bg-background rounded-lg">
            <LogoWithText text="PersonaCraft" variant="primary" size="lg" />
          </div>
          <div className="p-4 bg-background rounded-lg">
            <LogoWithText text="PersonaCraft" variant="secondary" size="lg" />
          </div>
          <div className="p-4 bg-text rounded-lg">
            <LogoWithText text="PersonaCraft" variant="white" size="lg" />
          </div>
          <div className="p-4 bg-background rounded-lg">
            <LogoWithText text="PersonaCraft" variant="dark" size="lg" />
          </div>
        </div>
      </div>

      {/* Logo responsive */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-text">Logo responsive</h3>
        <div className="p-4 bg-background rounded-lg">
          <LogoWithText 
            text="PersonaCraft" 
            variant="primary" 
            className="text-sm sm:text-base md:text-lg lg:text-xl"
            size="md"
          />
        </div>
      </div>
    </div>
  );
};

export default LogoExamples;