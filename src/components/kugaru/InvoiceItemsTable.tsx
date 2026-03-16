'use client';

import { Plus, Trash2 } from 'lucide-react';
import {
  type KugaruInvoiceItem,
  VAT_OPTIONS,
  createEmptyInvoiceItem,
  recalculateItem,
  calculateTotals,
} from '@/lib/kugaru';

interface Props {
  items: KugaruInvoiceItem[];
  onChange: (items: KugaruInvoiceItem[]) => void;
}

export function InvoiceItemsTable({ items, onChange }: Props) {
  const totals = calculateTotals(items);

  const updateItem = (id: string, field: keyof KugaruInvoiceItem, value: string | number) => {
    onChange(
      items.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: value };
        return recalculateItem(updated);
      })
    );
  };

  const addItem = () => {
    onChange([...items, createEmptyInvoiceItem()]);
  };

  const removeItem = (id: string) => {
    if (items.length <= 1) return;
    onChange(items.filter((item) => item.id !== id));
  };

  const inputClass =
    'w-full bg-input border border-border rounded-lg px-2 py-1.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring transition-all';

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="text-left py-2 px-2 font-medium">Nazwa</th>
              <th className="text-center py-2 px-1 font-medium w-16">Ilość</th>
              <th className="text-center py-2 px-1 font-medium w-16">J.m.</th>
              <th className="text-center py-2 px-1 font-medium w-24">Cena netto</th>
              <th className="text-center py-2 px-1 font-medium w-20">VAT (%)</th>
              <th className="text-right py-2 px-1 font-medium w-24">Wart. netto</th>
              <th className="text-right py-2 px-1 font-medium w-24">Wart. VAT</th>
              <th className="text-right py-2 px-1 font-medium w-24">Wart. brutto</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-border/50">
                <td className="py-2 px-1">
                  <input
                    type="text"
                    value={item.nazwa}
                    onChange={(e) => updateItem(item.id, 'nazwa', e.target.value)}
                    className={inputClass}
                    placeholder="Nazwa usługi"
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    min="1"
                    value={item.ilosc}
                    onChange={(e) => updateItem(item.id, 'ilosc', parseFloat(e.target.value) || 0)}
                    className={`${inputClass} text-center`}
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="text"
                    value={item.jm}
                    onChange={(e) => updateItem(item.id, 'jm', e.target.value)}
                    className={`${inputClass} text-center`}
                  />
                </td>
                <td className="py-2 px-1">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.cenaNetto || ''}
                    onChange={(e) => updateItem(item.id, 'cenaNetto', parseFloat(e.target.value) || 0)}
                    className={`${inputClass} text-right`}
                  />
                </td>
                <td className="py-2 px-1">
                  <select
                    value={item.vat}
                    onChange={(e) => updateItem(item.id, 'vat', parseInt(e.target.value))}
                    className={`${inputClass} text-center`}
                  >
                    {VAT_OPTIONS.map((v) => (
                      <option key={v} value={v}>
                        {v}%
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-1 text-right text-foreground font-medium">
                  {item.wartoscNetto.toFixed(2)}
                </td>
                <td className="py-2 px-1 text-right text-muted-foreground">
                  {item.wartoscVat.toFixed(2)}
                </td>
                <td className="py-2 px-1 text-right text-foreground font-medium">
                  {item.wartoscBrutto.toFixed(2)}
                </td>
                <td className="py-2 px-1">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {items.map((item, idx) => (
          <div key={item.id} className="bg-secondary/50 border border-border rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">Pozycja {idx + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={item.nazwa}
              onChange={(e) => updateItem(item.id, 'nazwa', e.target.value)}
              className={inputClass}
              placeholder="Nazwa usługi"
            />
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Ilość</label>
                <input
                  type="number"
                  min="1"
                  value={item.ilosc}
                  onChange={(e) => updateItem(item.id, 'ilosc', parseFloat(e.target.value) || 0)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">J.m.</label>
                <input
                  type="text"
                  value={item.jm}
                  onChange={(e) => updateItem(item.id, 'jm', e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">VAT</label>
                <select
                  value={item.vat}
                  onChange={(e) => updateItem(item.id, 'vat', parseInt(e.target.value))}
                  className={inputClass}
                >
                  {VAT_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}%
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Cena netto</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={item.cenaNetto || ''}
                onChange={(e) => updateItem(item.id, 'cenaNetto', parseFloat(e.target.value) || 0)}
                className={inputClass}
              />
            </div>
            <div className="flex justify-between text-sm pt-1 border-t border-border/50">
              <span className="text-muted-foreground">Netto: {item.wartoscNetto.toFixed(2)}</span>
              <span className="text-muted-foreground">VAT: {item.wartoscVat.toFixed(2)}</span>
              <span className="font-medium text-foreground">Brutto: {item.wartoscBrutto.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <button
        type="button"
        onClick={addItem}
        className="mt-3 flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-accent text-secondary-foreground rounded-lg text-sm font-medium transition-colors"
      >
        <Plus className="w-4 h-4" />
        Dodaj pozycję
      </button>

      {/* Totals */}
      <div className="mt-4 text-right space-y-1">
        <p className="text-sm text-muted-foreground">
          Suma netto: <span className="font-semibold text-foreground">{totals.netto.toFixed(2)} PLN</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Suma VAT: <span className="font-semibold text-foreground">{totals.vat.toFixed(2)} PLN</span>
        </p>
        <p className="text-base text-muted-foreground">
          Suma brutto: <span className="font-bold text-foreground">{totals.brutto.toFixed(2)} PLN</span>
        </p>
      </div>
    </div>
  );
}
