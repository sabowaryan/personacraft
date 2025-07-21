import { Persona } from '@/lib/types/persona';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnimatedProgress, ModernBadge } from '@/components/ui/modern-elements';
import { MessageCircle, Mail, Phone, Instagram, Facebook, Twitter, Youtube, Linkedin, Globe, FileText, Video, Mic, MessageSquare } from 'lucide-react';

interface PersonaCommunicationTabProps {
  persona: Persona;
}

export function PersonaCommunicationTab({ persona }: PersonaCommunicationTabProps) {
  const { communication } = persona;
  
  // Mapping des canaux aux icônes
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-5 w-5" />,
    phone: <Phone className="h-5 w-5" />,
    sms: <MessageSquare className="h-5 w-5" />,
    instagram: <Instagram className="h-5 w-5" />,
    facebook: <Facebook className="h-5 w-5" />,
    twitter: <Twitter className="h-5 w-5" />,
    youtube: <Youtube className="h-5 w-5" />,
    linkedin: <Linkedin className="h-5 w-5" />,
    website: <Globe className="h-5 w-5" />,
    blog: <FileText className="h-5 w-5" />,
    video: <Video className="h-5 w-5" />,
    podcast: <Mic className="h-5 w-5" />,
  };
  
  // Fonction pour obtenir une couleur en fonction du canal
  const getChannelColor = (channel: string): 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue' => {
    const colorMap: Record<string, 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue'> = {
      email: 'blue',
      phone: 'primary',
      sms: 'purple',
      instagram: 'warning',
      facebook: 'blue',
      twitter: 'primary',
      youtube: 'destructive',
      linkedin: 'blue',
      website: 'success',
      blog: 'primary',
      video: 'destructive',
      podcast: 'purple',
    };
    return colorMap[channel] || 'primary';
  };
  
  // Fonction pour obtenir une variante de badge en fonction de la fréquence
  const getFrequencyVariant = (frequency: string): 'default' | 'outline' | 'secondary' => {
    const variantMap: Record<string, 'default' | 'outline' | 'secondary'> = {
      daily: 'default',
      weekly: 'secondary',
      monthly: 'outline',
      rarely: 'outline',
    };
    return variantMap[frequency] || 'outline';
  };
  
  // Fonction pour obtenir une variante de badge en fonction du ton
  const getToneVariant = (tone: string): 'success' | 'warning' | 'destructive' | 'default' => {
    const variantMap: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
      formal: 'default',
      casual: 'success',
      professional: 'default',
      friendly: 'success',
      direct: 'warning',
      humorous: 'success',
      serious: 'destructive',
    };
    return variantMap[tone] || 'default';
  };

  return (
    <div className="space-y-8">
      {/* Canaux de communication */}
      <Card className="persona-result-card persona-animate-in persona-delay-1">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Canaux préférés</CardTitle>
          </div>
          <CardDescription>
            Comment {persona.name} préfère communiquer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {communication.channels && communication.channels.length > 0 ? (
            <div className="space-y-6">
              {communication.channels.map((channel, index) => (
                <div key={index} className="space-y-2 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channelIcons[channel.name] || <MessageCircle className="h-5 w-5" />}
                      <div className="font-medium capitalize">{channel.name}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{channel.score}%</div>
                  </div>
                  <AnimatedProgress 
                    value={channel.score} 
                    color={getChannelColor(channel.name)} 
                    showLabel={false} 
                    size="md" 
                  />
                  {channel.description && (
                    <p className="text-sm text-muted-foreground mt-1">{channel.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucun canal de communication défini</p>
          )}
        </CardContent>
      </Card>

      {/* Style de communication */}
      <Card className="persona-result-card persona-animate-in persona-delay-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <CardTitle>Style de communication</CardTitle>
          </div>
          <CardDescription>
            Comment {persona.name} s'exprime et interagit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Ton de communication</h4>
              <div className="flex flex-wrap gap-2">
                {communication.tone && communication.tone.length > 0 ? (
                  communication.tone.map((tone, index) => (
                    <ModernBadge key={index} variant={getToneVariant(tone)}>
                      {tone}
                    </ModernBadge>
                  ))
                ) : (
                  <p className="text-muted-foreground italic">Non défini</p>
                )}
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Fréquence de communication</h4>
              <div className="flex flex-wrap gap-2">
                {communication.frequency ? (
                  <Badge variant={getFrequencyVariant(communication.frequency)}>
                    {communication.frequency}
                  </Badge>
                ) : (
                  <p className="text-muted-foreground italic">Non définie</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Préférences de contenu */}
      <Card className="persona-result-card persona-animate-in persona-delay-3">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Préférences de contenu</CardTitle>
          </div>
          <CardDescription>
            Types de contenu qui résonnent avec {persona.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {communication.contentPreferences && communication.contentPreferences.length > 0 ? (
            <div className="space-y-6">
              {communication.contentPreferences.map((preference, index) => (
                <div key={index} className="space-y-2 persona-animate-in" style={{animationDelay: `${0.3 + index * 0.1}s`}}>
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{preference.type}</div>
                    <div className="text-sm text-muted-foreground">{preference.score}%</div>
                  </div>
                  <AnimatedProgress 
                    value={preference.score} 
                    color={getColorForIndex(index)} 
                    showLabel={false} 
                    size="md" 
                  />
                  {preference.description && (
                    <p className="text-sm text-muted-foreground mt-1">{preference.description}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">Aucune préférence de contenu définie</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Fonction utilitaire pour obtenir une couleur en fonction de l'index
function getColorForIndex(index: number): 'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue' {
  const colors: Array<'primary' | 'success' | 'warning' | 'destructive' | 'purple' | 'blue'> = [
    'primary', 'success', 'purple', 'blue', 'warning', 'destructive'
  ];
  return colors[index % colors.length];
}