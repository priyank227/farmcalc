'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function PageHeader({ title, icon: Icon, iconColor = 'text-white', iconBg = 'bg-white/20', onRefresh, refreshing }) {
  return (
    <div className="bg-gray-950 border-b border-white/5 px-5 pt-12 pb-5 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link href="/" className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center active:bg-white/20 transition-all">
          <ArrowLeft className="w-4 h-4 text-white" />
        </Link>
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`w-9 h-9 ${iconBg} rounded-xl flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
          )}
          <h1 className="font-bold text-lg text-white">{title}</h1>
        </div>
      </div>

      {onRefresh && (
        <button 
          onClick={onRefresh}
          disabled={refreshing}
          className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center active:bg-white/20 disabled:opacity-50 transition-all"
        >
          <RefreshCw className={`w-4 h-4 text-orange-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}

export function PinModal({ title, desc, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
      <div className="bg-gray-900 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-gray-400 text-sm mb-5">{desc}</p>
        {onConfirm}
        {!loading && (
          <button onClick={onCancel} className="w-full mt-3 py-3 rounded-2xl bg-white/10 text-white font-semibold">Cancel</button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-10 text-center text-gray-500">
      {message}
    </div>
  );
}
