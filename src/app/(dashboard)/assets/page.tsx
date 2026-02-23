import { getAssetsData, getAssetSalesData, getAssetTaxSummary, getWalletsWithTransactions } from "@/app/actions";
import { AssetsPageClient } from "@/components/pages/AssetsPageClient";

export default async function AssetsPage() {
  const [assetsResult, sales, taxSummary, walletsResult] = await Promise.all([
    getAssetsData(),
    getAssetSalesData(),
    getAssetTaxSummary(new Date().getFullYear()),
    getWalletsWithTransactions(),
  ]);

  if (!assetsResult) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-foreground text-center">Ładowanie danych...</div>
      </div>
    );
  }

  return (
    <AssetsPageClient
      initialAssets={assetsResult.assets}
      initialWallets={walletsResult?.wallets ?? []}
      initialTransactions={walletsResult?.transactions ?? []}
      initialSales={sales}
      initialTaxSummary={taxSummary}
    />
  );
}
