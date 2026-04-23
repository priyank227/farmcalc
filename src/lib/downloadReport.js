import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getExpenses } from '@/lib/actions';
import toast from 'react-hot-toast';

export async function downloadFarmReport(farmId, farmName, t) {
  try {
    toast.loading(t?.('downloadingPdf') || 'Preparing Monthly Report...', { id: 'pdf-dl' });

    const expenses = await getExpenses(farmId);
    
    const upad = expenses.filter(e => e.type === 'upad');
    const majuri = expenses.filter(e => e.type === 'majuri');
    const pesticide = expenses.filter(e => e.type === 'pesticide');

    const doc = new jsPDF();
    const today = new Date();
    
    // Title
    doc.setFontSize(18);
    doc.text(`${farmName || 'Farm'} - Monthly Report`, 14, 22);
    
    doc.setFontSize(11);
    doc.text(`Date: ${today.toLocaleDateString()}`, 14, 30);

    let finalY = 35;

    // Upad History
    doc.setFontSize(14);
    doc.text(t?.('workerUpad') || 'Upad History', 14, finalY + 5);
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
      headStyles: { fillColor: [59, 130, 246] }
    });
    finalY = doc.lastAutoTable.finalY + 10;

    // Worker Expenses (Majuri)
    doc.setFontSize(14);
    doc.text(t?.('workerMajuri') || 'Workers Expense (Majuri)', 14, finalY + 5);
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
      headStyles: { fillColor: [234, 179, 8] }
    });
    finalY = doc.lastAutoTable.finalY + 10;

    // Farm Expenses (Pesticide)
    doc.setFontSize(14);
    doc.text(t?.('farmExpenses') || 'Expense History (Pesticide)', 14, finalY + 5);
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
      headStyles: { fillColor: [249, 115, 22] }
    });

    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const fileName = `${farmName?.replace(/\s+/g, '_') || 'Farm'}_Report_${year}_${month}.pdf`;
    doc.save(fileName);

    toast.success(t?.('pdfDownloaded') || 'Monthly Report Downloaded!', { id: 'pdf-dl' });
    return true;
  } catch (err) {
    console.error('PDF DL Error:', err);
    toast.error('Failed to download report', { id: 'pdf-dl' });
    return false;
  }
}
