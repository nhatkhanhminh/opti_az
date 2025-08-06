"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, Users, DollarSign, ArrowUpRight, Copy, Check, ChevronRight, ChevronLeft, BatteryFull  } from "lucide-react"
import Link from "next/link"
import { Account } from "thirdweb/wallets"
import { client } from "@/lib/client"
import {  bsc } from "thirdweb/chains"
import { DATASTAKING } from "@/Context/listaddress"
import { getContract } from "thirdweb"
import { formatTokenAmount } from "@/lib/convertNumber"
import { tokenTypes } from "@/Context/token"
import { useGetUserStakeTotal } from "@/ultis/useGetUserStakeTotal"
import { Skeleton } from "@/components/ui/skeleton"
import useWalletStore from "@/store/userWalletStore"
import { getUserStakes } from "@/ultis/useStakeInfo"
import { useTranslations } from "next-intl"
import { useReferralLink } from "@/hooks/use-window-size"

const newsItems = [
  {
    id: 1,
    title: "swapFeature.title",
    description: "swapFeature.description",
    date: "swapFeature.date",
  },
  {
    id: 2,
    title: "stakingPlans.title",
    description: "stakingPlans.description",
    date: "stakingPlans.date",
  },
  {
    id: 3,
    title: "securityUpdate.title",
    description: "securityUpdate.description",
    date: "securityUpdate.date",
  },
]

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  className,
  loading,
}: {
  title: string
  value: string | number
  description?: string
  icon: any
  trend?: "up" | "down"
  trendValue?: number
  className?: string
  loading?: boolean
}) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
            {loading ? <Skeleton className="w-16 h-8" /> : `$${value}`}
        </div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && trendValue && (
          <div className={`flex items-center text-xs mt-1 ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            <ArrowUpRight className="h-4 w-4" />
            {trendValue}% from last month
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function ReferralCard({ account }: { account: Account | undefined }) {
  const t = useTranslations('DashboardPage.quickActions')
  const [copied, setCopied] = useState(false)
  
  // Sử dụng custom hook để get referral link với domain động
  const referralLink = useReferralLink(account?.address)

  const handleCopy = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <Button className="flex-1" asChild>
            <Link href="/staking">
              {t('stake')}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                {t('copied')}
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                {t('referralLink')}
              </>
            )}
          </Button>
        </div>
        <Alert>
          <AlertDescription className="text-sm">
            {t('referralAlert')}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

function NewsSlider() {
  const t = useTranslations('DashboardPage.latestUpdates')
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % newsItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('title')}</CardTitle>
        <CardDescription>{t('description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {newsItems.map((item) => (
                <div key={item.id} className="w-full flex-shrink-0 space-y-2">
                  <div>
                    <h3 className="font-semibold">{t(`news.${item.title}`)}</h3>
                    <p className="text-sm text-muted-foreground">{(t(`news.${item.date}`))}</p>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-4">{t(`news.${item.description}`)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <Button variant="outline" size="icon" className="rounded-full cursor-pointer" onClick={prevSlide}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              {newsItems.map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-primary/20"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="rounded-full" onClick={nextSlide}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const t = useTranslations('DashboardPage')
  const {  account } = useWalletStore()
  const [userDataFromDB, setUserDataFromDB] = useState<{
    directVolume: number, 
    teamVolume: number,
    f1Count: number
  } | null>(null);
  const [isLoadingUserDB, setIsLoadingUserDB] = useState<boolean>(false);

  const dataContract = getContract({
    address: DATASTAKING,
    chain: bsc,
    client: client,
  });

  const { data: userInfoStakedValue, isLoading: isPendinguserInfo } = useGetUserStakeTotal(dataContract, account?.address as string)
  const { data: userStakes, isLoading: isPendingUserStakes } = getUserStakes(dataContract, account?.address as string)

  useEffect(() => {
    async function fetchUserDataFromDB() {
      if (!account?.address) return;
      
      setIsLoadingUserDB(true);
      try {
        const response = await fetch(`/api/update-blockchain-data?address=${account.address}`);
        if (response.ok) {
          const responseData = await response.json();
          if (responseData.success && responseData.data) {
            setUserDataFromDB({
              directVolume: responseData.data.directVolume || 0,
              teamVolume: responseData.data.teamVolume || 0,
              f1Count: responseData.data.f1Count || 0
            });
          }
        } else {
          console.error("error get user data:", await response.text());
        }
      } catch (error) {
        console.error("rror get user data:", error);
      } finally {
        setIsLoadingUserDB(false);
      }
    }

    fetchUserDataFromDB();
  }, [account?.address]);

  const calculateTotalClaimed = () => {
    if (!userStakes || userStakes.length === 0) return 0;
    
    return userStakes.reduce((total, stake) => {
      const matchingToken = tokenTypes.find(token => 
        token.tokenAddress.toLowerCase() === stake.token.toLowerCase()
      );
      
      const tokenData = matchingToken ? {
        price: 1
      } : { price: 0 };
      
      const totalClaimedInEth = Number(stake.totalClaimed) / 1e18;
      const totalClaimedInUsd = totalClaimedInEth * tokenData.price;
      
      return total + totalClaimedInUsd;
    }, 0);
  };

  const totalClaimedFromStakes = calculateTotalClaimed();
  
  return (
    <div className="min-h-screen ">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t('title')}</h1>
          <p className="text-muted-foreground">{t('description')}</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title={t('stats.totalValueStaked')}
            loading={isPendinguserInfo}
            value={userInfoStakedValue ? formatTokenAmount(userInfoStakedValue[0]) : 0}
            icon={Wallet}
          />
          <StatCard
            title={t('stats.totalEarnings')}
            loading={isPendingUserStakes}
            value={totalClaimedFromStakes.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            icon={DollarSign}
            description={t('stats.earnedFromStaking')}
          />
          <StatCard
            loading={isPendinguserInfo}
            title={t('stats.maxOut')}
            value={formatTokenAmount(userInfoStakedValue?.[1] ?? 0)}
            icon={BatteryFull}
          />
          <StatCard
            loading={isLoadingUserDB}
            title={t('stats.f1Volume')}
            value={userDataFromDB ? userDataFromDB.directVolume.toFixed(2) : 0}
            icon={Users}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <NewsSlider />
          <ReferralCard account={account as Account} />
        </div>

      </div>
    </div>
  )
}