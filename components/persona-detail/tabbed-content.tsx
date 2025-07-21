'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Persona } from '@/lib/types/persona';
import { Heart, MessageCircle, Target, Users } from 'lucide-react';
import { ProfileTab } from './tabs/profile-tab';
import { InterestsTab } from './tabs/interests-tab';
import { CommunicationTab } from './tabs/communication-tab';
import { MarketingTab } from './tabs/marketing-tab';

interface TabbedContentProps {
  persona: Persona;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

/**
 * Composant d'interface à onglets améliorée
 * Style "Notion-like" avec indicateurs visuels et transitions fluides
 */
export function TabbedContent({ persona, activeTab, setActiveTab }: TabbedContentProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Navigation des onglets - Style Notion */}
        <div className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <TabsList className="w-full bg-transparent border-0 p-1 gap-0 justify-start">
            <TabsTrigger 
              value="profile" 
              className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
            >
              <Users className="h-4 w-4 mr-2" />
              Profil
            </TabsTrigger>
            <TabsTrigger 
              value="interests" 
              className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
            >
              <Heart className="h-4 w-4 mr-2" />
              Intérêts
            </TabsTrigger>
            <TabsTrigger 
              value="communication" 
              className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Communication
            </TabsTrigger>
            <TabsTrigger 
              value="marketing" 
              className="relative px-6 py-3 text-sm font-medium transition-all duration-200 bg-transparent border-0 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm data-[state=active]:text-gray-900 dark:data-[state=active]:text-white text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Marketing
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Contenu des onglets */}
        <div className="p-6 sm:p-8">
          <TabsContent value="profile" className="mt-0 space-y-6">
            <ProfileTab persona={persona} />
          </TabsContent>
          
          <TabsContent value="interests" className="mt-0 space-y-6">
            <InterestsTab interests={persona.interests} />
          </TabsContent>
          
          <TabsContent value="communication" className="mt-0 space-y-6">
            <CommunicationTab communication={persona.communication} />
          </TabsContent>
          
          <TabsContent value="marketing" className="mt-0 space-y-6">
            <MarketingTab marketing={persona.marketing} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}