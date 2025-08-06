"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign,  BarChart, PieChart as PieChartIcon, TrendingUp, TrendingDown, Trophy, Calendar, Copy, Check, Users, Calculator, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useWalletBalance } from "thirdweb/react"
import { bsc } from "thirdweb/chains"
import { client } from "@/lib/client"
import { FIL, LINK, USDC, USDT } from "@/Context/listaddress"
import { Label, Pie, PieChart, Cell, Tooltip, ResponsiveContainer } from "recharts"

// Danh sách stablecoin có giá cố định 1 USD
const STABLE_COINS = ["USDT", "USDC"]

// Danh sách các địa chỉ ví leader
const LEADER_ADDRESSES = [
  "0xF9E5B2366228222bDA7F5027ddC007786AFADEeF",
  "0x4c94Cb534DFC257a8D864c497540734dc0b97388",
  "0xBe6c3889aF70cEBafAb48c62f544048FcCF0dF7C",
  "0x2921ee9eC849f2E72863b1b9016F897e558e7078",
  "0xfDec9D15DC7f618CB0deC44e2BBA534543a28BFE",
  "0x59ed10b4a51a5CE164c5F88718c558D918a858F0",
  "0xE06cdBBdD9986eed5a49804eD5F5796f58d0800D"
];

interface TokenData {
  symbol: string
  count: number
  totalAmount: number
  totalUSDValue: number // Giá trị USD lúc đầu tư
  totalCurrentUSDValue: number // Giá trị USD hiện tại
  percentOfTotal: number
  priceChange: number // Phần trăm thay đổi giá trị
}

interface StakingData {
  totalInvestmentUSD: number
  totalCurrentUSD: number
  tokenBreakdown: TokenData[]
  topTransactions: Record<string, TopTransaction[]> // Top transactions by token
}

interface TopTransaction {
  id: string
  symbol: string
  amount: number
  usdValue: number
  date: Date
  userAddress: string
}

interface InvestmentRecord {
  userAddress: string
  token: string  // Thay vì symbol
  amount: number
  planId: number
  usdtValue: number  // Thay vì usdValue
  status: string
  totalClaimed: number
  startDate: string
  createdAt: string
  _id?: string
}

// Interface cho dữ liệu leader
interface LeaderData {
  address: string;
  teamVolume: number;
  directVolume: number;
  totalInvestment: number;
  directReferrals: number;
  totalDownlines: number;
  found: boolean;
}

// Thêm địa chỉ pool claim
const POOL_ADDRESS = "0x30A62496D4AD1b69a2C1f4807604B4a1DFc012BC"; // Địa chỉ ví pool claim mẫu

// Thêm dữ liệu giả lập cho Pool Node
const POOL_SWAP_BALANCES: Record<string, number> = {
  "FIL": 577.12,
  "LINK": 171,
  "USDT": 2511.32,
  "USDC": 31.43,
  "BNB": 0.021,
};

// Thêm dữ liệu giả lập cho Pool Swap
const POOL_NODE_BALANCES: Record<string, number> = {
  "FIL": 1688.16,
  "LINK": 40.5,
  "USDT": 291.8,
  "USDC": 300.2,
  "BNB": 0.188,
};

