'use client';

import { useEffect, useState } from 'react';
import useLanguageStore from '@/store/useLanguageStore';
import useAppStore from '@/store/useFarmStore';
import { getLogs } from '@/lib/actions';
import { downloadFarmReport } from '@/lib/downloadReport';
import { PageHeader } from '@/components/ui/PageHeader';
import { History, Plus, Edit2, Trash2, Loader2, Info, Calendar, Download } from 'lucide-react';

export default function LogsPage() {
  const { t } = useLanguageStore();
  const { selectedFarmId, farms } = useAppStore();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
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
  };

  const handleDownload = async () => {
    if (!selectedFarmId) return;
    const farmName = farms.find(f => f.id === selectedFarmId)?.name;
    setDownloading(true);
    await downloadFarmReport(selectedFarmId, farmName, t);
    setDownloading(false);
  };

  const getActionConfig = (action) => {
    switch (action) {
      case 'CREATE':
        return {
          icon: Plus,
          bg: 'bg-green-100',
          text: 'text-green-600',
          label: t('actionCreate') || 'Create'
        };
      case 'UPDATE':
        return {
          icon: Edit2,
          bg: 'bg-blue-100',
          text: 'text-blue-600',
          label: t('actionUpdate') || 'Update'
        };
      case 'DELETE':
        return {
          icon: Trash2,
          bg: 'bg-red-100',
          text: 'text-red-600',
          label: t('actionDelete') || 'Delete'
        };
      default:
        return {
          icon: Info,
          bg: 'bg-gray-100',
          text: 'text-gray-600',
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
    <div className="min-h-screen flex flex-col bg-gray-50 ">
      <PageHeader
        title={t('activityLogs')}
        onRefresh={handleRefresh}
        refreshing={refreshing}
        actionIcon={downloading ? Loader2 : Download}
        onAction={handleDownload}
      />

      <div className="px-4 py-4 flex-grow pb-20">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-[#166534] animate-spin" />
            <p className="text-gray-500 font-medium">Loading history...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 text-red-500 border border-red-100">
              <Info size={32} />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-2">Error Loading Logs</h3>
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 w-full">
              <p className="text-red-600 text-sm font-mono break-all">{error}</p>
            </div>
            <p className="text-gray-500 text-xs mt-4">
              {error.includes('relation "public.logs" does not exist')
                ? 'Did you run the SQL script in Supabase?'
                : 'Please check your database connection.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-[#166534] text-white rounded-2xl text-sm font-bold active:scale-95 transition-transform"
            >
              Try Again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <div className="w-16 h-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <History size={32} />
            </div>
            <h3 className="text-gray-900 font-bold text-lg mb-1">{t('noLogsYet')}</h3>
            <p className="text-gray-500 text-sm font-medium">Your financial activities will appear here for security and tracking.</p>
          </div>
        ) : (
          <div className="space-y-8 mt-2">
            {sortedDates.map(date => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-14 z-10 bg-gray-50/90 backdrop-blur-md py-2 mb-4 flex items-center gap-2">
                  <div className="h-px bg-gray-200 flex-grow" />
                  <span className="text-[10px] uppercase tracking-widest font-black text-gray-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {formatHeaderDate(date)}
                  </span>
                  <div className="h-px bg-gray-200 flex-grow" />
                </div>

                <div className="space-y-4">
                  {groupedLogs[date].map((log) => {
                    const config = getActionConfig(log.action);
                    return (
                      <div key={log.id} className="relative pl-10 group">
                        {/* Vertical Timeline Line */}
                        <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200 group-last:hidden" />

                        {/* Action Icon */}
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full ${config.bg} flex items-center justify-center ${config.text} border border-white shadow-sm group-hover:scale-110 transition-transform`}>
                          <config.icon size={14} />
                        </div>

                        <div className="bg-white border border-gray-100 rounded-2xl p-4 active:bg-gray-50 transition-colors shadow-sm">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${config.text}`}>
                              {config.label}
                            </span>
                            <span className="text-gray-400 text-[10px] font-medium">
                              {new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(log.created_at))}
                            </span>
                          </div>

                          <h4 className="text-gray-900 font-bold text-base leading-tight">
                            {log.item_name || 'Unnamed Entry'}
                          </h4>

                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-md text-gray-500 capitalize font-medium">
                              {getCategoryLabel(log.category)}
                            </span>
                            {log.amount && (
                              <span className="text-sm font-black text-gray-900">
                                ₹{log.amount.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>

                          {log.farms?.name && (
                            <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                              in <span className="text-gray-600 font-bold">{log.farms.name}</span>
                            </p>
                          )}

                          {log.details?.comment && (
                            <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-100 italic text-gray-500 text-[11px]">
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
