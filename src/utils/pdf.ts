import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface InvoiceData {
  orderId: string;
  serviceType: string;
  customerName: string;
  workerName?: string;
  pickupAddress: string;
  destinationAddress: string;
  price: number;
  discount?: number;
  distance?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  date: string;
  notes?: string;
}

export function generateInvoicePDF(data: InvoiceData): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Header
  doc.setFillColor(43, 197, 212);
  doc.rect(0, 0, 210, 40, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Boh-Hizmet', 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bartin, Turkey', 20, 32);

  // Invoice title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 197, 212);
  doc.text('INVOICE', 160, 25);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`#${data.orderId}`, 160, 32);

  // Details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Invoice Details', 20, 55);

  const details: [string, string][] = [
    ['Date:', data.date],
    ['Service:', data.serviceType],
    ['Customer:', data.customerName],
  ];
  if (data.workerName) {
    details.push(['Worker:', data.workerName]);
  }

  let y = 63;
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(value, 55, y);
    y += 7;
  }

  // Locations
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Pickup:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.pickupAddress, 55, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Destination:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.destinationAddress, 55, y);

  // Table
  y += 15;
  const tableData: any[][] = [
    ['Item', 'Description', 'Amount'],
    ['Service Fee', data.serviceType, `TRY ${data.price.toLocaleString('tr-TR')}`],
  ];
  if (data.distance) {
    tableData.push(['Distance', `${data.distance} km`, '-']);
  }
  if (data.discount && data.discount > 0) {
    tableData.push(['Discount', 'Promo applied', `-TRY ${data.discount.toLocaleString('tr-TR')}`]);
  }

  (doc as any).autoTable({
    startY: y,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: {
      fillColor: [43, 197, 212],
      textColor: 255,
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 80 },
      2: { cellWidth: 50, halign: 'right' },
    },
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const total = data.price - (data.discount || 0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Total:', 130, finalY);
  doc.setFontSize(16);
  doc.setTextColor(43, 197, 212);
  doc.text(`TRY ${total.toLocaleString('tr-TR')}`, 160, finalY);

  // Payment status
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Payment: ${data.paymentStatus || 'Unpaid'} (${data.paymentMethod?.toUpperCase() || 'COD'})`, 20, finalY);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for using Boh-Hizmet!', 105, 280, { align: 'center' });

  // Save
  const pdfUrl = doc.output('datauristring');
  return pdfUrl;
}

export function downloadInvoicePDF(data: InvoiceData, filename?: string) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Same content as above but with save
  doc.setFillColor(43, 197, 212);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('Boh-Hizmet', 20, 25);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Bartin, Turkey', 20, 32);

  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(43, 197, 212);
  doc.text('INVOICE', 160, 25);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`#${data.orderId}`, 160, 32);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Invoice Details', 20, 55);

  const details: [string, string][] = [
    ['Date:', data.date],
    ['Service:', data.serviceType],
    ['Customer:', data.customerName],
  ];
  if (data.workerName) details.push(['Worker:', data.workerName]);

  let y = 63;
  for (const [label, value] of details) {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 100, 100);
    doc.text(label, 20, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(value, 55, y);
    y += 7;
  }

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Pickup:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.pickupAddress, 55, y);
  y += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Destination:', 20, y);
  doc.setFont('helvetica', 'normal');
  doc.text(data.destinationAddress, 55, y);

  y += 15;
  const tableData: any[][] = [
    ['Item', 'Description', 'Amount'],
    ['Service Fee', data.serviceType, `TRY ${data.price.toLocaleString('tr-TR')}`],
  ];
  if (data.distance) tableData.push(['Distance', `${data.distance} km`, '-']);
  if (data.discount && data.discount > 0) tableData.push(['Discount', 'Promo applied', `-TRY ${data.discount.toLocaleString('tr-TR')}`]);

  (doc as any).autoTable({
    startY: y,
    head: [tableData[0]],
    body: tableData.slice(1),
    theme: 'grid',
    headStyles: { fillColor: [43, 197, 212], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 80 }, 2: { cellWidth: 50, halign: 'right' } },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  const total = data.price - (data.discount || 0);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(60, 60, 60);
  doc.text('Total:', 130, finalY);
  doc.setFontSize(16);
  doc.setTextColor(43, 197, 212);
  doc.text(`TRY ${total.toLocaleString('tr-TR')}`, 160, finalY);

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Payment: ${data.paymentStatus || 'Unpaid'} (${data.paymentMethod?.toUpperCase() || 'COD'})`, 20, finalY);

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Thank you for using Boh-Hizmet!', 105, 280, { align: 'center' });

  doc.save(filename || `Invoice-${data.orderId}.pdf`);
}
