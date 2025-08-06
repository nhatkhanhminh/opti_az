'use client'
import {useState, useEffect } from "react";
import { getContract, readContract, prepareContractCall } from "thirdweb";
import { useWalletBalance, useActiveAccount } from "thirdweb/react";
import { bsc } from "thirdweb/chains";
import { client } from "@/lib/client";
import useWalletStore from "@/store/userWalletStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertCircle,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ArrowDown,
  ArrowRight,
  WalletMinimal
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { TokenSelectorSwap } from "@/components/ui/token-selector";
import { toast } from "sonner";
import { BNB, USDT, USDC, FIL, LINK, BTCB, SOL, DOGE } from "@/Context/listaddress";
import { tokenTypes } from "@/Context/token";
import { ethers5Adapter } from "thirdweb/adapters/ethers5";
import axios from "axios";
import { Skeleton } from "@/components/ui/skeleton";
import { RainbowButton } from "@/components/ui/rainbow-button";
import Image from "next/image";
import { useTokenData } from "@/components/hooks/useTokenData";
import React from "react";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useTranslations } from "next-intl";
import { shortenHex } from "thirdweb/utils";
import { TokenPriceChartCard } from '@/components/ui/TokenPriceChartCard';


// Địa chỉ KyberSwap Aggregator trên BSC
const KYBER_ROUTER = "0x6131B5fae19EA4f9D964eAc0408E4408b66337b5";
// Định nghĩa interface cho step trong route
interface RouteStep {
  pool: string;
  tokenIn: string;
  tokenOut: string;
  swapAmount: string;
  amountOut: string;
  exchange: string;
  poolType: string;
  poolExtra?: {
    swapFee?: string;
    [key: string]: any;
  };
  extra?: any;
}

interface SwapRoute {
  route: RouteStep[][];
}

// Định nghĩa interface TokenImage để hiển thị trong modal
interface TokenImage {
  address: string;
  icon: string;
}

// Danh sách tokens có hình ảnh - cần thiết cho hiển thị trong modal
const tokenImages: TokenImage[] = [
  {
    address: BNB,
    icon: "/images/tokens/bnb.webp"
  },
  {
    address: USDT,
    icon: "/images/tokens/usdt.webp"
  },
  {
    address: USDC,
    icon: "/images/tokens/usdc.webp"
  },
  {
    address: FIL,
    icon: "/images/tokens/fil.webp"
  },
  {
    address: LINK,
    icon: "/images/tokens/link.webp"
  },
  {
    address: BTCB,
    icon: "/images/tokens/btc.webp"
  },
  {
    address: SOL,
    icon: "/images/tokens/sol.webp"
  }
];

// Hàm trợ giúp để chuyển đổi BigInt thành chuỗi số thập phân
function formatBigIntToDecimalString(value: bigint, decimals: number): string {
  if (value === BigInt(0)) return "0";
  if (value < BigInt(0)) return "-" + formatBigIntToDecimalString(-value, decimals);

  const s = value.toString();
  let head: string;
  let tail: string;

  if (s.length <= decimals) {
    head = "0";
    tail = s.padStart(decimals, '0');
  } else {
    head = s.substring(0, s.length - decimals);
    tail = s.substring(s.length - decimals);
  }

  tail = tail.replace(/0+$/, '');

  if (tail === '') {
    return head;
  }
  return `${head}.${tail}`;
}

// Hàm trợ giúp để chuyển đổi chuỗi số thập phân thành BigInt
function parseDecimalStringToBigInt(decimalStr: string, numDecimals: number): bigint {
  if (!decimalStr) {
      return BigInt(0);
  }
  // Xử lý trường hợp chuỗi có thể không hợp lệ cho parseFloat nhưng vẫn là số (vd: chỉ có dấu chấm)
  if (isNaN(parseFloat(decimalStr)) && decimalStr !== "0" && !/^[0-9]+\.?[0-9]*$/.test(decimalStr) && !/^\.?[0-9]+$/.test(decimalStr) ) {
      return BigInt(0);
  }


  const parts = decimalStr.split('.');
  const integerPartStr = parts[0] === '' && parts.length > 1 ? '0' : parts[0]; // Handle cases like ".5" -> "0.5"
  let fractionalPartStr = parts[1] || '';

  if (fractionalPartStr.length > numDecimals) {
    fractionalPartStr = fractionalPartStr.slice(0, numDecimals); // Truncate if longer than numDecimals
  } else {
    fractionalPartStr = fractionalPartStr.padEnd(numDecimals, '0'); // Pad if shorter
  }
  
  const combinedStr = (integerPartStr === '0' && fractionalPartStr === '0'.repeat(numDecimals)) ? '0' : integerPartStr + fractionalPartStr;

  try {
    // Remove leading zeros unless it's just "0"
    const finalStr = combinedStr.replace(/^0+(?=\\d)/, '');
    return BigInt(finalStr === '' && combinedStr.includes('0') ? '0' : finalStr);
  } catch (e) {
    console.error("Error converting string to BigInt:", decimalStr, "Combined:", combinedStr, e);
    return BigInt(0); 
  }
}

