'use client';

import { useState, useCallback } from 'react';
import { FileText, Upload, Info, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/Toast';
import { InvoiceItemsTable } from './InvoiceItemsTable';
import {
  type KugaruFormData,
  type KugaruInvoiceItem,
  type ClientType,
  type ContractType,
  type CopyrightType,
  type AmountType,
  type PaymentTerm,
  createEmptyInvoiceItem,
  COPYRIGHT_OPTIONS,
  CONTRACT_OPTIONS,
  CURRENCY_OPTIONS,
} from '@/lib/kugaru';

const inputClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all';

const selectClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring transition-all appearance-none';

const labelClass = 'block text-sm font-medium text-foreground mb-1.5';
const hintClass = 'text-xs text-muted-foreground mt-1';
const sectionClass = 'space-y-4';
const sectionTitleClass = 'text-lg font-bold text-foreground';

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  );
}

export function KugaruInvoiceForm() {
  const { toast } = useToast();

  // Personal data
  const [imieNazwisko, setImieNazwisko] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');

  // Invoice items
  const [pozycje, setPozycje] = useState<KugaruInvoiceItem[]>([createEmptyInvoiceItem()]);

  // Copyright & value
  const [prawaAutorskie, setPrawaAutorskie] = useState<CopyrightType>('przekazuje');
  const [wartoscZlecenia, setWartoscZlecenia] = useState('');
  const [waluta, setWaluta] = useState('PLN');
  const [typKwoty, setTypKwoty] = useState<AmountType>('netto');

  // Contract form
  const [formaRozliczenia, setFormaRozliczenia] = useState<ContractType>('umowa_o_dzielo');
  const [jestStudentem, setJestStudentem] = useState(false);

  // Client data
  const [typKlienta, setTypKlienta] = useState<ClientType>('firma');
  const [nip, setNip] = useState('');
  const [nazwaFirmy, setNazwaFirmy] = useState('');
  const [ulica, setUlica] = useState('');
  const [kodPocztowy, setKodPocztowy] = useState('');
  const [miasto, setMiasto] = useState('');
  const [emailZleceniodawcy, setEmailZleceniodawcy] = useState('');

  // Work description
  const [opisDziela, setOpisDziela] = useState('');
  const [zalacznik, setZalacznik] = useState<File | null>(null);
  const [uwagi, setUwagi] = useState('');

  // Payment
  const [terminPlatnosci, setTerminPlatnosci] = useState<PaymentTerm>('7');
  const [customTermin, setCustomTermin] = useState('');

  // Checkboxes
  const [pomijaProforme, setPomijaProforme] = useState(false);
  const [weryfikacjaPrzedWyslaniem, setWeryfikacjaPrzedWyslaniem] = useState(false);
  const [samodzielnieWysyla, setSamodzielnieWysyla] = useState(false);
  const [abonamentZamiastProwizji, setAbonamentZamiastProwizji] = useState(false);
  const [brakPostepowan, setBrakPostepowan] = useState(false);
  const [akceptujeRegulamin, setAkceptujeRegulamin] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
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
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brakPostepowan) {
      toast('Musisz potwierdzić brak postępowań', 'error');
      return;
    }
    if (!akceptujeRegulamin) {
      toast('Musisz zaakceptować regulamin', 'error');
      return;
    }

    setLoading(true);

    const formData: KugaruFormData = {
      imieNazwisko,
      email,
      telefon,
      pozycje,
      prawaAutorskie,
      wartoscZlecenia: parseFloat(wartoscZlecenia) || 0,
      waluta,
      typKwoty,
      formaRozliczenia,
      jestStudentem,
      typKlienta,
      nip,
      nazwaFirmy,
      ulica,
      kodPocztowy,
      miasto,
      emailZleceniodawcy,
      opisDziela,
      zalacznik,
      uwagi,
      terminPlatnosci,
      customTermin: parseInt(customTermin) || 0,
      pomijaProforme,
      weryfikacjaPrzedWyslaniem,
      samodzielnieWysyla,
      abonamentZamiastProwizji,
      brakPostepowan,
      akceptujeRegulamin,
    };

    // TODO: Send to Kugaru API when private key is available
    console.log('Kugaru form data:', formData);
    toast('Formularz gotowy do wysłania (brak klucza API)', 'warning');
    setLoading(false);
  };

  const fillTestData = () => {
    setImieNazwisko('Jan Kowalski');
    setEmail('jan@example.com');
    setTelefon('500600700');
    setWartoscZlecenia('1000');
    setTypKlienta('firma');
    setNip('1234567890');
    setNazwaFirmy('Testowa Firma Sp. z o.o.');
    setUlica('ul. Testowa 1');
    setKodPocztowy('00-001');
    setMiasto('Warszawa');
    setEmailZleceniodawcy('firma@example.com');
    setOpisDziela('Wykonanie projektu graficznego');
    setBrakPostepowan(true);
    setAkceptujeRegulamin(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
          <FileText className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Wystaw fakturę</h1>
        <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
          Wypełnij formularz, aby rozpocząć proces rozliczania pracy. Gdy Zleceniodawca opłaci proformę,
          otrzyma od nas fakturę VAT. Z Tobą rozliczymy się umową o dzieło lub umową-zleceniem.
        </p>
      </div>

      {/* Info box */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
          <div className="text-sm text-foreground space-y-1">
            <p className="font-semibold text-primary">Kilka wskazówek do Kugaru:</p>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5">
              <li>Nie wymagamy rejestracji konta.</li>
              <li>Przekazanie praw wiąże się z koniecznością podpisania protokołu.</li>
              <li>Wybierz licencję, która obniża Twój podatek tak samo jak przekazanie praw autorskich.</li>
              <li>Jeśli nie możesz wgrać pliku z pracą – prześlij go mailowo na adres: office@kugaru.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Template buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          type="button"
          onClick={fillTestData}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors"
        >
          Wypełnij testowe dane
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ─── Twoje dane ─── */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Twoje dane</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Twoje imię i nazwisko <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={imieNazwisko}
                onChange={(e) => setImieNazwisko(e.target.value)}
                className={inputClass}
                placeholder="Jan Kowalski"
              />
            </div>
            <div>
              <label className={labelClass}>
                Twój email <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="jan@example.com"
              />
            </div>
          </div>
          <div className="md:w-1/2">
            <label className={labelClass}>Telefon kontaktowy</label>
            <input
              type="tel"
              value={telefon}
              onChange={(e) => setTelefon(e.target.value)}
              className={inputClass}
              placeholder="czasami tak jest szybciej"
            />
          </div>
        </section>

        {/* ─── Pozycje na fakturze ─── */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Pozycje na fakturze</h2>
          <InvoiceItemsTable items={pozycje} onChange={setPozycje} />
        </section>

        {/* ─── Prawa autorskie & Wartość ─── */}
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
              Wartość zlecenia <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={wartoscZlecenia}
                onChange={(e) => setWartoscZlecenia(e.target.value)}
                className={`flex-1 ${inputClass}`}
                placeholder="0,00"
              />
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

        {/* ─── Forma rozliczenia ─── */}
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

        {/* ─── Dane Zleceniodawcy ─── */}
        <section className={sectionClass}>
          <h2 className={sectionTitleClass}>Dane Zleceniodawcy</h2>

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
                required
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className={inputClass}
                placeholder="Wpisz NIP firmy"
              />
            </div>
          )}

          <div>
            <label className={labelClass}>
              {typKlienta === 'firma' ? 'Nazwa Firmy' : 'Imię i nazwisko'}{' '}
              <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={nazwaFirmy}
              onChange={(e) => setNazwaFirmy(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Ulica <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={ulica}
              onChange={(e) => setUlica(e.target.value)}
              className={inputClass}
              placeholder={typKlienta === 'firma' ? 'Automatycznie pobierane po NIP' : ''}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                Kod pocztowy <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={kodPocztowy}
                onChange={(e) => setKodPocztowy(e.target.value)}
                className={inputClass}
                placeholder={typKlienta === 'firma' ? 'Automatycznie pobierane po NIP' : ''}
              />
            </div>
            <div>
              <label className={labelClass}>
                Siedziba (miasto) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                value={miasto}
                onChange={(e) => setMiasto(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>
              E-mail Zleceniodawcy <span className="text-destructive">*</span>
            </label>
            <input
              type="email"
              required
              value={emailZleceniodawcy}
              onChange={(e) => setEmailZleceniodawcy(e.target.value)}
              className={inputClass}
            />
            <p className={hintClass}>Musi różnić się od e-maila Zleceniobiorcy.</p>
          </div>
        </section>

        {/* ─── Opis dzieła ─── */}
        <section className={sectionClass}>
          <div>
            <label className={labelClass}>
              Opis dzieła/tytuł dzieła na fakturze <span className="text-destructive">*</span>
            </label>
            <textarea
              required
              value={opisDziela}
              onChange={(e) => setOpisDziela(e.target.value)}
              rows={4}
              className={`${inputClass} resize-y`}
            />
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

        {/* ─── Termin płatności ─── */}
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
              <input
                type="number"
                min="1"
                value={customTermin}
                onChange={(e) => setCustomTermin(e.target.value)}
                className="w-24 bg-input border border-border rounded-lg px-3 py-1.5 text-foreground text-sm outline-none focus:ring-2 focus:ring-ring transition-all"
                placeholder="dni"
              />
            )}
          </div>
        </section>

        {/* ─── Oświadczenia ─── */}
        <section className="space-y-3">
          <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer group">
            <input
              type="checkbox"
              checked={pomijaProforme}
              onChange={(e) => setPomijaProforme(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5 shrink-0"
            />
            <div>
              <span>Klient wymaga faktury z pominięciem etapu proformy</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Zaznacz tę opcję tylko wtedy, gdy masz oficjalne potwierdzenie i zgodę ze strony Zleceniodawcy.
                Podawanie nieprawdziwych informacji będzie skutkowało zablokowaniem rozliczenia oraz nałożeniem
                dodatkowej opłaty w wysokości 120 PLN.
              </p>
            </div>
          </label>

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

          <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={abonamentZamiastProwizji}
              onChange={(e) => setAbonamentZamiastProwizji(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5 shrink-0"
            />
            <span>
              Wybieram abonament zamiast prowizji od zleceń (300 zł netto miesięcznie i umowa z Kugaru na min. 60 dni)
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={brakPostepowan}
              onChange={(e) => setBrakPostepowan(e.target.checked)}
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

          <label className="flex items-start gap-3 text-sm text-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={akceptujeRegulamin}
              onChange={(e) => setAkceptujeRegulamin(e.target.checked)}
              className="accent-primary w-4 h-4 mt-0.5 shrink-0"
            />
            <span>
              Akceptuję Regulamin i Politykę Prywatności Serwisu.{' '}
              <span className="text-destructive">*</span>
            </span>
          </label>
        </section>

        {/* ─── Submit ─── */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Wysyłanie...' : 'Dalej'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
