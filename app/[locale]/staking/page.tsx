"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calculator, DollarSign, Lock, Percent, Wallet } from "lucide-react";
import { prepareContractCall, getContract, readContract } from "thirdweb";
import { Skeleton } from "@/components/ui/skeleton";
import { StakeSuccessModal } from "@/components/successModal";
import { useTokenData } from "@/components/hooks/useTokenData";
import Image from "next/image";
import { useSendTransaction, useWalletBalance } from "thirdweb/react";
import { bsc } from "thirdweb/chains";
import { client } from "@/lib/client";
import { STAKING, USDC, FIL, LINK, USDT } from "@/Context/listaddress";
import { approve } from "thirdweb/extensions/erc20";
import { toast } from "sonner";
import { tokenTypes, TokenType } from "@/Context/token";
import { stakingPlans } from "@/Context/stakingPlans";
import useWalletStore from "@/store/userWalletStore";
import { shortenWalletAddress } from "@/lib/shortAddress";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { motion } from "framer-motion";
import Spinner from "@/components/Spiner";
import { useMemberContract, useStakingContract } from "@/hooks/useContract";
import { useGetUpline } from "@/ultis/getMemberContract";
import { useTranslations } from "next-intl";

export default function TokenStaking() {
  const t = useTranslations("StakingPage");
  // const account = useActiveAccount()
  const { referrer, account } = useWalletStore();

  const {
    mutate: sendTransactionApprove,
    isPending: isPendingApprove,
    isSuccess: isSuccessApprove,
    isError: isErrorApprove,
  } = useSendTransaction({ payModal: false });
  const {
    mutate: sendTransactionStake,
    isPending: isPendingStake,
    isSuccess: isSuccessStake,
    data: dataStake,
    isError: isErrorStake,
  } = useSendTransaction({ payModal: false });
  const {
    mutate: sendTransactionAddUpline,
    isPending: isPendingAddUpline,
    isSuccess: isSuccessAddUpline,
    isError: isErrorAddUpline,
  } = useSendTransaction({ payModal: false });

  const [selectedToken, setSelectedToken] = useState(tokenTypes[0].id);
  const [selectedPlan, setSelectedPlan] = useState(stakingPlans[0].id);
  const [amount, setAmount] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { prices, loading } = useTokenData();
  const [partnerData, setPartnerData] = useState<string | null>(null);
  const [hasStakingError, setHasStakingError] = useState(false);
  const [hasAttemptedStakeAfterApprove, setHasAttemptedStakeAfterApprove] =
    useState(false);
  const [currentAllowance, setCurrentAllowance] = useState<bigint>(0n);
  const [isPreparingStake, setIsPreparingStake] = useState(false);
  const [isWaitingForAllowanceUpdate, setIsWaitingForAllowanceUpdate] =
    useState(false);
  const [hasCompletedStake, setHasCompletedStake] = useState(false);

  // Wallet balances
  const { data: BNBBalance, isLoading: BNBBalanceLoading, refetch: refetchBNBBalance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client,
  });
  const { data: FILBalance, isLoading: FILBalanceLoading, refetch: refetchFILBalance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client,
    tokenAddress: FIL,
  });
  const { data: LINKBalance, isLoading: LINKBalanceLoading, refetch: refetchLINKBalance } = useWalletBalance(
    { chain: bsc, address: account?.address, client, tokenAddress: LINK }
  );
  const { data: USDTBalance, isLoading: USDTBalanceLoading, refetch: refetchUSDTBalance } = useWalletBalance(
    { chain: bsc, address: account?.address, client, tokenAddress: USDT }
  );

  // Function to refetch all balances
  const refetchAllBalances = useCallback(() => {
    refetchBNBBalance();
    refetchFILBalance();
    refetchLINKBalance();
    refetchUSDTBalance();
  }, [refetchBNBBalance, refetchFILBalance, refetchLINKBalance, refetchUSDTBalance]);

  // Contracts
  const memberContract = useMemberContract();
  const stakingContract = useStakingContract();
  const { data: partnerDataUpline, isLoading: isLoadingUpline } = useGetUpline(
    memberContract,
    account?.address as string
  );

  useEffect(() => {
    if (partnerDataUpline) setPartnerData(partnerDataUpline as string);
  }, [partnerDataUpline]);

  // Token and plan
  const token = tokenTypes.find((t) => t.id === selectedToken);
  const plan = stakingPlans.find((p) => p.id === selectedPlan);
  const isBNB = useMemo(() => token?.symbol === "BNB", [token]);

  // ========== ALLOWANCE CHECKING FUNCTIONALITY ==========

  // Function to check current allowance
  const checkAllowance = useCallback(async () => {
    if (!account?.address || !token || isBNB) {
      setCurrentAllowance(BigInt(Number.MAX_SAFE_INTEGER));
      return BigInt(Number.MAX_SAFE_INTEGER);
    }

    try {
      const tokenContract = getContract({
        client,
        chain: bsc,
        address: token.tokenAddress,
      });

      const allowanceAmount = await readContract({
        contract: tokenContract,
        method:
          "function allowance(address owner, address spender) view returns (uint256)",
        params: [account.address, STAKING],
      });

      setCurrentAllowance(BigInt(allowanceAmount));
      return BigInt(allowanceAmount);
    } catch (error) {
      console.error("Error checking allowance:", error);
      setCurrentAllowance(0n);
      return 0n;
    }
  }, [account?.address, token, isBNB]);

  // Auto check allowance when token or account changes
  useEffect(() => {
    checkAllowance();
  }, [checkAllowance, selectedToken, account?.address]);

  // Function to check if current allowance is sufficient
  const hassufficientAllowance = useCallback(
    (requiredAmount: string) => {
      if (!requiredAmount || isBNB) return true;

      const amountInWei = BigInt(Math.floor(parseFloat(requiredAmount) * 1e18));
      return currentAllowance >= amountInWei;
    },
    [currentAllowance, isBNB]
  );

  // ========== END ALLOWANCE CHECKING ==========

  // Estimated returns
  const [estimatedReturns, setEstimatedReturns] = useState({
    daily: 0,
    monthly: 0,
    yearly: 0,
    total: 0,
    daysToReachCap: 0,
  });
  useEffect(() => {
    if (!amount || !plan) return;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum)) return;

    const dailyRate = plan.apy / 30 / 100;
    const daily = amountNum * dailyRate;
    setEstimatedReturns({
      daily,
      monthly: daily * 30,
      yearly: daily * 365,
      total: amountNum * 4,
      daysToReachCap: Math.ceil((amountNum * 4) / daily),
    });
  }, [amount, plan]);

  // Utility functions //
  const getTokenBalance = useCallback(
    (tokenId: string) => {
      switch (tokenId) {
        case "bnb":
          return BNBBalance?.displayValue || "0";
        case "fil":
          return FILBalance?.displayValue || "0";
        case "link":
          return LINKBalance?.displayValue || "0";
        case "usdt":
          return USDTBalance?.displayValue || "0";
        default:
          return "0";
      }
    },
    [BNBBalance, FILBalance, LINKBalance, USDTBalance]
  );

  const checkBalance = useCallback(
    (tokenId: string, amount: number) => {
      return parseFloat(getTokenBalance(tokenId)) >= amount;
    },
    [getTokenBalance]
  );

  const handleMaxAmount = () => {
    const balance = getTokenBalance(selectedToken);
    const parsedBalance = parseFloat(balance);
    const formattedBalance =
      selectedToken === "usdt"
        ? Math.floor(parsedBalance * 100) / 100 // Làm tròn xuống với 2 chữ số thập phân
        : Math.floor(parsedBalance * 10000) / 10000; // Làm tròn xuống với 4 chữ số thập phân
    setAmount(formattedBalance.toString());
  };

  // Transaction handlers
  const handleAddUpline = useCallback(async () => {
    if (!account?.address || !referrer) return;
    const addUpline = prepareContractCall({
      contract: memberContract,
      method: "function registerMember( address upline)",
      params: [referrer],
    });
    sendTransactionAddUpline(addUpline);
  }, [account, referrer, sendTransactionAddUpline, memberContract]);

  // Thêm useEffect để cập nhật referrer vào database sau khi thêm upline thành công
  useEffect(() => {
    const updateReferralInDatabase = async () => {
      if (isSuccessAddUpline && account?.address && referrer) {
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
          if (!data.success) {
            console.error(
              "Failed to update referral in database:",
              data.message
            );
          }
        } catch (error) {
          console.error("Error updating referral in database:", error);
        }
      }
    };

    updateReferralInDatabase();
  }, [isSuccessAddUpline, account, referrer]);

  const handleApprove = useCallback(async () => {
    if (!account || !token || !amount || isBNB) return;

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !checkBalance(selectedToken, parsedAmount)) {
      toast.error(`Insufficient ${token.symbol} balance`);
      return;
    }

    // Check if we already have sufficient allowance
    if (hassufficientAllowance(amount)) {
      toast.success(`${token.symbol} already approved`);
      return;
    }

    // Reset trạng thái và set đang chờ cập nhật allowance
    setHasAttemptedStakeAfterApprove(false);
    setIsWaitingForAllowanceUpdate(true);

    const tokenContract = getContract({
      address: token.tokenAddress,
      chain: bsc,
      client,
    });

    // Approve the maximum amount instead of just the current amount
    const approveTx = approve({
      contract: tokenContract,
      spender: STAKING,
      amount: Number.MAX_SAFE_INTEGER, // Approve maximum amount (uint256.max)
    });

    sendTransactionApprove(approveTx);
  }, [
    account,
    token,
    amount,
    isBNB,
    selectedToken,
    checkBalance,
    hassufficientAllowance,
    sendTransactionApprove,
  ]);

  // Update allowance after successful approve
  useEffect(() => {
    if (isSuccessApprove) {
      // Wait a bit for blockchain to confirm then refresh allowance
      const timer = setTimeout(() => {
        checkAllowance();
        setIsWaitingForAllowanceUpdate(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isSuccessApprove, checkAllowance]);

  const handleStake = useCallback(async () => {
    if (!account || !amount || !token || !plan) {
      toast.error("Please connect wallet and fill all fields");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || !checkBalance(selectedToken, parsedAmount)) {
      toast.error(`Insufficient ${token.symbol} balance`);
      return;
    }

    if (plan.maxAmount !== Infinity && parsedAmount > plan.maxAmount) {
      toast.error(`Maximum amount is $${plan.maxAmount}`);
      return;
    }

    // For non-BNB tokens, check allowance before staking
    if (!isBNB && !hassufficientAllowance(amount)) {
      toast.error(`Please approve ${token.symbol} first`);
      return;
    }

    const planIndex = stakingPlans.findIndex((p) => p.id === plan.id);
    const amountInWei = BigInt(Math.floor(parsedAmount * 1e18));

    if (isBNB) {
      const stakeBNB = prepareContractCall({
        contract: stakingContract,
        method: "function stakeBNB(uint256 planId) payable",
        params: [BigInt(planIndex)],
        value: amountInWei,
      });
      sendTransactionStake(stakeBNB);
    } else {
      const stake = prepareContractCall({
        contract: stakingContract,
        method: "function stake(address token, uint256 amount, uint256 planId)",
        params: [token.tokenAddress, amountInWei, BigInt(planIndex)],
      });
      sendTransactionStake(stake);
    }
  }, [
    account,
    amount,
    token,
    plan,
    selectedToken,
    checkBalance,
    isBNB,
    stakingContract,
    sendTransactionStake,
    hassufficientAllowance,
  ]);

  const tokenPrice = token?.symbol ? prices?.[token.symbol]?.USD || 0 : 0;
  const amountToken = parseFloat(amount || "0") * tokenPrice;
  const totalCap400 = parseFloat(amount || "0") * tokenPrice * 4;
  const isStakeButtonDisabled = useMemo(() => {
    // Check if there's no account
    if (!account) return true;

    // Check if processing a transaction
    if (isPendingAddUpline || isPendingApprove || isPendingStake) return true;

    // Check if amount is not entered or invalid
    if (!amount || isNaN(parseFloat(amount))) return true;

    const parsedAmount = parseFloat(amount);
    const tokenBalance = parseFloat(getTokenBalance(selectedToken));
    const amountInUsdt = parsedAmount * tokenPrice;

    // Check if token balance is 0
    if (tokenBalance === 0) return true;

    if (amountInUsdt < 99) return true

    return false;
  }, [
    account,
    amount,
    selectedToken,
    tokenPrice,
    getTokenBalance,
    isPendingAddUpline,
    isPendingApprove,
    isPendingStake,
  ]);

  // Main action handler
  const handleAction = useCallback(async () => {
    if (!account) {
      toast.error("Please connect your wallet");
      return;
    }
    if (isPendingAddUpline || isPendingApprove || isPendingStake) return;

    // Trường hợp 1: Cần thêm upline
    if (
      partnerData === "0x0000000000000000000000000000000000000000" &&
      referrer &&
      !isSuccessAddUpline
    ) {
      await handleAddUpline();
      return;
    }

    // Trường hợp 2: Kiểm tra allowance cho token không phải BNB
    if (!isBNB) {
      const hasSufficientAllowance = hassufficientAllowance(amount);
      if (!hasSufficientAllowance) {
        await handleApprove();
        return;
      }
    }

    // Trường hợp 3: Stake
    await handleStake();
  }, [
    account,
    isPendingAddUpline,
    isPendingApprove,
    isPendingStake,
    partnerData,
    referrer,
    isSuccessAddUpline,
    isBNB,
    amount,
    hassufficientAllowance,
    handleAddUpline,
    handleApprove,
    handleStake,
  ]);

  // Thay đổi useEffect hiện tại đang xử lý modal
  useEffect(() => {
    console.log('Stake success effect triggered:', { isSuccessStake, dataStake, isPendingStake });
    if (isSuccessStake && !isPendingStake) {
      console.log('Setting hasCompletedStake to true');
      // Set completed stake state to true
      setHasCompletedStake(true);
      
      // Refresh balances immediately after successful stake
      refetchAllBalances();
      
      // Wait a bit then show modal
      const modalTimer = setTimeout(() => {
        console.log('Opening modal');
        setIsDialogOpen(true);
      }, 2000);
    
      // Cleanup to avoid memory leak
      return () => {
        clearTimeout(modalTimer);
      };
    }
  }, [isSuccessStake, isPendingStake, refetchAllBalances]);

  // Simplified auto-stake logic after approve
  useEffect(() => {
    if (
      isSuccessApprove &&
      !isPendingStake &&
      !isSuccessStake &&
      !isErrorStake &&
      hassufficientAllowance(amount)
    ) {
      // Set preparing state to avoid button text flashing
      setIsPreparingStake(true);

      const autoStakeTimer = setTimeout(() => {
        handleStake();
        setIsPreparingStake(false);
      }, 2500); // Increased delay for blockchain confirmation

      return () => {
        clearTimeout(autoStakeTimer);
        setIsPreparingStake(false);
      };
    }
  }, [
    isSuccessApprove,
    isPendingStake,
    isSuccessStake,
    handleStake,
    isErrorStake,
    hassufficientAllowance,
    amount,
  ]);

  // Reset states when token or amount changes
  useEffect(() => {
    setHasAttemptedStakeAfterApprove(false);
    setHasStakingError(false);
    setIsWaitingForAllowanceUpdate(false);
    setHasCompletedStake(false);
    setIsPreparingStake(false);
  }, [selectedToken, amount]);

  // Track staking errors
  useEffect(() => {
    if (isErrorStake) {
      setHasStakingError(true);
      const resetErrorTimer = setTimeout(() => {
        setHasStakingError(false);
      }, 3000);

      return () => {
        clearTimeout(resetErrorTimer);
      };
    }
  }, [isErrorStake]);

  // Update getButtonText function để hiển thị trạng thái phù hợp
  const getButtonText = useCallback(() => {
    if (isPendingAddUpline)
      return (
        <>
          <Spinner />
          <span className="ml-2">{t("buttons.addingUpline")}</span>
        </>
      );
    if (isPendingApprove)
      return (
        <>
          <Spinner />
          <span className="ml-2">{t("buttons.approving")}</span>
        </>
      );

    // Hiển thị thông báo lỗi nếu có
    if (isErrorStake && hasStakingError) return t("buttons.stakeFailed");

    // Hiển thị "Đã Stake thành công" khi đã hoàn thành stake
    if (hasCompletedStake) {
      console.log('Displaying completed stake button');
      return t("buttons.staked");
    }

    // Display "Staking..." during transaction process
    if (
      isPendingStake ||
      (dataStake && !isSuccessStake && !isErrorStake) ||
      isPreparingStake
    )
      return (
        <>
          <Spinner />
          <span className="ml-2">{t("buttons.staking")}</span>
        </>
      );

    if (
      partnerData === "0x0000000000000000000000000000000000000000" &&
      referrer &&
      !isSuccessAddUpline
    )
      return t("buttons.start");

    // Improved button text for approve/stake decision - xử lý trạng thái chờ cập nhật allowance
    if (!isBNB) {
      // Chỉ hiển thị "Preparing to stake" khi đang chờ cập nhật allowance sau approve
      if (isWaitingForAllowanceUpdate) {
        return (
          <>
            <Spinner />
            <span className="ml-2">{t("buttons.preparing")}</span>
          </>
        );
      }
      // Nếu allowance không đủ, hiển thị "Approve"
      if (!hassufficientAllowance(amount)) {
        return t("buttons.approve");
      }
    }

    return t("buttons.stakeNow");
  }, [
    isPendingAddUpline,
    isPendingApprove,
    isPendingStake,
    isSuccessStake,
    isErrorStake,
    hasStakingError,
    hasCompletedStake,
    partnerData,
    referrer,
    isSuccessAddUpline,
    isBNB,
    hassufficientAllowance,
    amount,
    dataStake,
    isPreparingStake,
    isWaitingForAllowanceUpdate,
    isSuccessApprove,
    t,
  ]);

  useEffect(() => {
    if (!amount || !tokenPrice || isNaN(parseFloat(amount))) return;

    const amountInUsd = parseFloat(amount) * tokenPrice;
    const matchingPlan = stakingPlans.find(
      (plan) =>
        amountInUsd >= plan.minAmount &&
        (plan.maxAmount === Infinity || amountInUsd <= plan.maxAmount)
    );

    if (matchingPlan && matchingPlan.id !== selectedPlan) {
      setSelectedPlan(matchingPlan.id);
    }
  }, [amount, tokenPrice, selectedPlan]);

  useEffect(() => {
    if (selectedToken) {
      setAmount("");
      setSelectedPlan(stakingPlans[0].id);
      setEstimatedReturns({
        daily: 0,
        monthly: 0,
        yearly: 0,
        total: 0,
        daysToReachCap: 0,
      });
    }
  }, [selectedToken]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-blue-950/30 dark:to-purple-950/30 transition-colors duration-300">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-green-400/5 to-emerald-400/5 rounded-full blur-2xl animate-pulse delay-500" />
      </div>

      <div className="container mx-auto px-4 py-12 max-w-8xl relative z-10">
        {/* Enhanced Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200 dark:border-blue-700/50 mb-6">
            <Lock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Secure Staking Platform</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 max-w-4xl mx-auto">
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">15.9%</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Average APY</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">4.5K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Active Users</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/20 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$60.1M</div>
              <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Staked</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
          <div className="md:col-span-8 order-2 md:order-1">
            <Card className="mb-6 order-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  {t("balance.title")}
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300">
                  Choose your preferred token to stake
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {tokenTypes.map((token, index) => (
                    <motion.div
                      key={token.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative group cursor-pointer`}
                      onClick={() => {
                        setSelectedToken(token.id);
                      }}
                    >
                      <div
                        className={`relative p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                          selectedToken === token.id
                            ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 shadow-xl"
                            : "border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 hover:border-blue-300 dark:hover:border-blue-600"
                        }`}
                      >
                        {/* Selected indicator */}
                        {selectedToken === token.id && (
                          <motion.div
                            className="absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                            layoutId="selectedBadge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <motion.svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 text-white"
                            >
                              <motion.path
                                d="M5 13l4 4L19 7"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.5 }}
                              />
                            </motion.svg>
                          </motion.div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {/* Enhanced token icon */}
                            <div className={`relative p-3 rounded-2xl transition-all duration-300 ${
                              selectedToken === token.id 
                                ? "bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50" 
                                : "bg-slate-100 dark:bg-slate-800 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/30"
                            }`}>
                              <Image
                                src={token.icon}
                                alt={token.name}
                                className="w-8 h-8 object-contain"
                                width={32}
                                height={32}
                              />
                            </div>
                            <div>
                              <p className="font-bold text-lg text-slate-900 dark:text-white">{token.symbol}</p>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {token.name}
                              </p>
                            </div>
                          </div>
                          
                          {/* Balance display */}
                          <div className="text-right">
                            {(token.id === "bnb" && BNBBalanceLoading) ||
                              (token.id === "fil" && FILBalanceLoading) ||
                              (token.id === "link" && LINKBalanceLoading) ||
                              (token.id === "usdt" && USDTBalanceLoading) ? (
                              <Skeleton className="w-[60px] h-[24px] rounded-lg" />
                            ) : (
                              <div className="space-y-1">
                                <p className="font-bold text-lg text-slate-900 dark:text-white">
                                  {Number(getTokenBalance(token.id))
                                    .toFixed(4)
                                    .toString()}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  Available
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-300" />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 order-3 md:order-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-0 shadow-xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                  {t("stake.title")}
                </CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-300 text-base">
                  {t("stake.description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Enhanced Amount Input Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      {t("stake.amount.label")}
                    </label>
                    <div className="text-right">
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {t("stake.amount.min")}: ${stakingPlans[0].minAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-500">
                        ≈{" "}
                        {selectedToken === "usdt"
                          ? (stakingPlans[0].minAmount / tokenPrice).toFixed(2)
                          : (stakingPlans[0].minAmount / tokenPrice).toFixed(4)}{" "}
                        {selectedToken.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <div className="relative flex gap-3">
                      {/* Enhanced Input */}
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          placeholder={t("stake.amount.placeholder")}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "e") {
                              e.preventDefault();
                            }
                          }}
                          className="h-14 pr-20 text-lg font-semibold bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 rounded-xl transition-all duration-300 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <div className="absolute inset-y-0 right-4 flex items-center">
                          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <Image
                              src={token?.icon || "/images/tokens/usdt.webp"}
                              alt={token?.symbol || "Token"}
                              width={20}
                              height={20}
                              className="rounded-full"
                            />
                            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                              {selectedToken.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Enhanced Max Button */}
                      <Button
                        variant="outline"
                        onClick={handleMaxAmount}
                        className="h-14 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 font-semibold rounded-xl transition-all duration-300 transform hover:scale-105"
                      >
                        {t("buttons.max")}
                      </Button>
                    </div>
                    
                    {/* Amount in USD display */}
                    {amount && tokenPrice > 0 && (
                      <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Value in USD:</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            ${(parseFloat(amount || "0") * tokenPrice).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Enhanced Staking Plans Section */}
                <div className="space-y-6">
                  <label className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Percent className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    {t("stake.plans.title")}
                  </label>
                  <Tabs
                    value={selectedPlan}
                    onValueChange={(value) => {
                      setSelectedPlan(value);
                      const selected = stakingPlans.find((p) => p.id === value);
                      if (selected && tokenPrice > 0) {
                        const minAmountInToken =
                          selected.minAmount / tokenPrice;
                        if (selectedToken === "usdt") {
                          setAmount(minAmountInToken.toFixed(2));
                        } else {
                          setAmount(minAmountInToken.toFixed(4));
                        }
                      }
                    }}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-5 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl h-auto">
                      {stakingPlans.map((plan, index) => (
                        <TabsTrigger
                          key={plan.id}
                          value={plan.id}
                          className="relative data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-lg rounded-lg py-3 px-2 text-sm lg:text-base font-medium cursor-pointer transition-all duration-300 hover:bg-white/50 dark:hover:bg-slate-700/50"
                        >
                          <div className="text-center">
                            <div className="font-bold">
                              {t(`stake.plans.plan.names.${plan.name.toLowerCase()}`)}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                              {plan.apy}% APY
                            </div>
                          </div>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {stakingPlans.map((plan) => (
                      <TabsContent key={plan.id} value={plan.id}>
                        <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800/50 shadow-lg">
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-xl text-slate-900 dark:text-white">
                                  {t("stake.plans.plan.title")}{" "}
                                  {t(`stake.plans.plan.names.${plan.name.toLowerCase()}`)}
                                </CardTitle>
                                <p className="text-slate-600 dark:text-slate-300 mt-1">
                                  Perfect for {plan.name.toLowerCase()} investors
                                </p>
                              </div>
                              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg px-4 py-2 font-bold">
                                {plan.apy}% {t("stake.plans.plan.mpy")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            {/* Investment Range */}
                            <div className="p-4 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-white/20 dark:border-slate-700/50">
                              <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="font-semibold text-slate-900 dark:text-white">
                                  {t("stake.plans.plan.investmentRange")}
                                </p>
                              </div>
                              <p className="text-lg font-bold text-green-600 dark:text-green-400">
                                ${plan.minAmount.toLocaleString()} -{" "}
                                {plan.maxAmount === Infinity
                                  ? "∞"
                                  : `$${plan.maxAmount.toLocaleString()}`}
                              </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-3">
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                                <p className="text-slate-700 dark:text-slate-300">
                                  {t("stake.plans.plan.earn")} <span className="font-bold text-blue-600 dark:text-blue-400">{plan.apy}%</span> {t("stake.plans.plan.mpyUntil")}
                                </p>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-950/30">
                                <div className="w-2 h-2 rounded-full bg-purple-500 mt-2" />
                                <p className="text-slate-700 dark:text-slate-300">
                                  {t("stake.plans.plan.mpyNote")}
                                </p>
                              </div>
                              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-950/30">
                                <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                                <p className="text-slate-700 dark:text-slate-300">
                                  Maximum return: <span className="font-bold text-green-600 dark:text-green-400">400%</span> of initial investment
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </CardContent>
            </Card>

            <Card className="order-4 hidden lg:flex">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {t("rules.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="rounded-lg p-4 bg-accent/50">
                    <h3 className="font-medium mb-2">
                      {t("rules.terms.title")}
                    </h3>
                    <ul className="space-y-2 text-sm list-disc pl-5">
                      <li>{t("rules.terms.items.0")}</li>
                      <li>{t("rules.terms.items.1")}</li>
                      <li>{t("rules.terms.items.2")}</li>
                      <li>{t("rules.terms.items.3")}</li>
                      <li>{t("rules.terms.items.4")}</li>
                    </ul>
                  </div>
                  <div className="rounded-lg p-4 bg-accent/50">
                    <h3 className="font-medium mb-2">
                      {t("rules.howItWorks.title")}
                    </h3>
                    <ol className="space-y-2 text-sm list-decimal pl-5">
                      <li>{t("rules.howItWorks.items.0")}</li>
                      <li>{t("rules.howItWorks.items.1")}</li>
                      <li>{t("rules.howItWorks.items.2")}</li>
                      <li>{t("rules.howItWorks.items.3")}</li>
                      <li>{t("rules.howItWorks.items.4")}</li>
                      <li>{t("rules.howItWorks.items.5")}</li>
                      <li>{t("rules.howItWorks.items.6")}</li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-4 order-2 md:order-3">
            <Card className="sticky top-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                    <Calculator className="h-5 w-5 text-white" />
                  </div>
                  {t("summary.title")}
                </CardTitle>
                <p className="text-slate-600 dark:text-slate-300">
                  Review your staking details
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Summary Items */}
                <div className="space-y-4">
                  {/* Token Info */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={token?.icon || "/images/tokens/usdt.webp"}
                          alt={token?.symbol || "Token"}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {token?.name}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            {t("summary.token")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-slate-900 dark:text-white">
                          {selectedToken === "usdt"
                            ? Number(parseFloat(amount || "0").toFixed(2)).toString()
                            : Number(parseFloat(amount || "0").toFixed(4)).toString()}{" "}
                          {selectedToken.toUpperCase()}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                          ${amountToken.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Plan & APY */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200/50 dark:border-purple-700/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {t(`stake.plans.plan.names.${plan?.name.toLowerCase()}`)} Plan
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {t("summary.plan")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {plan?.apy}%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {t("summary.mpy")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Return Cap */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border border-green-200/50 dark:border-green-700/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          Maximum Return
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {t("summary.returnCap")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          400%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Of investment
                        </p>
                      </div>
                    </div>
                  </div>
                  {referrer &&
                    partnerData ===
                      "0x0000000000000000000000000000000000000000" &&
                    referrer !== account?.address && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("summary.sponsor")}
                        </span>
                        <span className="font-medium">
                          {isLoadingUpline ? (
                            <Skeleton className="w-25 h-4 mb-2" />
                          ) : (
                            shortenWalletAddress(referrer)
                          )}
                        </span>
                      </div>
                    )}
                  {account &&
                    partnerData !==
                      "0x0000000000000000000000000000000000000000" && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t("summary.upline")}
                        </span>
                        <span className="font-medium">
                          {isLoadingUpline ? (
                            <Skeleton className="w-25 h-4 mb-2" />
                          ) : (
                            shortenWalletAddress(partnerData as string)
                          )}
                        </span>
                      </div>
                    )}
                </div>

                <Separator />

                {/* Enhanced Estimated Returns */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500">
                      <Percent className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                      {t("summary.estimatedReturns.title")}
                    </h3>
                  </div>
                  
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200/50 dark:border-indigo-700/30 space-y-4">
                    {/* Daily Returns */}
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t("summary.estimatedReturns.daily")}
                        </span>
                      </div>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {selectedToken === "usdt"
                          ? Number(estimatedReturns.daily.toFixed(2)).toString()
                          : Number(estimatedReturns.daily.toFixed(6)).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>

                    {/* Monthly Returns */}
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t("summary.estimatedReturns.monthly")}
                        </span>
                      </div>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        {selectedToken === "usdt"
                          ? Number(estimatedReturns.monthly.toFixed(2)).toString()
                          : Number(estimatedReturns.monthly.toFixed(6)).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>

                    {/* Yearly Returns */}
                    <div className="flex justify-between items-center p-3 rounded-xl bg-white/60 dark:bg-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {t("summary.estimatedReturns.yearly")}
                        </span>
                      </div>
                      <span className="font-bold text-green-600 dark:text-green-400">
                        {selectedToken === "usdt"
                          ? Number(estimatedReturns.yearly.toFixed(2)).toString()
                          : Number(estimatedReturns.yearly.toFixed(6)).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>

                    {/* Total Returns - Highlighted */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border-2 border-amber-200 dark:border-amber-700/50">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-500" />
                          <span className="font-semibold text-slate-900 dark:text-white">
                            {t("summary.estimatedReturns.total")}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                            {selectedToken === "usdt"
                              ? Number(estimatedReturns.total.toFixed(2)).toString()
                              : Number(estimatedReturns.total.toFixed(6)).toString()}{" "}
                            {selectedToken.toUpperCase()}
                          </p>
                          <p className="text-sm text-amber-600 dark:text-amber-400 font-semibold">
                            ${totalCap400.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-6">
                {/* ================ ENHANCED STAKE BUTTON ================ */}
                <div className="w-full space-y-4">
                  <RainbowButton
                    onClick={handleAction}
                    disabled={isStakeButtonDisabled}
                    className="w-full h-16 text-lg font-bold cursor-pointer shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    {getButtonText()}
                  </RainbowButton>
                  
                  {/* Additional Info */}
                  <div className="text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                    <p>🔒 Your funds are secured by smart contracts</p>
                    <p>⚡ Instant rewards distribution</p>
                  </div>
                </div>
                {/* ================ ENHANCED STAKE BUTTON ================ */}
              </CardFooter>
            </Card>
          </div>
          <Card className="lg:hidden order-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                {t("rules.title")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="rounded-lg p-4 bg-accent/50">
                  <h3 className="font-medium mb-2">{t("rules.terms.title")}</h3>
                  <ul className="space-y-2 text-sm list-disc pl-5">
                    <li>{t("rules.terms.items.0")}</li>
                    <li>{t("rules.terms.items.1")}</li>
                    <li>{t("rules.terms.items.2")}</li>
                    <li>{t("rules.terms.items.3")}</li>
                    <li>{t("rules.terms.items.4")}</li>
                  </ul>
                </div>
                <div className="rounded-lg p-4 bg-accent/50">
                  <h3 className="font-medium mb-2">
                    {t("rules.howItWorks.title")}
                  </h3>
                  <ol className="space-y-2 text-sm list-decimal pl-5">
                    <li>{t("rules.howItWorks.items.0")}</li>
                    <li>{t("rules.howItWorks.items.1")}</li>
                    <li>{t("rules.howItWorks.items.2")}</li>
                    <li>{t("rules.howItWorks.items.3")}</li>
                    <li>{t("rules.howItWorks.items.4")}</li>
                    <li>{t("rules.howItWorks.items.5")}</li>
                    <li>{t("rules.howItWorks.items.6")}</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <StakeSuccessModal
        isOpen={isDialogOpen}
        onClose={() => {
          // Reset modal state
          setIsDialogOpen(false);
          setHasCompletedStake(false);
          
          // Reset form data
          setAmount("");
          setSelectedPlan(stakingPlans[0].id);
          
          // Reset transaction states
          setHasAttemptedStakeAfterApprove(false);
          setHasStakingError(false);
          setIsWaitingForAllowanceUpdate(false);
          setIsPreparingStake(false);
          
          // Reset estimated returns
          setEstimatedReturns({
            daily: 0,
            monthly: 0,
            yearly: 0,
            total: 0,
            daysToReachCap: 0,
          });
          
          // Refresh all token balances
          setTimeout(() => {
            refetchAllBalances();
          }, 1000);
        }}
        tokenAmount={parseFloat(amount || "0")}
        tokenSymbol={token?.symbol || ""}
        usdValue={amountToken}
        mpy={plan?.apy || 0}
      />
      
    </div>
  );
}
