'use client';

import { useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import useLanguageStore from '@/store/useLanguageStore';
import { getExpenses } from '@/lib/actions';
import toast from 'react-hot-toast';

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

        toast.loading(t('downloadingPdf') || 'Preparing Monthly Report...', { id: 'pdf-dl' });

        // Fetch expenses for the farm
        const expenses = await getExpenses(farmId);
        
        // Group by type
        const upad = expenses.filter(e => e.type === 'upad');
        const majuri = expenses.filter(e => e.type === 'majuri');
        const pesticide = expenses.filter(e => e.type === 'pesticide');

        // Generate PDF
        const doc = new jsPDF();
        
        // Title
        doc.setFontSize(18);
        doc.text(`${farmName || 'Farm'} - Monthly Report`, 14, 22);
        
        doc.setFontSize(11);
        doc.text(`Date: ${today.toLocaleDateString()}`, 14, 30);

        let finalY = 35;

        // Upad History
        doc.setFontSize(14);
        doc.text(t('workerUpad') || 'Upad History', 14, finalY + 5);
        autoTable(doc, {
          startY: finalY + 10,
          head: [['Date', 'Worker', 'Amount', 'Comment']],
          body: upad.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.workers?.name || e.name || '-',
            e.amount,
            e.comment || '-'
          ]),
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] } // Blue
        });
        finalY = doc.lastAutoTable.finalY + 10;

        // Worker Expenses (Majuri)
        doc.setFontSize(14);
        doc.text(t('workerMajuri') || 'Workers Expense (Majuri)', 14, finalY + 5);
        autoTable(doc, {
          startY: finalY + 10,
          head: [['Date', 'Worker', 'Amount', 'Comment']],
          body: majuri.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.workers?.name || e.name || '-',
            e.amount,
            e.comment || '-'
          ]),
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [234, 179, 8] } // Yellow
        });
        finalY = doc.lastAutoTable.finalY + 10;

        // Farm Expenses (Pesticide)
        doc.setFontSize(14);
        doc.text(t('farmExpenses') || 'Expense History (Pesticide)', 14, finalY + 5);
        autoTable(doc, {
          startY: finalY + 10,
          head: [['Date', 'Item Name', 'Amount', 'Comment']],
          body: pesticide.map(e => [
            new Date(e.date).toLocaleDateString(),
            e.name || '-',
            e.amount,
            e.comment || '-'
          ]),
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [249, 115, 22] } // Orange
        });

        // Save
        const fileName = `${farmName?.replace(/\s+/g, '_') || 'Farm'}_Report_${year}_${month}.pdf`;
        doc.save(fileName);

        // Mark as downloaded
        localStorage.setItem(storageKey, 'true');
        toast.success(t('pdfDownloaded') || 'Monthly Report Downloaded!', { id: 'pdf-dl' });
      } catch (err) {
        console.error('Auto PDF DL Error:', err);
        toast.error('Failed to download report', { id: 'pdf-dl' });
      } finally {
        checkingRef.current = false;
      }
    };

    checkAndDownload();
  }, [farmId, farmName, t]);

  return null; // Invisible component
}
