import Link from "next/link";
import Image from "next/image";
import {  Send, Twitter, YoutubeIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function DashboardFooter() {
  const t = useTranslations("Footer");

  return (
    <footer className="border-t bg-background/95 w-full">
      <div className="container mx-auto flex flex-col gap-8 py-8 px-4 md:px-6 md:flex-row md:py-12">
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="logo" width={32} height={32} />
            <h2 className="font-bold">optifund.app</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t("slogan")}</p>
        </div>
        
        <div className="grid flex-1 grid-cols-2 gap-12 sm:grid-cols-4">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("sections.products.title")}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/staking" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.products.items.staking")}
                </Link>
              </li>
              <li>
                <Link href="/swap" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.products.items.swap")}
                </Link>
              </li>
            </ul>
          </div>
          {/* <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("sections.azcToken.title")}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/token" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.azcToken.items.tokenomics")}
                </Link>
              </li>
              <li>
                <Link href="/roadmap" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.azcToken.items.roadmap")}
                </Link>
              </li>
              <li>
                <Link href="/media-resource" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.azcToken.items.mediaResource")}
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("sections.company.title")}</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.company.items.about")}
                </Link>
              </li>
              <li>
                <Link href="/faqs" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.company.items.faqs")}
                </Link>
              </li>
              <li>
                <Link href="/about/privacy-policy" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.company.items.privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/about/term-of-service" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.company.items.termsOfService")}
                </Link>
              </li>
            </ul>
          </div> */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">{t("sections.connect.title")}</h3>
            {/* <div className="flex space-x-4">
              <Link
                href="https://t.me/azcoin_app"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Send className="h-5 w-5" />
                <span className="sr-only">{t("sections.connect.social.telegram")}</span>
              </Link>
              <Link
                href="https://x.com/azcoin_app"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">{t("sections.connect.social.twitter")}</span>
              </Link>
              <Link
                href="https://www.youtube.com/@azcoinOfficial"
                className="text-muted-foreground transition-colors hover:text-primary"
              >
                <YoutubeIcon className="h-6 w-6" />
                <span className="sr-only">{t("sections.connect.social.youtube")}</span>
              </Link>
            </div> */}
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="mailto:hello@optifund.app" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.connect.items.email")}
                </Link>
              </li>
              {/* <li>
                <Link href="https://t.me/azc_support" className="text-muted-foreground transition-colors hover:text-primary">
                  {t("sections.connect.items.support")}
                </Link>
              </li> */}
            </ul>
          </div>
        </div>
      </div>
      <div className="container mx-auto border-t py-6 px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          {t("copyright")}
        </p>
      </div>
    </footer>
  );
}
