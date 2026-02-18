import Link from 'next/link';
import { Transaction } from '@/hooks/useFinanceStore';
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight, Trash2, Edit2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { formatCurrency } from '@/lib/exchange-rates';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  limit?: number;
  showSeeMore?: boolean;
}

export function TransactionList({ transactions, onDelete, onEdit, limit, showSeeMore = false }: TransactionListProps) {
  const visible = limit ? transactions.slice(0, limit) : transactions;

  return (
    <div className="p-4 sm:p-6">
      <h3 className="text-xl font-bold text-card-foreground mb-4">Ostatnie transakcje</h3>
      <div className="space-y-2 sm:space-y-3">
        {visible.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Brak transakcji</p>
        ) : (
          visible.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group">
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
                    {transaction.type === 'transfer' ? '↔ ' : transaction.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount), transaction.currency || 'PLN')}
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
          ))
        )}
      </div>

      {showSeeMore && visible.length > 0 && (
        <div className="mt-4">
          <Link
            href="/transactions"
            className="flex items-center justify-center gap-1.5 text-sm text-primary hover:underline py-2"
          >
            Zobacz więcej <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
