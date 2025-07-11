'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Target, 
  Heart,
  MapPin,
  Calendar,
  Smartphone,
  ShoppingBag
} from 'lucide-react';
import { Persona } from '@/lib/types/persona';

interface PersonaInsightsProps {
  personas: Persona[];
}

const COLORS = ['#6366F1', '#14B8A6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export function PersonaInsights({ personas }: PersonaInsightsProps) {
  if (personas.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun persona à analyser</p>
            <p className="text-sm text-gray-400">Générez des personas pour voir les insights</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Analyse des tranches d'âge
  const ageDistribution = personas.reduce((acc, persona) => {
    const ageGroup = persona.age < 25 ? '18-24' : 
                    persona.age < 35 ? '25-34' :
                    persona.age < 45 ? '35-44' :
                    persona.age < 55 ? '45-54' : '55+';
    acc[ageGroup] = (acc[ageGroup] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const ageData = Object.entries(ageDistribution).map(([age, count]) => ({
    age,
    count,
    percentage: Math.round((count / personas.length) * 100)
  }));

  // Analyse des localisations
  const locationDistribution = personas.reduce((acc, persona) => {
    const country = persona.location.split(',').pop()?.trim() || 'Inconnu';
    acc[country] = (acc[country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const locationData = Object.entries(locationDistribution).map(([location, count]) => ({
    location,
    count,
    percentage: Math.round((count / personas.length) * 100)
  }));

  // Analyse des valeurs
  const valuesDistribution = personas.reduce((acc, persona) => {
    persona.values.forEach(value => {
      acc[value] = (acc[value] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const topValues = Object.entries(valuesDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([value, count]) => ({
      value,
      count,
      percentage: Math.round((count / personas.length) * 100)
    }));

  // Analyse des canaux de communication
  const channelDistribution = personas.reduce((acc, persona) => {
    persona.communication.preferredChannels.forEach(channel => {
      acc[channel] = (acc[channel] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const channelData = Object.entries(channelDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([channel, count]) => ({
      channel,
      count,
      percentage: Math.round((count / personas.length) * 100)
    }));

  // Analyse des centres d'intérêt
  const interestCategories = personas.reduce((acc, persona) => {
    acc.music += persona.interests.music.length;
    acc.brands += persona.interests.brands.length;
    acc.movies += persona.interests.movies.length;
    acc.food += persona.interests.food.length;
    acc.books += persona.interests.books.length;
    acc.lifestyle += persona.interests.lifestyle.length;
    return acc;
  }, { music: 0, brands: 0, movies: 0, food: 0, books: 0, lifestyle: 0 });

  const interestData = Object.entries(interestCategories).map(([category, count]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    count,
    average: Math.round((count / personas.length) * 10) / 10
  }));

  return (
    <div className="space-y-6">
      {/* Métriques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{personas.length}</p>
                <p className="text-sm text-gray-600">Personas générés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-teal-600" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(personas.reduce((sum, p) => sum + p.age, 0) / personas.length)}
                </p>
                <p className="text-sm text-gray-600">Âge moyen</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <MapPin className="h-8 w-8 text-amber-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(locationDistribution).length}</p>
                <p className="text-sm text-gray-600">Pays représentés</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{Object.keys(valuesDistribution).length}</p>
                <p className="text-sm text-gray-600">Valeurs uniques</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des âges */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <span>Distribution des âges</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="age" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Nombre']}
                  labelFormatter={(label) => `Tranche d'âge: ${label}`}
                />
                <Bar dataKey="count" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Répartition géographique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              <span>Répartition géographique</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={locationData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ location, percentage }) => `${location} (${percentage}%)`}
                >
                  {locationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, 'Personas']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Valeurs principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Valeurs principales</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topValues} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="value" type="category" width={80} />
                <Tooltip 
                  formatter={(value, name) => [value, 'Mentions']}
                  labelFormatter={(label) => `Valeur: ${label}`}
                />
                <Bar dataKey="count" fill="#14B8A6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Canaux de communication */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <span>Canaux de communication</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={channelData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="channel" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, 'Préférences']}
                  labelFormatter={(label) => `Canal: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8B5CF6" 
                  fill="#8B5CF6" 
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Analyse des centres d'intérêt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-amber-600" />
            <span>Centres d'intérêt par catégorie</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={interestData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, 'Moyenne par persona']}
                labelFormatter={(label) => `Catégorie: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights textuels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Insights clés</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Profil démographique</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Âge dominant:</strong> {ageData.sort((a, b) => b.count - a.count)[0]?.age} ans 
                  ({ageData.sort((a, b) => b.count - a.count)[0]?.percentage}%)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Localisation principale:</strong> {locationData.sort((a, b) => b.count - a.count)[0]?.location}
                  ({locationData.sort((a, b) => b.count - a.count)[0]?.percentage}%)
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3">Préférences comportementales</h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <strong>Valeur principale:</strong> {topValues[0]?.value} 
                  ({topValues[0]?.percentage}% des personas)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Canal préféré:</strong> {channelData[0]?.channel}
                  ({channelData[0]?.percentage}% des personas)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h4 className="font-semibold mb-3">Recommandations marketing</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                Cibler {ageData.sort((a, b) => b.count - a.count)[0]?.age} ans
              </Badge>
              <Badge variant="secondary" className="bg-teal-100 text-teal-800">
                Focus sur {topValues[0]?.value}
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                Utiliser {channelData[0]?.channel}
              </Badge>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Marché {locationData.sort((a, b) => b.count - a.count)[0]?.location}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}