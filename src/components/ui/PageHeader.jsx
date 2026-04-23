'use client';

import { ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export function PageHeader({ title, icon: Icon, iconColor, iconBg, onRefresh, refreshing, actionIcon: ActionIcon, onAction }) {
  return (
    <div className="bg-white px-5 pt-12 pb-4 flex items-center justify-between sticky top-0 z-40 border-b border-gray-100">
      <Link href="/" className="p-2 -ml-2 text-gray-800 active:scale-95 transition-all">
        <ArrowLeft className="w-6 h-6" />
      </Link>
      
      <h1 className="font-bold text-xl text-[#166534] absolute left-1/2 -translate-x-1/2">{title}</h1>

      <div className="flex items-center gap-2">
        {onRefresh && (
          <button 
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 -mr-2 text-gray-600 active:scale-95 disabled:opacity-50 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
        {ActionIcon && onAction && (
          <button onClick={onAction} className="p-2 -mr-2 text-gray-600 active:scale-95 transition-transform">
            <ActionIcon className="w-5 h-5" />
          </button>
        )}
        {ActionIcon && !onAction && (
          <div className="p-2 -mr-2 text-gray-600">
            <ActionIcon className="w-5 h-5" />
          </div>
        )}
      </div>
    </div>
  );
}

export function PinModal({ title, desc, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end justify-center z-50 p-4 pb-6">
      <div className="bg-white border border-gray-100 rounded-3xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500 text-sm mb-5">{desc}</p>
        {onConfirm}
        {!loading && (
          <button onClick={onCancel} className="w-full mt-3 py-3 rounded-2xl bg-gray-100 text-gray-700 font-semibold">Cancel</button>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ message }) {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-10 text-center text-gray-400 font-medium">
      {message}
    </div>
  );
}
