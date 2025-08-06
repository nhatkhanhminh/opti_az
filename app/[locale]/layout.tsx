import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/app/[locale]/Providers";
import { Toaster } from "@/components/ui/sonner";
import NextTopLoader from "nextjs-toploader";
import ReferralHandler from "@/components/ReferralHandler";
import { Suspense } from "react";
import WalletChangeListener from "@/components/WalletChangeListener";
import { DashboardFooter } from "@/components/Footer-user";
import { Analytics } from "@vercel/analytics/react"
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans", // Để dùng trong Tailwind
  preload: true, // Preload font để giảm FOUT
});

export const metadata: Metadata = {
  title: "OptiFund - AI-Powered Crypto Staking Platform",
  description:
    "Maximize your crypto earnings with our AI-driven staking platform. Enjoy up to 18% monthly returns with secure and automated trading solutions.",
    openGraph: {
      title: "OptiFund - AI-Powered Crypto Staking Platform",
      description:
        "Maximize your crypto earnings with our AI-driven staking platform. Enjoy up to 18% monthly returns with secure and automated trading solutions.",
      type: "website",
      locale: "en_US",
      url: "https://optifund.app",
      siteName: "azcoin",
      images: [
        {
          url: "https://optifund.app/images/bg/bg-banner.png",
          width: 1200,
          height: 630,
          alt: "azcoin",
        },
      ],
    },
    twitter: {
      creator: "@azcoin_app",
      site: "@azcoin_app",
      card: "summary_large_image",
    },
  };

export default async  function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
    // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  return (

    <html lang={locale} className={fontSans.variable}>
      <body className="antialiased bg-background relative" suppressHydrationWarning>
        {/* Background gradients - đặt đầu tiên để nằm dưới các thành phần khác */}
        <div className="pointer-events-none fixed inset-0 z-[-10] overflow-hidden isolate">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] bg-blue-500/10 blur-[100px]" />
          <div className="absolute bottom-0 left-0 h-[500px] w-[500px] bg-purple-500/10 blur-[100px]" />
        </div>
        <div data-vaul-drawer-wrapper className="relative z-[1]">
        <NextIntlClientProvider 
          locale={locale} 
          messages={(await import(`@/messages/${locale}.json`)).default}
          timeZone="Asia/Ho_Chi_Minh"
        >
          <Providers>
            {children}
            <Toaster  richColors position="top-center" closeButton />
            <Suspense key="referral-handler" fallback={null}>
              <ReferralHandler />
            </Suspense>
            <Suspense key="wallet-listener" fallback={null}>
              <WalletChangeListener />
            </Suspense>
          </Providers>
          </NextIntlClientProvider>
          <NextTopLoader
            color="var(--foreground)"
            height={2}
            showSpinner={false}
          />
          <DashboardFooter />
        </div>
        {/* <SpeedInsights /> */}
        <Analytics/>
      </body>
    </html>
  );
}
