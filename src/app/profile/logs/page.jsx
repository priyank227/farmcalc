'use client';

import { useEffect, useState } from 'react';
import useLanguageStore from '@/store/useLanguageStore';
import { getLogs } from '@/lib/actions';
import { PageHeader } from '@/components/ui/PageHeader';
import { History, Plus, Edit2, Trash2, Loader2, Info, Calendar } from 'lucide-react';

export default function LogsPage() {
  const { t } = useLanguageStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = async (force = false) => {
    if (force) setRefreshing(true);
    else setLoading(true);
    
    try {
      const data = await getLogs();
      setLogs(data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load logs:', err);
      setError(err.message || JSON.stringify(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const handleRefresh = async () => {
    await load(true);
    toast.success('Logs updated');
  };

  const getActionConfig = (action) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: Plus,
          bg: 'bg-green-500/20',
          text: 'text-green-400',
          label: t('actionCreate')
        };
      case 'UPDATE':
        return {
          icon: Edit2,
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          label: t('actionUpdate')
        };
      case 'DELETE':
        return {
          icon: Trash2,
          bg: 'bg-red-500/20',
          text: 'text-red-400',
          label: t('actionDelete')
        };
      default:
        return {
          icon: Info,
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          label: action
        };
    }
  };

  const getCategoryLabel = (category) => {
    return t(category) || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Group logs by date
  const groupedLogs = logs.reduce((groups, log) => {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(log);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedLogs).sort((a, b) => b.localeCompare(a));

  const formatHeaderDate = (dateStr) => {
    const d = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return t('today') || 'Today';
    if (d.toDateString() === yesterday.toDateString()) return t('yesterday') || 'Yesterday';
    return new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }).format(d);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-950 pb-20">
      <PageHeader 
        title={t('activityLogs')} 
        icon={History} 
        iconBg="bg-orange-500/30" 
        iconColor="text-orange-400" 
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="px-4 py-2 flex-grow">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-orange-400 animate-spin" />
            <p className="text-gray-500 animate-pulse">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
              <Info size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Error Loading Logs</h3>
            <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-4 w-full">
              <p className="text-red-400 text-sm font-mono break-all">{error}</p>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              {error.includes('relation "public.logs" does not exist') 
                ? 'Did you run the SQL script in Supabase?' 
                : 'Please check your database connection.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-white/10 text-white rounded-full text-sm font-bold active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4 text-gray-600">
              <History size={32} />
            </div>
            <h3 className="text-white font-bold text-lg mb-1">{t('noLogsYet')}</h3>
            <p className="text-gray-500 text-sm">Your financial activities will appear here for security and tracking.</p>
          </div>
        ) : (
          <div className="space-y-8 mt-2">
            {sortedDates.map(date => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md py-2 mb-4 flex items-center gap-2">
                  <div className="h-px bg-white/10 flex-grow" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-500 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatHeaderDate(date)}
                  </span>
                  <div className="h-px bg-white/10 flex-grow" />
                </div>

                <div className="space-y-4">
                  {groupedLogs[date].map((log) => {
                    const config = getActionConfig(log.action);
                    return (
                      <div key={log.id} className="relative pl-10 group">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-gradient-to-b from-white/10 to-transparent group-last:hidden" />
                        
                        {/* Action Icon */}
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center ${config.text} border border-white/5 shadow-lg group-hover:scale-110 transition-transform`}>
                          <config.icon size={14} />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 active:bg-white/10 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                              {config.label}
                            </span>
                            <span className="text-gray-500 text-[10px] font-medium">
                              {new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(log.created_at))}
                            </span>
                          </div>
                          
                          <h4 className="text-white font-bold text-base leading-tight">
                            {log.item_name || 'Unnamed Entry'}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-white/5 border border-white/5 rounded-md text-gray-400 capitalize">
                              {getCategoryLabel(log.category)}
                            </span>
                            {log.amount && (
                              <span className="text-sm font-black text-white">
                                ₹{log.amount.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {log.farms?.name && (
                            <p className="text-[10px] text-gray-500 mt-2 flex items-center gap-1">
                              in <span className="text-gray-400 font-bold">{log.farms.name}</span>
                            </p>
                          )}

                          {log.details?.comment && (
                            <div className="mt-2 p-2 bg-black/30 rounded-lg border border-white/5 italic text-gray-400 text-[11px]">
                              "{log.details.comment}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
