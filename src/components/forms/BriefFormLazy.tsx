import dynamic from 'next/dynamic';
import { ComponentProps } from 'react';

// Dynamic import for BriefForm to reduce initial bundle size
const BriefForm = dynamic(() => import('./BriefForm'), {
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 animate-pulse">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-2xl mb-6"></div>
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96 mx-auto"></div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    </div>
  ),
  ssr: false
});

type BriefFormProps = ComponentProps<typeof BriefForm>;

export default function BriefFormLazy(props: BriefFormProps) {
  return <BriefForm {...props} />;
}