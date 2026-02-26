import { jsPDF } from 'jspdf';

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  netAmount: number;
  vatRate: number;
  vatAmount: number;
  grossAmount: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  issueDate: string;
  saleDate: string;
  paymentDue: string;
  seller: {
    name: string;
    address: string;
    nip: string;
  };
  buyer: {
    name: string;
    address: string;
    nip: string;
  };
  items: InvoiceItem[];
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

export function generateInvoicePDF(data: InvoiceData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('FAKTURA VAT', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nr: ${data.invoiceNumber}`, pageWidth / 2, y, { align: 'center' });
  y += 12;

  // Dates
  doc.setFontSize(9);
  const datesLeft = margin;
  doc.text(`Data wystawienia: ${data.issueDate}`, datesLeft, y);
  doc.text(`Data sprzedazy: ${data.saleDate}`, pageWidth / 2, y);
  y += 5;
  doc.text(`Termin platnosci: ${data.paymentDue}`, datesLeft, y);
  y += 10;

  // Seller / Buyer
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  const colWidth = contentWidth / 2 - 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Sprzedawca', margin, y);
  doc.text('Nabywca', margin + colWidth + 10, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  const sellerLines = [data.seller.name, data.seller.address, `NIP: ${data.seller.nip}`];
  const buyerLines = [data.buyer.name, data.buyer.address, `NIP: ${data.buyer.nip}`];

  const maxLines = Math.max(sellerLines.length, buyerLines.length);
  for (let i = 0; i < maxLines; i++) {
    if (sellerLines[i]) doc.text(sellerLines[i], margin, y);
    if (buyerLines[i]) doc.text(buyerLines[i], margin + colWidth + 10, y);
    y += 4.5;
  }
  y += 6;

  // Table header
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const cols = [
    { label: 'Lp.', x: margin, w: 10 },
    { label: 'Opis', x: margin + 10, w: 60 },
    { label: 'Ilosc', x: margin + 70, w: 15 },
    { label: 'Jedn.', x: margin + 85, w: 12 },
    { label: 'Cena netto', x: margin + 97, w: 23 },
    { label: 'Wartosc netto', x: margin + 120, w: 25 },
    { label: 'VAT', x: margin + 145, w: 12 },
    { label: 'Brutto', x: margin + 157, w: 13 },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  cols.forEach((col) => {
    doc.text(col.label, col.x, y);
  });
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Table rows
  doc.setFont('helvetica', 'normal');
  data.items.forEach((item, i) => {
    const rowY = y;
    doc.text(`${i + 1}`, cols[0].x, rowY);
    // Truncate description if too long
    const desc = item.description.length > 35 ? item.description.substring(0, 32) + '...' : item.description;
    doc.text(desc, cols[1].x, rowY);
    doc.text(item.quantity.toFixed(2), cols[2].x, rowY);
    doc.text(item.unit, cols[3].x, rowY);
    doc.text(item.unitPrice.toFixed(2), cols[4].x, rowY);
    doc.text(item.netAmount.toFixed(2), cols[5].x, rowY);
    doc.text(`${item.vatRate}%`, cols[6].x, rowY);
    doc.text(item.grossAmount.toFixed(2), cols[7].x, rowY);
    y += 5;
  });

  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Summary
  doc.setFontSize(10);
  const summaryX = pageWidth - margin - 60;

  doc.setFont('helvetica', 'normal');
  doc.text('Razem netto:', summaryX, y);
  doc.text(`${data.totalNet.toFixed(2)} PLN`, summaryX + 40, y);
  y += 6;

  const displayVatRate = data.items.length > 0 ? data.items[0].vatRate : 23;
  doc.text(`VAT ${displayVatRate}%:`, summaryX, y);
  doc.text(`${data.totalVat.toFixed(2)} PLN`, summaryX + 40, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Razem brutto:', summaryX, y);
  doc.text(`${data.totalGross.toFixed(2)} PLN`, summaryX + 40, y);
  y += 15;

  // Payment
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Metoda platnosci: przelew', margin, y);

  // Save
  doc.save(`${data.invoiceNumber.replace(/\//g, '-')}.pdf`);
}

export interface SummaryData {
  title: string;
  issueDate: string;
  items: InvoiceItem[];
  totalNet: number;
  totalHours: number;
}

export function generateSummaryPDF(data: SummaryData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('PODSUMOWANIE', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.title, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.text(`Data: ${data.issueDate}`, margin, y);
  y += 10;

  // Table header
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  const cols = [
    { label: 'Lp.', x: margin, w: 10 },
    { label: 'Opis', x: margin + 10, w: 70 },
    { label: 'Godziny', x: margin + 80, w: 20 },
    { label: 'Stawka/h', x: margin + 100, w: 25 },
    { label: 'Kwota', x: margin + 125, w: 25 },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  cols.forEach((col) => {
    doc.text(col.label, col.x, y);
  });
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  // Table rows
  doc.setFont('helvetica', 'normal');
  data.items.forEach((item, i) => {
    const desc = item.description.length > 40 ? item.description.substring(0, 37) + '...' : item.description;
    doc.text(`${i + 1}`, cols[0].x, y);
    doc.text(desc, cols[1].x, y);
    doc.text(item.quantity.toFixed(2), cols[2].x, y);
    doc.text(`${item.unitPrice.toFixed(2)} PLN`, cols[3].x, y);
    doc.text(`${item.netAmount.toFixed(2)} PLN`, cols[4].x, y);
    y += 5;
  });

  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Summary
  doc.setFontSize(10);
  const summaryX = pageWidth - margin - 60;

  doc.setFont('helvetica', 'normal');
  doc.text('Razem godziny:', summaryX, y);
  doc.text(`${data.totalHours.toFixed(2)}h`, summaryX + 40, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.text('Razem kwota:', summaryX, y);
  doc.text(`${data.totalNet.toFixed(2)} PLN`, summaryX + 40, y);

  // Save
  const datePart = data.issueDate.replace(/-/g, '');
  doc.save(`podsumowanie-${datePart}.pdf`);
}

export interface PITData {
  periodLabel: string;
  grossIncome: number;
  pitTax: number;
  healthInsurance: number;
  netIncome: number;
  effectiveRate: number;
  issueDate: string;
}

export function generatePITPDF(data: PITData): void {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SZACUNEK PODATKOWY PIT', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(data.periodLabel, pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(9);
  doc.text(`Data: ${data.issueDate}`, margin, y);
  y += 10;

  // Table header
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Pozycja', margin, y);
  doc.text('Kwota', margin + contentWidth - 30, y);
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  // Table rows
  doc.setFont('helvetica', 'normal');
  const rows = [
    { label: 'Przychod brutto', value: `${data.grossIncome.toFixed(2)} PLN` },
    { label: 'Zaliczka PIT (12%/32%)', value: `-${data.pitTax.toFixed(2)} PLN` },
    { label: 'Skladka zdrowotna (9%)', value: `-${data.healthInsurance.toFixed(2)} PLN` },
  ];

  rows.forEach((row) => {
    doc.text(row.label, margin, y);
    doc.text(row.value, margin + contentWidth - 30, y);
    y += 6;
  });

  // Net row (bold)
  y += 2;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  doc.setFont('helvetica', 'bold');
  doc.text('Przychod netto', margin, y);
  doc.text(`${data.netIncome.toFixed(2)} PLN`, margin + contentWidth - 30, y);
  y += 10;

  // Effective rate
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Stawka efektywna: ${data.effectiveRate.toFixed(1)}%`, margin, y);
  y += 12;

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Dokument ma charakter informacyjny — nie stanowi deklaracji podatkowej.',
    margin,
    y
  );

  // Save
  const datePart = data.issueDate.replace(/-/g, '');
  doc.save(`pit-szacunek-${datePart}.pdf`);
}
