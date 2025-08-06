"use client"

import { ReferralTree } from "@/components/referral-tree"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Plus, Minus, RefreshCcw, Search } from "lucide-react"
import Spinner from "@/components/Spiner"
import useWalletStore from "@/store/userWalletStore"
import type { ReferralNode } from "@/types/referral"
import { shortenWalletAddress } from "@/lib/shortAddress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTranslations } from 'next-intl'

interface DownlineUser {
  _id: string;
  address: string;
  referrer: string;
  totalInvestment: number | bigint;
  level: number;
  directVolume?: number | bigint;
  teamVolume?: number | bigint;
  createdAt: string;
  timeJoin: string;
  isActive?: boolean;
}

export default function ReferralTreePage() {
  const { account } = useWalletStore()
  const [zoomLevel, setZoomLevel] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [referralData, setReferralData] = useState<ReferralNode | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [levelFilter, setLevelFilter] = useState("all")
  const [investmentFilter, setInvestmentFilter] = useState("all")

  const t = useTranslations('ReferralTreePage')

  // Create a tree structure from flat downline list
  const buildReferralTreeFromDownlines = (downlines: DownlineUser[], userAddress?: string, currentUserData?: any) => {
    // Helper function to convert totalInvestment to appropriate type
    const formatInvestmentValue = (value: number | bigint): string | number => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      return value;
    };
    
    if (!downlines || downlines.length === 0) {
      // Return only the current user's node if no downlines
      const rootNode: ReferralNode = {
        name: "Your Wallet",
        wallet: userAddress ? shortenWalletAddress(userAddress) : "0x0000...0000",
        fullAddress: userAddress || "",
        level: "You",
        totalInvestment: 0,
        f1Volume: 0,
        totalVolume: 0,
        children: []
      };

      // Nếu có dữ liệu currentUser, sử dụng nó
      if (currentUserData) {
        if (currentUserData.totalInvestment) {
          rootNode.totalInvestment = formatInvestmentValue(currentUserData.totalInvestment);
        }
        if (currentUserData.directVolume) {
          rootNode.f1Volume = formatInvestmentValue(currentUserData.directVolume);
        }
        if (currentUserData.teamVolume) {
          rootNode.totalVolume = formatInvestmentValue(currentUserData.teamVolume);
        }
      }

      return rootNode;
    }

    // Create root node
    const root: ReferralNode = {
      name: "Your Wallet",
      wallet: userAddress ? shortenWalletAddress(userAddress) : "0x0000...0000",
      fullAddress: userAddress || "",
      f1Volume: 0,
      totalVolume: 0,
      level: "You",
      totalInvestment: 0, // Default value, will be updated if user data is found
      children: []
    }

    // Ưu tiên dùng dữ liệu từ currentUser API
    if (currentUserData) {
      if (currentUserData.totalInvestment) {
        root.totalInvestment = formatInvestmentValue(currentUserData.totalInvestment);
      }
      if (currentUserData.directVolume) {
        root.f1Volume = formatInvestmentValue(currentUserData.directVolume);
      }
      if (currentUserData.teamVolume) {
        root.totalVolume = formatInvestmentValue(currentUserData.teamVolume);
      }
    } 
    // Dự phòng: tìm trong danh sách downlines
    else {
      // Try to find root user's investment in the downlines (for display purposes)
      const rootUserData = downlines.find(d => 
        d.address.toLowerCase() === userAddress?.toLowerCase());
      if (rootUserData) {
        if (rootUserData.totalInvestment) {
          root.totalInvestment = formatInvestmentValue(rootUserData.totalInvestment);
        }
        if (rootUserData.directVolume) {
          root.f1Volume = formatInvestmentValue(rootUserData.directVolume);
        }
        if (rootUserData.teamVolume) {
          root.totalVolume = formatInvestmentValue(rootUserData.teamVolume);
        }
      }
    }

    // Create map to store all nodes
    const nodeMap = new Map<string, ReferralNode>()
    nodeMap.set(userAddress?.toLowerCase() || "root", root)

    // Phân loại downline theo cấp
    const downlinesByLevel = new Map();
    for (let i = 1; i <= 15; i++) {
      downlinesByLevel.set(i, downlines.filter(user => user.level === i));
    }

    // Thêm các node theo cấp từ F1 đến F10
    for (let level = 1; level <= 15; level++) {
      const levelDownlines = downlinesByLevel.get(level) || [];
      
      levelDownlines.forEach((downline: { 
        address: string; 
        totalInvestment: number | bigint; 
        referrer: string;
        directVolume?: number | bigint;
        teamVolume?: number | bigint;
      }) => {
        const node: ReferralNode = {
          name: `F${level} Referral`,
          wallet: shortenWalletAddress(downline.address),
          fullAddress: downline.address,
          f1Volume: downline.directVolume ? formatInvestmentValue(downline.directVolume) : 0,
          totalVolume: downline.teamVolume ? formatInvestmentValue(downline.teamVolume) : 0,
          level: `F${level}`,
          totalInvestment: formatInvestmentValue(downline.totalInvestment),
          children: []
        }
        
        nodeMap.set(downline.address.toLowerCase(), node);
        
        // Tìm node cha
        const parentNode = nodeMap.get(downline.referrer.toLowerCase());
        if (parentNode) {
          parentNode.children.push(node);
        } else if (level === 1) {
          // Nếu là F1 và không tìm thấy node cha, thêm vào root
          root.children.push(node);
        }
      });
    }

    return root;
  }

  // Fetch downline list from API
  useEffect(() => {
    const fetchDownlines = async () => {
      if (!account?.address) {
        setIsLoading(false)
        setReferralData({
          name: "Your Wallet",
          wallet: "Connect wallet first",
          fullAddress: "",
          level: "You",
          f1Volume: 0,
          totalVolume: 0,
          children: []
        })
        return
      }

      try {
        setIsLoading(true)
        
        // Query parameters
        const queryParams = new URLSearchParams({
          userAddress: account.address,
          level: levelFilter,
          investmentStatus: investmentFilter,
          page: "1",
          limit: "1000" // Get all data to build the tree
        })
        
        // Call API to get downline list
        const response = await fetch(`/api/ref/downline?${queryParams}`)
        
        if (!response.ok) {
          throw new Error("Error fetching downline data")
        }
        
        const result = await response.json()
        
        if (result.success) {
          // Build tree from downline list
          const tree = buildReferralTreeFromDownlines(result.data, account.address, result.currentUser)
          setReferralData(tree)
        } else {
          throw new Error(result.error || "Unknown error")
        }
      } catch (error) {
        console.error("Error loading downline data:", error)
        setError((error as Error).message || "Could not load downline data. Please try again later.")
        
        // If error, just show the current user's node
        setReferralData({
          name: "Your Wallet",
          wallet: shortenWalletAddress(account.address),
          fullAddress: account.address,
          level: "You",
          f1Volume: 0,
          totalVolume: 0,
          children: []
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDownlines()
  }, [account?.address, levelFilter, investmentFilter])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2  bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t('title')}</h1>
        <p className="text-gray-600">{t('description')}</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-2 mb-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold">{t('nodeInfo.title')}</h2>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                className="cursor-pointer"
                onClick={handleZoomOut}
                aria-label="zoomOut"
                size={"sm"}
              >
                <Minus className="w-5 h-5" />
              </Button>
            
              <Button
                className="cursor-pointer"
                onClick={handleZoomIn}
                aria-label="zoomIn"
                size={"sm"}
              >
                <Plus className="w-5 h-5" />
              </Button>

              <Button
                variant={"outline"}
                className="cursor-pointer"
                onClick={handleResetZoom}
                aria-label="resetZoom"
                size={"sm"}
              >
                <RefreshCcw className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-background dark:bg-gray-700 border">
          <div
            className="h-[500px] md:h-[700px]"
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: "center center" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Spinner className="w-10 h-10" />
                <span className="ml-3 text-lg">{t('loading')}</span>
              </div>
            ) : error && !referralData ? (
              <div className="flex items-center justify-center h-full flex-col">
                <p className="text-destructive text-lg mb-4">{error}</p>
                <Button onClick={() => window.location.reload()}>{t('tryAgain')}</Button>
              </div>
            ) : referralData ? (
              <ReferralTree data={referralData} searchTerm={searchTerm} filterLevel={levelFilter !== "all" ? `F${levelFilter}` : null} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">{t('noData')}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-400">
          <p>{t('tip')}</p>
        </div>
      </div>
    </div>
  )
}