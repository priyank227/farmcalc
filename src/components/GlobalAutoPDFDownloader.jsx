'use client';

import useAppStore from '@/store/useFarmStore';
import { AutoPDFDownloader } from '@/components/AutoPDFDownloader';

export function GlobalAutoPDFDownloader() {
  const { selectedFarmId, farms } = useAppStore();
  const farmName = farms.find(f => f.id === selectedFarmId)?.name;

  return <AutoPDFDownloader farmId={selectedFarmId} farmName={farmName} />;
}
