import { Asset } from '@/hooks/useFinanceStore';
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
}

export function AssetList({ assets, onEdit, onDelete, onSell }: AssetListProps) {
  const totalValue = assets.reduce((sum, asset) => sum + asset.total_value, 0);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-card-foreground mb-1">Aktywa</h2>
          <p className="text-muted-foreground text-sm">Portfel inwestycyjny</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Całkowita wartość</p>
          <p className="text-2xl font-bold text-card-foreground">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {assets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Brak aktywów</p>
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
                className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                      {(() => {
                        const IconComponent = cryptoIconMap[asset.symbol.toUpperCase()];
                        if (IconComponent) {
                          return <IconComponent size={24} variant="branded" />;
                        }
                        return <Coins className="w-5 h-5 text-muted-foreground" />;
                      })()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-card-foreground font-medium">{asset.name}</h3>
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">
                          {asset.symbol}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {asset.quantity} × {formatCurrency(asset.current_price)}
                      </p>
                      {asset.cost_basis > 0 && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Zakup: {formatCurrency(asset.cost_basis)} · P/L:{' '}
                          <span className={plPositive ? 'text-green-500' : 'text-red-500'}>
                            {plPositive ? '+' : ''}{formatCurrency(unrealizedPL)}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-lg font-bold text-card-foreground">
                        {formatCurrency(asset.total_value)}
                      </p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
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
                    </div>

                    {(onEdit || onDelete || onSell) && (
                      <div className="flex gap-1 opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        {onSell && (
                          <button
                            onClick={() => onSell(asset)}
                            className="p-2 hover:bg-red-500/20 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                            title="Sprzedaj"
                          >
                            <BadgeDollarSign className="w-4 h-4" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(asset)}
                            className="p-2 hover:bg-accent text-muted-foreground hover:text-accent-foreground rounded-md transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(asset.id)}
                            className="p-2 hover:bg-destructive/20 text-muted-foreground hover:text-destructive rounded-md transition-colors"
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
