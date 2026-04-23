'use client';

import { useEffect, useRef } from 'react';
import useLanguageStore from '@/store/useLanguageStore';
import { downloadFarmReport } from '@/lib/downloadReport';

export function AutoPDFDownloader({ farmId, farmName }) {
  const { t } = useLanguageStore();
  const checkingRef = useRef(false);

  useEffect(() => {
    if (!farmId) return;

    const checkAndDownload = async () => {
      try {
        const today = new Date();
        // Check if today is the 1st of the month
        if (today.getDate() !== 1) return;

        const year = today.getFullYear();
        const month = today.getMonth() + 1; // 1-12
        
        const storageKey = `pdf_download_${farmId}_${year}_${month}`;
        
        if (localStorage.getItem(storageKey)) {
          // Already downloaded for this month
          return;
        }

        if (checkingRef.current) return;
        checkingRef.current = true;

        const success = await downloadFarmReport(farmId, farmName, t);
        
        if (success) {
          // Mark as downloaded
          localStorage.setItem(storageKey, 'true');
        }
      } catch (err) {
        console.error('Auto PDF DL Error:', err);
      } finally {
        checkingRef.current = false;
      }
    };

    checkAndDownload();
  }, [farmId, farmName, t]);

  return null; // Invisible component
}
