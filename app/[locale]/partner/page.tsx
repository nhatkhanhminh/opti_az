"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Wallet,
  BarChart3,
  Copy,
  Crown,
  Award,
  Shield,
  Star,
  Medal,
  Link2,
  X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Check } from "lucide-react";
import { useSendTransaction } from "thirdweb/react";
import { ContractOptions,  prepareContractCall } from "thirdweb";
import { bsc } from "thirdweb/chains";
import { client } from "@/lib/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Account } from "thirdweb/wallets";
import { shortenWalletAddress } from "@/lib/shortAddress";
import { formatTokenAmount } from "@/lib/convertNumber";
import useWalletStore from "@/store/userWalletStore";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useWalletBalance } from "thirdweb/react";
import DownlineNetworkTable from "@/components/Downline-network";
import Spinner from "@/components/Spiner";
import { useDataStakingContract} from "@/hooks/useContract";
import { useMemberContract } from "@/hooks/useContract";
import { useCalculateTotalCommission, useGetDirectDownlines, useGetTeamVolume, useGetUpline } from "@/ultis/getMemberContract";
import { getUserInfoStaked } from "@/ultis/useStakeInfo";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { useReferralLink } from "@/hooks/use-window-size";

const leaderLevels = [
  {
    level: 1,
    name: "Silver Leader",
    icon: Shield,
    f1Requirement: 3000,
    networkRequirement: 30000,
    bonus: 3,
    color: "text-gray-400 dark:text-gray-500",
  },
  {
    level: 2,
    name: "Gold Leader",
    icon: Medal,
    f1Requirement: 5000,
    networkRequirement: 100000,
    bonus: 5,
    color: "text-slate-400",
  },
  {
    level: 3,
    name: "Platinum Leader",
    icon: Star,
    f1Requirement: 10000,
    networkRequirement: 200000,
    bonus: 7,
    color: "text-yellow-500",
  },
  {
    level: 4,
    name: "Diamond Leader",
    icon: Award,
    f1Requirement: 15000,
    networkRequirement: 350000,
    bonus: 9,
    color: "text-sky-400",
  },
  {
    level: 5,
    name: "Royal Leader",
    icon: Crown,
    f1Requirement: 20000,
    networkRequirement: 500000,
    bonus: 11,
    color: "text-violet-500",
  },
];


// Calculate current leader level based on volumes
function calculateLeaderLevel(f1Volume: number, networkVolume: number) {

  for (let i = leaderLevels.length - 1; i >= 0; i--) {
    if (
      f1Volume >= leaderLevels[i].f1Requirement &&
      networkVolume >= leaderLevels[i].networkRequirement
    ) {
      return leaderLevels[i];
    }
  }
  return null;
}

