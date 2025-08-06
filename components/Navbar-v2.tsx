"use client";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from "@/components/ui/navigation-menu";
import { useActiveAccount } from "thirdweb/react";
import { client } from "@/lib/client";
import { Button, buttonVariants } from "./ui/button";
import {
  Info,
  Coins,
  Map,
  Repeat,
  HelpCircle,
  FileText,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

import React from "react";
import { AutoConnect } from "thirdweb/react";
import { WalletConnect } from "./ui/wallet-connect";
import { ThemeToggle } from "./ui/theme-toggle";
import LangSwitcher from "./LangSwitcher";
import { useTranslations } from "next-intl";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useDAppDetection, getWalletProvider } from '@/hooks/useDAppDetection';
import { useConnect } from 'thirdweb/react';
import { createWallet } from 'thirdweb/wallets';

interface RouteProps {
  href: string;
  label: string;
}

// Component ListItem từ ShadCN
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  Omit<React.ComponentPropsWithoutRef<"a">, "title"> & {
    title: React.ReactNode | string;
  }
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          {children && (
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          )}
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// Thêm icon component để hiển thị bên cạnh menu item
const MenuIcon = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, children, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("mr-2 size-5 shrink-0", className)} {...props}>
      {children}
    </div>
  );
});
MenuIcon.displayName = "MenuIcon";

