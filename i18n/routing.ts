import { createNavigation } from 'next-intl/navigation';
import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'vi', 'ru', 'jp','pt','kr','zh','fr'],
 
  // Used when no locale matches
  defaultLocale: 'en',
  
  // Cấu hình để không hiển thị locale trong URL
  localePrefix: 'never',
  
  // Tắt tự động phát hiện locale, để người dùng chọn thủ công
  localeDetection: false,
  
  pathnames: {
    "/": {
      en: "/",
      vi: "/",
      ru: "/",
      jp: "/",
      pt: "/",
      kr: "/",
      zh: "/",
      fr: "/"
    },
    "/staking": {
      en: "/staking",
      vi: "/staking",
      ru: "/staking",
      jp: "/staking",
      pt: "/staking",
      kr: "/staking",
      zh: "/staking",
      fr: "/staking"
    },
    "/dashboard": {
      en: "/dashboard",
      vi: "/dashboard",
      ru: "/dashboard",
      jp: "/dashboard",
      pt: "/dashboard",
      kr: "/dashboard",
      zh: "/dashboard",
      fr: "/dashboard"
    },
    "/mystake": {
      en: "/mystake",
      vi: "/mystake",
      ru: "/mystake",
      jp: "/mystake",
      pt: "/mystake",
      kr: "/mystake",
      zh: "/mystake",
      fr: "/mystake"
    },
    "/partner": {
      en: "/partner",
      vi: "/partner",
      ru: "/partner",
      jp: "/partner",
      pt: "/partner",
      kr: "/partner",
      zh: "/partner",
      fr: "/partner"
    },
    "/swap": {
      en: "/swap",
      vi: "/swap",
      ru: "/swap",
      jp: "/swap",
      pt: "/swap",
      kr: "/swap",
      zh: "/swap",
      fr: "/swap"
    },
    "/token": {
      en: "/token",
      vi: "/token",
      ru: "/token",
      jp: "/token",
      pt: "/token",
      kr: "/token",
      zh: "/token",
      fr: "/token"
    },
    "/about": {
      en: "/about",
      vi: "/about",
      ru: "/about",
      jp: "/about",
      pt: "/about",
      kr: "/about",
      zh: "/about",
      fr: "/about"
    },
    "/roadmap": {
      en: "/roadmap",
      vi: "/roadmap",
      ru: "/roadmap",
      jp: "/roadmap",
      pt: "/roadmap",
      kr: "/roadmap",
      zh: "/roadmap",
      fr: "/roadmap"
    },
    "/media-resource": {
      en: "/media-resource",
      vi: "/media-resource",
      ru: "/media-resource",
      jp: "/media-resource",
      pt: "/media-resource",
      kr: "/media-resource",
      zh: "/media-resource",
      fr: "/media-resource"
    },
    "/faqs": {
      en: "/faqs",
      vi: "/faqs",
      ru: "/faqs",
      jp: "/faqs",
      pt: "/faqs",
      kr: "/faqs",
      zh: "/faqs",
      fr: "/faqs"
    }
  }
});

export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);