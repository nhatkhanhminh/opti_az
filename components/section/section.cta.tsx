// components/section/section.cta.tsx
'use client';

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CTASection() {
  const t = useTranslations('CTASection');

  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 to-primary/5">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {t('description')}
          </p>
          {/* <Link href="/staking">
            <Button size="lg" asChild>
              {t('button')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link> */}
        </div>
      </div>
    </section>
  );
}