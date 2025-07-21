import { Persona } from '@/lib/types/persona';
import { CommunicationSection } from '../communication';

interface PersonaCommunicationTabProps {
  persona: Persona;
}

export function PersonaCommunicationTab({ persona }: PersonaCommunicationTabProps) {
  return (
    <CommunicationSection 
      communication={persona.communication}
      personaName={persona.name}
    />
  );
}