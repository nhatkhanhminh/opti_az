"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Wallet, Copy, Check, LogOut,  ChevronDown, ChevronUp } from "lucide-react"
import { useActiveAccount, useDisconnect, useActiveWallet, useWalletBalance } from "thirdweb/react"
import { client } from "@/lib/client"
import { bsc } from "thirdweb/chains"
import { useTokenData } from "@/components/hooks/useTokenData"
import { useTranslations } from "next-intl"
import { USDC, USDT, FIL, LINK, AZC } from "@/Context/listaddress";
import Image from "next/image"

interface WalletConnectProps {
  className?: string
}

export function WalletConnect({ className }: WalletConnectProps) {
  const t = useTranslations("WalletConnect")
  const [walletOpen, setWalletOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showAllTokens, setShowAllTokens] = useState(false)
  const { disconnect } = useDisconnect()
  const account = useActiveAccount()
  const wallet = useActiveWallet()
  const { prices, loading } = useTokenData()
  
  // Fetch token balances using useWalletBalance hook
  const { data: BNBBalance, isLoading: BNBBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client 
  })
  
  const { data: USDCBalance, isLoading: USDCBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: USDC 
  })
  
  const { data: USDTBalance, isLoading: USDTBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: USDT 
  })
  
  const { data: FILBalance, isLoading: FILBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: FIL 
  })
  
  const { data: LINKBalance, isLoading: LINKBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: LINK 
  })

  const { data: AZCBalance, isLoading: AZCBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: AZC 
  })

  // Create real-time token data based on actual balances
  const [tokenData, setTokenData] = useState<any[]>([])
  
  useEffect(() => {
    // if (!account) return
    
    const createTokenData = () => {
      // Default price if API doesn't return value
      // Get token price from API with fallback
      const getTokenPrice = (symbol: string) => {
        // Nếu là AZC, luôn trả về giá 2 USD bất kể API có dữ liệu hay không
        if (symbol === "AZC") return 2;
        
        // Giá mặc định cho stablecoin
        if (symbol === "USDC" || symbol === "USDT") return 1;
       
        // Sử dụng optional chaining để lấy giá từ API
        // const tokenPrice = (prices?.prices as any)?.[symbol]?.USD;
        const tokenPrice =  prices?.[symbol]?.USD
  
        // Nếu có giá từ API thì sử dụng, nếu không thì sử dụng giá mặc định
        return tokenPrice !== undefined ? tokenPrice : 1;
      };
 
      let tokens = [
        {
          id: "bnb",
          name: "BNB",
          symbol: "BNB",
          icon: "/images/tokens/bnb.webp",
          balance: BNBBalance ? parseFloat(BNBBalance.displayValue) : 0,
          usdValue: BNBBalance 
            ? parseFloat(BNBBalance.displayValue) * getTokenPrice("BNB")
            : 0,
          priority: 1, // Highest priority for BNB
          primary: true,
        },
        {
          id: "azc",
          name: "AZ Coin",
          symbol: "AZC",
          icon: "/images/tokens/azc.webp",
          balance: AZCBalance ? parseFloat(AZCBalance.displayValue) : 0,
          usdValue: AZCBalance 
            ? parseFloat(AZCBalance.displayValue) * getTokenPrice("AZC")
            : 0,
          priority: 2, // Second highest priority for AZC
          primary: true,
        },
        {
          id: "usdc",
          name: "USDC",
          symbol: "USDC",
          icon: "/images/tokens/usdc.webp",
          balance: USDCBalance ? parseFloat(USDCBalance.displayValue) : 0,
          usdValue: USDCBalance 
            ? parseFloat(USDCBalance.displayValue) * getTokenPrice("USDC")
            : 0,
          priority: 3, // Normal priority, will be sorted by balance
          primary: true,
        },
        {
          id: "usdt",
          name: "USDT",
          symbol: "USDT",
          icon: "/images/tokens/usdt.webp",
          balance: USDTBalance ? parseFloat(USDTBalance.displayValue) : 0,
          usdValue: USDTBalance 
            ? parseFloat(USDTBalance.displayValue) * getTokenPrice("USDT")
            : 0,
          priority: 3, // Normal priority, will be sorted by balance
          primary: false,
        },
        {
          id: "fil",
          name: "FIL",
          symbol: "FIL",
          icon: "/images/tokens/fil.webp",
          balance: FILBalance ? parseFloat(FILBalance.displayValue) : 0,
          usdValue: FILBalance 
            ? parseFloat(FILBalance.displayValue) * getTokenPrice("FIL")
            : 0,
          priority: 3, // Normal priority, will be sorted by balance
          primary: false,
        },
        {
          id: "link",
          name: "LINK",
          symbol: "LINK",
          icon: "/images/tokens/link.webp",
          balance: LINKBalance ? parseFloat(LINKBalance.displayValue) : 0,
          usdValue: LINKBalance 
            ? parseFloat(LINKBalance.displayValue) * getTokenPrice("LINK")
            : 0,
          priority: 3, // Normal priority, will be sorted by balance
          primary: false,
        },
      ]
      
      // Sắp xếp token: đầu tiên theo priority (BNB, AZC), sau đó theo số dư
      tokens.sort((a, b) => {
        // Sắp xếp theo priority trước (1 và 2 cho BNB và AZC)
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Với các token cùng priority, sắp xếp theo số dư giảm dần
        return b.balance - a.balance;
      });
      
      // Đánh dấu 3 token đầu tiên là primary (hiển thị trong giao diện chính)
      tokens.forEach((token, index) => {
        token.primary = index < 3;
      });
      
      setTokenData(tokens);
    }
    
    createTokenData()
  }, [
    account, 
    BNBBalance, 
    USDCBalance, 
    USDTBalance, 
    FILBalance, 
    LINKBalance,
    AZCBalance,
    prices
  ])


  // Handle wallet disconnection
  const handleDisconnect = () => {
    if (wallet) {
      disconnect(wallet)
      setWalletOpen(false)
      // toast.success("Your wallet has been disconnected.")
    }
  }

  // Handle copying wallet address
  const copyAddress = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    return `${address.substring(0, 5)}...${address.substring(address.length - 5)}`
  }

  // Get primary tokens
  const primaryTokens = tokenData.filter((token) => token.primary)

  // Get secondary tokens
  const secondaryTokens = tokenData.filter((token) => !token.primary)

  // Loading indicator for token balances
  const isLoadingBalances = BNBBalanceLoading || USDCBalanceLoading || USDTBalanceLoading || FILBalanceLoading || LINKBalanceLoading || AZCBalanceLoading || loading

  return (
    <>
      {account && 
       <Dialog open={walletOpen} onOpenChange={setWalletOpen}>
         <Button
           variant="outline"
           onClick={() => setWalletOpen(true)}
           className={cn(
             "gap-2 rounded-full px-4 border-primary/20 hover:bg-primary/10 hover:text-primary cursor-pointer",
             className,
           )}
         >
           <Wallet className="h-4 w-4" />
           {formatAddress(account.address)}
         </Button>
          
         <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden rounded-xl border border-border/50 dark:border-border/80 shadow-lg bg-dialog-background">
           <div className="p-6">
             <DialogHeader>
               <DialogTitle>{t("title")}</DialogTitle>
               <DialogDescription className="text-muted-foreground text-sm">
                 {t("description")}
               </DialogDescription>
             </DialogHeader>
             
             {/* Wallet Address */}
             <div className="flex flex-col gap-2 mb-4 mt-2">
               <div className="bg-muted p-2 rounded-md font-mono text-sm flex justify-between items-center">
                 <span>{formatAddress(account.address)}</span>
                 <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-background/50 cursor-pointer" onClick={copyAddress}>
                   {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                 </Button>
               </div>
             </div>

             <Separator className="my-4" />

             {/* Token Balances */}
             <div className="mb-4">
               <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-medium text-muted-foreground">{t("tokenBalances")}</h3>
                 <Button
                   variant="ghost"
                   size="sm"
                   className="h-7 px-2 text-xs cursor-pointer"
                   onClick={() => setShowAllTokens(!showAllTokens)}
                 >
                   {showAllTokens ? (
                     <>
                       <ChevronUp className="h-3.5 w-3.5 mr-1" />
                       {t("showLess")}
                     </>
                   ) : (
                     <>
                       <ChevronDown className="h-3.5 w-3.5 mr-1" />
                       {t("showAll")}
                     </>
                   )}
                 </Button>
               </div>

               <div className="space-y-2">
                 {isLoadingBalances ? (
                   <div className="space-y-2">
                     <div className="h-14 rounded-md bg-muted animate-pulse"></div>
                     <div className="h-14 rounded-md bg-muted animate-pulse"></div>
                     <div className="h-14 rounded-md bg-muted animate-pulse"></div>
                   </div>
                 ) : (
                   <>
                     {/* Primary Tokens - Always visible */}
                     {primaryTokens.map((token) => (
                       <div key={token.id} className="flex items-center justify-between p-2 rounded-md bg-accent/50">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 overflow-hidden rounded-full">
                             <Image 
                               src={token.icon} 
                               alt={token.symbol} 
                               width={32} 
                               height={32} 
                             />
                           </div>
                           <div>
                             <h4 className="font-medium">{token.name}</h4>
                             <p className="text-xs text-muted-foreground">
                               ${token.usdValue.toLocaleString(undefined, {
                                 minimumFractionDigits: 2,
                                 maximumFractionDigits: 2
                               })}
                             </p>
                           </div>
                         </div>
                         <div className="text-right">
                           <p className="font-medium">
                             {token.balance.toLocaleString(undefined, {
                               minimumFractionDigits: 2,
                               maximumFractionDigits: 6
                             })} {token.symbol}
                           </p>
                         </div>
                       </div>
                     ))}

                     {/* Secondary Tokens - Only visible when expanded */}
                     {showAllTokens && (
                       <div className="pt-2 space-y-2">
                         {secondaryTokens.map((token) => (
                           <div
                             key={token.id}
                             className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors"
                           >
                             <div className="flex items-center gap-3">
                               <div className="w-8 h-8 overflow-hidden rounded-full">
                                 <Image 
                                   src={token.icon} 
                                   alt={token.symbol} 
                                   width={32} 
                                   height={32} 
                                 />
                               </div>
                               <div>
                                 <h4 className="font-medium">{token.name}</h4>
                                 <p className="text-xs text-muted-foreground">
                                   ${token.usdValue.toLocaleString(undefined, {
                                     minimumFractionDigits: 2,
                                     maximumFractionDigits: 2
                                   })}
                                 </p>
                               </div>
                             </div>
                             <div className="text-right">
                               <p className="font-medium">
                                 {token.balance.toLocaleString(undefined, {
                                   minimumFractionDigits: 2,
                                   maximumFractionDigits: 6
                                 })} {token.symbol}
                               </p>
                             </div>
                           </div>
                         ))}
                       </div>
                     )}
                   </>
                 )}
               </div>
             </div>

             {/* Actions */}
             <div className="flex justify-end">
               {/* <Button variant="outline" className="w-full" asChild>
                 <a href="/settings">
                   <Settings className="mr-2 h-4 w-4" />
                   Settings
                 </a>
               </Button> */}
               <Button className="cursor-pointer" variant="default" onClick={handleDisconnect}>
                 <LogOut className="mr-2 h-4 w-4" />
                 {t("disconnect")}
               </Button>
             </div>
           </div>
         </DialogContent>
       </Dialog>
      }
      

    </>
  )
}

