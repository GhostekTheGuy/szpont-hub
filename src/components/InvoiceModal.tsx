'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateInvoicePDF, generateSummaryPDF, type InvoiceData, type InvoiceItem } from '@/lib/invoice-pdf';

interface WorkEventForInvoice {
  title: string;
  hours: number;
  hourlyRate: number;
}

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  workEvents: WorkEventForInvoice[];
  monthLabel: string;
}

interface SellerData {
  name: string;
  address: string;
  nip: string;
}

function peekNextInvoiceNumber(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  const counterKey = `invoice_counter_${yyyy}_${mm}`;
  const current = parseInt(localStorage.getItem(counterKey) || '0', 10);
  const next = current + 1;

  return `FV/${yyyy}/${mm}/${String(next).padStart(3, '0')}`;
}

function commitInvoiceNumber(): void {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');

  const counterKey = `invoice_counter_${yyyy}_${mm}`;
  const current = parseInt(localStorage.getItem(counterKey) || '0', 10);
  localStorage.setItem(counterKey, String(current + 1));
}

function getSavedSeller(): SellerData | null {
  try {
    const raw = localStorage.getItem('invoice_seller');
    if (!raw) return null;
    // Decode from base64 obfuscation
    const decoded = atob(raw);
    return JSON.parse(decoded);
  } catch {
    // Fallback: try reading legacy plaintext format
    try {
      const raw = localStorage.getItem('invoice_seller');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      // Re-save in obfuscated format
      localStorage.setItem('invoice_seller', btoa(JSON.stringify(parsed)));
      return parsed;
    } catch {
      return null;
    }
  }
}

function saveSeller(seller: SellerData) {
  // Base64 encode to avoid storing NIP/address in plaintext
  localStorage.setItem('invoice_seller', btoa(JSON.stringify(seller)));
}

type DocType = 'invoice' | 'summary';

