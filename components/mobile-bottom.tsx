"use client"

import type React from "react"
import { useState, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import {
  Home,
  Wallet,
  BarChart2,
  Users,
  MoreHorizontal,
  Settings,
  HelpCircle,
  FileText,
  Coins,
  ArrowRightLeft,
  LandPlot,
  Images,
  Sprout,
} from "lucide-react"
import { ThemeToggle } from "./ui/theme-toggle"
import useWalletStore from "@/store/userWalletStore"
import { useTranslations } from "next-intl"

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  active?: boolean
  requireAuth?: boolean
  hideWhenAuth?: boolean
  showWhenAuth?: boolean
}

export function MobileBottomNav() {
  const t = useTranslations("MobileBottom")
  const pathname = usePathname()
  // const { disconnect } = useDisconnect()
  // const wallet = useActiveWallet()
  const [moreOpen, setMoreOpen] = useState(false)
  // const account = useActiveAccount()
  const { account } = useWalletStore()
  // Tối ưu logic filter cho các navigation item
  const routeList = useMemo(() => [
    {
      label: t("routes.home"),
      href: "/",
      icon: Home,
      hideWhenAuth: true,
    },
    {
      label: t("routes.stake"),
      href: "/staking",
      icon: Wallet,
    },
    {
      label: t("routes.dashboard"),
      href: "/dashboard",
      icon: BarChart2,
      requireAuth: true,
    },
    {
      label: t("routes.mystake"),
      href: "/mystake",
      icon: Sprout,
      requireAuth: true,
    },
    {
      label: t("routes.partner"),
      href: "/partner",
      icon: Users,
      requireAuth: true,
    },
    {
      label: t("routes.swap"),
      href: "/swap",
      icon: FileText,
      hideWhenAuth: true,
    },
    // {
    //   label: t("routes.faqs"),
    //   href: "/faqs",
    //   icon: HelpCircle,
    //   hideWhenAuth: true,
    // },
    {
      label: t("routes.more"),
      href: "#more",
      icon: MoreHorizontal,
    },
  ], [t]);

  const moreNavItems: NavItem[] = useMemo(() => [
    {
      label: t("routes.home"),
      href: "/",
      icon: Home,
      showWhenAuth: true,
    },
    // {
    //   label: t("routes.token"),
    //   href: "/token",
    //   icon: Coins,
    // },
    // {
    //   label: t("routes.roadmap"),
    //   href: "/roadmap",
    //   icon: LandPlot,
    // },
    // {
    //   label: t("routes.swap"),
    //   href: "/swap",
    //   icon: ArrowRightLeft,
    // },
    // {
    //   label: t("routes.about"),
    //   href: "/about",
    //   icon: FileText,
    //   showWhenAuth: true,
    // },
    // {
    //   label: t("routes.faqs"),
    //   href: "/faqs",
    //   icon: HelpCircle,
    //   showWhenAuth: true,
    // },
    // {
    //   label: t("routes.resource"),
    //   href: "/media-resource",
    //   icon: Images,
    //   showWhenAuth: true,
    // },
    {
      label: t("routes.theme"),
      href: "#theme",
      icon: Settings,
    },
  ], [t]);

  const mainNavItems = useMemo(() => {
    return routeList
      .filter(item => {
        if (account) {
          // Khi đã đăng nhập, hiển thị các mục theo yêu cầu mới
          return !item.hideWhenAuth || item.requireAuth || item.href === "/staking" || item.href === "#more";
        }
        return !item.requireAuth;
      })
      .map((item) => ({
        ...item,
        active: pathname === item.href,
      }))
      // Sắp xếp theo thứ tự yêu cầu khi đã đăng nhập
      .sort((a, b) => {
        if (!account) return 0; // Không cần sắp xếp khi chưa đăng nhập

        const order: Record<string, number> = {
          "/staking": 1,
          "/mystake": 2,
          "/dashboard": 3,
          "/partner": 4,
          "#more": 5
        };

        return (order[a.href] || 99) - (order[b.href] || 99);
      });
  }, [account, pathname, routeList]);

  const moreItems = useMemo(() => {
    return moreNavItems
      .filter(item => {
        if (account) {
          // Khi đã đăng nhập, hiển thị Home trong menu More
          return !item.requireAuth || account || item.showWhenAuth;
        } else {
          // Khi chưa đăng nhập, loại bỏ các mục requireAuth và các mục About/FAQs (vì đã hiển thị ngoài)
          return !item.requireAuth && item.href !== "/about" && item.href !== "/faqs" && !item.showWhenAuth;
        }
      })
      .map((item) => ({
        ...item,
        active: pathname === item.href,
      }));
  }, [account, pathname, moreNavItems]);

  // Hydration safety
  const isMounted = useMemo(() => true, []);

  if (!isMounted) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden",
        "transition-opacity duration-300 ease-in-out",
        moreOpen ? "opacity-0 pointer-events-none" : "opacity-100 pointer-events-auto"
      )}
    >
      <div className="backdrop-blur-md bg-background/80 border-t border-border shadow-lg">
        <nav className="container mx-auto px-2">
          <ul className="flex items-center justify-between">
            {mainNavItems.map((item, index) => (
              <li key={index} className="flex-1">
                {item.href === "#more" ? (
                  <Drawer open={moreOpen} onOpenChange={setMoreOpen} shouldScaleBackground={true} direction="bottom">
                    <DrawerTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "cursor-pointer flex flex-col items-center justify-center w-full h-14 gap-1 rounded-none text-muted-foreground",
                          moreOpen && "text-primary",
                        )}
                      >
                        <item.icon className="h-8 w-8" />
                        <span className="text-[12px]">{item.label}</span>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="h-[40vh] rounded-t-xl">
                      <DrawerHeader className="mb-4">
                        <DrawerTitle className="text-center"></DrawerTitle>
                        <DrawerDescription></DrawerDescription>
                      </DrawerHeader>
                    
                        <div className="px-4 pb-6 grid grid-cols-4 gap-4">
                        {moreItems.map((moreItem, moreIndex) => (
                          moreItem.href === "#theme" ? (
                            <div
                              key={moreIndex}
                              className="flex flex-col items-center justify-center p-3 rounded-lg"
                            >
                              <ThemeToggle />
                              <span className="text-xs text-center mt-1">{moreItem.label}</span>
                            </div>
                          ) : (
                            <Link
                              key={moreIndex}
                              href={moreItem.href}
                              onClick={() => setMoreOpen(false)}
                              className={cn(
                                "flex flex-col items-center justify-center p-3 rounded-lg hover:bg-accent transition-colors",
                                moreItem.active && "bg-primary/10 text-primary",
                              )}
                            >
                              <moreItem.icon className="h-6 w-6 mb-1" />
                              <span className="text-xs text-center">{moreItem.label}</span>
                            </Link>
                          )
                        ))}
                      </div>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <Link href={item.href} className="block">
                    <div className="relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                          "cursor-pointer flex flex-col items-center justify-center w-full h-14 gap-1 rounded-none text-muted-foreground transition-colors",
                          item.active && "text-primary bg-gradient-to-t from-primary/10 to-transparent",
                        )}
                      >
                        <item.icon className="h-8 w-8" />
                        <span className="text-xs">{item.label}</span>
                      </Button>
                      {item.active && (
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-t-full" />
                      )}
                    </div>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  )
}