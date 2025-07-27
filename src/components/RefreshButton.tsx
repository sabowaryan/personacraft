'use client';

import { Button } from '@/components/ui/button';

export default function RefreshButton() {
  return (
    <Button
      onClick={() => window.location.reload()}
      className="bg-gradient-to-r from-blue-600 to-gray-600 hover:from-blue-700 hover:to-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
    >
      Actualiser la page
    </Button>
  );
}