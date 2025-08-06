"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Clock, ChevronDown, ChevronUp, AlertCircle, Check } from "lucide-react"
import { useTranslations } from "next-intl"

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {  prepareContractCall } from "thirdweb";

import {
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";

import { Skeleton } from "@/components/ui/skeleton"
import { stakingPlans } from "@/Context/stakingPlans";
import { tokenTypes } from "@/Context/token";
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import useWalletStore from "@/store/userWalletStore"
import Image from "next/image"
import { formatTokenAmount } from "@/lib/convertNumber"
import { useTokenData } from "@/components/hooks/useTokenData"
import Spinner from "@/components/Spiner"
import { RainbowButton } from "@/components/ui/rainbow-button"
import confetti from "canvas-confetti"
import { getUserStakes } from "@/ultis/useStakeInfo"
import { useClaimContract } from "@/hooks/useContract"
import { useDataStakingContract } from "@/hooks/useContract"

// Convert tokenTypes array to a map for easier lookup
const TOKEN_DATA = Object.fromEntries(
  tokenTypes.map(token => [
    token.tokenAddress,
    {
      symbol: token.symbol,
      name: token.name,
      icon: token.icon,
      price: 1 // Giá sẽ được cập nhật từ API hoặc oracle
    }
  ])
);

TOKEN_DATA.unknown = { symbol: "???", icon: "/images/tokens/unknown.webp", name: "Unknown Token", price: 0 };
const AZC_PRICE = 2;

function StakingCard({ 
  stakingData, 
  onClaim, 
  isPendingClaim, 
  isClaimingId, 
  isSuccessClaim, 
  isErrorClaim, 
  tokenPrices,
  lastClaimTime 
}: { 
  stakingData: any, 
  onClaim: (stakeId: bigint) => void, 
  isPendingClaim: boolean, 
  isClaimingId: bigint | null,
  isSuccessClaim: boolean, 
  isErrorClaim: boolean, 
  tokenPrices: any,
  lastClaimTime: number
}) {
  const t = useTranslations('MyStakePage')
  const [isOpen, setIsOpen] = useState(false);
  const [canClaim, setCanClaim] = useState(false);
  const [timeUntilClaim, setTimeUntilClaim] = useState("");
  const [timePassedSinceLastClaim, setTimePassedSinceLastClaim] = useState(0);
  const [reservedTime, setReservedTime] = useState(0);
  
  // Thêm state để quản lý hiển thị "Claim Success"
  const [showClaimSuccess, setShowClaimSuccess] = useState(false);

  // Effect để hiển thị "Claim Success" và confetti khi claim thành công
  useEffect(() => {
    if (isSuccessClaim && isClaimingId?.toString() === stakingData.id.toString()) {
      // Hiển thị "Claim Success"
      setShowClaimSuccess(true);
      
      // Hiệu ứng confetti
      const runConfetti = () => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      };
      
      runConfetti();
      
      // Sau 3 giây, ẩn "Claim Success" để hiển thị Badge timeUntilClaim
      const timer = setTimeout(() => {
        setShowClaimSuccess(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSuccessClaim, isClaimingId, stakingData.id]);

  // Effect để kiểm tra eligibility dựa trên lastClaimTime
  const checkClaimEligibility = useCallback(() => {
    const lastClaimTimestamp = Number(lastClaimTime) * 1000;
    const now = Date.now();
    const timeDiff = now - lastClaimTimestamp;
    const secondsInDay = 24 * 60 * 60;
    const timePassedInSeconds = timeDiff / 1000;
    
    const hoursPassedSinceLastClaim = timePassedInSeconds / 3600;
    setTimePassedSinceLastClaim(hoursPassedSinceLastClaim);
    
    if (timePassedInSeconds >= secondsInDay) {
      setCanClaim(true);
      setTimeUntilClaim("");
      
      const completeDays = Math.floor(timePassedInSeconds / (24 * 60 * 60));
      const reservedSeconds = timePassedInSeconds - (completeDays * 24 * 60 * 60);
      const reservedHours = reservedSeconds / 3600;
      setReservedTime(reservedHours);
    } else {
      setCanClaim(false);
      const secondsLeft = secondsInDay - timePassedInSeconds;
      const hoursLeft = Math.floor(secondsLeft / 3600);
      const minutesLeft = Math.floor((secondsLeft % 3600) / 60);
      setTimeUntilClaim(`${hoursLeft}h ${minutesLeft}m`);
      setReservedTime(0);
    }
  }, [lastClaimTime]);

  // Effect để kiểm tra eligibility khi lastClaimTime thay đổi
  useEffect(() => {
    checkClaimEligibility();
    const interval = setInterval(checkClaimEligibility, 60000); // 1 minute
    return () => clearInterval(interval);
  }, [checkClaimEligibility, lastClaimTime]);

  // if(isErrorClaim) {
  //   toast.warning("Error claiming rewards");
  // }
  // Hàm xử lý claim riêng cho từng card
  const handleLocalClaim = () => {
    onClaim(stakingData.id);
  };

  const matchingToken = tokenTypes.find(token => token.tokenAddress.toLowerCase() === stakingData.token.toLowerCase());
  
  const tokenData = matchingToken ? {
    symbol: matchingToken.symbol,
    name: matchingToken.name,
    icon: matchingToken.icon,
    price: tokenPrices?.prices && tokenPrices.prices[matchingToken.symbol]?.USD || 1
  } : TOKEN_DATA.unknown;

  const planData = stakingPlans.find(plan => plan.id === `${stakingData.planId}`) || stakingPlans[0];
  // Convert bigint to number safely 
  const safeToNumber = (bigintValue: bigint) => {
    try {
      return Number(bigintValue) / 1e18;
    } catch (error) {
      console.error("Error converting bigint to number:", error);
      return 0;
    }
  };
  
  // Calculate USD values
  const amountInEth = safeToNumber(stakingData.amount);
  const usdtAmountInUsd = safeToNumber(stakingData.usdtAmount);
  const totalClaimedInEth = safeToNumber(stakingData.totalClaimed);
  // Không cần nhân với giá token nữa vì stakingData.totalClaimed đã là giá trị USDT
  const totalClaimedInUsd = totalClaimedInEth;

  // For this plan, maximum payout is 400% of initial investment
  const maxPayout = usdtAmountInUsd * 4;
  const remainingUsd = Math.max(0, maxPayout - totalClaimedInUsd);
  const remainingToken = remainingUsd / tokenData.price;
  const progressPercentage = Math.min(100, (totalClaimedInUsd / maxPayout) * 100);

  // Lấy giá AZC token từ hook useTokenData
  // const azcPrice = tokenPrices?.prices?.AZC?.USD || AZC_PRICE;

  // Calculate daily reward based on USD value
  const dailyReward = {
    usdValue: (usdtAmountInUsd * planData.apy) / 30 / 100, // Daily reward in USD (APY/30 for monthly)
    stakeToken: {
      usd: ((usdtAmountInUsd * planData.apy) / 30 / 100) * 0.7, // 70% in stake token
      amount: (((usdtAmountInUsd * planData.apy) / 30 / 100) * 0.7) / tokenData.price,
    },
    azcToken: {
      usd: ((usdtAmountInUsd * planData.apy) / 30 / 100) * 0.3, // 30% in AZC
      amount: (((usdtAmountInUsd * planData.apy) / 30 / 100) * 0.3) / AZC_PRICE,
    },
  };
  
  // Tính toán lãi dự kiến dựa trên thời gian đã trôi qua
  const expectedReward = {
    days: Math.floor(timePassedSinceLastClaim / 24),
    hours: timePassedSinceLastClaim % 24,
    totalHours: timePassedSinceLastClaim,
    stakeToken: {
      // Chỉ tính theo số ngày tròn, không tính phần giờ dư
      amount: dailyReward.stakeToken.amount * Math.floor(timePassedSinceLastClaim / 24),
      usd: dailyReward.stakeToken.usd * Math.floor(timePassedSinceLastClaim / 24),
    },
    azcToken: {
      // Chỉ tính theo số ngày tròn, không tính phần giờ dư
      amount: dailyReward.azcToken.amount * Math.floor(timePassedSinceLastClaim / 24),
      usd: dailyReward.azcToken.usd * Math.floor(timePassedSinceLastClaim / 24),
    },
  };

  return (
    <Card className="hover:border-zinc-300 dark:hover:border-zinc-700  transition-colors duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
               <Image src={tokenData.icon} alt={tokenData.symbol} width={32} height={32} />
              </div>
              <span> {t('stakingCard.title')} {tokenData.symbol}</span>
            </CardTitle>
            <CardDescription>
              {t(`plans.${planData.id}`)} • {planData.apy}% / {t('stakingCard.monthly')}
            </CardDescription>
          </div>
          
          {/* Logic hiển thị nút/badge đã được cập nhật */}
          {isPendingClaim && isClaimingId?.toString() === stakingData.id.toString() ? (
            <RainbowButton size={"sm"} className="flex items-center" disabled={true}>
              <span className="flex items-center gap-2">
                <Spinner className="w-4 h-4" />{t('buttons.claiming')}
              </span>
            </RainbowButton>
          ) : showClaimSuccess ? (
            <RainbowButton size={"sm"} className="flex items-center">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />{t('buttons.claimSuccess')}
              </span>
            </RainbowButton>
          ) : canClaim ? (
            <RainbowButton
              size={"sm"}
              className="cursor-pointer" 
              onClick={handleLocalClaim}
              disabled={isPendingClaim}
            >
              <span>{t('buttons.claimRewards')}</span>
            </RainbowButton>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="flex items-center gap-1 border border-foreground/20">
                    <Clock className="h-3 w-3" />
                    {timeUntilClaim}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('stakingCard.remaining')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardHeader>
    
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{t('stakingCard.stakedAmount')}</p>
            <p className="font-medium">
            ${usdtAmountInUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            <p className="text-sm text-muted-foreground">≈  {Number(amountInEth.toFixed(6)).toString()} {tokenData.symbol}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground mb-1">{t('stakingCard.claimedAmount')}</p>
            <p className="font-medium">
            ${totalClaimedInUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
            {/* <p className="text-sm text-muted-foreground"> {claimedBreakdown.stakeToken.amount.toFixed(4)} {tokenData.symbol} + {claimedBreakdown.azcToken.amount.toFixed(2)} AZC</p> */}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('stakingCard.progressTo400')}</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {t('stakingCard.remainingMaxout')}: 
            ${remainingUsd.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </p>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between cursor-pointer" size="sm">
              {t('stakingCard.rewardDistribution')}
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4">
            <Separator className="my-2" />

            {/* Next Reward Preview hoặc Expected Reward */}
            <div className="rounded-lg bg-accent/50 p-3 space-y-3">
              <h4 className="text-sm font-medium">
                {canClaim 
                  ? `${t('stakingCard.expectedRewards')} (${expectedReward.days} ${t('stakingCard.days')})` 
                  : t('stakingCard.nextReward')}
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      <Image src={tokenData.icon} alt={tokenData.symbol} width={32} height={32} />
                    </div>
                    <span className="text-sm">{tokenData.symbol} (70%)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {canClaim 
                        ? Number(expectedReward.stakeToken.amount.toFixed(4).toString())
                        : Number(dailyReward.stakeToken.amount.toFixed(4).toString())} {tokenData.symbol}
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      <Image src="/images/tokens/azc.webp" alt="AZC" width={32} height={32} />
                    </div>
                    <span className="text-sm">AZC (30%)</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {canClaim 
                        ? Number(expectedReward.azcToken.amount.toFixed(4)).toString()
                        : Number(dailyReward.azcToken.amount.toFixed(4)).toString()} AZC
                    </div>
                  </div>
                </div>
                
                {canClaim && reservedTime > 0 && (
                  <div className="mt-2 text-xs text-muted-foreground border-t pt-2 border-foreground/10">
                    <p>{t('stakingCard.reservedTime')}: {Math.floor(reservedTime)} {t('stakingCard.hours')} {Math.round((reservedTime % 1) * 60)} {t('stakingCard.minutes')}</p>
                    <p>{t('stakingCard.nextClaim')}</p>
                  </div>
                )}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t('stakingCard.rewardsNote', { apy: planData.apy })}
              </AlertDescription>
            </Alert>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

export default function MyStaking() {
  const t = useTranslations('MyStakePage')
  // const account = useActiveAccount();
  const { account } = useWalletStore()
  const { mutate: claimReward, isPending: isPendingClaim, isSuccess: isSuccessClaim, isError: isErrorClaim } = useSendTransaction({payModal: false});
  // Sử dụng hook useTokenData
  const tokenPrices = useTokenData();
  const [claimingStakeId, setClaimingStakeId] = useState<bigint | null>(null);
  const [lastClaimTimes, setLastClaimTimes] = useState<Record<string, number>>(() => {
    // Khôi phục lastClaimTimes từ localStorage khi component mount
    if (typeof window !== 'undefined') {
      const savedData = localStorage.getItem('lastClaimTimes');
      if (savedData) {
        try {
          return JSON.parse(savedData);
        } catch (e) {
          console.error('Error parsing lastClaimTimes from localStorage:', e);
          return {};
        }
      }
    }
    return {};
  });
  
  const contractData = useDataStakingContract();
  const contractClaim = useClaimContract();

  const { data: userStakes, isLoading: isLoadingUserStakes, error: userStakesError } = getUserStakes(contractData, account?.address as string);
  // console.log(userStakes);
  const [filter, setFilter] = useState("all");
  
  // Đồng bộ thông tin claim từ userStakes khi có dữ liệu mới từ blockchain
  useEffect(() => {
    if (userStakes && userStakes.length > 0) {
      let hasUpdates = false;
      const updatedTimes = { ...lastClaimTimes };
      
      userStakes.forEach(stake => {
        const stakeId = stake.id.toString();
        const blockchainTime = Number(stake.lastClaimTime);
        const cachedTime = lastClaimTimes[stakeId] || 0;
        
        // Nếu thời gian từ blockchain mới hơn thời gian lưu trong cache
        if (blockchainTime > cachedTime) {
          updatedTimes[stakeId] = blockchainTime;
          hasUpdates = true;
        }
      });
      
      if (hasUpdates) {
        setLastClaimTimes(updatedTimes);
      }
    }
  }, [userStakes, lastClaimTimes]);

  // Lưu lastClaimTimes vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('lastClaimTimes', JSON.stringify(lastClaimTimes));
    }
  }, [lastClaimTimes]);
  
  // Sửa effect để không reset claimingStakeId ngay khi thành công
  useEffect(() => {
    if (isErrorClaim && claimingStakeId) {
      // Reset immediately on error
      setClaimingStakeId(null);
    }
    
    if (isSuccessClaim && claimingStakeId) {
       // Lưu thời gian claim gần nhất cho stake này
       setLastClaimTimes(prev => ({
        ...prev,
        [claimingStakeId.toString()]: Math.floor(Date.now() / 1000)
      }));

      // Đối với success, sẽ reset sau khi "Claim Success" đã hiển thị đủ thời gian
      const timer = setTimeout(() => {
        setClaimingStakeId(null);
      }, 3500); // Hơi lâu hơn thời gian hiển thị "Claim Success" để tránh nhảy trạng thái
      
      return () => clearTimeout(timer);
    }
  }, [isSuccessClaim, isErrorClaim, claimingStakeId]);

  const handleClaim = useCallback(async (stakeId: bigint) => {
    // console.log('claim', stakeId)
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    
    // Lưu stakeId đang được claim
    setClaimingStakeId(stakeId);

    const claimTx = prepareContractCall({
      contract: contractClaim,
      method: "function claimStake(uint256 stakeId)",
      params: [stakeId],
    });

    try {
      claimReward(claimTx);
      // Cập nhật thời gian claim là xử lý trong effect
    } catch (error) {
      // Nếu có lỗi, cũng reset claimingStakeId
      setClaimingStakeId(null);
      console.error("Claim error:", error);
    }
  }, [account, contractClaim, claimReward]);

  // Get user data from blockchain
  const {
    data: userData,
    isLoading: isLoadingUserData,
    
  } = useReadContract({
    contract: contractData,
    method:
      "function users(address _user) view returns (uint256 totalStaked, uint256 totalMaxOut, uint256 totalEarned)",
    params: [account?.address as string]
  });

  // Filter stakes based on claim status
  const filteredStakes = userStakes ? userStakes.filter((stake) => {
    // Ưu tiên sử dụng thời gian từ localStorage (nếu có) thay vì dữ liệu blockchain
    const lastClaimTimeFromCache = lastClaimTimes[stake.id.toString()];
    const lastClaimTimestamp = lastClaimTimeFromCache 
      ? lastClaimTimeFromCache * 1000 
      : Number(stake.lastClaimTime) * 1000;
    
    const now = Date.now();
    const canClaim = now - lastClaimTimestamp >= 24 * 60 * 60 * 1000;

    if (filter === "claimable") return canClaim;
    if (filter === "not-claimable") return !canClaim;
    return true;
  }) : [];

  // Loading state
  const isLoading = isLoadingUserData || isLoadingUserStakes || tokenPrices.loading;
  
// Thêm hàm này vào component MyStaking
const calculateTotalClaimed = () => {
  if (!userStakes || userStakes.length === 0) return 0;
  
  return userStakes.reduce((total, stake) => {
    // Tính toán giá trị claimed cho stake này - không cần nhân với giá token nữa
    const totalClaimedInUsd = Number(stake.totalClaimed) / 1e18;
    
    return total + totalClaimedInUsd;
  }, 0);
};

// Thêm hàm tính tổng maxOutRemaining
const calculateTotalMaxOutRemaining = () => {
  if (!userStakes || userStakes.length === 0) return 0;
  
  return userStakes.reduce((total, stake) => {
    const usdtAmountInUsd = Number(stake.usdtAmount) / 1e18;
    const totalClaimedInUsd = Number(stake.totalClaimed) / 1e18;
    const maxPayout = usdtAmountInUsd * 4;
    const remainingUsd = Math.max(0, maxPayout - totalClaimedInUsd);
    
    return total + remainingUsd;
  }, 0);
};

// Sau đó sử dụng hàm này để hiển thị tổng
const totalClaimedFromStakes = calculateTotalClaimed();
const totalMaxOutRemaining = calculateTotalMaxOutRemaining();
  if (isLoading) {
    return (
      <div className="min-h-screen ">
        <div className="container mx-auto px-4 py-8 max-w-8xl">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
              <p className="text-muted-foreground">{t('description')}</p>
            </div>
          </div>
          <Card className="mb-8 bg-primary/5">
            <CardContent className="">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('summary.totalStakedValue')}</p>
                  <Skeleton className="w-[100px] h-[32px] " />
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{t('summary.totalClaimedValue')}</p>
                  <Skeleton className="w-[100px] h-[32px] " />
                </div>
                <div className="space-y-2">
                  <div className="flex space-2"> <p className="text-sm text-muted-foreground">{t('summary.maxOutRemaining')}</p></div>
                  <Skeleton className="w-[100px] h-[32px] " />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (userStakesError) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-8xl">
          <div className="flex justify-between items-center mb-8">
            <div className="text-left">
              <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
              <p className="text-muted-foreground">{t('errors.loading')}</p>
            </div>
          </div>
          <Card className="bg-primary/5">
            <CardContent className="py-8 text-center">
              {!account ? <p>{t('errors.connectWallet')}</p> : 
                <p>{t('errors.loadingError')}</p>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        {/* ================ TITLE ================ */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t('title')}</h1>
            <p className="text-muted-foreground">{t('description')}</p>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="mb-8 bg-primary/5">
          <CardContent className="">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ================ TOTAL STAKED VALUE ================ */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('summary.totalStakedValue')}</p>
                <p className="text-2xl font-bold">${userData ? formatTokenAmount(userData[0]) : '0.00'}</p>
              </div>
              {/* ================ TOTAL STAKED VALUE ================ */}
              {/* ================ TOTAL CLAIMED VALUE ================ */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{t('summary.totalClaimedValue')}</p>
                <p className="text-2xl font-bold"> ${totalClaimedFromStakes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
              </div>
              {/* ================ TOTAL CLAIMED VALUE ================ */}
              {/* ================ MAX OUT REMAINING ================ */}
              <div className="space-y-2">
                <div className="flex space-2"> <p className="text-sm text-muted-foreground">{t('summary.maxOutRemaining')}</p></div>
                <p className="text-2xl font-bold">
                  {userData?.[1] === 99999000000000000000000n ? 'Unlimited' : `$${totalMaxOutRemaining.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
                  {userData?.[1] === 99999000000000000000000n ?
                  <Badge variant="outline" className="ml-2 dark:bg-green-900 dark:text-green-400 border border-gray-500/20">{t('summary.leaderBadge')}</Badge> : ""}
                </p>
              </div>
              {/* ================ MAX OUT REMAINING ================ */}
            </div>
          </CardContent>
        </Card>

        {/* Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6  ">
          <Tabs defaultValue="all" value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="w-full sm:w-auto bg-card">
              <TabsTrigger className="cursor-pointer" value="all">{t('filters.all')} ({userStakes ? userStakes.length : 0})</TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="claimable">{t('filters.claimable')}</TabsTrigger>
              <TabsTrigger className="cursor-pointer" value="not-claimable">{t('filters.notClaimable')}</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Staking List */}
        <div className={`grid gap-6 ${filteredStakes.length >= 3 ? 'md:grid-cols-3' : filteredStakes.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-2'}`}>
          {filteredStakes && filteredStakes.length > 0 ? (
            filteredStakes.map((stake) => (
              <StakingCard 
                key={String(stake.id)} 
                stakingData={stake} 
                onClaim={handleClaim}
                isPendingClaim={isPendingClaim && claimingStakeId?.toString() === stake.id.toString()}
                isClaimingId={claimingStakeId}
                isSuccessClaim={isSuccessClaim}
                isErrorClaim={isErrorClaim}
                tokenPrices={tokenPrices}
                lastClaimTime={lastClaimTimes[stake.id.toString()] || Number(stake.lastClaimTime)}
              />
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                {userStakes && userStakes.length > 0
                  ? t('errors.noMatchingStakes')
                  : t('errors.noStakes')}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}