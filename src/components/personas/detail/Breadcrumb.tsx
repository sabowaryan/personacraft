'use client';

import Link from 'next/link';
import { Persona } from '@/types';

interface BreadcrumbProps {
    persona: Persona;
}

export function Breadcrumb({ persona }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm text-neutral-600 mb-8 animate-in slide-in-from-top-2">
            <Link href="/dashboard" className="hover:text-persona-violet transition-colors">
                Dashboard
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/dashboard/personas" className="hover:text-persona-violet transition-colors">
                Personas
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text font-medium">{persona.name}</span>
        </nav>
    );
}