'use client';

import { useRef, ReactNode } from 'react';
import Link from 'next/link';
import { Transaction, useFinanceStore } from '@/hooks/useFinanceStore';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatCurrency } from '@/lib/exchange-rates';
import { motion, useInView } from 'motion/react';

function AnimatedRow({ children, index }: { children: ReactNode; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3, once: true });
  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0, y: 8 }}
      animate={inView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.95, opacity: 0, y: 8 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
    >
      {children}
    </motion.div>
  );
}

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  limit?: number;
  showSeeMore?: boolean;
  compact?: boolean;
}

export function TransactionList({ transactions, onDelete, onEdit, limit, showSeeMore = false, compact = false }: TransactionListProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);
  const visible = limit ? transactions.slice(0, limit) : transactions;

  if (compact) {
    return (
      <div className="p-4">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Ostatnie transakcje</h3>
        <div className="space-y-1">
          {visible.length === 0 ? (
            <p className="text-muted-foreground text-center py-4 text-sm">Brak transakcji</p>
          ) : (
            visible.map((transaction, i) => (
              <AnimatedRow key={transaction.id} index={i}>
                <div
                  className="flex items-center justify-between py-2 px-2 rounded-lg hover:bg-muted/50 transition-colors group cursor-pointer"
                  onClick={() => onEdit(transaction)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      transaction.type === 'transfer' ? 'bg-blue-500/20 text-blue-500' : transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                    }`}>
                      {transaction.type === 'transfer' ? <ArrowLeftRight className="w-3.5 h-3.5" /> : transaction.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-card-foreground text-xs truncate max-w-[120px]">{transaction.category}</p>
                      <p className="text-[10px] text-muted-foreground">{format(new Date(transaction.date), 'dd MMM', { locale: pl })}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-semibold text-xs ${transaction.type === 'transfer' ? 'text-blue-500' : transaction.type === 'income' ? 'text-green-500' : 'text-card-foreground'}`}>
                      <span className={balanceMasked ? 'blur-sm select-none' : ''}>{transaction.type === 'transfer' ? '↔ ' : transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency || 'PLN')}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground">{transaction.walletName}</p>
                  </div>
                </div>
              </AnimatedRow>
            ))
          )}
        </div>
        {showSeeMore && visible.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <Link
              href="/wallets"
              className="flex items-center justify-center gap-1 text-xs text-primary hover:underline py-1"
            >
              Wszystkie transakcje <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-4 lg:px-6 lg:py-6">
      <h3 className="text-xl font-bold text-card-foreground mb-4">Ostatnie transakcje</h3>
      <div className="space-y-2 sm:space-y-3">
        {visible.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Brak transakcji</p>
        ) : (
          visible.map((transaction, i) => (
            <AnimatedRow key={transaction.id} index={i}>
              <div className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group">
                <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 ${
                    transaction.type === 'transfer' ? 'bg-blue-500/20 text-blue-500' : transaction.type === 'income' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {transaction.type === 'transfer' ? <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5" /> : transaction.type === 'income' ? <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" /> : <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-card-foreground text-sm sm:text-base truncate">{transaction.category}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">
                      {transaction.description ? `${transaction.description} • ` : ''}{format(new Date(transaction.date), 'dd MMM', { locale: pl })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                  <div className="text-right">
                    <p className={`font-bold text-sm sm:text-base ${transaction.type === 'transfer' ? 'text-blue-500' : transaction.type === 'income' ? 'text-green-500' : 'text-card-foreground'}`}>
                      <span className={balanceMasked ? 'blur-sm select-none' : ''}>{transaction.type === 'transfer' ? '↔ ' : transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency || 'PLN')}</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">{transaction.walletName}</p>
                  </div>

                  <div className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(transaction)}
                      className="p-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(transaction.id)}
                      className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </AnimatedRow>
          ))
        )}
      </div>

      {showSeeMore && visible.length > 0 && (
        <div className="mt-4">
          <Link
            href="/wallets"
            className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-2"
          >
            Zobacz więcej <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
