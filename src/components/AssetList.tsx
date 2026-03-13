import { Asset, useFinanceStore } from '@/hooks/useFinanceStore';
import { TrendingUp, TrendingDown, Coins, Edit2, Trash2, BadgeDollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/exchange-rates';
import {
  TokenBTC,
  TokenETH,
  TokenSOL,
  TokenBNB,
  TokenXRP,
  TokenADA,
  TokenDOGE,
  TokenDOT,
  TokenMATIC,
  TokenLTC,
  TokenAVAX,
  TokenLINK,
  TokenUNI,
  TokenATOM,
  TokenXLM,
  TokenUSDT,
  TokenUSDC,
} from '@token-icons/react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cryptoIconMap: Record<string, React.ComponentType<any>> = {
  BTC: TokenBTC,
  ETH: TokenETH,
  SOL: TokenSOL,
  BNB: TokenBNB,
  XRP: TokenXRP,
  ADA: TokenADA,
  DOGE: TokenDOGE,
  DOT: TokenDOT,
  MATIC: TokenMATIC,
  LTC: TokenLTC,
  AVAX: TokenAVAX,
  LINK: TokenLINK,
  UNI: TokenUNI,
  ATOM: TokenATOM,
  XLM: TokenXLM,
  USDT: TokenUSDT,
  USDC: TokenUSDC,
};

interface AssetListProps {
  assets: Asset[];
  onEdit?: (asset: Asset) => void;
  onDelete?: (id: string) => void;
  onSell?: (asset: Asset) => void;
  standalone?: boolean;
}

export function AssetList({ assets, onEdit, onDelete, onSell, standalone }: AssetListProps) {
  const balanceMasked = useFinanceStore(s => s.balanceMasked);
  const totalValue = assets.reduce((sum, asset) => sum + asset.total_value, 0);

  const cardClass = standalone
    ? 'p-4 bg-card rounded-xl border border-border hover:bg-accent/50 transition-colors group'
    : 'p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group';

  return (
    <div className={standalone ? '' : 'px-4 py-4 lg:px-6 lg:py-6'}>
      {/* Header */}
      <div className={standalone
        ? 'bg-card border border-border rounded-xl p-4 lg:p-6 mb-3 flex items-center justify-between'
        : 'flex items-center justify-between mb-6'
      }>
        <div>
          <h2 className="text-xl font-bold text-card-foreground mb-1">Aktywa</h2>
          <p className="text-muted-foreground text-sm">Portfel inwestycyjny</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Całkowita wartość</p>
          <p className="text-2xl font-bold text-card-foreground">
            <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(totalValue)}</span>
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.length === 0 ? (
          <div className={`flex flex-col items-center py-8 gap-3 ${standalone ? 'bg-card border border-border rounded-xl' : ''}`}>
            <img src="/Home element.gif" alt="" className="w-24 h-24 opacity-70" />
            <p className="text-muted-foreground text-sm">Brak aktywów</p>
          </div>
        ) : (
          assets.map((asset) => {
            const isPositive = asset.change_24h >= 0;
            const unrealizedPL = asset.cost_basis > 0
              ? (asset.current_price - asset.cost_basis) * asset.quantity
              : 0;
            const plPositive = unrealizedPL >= 0;

            return (
              <div
                key={asset.id}
                className={`${cardClass} ${onEdit ? 'cursor-pointer' : ''}`}
                onClick={() => onEdit?.(asset)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center shrink-0 mt-0.5">
                    {(() => {
                      const IconComponent = cryptoIconMap[asset.symbol.toUpperCase()];
                      if (IconComponent) {
                        return <IconComponent size={24} variant="branded" />;
                      }
                      return asset.asset_type === 'stock'
                        ? <TrendingUp className="w-5 h-5 text-muted-foreground" />
                        : <Coins className="w-5 h-5 text-muted-foreground" />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-card-foreground font-medium">{asset.name}</h3>
                      <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                        {asset.symbol}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {asset.quantity} × <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(asset.current_price)}</span>
                    </p>
                    {asset.cost_basis > 0 && (
                      <p className={`text-xs text-muted-foreground mt-0.5 ${balanceMasked ? 'blur-md select-none' : ''}`}>
                        Zakup: {formatCurrency(asset.cost_basis)} · P/L:{' '}
                        <span className={plPositive ? 'text-green-500' : 'text-red-500'}>
                          {plPositive ? '+' : ''}{formatCurrency(unrealizedPL)}
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-bold text-card-foreground whitespace-nowrap">
                      <span className={balanceMasked ? 'blur-md select-none' : ''}>{formatCurrency(asset.total_value)}</span>
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-0.5 ${
                      isPositive ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {isPositive ? '+' : ''}{asset.change_24h.toFixed(2)}%
                      </span>
                    </div>
                    {(onEdit || onDelete || onSell) && (
                      <div className="flex gap-1 justify-end mt-1 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {onSell && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onSell(asset); }}
                            className="p-1.5 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                            title="Sprzedaj"
                          >
                            <BadgeDollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(asset); }}
                            className="p-1.5 hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); onDelete(asset.id); }}
                            className="p-1.5 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full bg-secondary rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      isPositive
                        ? 'bg-gradient-to-r from-green-600 to-green-400'
                        : 'bg-gradient-to-r from-red-600 to-red-400'
                    }`}
                    style={{ width: `${Math.min((asset.total_value / totalValue) * 100, 100)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
