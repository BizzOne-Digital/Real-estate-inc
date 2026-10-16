import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { LandTransferTaxCalculator } from "@/components/tools/Calculators";
import { getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Land Transfer Tax Calculator (Ontario & Toronto)",
  description:
    "Calculate Ontario and Toronto land transfer tax, including first-time homebuyer refunds, and learn who is eligible.",
  alternates: { canonical: "/land-transfer-tax" },
};

export default async function LandTransferTaxPage() {
  const content = await getPage("land-transfer-tax");
  return (
    <InfoPage content={content}>
      <div className="border-b border-line bg-white">
        <div className="container-site py-14 lg:py-20">
          <LandTransferTaxCalculator />
        </div>
      </div>
    </InfoPage>
  );
}