export function InvoiceModal({ isOpen, onClose, workEvents, monthLabel }: InvoiceModalProps) {
  const savedSeller = useMemo(() => getSavedSeller(), []);

  const [docType, setDocType] = useState<DocType>('invoice');
  const [sellerName, setSellerName] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerNip, setSellerNip] = useState('');
  const [sellerCollapsed, setSellerCollapsed] = useState(false);

  const [buyerName, setBuyerName] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerNip, setBuyerNip] = useState('');

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [issueDate, setIssueDate] = useState('');
  const [paymentDays, setPaymentDays] = useState(14);
  const [vatRate, setVatRate] = useState(23);

  useEffect(() => {
    if (isOpen) {
      const seller = getSavedSeller();
      if (seller) {
        setSellerName(seller.name);
        setSellerAddress(seller.address);
        setSellerNip(seller.nip);
        setSellerCollapsed(true);
      } else {
        setSellerCollapsed(false);
      }

      setInvoiceNumber(peekNextInvoiceNumber());
      setIssueDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen]);

  const items: InvoiceItem[] = useMemo(() => {
    // Group by title + rate
    const grouped = new Map<string, { title: string; hours: number; rate: number }>();
    for (const ev of workEvents) {
      const key = `${ev.title}\0${ev.hourlyRate}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.hours += ev.hours;
      } else {
        grouped.set(key, { title: ev.title, hours: ev.hours, rate: ev.hourlyRate });
      }
    }

    return Array.from(grouped.values()).map(({ title, hours, rate }) => {
      const netAmount = hours * rate;
      const vatAmount = netAmount * (vatRate / 100);
      return {
        description: title,
        quantity: parseFloat(hours.toFixed(2)),
        unit: 'godz.',
        unitPrice: rate,
        netAmount,
        vatRate,
        vatAmount,
        grossAmount: netAmount + vatAmount,
      };
    });
  }, [workEvents, vatRate]);

  const totalNet = items.reduce((sum, i) => sum + i.netAmount, 0);
  const totalVat = items.reduce((sum, i) => sum + i.vatAmount, 0);
  const totalGross = totalNet + totalVat;

  const paymentDue = useMemo(() => {
    if (!issueDate) return '';
    const d = new Date(issueDate);
    d.setDate(d.getDate() + paymentDays);
    return d.toISOString().split('T')[0];
  }, [issueDate, paymentDays]);

  const handleGenerate = () => {
    if (docType === 'summary') {
      const totalHours = items.reduce((sum, i) => sum + i.quantity, 0);
      generateSummaryPDF({
        title: monthLabel,
        issueDate,
        items,
        totalNet,
        totalHours,
      });
      onClose();
      return;
    }

    // Commit invoice counter only when actually generating
    commitInvoiceNumber();
    // Save seller for future
    saveSeller({ name: sellerName, address: sellerAddress, nip: sellerNip });

    const data: InvoiceData = {
      invoiceNumber,
      issueDate,
      saleDate: issueDate,
      paymentDue,
      seller: { name: sellerName, address: sellerAddress, nip: sellerNip },
      buyer: { name: buyerName, address: buyerAddress, nip: buyerNip },
      items,
      totalNet,
      totalVat,
      totalGross,
    };

    generateInvoicePDF(data);
    onClose();
  };

  const canGenerate = docType === 'summary'
    ? items.length > 0
    : sellerName && sellerNip && buyerName && buyerNip && items.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-card-foreground">Generuj dokument — {monthLabel}</h2>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Doc type toggle */}
              <div className="flex bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setDocType('summary')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    docType === 'summary'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Podsumowanie
                </button>
                <button
                  onClick={() => setDocType('invoice')}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    docType === 'invoice'
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Faktura VAT
                </button>
              </div>

              {/* Invoice number & dates */}
              {docType === 'invoice' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Numer faktury</label>
                      <input
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Data wystawienia</label>
                      <input
                        type="date"
                        value={issueDate}
                        onChange={(e) => setIssueDate(e.target.value)}
                        className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Termin płatności (dni)</label>
                      <input
                        type="number"
                        value={paymentDays}
                        onChange={(e) => setPaymentDays(parseInt(e.target.value) || 14)}
                        className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Stawka VAT (%)</label>
                      <input
                        type="number"
                        value={vatRate}
                        onChange={(e) => setVatRate(parseInt(e.target.value) || 23)}
                        className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>

                  {/* Seller */}
                  <div>
                    <button
                      onClick={() => setSellerCollapsed(!sellerCollapsed)}
                      className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2"
                    >
                      Sprzedawca
                      {sellerCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                      {sellerCollapsed && sellerName && (
                        <span className="text-foreground font-normal">— {sellerName}</span>
                      )}
                    </button>
                    {!sellerCollapsed && (
                      <div className="space-y-2">
                        <input
                          placeholder="Nazwa firmy"
                          value={sellerName}
                          onChange={(e) => setSellerName(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                          placeholder="Adres"
                          value={sellerAddress}
                          onChange={(e) => setSellerAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                        <input
                          placeholder="NIP"
                          value={sellerNip}
                          onChange={(e) => setSellerNip(e.target.value)}
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    )}
                  </div>

                  {/* Buyer */}
                  <div>
                    <div className="text-sm font-medium text-muted-foreground mb-2">Nabywca</div>
                    <div className="space-y-2">
                      <input
                        placeholder="Nazwa firmy"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                      <input
                        placeholder="Adres"
                        value={buyerAddress}
                        onChange={(e) => setBuyerAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                      <input
                        placeholder="NIP"
                        value={buyerNip}
                        onChange={(e) => setBuyerNip(e.target.value)}
                        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-xs text-muted-foreground">Data</label>
                  <input
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full mt-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              )}

              {/* Items table */}
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Pozycje</div>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Brak potwierdzonych wydarzeń pracy w tym miesiącu</p>
                ) : (
                  <div className="space-y-1.5">
                    {items.map((item, i) => (
                      <div key={i} className="flex items-center justify-between bg-secondary/50 rounded-lg px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <span className="text-sm text-foreground truncate block">{item.description}</span>
                          <span className="text-xs text-muted-foreground">
                            {item.quantity}h × {item.unitPrice.toFixed(2)} PLN
                          </span>
                        </div>
                        <span className="text-sm font-medium text-foreground whitespace-nowrap ml-2">
                          {item.netAmount.toFixed(2)} PLN
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary */}
              {items.length > 0 && (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 space-y-1">
                  {docType === 'invoice' ? (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Netto</span>
                        <span className="text-foreground">{totalNet.toFixed(2)} PLN</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">VAT {vatRate}%</span>
                        <span className="text-foreground">{totalVat.toFixed(2)} PLN</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-primary/20">
                        <span className="text-foreground">Brutto</span>
                        <span className="text-foreground">{totalGross.toFixed(2)} PLN</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Godziny</span>
                        <span className="text-foreground">{items.reduce((s, i) => s + i.quantity, 0).toFixed(2)}h</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold pt-1 border-t border-primary/20">
                        <span className="text-foreground">Razem</span>
                        <span className="text-foreground">{totalNet.toFixed(2)} PLN</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                <FileText className="w-4 h-4" />
                {docType === 'summary' ? 'Generuj podsumowanie' : 'Generuj fakturę'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
