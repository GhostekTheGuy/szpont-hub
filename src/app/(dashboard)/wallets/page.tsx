import { getWalletsWithTransactions, getAssetsData, getAssetSalesData, getAssetTaxSummary } from "@/app/actions";
import { getExchangeRates } from "@/lib/exchange-rates";
import { WalletsPageClient } from "@/components/pages/WalletsPageClient";

export default async function WalletsPage() {
  const [data, exchangeRates, assetsResult, sales, taxSummary] = await Promise.all([
    getWalletsWithTransactions(),
    getExchangeRates(),
    getAssetsData(),
    getAssetSalesData(),
    getAssetTaxSummary(new Date().getFullYear()),
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
      initialAssets={assetsResult?.assets ?? []}
      initialSales={sales}
      initialTaxSummary={taxSummary}
    />
  );
}
