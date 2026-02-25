import { getWalletsWithTransactions } from "@/app/actions";
import { getExchangeRates } from "@/lib/exchange-rates";
import { WalletsPageClient } from "@/components/pages/WalletsPageClient";

export default async function WalletsPage() {
  const [data, exchangeRates] = await Promise.all([
    getWalletsWithTransactions(),
    getExchangeRates(),
  ]);

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <WalletsPageClient
      initialWallets={data.wallets}
      initialTransactions={data.transactions}
      exchangeRates={exchangeRates}
    />
  );
}
