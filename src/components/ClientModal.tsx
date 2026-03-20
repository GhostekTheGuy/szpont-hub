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
    if (!name.trim()) errs.name = 'Nazwa / imię i nazwisko jest wymagane';
    if (email.trim() && !email.includes('@')) errs.email = 'Podaj poprawny adres email';
    if (nip.trim() && !/^\d{10}$/.test(nip.trim())) errs.nip = 'NIP musi składać się z 10 cyfr';
    if (postalCode.trim() && !/^\d{2}-\d{3}$/.test(postalCode.trim())) errs.postalCode = 'Kod pocztowy w formacie XX-XXX';
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
      const data = {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        nip: nip.trim() || undefined,
        company_name: companyName.trim() || undefined,
        street: street.trim() || undefined,
        postal_code: postalCode.trim() || undefined,
        city: city.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (editingClient) {
        await editClient(editingClient.id, data);
        toast('Klient zaktualizowany', 'success');
      } else {
        await addClient(data);
        toast('Klient dodany', 'success');
      }
      onClose(true);
    } catch (err) {
      console.error('ClientModal error:', err);
      toast('Wystapil blad', 'error');
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
                <input type="text" value={name} onChange={e => { setName(e.target.value); if (errors.name) setErrors(prev => { const {name: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.name ? ' border-destructive' : ''}`} placeholder="Jan Kowalski / Firma XYZ" />
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
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className={inputClass} placeholder="+48 123 456 789" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>NIP</label>
                  <input type="text" value={nip} onChange={e => { setNip(e.target.value); if (errors.nip) setErrors(prev => { const {nip: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.nip ? ' border-destructive' : ''}`} placeholder="1234567890" />
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
                  <input type="text" value={street} onChange={e => setStreet(e.target.value)} className={inputClass} placeholder="ul. Testowa 1" />
                </div>
                <div>
                  <label className={labelClass}>Kod pocztowy</label>
                  <input type="text" value={postalCode} onChange={e => { setPostalCode(e.target.value); if (errors.postalCode) setErrors(prev => { const {postalCode: _, ...rest} = prev; return rest; }); }} className={`${inputClass}${errors.postalCode ? ' border-destructive' : ''}`} placeholder="00-000" />
                  {errors.postalCode && <p className="text-xs text-destructive mt-1">{errors.postalCode}</p>}
                </div>
                <div>
                  <label className={labelClass}>Miasto</label>
                  <input type="text" value={city} onChange={e => setCity(e.target.value)} className={inputClass} placeholder="Warszawa" />
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
