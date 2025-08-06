// components/LazyLoadedSections.tsx
"use client";

import dynamic from "next/dynamic";

// Lazy load các section
const PartnerProgram = dynamic(() => import("@/components/PartnerProgram"), { ssr: false });
const TradingActivity = dynamic(() => import("@/components/Trading-Activiti"), { ssr: false });
const FAQ = dynamic(() => import("@/components/faq"), { ssr: false });
const SponsorsSection = dynamic(() => import("@/components/Partners"), { ssr: false });
const CTASection = dynamic(() => import("@/components/section/section.cta"), { ssr: false });

export default function LazyLoadedSections() {
  return (
    <>
      <PartnerProgram />
      <TradingActivity />
      <SponsorsSection />
      <FAQ />
      <CTASection />
    </>
  );
}