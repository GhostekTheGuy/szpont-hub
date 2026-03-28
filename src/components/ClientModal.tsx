'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { addClient, editClient } from '@/app/actions';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/Toast';
import type { Client } from '@/hooks/useFinanceStore';

interface ClientModalProps {
  isOpen: boolean;
  onClose: (didChange?: boolean) => void;
  editingClient?: Client | null;
}

const inputClass =
  'w-full bg-input border border-border rounded-lg px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-all';
const labelClass = 'block text-sm font-medium text-foreground mb-1.5';

export function ClientModal({ isOpen, onClose, editingClient }: ClientModalProps) {
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [nip, setNip] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [street, setStreet] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): Record<string, string> => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Imię i nazwisko jest wymagane';
    else if (!/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż\s\-'.]+$/.test(name.trim())) errs.name = 'Imię i nazwisko może zawierać tylko litery, spacje i myślniki';
    else if (name.trim().split(/\s+/).length < 2) errs.name = 'Podaj imię i nazwisko (min. 2 wyrazy)';
    if (email.trim()) {
      const e = email.trim();
      if (!/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(e)) errs.email = 'Nieprawidłowy format email (np. jan@firma.pl)';
      else if (/\.{2,}/.test(e)) errs.email = 'Email nie może zawierać podwójnych kropek';
      else if (e.startsWith('.') || e.split('@')[0].endsWith('.')) errs.email = 'Nazwa użytkownika nie może zaczynać/kończyć się kropką';
    }
    if (phone.trim() && !/^(\+?\d[\d\s\-]{7,17})$/.test(phone.trim())) errs.phone = 'Podaj poprawny numer telefonu';
    if (nip.trim() && !/^\d{10}$/.test(nip.trim().replace(/[- ]/g, ''))) errs.nip = 'NIP musi składać się z 10 cyfr';
    if (postalCode.trim() && !/^\d{2}-\d{3}$/.test(postalCode.trim())) errs.postalCode = 'Kod pocztowy w formacie XX-XXX';
    if (street.trim() && !/\d/.test(street.trim())) errs.street = 'Podaj numer budynku/lokalu (np. ul. Testowa 1/2)';
    if (city.trim() && /\d/.test(city.trim())) errs.city = 'Nazwa miasta nie może zawierać cyfr';
    return errs;
  };

  useEffect(() => {
    if (editingClient) {
      setName(editingClient.name);
      setEmail(editingClient.email || '');
      setPhone(editingClient.phone || '');
      setNip(editingClient.nip || '');
      setCompanyName(editingClient.company_name || '');
      setStreet(editingClient.street || '');
      setPostalCode(editingClient.postal_code || '');
      setCity(editingClient.city || '');
      setNotes(editingClient.notes || '');
    } else {
      setName('');
      setEmail('');
      setPhone('');
      setNip('');
      setCompanyName('');
      setStreet('');
      setPostalCode('');
      setCity('');
      setNotes('');
    }
    setErrors({});
  }, [editingClient, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      const data: {
        name: string;
        email?: string;
        phone?: string;
        nip?: string;
        company_name?: string;
        street?: string;
        postal_code?: string;
        city?: string;
        notes?: string;
      } = { name: name.trim() };
      if (email.trim()) data.email = email.trim();
      if (phone.trim()) data.phone = phone.trim();
      if (nip.trim()) data.nip = nip.trim();
      if (companyName.trim()) data.company_name = companyName.trim();
      if (street.trim()) data.street = street.trim();
      if (postalCode.trim()) data.postal_code = postalCode.trim();
      if (city.trim()) data.city = city.trim();
      if (notes.trim()) data.notes = notes.trim();

      if (editingClient) {
        await editClient(editingClient.id, data);
        toast('Klient zaktualizowany', 'success');
      } else {
        await addClient(data);
        toast('Klient dodany', 'success');
      }
      onClose(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Wystapil blad';
      toast(msg.includes('Encryption') ? 'Sesja wygasła — zaloguj się ponownie' : 'Wystąpił błąd przy zapisie', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="bg-card border border-border rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-bold text-card-foreground">
                {editingClient ? 'Edytuj klienta' : 'Nowy klient'}
              </h2>
              <button onClick={() => onClose()} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className={labelClass}>Nazwa / Imie i nazwisko *</label>
                <input type="text" value={name} onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => { const {name: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.name ? ' border-destructive' : ''}`} placeholder="Jan Kowalski" />
                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Email</label>
                  <input type="email" value={email} onChange={e => { setEmail(e.target.value); if (errors.email) setErrors(prev => { const {email: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.email ? ' border-destructive' : ''}`} placeholder="email@firma.pl" />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className={labelClass}>Telefon</label>
                  <input type="tel" value={phone} onChange={e => {
                    const val = e.target.value.replace(/[^\d+\-\s]/g, '');
                    setPhone(val);
                    if (errors.phone) setErrors(prev => { const {phone: _, ...rest} = prev; return rest; });
                  }} className={`${inputClass}${errors.phone ? ' border-destructive' : ''}`} placeholder="+48 123 456 789" />
                  {errors.phone && <p className="text-xs text-destructive mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>NIP</label>
                  <input type="text" inputMode="numeric" maxLength={10} value={nip} onChange={e => {
                    const val = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                    setNip(val);
                    if (errors.nip) setErrors(prev => { const {nip: _, ...rest} = prev; return rest; });
                  }} className={`${inputClass}${errors.nip ? ' border-destructive' : ''}`} placeholder="1234567890" />
                  {errors.nip && <p className="text-xs text-destructive mt-1">{errors.nip}</p>}
                </div>
                <div>
                  <label className={labelClass}>Nazwa firmy</label>
                  <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} className={inputClass} placeholder="Firma Sp. z o.o." />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className={labelClass}>Ulica</label>
                  <input type="text" value={street} onChange={e => { setStreet(e.target.value); if (errors.street) setErrors(prev => { const {street: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.street ? ' border-destructive' : ''}`} placeholder="ul. Testowa 1/2" />
                  {errors.street && <p className="text-xs text-destructive mt-1">{errors.street}</p>}
                </div>
                <div>
                  <label className={labelClass}>Kod pocztowy</label>
                  <input type="text" inputMode="numeric" maxLength={6} value={postalCode} onChange={e => {
                    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 5);
                    const formatted = raw.length > 2 ? `${raw.slice(0, 2)}-${raw.slice(2)}` : raw;
                    setPostalCode(formatted);
                    if (errors.postalCode) setErrors(prev => { const {postalCode: _, ...rest} = prev; return rest; });
                  }} className={`${inputClass}${errors.postalCode ? ' border-destructive' : ''}`} placeholder="00-000" />
                  {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className={labelClass}>Miasto</label>
                  <input type="text" value={city} onChange={e => {
                    const val = e.target.value.replace(/[0-9]/g, '');
                    setCity(val);
                    if (errors.city) setErrors(prev => { const {city: _, ...rest} = prev; return rest; });
                  }} className={`${inputClass}${errors.city ? ' border-destructive' : ''}`} placeholder="Warszawa" />
                  {errors.city && <p className="text-xs text-destructive mt-1">{errors.city}</p>}
                </div>
              </div>

              <div>
                <label className={labelClass}>Notatki</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} resize-none`} rows={2} placeholder="Dodatkowe informacje..." />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Zapisywanie...' : editingClient ? 'Zapisz zmiany' : 'Dodaj klienta'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