export const Navbar = () => {
  const t = useTranslations("Navbar");
  const { handleConnect: handleBrowserConnect, isConnecting: isBrowserConnecting, wallets } = useWalletConnect();
  const { connect, isConnecting: isDirectConnecting } = useConnect();
  const dappInfo = useDAppDetection();
  const account = useActiveAccount();
  const pathname = usePathname();

  const isConnecting = isBrowserConnecting || isDirectConnecting;

  // Smart wallet connect logic từ SmartWalletConnect
  const handleConnect = async () => {
    try {
      // Priority 1: Desktop browser - always use wallet connect modal
      if (dappInfo.isDesktopBrowser) {
        console.log('🖥️ Desktop browser - showing wallet selector modal...')
        await handleBrowserConnect()
        return
      }

      // Priority 2: Mobile DApp with provider - connect directly (excluding SafePal)
      if (dappInfo.isDApp && dappInfo.hasProvider && dappInfo.recommendedWalletId && dappInfo.recommendedWalletId !== 'com.safepal') {
        console.log(`📱 Mobile DApp - connecting to ${dappInfo.dappName} directly...`)
        
        const wallet = createWallet(dappInfo.recommendedWalletId as any)
        await connect(async () => {
          await wallet.connect({ client })
          return wallet
        })
      } 
      // Priority 3: Mobile DApp without provider - try injected wallet
      // else if (dappInfo.isDApp) {
      //   console.log(`📱 Mobile DApp - trying injected wallet for ${dappInfo.dappName}...`)
        
      //   const wallet = createWallet('io.metamask') // Fallback to injected
      //   await connect(async () => {
      //     await wallet.connect({ client })
      //     return wallet
      //   })
      // } 
      // Priority 4: Fallback - use wallet connect modal
      else {
        console.log('🔗 Fallback - showing wallet selector modal...')
        await handleBrowserConnect()
      }
    } catch (error) {
      console.error('❌ Connection failed:', error)
      
      // Nếu fail và là mobile dApp, thử mở download page
      if (dappInfo.isDApp && !dappInfo.hasProvider && !dappInfo.isDesktopBrowser) {
        try {
          getWalletProvider(dappInfo.dappId)
        } catch (downloadError) {
          console.log('📱 Redirecting to download page...')
        }
      }
    }
  };

  const routeList: RouteProps[] = [
    { href: "/", label: t("routes.home") },
    { href: "/dashboard", label: t("routes.dashboard") },
    { href: "/staking", label: t("routes.staking") },
    { href: "/swap", label: t("routes.swap") },
    { href: "/mystake", label: t("routes.mystake") },
    { href: "/partner", label: t("routes.partner") },
    // { href: "/token", label: t("routes.token") },
    // { href: "/about", label: t("routes.about") },
    // { href: "/roadmap", label: t("routes.roadmap") },
    // { href: "/media-resource", label: t("routes.mediaResource") },
    // { href: "/faqs", label: t("routes.faqs") },
  ];

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const mainLeftMenu = routeList.filter(({ href }) =>
    ["/staking", "/swap"].includes(href)
  );

  // const aboutSubMenu = routeList.filter(({ href }) =>
  //   ["/about", "/token", "/roadmap"].includes(href)
  // );

  // const moreLeftMenu = routeList.filter(({ href }) =>
  //   [ "/faqs", "/media-resource"].includes(href)
  // );

  const rightMenu = routeList.filter(({ href }) =>
    ["/dashboard", "/mystake", "/partner"].includes(href)
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-wrapper flex h-14 items-center px-2">
        <div className="mr-4 flex-shrink-0 md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/logo.png"
              alt="OptiFund Logo"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="hidden font-bold sm:inline-block">OptiFund</span>
            <span className="font-bold sm:hidden">OptiFund</span>
          </Link>

          {/* Menu trái trên màn hình từ md trở lên */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="flex items-center gap-2">
              {mainLeftMenu.map(({ href, label }) => (
                <NavigationMenuItem key={href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={href}
                      className={cn(
                        buttonVariants({ variant: "ghost" }),
                        isActive(href)
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                        "px-3"
                      )}
                    >
                      {label}
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {/* <NavigationMenuItem>
                <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground group">
                  {t("menu.about")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="data-[motion=from-start]:animate-in data-[motion=to-start]:animate-out data-[motion=from-end]:animate-in data-[motion=to-end]:animate-out data-[motion=from-start]:fade-in data-[motion=to-start]:fade-out data-[motion=from-end]:fade-in data-[motion=to-end]:fade-out data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion=from-end]:slide-in-from-right-52 data-[motion=to-end]:slide-out-to-right-52">
                  <ul className="grid gap-3 p-4 w-[250px] md:w-[300px]">
                    {aboutSubMenu.map(({ href, label }) => (
                      <ListItem
                        key={href}
                        href={href}
                        title={
                          <div className="flex items-center">
                            {label === t("routes.about") && (
                              <MenuIcon>
                                <Info className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label === t("routes.token") && (
                              <MenuIcon>
                                <Coins className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label === t("routes.roadmap") && (
                              <MenuIcon>
                                <Map className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label}
                          </div>
                        }
                      >
                        {label === t("routes.token") &&
                          t("descriptions.tokenomics")}
                        {label === t("routes.about") && t("descriptions.about")}
                        {label === t("routes.roadmap") &&
                          t("descriptions.roadmap")}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}

              {/* <NavigationMenuItem>
                <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground group">
                  {t("menu.more")}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="data-[motion=from-start]:animate-in data-[motion=to-start]:animate-out data-[motion=from-end]:animate-in data-[motion=to-end]:animate-out data-[motion=from-start]:fade-in data-[motion=to-start]:fade-out data-[motion=from-end]:fade-in data-[motion=to-end]:fade-out data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion=from-end]:slide-in-from-right-52 data-[motion=to-end]:slide-out-to-right-52">
                  <ul className="grid gap-3 p-4 w-[250px] md:w-[300px]">
                    {moreLeftMenu.map(({ href, label }) => (
                      <ListItem
                        key={href}
                        href={href}
                        title={
                          <div className="flex items-center">
                            {label === t("routes.swap") && (
                              <MenuIcon>
                                <Repeat className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label === t("routes.faqs") && (
                              <MenuIcon>
                                <HelpCircle className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label === t("routes.mediaResource") && (
                              <MenuIcon>
                                <FileText className="h-4 w-4" />
                              </MenuIcon>
                            )}
                            {label}
                          </div>
                        }
                      >
                        {label === t("routes.swap") && t("descriptions.swap")}
                        {label === t("routes.mediaResource") &&
                          t("descriptions.resource")}
                        {label === t("routes.faqs") && t("descriptions.faqs")}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem> */}
            </NavigationMenuList>
            <NavigationMenuViewport className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" />
          </NavigationMenu>
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <div className="flex gap-2 items-center">
            {account && (
              <>
                <NavigationMenu className="hidden lg:flex mx-auto">
                  <NavigationMenuList className="flex gap-4">
                    {rightMenu.map(({ href, label }) => (
                      <NavigationMenuItem key={href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={href}
                            className={cn(
                              buttonVariants({ variant: "ghost" }),
                              isActive(href)
                                ? "text-foreground"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {label}
                          </Link>
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    ))}
                  </NavigationMenuList>
                  <NavigationMenuViewport className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" />
                </NavigationMenu>

                {/* Menu phải trên tablet (md -> lg) */}
                <NavigationMenu className="hidden md:flex lg:hidden">
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground group">
                      {t("menu.manager")}
                    </NavigationMenuTrigger>
                    <NavigationMenuContent className="data-[motion=from-start]:animate-in data-[motion=to-start]:animate-out data-[motion=from-end]:animate-in data-[motion=to-end]:animate-out data-[motion=from-start]:fade-in data-[motion=to-start]:fade-out data-[motion=from-end]:fade-in data-[motion=to-end]:fade-out data-[motion=from-start]:slide-in-from-left-52 data-[motion=to-start]:slide-out-to-left-52 data-[motion=from-end]:slide-in-from-right-52 data-[motion=to-end]:slide-out-to-right-52">
                      <ul className="grid gap-3 p-4 w-[250px] md:w-[300px]">
                        {rightMenu.map(({ href, label }) => (
                          <ListItem key={href} href={href} title={label}>
                            {label === t("routes.dashboard") &&
                              t("descriptions.dashboard")}
                            {label === t("routes.mystake") &&
                              t("descriptions.mystake")}
                            {label === t("routes.partner") &&
                              t("descriptions.partner")}
                          </ListItem>
                        ))}
                      </ul>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuViewport className="origin-top-center relative mt-1.5 h-[var(--radix-navigation-menu-viewport-height)] w-full overflow-hidden rounded-md border shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-90 md:w-[var(--radix-navigation-menu-viewport-width)]" />
                </NavigationMenu>
              </>
            )}


            <div className=" items-center">
              <LangSwitcher />
            </div>

            <div className="hidden md:block w-16 h-8">
              <ThemeToggle />
            </div>

            <div className=" transform-origin-right -mr-1">
              {!account ? (
                <Button
                  size={"default"}
                  className="rounded-full cursor-pointer"
                  onClick={() => handleConnect()}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("connect.connecting")}
                    </>
                  ) : (
                    t("connect.connect")
                  )}
                </Button>
              ) : (
                <WalletConnect />
              )}

              <AutoConnect wallets={wallets} client={client} />
              
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