export default function TestingPage() {
  const [data, setData] = useState<StakingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tokenList, setTokenList] = useState<string[]>([])
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null)
  const [leaders, setLeaders] = useState<LeaderData[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const [leaderError, setLeaderError] = useState<string | null>(null);
  const [poolBalances, setPoolBalances] = useState<Record<string, number>>({});
  const [loadingPoolBalances, setLoadingPoolBalances] = useState(true);
  const [claimStats, setClaimStats] = useState<{
    totalByToken: Record<string, number>;
    statsByStatus: Array<{status: string; count: number; totalClaimed: number}>;
    overallStats: {
      totalCount: number;
      totalClaimed: number;
      avgClaimed: number;
      maxClaimed: number;
      minClaimed: number;
    } | null;
    isLoading: boolean;
  }>({
    totalByToken: {},
    statsByStatus: [],
    overallStats: null,
    isLoading: false
  });
  const [topClaimers, setTopClaimers] = useState<Array<{
    stakeId: number;
    userAddress: string;
    token: string;
    totalClaimed: number;
    status: string;
  }>>([]);
  const [status, setStatus] = useState("");

  const { data: BNBBalance, isLoading: BNBBalanceLoading } = useWalletBalance({ chain: bsc, address: POOL_ADDRESS, client })
  const { data: USDCBalance, isLoading: USDCBalanceLoading } = useWalletBalance({ chain: bsc, address: POOL_ADDRESS, client, tokenAddress: USDC })
  const { data: FILBalance, isLoading: FILBalanceLoading } = useWalletBalance({ chain: bsc, address: POOL_ADDRESS, client, tokenAddress: FIL })
  const { data: LINKBalance, isLoading: LINKBalanceLoading } = useWalletBalance({ chain: bsc, address: POOL_ADDRESS, client, tokenAddress: LINK })
  const { data: USDTBalance, isLoading: USDTBalanceLoading } = useWalletBalance({ chain: bsc, address: POOL_ADDRESS, client, tokenAddress: USDT })
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // 1. Lấy dữ liệu giá token từ API
        const pricesResponse = await fetch("/api/prices/update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!pricesResponse.ok) {
          throw new Error("Failed to fetch token prices")
        }
        
        const pricesData = await pricesResponse.json()
        const prices = pricesData.prices
        
        // 2. Lấy dữ liệu investment từ API
        const investmentsResponse = await fetch("/api/investments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (!investmentsResponse.ok) {
          throw new Error("Failed to fetch investments data")
        }
        
        const investmentsData = await investmentsResponse.json()
        const investments: InvestmentRecord[] = investmentsData.data || []
        
        // Sử dụng dữ liệu thật nếu có, ngược lại sử dụng dữ liệu mẫu
        let stakings: any[] = []
        
        if (investments.length > 0) {
          stakings = investments.map(inv => ({
            id: inv._id,
            symbol: inv.token, // Chuyển đổi từ token sang symbol
            amount: inv.amount,
            usdValue: inv.usdtValue, // Chuyển đổi từ usdtValue sang usdValue
            timestamp: new Date(inv.startDate || inv.createdAt),
            userAddress: inv.userAddress
          }))
        } else {
          // Dữ liệu mẫu chỉ dùng khi không có dữ liệu thật
          stakings = [
            { id: "1", symbol: "BNB", amount: 1.5, usdValue: 1.5 * 250, timestamp: new Date(), userAddress: "0x123..." },
            { id: "2", symbol: "BNB", amount: 0.5, usdValue: 0.5 * 250, timestamp: new Date(), userAddress: "0x456..." },
            { id: "3", symbol: "ETH", amount: 2, usdValue: 2 * 2000, timestamp: new Date(), userAddress: "0x789..." },
            { id: "4", symbol: "USDT", amount: 1000, usdValue: 1000, timestamp: new Date(), userAddress: "0xabc..." },
            { id: "5", symbol: "USDC", amount: 500, usdValue: 500, timestamp: new Date(), userAddress: "0xdef..." },
            { id: "6", symbol: "BTC", amount: 0.05, usdValue: 0.05 * 30000, timestamp: new Date(), userAddress: "0xghi..." },
            { id: "7", symbol: "FIL", amount: 100, usdValue: 100 * 4, timestamp: new Date(), userAddress: "0xjkl..." },
            { id: "8", symbol: "LINK", amount: 50, usdValue: 50 * 10, timestamp: new Date(), userAddress: "0xmno..." },
          ]
        }
        
        // 3. Tính toán thống kê
        const tokenMap = new Map<string, TokenData>()
        let totalUSDValue = 0
        let totalCurrentUSDValue = 0
        
        // Tạo danh sách các token để sử dụng trong tabs
        const uniqueTokens = Array.from(new Set(stakings.map(s => s.symbol)));
        setTokenList(["ALL", ...uniqueTokens]);
        
        // Tìm top 10 giao dịch cho mỗi loại token
        const topTransactionsByToken: Record<string, TopTransaction[]> = {
          ALL: []
        };
        
        // Khởi tạo các mảng cho từng token
        uniqueTokens.forEach(token => {
          topTransactionsByToken[token] = [];
        });
        
        // Chuyển đổi dữ liệu stakings thành TopTransaction
        const allTransactions: TopTransaction[] = stakings.map(s => ({
          id: s.id || `tx-${Math.random().toString(36).substring(2, 9)}`,
          symbol: s.symbol,
          amount: s.amount,
          usdValue: s.usdValue,
          date: new Date(s.timestamp),
          userAddress: s.userAddress
        }));
        
        // Thêm tất cả giao dịch vào "ALL"
        topTransactionsByToken.ALL = [...allTransactions].sort((a, b) => b.usdValue - a.usdValue).slice(0, 10);
        
        // Thêm giao dịch vào từng loại token
        uniqueTokens.forEach(token => {
          const tokenTransactions = allTransactions.filter(tx => tx.symbol === token);
          topTransactionsByToken[token] = tokenTransactions.sort((a, b) => b.usdValue - a.usdValue).slice(0, 10);
        });
        
        stakings.forEach(staking => {
          const { symbol, amount } = staking
          // Giá trị ban đầu (khi đầu tư)
          const usdValue = staking.usdValue || (amount * (prices[symbol]?.USD || 0))
          
          // Giá trị hiện tại dựa trên tỉ giá hiện tại
          // Với stablecoin (USDT, USDC), luôn giữ giá 1 USD bất kể giá từ API
          const currentPrice = STABLE_COINS.includes(symbol) ? 1 : (prices[symbol]?.USD || 0)
          const currentUSDValue = amount * currentPrice
          
          totalUSDValue += usdValue
          totalCurrentUSDValue += currentUSDValue
          
          if (!tokenMap.has(symbol)) {
            tokenMap.set(symbol, {
              symbol,
              count: 0,
              totalAmount: 0,
              totalUSDValue: 0,
              totalCurrentUSDValue: 0,
              percentOfTotal: 0,
              priceChange: 0
            })
          }
          
          const tokenData = tokenMap.get(symbol)!
          tokenData.count += 1
          tokenData.totalAmount += amount
          tokenData.totalUSDValue += usdValue
          tokenData.totalCurrentUSDValue += currentUSDValue
        })
        
        // Tính phần trăm và thay đổi giá trị
        for (const tokenData of tokenMap.values()) {
          tokenData.percentOfTotal = (tokenData.totalUSDValue / totalUSDValue) * 100
          // Tính phần trăm thay đổi giá trị
          tokenData.priceChange = tokenData.totalUSDValue > 0 
            ? ((tokenData.totalCurrentUSDValue - tokenData.totalUSDValue) / tokenData.totalUSDValue) * 100
            : 0
        }
        
        // Sắp xếp theo giá trị USD giảm dần
        const sortedTokens = Array.from(tokenMap.values()).sort(
          (a, b) => b.totalUSDValue - a.totalUSDValue
        )
        
        setData({
          totalInvestmentUSD: totalUSDValue,
          totalCurrentUSD: totalCurrentUSDValue,
          tokenBreakdown: sortedTokens,
          topTransactions: topTransactionsByToken
        })
        
        // Tự động tính toán dữ liệu claim khi trang được tải
        setTimeout(() => {
          if (investments.length > 0) {
            // Tính toán chi phí claim từ investments
            calculateClaimStatsFromInvestments(investments);
          } else {
            // Không có dữ liệu investments, tải từ API
            fetchClaimStats();
          }
        }, 500);
        
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [])

  // Fetch leader data
  useEffect(() => {
    const fetchLeadersData = async () => {
      try {
        setLoadingLeaders(true);
        const response = await fetch("/api/users/team-volume", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ addresses: LEADER_ADDRESSES }),
        });

        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu leader");
        }

        const result = await response.json();
        
        if (result.success) {
          // Sắp xếp theo teamVolume giảm dần
          const sortedLeaders = result.data.sort((a: LeaderData, b: LeaderData) => b.teamVolume - a.teamVolume);
          setLeaders(sortedLeaders);
        } else {
          throw new Error(result.error || "Lỗi không xác định");
        }
      } catch (err) {
        console.error("Error fetching leaders data:", err);
        setLeaderError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        setLoadingLeaders(false);
      }
    };

    fetchLeadersData();
  }, []);

  // Fetch pool balances
  useEffect(() => {
    const fetchPoolBalances = async () => {
      try {
        setLoadingPoolBalances(true);
        
        // Sử dụng số dư đã lấy từ blockchain
        const updatedBalances: Record<string, number> = {};
        
        // Chờ tất cả số dư được tải xong
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Cập nhật khi có số dư
        if (!BNBBalanceLoading && BNBBalance) {
          updatedBalances["BNB"] = parseFloat(BNBBalance.displayValue);
        }
        if (!USDCBalanceLoading && USDCBalance) {
          updatedBalances["USDC"] = parseFloat(USDCBalance.displayValue);
        }
        if (!USDTBalanceLoading && USDTBalance) {
          updatedBalances["USDT"] = parseFloat(USDTBalance.displayValue);
        }
        if (!FILBalanceLoading && FILBalance) {
          updatedBalances["FIL"] = parseFloat(FILBalance.displayValue);
        }
        if (!LINKBalanceLoading && LINKBalance) {
          updatedBalances["LINK"] = parseFloat(LINKBalance.displayValue);
        }
        
        // Thêm một số dữ liệu mẫu cho các token khác (nếu cần)
        if (!updatedBalances["BTC"]) {
          updatedBalances["BTC"] = 0.385;
        }
        if (!updatedBalances["ETH"]) {
          updatedBalances["ETH"] = 2.75;
        }
        
        setPoolBalances(updatedBalances);
      } catch (err) {
        console.error("Error processing pool balances:", err);
      } finally {
        setLoadingPoolBalances(false);
      }
    };

    fetchPoolBalances();
  }, [BNBBalance, BNBBalanceLoading, USDCBalance, USDCBalanceLoading, 
      USDTBalance, USDTBalanceLoading, FILBalance, FILBalanceLoading, 
      LINKBalance, LINKBalanceLoading]);

  // Hàm xử lý copy địa chỉ vào clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedAddress(address)
        // Tự động reset trạng thái sau 2 giây
        setTimeout(() => setCopiedAddress(null), 2000)
      })
      .catch((err) => console.error("Không thể sao chép địa chỉ: ", err))
  }
  
  const getColorClass = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-red-500",
      "bg-orange-500",
    ]
    return colors[index % colors.length]
  }
  
  // Hàm rút gọn địa chỉ ví
  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Hàm định dạng thời gian
  const formatDate = (date: Date) => {
    if (!date) return "";
    
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) {
      // Trong ngày hôm nay
      const hours = date.getHours();
      const minutes = date.getMinutes();
      return `Hôm nay ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (diffDays < 2) {
      // Hôm qua
      return "Hôm qua";
    } else if (diffDays < 7) {
      // Trong tuần này
      const days = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"];
      return days[date.getDay()];
    } else {
      // Hiển thị ngày tháng
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      return `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    }
  };

  // Hàm định dạng số lượng token dựa trên loại token
  const formatTokenAmount = (amount: number, symbol: string) => {
    // Đối với BTC, hiển thị 8 chữ số thập phân
    if (symbol === "BTC") {
      return amount.toLocaleString(undefined, { 
        minimumFractionDigits: 8, 
        maximumFractionDigits: 8 
      });
    }
    // Đối với stablecoin (USDT, USDC), hiển thị 2 chữ số thập phân
    else if (STABLE_COINS.includes(symbol)) {
      return amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    } 
    // Các token khác hiển thị 2 chữ số thập phân
    else {
      return amount.toLocaleString(undefined, { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 4
      });
    }
  };

  // Hàm định dạng số tiền
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  
  // Hàm tính toán chi phí claim trực tiếp từ dữ liệu investments
  const calculateClaimStatsFromInvestments = (investments: InvestmentRecord[]) => {
    setClaimStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Tạo object để lưu tổng theo token
      const totalByToken: Record<string, number> = {};
      
      // Tạo object để lưu thống kê theo status
      const statusStatsMap: Record<string, {count: number; totalClaimed: number}> = {};
      
      // Biến theo dõi tổng thống kê
      let totalCount = 0;
      let totalClaimedSum = 0;
      let maxClaimed = 0;
      let minClaimed = Infinity;
      const claimedValues: number[] = [];
      
      // Duyệt qua tất cả investments để tính tổng
      for (const investment of investments) {
        const { token, totalClaimed, status } = investment;
        
        // Bỏ qua nếu không có claim
        if (!totalClaimed || totalClaimed <= 0) continue;
        
        // Tính tổng theo token
        if (totalByToken[token]) {
          totalByToken[token] += totalClaimed;
        } else {
          totalByToken[token] = totalClaimed;
        }
        
        // Tính thống kê theo status
        if (statusStatsMap[status]) {
          statusStatsMap[status].count += 1;
          statusStatsMap[status].totalClaimed += totalClaimed;
        } else {
          statusStatsMap[status] = {
            count: 1,
            totalClaimed: totalClaimed
          };
        }
        
        // Cập nhật thống kê tổng thể
        totalCount++;
        totalClaimedSum += totalClaimed;
        maxClaimed = Math.max(maxClaimed, totalClaimed);
        minClaimed = Math.min(minClaimed, totalClaimed);
        claimedValues.push(totalClaimed);
      }
      
      // Tạo mảng thống kê theo status
      const statsByStatus = Object.entries(statusStatsMap).map(([status, stats]) => ({
        status,
        count: stats.count,
        totalClaimed: stats.totalClaimed
      }));
      
      // Tính trung bình nếu có dữ liệu
      const avgClaimed = totalCount > 0 
        ? totalClaimedSum / totalCount 
        : 0;
      
      // Tạo object thống kê tổng thể
      const overallStats = totalCount > 0 ? {
        totalCount,
        totalClaimed: totalClaimedSum,
        avgClaimed,
        maxClaimed,
        minClaimed: minClaimed !== Infinity ? minClaimed : 0
      } : null;
      
      // Tìm top 5 stake có chi phí claim cao nhất
      const topClaimers = investments
        .filter((inv: any) => inv.totalClaimed > 0)
        .sort((a: any, b: any) => b.totalClaimed - a.totalClaimed)
        .slice(0, 5)
        .map((inv: any) => ({
          stakeId: inv.stakeId,
          userAddress: inv.userAddress,
          token: inv.token,
          totalClaimed: inv.totalClaimed,
          status: inv.status
        }));
      
      // Cập nhật state cho top claimers
      setTopClaimers(topClaimers);
      
      // Cập nhật state với đầy đủ dữ liệu
      setClaimStats({
        totalByToken,
        statsByStatus,
        overallStats,
        isLoading: false
      });
      
      setStatus(`Đã tính tổng chi phí claim cho ${Object.keys(totalByToken).length} loại token từ ${totalCount} stake`);
    } catch (error) {
      console.error("Lỗi khi tính tổng chi phí claim:", error);
      setStatus("Lỗi khi tính tổng chi phí claim");
      setClaimStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Tính tổng chi phí claim theo token từ danh sách investments
  const calculateClaimStatsByToken = () => {
    if (!data || !data.tokenBreakdown) {
      setStatus("Không có dữ liệu đầu tư để tính");
      return;
    }
    
    setClaimStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      // Dùng API để lấy dữ liệu từ server
      fetch('/api/investments')
        .then(response => response.json())
        .then(result => {
          if (result.success && result.data && result.data.length > 0) {
            const investments = result.data;
            calculateClaimStatsFromInvestments(investments);
          } else {
            setStatus("Không tìm thấy dữ liệu đầu tư");
            setClaimStats(prev => ({ ...prev, isLoading: false }));
          }
        })
        .catch(error => {
          console.error("Lỗi khi lấy dữ liệu investments:", error);
          setStatus("Lỗi khi lấy dữ liệu đầu tư");
          setClaimStats(prev => ({ ...prev, isLoading: false }));
        });
      
    } catch (error) {
      console.error("Lỗi khi tính tổng chi phí claim:", error);
      setStatus("Lỗi khi tính tổng chi phí claim");
      setClaimStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Tải lại dữ liệu từ API
  const fetchClaimStats = async () => {
    setClaimStats(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await fetch('/api/investments/claim-stats');
      const data = await response.json();
      
      if (data.success) {
        setClaimStats({
          totalByToken: data.data.totalByToken,
          statsByStatus: data.data.statsByStatus || [],
          overallStats: data.data.overallStats || null,
          isLoading: false
        });
        
        // Tải thêm danh sách top claimers
        try {
          const topResponse = await fetch('/api/investments/top-claimers');
          const topData = await topResponse.json();
          
          if (topData.success) {
            setTopClaimers(topData.data || []);
          }
        } catch (topError) {
          console.error("Lỗi khi tải top claimers:", topError);
        }
        
        setStatus("Đã tải thông tin chi phí claim thành công");
      } else {
        setStatus("Lỗi khi tải thông tin claim: " + data.message);
        setClaimStats(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu claim stats:", error);
      setStatus("Lỗi khi tải dữ liệu chi phí claim");
      setClaimStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-500 dark:border-red-700">
          <CardHeader>
            <CardTitle className="text-red-500 dark:text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Thống kê đầu tư</h1>
          <div>
            <Link href="/">
              <Button variant="outline">Quay về trang chủ</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tổng giá trị đầu tư ban đầu */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giá trị đầu tư ban đầu
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="text-4xl font-bold">${data?.totalInvestmentUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              )}
            </CardContent>
          </Card>

          {/* Tổng giá trị hiện tại */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Giá trị hiện tại
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="text-4xl font-bold">
                  ${data?.totalCurrentUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {data && (
                    <span className={`ml-2 text-base ${data.totalCurrentUSD > data.totalInvestmentUSD ? 'text-green-500' : 'text-red-500'}`}>
                      {data.totalCurrentUSD > data.totalInvestmentUSD ? (
                        <span className="flex items-center">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          {(((data.totalCurrentUSD - data.totalInvestmentUSD) / data.totalInvestmentUSD) * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <TrendingDown className="h-4 w-4 mr-1" />
                          {(((data.totalInvestmentUSD - data.totalCurrentUSD) / data.totalInvestmentUSD) * 100).toFixed(2)}%
                        </span>
                      )}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Phân bổ đầu tư */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Phân bổ đầu tư
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-16 w-full" />
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={data?.tokenBreakdown.map(token => ({
                          name: token.symbol,
                          value: token.totalUSDValue,
                          percentage: token.percentOfTotal
                        }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                        labelLine={false}
                      >
                        {data?.tokenBreakdown.map((token, index) => {
                          const colors = [
                            "#3B82F6", // blue-500
                            "#10B981", // green-500
                            "#F59E0B", // yellow-500
                            "#8B5CF6", // purple-500
                            "#EC4899", // pink-500
                            "#6366F1", // indigo-500
                            "#EF4444", // red-500
                            "#F97316", // orange-500
                          ];
                          return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                        })}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`$${value.toLocaleString()}`, 'Giá trị']}
                        labelFormatter={(name) => `Token: ${name}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-1">
                    {data?.tokenBreakdown.slice(0, 5).map((token, i) => {
                      const colors = [
                        "bg-blue-500",
                        "bg-green-500",
                        "bg-yellow-500",
                        "bg-purple-500",
                        "bg-pink-500",
                        "bg-indigo-500",
                        "bg-red-500",
                        "bg-orange-500",
                      ];
                      return (
                        <div key={token.symbol} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${colors[i % colors.length]}`}></div>
                            <span>{token.symbol}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2">${token.totalUSDValue.toLocaleString()}</span>
                            <span className="text-gray-500 text-xs">({token.percentOfTotal.toFixed(1)}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {data?.tokenBreakdown.length && data?.tokenBreakdown.length > 5 ? (
                    <div className="text-sm text-muted-foreground text-right mt-2">
                      +{data.tokenBreakdown.length - 5} token khác
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
       {/* Tài sản token */}
       <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Tài sản
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Tài sản được tính bằng 42% số lượng token đã stake
              </p>
            </CardHeader>
            <CardContent>
              {isLoading || BNBBalanceLoading || USDCBalanceLoading || USDTBalanceLoading || 
               FILBalanceLoading || LINKBalanceLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="relative overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-6 py-3">Token</th>
                        <th scope="col" className="px-6 py-3">Đã Staking</th>
                        <th scope="col" className="px-6 py-3">Pool (42%)</th>
                        <th scope="col" className="px-6 py-3 text-red-500">ĐÃ claim</th>
                        <th scope="col" className="px-6 py-3 text-orange-500">Trả Hoa hồng</th>
                        <th scope="col" className="px-6 py-3 text-green-500">POOL CLAIM</th>
                        <th scope="col" className="px-6 py-3 text-green-500">POOL NODE</th>
                        <th scope="col" className="px-6 py-3 text-green-500">POOL SWAP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data?.tokenBreakdown.map((token) => {
                        // Tính 42% số lượng token
                        const assetAmount = token.totalAmount * 0.42;
                        // Tính giá trị USD dựa trên tỷ giá hiện tại
                        const totalUsdValue = token.totalCurrentUSDValue;
                        const assetUsdValue = STABLE_COINS.includes(token.symbol) 
                          ? assetAmount 
                          : (assetAmount * (token.totalCurrentUSDValue / token.totalAmount));
                        
                        // Lấy số token đã claim và hiển thị trực tiếp giá trị USD
                        const claimedAmount = claimStats.totalByToken[token.symbol] || 0;
                        
                        // Lấy số dư pool cho token hiện tại từ blockchain
                        const poolBalance = poolBalances[token.symbol] || 0;
                        const poolBalanceUsd = STABLE_COINS.includes(token.symbol)
                          ? poolBalance
                          : (poolBalance * (token.totalCurrentUSDValue / token.totalAmount));

                        // Lấy số dư pool node cho token hiện tại
                        const poolNodeBalance = POOL_NODE_BALANCES[token.symbol] || 0;
                        const poolNodeBalanceUsd = STABLE_COINS.includes(token.symbol)
                          ? poolNodeBalance
                          : (poolNodeBalance * (token.totalCurrentUSDValue / token.totalAmount));
                        
                        // Lấy số dư pool swap cho token hiện tại
                        const poolSwapBalance = POOL_SWAP_BALANCES[token.symbol] || 0;
                        const poolSwapBalanceUsd = STABLE_COINS.includes(token.symbol)
                          ? poolSwapBalance
                          : (poolSwapBalance * (token.totalCurrentUSDValue / token.totalAmount));
                        
                        return (
                          <tr key={token.symbol} className="bg-card border-b last:border-0">
                            <td className="px-6 py-4 font-medium">{token.symbol}</td>
                            <td className="px-6 py-4">
                              <div>{formatTokenAmount(token.totalAmount, token.symbol)}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(totalUsdValue)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div>{formatTokenAmount(assetAmount, token.symbol)}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(assetUsdValue)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-red-500">${claimedAmount.toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-orange-500">${(claimedAmount * 0.46).toLocaleString()}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center text-green-500">
                                <span>{formatTokenAmount(poolBalance, token.symbol)}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(poolBalanceUsd)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-green-500">{formatTokenAmount(poolNodeBalance, token.symbol)}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(poolNodeBalanceUsd)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-green-500">{formatTokenAmount(poolSwapBalance, token.symbol)}</div>
                              <div className="text-xs text-muted-foreground">{formatCurrency(poolSwapBalanceUsd)}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold">
                        <td className="px-6 py-4">Tổng</td>
                        <td className="px-6 py-4">
                          <div>{formatCurrency(data?.totalCurrentUSD || 0)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            {formatCurrency(
                              data?.tokenBreakdown.reduce((sum, token) => {
                                const assetAmount = token.totalAmount * 0.42;
                                return sum + (STABLE_COINS.includes(token.symbol) 
                                  ? assetAmount 
                                  : (assetAmount * (token.totalCurrentUSDValue / token.totalAmount)));
                              }, 0) || 0
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-red-500">
                            {formatCurrency(
                              Object.values(claimStats.totalByToken).reduce((sum, amount) => sum + (amount || 0), 0)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-orange-500">
                            {formatCurrency(
                              Object.values(claimStats.totalByToken).reduce((sum, amount) => sum + (amount || 0), 0) * 0.46
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-500">
                            {formatCurrency(
                              data?.tokenBreakdown.reduce((sum, token) => {
                                const poolBalance = poolBalances[token.symbol] || 0;
                                return sum + (STABLE_COINS.includes(token.symbol)
                                  ? poolBalance
                                  : (poolBalance * (token.totalCurrentUSDValue / token.totalAmount)));
                              }, 0) || 0
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-500">
                            {formatCurrency(
                              data?.tokenBreakdown.reduce((sum, token) => {
                                const poolNodeBalance = POOL_NODE_BALANCES[token.symbol] || 0;
                                return sum + (STABLE_COINS.includes(token.symbol)
                                  ? poolNodeBalance
                                  : (poolNodeBalance * (token.totalCurrentUSDValue / token.totalAmount)));
                              }, 0) || 0
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-green-500">
                            {formatCurrency(
                              data?.tokenBreakdown.reduce((sum, token) => {
                                const poolSwapBalance = POOL_SWAP_BALANCES[token.symbol] || 0;
                                return sum + (STABLE_COINS.includes(token.symbol)
                                  ? poolSwapBalance
                                  : (poolSwapBalance * (token.totalCurrentUSDValue / token.totalAmount)));
                              }, 0) || 0
                            )}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Bảng Chi tiết Leader */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                Doanh Số Leader
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingLeaders ? (
                <Skeleton className="h-64 w-full" />
              ) : (
                <div className="relative overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-muted">
                      <tr>
                        <th scope="col" className="px-4 py-3">Địa chỉ ví</th>
                        <th scope="col" className="px-4 py-3 text-right">Doanh số nhóm</th>
                        <th scope="col" className="px-4 py-3 text-right">F1</th>
                        <th scope="col" className="px-4 py-3 text-right">Tổng tuyến dưới</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaders.map((leader) => (
                        <tr key={leader.address} className="bg-card border-b last:border-0">
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <span>{shortenAddress(leader.address)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-1"
                                onClick={() => copyToClipboard(leader.address)}
                              >
                                {copiedAddress === leader.address ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">{formatCurrency(leader.teamVolume)}</td>
                          <td className="px-4 py-3 text-right">{leader.directReferrals}</td>
                          <td className="px-4 py-3 text-right">{leader.totalDownlines}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Chi tiết theo token
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Tabs defaultValue="by-value" className="w-full">
                  {/* <TabsList className="mb-4">
                    <TabsTrigger value="by-value">Theo giá trị USD</TabsTrigger>
                  </TabsList> */}
                  
                  <TabsContent value="by-value">
                    <div className="relative overflow-x-auto rounded-lg border">
                      <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-muted">
                          <tr>
                            <th scope="col" className="px-6 py-3">Token</th>
                            <th scope="col" className="px-6 py-3">Số lượng</th>
                            <th scope="col" className="px-6 py-3">Số giao dịch</th>
                            <th scope="col" className="px-6 py-3">Giá trị đầu tư</th>
                            <th scope="col" className="px-6 py-3">Giá trị hiện tại</th>
                            <th scope="col" className="px-6 py-3">Thay đổi</th>
                            <th scope="col" className="px-6 py-3">% Tổng</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data?.tokenBreakdown.map((token) => (
                            <tr key={token.symbol} className="bg-card border-b last:border-0">
                              <td className="px-6 py-4 font-medium">{token.symbol}</td>
                              <td className="px-6 py-4">{formatTokenAmount(token.totalAmount, token.symbol)}</td>
                              <td className="px-6 py-4">{token.count}</td>
                              <td className="px-6 py-4">${token.totalUSDValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className="px-6 py-4">${token.totalCurrentUSDValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                              <td className={`px-6 py-4 ${token.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                <span className="flex items-center whitespace-nowrap">
                                  {token.priceChange >= 0 ? 
                                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                  }
                                  {Math.abs(token.priceChange).toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-6 py-4">{token.percentOfTotal.toFixed(2)}%</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="font-semibold">
                            <td className="px-6 py-4">Tổng</td>
                            <td className="px-6 py-4">-</td>
                            <td className="px-6 py-4">{data?.tokenBreakdown.reduce((sum, token) => sum + token.count, 0)}</td>
                            <td className="px-6 py-4">${data?.totalInvestmentUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className="px-6 py-4">${data?.totalCurrentUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                            <td className={`px-6 py-4 ${data && data.totalCurrentUSD >= data.totalInvestmentUSD ? 'text-green-500' : 'text-red-500'}`}>
                              {data && (
                                <span className="flex items-center whitespace-nowrap">
                                  {data.totalCurrentUSD >= data.totalInvestmentUSD ? 
                                    <TrendingUp className="h-4 w-4 mr-1" /> : 
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                  }
                                  {data.totalInvestmentUSD > 0 
                                    ? Math.abs(((data.totalCurrentUSD - data.totalInvestmentUSD) / data.totalInvestmentUSD) * 100).toFixed(2) 
                                    : "0.00"}%
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4">100%</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Top 10 giao dịch lớn nhất */}
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Top 10 giao dịch lớn nhất
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <Tabs defaultValue="ALL" className="w-full">
                  <TabsList className="mb-4 flex flex-wrap">
                    {tokenList.map((token) => (
                      <TabsTrigger key={token} value={token} className="cursor-pointer">
                        {token}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {tokenList.map((token) => (
                    <TabsContent key={token} value={token}>
                      <div className="relative overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs uppercase bg-muted">
                            <tr>
                              <th scope="col" className="px-4 py-3">#</th>
                              <th scope="col" className="px-4 py-3">Token</th>
                              <th scope="col" className="px-4 py-3">Số lượng</th>
                              <th scope="col" className="px-4 py-3">Giá trị USD</th>
                              <th scope="col" className="px-4 py-3">Địa chỉ ví</th>
                              <th scope="col" className="px-4 py-3">Thời gian</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data?.topTransactions[token]?.length ? (
                              data.topTransactions[token].map((tx, index) => (
                                <tr key={tx.id} className="bg-card border-b last:border-0">
                                  <td className="px-4 py-3 font-medium">{index + 1}</td>
                                  <td className="px-4 py-3">{tx.symbol}</td>
                                  <td className="px-4 py-3">{formatTokenAmount(tx.amount, tx.symbol)}</td>
                                  <td className="px-4 py-3 font-medium">${tx.usdValue.toLocaleString(undefined, { 
                                    minimumFractionDigits: 2, 
                                    maximumFractionDigits: 2 
                                  })}</td>
                                  <td className="px-4 py-3">
                                    <div className="flex items-center">
                                      <span>{shortenAddress(tx.userAddress)}</span>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-6 w-6 ml-1"
                                        onClick={() => copyToClipboard(tx.userAddress)}
                                      >
                                        {copiedAddress === tx.userAddress ? (
                                          <Check className="h-3 w-3 text-green-500" />
                                        ) : (
                                          <Copy className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className="flex items-center text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(tx.date)}
                                    </span>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                                  Không có giao dịch nào
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Pricing Tiers */}
        <div className="space-y-6">
          {/* Thêm card claim ở đây, sau các card khác trong trang */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Thống kê Chi phí Claim</CardTitle>
            </CardHeader>
            <CardContent>
              {claimStats.isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin mr-2">
                    <div className="h-6 w-6 rounded-full border-t-2 border-b-2 border-gray-900"></div>
                  </div>
                  <span className="text-gray-500">Đang tính toán...</span>
                </div>
              ) : Object.keys(claimStats.totalByToken).length > 0 ? (
                <div className="space-y-4">
                  {/* Tổng hợp theo token */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(claimStats.totalByToken).map(([token, total]) => (
                      <Card key={token} className="p-4 border">
                        <div className="text-sm text-gray-500">Tổng Chi phí Claim</div>
                        <div className="text-xl font-bold mt-1">{total.toLocaleString()} {token}</div>
                      </Card>
                    ))}
                  </div>
                  
                  {/* Thống kê tổng quát */}
                  {claimStats.overallStats && (
                    <div className="bg-gray-100 p-4 rounded-md border dark:bg-gray-800">
                      <h4 className="font-medium mb-2">Thống kê tổng quát</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Tổng số stake đã claim</div>
                          <div className="font-bold">{claimStats.overallStats.totalCount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Chi phí trung bình</div>
                          <div className="font-bold">{claimStats.overallStats.avgClaimed.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Chi phí lớn nhất</div>
                          <div className="font-bold">{claimStats.overallStats.maxClaimed.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Chi phí nhỏ nhất</div>
                          <div className="font-bold">{claimStats.overallStats.minClaimed.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Thống kê theo trạng thái */}
                  {claimStats.statsByStatus.length > 0 && (
                    <div className="bg-gray-100 p-4 rounded-md border dark:bg-gray-800">
                      <h4 className="font-medium mb-2">Chi phí theo trạng thái</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium p-1">Trạng thái</th>
                            <th className="text-right font-medium p-1">Số lượng</th>
                            <th className="text-right font-medium p-1">Tổng chi phí</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claimStats.statsByStatus.map((stat) => (
                            <tr key={stat.status} className="border-b last:border-0">
                              <td className="p-1">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  stat.status === "active" 
                                    ? "bg-green-100 text-green-800" 
                                    : stat.status === "completed" 
                                      ? "bg-gray-100 text-gray-800" 
                                      : "bg-blue-100 text-blue-800"
                                }`}>
                                  {stat.status}
                                </span>
                              </td>
                              <td className="text-right p-1">{stat.count.toLocaleString()}</td>
                              <td className="text-right p-1">{stat.totalClaimed.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  
                  {/* Top 5 chi phí claim cao nhất */}
                  {topClaimers.length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-md border dark:bg-gray-900">
                      <h4 className="font-medium mb-2">Top 5 Chi phí Claim Cao Nhất</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left font-medium p-1">Stake ID</th>
                            <th className="text-left font-medium p-1">Địa chỉ</th>
                            <th className="text-center font-medium p-1">Token</th>
                            <th className="text-center font-medium p-1">Trạng thái</th>
                            <th className="text-right font-medium p-1">Tổng Chi phí</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topClaimers.map((claimer) => (
                            <tr key={claimer.stakeId} className="border-b last:border-0 hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="p-1">
                                #{claimer.stakeId}
                              </td>
                              <td className="p-1 font-mono text-xs truncate max-w-[100px]">{shortenAddress(claimer.userAddress)}</td>
                              <td className="p-1 text-center">{claimer.token}</td>
                              <td className="p-1 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-xs ${
                                  claimer.status === "active" 
                                    ? "bg-green-100 text-green-800" 
                                    : claimer.status === "completed" 
                                      ? "bg-gray-100 text-gray-800" 
                                      : "bg-blue-100 text-blue-800"
                                }`}>
                                  {claimer.status}
                                </span>
                              </td>
                              <td className="p-1 text-right font-medium">{claimer.totalClaimed.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500">
                  Chưa có dữ liệu chi phí claim nào được tính toán
                </div>
              )}
            </CardContent>
            <div className="px-6 pb-6 flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={calculateClaimStatsByToken}
                disabled={isLoading || !data || claimStats.isLoading}
              >
                <Calculator className="mr-2 h-4 w-4" />
                Tính toán từ dữ liệu hiện có
              </Button>
              
              <Button 
                variant="default" 
                className="flex-1"
                onClick={fetchClaimStats}
                disabled={claimStats.isLoading}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Tải dữ liệu từ máy chủ
              </Button>
            </div>
          </Card>
          
          {status && (
            <div className={`p-4 rounded-lg mb-4 flex items-center ${
              status.includes('thành công') 
                ? "bg-green-100 text-green-800" 
                : status.includes('Đang xử lý') || status.includes('Đang cập nhật')
                  ? "bg-blue-100 text-blue-800" 
                  : "bg-red-100 text-red-800"
            }`}>
              {status.includes('thành công') ? (
                <Check className="h-5 w-5 mr-2" />
              ) : status.includes('Đang xử lý') || status.includes('Đang cập nhật') ? (
                <div className="animate-spin h-5 w-5 mr-2 border-2 border-current border-t-transparent rounded-full"/>
              ) : (
                <AlertCircle className="h-5 w-5 mr-2" />
              )}
              {status}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