// Calculate progress to next level
function calculateNextLevel(f1Volume: number, networkVolume: number) {
  const currentLevel = calculateLeaderLevel(f1Volume, networkVolume);
  const currentIndex = currentLevel
    ? leaderLevels.findIndex((l) => l.level === currentLevel.level)
    : -1;

  if (currentIndex < leaderLevels.length - 1) {
    const nextLevel = leaderLevels[currentIndex + 1];
    return {
      level: nextLevel,
      f1Progress: (f1Volume / nextLevel.f1Requirement) * 100,
      networkProgress: (networkVolume / nextLevel.networkRequirement) * 100,
    };
  }
  return null;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  trendValue,
  isLoading = false,
}: {
  title: string;
  value: string | number;
  description?: string;
  icon: any;
  trend?: "up" | "down";
  trendValue?: number;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-2" />
            {description && <Skeleton className="h-4 w-32" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">${value}</div>
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            {trend && trendValue && (
              <div
                className={`flex items-center text-xs mt-1 ${
                  trend === "up" ? "text-green-500" : "text-red-500"
                }`}
              >
                {trend === "up" ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                {trendValue}% from last month
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function LeaderLevelCard({
  f1Volume,
  networkVolume,
}: {
  f1Volume: number;
  networkVolume: number;
}) {
  const t = useTranslations();
  const currentLevel = calculateLeaderLevel(f1Volume, networkVolume);
  const nextLevelProgress = calculateNextLevel(f1Volume, networkVolume);
  const Icon = currentLevel?.icon || Shield;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('PartnerPage.leaderPerformance.title')}</CardTitle>
        <CardDescription>
          {t('PartnerPage.leaderPerformance.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentLevel ? (
          <>
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-full bg-accent ${currentLevel.color}`}
              >
                <Icon className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-bold">{currentLevel.name}</h3>
                <p className="text-sm text-muted-foreground">
                {t('PartnerPage.leaderPerformance.level')} {currentLevel.level} • {t('PartnerPage.leaderPerformance.bonus')} {currentLevel.bonus}%
                </p>
              </div>
            </div>

            {nextLevelProgress && (
              <div className="space-y-3">
                <div className="border-t border-accent-foreground/20 " />
                {/* <Separator /> */}
                <p className="text-sm font-medium">
                {t('PartnerPage.leaderPerformance.nextLevel', {level: nextLevelProgress.level.name})} 
                </p>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('PartnerPage.leaderPerformance.f1VolumeProgress')}
                      </span>
                      <span>{Math.min(nextLevelProgress.f1Progress, 100).toFixed(1)}%</span>
                    </div>
                    <Progress
                      value={Math.min(nextLevelProgress.f1Progress, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      ${f1Volume.toFixed(2)} / $
                      {nextLevelProgress.level.f1Requirement.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t('PartnerPage.leaderPerformance.networkVolumeProgress')}
                      </span>
                      <span>
                        {Math.min(nextLevelProgress.networkProgress, 100).toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={Math.min(nextLevelProgress.networkProgress, 100)}
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      ${networkVolume.toFixed(2)} / $
                      {nextLevelProgress.level.networkRequirement.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground">
            <p className="mb-4 text-sm">{t('PartnerPage.leaderPerformance.reachSilver')}</p>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('PartnerPage.leaderPerformance.f1VolumeProgress')}</span>
                  <span>{Math.min(((f1Volume / 3000) * 100), 100).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(((f1Volume / 3000) * 100), 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  ${f1Volume.toFixed(2)} / $3,000
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t('PartnerPage.leaderPerformance.networkVolumeProgress')}</span>
                  <span>{Math.min(((networkVolume / 30000) * 100), 100).toFixed(1)}%</span>
                </div>
                <Progress value={Math.min(((networkVolume / 30000) * 100), 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  ${networkVolume.toFixed(2)} / $30,000
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReferralLinkCard({ account }: { account: Account | undefined }) {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  // Sử dụng custom hook để get referral link với domain động
  const referralLink = useReferralLink(account?.address);
  const displayLink = referralLink || "Connect wallet to create referral link";

  const handleCopy = () => {
    if (!account?.address || !referralLink) return;

    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('PartnerPage.referralLink.title')}</CardTitle>
        <CardDescription>
          {t('PartnerPage.referralLink.description')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            value={displayLink}
            readOnly
            className={`font-mono text-sm ${
              !account?.address ? "text-muted-foreground italic" : ""
            }`}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className={`${copied ? "text-green-500" : ""} cursor-pointer`}
                  disabled={!account?.address}
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {copied
                    ? "copied!"
                    : account?.address
                    ? "copy link"
                    : "connect wallet to create referral link"}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}


function UplineCard({
  upline,
  isPending,
  account,
  memberContract,
  referrer,
}: {
  upline: string | undefined;
  isPending: boolean;
  account: Account | undefined;
  memberContract: ContractOptions<[], `0x${string}`>;
  referrer: string | null;
}) {
  // Hàm kiểm tra upline có hợp lệ không
  const isValidUpline = (address?: string) => {
    return address && address !== "0x0000000000000000000000000000000000000000";
  };

  const {
    mutate: sendTransaction,
    isPending: isPendingSendTransaction,
    isSuccess: isSuccessSendTransaction,
    isError: isErrorSendTransaction,
  } = useSendTransaction();
  
  const { data: balance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client: client,
  });

  const onClick = () => {
    if (account?.address === referrer) {
      return toast.error("Can't set yourself as upline");
    }

    // Kiểm tra số dư BNB
    if (!balance?.displayValue || parseFloat(balance.displayValue) < 0.0001) {
      return toast.error("Insufficient BNB balance", {
        description: "You need some BNB to add upline",
      });
    }

    const addUpline = prepareContractCall({
      contract: memberContract,
      method: "function registerMember(address upline)",
      params: [referrer as string],
    });
    sendTransaction(addUpline);
  };

  // Thêm useEffect để theo dõi trạng thái giao dịch
  useEffect(() => {
    const updateReferralInDatabase = async () => {
      if (isSuccessSendTransaction && account?.address && referrer) {
        try {
          const response = await fetch("/api/ref/update-ref", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userAddress: account.address,
              referrerAddress: referrer,
            }),
          });

          const data = await response.json();
          if (data.success) {
            toast.success("Referral updated");
          } else {
            console.error("Failed to update referral in database");
          }
        } catch (error) {
          console.error("Error updating referral in database:", error);
        
        }
      }
    };

    updateReferralInDatabase();
  }, [isSuccessSendTransaction, account?.address, referrer]);
  const t = useTranslations();
  const getDisplayContent = () => {
    if (isPending) {
      return (
        <>
          <Skeleton className="w-25 h-4 mb-2" />
          <Skeleton className="w-25 h-4" />
        </>
      );
    }

    if (isValidUpline(upline?.toString())) {
      return (
        <>
          <div className="font-medium">
            {shortenWalletAddress(upline!.toString())}
          </div>
          <div className="text-sm text-muted-foreground truncate max-w-[200px] hover:text-primary cursor-pointer">
            <Link
              href={`https://bscscan.com/address/${upline!.toString()}`}
              target="_blank"
            >
              {t('PartnerPage.upline.viewOnBscScan')}
            </Link>
          </div>
        </>
      );
    }

    return (
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">
          {shortenWalletAddress(referrer as string) || "No upline"}
        </div>
        {referrer && (
          <Button
            className="cursor-pointer"
            variant={
              isSuccessSendTransaction
                ? "secondary"
                : isErrorSendTransaction
                ? "destructive"
                : "outline"
            }
            size="lg"
            onClick={() => onClick()}
            disabled={isPendingSendTransaction || isSuccessSendTransaction}
          >
            {isPendingSendTransaction ? (
              <>
                <Spinner className="h-4 w-4 mr-2" />
                Confirming...
              </>
            ) : isSuccessSendTransaction ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Added Successfully
              </>
            ) : isErrorSendTransaction ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Failed to Add
              </>
            ) : (
              <>
                <Link2 className="h-4 w-4" />
                Add Upline
              </>
            )}
          </Button>
        )}
      </div>
    );
  };

  return (
    
    <Card>
      <CardHeader>
        <CardTitle>{t('PartnerPage.upline.title')}</CardTitle>
        <CardDescription>{t('PartnerPage.upline.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          {/* <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Users2 className="h-4 w-4 text-primary" />
          </div> */}
          <div>{getDisplayContent()}</div>
        </div>
      </CardContent>
    </Card>
  );
}

// const Separator = () => <div className="border-t border-muted-foreground" />;

export default function PartnerDashboard() {
  const t = useTranslations();
  const { referrer, account } = useWalletStore();
  // Thêm state để lưu số lượng tuyến dưới từ database
  const [totalDownlineFromDB, setTotalDownlineFromDB] = useState<number | null>(null);
  const [isLoadingDownlineDB, setIsLoadingDownlineDB] = useState<boolean>(false);
  
  // Thêm state để lưu thông tin volume từ database
  const [volumeFromDB, setVolumeFromDB] = useState<{
    directVolume: number, 
    teamVolume: number, 
    f1Count: number
  } | null>(null);
  const [isLoadingVolumeDB, setIsLoadingVolumeDB] = useState<boolean>(false);

  const dataContract = useDataStakingContract()
  const memberContract = useMemberContract()


  const { data: partnerData, isLoading: isPendingPartner } = useGetUpline(memberContract, account?.address as string)
  const { data: f1Partners, isLoading: isPendingF1Partners } = useGetDirectDownlines(memberContract, account?.address as string)
  const { data: calTotalCommission, isLoading: isPendingcalTotalCommission } = useCalculateTotalCommission(memberContract, account?.address as string)
  const { data: teamVolume, isLoading: isPendingteamVolume } = useGetTeamVolume(memberContract, account?.address as string)
  // const { data: f1Volume, isLoading: isPendingF1Volume } = useGetF1Volume(memberContract, account?.address as string)
  const { data: userInfoStakedValue, isLoading: isPendinguserInfo } = getUserInfoStaked(dataContract, account?.address as string)


useEffect(() => {
  async function fetchDownlineFromDB() {
    if (!account?.address) return;
    
    setIsLoadingDownlineDB(true);
    try {
      const response = await fetch(`/api/user/downline-count?address=${account.address}`);
      if (response.ok) {
        const data = await response.json();
        setTotalDownlineFromDB(data.totalDownlines || 0);
      } else {
        console.error("error fetchDownlineFromDB", await response.text());
      }
    } catch (error) {
      console.error("error fetchDownlineFromDB", error);
    } finally {
      setIsLoadingDownlineDB(false);
    }
  }

  fetchDownlineFromDB();
}, [account?.address]);

// Thêm useEffect để gọi API lấy thông tin user từ database
useEffect(() => {
  async function fetchUserDataFromDB() {
    if (!account?.address) return;
    
    setIsLoadingVolumeDB(true);
    try {
      // Sử dụng API hiện có để lấy toàn bộ thông tin user
      const response = await fetch(`/api/update-blockchain-data?address=${account.address}`);
      if (response.ok) {
        const responseData = await response.json();
        if (responseData.success && responseData.data) {
          // Lấy thông tin directVolume, teamVolume và f1Count từ dữ liệu user
          setVolumeFromDB({
            directVolume: responseData.data.directVolume || 0,
            teamVolume: responseData.data.teamVolume || 0,
            f1Count: responseData.data.f1Count || 0
          });
        }
      } else {
        console.error("error fetchUserDataFromDB", await response.text());
      }
    } catch (error) {
      console.error("error fetchUserDataFromDB", error);
    } finally {
      setIsLoadingVolumeDB(false);
    }
  }

  fetchUserDataFromDB();
}, [account?.address]);


  return (
    <div className="min-h-screen  transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">
            {t('PartnerPage.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('PartnerPage.description')}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3 mb-8">
          <ReferralLinkCard account={account as Account} />
          <UplineCard
            upline={partnerData}
            referrer={referrer}
            isPending={isPendingPartner}
            account={account as Account}
            memberContract={memberContract}
          />
          <Card className="">
            <CardHeader>
              <CardTitle>{t('PartnerPage.maxoutCommission.title')}</CardTitle>
              <CardDescription>
                {t('PartnerPage.maxoutCommission.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 grid-cols-1 ">
                <div className="space-y-2">
                  {isPendinguserInfo ? (
                    <Skeleton className="h-8 w-32" />
                  ) : (
                    <p className="text-2xl font-bold">
                      {userInfoStakedValue?.[1] === 99999000000000000000000n
                        ? t('PartnerPage.maxoutCommission.unlimited')
                        : `$${formatTokenAmount(userInfoStakedValue?.[1] || 0n)}`}
                      {userInfoStakedValue?.[1] === 99999000000000000000000n ? (
                        <Badge
                          variant="outline"
                          className="ml-2 dark:bg-green-900 dark:text-green-400"
                        >
                          {t('PartnerPage.maxoutCommission.leader')}
                        </Badge>
                      ) : (
                        ""
                      )}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            title={t('PartnerPage.stats.totalCommission.title')}
            value={formatTokenAmount(calTotalCommission || 0n)}
            icon={Wallet}
            trend="up"
            isLoading={isPendingcalTotalCommission}
          />
          <StatCard
            title={t('PartnerPage.stats.f1Commission.title')}
            value={
              volumeFromDB?.directVolume 
                ? (volumeFromDB.directVolume * 0.06).toFixed(2) 
                : "0"
            }
            // description={t('PartnerPage.stats.f1Commission.description', { count: volumeFromDB?.f1Count || 0 })}
            icon={Users}
            isLoading={isLoadingVolumeDB}
          />
          <StatCard
            title={t('PartnerPage.stats.systemVolume.title')}
            value={volumeFromDB?.teamVolume ? volumeFromDB.teamVolume.toFixed(2) : formatTokenAmount(teamVolume || 0n)}
            icon={BarChart3}
            trend="up"
            isLoading={isLoadingVolumeDB && isPendingteamVolume}
          />
          <StatCard
            title={t('PartnerPage.stats.f1Volume.title')}
            value={
              volumeFromDB?.directVolume 
                ? volumeFromDB.directVolume.toFixed(2) 
                : "0"
            }
            icon={TrendingUp}
            trend="up"
            isLoading={isLoadingVolumeDB}
          />
        </div>

        {/* Leader Level and Growth Charts */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <div className="">
            <LeaderLevelCard 
              f1Volume={volumeFromDB?.directVolume || 0} 
              networkVolume={volumeFromDB?.teamVolume || 0} 
            />
          </div>
          <Card className="">
            <CardHeader>
              <CardTitle>{t('PartnerPage.levelDistribution.title')}</CardTitle>
              <CardDescription>
                {t('PartnerPage.levelDistribution.description')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('PartnerPage.levelDistribution.f1Partners')}</span>
                  <span className="font-bold">
                    {isPendingF1Partners ? (
                      <Skeleton className="w-8 h-4" />
                    ) : (
                      f1Partners?.length
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('PartnerPage.levelDistribution.totalNetwork')}</span>
                  <span className="font-bold">
                    {isLoadingDownlineDB ? (
                      <Skeleton className="w-8 h-4" />
                    ) : totalDownlineFromDB !== null ? (
                      totalDownlineFromDB
                    ) : (
                      <Skeleton className="w-8 h-4" />
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">{t('PartnerPage.levelDistribution.averageLevel')}</span>
                  <span className="font-bold">0</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <DownlineNetworkTable userAddress={account?.address} />
      </div>
    </div>
  );
}
