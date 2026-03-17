// Kugaru API integration
// TODO: Add private API key to environment variables as KUGARU_API_KEY

export const KUGARU_API_BASE = 'https://app.kugaru.com/api';

// Types for Kugaru invoice form

export interface KugaruInvoiceItem {
  id: string;
  nazwa: string;
  ilosc: number;
  jm: string;
  cenaNetto: number;
  vat: number;
  wartoscNetto: number;
  wartoscVat: number;
  wartoscBrutto: number;
}

export type ClientType = 'firma' | 'osoba_fizyczna';
export type ContractType = 'umowa_o_dzielo' | 'umowa_zlecenie' | 'dzielo_zlecenie';
export type CopyrightType = 'przekazuje' | 'udziela_licencji' | 'nie_przekazuje';
export type AmountType = 'netto' | 'brutto';
export type PaymentTerm = '7' | '14' | 'custom';

export interface KugaruFormData {
  // Personal data
  imieNazwisko: string;
  email: string;
  telefon: string;

  // Invoice items
  pozycje: KugaruInvoiceItem[];

  // Copyright & value
  prawaAutorskie: CopyrightType;
  wartoscZlecenia: number;
  waluta: string;
  typKwoty: AmountType;

  // Contract form
  formaRozliczenia: ContractType;
  jestStudentem: boolean;

  // Client data
  typKlienta: ClientType;
  nip: string;
  nazwaFirmy: string;
  ulica: string;
  kodPocztowy: string;
  miasto: string;
  emailZleceniodawcy: string;

  // Work description
  opisDziela: string;
  zalacznik: File | null;
  uwagi: string;

  // Payment
  terminPlatnosci: PaymentTerm;
  customTermin: number;

  // Checkboxes
  pomijaProforme: boolean;
  weryfikacjaPrzedWyslaniem: boolean;
  samodzielnieWysyla: boolean;
  abonamentZamiastProwizji: boolean;
  brakPostepowan: boolean;
  akceptujeRegulamin: boolean;
}

export function createEmptyInvoiceItem(): KugaruInvoiceItem {
  return {
    id: crypto.randomUUID(),
    nazwa: '',
    ilosc: 1,
    jm: 'szt.',
    cenaNetto: 0,
    vat: 23,
    wartoscNetto: 0,
    wartoscVat: 0,
    wartoscBrutto: 0,
  };
}

export function recalculateItem(item: KugaruInvoiceItem): KugaruInvoiceItem {
  const wartoscNetto = item.ilosc * item.cenaNetto;
  const wartoscVat = wartoscNetto * (item.vat / 100);
  const wartoscBrutto = wartoscNetto + wartoscVat;
  return { ...item, wartoscNetto, wartoscVat, wartoscBrutto };
}

export function calculateTotals(items: KugaruInvoiceItem[]) {
  return items.reduce(
    (acc, item) => ({
      netto: acc.netto + item.wartoscNetto,
      vat: acc.vat + item.wartoscVat,
      brutto: acc.brutto + item.wartoscBrutto,
    }),
    { netto: 0, vat: 0, brutto: 0 }
  );
}

export const VAT_OPTIONS = [0, 5, 8, 23] as const;

export const COPYRIGHT_OPTIONS: { value: CopyrightType; label: string }[] = [
  { value: 'przekazuje', label: 'przekazuję prawa autorskie' },
  { value: 'udziela_licencji', label: 'udzielam licencji' },
  { value: 'nie_przekazuje', label: 'nie przekazuję praw autorskich' },
];

export const CONTRACT_OPTIONS: { value: ContractType; label: string; description?: string }[] = [
  { value: 'umowa_o_dzielo', label: 'umowa o dzieło' },
  { value: 'umowa_zlecenie', label: 'umowa-zlecenie' },
];

export const CURRENCY_OPTIONS = ['PLN', 'EUR', 'USD', 'GBP'] as const;
