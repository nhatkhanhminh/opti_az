"use client";

import { useState, useEffect } from "react";

// Import UI components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle, RotateCw, Database, ArrowRight, RefreshCcw, Calculator, Copy, Check, ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// Types
interface Investment {
  stakeId: number;
  userAddress: string;
  planId: number;
  token: string;
  amount: number;
  usdtValue: number;
  totalClaimed: number;
  lastClaimDate: string;
  nextClaimDate: string;
  startDate: string;
  status: string;
  rawData?: any;
}

// Hàm rút gọn địa chỉ ví
function shortenWalletAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  
  // Handle case where address is too short to shorten
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  // Extract the start and end portions and combine them with ellipsis
  const start = address.slice(0, startChars);
  const end = address.slice(-endChars);
  
  return `${start}...${end}`;
}

export default function StakeDataSync() {
  const [status, setStatus] = useState("");
  const [stakeCount, setStakeCount] = useState<number | null>(null);
  const [isLoadingCounter, setIsLoadingCounter] = useState(false);
  const [currentStakeId, setCurrentStakeId] = useState<number | null>(null);
  const [currentStakeData, setCurrentStakeData] = useState<any>(null);
  const [isLoadingStakeData, setIsLoadingStakeData] = useState(false);
  const [syncResults, setSyncResults] = useState<{
    total: number;
    processed: number;
    success: number;
    failed: number;
    inProgress: boolean;
    isNewOnly: boolean;
  }>({
    total: 0,
    processed: 0,
    success: 0,
    failed: 0,
    inProgress: false,
    isNewOnly: false
  });
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoadingInvestments, setIsLoadingInvestments] = useState(false);
  const [userAddress, setUserAddress] = useState<string>("");
  const [isUpdatingInvestment, setIsUpdatingInvestment] = useState(false);
  const [updateStats, setUpdateStats] = useState<any>(null);
  const [updateResults, setUpdateResults] = useState<any>(null);
  const [onlyHighValue, setOnlyHighValue] = useState<boolean>(false);
  const [highValueStakes, setHighValueStakes] = useState<number[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState({
    total: 0,
    scanned: 0,
    found: 0
  });
  const [scanRange, setScanRange] = useState({
    start: 1,
    end: 100,
    batchSize: 5
  });
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
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Lấy số lượng stake
  const fetchStakeCounter = async () => {
    try {
      setIsLoadingCounter(true);
      const response = await fetch('/api/update-blockchain-data/get-stake-counter');
      const data = await response.json();
      
      if (data.success) {
        setStakeCount(data.data.count - 1); // -1 vì stakeIdCounter là số lượng stake + 1
      } else {
        setStakeCount(null);
        setStatus("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lấy số lượng stake:", error);
      setStakeCount(null);
      setStatus("Lỗi khi truy vấn blockchain");
    } finally {
      setIsLoadingCounter(false);
    }
  };

  // Lấy dữ liệu của một stake cụ thể
  const fetchStakeData = async (stakeId: number) => {
    try {
      setIsLoadingStakeData(true);
      const response = await fetch('/api/update-blockchain-data/get-stake-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stakeId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentStakeData(data.data);
      } else {
        setCurrentStakeData(null);
        setStatus("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error(`Lỗi khi lấy dữ liệu stake ${stakeId}:`, error);
      setCurrentStakeData(null);
      setStatus("Lỗi khi truy vấn blockchain");
    } finally {
      setIsLoadingStakeData(false);
    }
  };

  // Lưu dữ liệu stake vào cơ sở dữ liệu
  const saveStakeData = async () => {
    if (!currentStakeData) {
      setStatus("Không có dữ liệu stake để lưu");
      return;
    }

    // Kiểm tra nếu usdtAmount dưới 5 thì bỏ qua
    if (parseFloat(currentStakeData.usdtAmount) < 5) {
      setStatus("Bỏ qua stake có giá trị USDT dưới 5");
      return;
    }

    try {
      setStatus("Đang lưu dữ liệu stake...");
      const response = await fetch('/api/update-blockchain-data/sync-investments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          stakeData: currentStakeData,
          onlyHighValue 
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus("Lưu dữ liệu stake thành công!");
        fetchInvestments();
      } else {
        setStatus("Lỗi khi lưu dữ liệu: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi lưu dữ liệu stake:", error);
      setStatus("Lỗi khi lưu dữ liệu vào cơ sở dữ liệu");
    }
  };

  // Hàm đồng bộ tất cả stake
  const syncAllStakes = async () => {
    if (stakeCount === null) {
      setStatus("Chưa có thông tin số lượng stake");
      return;
    }

    try {
      setSyncResults({
        total: stakeCount,
        processed: 0,
        success: 0,
        failed: 0,
        inProgress: true,
        isNewOnly: false
      });

      let successCount = 0;
      let failedCount = 0;

      // Hàm delay để tránh spam API
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

      // Hàm thử lại lấy dữ liệu stake với số lần thử tối đa
      const fetchStakeWithRetry = async (stakeId: number, maxRetries = 3) => {
        let retries = 0;
        
        while (retries < maxRetries) {
          try {
            // Trễ giữa các request để tránh spam API
            if (retries > 0) {
              setStatus(`Đang thử lại lần ${retries} cho stake #${stakeId}...`);
              // Tăng thời gian chờ sau mỗi lần thử lại
              await delay(1000 * retries);
            } else {
              // Thêm độ trễ nhỏ ngay cả với lần đầu tiên để tránh quá tải API
              await delay(300);
            }
            
            const stakeResponse = await fetch('/api/update-blockchain-data/get-stake-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ stakeId }),
            });
            
            const stakeData = await stakeResponse.json();
            
            if (stakeData.success) {
              // Kiểm tra nếu usdtAmount dưới 5 thì bỏ qua
              if (parseFloat(stakeData.data.usdtAmount) < 5) {
                setStatus(`Bỏ qua stake #${stakeId} có giá trị USDT dưới 5`);
                retries++;
                continue;
              }

              return stakeData;
            }
            
            // Nếu không thành công, tăng số lần thử
            retries++;
          } catch (error) {
            console.error(`Lỗi khi thử lấy dữ liệu stake ${stakeId} lần ${retries}:`, error);
            
            // Kiểm tra nếu là lỗi AbiDecodingZeroDataError thì tăng thời gian chờ lâu hơn
            if (error instanceof Error && error.toString().includes('AbiDecodingZeroDataError')) {
              setStatus(`Phát hiện lỗi AbiDecodingZeroDataError cho stake #${stakeId}, đang chờ dài hơn...`);
              await delay(2000 * (retries + 1)); // Chờ lâu hơn khi gặp lỗi này
            }
            
            retries++;
          }
        }
        
        // Sau số lần thử tối đa, trả về null
        return null;
      };

      // Lặp qua từng stake ID (bắt đầu từ 1)
      for (let i = 1; i <= stakeCount; i++) {
        setStatus(`Đang xử lý stake ${i}/${stakeCount}`);
        
        try {
          // Trễ giữa các request để tránh spam API
          await delay(500);
          
          // Lấy thông tin stake với chức năng thử lại
          const stakeData = await fetchStakeWithRetry(i);
          
          if (stakeData && stakeData.success) {
            // Kiểm tra nếu usdtAmount dưới 5 thì bỏ qua
            if (parseFloat(stakeData.data.usdtAmount) < 5) {
              setStatus(`Bỏ qua stake #${i} có giá trị USDT dưới 5`);
              continue;
            }

            // Lưu thông tin stake vào DB
            const saveResponse = await fetch('/api/update-blockchain-data/sync-investments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                stakeData: stakeData.data,
                onlyHighValue
              }),
            });
            
            const saveResult = await saveResponse.json();
            
            if (saveResult.success) {
              successCount++;
              setStatus(`Đã lưu thành công stake #${i}`);
            } else {
              failedCount++;
              setStatus(`Không thể lưu stake #${i} vào DB: ${saveResult.message || 'Lỗi không xác định'}`);
            }
          } else {
            failedCount++;
            setStatus(`Không thể lấy dữ liệu stake #${i} sau nhiều lần thử`);
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý stake ${i}:`, error);
          failedCount++;
          setStatus(`Lỗi khi xử lý stake #${i}`);
        }

        // Cập nhật kết quả
        setSyncResults(prev => ({
          ...prev,
          processed: i,
          success: successCount,
          failed: failedCount
        }));
      }

      setStatus(`Đã hoàn thành đồng bộ ${successCount}/${stakeCount} stake`);
      fetchInvestments(); // Cập nhật danh sách investments
    } catch (error) {
      console.error("Lỗi khi đồng bộ tất cả stake:", error);
      setStatus("Lỗi khi đồng bộ tất cả stake");
    } finally {
      setSyncResults(prev => ({...prev, inProgress: false}));
    }
  };

  // Hàm đồng bộ chỉ các stake mới
  const syncNewStakes = async () => {
    try {
      // Xác định stake ID lớn nhất hiện có trong DB
      let maxExistingStakeId = 0;
      if (investments.length > 0) {
        maxExistingStakeId = Math.max(...investments.map(inv => inv.stakeId));
      }
      
      // Lấy số lượng stake hiện tại từ blockchain
      await fetchStakeCounter();
      
      if (stakeCount === null) {
        setStatus("Không thể lấy số lượng stake từ blockchain");
        return;
      }
      
      if (maxExistingStakeId >= stakeCount) {
        setStatus("Không có stake mới để cập nhật");
        return;
      }
      
      // Số lượng stake mới cần cập nhật
      const newStakesCount = stakeCount - maxExistingStakeId;
      
      setSyncResults({
        total: newStakesCount,
        processed: 0,
        success: 0,
        failed: 0,
        inProgress: true,
        isNewOnly: true
      });
      
      let successCount = 0;
      let failedCount = 0;
      // Tạo một Set để lưu các địa chỉ ví độc nhất cần cập nhật
      const userAddressesToUpdate = new Set<string>();
      
      // Hàm delay để tránh spam API
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Hàm thử lại lấy dữ liệu stake với số lần thử tối đa
      const fetchStakeWithRetry = async (stakeId: number, maxRetries = 3) => {
        let retries = 0;
        
        while (retries < maxRetries) {
          try {
            if (retries > 0) {
              setStatus(`Đang thử lại lần ${retries} cho stake #${stakeId}...`);
              await delay(1000 * retries);
            } else {
              // Thêm độ trễ nhỏ ngay cả với lần đầu tiên để tránh quá tải API
              await delay(300);
            }
            
            const stakeResponse = await fetch('/api/update-blockchain-data/get-stake-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ stakeId }),
            });
            
            const stakeData = await stakeResponse.json();
            
            if (stakeData.success) {
              // Kiểm tra nếu usdtAmount dưới 5 thì bỏ qua
              if (parseFloat(stakeData.data.usdtAmount) < 5) {
                setStatus(`Bỏ qua stake mới #${stakeId} có giá trị USDT dưới 5`);
                retries++;
                continue;
              }

              return stakeData;
            }
            
            retries++;
          } catch (error) {
            console.error(`Lỗi khi thử lấy dữ liệu stake ${stakeId} lần ${retries}:`, error);
            
            // Kiểm tra nếu là lỗi AbiDecodingZeroDataError thì tăng thời gian chờ lâu hơn
            if (error instanceof Error && error.toString().includes('AbiDecodingZeroDataError')) {
              setStatus(`Phát hiện lỗi AbiDecodingZeroDataError cho stake #${stakeId}, đang chờ dài hơn...`);
              await delay(2000 * (retries + 1)); // Chờ lâu hơn khi gặp lỗi này
            }
            
            retries++;
          }
        }
        
        return null;
      };
      
      // Lặp qua các stake ID mới (từ maxExistingStakeId + 1 đến stakeCount)
      for (let i = maxExistingStakeId + 1; i <= stakeCount; i++) {
        setStatus(`Đang xử lý stake mới ${i - maxExistingStakeId}/${newStakesCount} (ID: ${i})`);
        
        try {
          await delay(500);
          
          const stakeData = await fetchStakeWithRetry(i);
          
          if (stakeData && stakeData.success) {
            // Kiểm tra nếu usdtAmount dưới 5 thì bỏ qua
            if (parseFloat(stakeData.data.usdtAmount) < 5) {
              setStatus(`Bỏ qua stake mới #${i} có giá trị USDT dưới 5`);
              continue;
            }
            
            // Lưu địa chỉ người dùng để cập nhật tổng đầu tư
            if (stakeData.data && stakeData.data.user) {
              userAddressesToUpdate.add(stakeData.data.user);
            }
            
            const saveResponse = await fetch('/api/update-blockchain-data/sync-investments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                stakeData: stakeData.data,
                onlyHighValue
              }),
            });
            //cập nhật tổng đầu tư cho user
            const response = await fetch('/api/update-blockchain-data/update-user-investment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userAddress: stakeData.data.user, 
              }),
            });

            const saveResult = await saveResponse.json();
            const updateResult = await response.json();

            if (updateResult.success) {
              setStatus(`Đã cập nhật tổng đầu tư cho địa chỉ ${stakeData.data.user}`);
            } else {
              console.error(`Lỗi khi cập nhật tổng đầu tư cho địa chỉ ${stakeData.data.user}:`, updateResult.message);
            }
            if (saveResult.success) {
              successCount++;
              setStatus(`Đã lưu thành công stake mới #${i}`);
            } else {
              failedCount++;
              setStatus(`Không thể lưu stake #${i} vào DB: ${saveResult.message || 'Lỗi không xác định'}`);
            }
          } else {
            failedCount++;
            setStatus(`Không thể lấy dữ liệu stake #${i} sau nhiều lần thử`);
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý stake ${i}:`, error);
          failedCount++;
          setStatus(`Lỗi khi xử lý stake #${i}`);
        }
        
        setSyncResults(prev => ({
          ...prev,
          processed: i - maxExistingStakeId,
          success: successCount,
          failed: failedCount
        }));
      }
      
      setStatus(`Đã hoàn thành đồng bộ ${successCount}/${newStakesCount} stake mới`);
      fetchInvestments(); // Cập nhật danh sách investments
      
      // Cập nhật tổng đầu tư cho các địa chỉ ví mới
      if (userAddressesToUpdate.size > 0) {
        setStatus(`Đang cập nhật tổng đầu tư cho ${userAddressesToUpdate.size} địa chỉ ví...`);
        
        for (const address of userAddressesToUpdate) {
          try {
            const response = await fetch('/api/update-blockchain-data/update-user-investment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                userAddress: address 
              }),
            });
            
            const data = await response.json();
            if (!data.success) {
              console.error(`Lỗi khi cập nhật tổng đầu tư cho địa chỉ ${address}:`, data.message);
            }
          } catch (error) {
            console.error(`Lỗi khi cập nhật tổng đầu tư cho địa chỉ ${address}:`, error);
          }
          
          // Nghỉ ngắn giữa các yêu cầu
          await delay(300);
        }
        
        setStatus(`Đã hoàn thành đồng bộ ${successCount}/${newStakesCount} stake mới và cập nhật tổng đầu tư cho ${userAddressesToUpdate.size} địa chỉ ví`);
      }
      
    } catch (error) {
      console.error("Lỗi khi đồng bộ stake mới:", error);
      setStatus("Lỗi khi đồng bộ stake mới");
    } finally {
      setSyncResults(prev => ({...prev, inProgress: false}));
    }
  };

  // Lấy danh sách investment từ DB
  const fetchInvestments = async () => {
    try {
      setIsLoadingInvestments(true);
      const response = await fetch('/api/investments');
      const data = await response.json();
      
      if (data.success) {
        setInvestments(data.data);
      } else {
        setInvestments([]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách investments:", error);
      setInvestments([]);
    } finally {
      setIsLoadingInvestments(false);
    }
  };

  // Cập nhật tổng đầu tư cho tất cả người dùng
  const updateUserInvestment = async () => {
    try {
      setIsUpdatingInvestment(true);
      setStatus("Đang cập nhật tổng đầu tư...");
      
      const response = await fetch('/api/update-blockchain-data/update-user-investment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          userAddress: userAddress.trim() || undefined // Nếu rỗng, cập nhật tất cả
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(`Cập nhật tổng đầu tư thành công! Đã xử lý ${data.stats.totalProcessed} địa chỉ.`);
        setUpdateStats(data.stats);
        setUpdateResults(data);
      } else {
        setStatus("Lỗi: " + data.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật tổng đầu tư:", error);
      setStatus("Lỗi khi cập nhật tổng đầu tư");
    } finally {
      setIsUpdatingInvestment(false);
    }
  };

  // Thêm hàm cập nhật tổng đầu tư cho tất cả các ví trong bảng User
  const updateAllUserInvestments = async () => {
    try {
      setIsUpdatingInvestment(true);
      setStatus("Đang cập nhật tổng đầu tư cho tất cả các ví...");

      // Lấy danh sách tất cả các ví từ bảng User
      const response = await fetch('/api/update-blockchain-data/all-wallets');
      const data = await response.json();

      if (!data.success) {
        setStatus("Lỗi: Không thể lấy danh sách ví từ bảng User");
        return;
      }

      const wallets = data.data;
      let processedCount = 0;

      for (const wallet of wallets) {
        try {
          setStatus(`Đang cập nhật tổng đầu tư cho ví: ${wallet} (${processedCount + 1}/${wallets.length})`);

          const updateResponse = await fetch('/api/update-blockchain-data/update-user-investment', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userAddress: wallet }),
          });

          const updateData = await updateResponse.json();

          if (!updateData.success) {
            console.error(`Lỗi khi cập nhật ví ${wallet}:`, updateData.message);
          }

          // Chờ 2 giây trước khi xử lý ví tiếp theo
          await new Promise(resolve => setTimeout(resolve, 2000));
          processedCount++;
        } catch (error) {
          console.error(`Lỗi khi xử lý ví ${wallet}:`, error);
        }
      }

      setStatus(`Đã hoàn thành cập nhật tổng đầu tư cho ${processedCount}/${wallets.length} ví.`);
    } catch (error) {
      console.error("Lỗi khi cập nhật tổng đầu tư cho tất cả các ví:", error);
      setStatus("Lỗi khi cập nhật tổng đầu tư cho tất cả các ví");
    } finally {
      setIsUpdatingInvestment(false);
    }
  };

  // Xử lý khi nhập ID stake
  const handleStakeIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCurrentStakeId(value);
    } else {
      setCurrentStakeId(null);
    }
  };

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    fetchStakeCounter();
    fetchInvestments();
  }, []);

  // Xác định loại trạng thái để hiển thị màu phù hợp
  const getStatusVariant = () => {
    if (status.includes('thành công')) return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
    if (status.includes('Đang xử lý') || status.includes('Đang cập nhật')) return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
    return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
  };

  // Hàm quét tìm stake có giá trị cao
  const scanForHighValueStakes = async () => {
    if (stakeCount === null) {
      setStatus("Chưa có thông tin số lượng stake");
      return;
    }

    try {
      // Khởi tạo biến theo dõi
      setIsScanning(true);
      setHighValueStakes([]);
      const highValueFound: number[] = [];
      
      // Xác định phạm vi quét
      const startId = Math.max(1, scanRange.start);
      const endId = scanRange.end > 0 ? Math.min(scanRange.end, stakeCount) : stakeCount;
      
      setScanProgress({
        total: endId - startId + 1,
        scanned: 0,
        found: 0
      });

      setStatus(`Bắt đầu quét từ stake #${startId} đến #${endId} (batchSize=${scanRange.batchSize})`);
      
      // Hàm delay để tránh spam API
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      // Quét theo batch để tăng tốc độ
      for (let i = startId; i <= endId; i += scanRange.batchSize) {
        // Tạo mảng các promises để xử lý song song
        const batchPromises = [];
        
        // Tạo batch các promise
        for (let j = 0; j < scanRange.batchSize && i + j <= endId; j++) {
          const stakeId = i + j;
          
          // Thêm promise vào batch
          batchPromises.push(
            fetch('/api/update-blockchain-data/get-stake-data', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ stakeId }),
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                // Kiểm tra giá trị
                // Thử cả hai phương pháp đọc giá trị
                let usdtValue = 0;
                try {
                  // Phương pháp 1: Sử dụng giá trị đã được định dạng
                  usdtValue = parseFloat(data.data.formatted.usdtAmount.replace(/,/g, ''));
                } catch (e) {
                  // Bỏ qua lỗi
                }
                
                if (isNaN(usdtValue) || usdtValue < 1000) {
                  // Phương pháp 2: Thử tính thủ công
                  try {
                    const rawValue = data.data.usdtAmount;
                    // Tính giá trị chuyển đổi từ wei sang ether (18 decimals)
                    const cleanValue = rawValue.toString().replace(/[^\d]/g, '');
                    if (cleanValue.length > 18) { // 18 decimals 
                      const intPartLength = cleanValue.length - 18; // 18 decimals
                      const intPart = cleanValue.substring(0, intPartLength);
                      usdtValue = parseInt(intPart);
                    }
                  } catch (e) {
                    // Bỏ qua lỗi
                  }
                }
                
                // Nếu giá trị trên 1000, lưu lại
                if (usdtValue >= 1000) {
                  highValueFound.push(stakeId);
                  return { stakeId, value: usdtValue, success: true };
                }
              }
              return { stakeId, success: false };
            })
            .catch(error => {
              console.error(`Lỗi khi quét stake #${stakeId}:`, error);
              return { stakeId, success: false };
            })
          );
        }
        
        // Chờ tất cả các promise trong batch hoàn thành
        const results = await Promise.all(batchPromises);
        
        // Cập nhật tiến trình
        setScanProgress(prev => ({
          ...prev,
          scanned: prev.scanned + results.length,
          found: highValueFound.length
        }));
        
        // Cập nhật danh sách stake giá trị cao
        setHighValueStakes([...highValueFound]);
        
        // Hiển thị trạng thái
        setStatus(`Đã quét ${highValueFound.length > 0 ? highValueFound.length : 'chưa có'} stake giá trị cao (đã quét ${i + batchPromises.length - 1}/${endId})`);
        
        // Tạm dừng ngắn để tránh quá tải
        await delay(300);
      }
      
      // Hiển thị kết quả cuối cùng
      setStatus(`Hoàn thành quét! Tìm thấy ${highValueFound.length} stake có giá trị trên 1000 USDT`);
      
    } catch (error) {
      console.error("Lỗi khi quét stake giá trị cao:", error);
      setStatus("Lỗi khi quét stake giá trị cao");
    } finally {
      setIsScanning(false);
    }
  };
  
  // Hàm đồng bộ các stake có giá trị cao đã tìm thấy
  const syncHighValueStakes = async () => {
    if (highValueStakes.length === 0) {
      setStatus("Chưa có stake giá trị cao nào được tìm thấy");
      return;
    }
    
    try {
      setSyncResults({
        total: highValueStakes.length,
        processed: 0,
        success: 0,
        failed: 0,
        inProgress: true,
        isNewOnly: false
      });
      
      let successCount = 0;
      let failedCount = 0;
      
      // Hàm delay để tránh spam API
      const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      for (let i = 0; i < highValueStakes.length; i++) {
        const stakeId = highValueStakes[i];
        setStatus(`Đang đồng bộ stake #${stakeId} (${i+1}/${highValueStakes.length})`);
        
        try {
          // Trễ giữa các request để tránh spam API
          await delay(500);
          
          // Lấy thông tin stake
          const stakeResponse = await fetch('/api/update-blockchain-data/get-stake-data', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stakeId }),
          });
          
          const stakeData = await stakeResponse.json();
          
          if (stakeData && stakeData.success) {
            // Lưu thông tin stake vào DB với chế độ only high value đã bật sẵn
            const saveResponse = await fetch('/api/update-blockchain-data/sync-investments', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ 
                stakeData: stakeData.data,
                onlyHighValue: true  // Bật chế độ cao cấp để đảm bảo chỉ lưu giá trị cao
              }),
            });
            
            const saveResult = await saveResponse.json();
            
            if (saveResult.success) {
              successCount++;
              setStatus(`Đã lưu thành công stake #${stakeId}`);
            } else {
              failedCount++;
              setStatus(`Không thể lưu stake #${stakeId} vào DB: ${saveResult.message || 'Lỗi không xác định'}`);
            }
          } else {
            failedCount++;
            setStatus(`Không thể lấy dữ liệu stake #${stakeId}`);
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý stake ${stakeId}:`, error);
          failedCount++;
          setStatus(`Lỗi khi xử lý stake #${stakeId}`);
        }
        
        // Cập nhật kết quả
        setSyncResults(prev => ({
          ...prev,
          processed: i + 1,
          success: successCount,
          failed: failedCount
        }));
      }
      
      setStatus(`Đã hoàn thành đồng bộ ${successCount}/${highValueStakes.length} stake giá trị cao`);
      fetchInvestments(); // Cập nhật danh sách investments
      
    } catch (error) {
      console.error("Lỗi khi đồng bộ stake giá trị cao:", error);
      setStatus("Lỗi khi đồng bộ stake giá trị cao");
    } finally {
      setSyncResults(prev => ({...prev, inProgress: false}));
    }
  };

  // Tính tổng chi phí claim theo token từ danh sách investments
  const calculateClaimStatsByToken = () => {
    if (investments.length === 0) {
      setStatus("Không có dữ liệu đầu tư để tính");
      return;
    }
    
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
        .filter(inv => inv.totalClaimed > 0)
        .sort((a, b) => b.totalClaimed - a.totalClaimed)
        .slice(0, 5)
        .map(inv => ({
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

  // Hàm xử lý copy địa chỉ vào clipboard
  const copyToClipboard = (address: string) => {
    navigator.clipboard.writeText(address)
      .then(() => {
        setCopiedAddress(address);
        // Tự động reset trạng thái sau 2 giây
        setTimeout(() => setCopiedAddress(null), 2000);
      })
      .catch((err) => console.error("Không thể sao chép địa chỉ: ", err));
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <h1 className="text-2xl font-bold">SYNC STAKE</h1>
        <Link href="/testing1/ref">
        <Button variant="outline" >
          <ArrowRight className="h-4 w-4 mr-2" />
          Update Volume
        </Button>
        </Link>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Đồng bộ tất cả Stake</CardTitle>
                <CardDescription>Lưu tất cả dữ liệu stake từ blockchain vào cơ sở dữ liệu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {/* <div className="flex items-center space-x-2">
                  <Switch
                    id="high-value-mode"
                    checked={onlyHighValue}
                    onCheckedChange={setOnlyHighValue}
                  />
                  <Label htmlFor="high-value-mode">Chỉ đồng bộ stake có giá trị trên 1000 USDT</Label>
                </div> */}
                
                {syncResults.inProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Tiến trình: {syncResults.processed}/{syncResults.total}</span>
                      <span>{Math.round((syncResults.processed / syncResults.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.round((syncResults.processed / syncResults.total) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                
                {syncResults.processed > 0 && (
                  <div className="p-3 bg-muted rounded-md space-y-1 text-sm">
                    <h3 className="font-medium mb-1">Kết quả đồng bộ</h3>
                    <p className="flex justify-between">
                      <span>Tổng số stake:</span>
                      <span className="font-medium">{syncResults.total}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Đã xử lý:</span>
                      <span className="font-medium">{syncResults.processed}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Thành công:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{syncResults.success}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Thất bại:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{syncResults.failed}</span>
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                {/* <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={syncAllStakes}
                  disabled={syncResults.inProgress || stakeCount === null}
                >
                  {syncResults.inProgress && !syncResults.isNewOnly ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đồng bộ...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Đồng bộ tất cả
                    </>
                  )}
                </Button> */}
                
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={syncNewStakes}
                  disabled={syncResults.inProgress || stakeCount === null}
                >
                  {syncResults.inProgress && syncResults.isNewOnly ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4 cursor-pointer" />
                      Cập nhật stake mới
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
             <Card>
            <CardHeader>
              <CardTitle>Cập nhật tổng đầu tư</CardTitle>
              <CardDescription>
                Cập nhật các trường trong bảng User từ bảng Investment:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li><strong>totalInvestment</strong>: Tổng giá trị đầu tư USDT (tất cả trạng thái)</li>
                  <li><strong>activeInvestment</strong>: Tổng giá trị đầu tư USDT đang hoạt động (chỉ trạng thái "active")</li>
                  <li><strong>totalEarned</strong>: Tổng lãi đã kiếm được từ tất cả đầu tư</li>
                </ul>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Input 
                  placeholder="Địa chỉ ví (để trống để cập nhật tất cả)" 
                  value={userAddress} 
                  onChange={(e) => setUserAddress(e.target.value)} 
                  className="max-w-xs"
                />
                <Button 
                  onClick={updateUserInvestment} 
                  disabled={isUpdatingInvestment}
                  className="flex items-center gap-2"
                >
                  {isUpdatingInvestment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      <span>Cập nhật tổng đầu tư</span>
                    </>
                  )}
                </Button>
                {/* <Button 
                  onClick={updateAllUserInvestments} 
                  disabled={isUpdatingInvestment}
                  className="flex items-center gap-2"
                >
                  {isUpdatingInvestment ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Đang cập nhật tất cả...</span>
                    </>
                  ) : (
                    <>
                      <Calculator className="h-4 w-4" />
                      <span>Cập nhật tất cả ví</span>
                    </>
                  )}
                </Button> */}
              </div>

              {updateResults && updateStats && (
                <div className="p-4 border rounded-md mt-4 bg-muted/50">
                  <h3 className="font-medium mb-2">Kết quả cập nhật</h3>
                  <div className="space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span>Tổng số xử lý:</span>
                      <span className="font-medium">{updateStats.totalProcessed}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Đã cập nhật:</span>
                      <span className="font-medium text-blue-600 dark:text-blue-400">{updateStats.updated}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Đã tạo mới:</span>
                      <span className="font-medium text-green-600 dark:text-green-400">{updateStats.created}</span>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            
           
            
            {/* <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Quét nhanh stake giá trị cao</CardTitle>
                <CardDescription>Tìm và đồng bộ chỉ các stake có giá trị trên 1000 USDT</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="scan-start">ID bắt đầu:</Label>
                    <Input
                      id="scan-start"
                      type="number"
                      min="1"
                      value={scanRange.start}
                      onChange={(e) => setScanRange(prev => ({...prev, start: parseInt(e.target.value) || 1}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="scan-end">ID kết thúc:</Label>
                    <Input
                      id="scan-end"
                      type="number"
                      min="1"
                      value={scanRange.end}
                      onChange={(e) => setScanRange(prev => ({...prev, end: parseInt(e.target.value) || 100}))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="batch-size">Kích thước batch:</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      min="1"
                      max="10"
                      value={scanRange.batchSize}
                      onChange={(e) => setScanRange(prev => ({...prev, batchSize: parseInt(e.target.value) || 5}))}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                {isScanning && (
                  <div className="space-y-2">
                    <div className="flex justify-between mb-1 text-sm">
                      <span>Tiến trình quét: {scanProgress.scanned}/{scanProgress.total}</span>
                      <span>{Math.round((scanProgress.scanned / scanProgress.total) * 100)}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${Math.round((scanProgress.scanned / scanProgress.total) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-center">Đã tìm thấy <span className="font-bold">{scanProgress.found}</span> stake có giá trị cao</p>
                  </div>
                )}
                
                {!isScanning && highValueStakes.length > 0 && (
                  <div className="p-3 bg-muted rounded-md space-y-1">
                    <p className="font-medium">Đã tìm thấy {highValueStakes.length} stake có giá trị cao:</p>
                    <div className="max-h-24 overflow-y-auto text-sm">
                      <div className="flex flex-wrap gap-1">
                        {highValueStakes.map(id => (
                          <Badge key={id} variant="outline" className="cursor-pointer" onClick={() => {
                            setCurrentStakeId(id);
                            fetchStakeData(id);
                          }}>
                            #{id}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={scanForHighValueStakes}
                  disabled={isScanning || syncResults.inProgress}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang quét...
                    </>
                  ) : (
                    <>
                      <Database className="mr-2 h-4 w-4" />
                      Quét tìm stake giá trị cao
                    </>
                  )}
                </Button>
                
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={syncHighValueStakes}
                  disabled={isScanning || syncResults.inProgress || highValueStakes.length === 0}
                >
                  {syncResults.inProgress ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang đồng bộ...
                    </>
                  ) : (
                    <>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Đồng bộ {highValueStakes.length} stake giá trị cao
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card> */}
          </div>

      
      {/* Bảng danh sách investments */}
      <Card className="mb-6">
        {status && (
        <div className={`p-4 rounded-lg mb-4 flex items-center ${getStatusVariant()}`}>
          {status.includes('thành công') ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : status.includes('Đang xử lý') || status.includes('Đang cập nhật') ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {status}
        </div>
      )}
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>Danh sách đầu tư đã đồng bộ</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchInvestments}
              disabled={isLoadingInvestments}
              className="h-8"
            >
              {isLoadingInvestments ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCw className="h-4 w-4" />
              )}
              <span className="ml-1">Làm mới</span>
            </Button>
          </div>
          <CardDescription>Danh sách các đầu tư đã được đồng bộ từ blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingInvestments ? (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Đang tải danh sách đầu tư...</span>
            </div>
          ) : investments.length > 0 ? (
            <div className="border rounded-md max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Người dùng</TableHead>
                      <TableHead className="text-right">Giá trị (USDT)</TableHead>
                    <TableHead>Token</TableHead>
                  
                    <TableHead className="text-center">Trạng thái</TableHead>
                    <TableHead className="text-right">Ngày bắt đầu</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {investments.map((investment, index) => (
                    <TableRow key={investment.stakeId} className="hover:bg-muted/50">
                      <TableCell>{investment.stakeId}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span className="font-mono text-xs">{shortenWalletAddress(investment.userAddress)}</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 ml-1 cursor-pointer" 
                            onClick={() => copyToClipboard(investment.userAddress)}
                          >
                            {copiedAddress === investment.userAddress ? (
                              <Check className="h-3 w-3 text-green-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{investment.token}</TableCell>
                      <TableCell className="text-right">{investment.usdtValue.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            investment.status === "active" 
                              ? "default" 
                              : investment.status === "completed" 
                                ? "secondary" 
                                : "destructive"
                          }
                        >
                          {investment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{new Date(investment.startDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Chưa có dữ liệu đầu tư
            </div>
          )}
        </CardContent>
      </Card>
      
    
    </div>
  );
}