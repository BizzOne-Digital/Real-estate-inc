import type { Metadata } from "next";
import { InfoPage } from "@/components/site/InfoPage";
import { MortgageCalculator } from "@/components/tools/Calculators";
import { getPage } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mortgage Information & Calculator",
  description: "Estimate your mortgage payments and learn about mortgage options, pre-approval and down payments in Canada.",
  alternates: { canonical: "/mortgage" },
};

export default async function MortgagePage() {
  const content = await getPage("mortgage");
  return (
    <InfoPage content={content}>
      <div className="border-b border-line bg-white">
        <div className="container-site py-14 lg:py-20">
          <MortgageCalculator />
        </div>
      </div>
    </InfoPage>
  );
}
