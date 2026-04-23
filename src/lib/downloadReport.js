import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getExpenses, getIncome, getWorkers } from '@/lib/actions';
import toast from 'react-hot-toast';

export async function downloadFarmReport(farmId, farmName, t) {
  try {
    toast.loading(t?.('downloadingPdf') || 'Preparing Monthly Report...', { id: 'pdf-dl' });

    const [expenses, income, workers] = await Promise.all([
      getExpenses(farmId),
      getIncome(farmId),
      getWorkers(farmId)
    ]);
    
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
    doc.text('Upad History', 14, finalY + 5);
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
    doc.text('Workers Expense (Majuri)', 14, finalY + 5);
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
    doc.text('Expense History (Pesticide)', 14, finalY + 5);
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
    finalY = doc.lastAutoTable.finalY + 10;

    // Settlement Section
    const totalIncome = income.reduce((a, c) => a + Number(c.amount), 0);
    const totalPesticide = pesticide.reduce((a, c) => a + Number(c.amount), 0);
    const totalUpad = upad.reduce((a, c) => a + Number(c.amount), 0);
    const totalMajuri = majuri.reduce((a, c) => a + Number(c.amount), 0);
    const netFarm = totalIncome - totalPesticide - totalUpad - totalMajuri;

    doc.setFontSize(14);
    doc.text('Farm Balance Summary', 14, finalY + 5);
    autoTable(doc, {
      startY: finalY + 10,
      head: [['Total Income', 'Pesticide/Other', 'Total Upad', 'Total Majuri', 'Net Farm Balance']],
      body: [[
        `Rs ${totalIncome}`,
        `Rs ${totalPesticide}`,
        `Rs ${totalUpad}`,
        `Rs ${totalMajuri}`,
        `Rs ${netFarm}`
      ]],
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [22, 163, 74] } // green-600
    });
    finalY = doc.lastAutoTable.finalY + 10;

    let totalWorkerShare = 0;

    if (workers && workers.length > 0) {
      doc.setFontSize(12);
      doc.text('Worker Settlements', 14, finalY + 5);
      
      const workerSettlementBody = workers.map(worker => {
        const workerUpad = upad.filter(u => u.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
        const workerMajuri = majuri.filter(m => m.worker_id === worker.id).reduce((a, c) => a + Number(c.amount), 0);
        const grossShare = totalIncome * (Number(worker.share_percentage) / 100);
        totalWorkerShare += grossShare;
        const netPayable = grossShare - workerUpad - workerMajuri;
        
        return [
          worker.name,
          `${worker.share_percentage}%`,
          `Rs ${Math.round(grossShare)}`,
          `Rs ${workerUpad}`,
          `Rs ${workerMajuri}`,
          `Rs ${Math.round(netPayable)}`
        ];
      });

      autoTable(doc, {
        startY: finalY + 10,
        head: [['Worker', 'Share %', 'Share from Income', 'Upad Given', 'Majuri Deducted', 'Net Payable']],
        body: workerSettlementBody,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [22, 163, 74] }
      });
      finalY = doc.lastAutoTable.finalY + 10;
    }

    // Farmer's Final Profit
    const farmerNetProfit = totalIncome - totalPesticide - totalWorkerShare;
    doc.setFontSize(14);
    doc.text("Farmer's Final Profit", 14, finalY + 5);
    autoTable(doc, {
      startY: finalY + 10,
      head: [['Total Income', 'Pesticide/Other', 'Total Workers Share', "Farmer's Net Profit"]],
      body: [[
        `Rs ${totalIncome}`,
        `Rs ${totalPesticide}`,
        `Rs ${Math.round(totalWorkerShare)}`,
        `Rs ${Math.round(farmerNetProfit)}`
      ]],
      theme: 'grid',
      styles: { fontSize: 11, fontStyle: 'bold' },
      headStyles: { fillColor: [22, 163, 74] }
    });
    finalY = doc.lastAutoTable.finalY + 10;

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
