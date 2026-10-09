import { getPublicSalonDetails } from "@/lib/public-salon";
import { PayDepositPage } from "./pay-deposit-page";
import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";

export const metadata = {
  title: "Pay Deposit | GlamSlot",
  description: "Pay your deposit to confirm your booking",
};

interface PayDepositPageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function PayDepositRoute({ params }: PayDepositPageProps) {
  const { bookingId } = await params;
  const salon = await getPublicSalonDetails();

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader salon={salon} />
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pb-[100px] pt-5 md:px-6 md:pb-0 md:pt-6">
        <PayDepositPage bookingId={bookingId} salon={salon} />
      </main>
      <SiteFooter salon={salon} />
    </div>
  );
}