// Component chính
export default function SwapTokenComponent() {
  const t = useTranslations("SwapPage");
  // const contract = useSwapContract();
  // Thay thế các mutation thirdweb bằng các state riêng biệt
  const [isSwapLoading, setIsSwapLoading] = useState<boolean>(false);
  const [isPendingApprove, setIsPendingApprove] = useState<boolean>(false);
  const { account } = useWalletStore();
  // Lấy active account ở cấp độ component, không phải trong hàm
  const activeAccount = useActiveAccount();
  const { handleConnect, isConnecting } = useWalletConnect();
 
  // State để lưu trữ thông tin swap
  const [tokenIn, setTokenIn] = useState<string>(BNB); // Địa chỉ token đầu vào mặc định là BNB
  const [tokenOut, setTokenOut] = useState<string>(FIL); // Địa chỉ token đầu ra mặc định là FIL
  const [amountIn, setAmountIn] = useState<string>(""); // Số lượng token đầu vào
  const [amountOutMin, setAmountOutMin] = useState<string>(""); // Số lượng token đầu ra tối thiểu
  const [slippage, setSlippage] = useState<number>(0.5); // Mức trượt giá (%)
  const [isApproved, setIsApproved] = useState<boolean>(false); // Trạng thái phê duyệt
  const [tokenInDecimals, setTokenInDecimals] = useState<number>(18); // Decimals của tokenIn
  const [tokenOutDecimals, setTokenOutDecimals] = useState<number>(18); // Decimals của tokenOut
  const [swapStatus, setSwapStatus] = useState<string>(""); // Trạng thái giao dịch
  const [isCalculating, setIsCalculating] = useState<boolean>(false); // Trạng thái đang tính toán
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false); // Trạng thái dialog cài đặt
  const [priceImpact, setPriceImpact] = useState<number>(0); // Tác động giá
  const [exchangeRate, setExchangeRate] = useState<string>(""); // Tỷ giá
  const [minimumReceived, setMinimumReceived] = useState<string>(""); // Số lượng tối thiểu nhận được
  const [insufficientBalance, setInsufficientBalance] = useState<boolean>(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0); // Thời gian fetch cuối cùng
  const DEBOUNCE_DELAY = 1000; // 1 giây
  
  // Thêm state mới để lưu trữ giá trị USD từ API
  const [amountInUsd, setAmountInUsd] = useState<string>("0");
  const [amountOutUsd, setAmountOutUsd] = useState<string>("0");
  
  // State cho modal thành công
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [successTxHash, setSuccessTxHash] = useState<string | null>(null);
  
  // Lấy giá token từ hook useTokenData thay vì sử dụng state cố định
  const { prices: tokenPrices, loading: tokenPricesLoading } = useTokenData();
  
  // Hàm trợ giúp lấy giá token từ tokenPrices hook
  const getTokenPrice = (symbol: string): number => {
    if (!tokenPrices) return 0;
    const tokenData = tokenPrices[symbol];
    return tokenData ? tokenData.USD : 0;
  };

  // Các mức slippage nhanh
  const quickSlippageOptions = [0.3, 0.5, 1.0, 1.5];

  // Thêm hooks để lấy balance
  const { data: tokenInBalance, isLoading: isTokenInBalanceLoading, refetch: refetchTokenInBalance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client,
    tokenAddress: tokenIn === BNB ? undefined : tokenIn,
  });

  const { data: tokenOutBalance, isLoading: isTokenOutBalanceLoading, refetch: refetchTokenOutBalance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client,
    tokenAddress: tokenOut === BNB ? undefined : tokenOut,
  });

  // Hook mới để lấy số dư BNB gốc (Native BNB)
  const { data: nativeBnbWalletBalance, isLoading: isNativeBnbWalletBalanceLoading, refetch: refetchNativeBnbWalletBalance } = useWalletBalance({
    chain: bsc,
    address: account?.address,
    client,
    // Không có tokenAddress, sẽ lấy số dư native (BNB)
  });

  // Hàm format balance
  const formatBalance = (balance: any, decimals: number, tokenAddress: string) => {
    if (!balance) return "0.00";
    const value = Number(balance.displayValue) || 0;
    
    // Xác định số thập phân dựa trên token
    const decimalPlaces = tokenAddress === USDT || tokenAddress === USDC ? 2 : 4;
    return value.toFixed(decimalPlaces);
  };

  // Hàm lấy ký hiệu token
  const getTokenSymbol = (tokenAddress: string) => {
    if (tokenAddress === BNB) return "BNB";
    if (tokenAddress === USDT) return "USDT";
    if (tokenAddress === USDC) return "USDC";
    if (tokenAddress === FIL) return "FIL";
    if (tokenAddress === LINK) return "LINK";
    // if (tokenAddress === AZC) return "AZC";
    return "Token";
  };

  // Lấy decimals của token từ context
  const getTokenDecimals = (tokenAddress: string): number => {
    const token = tokenTypes.find(t => t.tokenAddress === tokenAddress);
    return token?.decimals || 18;
  };

  // Hàm rút gọn số lượng token cho hiển thị
  const formatTokenAmount = (amount: string, maxLength: number = 12): string => {
    if (!amount) return "0";
    
    // Kiểm tra xem có cần cắt không bằng cách đo độ rộng thực tế
    if (amount.length <= maxLength) return amount;
    
    // Tách phần nguyên và phần thập phân
    const parts = amount.split('.');
    const integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : '';
    
    // Nếu phần nguyên đã dài hơn maxLength
    if (integerPart.length >= maxLength) {
      return integerPart.substring(0, maxLength - 3) + '...';
    }
    
    // Còn lại bao nhiêu ký tự cho phần thập phân
    const remainingLength = maxLength - integerPart.length - 1; // -1 cho dấu chấm
    
    // Nếu phần thập phân quá dài, cắt bớt
    if (decimalPart.length > remainingLength) {
      return `${integerPart}.${decimalPart.substring(0, remainingLength - 3)}...`;
    }
    
    // Nếu không cần cắt, trả về nguyên bản
    return amount;
  };

  // Hàm định dạng số tiền USD với 4 chữ số thập phân
  const formatUsdAmount = (amount: string): string => {
    if (!amount) return "0.0000";
    
    // Đảm bảo amount là một chuỗi
    const amountStr = String(amount);
    
    // Parse thành số và định dạng với 4 chữ số thập phân
    let numericAmount;
    try {
      numericAmount = parseFloat(amountStr);
      return numericAmount.toFixed(4);
    } catch (e) {
      console.error("Error parsing USD amount:", e, "Value:", amountStr);
      return "0.0000";
    }
  };

  // Sử dụng KyberSwap Aggregator API v1 để lấy route tốt nhất
  const fetchKyberSwapEstimate = async () => {
    if (!tokenIn || !tokenOut || !amountIn || isNaN(parseFloat(amountIn))) return;

    const now = Date.now();
    if (now - lastFetchTime < DEBOUNCE_DELAY) {
      console.log("Debouncing fetch request...");
      return;
    }
    setLastFetchTime(now);

    try {
      setIsCalculating(true);
      
      const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * 10 ** tokenInDecimals));
      
      // Sử dụng địa chỉ BNB đặc biệt của KyberSwap
      const actualTokenIn = tokenIn === BNB ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" : tokenIn;
      const actualTokenOut = tokenOut === BNB ? "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" : tokenOut;
      
      // Gọi API v1 để lấy route tốt nhất
      const response = await axios.get(`https://aggregator-api.kyberswap.com/bsc/api/v1/routes`, {
        params: {
          tokenIn: actualTokenIn,
          tokenOut: actualTokenOut,
          amountIn: amountInWei.toString(),
          gasInclude: true
        },
        headers: {
          'Accept': 'application/json',
          'x-client-Id': 'azcoin'
        }
      });

      const data = response.data;
      
      if (!data || !data.data || !data.data.routeSummary) {
        throw new Error("Invalid response from KyberSwap API");
      }

      const { routeSummary } = data.data;
      const estimatedAmount = BigInt(routeSummary.amountOut);
      
      if (estimatedAmount <= BigInt(0)) {
        throw new Error("Invalid estimated amount");
      }
      
      // Tính toán thông tin chi tiết
      const estimatedAmountFormatted = Number(estimatedAmount) / 10 ** tokenOutDecimals;
      const slippageFactor = 1 - slippage / 100;
      const amountOutMinWei = BigInt(Number(estimatedAmount) * slippageFactor);
      const amountOutMinFormatted = Number(amountOutMinWei) / 10 ** tokenOutDecimals;
      
      // Tính tỷ giá
      const rate = estimatedAmountFormatted / parseFloat(amountIn);
      const exchangeRateText = `1 ${getTokenSymbol(tokenIn)} = ${rate.toFixed(6)} ${getTokenSymbol(tokenOut)}`;
      setExchangeRate(exchangeRateText);
      
      // Tính tác động giá
      const priceImpactValue = ((estimatedAmountFormatted - amountOutMinFormatted) / estimatedAmountFormatted) * 100;
      setPriceImpact(priceImpactValue);
      
      setMinimumReceived(amountOutMinFormatted.toFixed(6));
      setAmountOutMin(amountOutMinFormatted.toString());
      
      // Lưu thông tin USD từ API
      if (routeSummary.amountInUsd) {
        setAmountInUsd(routeSummary.amountInUsd);
      }
      
      if (routeSummary.amountOutUsd) {
        setAmountOutUsd(routeSummary.amountOutUsd);
      }
      
      // Tạo swapDetails từ dữ liệu nhận được để hiển thị
      setSwapDetails({
        gasUsd: routeSummary.gasUsd || "0",
        routeSummary: routeSummary // Lưu toàn bộ routeSummary bao gồm cả route
      });
      
      setIsCalculating(false);
      return amountOutMinFormatted;
    } catch (err) {
      console.error("Failed to fetch estimate from KyberSwap:", err);
      setIsCalculating(false);
      setExchangeRate("Failed to fetch price");
      return 0;
    }
  };


  // Kiểm tra allowance
  const checkAllowance = async () => {
    if (!account || !tokenIn || tokenIn === BNB || !amountIn || parseFloat(amountIn) <= 0) {
      setIsApproved(true); // BNB không cần approve
      return;
    }
    
    try {
      const tokenContract = getContract({ client, chain: bsc, address: tokenIn });
      
      // Sử dụng hàm allowance từ thirdweb
      const allowanceAmount = await readContract({
        contract: tokenContract,
        method: "function allowance(address owner, address spender) view returns (uint256)",
        params: [account.address, KYBER_ROUTER],
      });
      
      const amountInWei = BigInt(Math.floor(parseFloat(amountIn) * 10 ** tokenInDecimals));
      
      // So sánh allowance với số lượng cần chuyển
      setIsApproved(BigInt(allowanceAmount) >= amountInWei);
    
    } catch (error) {
      console.error("Unable to check allowance:", error);
      setIsApproved(false);
    }
  };

  // Xử lý approve
  const handleApprove = async () => {
    if (!account || !activeAccount || !tokenIn || tokenIn === BNB || !amountIn || parseFloat(amountIn) <= 0) return;
    
    let approveTxHash: string | undefined = undefined;
    try {
      setIsPendingApprove(true);
      
      // Lấy contract instance
      const tokenContract = getContract({ client, chain: bsc, address: tokenIn });
      
      // Tính số lượng token tối đa để approve
      const maxApproval = BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935"); // 2^256 - 1
      
      // Chuẩn bị transaction approve
      const approveTransaction = await prepareContractCall({
        contract: tokenContract,
        method: "function approve(address spender, uint256 amount) returns (bool)",
        params: [KYBER_ROUTER, maxApproval],
      });
      
      // Chuyển đổi sang ethers signer để gửi transaction
      const ethersSigner = await ethers5Adapter.signer.toEthers({
        client,
        chain: bsc,
        account: activeAccount
      });
      
      setSwapStatus("Approving token...");
      
      // Gửi transaction
      const approveTx = await ethersSigner.sendTransaction({
        to: tokenIn,
        data: approveTransaction.data,
        from: account.address,
      });
      approveTxHash = approveTx.hash;
      
      console.log("Approval transaction sent:", approveTx);
      
      // Hiển thị thông báo đang chờ xác nhận
      setSwapStatus(`Approval sent (Hash: ${approveTxHash ? shortenHex(approveTxHash) : 'N/A'})! Waiting for confirmation...`);
      
      // Chờ kết quả transaction
      const receipt = await approveTx.wait();
      console.log("Approval succeeded with hash:", receipt.hash);
      
      setSwapStatus("Token has been approved successfully!");
      setTimeout(() => {
        setSwapStatus("");
      }, 5000);
      
      // Cập nhật trạng thái approved ngay lập tức
      setIsApproved(true);
      
      // Kiểm tra lại allowance sau khi approve thành công
      checkAllowance();
    } catch (error: unknown) {
      console.error("Unable to approve:", error);
      let errorMessage = "Unknown error";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        errorMessage = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      const statusMessage = approveTxHash 
        ? `Approval failed (Hash: ${shortenHex(approveTxHash)}). Please try again.`
        : "Approval failed. Please try again.";
      setSwapStatus(statusMessage);
      toast.error(statusMessage, { id: approveTxHash });
      setTimeout(() => {
        setSwapStatus("");
      }, 5000);
    } finally {
      setIsPendingApprove(false);
    }
  };


  // Thêm state cho modal xác nhận
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [swapDetails, setSwapDetails] = useState<any>(null);
  const [isCheckingPriceImpact, setIsCheckingPriceImpact] = useState(false);

  // Hàm kiểm tra price impact
  const checkPriceImpact = async (tokenIn: string, tokenOut: string, amountIn: string, amountOut: string) => {
    try {
      const response = await axios.get(
        `https://bff.kyberswap.com/api/v1/price-impact`, {
          params: {
            tokenIn,
            tokenInDecimal: 18,
            tokenOut,
            tokenOutDecimal: 18,
            amountIn,
            amountOut,
            chainId: 56
          },
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      return response.data;
    } catch (err) {
      console.error("Failed to check price impact:", err);
      return null;
    }
  };

  // Xử lý swap với KyberSwap Aggregator
  const handleSwap = async () => {
    if (!account) {
      setSwapStatus("Please connect wallet first.");
      setTimeout(() => { setSwapStatus(""); }, 5000);
      return;
    }
    
    if (!tokenIn || !tokenOut || !amountIn || !amountOutMin) {
      setSwapStatus("Please select tokens and enter amount.");
      setTimeout(() => { setSwapStatus(""); }, 5000);
      return;
    }
    
    try {
      await checkAllowance();
      
      if (!isApproved) {
        setSwapStatus("Please approve token first.");
        setTimeout(() => { setSwapStatus(""); }, 5000);
        return;
      }

      // Kiểm tra phí gas BNB
      const minGasUsdThreshold = 0.4;
      const bnbPrice = getTokenPrice("BNB");

      if (nativeBnbWalletBalance && typeof nativeBnbWalletBalance.value === 'bigint' && bnbPrice && bnbPrice > 0) {
        const bnbDecimals = 18; // BNB decimals
        const requiredBnbDecimalForThresholdString = (minGasUsdThreshold / bnbPrice).toFixed(bnbDecimals);
        const minRequiredBnbWeiForThreshold = parseDecimalStringToBigInt(requiredBnbDecimalForThresholdString, bnbDecimals);

        if (nativeBnbWalletBalance.value < minRequiredBnbWeiForThreshold) {
          const requiredBnbFormatted = formatBigIntToDecimalString(minRequiredBnbWeiForThreshold, bnbDecimals);
          const errorMessage = `Need gas ${requiredBnbFormatted} BNB (~${minGasUsdThreshold} USD) in your wallet`;
          toast.error(errorMessage);
          setSwapStatus(errorMessage);
          setTimeout(() => { setSwapStatus(""); }, 5000);
          return; // Dừng swap
        }
      } else if (!nativeBnbWalletBalance || (bnbPrice !== undefined && bnbPrice <= 0)) {
        console.warn("Cannot determine BNB balance or BNB price to check gas fee.");
        // Cân nhắc việc hiển thị một cảnh báo cho người dùng ở đây nếu muốn
        // toast.warn("Không thể xác minh đủ phí gas BNB do thiếu dữ liệu giá BNB.");
      }
      
      setSwapStatus("Preparing transaction...");
      
      const NATIVE_TOKEN = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
      const actualTokenIn = tokenIn === BNB ? NATIVE_TOKEN : tokenIn;
      const actualTokenOut = tokenOut === BNB ? NATIVE_TOKEN : tokenOut;
      
      const currentTokenInDecimals = getTokenDecimals(tokenIn);
      const amountInWei = parseDecimalStringToBigInt(amountIn, currentTokenInDecimals);
      
      const quoteResponse = await axios.get(`https://aggregator-api.kyberswap.com/bsc/api/v1/routes`, {
        params: {
          tokenIn: actualTokenIn,
          tokenOut: actualTokenOut,
          amountIn: amountInWei.toString(),
          saveGas: false,
          gasInclude: true,
          slippageTolerance: slippage * 100, 
        },
        headers: {
          'Accept': 'application/json',
          'x-client-Id': 'azcoin'
        }
      });
      
      const quoteData = quoteResponse.data;

      if (!quoteData || !quoteData.data || !quoteData.data.routeSummary) {
        throw new Error("Could not get quote from KyberSwap");
      }

      setIsCheckingPriceImpact(true);
      const priceImpactData = await checkPriceImpact(
        actualTokenIn,
        actualTokenOut,
        amountInWei.toString(),
        quoteData.data.routeSummary.amountOut
      );
      setIsCheckingPriceImpact(false);

      if (!priceImpactData) {
        throw new Error("Could not check price impact");
      }

      setSwapStatus("Building transaction...");
      const buildResponse = await axios.post('https://aggregator-api.kyberswap.com/bsc/api/v1/route/build', {
        routeSummary: quoteData.data.routeSummary,
        sender: account.address,
        recipient: account.address,
        slippageTolerance: slippage * 100, 
        deadline: Math.floor(Date.now() / 1000) + 60 * 20, 
        source: "azcoin",
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'x-client-Id': 'azcoin'
        }
      });
      
      const buildData = buildResponse.data;
  
      if (!buildData || !buildData.data || !buildData.data.data) {
        throw new Error("Could not build swap data");
      }

      setSwapDetails({
        data: buildData.data.data,
        routerAddress: buildData.data.routerAddress,
        amountIn: amountInWei.toString(), // Lưu ý amountInWei được sử dụng ở đây
        transactionValue: tokenIn === BNB ? amountInWei.toString() : "0",
        priceImpact: priceImpactData.data.priceImpact,
        amountInUSD: priceImpactData.data.amountInUSD,
        amountOutUSD: priceImpactData.data.amountOutUSD,
        gasUsd: buildData.data.gasUsd !== undefined ? buildData.data.gasUsd : "0",
        routeSummary: quoteData.data.routeSummary
      });
      
      setIsConfirmModalOpen(true);

    } catch (error: unknown) {
      console.error("Could not prepare swap transaction:", error);
      let errorMessageText = "Unknown error during preparation";
      if (error instanceof Error) {
        errorMessageText = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        errorMessageText = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessageText = error;
      }
      setSwapStatus(`Could not prepare transaction: ${errorMessageText}`);
        setTimeout(() => {
          setSwapStatus("");
        }, 5000);
    }
  };
  
  const executeSwap = async () => {
    if (!swapDetails) return;
   
    let txHash: string | undefined = undefined;
    try {
      setIsSwapLoading(true);
      
      if (!swapDetails.data || !swapDetails.routerAddress) {
        throw new Error("Invalid swap details");
      }

      if (!account || !activeAccount) {
        throw new Error("Wallet not connected");
      }

      const txValue = tokenIn === BNB ? BigInt(swapDetails.transactionValue) : BigInt(0);

      const ethersSigner = await ethers5Adapter.signer.toEthers({ 
        client, 
        chain: bsc, 
        account: activeAccount 
      });
      
      setSwapStatus("Sending transaction...");
      const executeSwapTx = await ethersSigner.sendTransaction({
        data: swapDetails.data,
        from: account.address,
        to: swapDetails.routerAddress,
        value: txValue.toString()
      });
      txHash = executeSwapTx.hash;
      
      setSwapStatus(`Swap sent (Hash: ${txHash ? shortenHex(txHash) : 'N/A'})! Waiting for confirmation...`);
      
      const receipt = await executeSwapTx.wait();
      console.log("Swap succeeded with hash:", receipt.hash);
      
      setSwapStatus("Swap successful!");
      setSuccessTxHash(receipt.hash);
      setIsSuccessModalOpen(true);
      setIsConfirmModalOpen(false);

      setAmountIn("");
      setAmountOutMin("");
      setExchangeRate("");
      setPriceImpact(0);
      setMinimumReceived("");
      
      refetchTokenInBalance();
      refetchTokenOutBalance();
      refetchNativeBnbWalletBalance();

      setTimeout(() => {
        setSwapStatus("");
      }, 5000);
    } catch (error: unknown) {
      console.error("Could not execute swap:", error);
      let errorMessageText = "Unknown error during execution";
      if (error instanceof Error) {
        errorMessageText = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as any).message === 'string') {
        errorMessageText = (error as any).message;
      } else if (typeof error === 'string') {
        errorMessageText = error;
      }
      const statusMessage = txHash
        ? `Swap failed (Hash: ${shortenHex(txHash)}): ${errorMessageText}`
        : `Swap failed: ${errorMessageText}`;
      
      toast.error(statusMessage, { id: txHash });
      setSwapStatus(statusMessage);

      setTimeout(() => {
        setSwapStatus("");
      }, 5000);
    } finally {
      setIsSwapLoading(false);
    }
  };

  // Cập nhật decimals khi token thay đổi
  useEffect(() => {
    if (tokenIn) {
      setTokenInDecimals(getTokenDecimals(tokenIn));
    }
    
    if (tokenOut) {
      setTokenOutDecimals(getTokenDecimals(tokenOut));
    }
  }, [tokenIn, tokenOut]);

  // Tự động tính toán amountOutMin khi amountIn thay đổi
  useEffect(() => {
    const calculateAmountOut = async () => {
      if (tokenIn && tokenOut && amountIn && !isNaN(parseFloat(amountIn))) {
        await fetchKyberSwapEstimate();
      } else {
        setAmountOutMin("");
        setMinimumReceived("");
        setExchangeRate("");
        setPriceImpact(0);
      }
    };
    
    const timeoutId = setTimeout(calculateAmountOut, 500);
    return () => clearTimeout(timeoutId);
  }, [tokenIn, tokenOut, amountIn, slippage]);

  // Kiểm tra allowance khi token hoặc amount thay đổi
  useEffect(() => {
    if (tokenIn && amountIn && parseFloat(amountIn) > 0) {
      checkAllowance();
    }
  }, [tokenIn, amountIn]);

  // Kiểm tra số dư khi amountIn thay đổi
  useEffect(() => {
    if (tokenInBalance && amountIn && !isNaN(parseFloat(amountIn))) {
      const balance = parseFloat(tokenInBalance.displayValue);
      const amount = parseFloat(amountIn);
      setInsufficientBalance(amount > balance);
    } else {
      setInsufficientBalance(false);
    }
  }, [tokenInBalance, amountIn]);

  // Xử lý chuyển đổi token
  const handleSwitchTokens = () => {
    const tempTokenIn = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(tempTokenIn);
  };

  // Hiển thị trạng thái
  const renderStatusAlert = () => {
    if (!swapStatus) return null;
    
    if (swapStatus.includes("successful")) {
      return (
        <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{swapStatus}</AlertDescription>
        </Alert>
      );
    }
    
    if (swapStatus.includes("failed") || swapStatus.includes("error")) {
      return (
        <Alert className="mt-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{swapStatus}</AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Info</AlertTitle>
        <AlertDescription>{swapStatus}</AlertDescription>
      </Alert>
    );
  };

  // Xử lý max cho amountIn
  const handleMaxInput = () => {
    if (!tokenInBalance || typeof tokenInDecimals !== 'number' || tokenInDecimals <= 0) {
      setAmountIn("");
      return;
    }
  
    if (tokenIn !== BNB) {
      if (typeof tokenInBalance.value === 'bigint') {
        const balanceInWei = tokenInBalance.value;
        setAmountIn(balanceInWei > BigInt(0) ? formatBigIntToDecimalString(balanceInWei, tokenInDecimals) : "0");
      } else if (tokenInBalance.displayValue) {
        const parsedFromDisplay = parseDecimalStringToBigInt(tokenInBalance.displayValue, tokenInDecimals);
        setAmountIn(parsedFromDisplay > BigInt(0) ? formatBigIntToDecimalString(parsedFromDisplay, tokenInDecimals) : "0");
      } else {
        setAmountIn("0");
      }
    } else { // tokenIn is BNB
      if (tokenInBalance.displayValue) {
        // Ưu tiên displayValue vì người dùng thấy nó đúng và nó thường đã được định dạng.
        // Chuyển nó thành BigInt rồi format lại để đảm bảo nhất quán và loại bỏ các vấn đề về làm tròn tiềm ẩn khi chỉ gán chuỗi.
        const balanceInWeiFromDisplay = parseDecimalStringToBigInt(tokenInBalance.displayValue, tokenInDecimals);
        setAmountIn(balanceInWeiFromDisplay > BigInt(0) ? formatBigIntToDecimalString(balanceInWeiFromDisplay, tokenInDecimals) : "0");
      } else if (typeof tokenInBalance.value === 'bigint') {
        // Fallback nếu displayValue không có nhưng .value (BigInt) có
        setAmountIn(tokenInBalance.value > BigInt(0) ? formatBigIntToDecimalString(tokenInBalance.value, tokenInDecimals) : "0");
      } else {
        setAmountIn("0"); 
      }
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-emerald-400/90 to-cyan-300">{t("title")}</h1>
            <p className="text-muted-foreground">{t("description")}</p>
          </div>
        </div>
     
        <div className="max-w-md mx-auto rounded-2xl dark:bg-transparent bg-card/80 dark:border-0 border border-border dark:backdrop-blur-none backdrop-blur-sm overflow-hidden">
          <div className="p-5 space-y-5">
            {/* From Token Section */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-3 -my-2 border border-transparent hover:border-border hover:bg-muted/80 transition-all duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">{t("from")}</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs font-normal rounded-lg bg-secondary/60 text-secondary-foreground hover:bg-secondary cursor-pointer  "
                    onClick={handleMaxInput}
                  >
                    {t("max")}
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <TokenSelectorSwap
                  selectedToken={tokenIn}
                  onSelectToken={setTokenIn}
                  className="w-[130px] h-12 rounded-xl bg-card border-border"
                />
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    className="h-12 text-xl font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-right [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <WalletMinimal className="h-4 w-4" />
                  {t("balance")}: {isTokenInBalanceLoading ? 
                  <Skeleton className="inline-block h-4 w-16" /> : 
                  formatBalance(tokenInBalance, tokenInDecimals, tokenIn)
                }</span>
                <span className="text-muted-foreground">~${isTokenInBalanceLoading || !amountIn ? '0.00' : 
                  amountInUsd && parseFloat(amountInUsd) > 0 ? 
                  parseFloat(amountInUsd).toFixed(2) :
                  (parseFloat(amountIn) * getTokenPrice(getTokenSymbol(tokenIn))).toFixed(2)
                }</span>
              </div>
            </div>
            
            {/* Switch Button */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full bg-secondary hover:bg-accent border border-border text-foreground shadow-lg"
                // onClick={handleSwitchTokens}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
            </div>
            
            {/* To Token Section */}
            <div className="rounded-xl bg-muted/50 p-4 space-y-3 border border-transparent hover:border-border hover:bg-muted/80 transition-all duration-300">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">{t("to")}</span>
              </div>
              
              <div className="flex gap-3 items-center">
                <TokenSelectorSwap
                  selectedToken={tokenOut}
                  onSelectToken={setTokenOut}
                  className="w-[130px] h-12 rounded-xl bg-card border-border"
                />
                <div className="flex-1">
                  <Input
                    type="number"
                    placeholder="0.0"
                    value={amountOutMin}
                    readOnly
                    className="h-12 text-xl font-medium border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0 text-right"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <WalletMinimal className="h-4 w-4" />
                  {t("balance")}: {isTokenOutBalanceLoading ? 
                  <Skeleton className="inline-block h-4 w-16" /> : 
                  formatBalance(tokenOutBalance, tokenOutDecimals, tokenOut)
                }</span>
                <span className="text-muted-foreground">~${isTokenOutBalanceLoading || !amountOutMin ? '0.00' : 
                  amountOutUsd && parseFloat(amountOutUsd) > 0 ? 
                  parseFloat(amountOutUsd).toFixed(2) :
                  (parseFloat(amountOutMin) * getTokenPrice(getTokenSymbol(tokenOut))).toFixed(2)
                }</span>
              </div>
            </div>
            
            {/* Rate Display */}
            {amountIn && amountOutMin && (
              <div className="flex items-center justify-between text-sm px-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span>1 {getTokenSymbol(tokenIn)} ≈ {(parseFloat(amountOutMin) / parseFloat(amountIn)).toFixed(6)} {getTokenSymbol(tokenOut)}</span>
                  <button onClick={fetchKyberSwapEstimate} className="text-muted-foreground hover:text-foreground">
                    <RefreshCw className={`h-4 w-4 ${isCalculating ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Swap Details Section */}
            {amountIn && amountOutMin && (
              <div className="space-y-2 rounded-xl bg-muted/30 p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("minimumReceived")}</span>
                  <span className="font-medium">{minimumReceived || '0'} {getTokenSymbol(tokenOut)}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("router")}</span>
                  {swapDetails && swapDetails.routeSummary && swapDetails.routeSummary.route ? (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1 items-center">
                        {swapDetails.routeSummary.route.map((routeItem: any, index: number) => (
                          <React.Fragment key={index}>
                            {index > 0 && (
                              <div className="text-muted-foreground px-1">+</div>
                            )}
                            <span className="text-xs bg-secondary rounded px-1.5 py-0.5 flex items-center">
                              {routeItem[0]?.exchange ? (
                                <span className="capitalize">{routeItem[0].exchange.replace('-', ' ')}</span>
                              ) : (
                                `Route ${index+1}`
                              )}
                              <span className="ml-1 text-muted-foreground text-[10px]">
                                {Math.round((parseInt(routeItem[0]?.swapAmount || "0") / parseInt(swapDetails.routeSummary.amountIn)) * 100)}%
                              </span>
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <span className="text-xs bg-secondary rounded px-1.5 py-0.5">{getTokenSymbol(tokenIn)}</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground mx-0.5" />
                      <span className="text-xs bg-secondary rounded px-1.5 py-0.5">{getTokenSymbol(tokenOut)}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t("estimatedFees")}</span>
                  <span className="text-foreground/80">${formatUsdAmount(String(swapDetails?.gasUsd || '0'))}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-1">
                  <span className="text-muted-foreground">{t("slippageTolerance")}</span>
                  <div className="flex items-center gap-2">
                  <span className="text-foreground/80">{slippage}%</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Settings className="h-4 w-4" />
              </Button>

                  </div>
                 
                </div>
              </div>
            )}
            
            {/* Status Alert */}
            {renderStatusAlert()}
            
            {/* Action Button */}
            <div className="pt-2 pb-4">
              {!account ? (
                <RainbowButton 
                className="w-full font-medium text-lg"
                onClick={() => handleConnect("Kết nối ví của bạn")}
                >
                  {t("connectWallet")}
                </RainbowButton>
              ) : insufficientBalance ? (
                <RainbowButton 
                 className="w-full font-medium text-lg"
                  disabled
                >
                  {t("insufficientBalance")}
                </RainbowButton>
              ) : !tokenIn || !tokenOut || !amountIn || !amountOutMin ? (
                <RainbowButton 
                 className="w-full font-medium text-lg"
                  disabled
                >
                  {t("enterAmount")}
                </RainbowButton>
              ) : !isApproved ? (
                <RainbowButton
                  className="w-full font-medium text-lg"
                  onClick={handleApprove}
                  disabled={isPendingApprove}
                >
                  {isPendingApprove ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("approving")}
                    </>
                  ) : (
                    t("approve")
                  )}
                </RainbowButton>
              ) : (
                <RainbowButton
                  className="w-full h-14 font-medium text-lg"
                  onClick={handleSwap}
                  disabled={isSwapLoading}
                >
                  {isSwapLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      {t("swapping")}
                    </>
                  ) : (
                    t("swap")
                  )}
                </RainbowButton>
              )}
            </div>
          </div>
        </div>
        
        {/* Token Price Chart Cards - Moved Outside Main Card */}
        {account && tokenIn && tokenOut && (
          <div className="mt-6 grid grid-cols-2 gap-2 md:gap-4 max-w-md mx-auto">
            <TokenPriceChartCard 
              tokenAddress={tokenIn} 
              tokenSymbol={getTokenSymbol(tokenIn)}
              tokenImages={tokenImages} 
            />
            <TokenPriceChartCard 
              tokenAddress={tokenOut} 
              tokenSymbol={getTokenSymbol(tokenOut)}
              tokenImages={tokenImages}
            />
          </div>
        )}
        {/* Token Price Chart Cards - END */}

      </div>
      
      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t("settings")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("configureSwapSettings")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-base text-foreground">{t("slippageTolerance")}</Label>
                <span className="text-sm font-medium text-foreground/80">{slippage}%</span>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                {quickSlippageOptions.map((value) => (
                  <Button
                    key={value}
                    variant={slippage === value ? "default" : "outline"}
                    size="sm"
                    className={slippage === value 
                      ? "cursor-pointer bg-primary hover:bg-primary/90 border-none" 
                      : "cursor-pointer border-border text-foreground/80 hover:bg-muted"
                    }
                    onClick={() => setSlippage(value)}
                  >
                    {value}%
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Slider
                  value={[slippage]}
                  onValueChange={(value) => setSlippage(value[0])}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0.1%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsOpen(false)}
              className="cursor-pointer border-border text-foreground/80 hover:bg-muted"
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal xác nhận swap */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-lg bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">{t("confirmSwap")}</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("transactionDetails")}
            </DialogDescription>
          </DialogHeader>
          {swapDetails && (
            <div className="space-y-4">
              {/* Token swap display - redesigned */}
              <div className="space-y-2 p-4 border border-border rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium truncate max-w-[50%] md:max-w-[70%]" title={amountIn}>
                    {formatTokenAmount(amountIn)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getTokenSymbol(tokenIn)}</span>
                    <div className="w-7 h-7 overflow-hidden rounded-full bg-muted">
                      {tokenImages.find((t: TokenImage) => t.address === tokenIn)?.icon && (
                        <Image 
                          src={tokenImages.find((t: TokenImage) => t.address === tokenIn)?.icon || ""}
                          alt={getTokenSymbol(tokenIn)}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <ArrowDown className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium truncate max-w-[50%] md:max-w-[70%]" title={amountOutMin}>
                    {formatTokenAmount(amountOutMin)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{getTokenSymbol(tokenOut)}</span>
                    <div className="w-7 h-7 overflow-hidden rounded-full bg-muted">
                      {tokenImages.find((t: TokenImage) => t.address === tokenOut)?.icon && (
                        <Image 
                          src={tokenImages.find((t: TokenImage) => t.address === tokenOut)?.icon || ""}
                          alt={getTokenSymbol(tokenOut)}
                          width={28}
                          height={28}
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-2">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-muted-foreground">{t("transactionDetails")}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">{t("priceImpact")}</span>
                    <span className={parseFloat(swapDetails.priceImpact) > 5 ? "text-destructive" : "text-foreground/80"}>
                      {swapDetails.priceImpact}%
                    </span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">{t("amountInUSD")}</span>
                    <span className="text-foreground/80">${formatUsdAmount(String(swapDetails.amountInUSD || '0'))}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">{t("amountOutUSD")}</span>
                    <span className="text-foreground/80">${formatUsdAmount(String(swapDetails.amountOutUSD || '0'))}</span>
                  </div>
                  <div className="flex justify-between col-span-2">
                    <span className="text-muted-foreground">{t("tradingFee")}</span>
                    <span className="text-foreground/80">${formatUsdAmount(String(swapDetails.gasUsd || '0'))}</span>
                  </div>
                </div>
                
                {parseFloat(swapDetails.priceImpact) > 3 && (
                  <Alert className="mt-2 bg-destructive/20 border-destructive-foreground text-destructive">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertTitle className="text-destructive">{t("warning")}</AlertTitle>
                    <AlertDescription className="text-destructive/80">
                      {t("highPriceImpact")}
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          )}
          <DialogFooter className="mt-4">
            <Button
              onClick={executeSwap} 
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium cursor-pointer"
              disabled={isSwapLoading}
            >
              {isSwapLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("sendingTransaction")}
                </>
              ) : (
                t("confirmSwap")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={isSuccessModalOpen} onOpenChange={(isOpen) => {
        setIsSuccessModalOpen(isOpen);
        if (!isOpen) {
          refetchTokenInBalance();
          refetchTokenOutBalance();
          refetchNativeBnbWalletBalance();
        }
      }}>
        <DialogContent className="max-w-md bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="text-green-500 flex items-center">
              <CheckCircle className="h-6 w-6 mr-2" />
              {t("swapSuccessfulTitle")}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {t("swapSuccessfulDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {successTxHash && (
              <p className="text-sm text-muted-foreground">
                {t("yourTransactionHash")}:{" "}
                <a
                  href={`https://bscscan.com/tx/${successTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline break-all"
                >
                  {successTxHash}
                </a>
              </p>
            )}
            {/* Optional: Add Token to Wallet button */}
            {/* Ví dụ:
            {tokenOut !== BNB && (
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={async () => {
                  try {
                    const tokenOutInfo = tokenTypes.find(t => t.tokenAddress === tokenOut);
                    if (activeAccount && activeAccount.extensions?.wallet && tokenOutInfo) {
                      await activeAccount.extensions.wallet.watchAsset({
                        type: "ERC20",
                        options: {
                          address: tokenOut,
                          symbol: getTokenSymbol(tokenOut),
                          decimals: getTokenDecimals(tokenOut),
                          image: tokenImages.find(ti => ti.address === tokenOut)?.icon
                        }
                      });
                      toast.success(\`\${getTokenSymbol(tokenOut)} đã được thêm vào ví của bạn!\`)
                    }
                  } catch (e) {
                    toast.error("Không thể thêm token vào ví.");
                    console.error("Failed to add token to wallet", e);
                  }
                }}
              >
                Thêm {getTokenSymbol(tokenOut)} vào ví
              </Button>
            )}
            */}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsSuccessModalOpen(false);
                refetchTokenInBalance();
                refetchTokenOutBalance();
                refetchNativeBnbWalletBalance();
              }}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {t("close")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}