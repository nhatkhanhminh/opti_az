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
    <div className="min-h-screen  transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-8xl">
        <div className="flex justify-between items-center mb-8">
          <div className="text-left">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">
              {t("title")}
            </h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6">
          <div className="md:col-span-8 order-2 md:order-1">
            <Card className="mb-6 order-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  {t("balance.title")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tokenTypes.map((token) => (
                    <div
                      key={token.id}
                      className={`relative flex items-center justify-between p-3 rounded-lg border bg-card transition-colors cursor-pointer ${
                        (token as TokenType).comingSoon
                          ? "opacity-50 hover:opacity-60 border-dashed"
                          : selectedToken === token.id
                          ? "border-primary dark:border-green-900/90 shadow-sm dark:shadow-green-900/50 hover:bg-accent/10"
                          : "hover:bg-accent/10"
                      }`}
                      onClick={() => {
                        setSelectedToken(token.id);
                      }}
                    >
                      {selectedToken === token.id && (
                        <motion.div
                          className="absolute -top-2 -left-2 w-6 h-6 bg-primary dark:bg-green-900 rounded-full flex items-center justify-center"
                          layoutId="checkIcon"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5 }}
                        >
                          <motion.svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4 text-white dark:text-green-400"
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
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                          <Image
                            src={token.icon}
                            alt={token.name}
                            className="w-6 h-6 object-contain"
                            width={24}
                            height={24}
                          />
                        </div>
                        <div>
                          <p className="font-medium">{token.symbol}</p>
                          <p className="text-sm text-muted-foreground">
                            {token.name}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {(token as TokenType).comingSoon ? (
                          <div className="flex flex-col items-end">
                            <p className="font-bold text-muted-foreground">0.0000</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              Coming Soon
                            </Badge>
                          </div>
                        ) : (token.id === "bnb" && BNBBalanceLoading) ||
                          (token.id === "fil" && FILBalanceLoading) ||
                          (token.id === "link" && LINKBalanceLoading) ||
                          (token.id === "usdt" && USDTBalanceLoading) ? (
                          <Skeleton className="w-[50px] h-[20px]" />
                        ) : (
                          <p className="font-bold">
                            {Number(getTokenBalance(token.id))
                              .toFixed(4)
                              .toString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6 order-3 md:order-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t("stake.title")}
                </CardTitle>
                <CardDescription>{t("stake.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between">
                    <label className="text-sm font-medium">
                      {t("stake.amount.label")}
                    </label>
                    <span className="text-sm text-muted-foreground">
                      {t("stake.amount.min")}: $
                      {stakingPlans[0].minAmount.toLocaleString()} ≈{" "}
                      {selectedToken === "usdt"
                        ? (stakingPlans[0].minAmount / tokenPrice).toFixed(2)
                        : (stakingPlans[0].minAmount / tokenPrice).toFixed(
                            4
                          )}{" "}
                      {selectedToken.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-1.5">
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
                        className="pr-16 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div className="absolute inset-y-0 right-3 flex items-center text-sm font-medium text-muted-foreground">
                        {selectedToken.toUpperCase()}
                      </div>
                    </div>
                    <Button
                      className="cursor-pointer"
                      variant="outline"
                      onClick={handleMaxAmount}
                    >
                      {t("buttons.max")}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
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
                    <TabsList className="grid grid-cols-5 mb-4 mt-2">
                      {stakingPlans.map((plan) => (
                        <TabsTrigger
                          key={plan.id}
                          value={plan.id}
                          className="lg:text-base text-sm cursor-pointer"
                        >
                          {t(
                            `stake.plans.plan.names.${plan.name.toLowerCase()}`
                          )}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {stakingPlans.map((plan) => (
                      <TabsContent key={plan.id} value={plan.id}>
                        <Card className="bg-accent/50">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-center">
                              <CardTitle>
                                {t("stake.plans.plan.title")}{" "}
                                {t(
                                  `stake.plans.plan.names.${plan.name.toLowerCase()}`
                                )}{" "}
                              </CardTitle>
                              <Badge
                                variant="outline"
                                className="bg-primary/10 text-primary text-xl"
                              >
                                {plan.apy}% {t("stake.plans.plan.mpy")}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {t("stake.plans.plan.investmentRange")}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    ${plan.minAmount.toLocaleString()} -{" "}
                                    {plan.maxAmount === Infinity
                                      ? "∞"
                                      : `$${plan.maxAmount.toLocaleString()}`}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm">
                              {t("stake.plans.plan.earn")} {plan.apy}%{" "}
                              {t("stake.plans.plan.mpyUntil")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("stake.plans.plan.mpyNote")}
                            </p>
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
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  {t("summary.title")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("summary.token")}
                    </span>
                    <span className="font-medium">{token?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("summary.amount")}
                    </span>
                    <div className="flex flex-col text-right">
                      <span className="font-medium">
                        {selectedToken === "usdt"
                          ? Number(
                              parseFloat(amount || "0").toFixed(2)
                            ).toString()
                          : Number(
                              parseFloat(amount || "0").toFixed(4)
                            ).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ${amountToken.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("summary.plan")}
                    </span>
                    <span className="font-medium">
                      {t(`stake.plans.plan.names.${plan?.name.toLowerCase()}`)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("summary.mpy")}
                    </span>
                    <span className="font-medium text-primary">
                      {plan?.apy}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {t("summary.returnCap")}
                    </span>
                    <span className="font-medium">400%</span>
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

                <div className="space-y-2">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    <Percent className="h-4 w-4" />
                    {t("summary.estimatedReturns.title")}
                  </h3>
                  <div className="rounded-lg p-3 bg-accent/50 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("summary.estimatedReturns.daily")}
                      </span>
                      <span className="font-medium">
                        {selectedToken === "usdt"
                          ? Number(estimatedReturns.daily.toFixed(2)).toString()
                          : Number(
                              estimatedReturns.daily.toFixed(6)
                            ).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("summary.estimatedReturns.monthly")}
                      </span>
                      <span className="font-medium">
                        {selectedToken === "usdt"
                          ? Number(
                              estimatedReturns.monthly.toFixed(2)
                            ).toString()
                          : Number(
                              estimatedReturns.monthly.toFixed(6)
                            ).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("summary.estimatedReturns.yearly")}
                      </span>
                      <span className="font-medium">
                        {selectedToken === "usdt"
                          ? Number(
                              estimatedReturns.yearly.toFixed(2)
                            ).toString()
                          : Number(
                              estimatedReturns.yearly.toFixed(6)
                            ).toString()}{" "}
                        {selectedToken.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-sm text-muted-foreground">
                        {t("summary.estimatedReturns.total")}
                      </span>
                      <div className="flex flex-col text-right">
                        <span className="font-medium text-primary">
                          {selectedToken === "usdt"
                            ? Number(
                                estimatedReturns.total.toFixed(2)
                              ).toString()
                            : Number(
                                estimatedReturns.total.toFixed(6)
                              ).toString()}{" "}
                          {selectedToken.toUpperCase()}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          ${totalCap400.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {/* ================ STAKE BUTTON ================ */}
                <RainbowButton
                  onClick={handleAction}
                  disabled={isStakeButtonDisabled}
                  className="w-full cursor-pointer"
                >
                  {getButtonText()}
                </RainbowButton>
                {/* ================ STAKE BUTTON ================ */}
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
