'use client';

import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { FileText, Upload, Info, ChevronDown, ChevronRight, ChevronLeft, Search, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import { getClients, submitKugaruInvoice } from '@/app/actions';
import { useFinanceStore, type Client } from '@/hooks/useFinanceStore';
import {
  type KugaruFormData,
  type KugaruInvoiceItem,
  type ClientType,
  type ContractType,
  type CopyrightType,
  type AmountType,
  type PaymentTerm,
  createEmptyInvoiceItem,
  calculateTotals,
  COPYRIGHT_OPTIONS,
  CONTRACT_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/lib/kugaru';

const baseInputClass =
  'w-full bg-input border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all';
const inputClass = `${baseInputClass} border-border`;
const inputErrorClass = `${baseInputClass} border-destructive`;

const baseSelectClass =
  'w-full bg-input border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all appearance-none';
const selectClass = `${baseSelectClass} border-border`;

const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const hintClass = 'text-xs text-muted-foreground mt-1';
const errorClass = 'text-xs text-destructive mt-1';
const sectionClass = 'space-y-4';
const sectionTitleClass = 'text-lg font-bold text-foreground';

const STEPS = [
  { id: 1, label: 'Dane' },
  { id: 2, label: 'Faktura' },
  { id: 3, label: 'Rozliczenie' },
  { id: 4, label: 'Podsumowanie' },
] as const;

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground scale-110'
                  : isDone
                  ? 'bg-green-600 text-white'
                  : 'bg-secondary text-muted-foreground'
              }`}
            >
              {isDone ? <Check className="w-3.5 h-3.5" /> : step}
            </div>
            <span
              className={`text-xs font-medium hidden sm:block ${
                isActive ? 'text-foreground' : 'text-muted-foreground'
              }`}
            >
              {STEPS[i].label}
            </span>
            {i < total - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 rounded-full ${
                  isDone ? 'bg-green-600' : 'bg-border'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function KugaruInvoiceForm() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);

  // Clients autocomplete
  const [clients, setClients] = useState<Client[]>([]);
  const [clientQuery, setClientQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Personal data (persisted in localStorage)
  const [imieNazwisko, setImieNazwisko] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_imie') || '';
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_email') || '';
    return '';
  });
  const [telefon, setTelefon] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_telefon') || '';
    return '';
  });

  // Persist personal data on change
  useEffect(() => {
    localStorage.setItem('kugaru_imie', imieNazwisko);
  }, [imieNazwisko]);
  useEffect(() => {
    localStorage.setItem('kugaru_email', email);
  }, [email]);
  useEffect(() => {
    localStorage.setItem('kugaru_telefon', telefon);
  }, [telefon]);

  // Invoice items
  const [pozycje, setPozycje] = useState<KugaruInvoiceItem[]>([createEmptyInvoiceItem()]);

  // Copyright & value
  const [prawaAutorskie, setPrawaAutorskie] = useState<CopyrightType>('udziela_licencji');
  const [waluta, setWaluta] = useState('PLN');
  const [typKwoty, setTypKwoty] = useState<AmountType>('netto');

  // Auto-calculated from invoice items
  const invoiceTotals = useMemo(() => calculateTotals(pozycje), [pozycje]);
  const wartoscZlecenia = typKwoty === 'netto' ? invoiceTotals.netto : invoiceTotals.brutto;

  // Contract form
  const [formaRozliczenia, setFormaRozliczenia] = useState<ContractType>('umowa_o_dzielo');
  const [jestStudentem, setJestStudentem] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_student') === 'true';
    return false;
  });
  useEffect(() => {
    localStorage.setItem('kugaru_student', String(jestStudentem));
  }, [jestStudentem]);

  // Client data
  const [typKlienta, setTypKlienta] = useState<ClientType>('firma');
  const [nip, setNip] = useState('');
  const [nazwaFirmy, setNazwaFirmy] = useState('');
  const [ulica, setUlica] = useState('');
  const [kodPocztowy, setKodPocztowy] = useState('');
  const [miasto, setMiasto] = useState('');
  const [emailZleceniodawcy, setEmailZleceniodawcy] = useState('');

  // PESEL & citizenship (persisted)
  const [pesel, setPesel] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_pesel') || '';
    return '';
  });
  const [obywatelstwo, setObywatelstwo] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('kugaru_citizenship') || 'polskie';
    return 'polskie';
  });
  useEffect(() => {
    localStorage.setItem('kugaru_pesel', pesel);
  }, [pesel]);
  useEffect(() => {
    localStorage.setItem('kugaru_citizenship', obywatelstwo);
  }, [obywatelstwo]);

  // Work description
  const [opisDziela, setOpisDziela] = useState('');
  const [zalacznik, setZalacznik] = useState<File | null>(null);
  const [uwagi, setUwagi] = useState('');

  // Payment
  const [terminPlatnosci, setTerminPlatnosci] = useState<PaymentTerm>('7');
  const [customTermin, setCustomTermin] = useState('');

  // Checkboxes
  const [pomijaProforme] = useState(false);
  const [weryfikacjaPrzedWyslaniem, setWeryfikacjaPrzedWyslaniem] = useState(false);
  const [samodzielnieWysyla, setSamodzielnieWysyla] = useState(false);
  const [abonamentZamiastProwizji] = useState(false);
  const [brakPostepowan, setBrakPostepowan] = useState(false);
  const [akceptujeRegulamin, setAkceptujeRegulamin] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill from order (set via Projects page "Rozlicz fakturę")
  const invoicePrefill = useFinanceStore(s => s.invoicePrefill);
  const setInvoicePrefill = useFinanceStore(s => s.setInvoicePrefill);

  useEffect(() => {
    if (!invoicePrefill) return;
    const { client, order } = invoicePrefill;

    // Client data
    setSelectedClient(client);
    setClientQuery(client.company_name || client.name);
    setNazwaFirmy(client.company_name || client.name);
    setNip(client.nip || '');
    setUlica(client.street || '');
    setKodPocztowy(client.postal_code || '');
    setMiasto(client.city || '');
    setEmailZleceniodawcy(client.email || '');
    if (client.nip) setTypKlienta('firma');

    // Invoice item from order
    const isHourly = order.billing_type === 'hourly';
    const cenaNetto = isHourly ? (order.hourly_rate ?? 0) : order.amount;
    const ilosc = isHourly ? Math.max(order.tracked_hours, 0.1) : 1;
    const wartoscNetto = ilosc * cenaNetto;
    const wartoscVat = wartoscNetto * 0.23;
    const item: KugaruInvoiceItem = {
      id: crypto.randomUUID(),
      nazwa: order.title,
      ilosc,
      jm: isHourly ? 'godz.' : 'szt.',
      cenaNetto,
      vat: 23,
      wartoscNetto,
      wartoscVat,
      wartoscBrutto: wartoscNetto + wartoscVat,
    };
    setPozycje([item]);

    // Work description
    setOpisDziela(order.title);
    if (order.description) setUwagi(order.description);

    // Clear prefill so it doesn't re-apply
    setInvoicePrefill(null);
  }, [invoicePrefill, setInvoicePrefill]);

  const validateStep = useCallback((s: number): Record<string, string> => {
    const errs: Record<string, string> = {};

    if (s === 1) {
      if (!imieNazwisko.trim()) errs.imieNazwisko = 'Imię i nazwisko jest wymagane';
      if (!email.trim()) errs.email = 'Email jest wymagany';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Nieprawidłowy format email';
      if (!pesel.trim()) errs.pesel = 'PESEL jest wymagany';
      else if (!/^\d{11}$/.test(pesel)) errs.pesel = 'PESEL musi mieć 11 cyfr';
      if (!obywatelstwo.trim()) errs.obywatelstwo = 'Obywatelstwo jest wymagane';
    }

    if (s === 2) {
      const hasValidItem = pozycje.some(p => p.nazwa.trim() && p.cenaNetto > 0);
      if (!hasValidItem) errs.pozycje = 'Dodaj co najmniej jedną pozycję z nazwą i ceną większą od 0';
    }

    if (s === 3) {
      if (typKlienta === 'firma' && !nip.trim()) errs.nip = 'NIP jest wymagany';
      if (!nazwaFirmy.trim()) errs.nazwaFirmy = typKlienta === 'firma' ? 'Nazwa firmy jest wymagana' : 'Imię i nazwisko jest wymagane';
      if (!ulica.trim()) errs.ulica = 'Ulica jest wymagana';
      if (!kodPocztowy.trim()) errs.kodPocztowy = 'Kod pocztowy jest wymagany';
      else if (!/^\d{2}-\d{3}$/.test(kodPocztowy.trim())) errs.kodPocztowy = 'Kod pocztowy w formacie XX-XXX';
      if (!miasto.trim()) errs.miasto = 'Miasto jest wymagane';
      if (!emailZleceniodawcy.trim()) errs.emailZleceniodawcy = 'Email zleceniodawcy jest wymagany';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailZleceniodawcy)) errs.emailZleceniodawcy = 'Nieprawidłowy format email';
      if (emailZleceniodawcy.trim() && email.trim() && emailZleceniodawcy.trim().toLowerCase() === email.trim().toLowerCase()) {
        errs.emailZleceniodawcy = 'Email zleceniodawcy musi być inny niż Twój email';
      }
    }

    if (s === 4) {
      if (!opisDziela.trim()) errs.opisDziela = 'Opis dzieła jest wymagany';
      if (terminPlatnosci === 'custom' && !customTermin.trim()) errs.customTermin = 'Podaj termin płatności';
      if (!brakPostepowan) errs.brakPostepowan = 'Musisz potwierdzić brak postępowań';
      if (!akceptujeRegulamin) errs.akceptujeRegulamin = 'Musisz zaakceptować regulamin';
    }

    return errs;
  }, [imieNazwisko, email, pesel, obywatelstwo, pozycje, typKlienta, nip, nazwaFirmy, ulica, kodPocztowy, miasto, emailZleceniodawcy, opisDziela, terminPlatnosci, customTermin, brakPostepowan, akceptujeRegulamin]);

  const blurValidateField = useCallback((field: string, step: number) => {
    const all = validateStep(step);
    if (all[field]) {
      setErrors(prev => ({ ...prev, [field]: all[field] }));
    } else {
      setErrors(prev => { const { [field]: _, ...rest } = prev; return rest; });
    }
  }, [validateStep]);

  // Fetch clients on mount
  useEffect(() => {
    getClients().then((data) => {
      if (Array.isArray(data?.clients)) setClients(data.clients);
    }).catch(() => {});
  }, []);

  // Close suggestions on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filteredClients = useMemo(() => {
    if (!Array.isArray(clients)) return [];
    if (!clientQuery.trim()) return clients;
    const q = clientQuery.toLowerCase();
    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.company_name && c.company_name.toLowerCase().includes(q)) ||
        (c.nip && c.nip.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q))
    );
  }, [clients, clientQuery]);

  const selectClient = useCallback(
    (client: Client) => {
      setSelectedClient(client);
      setClientQuery(client.company_name || client.name);
      setShowSuggestions(false);

      // Auto-fill client fields
      setNazwaFirmy(client.company_name || client.name);
      setNip(client.nip || '');
      setUlica(client.street || '');
      setKodPocztowy(client.postal_code || '');
      setMiasto(client.city || '');
      setEmailZleceniodawcy(client.email || '');
      if (client.nip) {
        setTypKlienta('firma');
      }
    },
    []
  );

  const clearClient = useCallback(() => {
    setSelectedClient(null);
    setClientQuery('');
    setNazwaFirmy('');
    setNip('');
    setUlica('');
    setKodPocztowy('');
    setMiasto('');
    setEmailZleceniodawcy('');
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      if (file) {
        const allowed = ['docx', 'doc', 'pdf', 'txt', 'png', 'mp3', 'mp4', 'jpg'];
        const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
        if (!allowed.includes(ext)) {
          toast('Niedozwolony format pliku', 'error');
          e.target.value = '';
          return;
        }
      }
      setZalacznik(file);
    },
    [toast]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const stepErrors = validateStep(4);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await submitKugaruInvoice({
        name: imieNazwisko,
        email,
        phone: telefon,
        pesel,
        citizenship: obywatelstwo,
        items: pozycje.map((p) => ({
          name: p.nazwa,
          quantity: p.ilosc,
          unit: p.jm,
          netPrice: p.cenaNetto,
          vatRate: p.vat,
        })),
        rightsTransfer: prawaAutorskie,
        orderValue: wartoscZlecenia,
        currency: waluta,
        amountType: typKwoty,
        contractType: formaRozliczenia,
        isStudent: jestStudentem,
        clientType: typKlienta,
        clientNip: nip,
        clientCompanyName: nazwaFirmy,
        clientStreet: ulica,
        clientPostalCode: kodPocztowy,
        clientCity: miasto,
        clientEmail: emailZleceniodawcy,
        description: opisDziela,
        notes: uwagi,
        paymentTerm: terminPlatnosci === 'custom' ? 'custom' : `${terminPlatnosci} dni`,
        customPaymentTerm: terminPlatnosci === 'custom' ? customTermin : undefined,
        skipProforma: pomijaProforme,
        verifyBeforeSending: weryfikacjaPrzedWyslaniem,
        sendIndependently: samodzielnieWysyla,
        subscriptionInsteadOfFee: abonamentZamiastProwizji,
        noLegalProceedings: brakPostepowan,
        acceptTerms: akceptujeRegulamin,
      });

      if (result.ok) {
        toast(`Faktura wysłana pomyślnie${result.invoiceId ? ` (ID: ${result.invoiceId})` : ''}`, 'success');
      } else {
        toast(result.error || 'Błąd wysyłania faktury', 'error');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Nieznany błąd';
      toast(`Nie udało się wysłać formularza: ${message}`, 'error');
    } finally {
      setLoading(false);
    }
  };


  const goNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setStep((s) => Math.min(s + 1, 4));
  };
  const goPrev = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 1));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Wystaw fakturę</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
          Wypełnij formularz, aby rozpocząć proces rozliczania pracy.
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator current={step} total={4} />

      {/* Main container */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {/* ═══════ STEP 1: Dane ═══════ */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-6"
              >
                {/* Client autocomplete */}
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Wybierz klienta</h2>
                  <p className="text-sm text-muted-foreground -mt-2">
                    Wyszukaj istniejącego klienta, aby automatycznie wypełnić dane zleceniodawcy.
                  </p>
                  <div className="relative" ref={suggestionsRef}>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={clientQuery}
                        onChange={(e) => {
                          setClientQuery(e.target.value);
                          setShowSuggestions(true);
                          if (selectedClient) setSelectedClient(null);
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        className={`${inputClass} pl-9 pr-9`}
                        placeholder="Szukaj po nazwie, NIP lub email..."
                      />
                      {(clientQuery || selectedClient) && (
                        <button
                          type="button"
                          onClick={clearClient}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    {selectedClient && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-500">
                        <Check className="w-4 h-4" />
                        <span>
                          Wybrano: <strong>{selectedClient.company_name || selectedClient.name}</strong>
                          {selectedClient.nip && <span className="text-muted-foreground ml-1">NIP: {selectedClient.nip}</span>}
                        </span>
                      </div>
                    )}
                    {showSuggestions && !selectedClient && filteredClients.length > 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredClients.map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => selectClient(c)}
                            className="w-full text-left px-4 py-2.5 hover:bg-secondary/60 transition-colors border-b border-border last:border-b-0"
                          >
                            <div className="text-sm font-medium text-foreground">
                              {c.company_name || c.name}
                            </div>
                            <div className="text-xs text-muted-foreground flex gap-3">
                              {c.nip && <span>NIP: {c.nip}</span>}
                              {c.email && <span>{c.email}</span>}
                              {c.city && <span>{c.city}</span>}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    {showSuggestions && !selectedClient && clientQuery && filteredClients.length === 0 && (
                      <div className="absolute z-20 left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg p-4 text-sm text-muted-foreground text-center">
                        Brak klientów pasujących do wyszukiwania
                      </div>
                    )}
                  </div>
                </section>

                {/* Twoje dane */}
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Twoje dane</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Twoje imię i nazwisko <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={imieNazwisko}
                        onChange={(e) => { setImieNazwisko(e.target.value); if (errors.imieNazwisko) setErrors(prev => { const {imieNazwisko: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('imieNazwisko', 1)}
                        className={errors.imieNazwisko ? inputErrorClass : inputClass}
                        placeholder="Jan Kowalski"
                      />
                      {errors.imieNazwisko && <p className={errorClass}>{errors.imieNazwisko}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Twój email <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => { const {email: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('email', 1)}
                        className={errors.email ? inputErrorClass : inputClass}
                        placeholder="jan@example.com"
                      />
                      {errors.email && <p className={errorClass}>{errors.email}</p>}
                    </div>
                  </div>
                  <div className="md:w-1/2">
                    <label className={labelClass}>Telefon kontaktowy</label>
                    <input
                      type="tel"
                      value={telefon}
                      onChange={(e) => setTelefon(e.target.value)}
                      onBlur={() => blurValidateField('telefon', 1)}
                      className={inputClass}
                      placeholder="czasami tak jest szybciej"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        PESEL <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={pesel}
                        onChange={(e) => { setPesel(e.target.value); if (errors.pesel) setErrors(prev => { const {pesel: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('pesel', 1)}
                        className={errors.pesel ? inputErrorClass : inputClass}
                        placeholder="00000000000"
                        maxLength={11}
                      />
                      {errors.pesel && <p className={errorClass}>{errors.pesel}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Obywatelstwo <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={obywatelstwo}
                        onChange={(e) => { setObywatelstwo(e.target.value); if (errors.obywatelstwo) setErrors(prev => { const {obywatelstwo: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('obywatelstwo', 1)}
                        className={errors.obywatelstwo ? inputErrorClass : inputClass}
                        placeholder="polskie"
                      />
                      {errors.obywatelstwo && <p className={errorClass}>{errors.obywatelstwo}</p>}
                    </div>
                  </div>
                </section>


              </motion.div>
            )}

            {/* ═══════ STEP 2: Faktura ═══════ */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-6"
              >
                {/* Pozycje na fakturze */}
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Pozycje na fakturze</h2>
                  <InvoiceItemsTable items={pozycje} onChange={(items) => { setPozycje(items); if (errors.pozycje) setErrors(prev => { const {pozycje: _, ...rest} = prev; return rest; }); }} />
                  {errors.pozycje && <p className={errorClass}>{errors.pozycje}</p>}
                </section>

                {/* Prawa autorskie & Wartość */}
                <section className={sectionClass}>
                  <div>
                    <label className={labelClass}>
                      Prawa autorskie <span className="text-destructive">*</span>
                    </label>
                    <SelectWrapper>
                      <select
                        value={prawaAutorskie}
                        onChange={(e) => setPrawaAutorskie(e.target.value as CopyrightType)}
                        className={selectClass}
                      >
                        {COPYRIGHT_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </SelectWrapper>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Wartość zlecenia
                    </label>
                    <div className="flex gap-2">
                      <div className={`flex-1 ${inputClass} bg-secondary/50 font-medium`}>
                        {wartoscZlecenia.toFixed(2)}
                      </div>
                      <SelectWrapper>
                        <select
                          value={waluta}
                          onChange={(e) => setWaluta(e.target.value)}
                          className="w-24 bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all appearance-none text-center font-medium"
                        >
                          {CURRENCY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </SelectWrapper>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          name="typKwoty"
                          checked={typKwoty === 'netto'}
                          onChange={() => setTypKwoty('netto')}
                          className="accent-primary w-4 h-4"
                        />
                        kwota netto na fakturze
                      </label>
                      <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          name="typKwoty"
                          checked={typKwoty === 'brutto'}
                          onChange={() => setTypKwoty('brutto')}
                          className="accent-primary w-4 h-4"
                        />
                        kwota brutto na fakturze
                      </label>
                    </div>
                    <p className={hintClass}>
                      Jest to kwota, od której odejmujemy prowizję Kugaru oraz zaliczkę na PIT-11.
                    </p>
                  </div>
                </section>
              </motion.div>
            )}

            {/* ═══════ STEP 3: Rozliczenie ═══════ */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-6"
              >
                {/* Forma rozliczenia */}
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Preferowana forma rozliczenia</h2>
                  <div className="space-y-2">
                    {CONTRACT_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          formaRozliczenia === opt.value
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-secondary/30 hover:bg-secondary/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="formaRozliczenia"
                          checked={formaRozliczenia === opt.value}
                          onChange={() => setFormaRozliczenia(opt.value)}
                          className="accent-primary w-4 h-4 mt-0.5"
                        />
                        <div>
                          <span className="text-sm font-medium text-foreground">{opt.label}</span>
                          {opt.description && (
                            <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jestStudentem}
                      onChange={(e) => setJestStudentem(e.target.checked)}
                      className="accent-primary w-4 h-4 rounded"
                    />
                    Jestem uczniem/studentem i nie ukończyłem/am 26 lat
                  </label>
                </section>

                {/* Dane Zleceniodawcy */}
                <section className={sectionClass}>
                  <div className="flex items-center justify-between">
                    <h2 className={sectionTitleClass}>Dane Zleceniodawcy</h2>
                    {selectedClient && (
                      <span className="text-xs text-green-500 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Wypełniono z klienta
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="typKlienta"
                        checked={typKlienta === 'firma'}
                        onChange={() => setTypKlienta('firma')}
                        className="accent-primary w-4 h-4"
                      />
                      Klientem jest firma z Polski
                    </label>
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="typKlienta"
                        checked={typKlienta === 'osoba_fizyczna'}
                        onChange={() => setTypKlienta('osoba_fizyczna')}
                        className="accent-primary w-4 h-4"
                      />
                      Klientem jest osoba fizyczna z Polski
                    </label>
                  </div>

                  {typKlienta === 'firma' && (
                    <div>
                      <label className={labelClass}>
                        NIP <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={nip}
                        onChange={(e) => { setNip(e.target.value); if (errors.nip) setErrors(prev => { const {nip: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('nip', 3)}
                        className={errors.nip ? inputErrorClass : inputClass}
                        placeholder="Wpisz NIP firmy"
                      />
                      {errors.nip && <p className={errorClass}>{errors.nip}</p>}
                    </div>
                  )}

                  <div>
                    <label className={labelClass}>
                      {typKlienta === 'firma' ? 'Nazwa Firmy' : 'Imię i nazwisko'}{' '}
                      <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={nazwaFirmy}
                      onChange={(e) => { setNazwaFirmy(e.target.value); if (errors.nazwaFirmy) setErrors(prev => { const {nazwaFirmy: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidateField('nazwaFirmy', 3)}
                      className={errors.nazwaFirmy ? inputErrorClass : inputClass}
                    />
                    {errors.nazwaFirmy && <p className={errorClass}>{errors.nazwaFirmy}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>
                      Ulica <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={ulica}
                      onChange={(e) => { setUlica(e.target.value); if (errors.ulica) setErrors(prev => { const {ulica: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidateField('ulica', 3)}
                      className={errors.ulica ? inputErrorClass : inputClass}
                      placeholder={typKlienta === 'firma' ? 'Automatycznie pobierane po NIP' : ''}
                    />
                    {errors.ulica && <p className={errorClass}>{errors.ulica}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>
                        Kod pocztowy <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={kodPocztowy}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                          const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw;
                          setKodPocztowy(formatted);
                          if (errors.kodPocztowy) setErrors(prev => { const {kodPocztowy: _, ...rest} = prev; return rest; });
                        }}
                        onBlur={() => blurValidateField('kodPocztowy', 3)}
                        className={errors.kodPocztowy ? inputErrorClass : inputClass}
                        placeholder={typKlienta === 'firma' ? 'Automatycznie pobierane po NIP' : '00-000'}
                      />
                      {errors.kodPocztowy && <p className={errorClass}>{errors.kodPocztowy}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>
                        Siedziba (miasto) <span className="text-destructive">*</span>
                      </label>
                      <input
                        type="text"
                        value={miasto}
                        onChange={(e) => { setMiasto(e.target.value); if (errors.miasto) setErrors(prev => { const {miasto: _, ...rest} = prev; return rest; }); }}
                        onBlur={() => blurValidateField('miasto', 3)}
                        className={errors.miasto ? inputErrorClass : inputClass}
                      />
                      {errors.miasto && <p className={errorClass}>{errors.miasto}</p>}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      E-mail Zleceniodawcy <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={emailZleceniodawcy}
                      onChange={(e) => { setEmailZleceniodawcy(e.target.value); if (errors.emailZleceniodawcy) setErrors(prev => { const {emailZleceniodawcy: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidateField('emailZleceniodawcy', 3)}
                      className={errors.emailZleceniodawcy ? inputErrorClass : inputClass}
                    />
                    {errors.emailZleceniodawcy ? <p className={errorClass}>{errors.emailZleceniodawcy}</p> : <p className={hintClass}>Musi różnić się od e-maila Zleceniobiorcy.</p>}
                  </div>
                </section>
              </motion.div>
            )}

            {/* ═══════ STEP 4: Podsumowanie ═══════ */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-5 space-y-6"
              >
                {/* Info box */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div className="text-sm text-foreground space-y-1">
                      <p className="font-semibold text-primary">Kilka wskazówek:</p>
                      <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
                        <li>Nie wymagamy rejestracji konta.</li>
                        <li>Przekazanie praw wiąże się z koniecznością podpisania protokołu.</li>
                        <li>Wybierz licencję, która obniża Twój podatek tak samo jak przekazanie praw autorskich.</li>
                        <li>Jeśli nie możesz wgrać pliku z pracą – prześlij go mailowo na adres: office@kugaru.com</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Opis dzieła */}
                <section className={sectionClass}>
                  <div>
                    <label className={labelClass}>
                      Opis dzieła/tytuł dzieła na fakturze <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={opisDziela}
                      onChange={(e) => { setOpisDziela(e.target.value); if (errors.opisDziela) setErrors(prev => { const {opisDziela: _, ...rest} = prev; return rest; }); }}
                      onBlur={() => blurValidateField('opisDziela', 4)}
                      rows={4}
                      className={`${errors.opisDziela ? inputErrorClass : inputClass} resize-y`}
                    />
                    {errors.opisDziela && <p className={errorClass}>{errors.opisDziela}</p>}
                  </div>

                  <div>
                    <label className={labelClass}>Dodaj dzieło jako załącznik</label>
                    <p className={hintClass + ' mb-2'}>
                      Dozwolone typy plików: docx, doc, pdf, txt, png, mp3, mp4, jpg
                    </p>
                    <label className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border border-border border-dashed rounded-xl cursor-pointer hover:bg-secondary/80 transition-colors">
                      <Upload className="w-5 h-5 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {zalacznik ? zalacznik.name : 'Wybierz plik'}
                      </span>
                      <input
                        type="file"
                        accept=".docx,.doc,.pdf,.txt,.png,.mp3,.mp4,.jpg"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className={labelClass}>Uwagi</label>
                    <textarea
                      value={uwagi}
                      onChange={(e) => setUwagi(e.target.value)}
                      rows={3}
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </section>

                {/* Termin płatności */}
                <section className={sectionClass}>
                  <h2 className={sectionTitleClass}>Termin płatności za proformę</h2>
                  <div className="flex flex-wrap items-center gap-4">
                    {(['7', '14'] as const).map((val) => (
                      <label key={val} className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                        <input
                          type="radio"
                          name="terminPlatnosci"
                          checked={terminPlatnosci === val}
                          onChange={() => setTerminPlatnosci(val)}
                          className="accent-primary w-4 h-4"
                        />
                        {val} dni
                      </label>
                    ))}
                    <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
                      <input
                        type="radio"
                        name="terminPlatnosci"
                        checked={terminPlatnosci === 'custom'}
                        onChange={() => setTerminPlatnosci('custom')}
                        className="accent-primary w-4 h-4"
                      />
                      Wprowadź własny termin:
                    </label>
                    {terminPlatnosci === 'custom' && (
                      <div>
                        <input
                          type="number"
                          min="1"
                          value={customTermin}
                          onChange={(e) => { setCustomTermin(e.target.value); if (errors.customTermin) setErrors(prev => { const {customTermin: _, ...rest} = prev; return rest; }); }}
                          onBlur={() => blurValidateField('customTermin', 4)}
                          className={`w-24 bg-input border rounded-lg px-3 py-1.5 text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all ${errors.customTermin ? 'border-destructive' : 'border-border'}`}
                          placeholder="dni"
                        />
                        {errors.customTermin && <p className={errorClass}>{errors.customTermin}</p>}
                      </div>
                    )}
                  </div>
                </section>

                {/* Oświadczenia */}
                <section className="space-y-3">
                  <h2 className={sectionTitleClass}>Oświadczenia</h2>
                  <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weryfikacjaPrzedWyslaniem}
                      onChange={(e) => setWeryfikacjaPrzedWyslaniem(e.target.checked)}
                      className="accent-primary w-4 h-4 mt-0.5 shrink-0"
                    />
                    <span>
                      Proszę o przesłanie proformy w celu weryfikacji jej poprawności, zanim Kugaru wyśle ją
                      Zleceniodawcy (nie dotyczy faktur zbiorczych)
                    </span>
                  </label>

                  <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={samodzielnieWysyla}
                      onChange={(e) => setSamodzielnieWysyla(e.target.checked)}
                      className="accent-primary w-4 h-4 mt-0.5 shrink-0"
                    />
                    <span>
                      Chcę samodzielnie wysłać Zleceniodawcy proformę od Kugaru (nie dotyczy faktur zbiorczych)
                    </span>
                  </label>

                  <div>
                    <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={brakPostepowan}
                        onChange={(e) => { setBrakPostepowan(e.target.checked); if (errors.brakPostepowan) setErrors(prev => { const {brakPostepowan: _, ...rest} = prev; return rest; }); }}
                        className="accent-primary w-4 h-4 mt-0.5 shrink-0"
                      />
                      <div>
                        <span>
                          Potwierdzam, że w momencie wypełniania formularza nie toczy się wobec mnie aktywne postępowanie
                          windykacyjne, egzekucyjne, komornicze.
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          W przypadku konieczności udzielenia pisemnej odpowiedzi na pisma ze strony instytucji/podmiotów
                          zgłaszających roszczenia finansowe wobec Freelancera, Kugaru zastrzega sobie prawo do potrącenia
                          opłaty manipulacyjnej w wysokości 120 PLN netto.
                        </p>
                      </div>
                    </label>
                    {errors.brakPostepowan && <p className={`${errorClass} ml-7`}>{errors.brakPostepowan}</p>}
                  </div>

                  <div>
                    <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={akceptujeRegulamin}
                        onChange={(e) => { setAkceptujeRegulamin(e.target.checked); if (errors.akceptujeRegulamin) setErrors(prev => { const {akceptujeRegulamin: _, ...rest} = prev; return rest; }); }}
                        className="accent-primary w-4 h-4 mt-0.5 shrink-0"
                      />
                      <span>
                        Akceptuję Regulamin i Politykę Prywatności Serwisu.{' '}
                        <span className="text-destructive">*</span>
                      </span>
                    </label>
                    {errors.akceptujeRegulamin && <p className={`${errorClass} ml-7`}>{errors.akceptujeRegulamin}</p>}
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation footer */}
          <div className="flex items-center justify-between p-5 border-t border-border bg-secondary/20">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-secondary hover:bg-secondary/80 text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              Wstecz
            </button>

            <span className="text-xs text-muted-foreground">
              Krok {step} z 4
            </span>

            {step < 4 ? (
              <button
                type="button"
                onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Dalej
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Wysyłanie...' : 'Wyślij formularz'}
              </button>
            )}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
