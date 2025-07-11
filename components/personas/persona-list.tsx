'use client';
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';
import { Persona } from '@/lib/types/persona';
import { PersonaCard } from './persona-card';
import { exportToCSV } from '@/lib/utils/export';

interface PersonaListProps {
  personas: Persona[];
  onClear: () => void;
}

export function PersonaList({ personas, onClear }: PersonaListProps) {
  const handleExportAll = async () => {
    await exportToCSV(personas);
  };

  if (personas.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <span>Personas générés</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({personas.length} persona{personas.length > 1 ? 's' : ''})
              </span>
            </CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Exporter tout (CSV)
              </Button>
              <Button variant="outline" onClick={onClear}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Nouveau brief
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Vos personas ont été générés avec succès. Vous pouvez les examiner individuellement 
            ou les exporter pour une utilisation ultérieure.
          </p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {personas.map((persona, index) => (
          <div key={persona.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 150}ms` }}>
            <PersonaCard persona={persona} />
          </div>
        ))}
      </div>
    </div>
  );
}