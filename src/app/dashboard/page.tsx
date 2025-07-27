'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePersona } from '@/hooks/use-persona';
import { useStackSessions } from '@/hooks/use-stack-sessions';

export default function Dashboard() {
  const { personas } = usePersona();
  const { stats, currentSession, isLoading } = useStackSessions();
  const [sessionStartTime, setSessionStartTime] = useState<Date>(new Date());
  
  // Calculer le nombre de personas
  const personasCount = personas.length;

  useEffect(() => {
    // Utiliser la session Stack Auth actuelle pour déterminer l'heure de début
    if (currentSession) {
      setSessionStartTime(new Date(currentSession.createdAt));
    }
  }, [currentSession]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-8">
      {/* Welcome Section */}
      <div className="text-center py-12">
        <div className="w-24 h-24 bg-gradient-to-br from-persona-violet to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          Bienvenue sur PersonaCraft
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8">
          Créez des personas marketing détaillés et précis pour mieux comprendre votre audience cible
        </p>
        <Link
          href="/dashboard/personas"
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-persona-violet to-purple-600 text-white rounded-xl font-semibold text-lg transition-all duration-200 hover:shadow-lg hover:shadow-persona-violet/25 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Créer mes personas
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/dashboard/personas"
          className="bg-white rounded-xl border border-neutral-200 p-8 hover:border-primary-300 hover:shadow-lg transition-all duration-200 group text-center"
        >
          <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center group-hover:bg-primary-200 transition-colors mx-auto mb-4">
            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-2">Personas</h3>
          <p className="text-neutral-600 mb-4">Créez et gérez vos personas marketing</p>
          <div className="inline-flex items-center px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
            {personasCount} créés
          </div>
        </Link>

        <Link
          href="/dashboard/templates"
          className="bg-white rounded-xl border border-neutral-200 p-8 hover:border-blue-300 hover:shadow-lg transition-all duration-200 group text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:bg-blue-200 transition-colors mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-blue-600 transition-colors mb-2">Templates</h3>
          <p className="text-neutral-600 mb-4">Modèles prêts à utiliser</p>
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            Bientôt disponible
          </div>
        </Link>

        <Link
          href="/dashboard/analytics"
          className="bg-white rounded-xl border border-neutral-200 p-8 hover:border-green-300 hover:shadow-lg transition-all duration-200 group text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center group-hover:bg-green-200 transition-colors mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-green-600 transition-colors mb-2">Analytics</h3>
          <p className="text-neutral-600 mb-4">Analysez vos données</p>
          <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
            Statistiques
          </div>
        </Link>

        <Link
          href="/dashboard/sessions"
          className="bg-white rounded-xl border border-neutral-200 p-8 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group text-center"
        >
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center group-hover:bg-purple-200 transition-colors mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 group-hover:text-purple-600 transition-colors mb-2">Sessions</h3>
          <p className="text-neutral-600 mb-4">Gérez vos sessions actives</p>
          <div className="inline-flex items-center px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
            {isLoading ? '...' : `${stats.activeSessions} actives`}
          </div>
        </Link>
      </div>

      {/* Session Stats */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Session Active</h2>
          <p className="text-slate-600">Votre activité en temps réel</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-persona-violet/10 to-purple-100/50 rounded-2xl p-6 text-center border border-persona-violet/20">
            <div className="text-3xl font-bold text-persona-violet mb-2">
              {isLoading ? '...' : stats.activeSessions}
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Sessions Actives</div>
            <div className="text-xs text-slate-500">Stack Auth</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 text-center border border-blue-200">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {Math.floor((new Date().getTime() - sessionStartTime.getTime()) / (1000 * 60))}
            </div>
            <div className="text-sm font-medium text-slate-700 mb-1">Minutes</div>
            <div className="text-xs text-slate-500">Session actuelle</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 text-center border border-green-200">
            <div className="text-3xl font-bold text-green-600 mb-2">{personasCount}</div>
            <div className="text-sm font-medium text-slate-700 mb-1">Total</div>
            <div className="text-xs text-slate-500">Personas sauvegardés</div>
          </div>
        </div>
      </div>
    </div>
  );
}