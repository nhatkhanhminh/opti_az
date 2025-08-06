"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useWalletBalance } from "thirdweb/react"
import { client } from "@/lib/client"
import { bsc } from "thirdweb/chains"
import { useActiveAccount } from "thirdweb/react"
import { useTokenData } from "@/components/hooks/useTokenData"
import { USDC, USDT, FIL, LINK, AZC, BNB, BTCB, SOL } from "@/Context/listaddress"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, Search, X, Settings, ArrowLeft } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { useTranslations } from "next-intl"

interface TokenSelectorProps {
  selectedToken: string
  onSelectToken: (tokenAddress: string) => void
  className?: string
}

interface TokenInfo {
  address: string
  symbol: string
  name: string
  icon: string
  balance: number
  usdValue: number
  isPopular?: boolean
}

export function TokenSelectorSwap({ selectedToken, onSelectToken, className }: TokenSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const account = useActiveAccount()
  const { prices, loading } = useTokenData()
  const t = useTranslations("TokenSelector")
  
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

  const { data: SOLBalance, isLoading: SOLBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: SOL 
  })

  const { data: BTCBBalance, isLoading: BTCBBalanceLoading } = useWalletBalance({ 
    chain: bsc, 
    address: account?.address, 
    client, 
    tokenAddress: BTCB 
  })  
  
  // Create token data
  const [tokens, setTokens] = useState<TokenInfo[]>([])
  
  useEffect(() => {
    const getTokenPrice = (symbol: string) => {
      if (symbol === "AZC") return 1;
      if (symbol === "USDC" || symbol === "USDT") return 1;
      const tokenPrice = prices?.[symbol]?.USD
      return tokenPrice !== undefined ? tokenPrice : 1;
    };
 
    const tokenList = [
      {
        address: BNB,
        symbol: "BNB",
        name: "BNB",
        icon: "/images/tokens/bnb.webp",
        balance: BNBBalance ? parseFloat(BNBBalance.displayValue) : 0,
        usdValue: BNBBalance 
          ? parseFloat(BNBBalance.displayValue) * getTokenPrice("BNB")
          : 0,
        isPopular: true
      },

      {
        address: USDC,
        symbol: "USDC",
        name: "USD Coin",
        icon: "/images/tokens/usdc.webp",
        balance: USDCBalance ? parseFloat(USDCBalance.displayValue) : 0,
        usdValue: USDCBalance 
          ? parseFloat(USDCBalance.displayValue) * getTokenPrice("USDC")
          : 0,
      
      },
      {
        address: USDT,
        symbol: "USDT",
        name: "Tether USD",
        icon: "/images/tokens/usdt.webp",
        balance: USDTBalance ? parseFloat(USDTBalance.displayValue) : 0,
        usdValue: USDTBalance 
          ? parseFloat(USDTBalance.displayValue) * getTokenPrice("USDT")
          : 0,
        isPopular: true
      },
      {
        address: FIL,
        symbol: "FIL",
        name: "Filecoin",
        icon: "/images/tokens/fil.webp",
        balance: FILBalance ? parseFloat(FILBalance.displayValue) : 0,
        usdValue: FILBalance 
          ? parseFloat(FILBalance.displayValue) * getTokenPrice("FIL")
          : 0,
        isPopular: true
      },
      {
        address: LINK,
        symbol: "LINK",
        name: "Chainlink",
        icon: "/images/tokens/link.webp",
        balance: LINKBalance ? parseFloat(LINKBalance.displayValue) : 0,
        usdValue: LINKBalance 
          ? parseFloat(LINKBalance.displayValue) * getTokenPrice("LINK")
          : 0,
      },
      {
        address: BTCB,
        symbol: "BTCB",
        name: "Bitcoin",
        icon: "/images/tokens/btc.webp",
        balance: BTCBBalance ? parseFloat(BTCBBalance.displayValue) : 0,
        usdValue: BTCBBalance 
          ? parseFloat(BTCBBalance.displayValue) * getTokenPrice("BTCB")
          : 0,
        isPopular: true
      },
      {
        address: SOL,
        symbol: "SOL",
        name: "Solana",
        icon: "/images/tokens/sol.webp",
        balance: SOLBalance ? parseFloat(SOLBalance.displayValue) : 0,
        usdValue: SOLBalance 
          ? parseFloat(SOLBalance.displayValue) * getTokenPrice("SOL")
          : 0,
      },

    ]
    
    setTokens(tokenList)
  }, [
    BNBBalance, 
    USDCBalance, 
    USDTBalance, 
    FILBalance, 
    LINKBalance,
    BTCBBalance,
    SOLBalance,
    prices
  ])

  const selectedTokenInfo = tokens.find(token => token.address === selectedToken) || tokens[0]
  const isLoadingBalances = BNBBalanceLoading || USDCBalanceLoading || USDTBalanceLoading || FILBalanceLoading || LINKBalanceLoading || loading

  // Lọc token dựa trên từ khóa tìm kiếm và sắp xếp theo balance
  const filteredTokens = React.useMemo(() => {
    if (!searchQuery) {
      // Sắp xếp token: ưu tiên những token có balance > 0 lên đầu và sắp xếp theo giá trị balance giảm dần
      return [...tokens].sort((a, b) => {
        // Nếu cả hai đều có balance > 0, sắp xếp giảm dần theo balance
        if (a.balance > 0 && b.balance > 0) {
          return b.balance - a.balance;
        }
        // Nếu cả hai đều có balance = 0, giữ thứ tự ban đầu
        if (a.balance === 0 && b.balance === 0) {
          return 0;
        }
        // Nếu a có balance > 0 và b = 0, a lên trước
        if (a.balance > 0 && b.balance === 0) {
          return -1;
        }
        // Nếu b có balance > 0 và a = 0, b lên trước
        return 1;
      });
    }
    
    const query = searchQuery.toLowerCase().trim();
    // Lọc token theo từ khóa tìm kiếm và sắp xếp theo balance
    return tokens
      .filter(token => 
        token.symbol.toLowerCase().includes(query) || 
        token.name.toLowerCase().includes(query) ||
        token.address.toLowerCase().includes(query)
      )
      .sort((a, b) => {
        // Nếu cả hai đều có balance > 0, sắp xếp giảm dần theo balance
        if (a.balance > 0 && b.balance > 0) {
          return b.balance - a.balance;
        }
        // Nếu cả hai đều có balance = 0, giữ thứ tự ban đầu
        if (a.balance === 0 && b.balance === 0) {
          return 0;
        }
        // Nếu a có balance > 0 và b = 0, a lên trước
        if (a.balance > 0 && b.balance === 0) {
          return -1;
        }
        // Nếu b có balance > 0 và a = 0, b lên trước
        return 1;
      });
  }, [tokens, searchQuery]);

  // Danh sách token phổ biến
  const popularTokens = React.useMemo(() => {
    return tokens.filter(token => token.isPopular);
  }, [tokens]);

  const [showSettings, setShowSettings] = useState(false)
  const [slippage, setSlippage] = useState(0.5)
  const [isOpenSettings, setIsOpenSettings] = useState(false)

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "w-full justify-between cursor-pointer",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {selectedTokenInfo && (
            <>
              <div className="w-6 h-6 overflow-hidden rounded-full">
                <Image 
                  src={selectedTokenInfo.icon} 
                  alt={selectedTokenInfo.symbol} 
                  width={24} 
                  height={24} 
                />
              </div>
              <span className="font-bold">{selectedTokenInfo.symbol}</span>
            </>
          )}
        </div>
        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px] bg-card text-card-foreground border-border">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle className="text-foreground text-xl"> {t("selectToken")}</DialogTitle>
            {/* <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setOpen(false)}
              className="h-6 w-6 text-muted-foreground hover:text-foreground rounded-full"
            >
              <X className="h-4 w-4" />
            </Button> */}
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchByToken")}
                className="pl-10 bg-muted border-border focus:border-primary text-foreground"
                value={searchQuery}
                autoFocus={false}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
            </div>

            {/* Popular Tokens Section */}
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">
                {t("popularTokens")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularTokens.map(token => (
                  <Button
                    key={`popular-${token.address}`}
                    variant="outline"
                    size="sm"
                    className="bg-muted hover:bg-muted/70 border-border text-foreground cursor-pointer"
                    onClick={() => {
                      onSelectToken(token.address);
                      setOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <Image
                        src={token.icon}
                        alt={token.symbol}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                      <span>{token.symbol}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Token List Section */}
            <div>
              <div className="flex justify-between items-center py-2 border-b border-border px-1">
                <span className="text-sm text-muted-foreground">Token</span>
                <span className="text-sm text-muted-foreground">
                  {t("balance")}
                </span>
              </div>
              
              {isLoadingBalances ? (
                <div className="py-6 text-center">
                  <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent text-primary"></div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {t("loadingTokens")}
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[320px] pr-3">
                  <div className="space-y-1 mt-1">
                    {filteredTokens.length > 0 ? (
                      filteredTokens.map((token) => (
                        <button
                          key={token.address}
                          className={`w-full flex items-center justify-between px-2 py-3 hover:bg-muted rounded-md transition-colors ${selectedToken === token.address ? 'bg-muted' : ''}`}
                          onClick={() => { 
                            onSelectToken(token.address);
                            setOpen(false);
                            setSearchQuery('');
                          }}
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
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{token.symbol}</span>
                                {/* {token.balance > 0 && (
                                  <Badge variant="outline" className="py-0 h-5 text-xs bg-primary/10 border-primary/30 text-primary">
                                    You own
                                  </Badge>
                                )} */}
                              </div>
                              <span className="text-xs text-muted-foreground">{token.name}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="block text-foreground font-medium">
                              {token.balance.toLocaleString(undefined, {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 4
                              })}
                            </span>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        <p>{t("noTokensFound")}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Sheet open={isOpenSettings} onOpenChange={setIsOpenSettings}>
        <SheetContent className={className}>
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center justify-between">
              <span>{t("settings")}</span>
              <div className="flex gap-2 items-center">
                <span>{slippage}%</span>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8 w-8 p-0"
                  onClick={() => setIsOpenSettings(false)}
                >
                  <Settings size={14} className="text-muted-foreground" />
                </Button>
              </div>
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col mt-6">
            {/* Settings */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full h-8 w-8 p-0"
                  onClick={() => setIsOpenSettings(false)}
                >
                  <ArrowLeft
                    size={14}
                    className="text-muted-foreground"
                  />
                </Button>
                <div className="text-sm font-medium">
                  {t("settings")}
                </div>
                <div className="w-8 h-8"></div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm">
                    {t("slippageTolerance")}
                  </div>
                  <div className="font-semibold">{slippage}%</div>
                </div>
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  value={[slippage]}
                  onValueChange={(values) => setSlippage(values[0])}
                  className="w-[90%] mx-auto"
                />
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
} 