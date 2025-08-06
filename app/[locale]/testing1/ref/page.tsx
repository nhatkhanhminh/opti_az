"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RefreshCw, Network, TrendingUp, Copy, Check, ArrowLeft } from "lucide-react";
import { shortenWalletAddress } from "@/lib/shortAddress";
import { toast } from "sonner";
import { ReferralTree } from "@/components/referral-tree";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { getContract, readContract } from "thirdweb";
import { bsc } from "thirdweb/chains";
import { client } from "@/lib/client";
import { MEMBER } from "@/Context/listaddress";
import Spinner from "@/components/Spiner";
import { useMemberContract } from "@/hooks/useContract";
import Link from "next/link";

export default function TestingRefPage() {
  const [searchAddress, setSearchAddress] = useState("");
  const [treeData, setTreeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string | null>(null);
  
  // Thêm state để quản lý việc cập nhật teamVolume
  const [isUpdatingVolumes, setIsUpdatingVolumes] = useState(false);
  const [updateProgress, setUpdateProgress] = useState<{current: number, total: number}>({current: 0, total: 0});
  const [showProgress, setShowProgress] = useState(false);
  
  // Thêm state cho cập nhật tuyến trên
  const [uplineAddress, setUplineAddress] = useState("");
  const [isUpdatingUplines, setIsUpdatingUplines] = useState(false);
  const [uplineProgress, setUplineProgress] = useState<{current: number, total: number, path: string[]}>({
    current: 0, 
    total: 0, 
    path: []
  });
  
  // Thêm state cho top users
  const [topTeamVolumes, setTopTeamVolumes] = useState<Array<{address: string, teamVolume: number}>>([]);
  const [topDirectVolumes, setTopDirectVolumes] = useState<Array<{address: string, directVolume: number, teamVolume: number, level: number}>>([]);
  const [loadingTopUsers, setLoadingTopUsers] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  // Thêm state để quản lý việc cập nhật volume cho toàn bộ user
  const [isUpdatingAllVolumes, setIsUpdatingAllVolumes] = useState(false);
  const [allVolumeProgress, setAllVolumeProgress] = useState<{current: number, total: number, success: number, failed: number}>({
    current: 0, 
    total: 0, 
    success: 0,
    failed: 0
  });

  // Fetch dữ liệu cây hệ thống
  const fetchTreeData = async (address: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Query parameters
      const queryParams = new URLSearchParams({
        userAddress: address,
        level: "all",
        investmentStatus: "all",
        page: "1",
        limit: "1000" // Lấy tất cả dữ liệu để xây dựng cây
      });
      
      const response = await fetch(`/api/ref/downline?${queryParams}`);
      
      if (!response.ok) {
        throw new Error("Không thể tải dữ liệu cây hệ thống");
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Xây dựng cây từ danh sách downline và thông tin currentUser
        const tree = buildReferralTreeFromDownlines(result.data, address, result.currentUser);
        setTreeData(tree);
      } else {
        throw new Error(result.error || "Lỗi không xác định");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải dữ liệu cây:", error);
      setError(error.message);
      toast.error("Lỗi", {
        description: "Không thể tải dữ liệu cây hệ thống"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xây dựng cây từ danh sách downline
  const buildReferralTreeFromDownlines = (downlines: any[], userAddress: string, currentUserData?: any) => {
    // Helper function to convert value to appropriate type
    const formatVolumeValue = (value: number | bigint): string | number => {
      if (typeof value === 'bigint') {
        return Number(value);
      }
      return value;
    };
    
    if (!downlines || downlines.length === 0) {
      // Return only user's node if no downlines
      const rootNode = {
        name: "Your Wallet",
        wallet: shortenWalletAddress(userAddress),
        fullAddress: userAddress,
        level: "You",
        totalInvestment: 0,
        f1Volume: 0,
        totalVolume: 0,
        children: []
      };

      // Nếu có dữ liệu currentUser, sử dụng nó
      if (currentUserData) {
        if (currentUserData.totalInvestment) {
          rootNode.totalInvestment = typeof currentUserData.totalInvestment === 'bigint' 
            ? Number(currentUserData.totalInvestment) 
            : currentUserData.totalInvestment;
        }
        if (currentUserData.directVolume) {
          rootNode.f1Volume = Number(formatVolumeValue(currentUserData.directVolume));
        }
        if (currentUserData.teamVolume) {
          rootNode.totalVolume = Number(formatVolumeValue(currentUserData.teamVolume));
        }
      }

      return rootNode;
    }

    // Tạo node gốc
    const root = {
      name: "Your Wallet",
      wallet: shortenWalletAddress(userAddress),
      fullAddress: userAddress,
      level: "You",
      totalInvestment: 0,
      f1Volume: 0,
      totalVolume: 0,
      children: []
    };

    // Ưu tiên sử dụng thông tin từ currentUser API
    if (currentUserData) {
      if (currentUserData.totalInvestment) {
        root.totalInvestment = typeof currentUserData.totalInvestment === 'bigint' 
          ? Number(currentUserData.totalInvestment) 
          : currentUserData.totalInvestment;
      }
      if (currentUserData.directVolume) {
        root.f1Volume = Number(formatVolumeValue(currentUserData.directVolume));
      }
      if (currentUserData.teamVolume) {
        root.totalVolume = Number(formatVolumeValue(currentUserData.teamVolume));
      }
    } 
    // Backup: Tìm thông tin đầu tư của người dùng gốc trong danh sách downlines
    else {
      const rootUserData = downlines.find(d => 
        d.address.toLowerCase() === userAddress.toLowerCase()
      );
      if (rootUserData) {
        if (rootUserData.totalInvestment) {
          root.totalInvestment = typeof rootUserData.totalInvestment === 'bigint' 
            ? Number(rootUserData.totalInvestment) 
            : rootUserData.totalInvestment;
        }
        if (rootUserData.directVolume) {
          root.f1Volume = Number(formatVolumeValue(rootUserData.directVolume));
        }
        if (rootUserData.teamVolume) {
          root.totalVolume = Number(formatVolumeValue(rootUserData.teamVolume));
        }
      }
    }

    // Tạo map để lưu tất cả các node
    const nodeMap = new Map();
    nodeMap.set(userAddress.toLowerCase(), root);

    // Phân loại downline theo cấp
    const downlinesByLevel = new Map();
    for (let i = 1; i <= 15; i++) {
      downlinesByLevel.set(i, downlines.filter(user => user.level === i));
    }

    // Thêm các node theo cấp từ F1 đến F15
    for (let level = 1; level <= 15; level++) {
      const levelDownlines = downlinesByLevel.get(level) || [];
      
      levelDownlines.forEach((downline: { 
        address: string; 
        totalInvestment: number | bigint; 
        referrer: string;
        directVolume?: number | bigint;
        teamVolume?: number | bigint;
      }) => {
        const node = {
          name: `F${level} Referral`,
          wallet: shortenWalletAddress(downline.address),
          fullAddress: downline.address,
          level: `F${level}`,
          totalInvestment: typeof downline.totalInvestment === 'bigint' 
            ? Number(downline.totalInvestment) 
            : downline.totalInvestment,
          f1Volume: downline.directVolume ? Number(formatVolumeValue(downline.directVolume)) : 0,
          totalVolume: downline.teamVolume ? Number(formatVolumeValue(downline.teamVolume)) : 0,
          children: []
        };
        
        nodeMap.set(downline.address.toLowerCase(), node);
        
        // Tìm node cha
        const parentNode = nodeMap.get(downline.referrer.toLowerCase());
        if (parentNode) {
          parentNode.children.push(node);
        } else if (level === 1) {
          // Nếu là F1 và không tìm thấy node cha, thêm vào root
          (root.children as any[]).push(node);
        }
      });
    }

    return root;
  };

  // Xử lý tìm kiếm
  const handleSearch = () => {
    if (!searchAddress) {
      toast.error("Lỗi", {
        description: "Vui lòng nhập địa chỉ ví"
      });
      return;
    }
    fetchTreeData(searchAddress);
  };

  // Hàm lấy danh sách tất cả users từ database
  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/update-blockchain-data/all-users');
      if (!response.ok) {
        throw new Error("Không thể tải danh sách người dùng");
      }
      const result = await response.json();
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || "Lỗi không xác định");
      }
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      throw error;
    }
  };
  
  // Hàm gọi getTeamVolume từ contract và cập nhật database
  const updateTeamVolume = async (userAddress: string, retryCount = 0) => {
    try {
      const memberContract = getContract({
        address: MEMBER,
        chain: bsc,
        client: client,
      });
      console.log(memberContract);
      // const memberContract = useMemberContract();
      // Gọi hàm getTeamVolume từ contract
      const teamVolumeResponse = await readContract({
        contract: memberContract,
        method: "function getTeamVolume(address) view returns (uint256)",
        params: [userAddress]
      });
      
      // Chuyển đổi bigint thành số thập phân (chia cho 1e18)
      const teamVolumeDecimal = Number(teamVolumeResponse.toString()) / 1e18;
      
      // Gọi API để cập nhật dữ liệu vào database
      const response = await fetch('/api/user/update-team-volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          teamVolume: teamVolumeDecimal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi cập nhật team volume");
      }

      return { success: true, address: userAddress, teamVolume: teamVolumeDecimal };
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật team volume cho ${userAddress}:`, error);
      
      // Kiểm tra nếu lỗi là AbiDecodingZeroDataError và còn có thể thử lại
      const maxRetries = 3;
      if (
        retryCount < maxRetries && 
        error.toString().includes('AbiDecodingZeroDataError') || 
        error.toString().includes('Cannot decode zero data')
      ) {
        console.log(`Thử lại lần ${retryCount + 1} cho địa chỉ ${userAddress}...`);
        // Đợi một khoảng thời gian trước khi thử lại (tăng dần theo số lần thử)
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return updateTeamVolume(userAddress, retryCount + 1);
      }
      
      return { success: false, address: userAddress, error: error.message };
    }
  };

  // Hàm cập nhật F1 volume
  const updateF1Volume = async (userAddress: string, retryCount = 0) => {
    try {
      // Gọi API để tính toán F1 volume từ database
      const f1VolumeResponse = await fetch('/api/user/calculate-f1-volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress
        }),
      });

      if (!f1VolumeResponse.ok) {
        const errorData = await f1VolumeResponse.json();
        throw new Error(errorData.message || "Lỗi khi tính toán F1 volume");
      }

      const f1VolumeResult = await f1VolumeResponse.json();
      
      if (!f1VolumeResult.success) {
        throw new Error(f1VolumeResult.message || "Lỗi khi tính toán F1 volume");
      }
      
      // Lấy giá trị directVolume từ kết quả API
      const directVolumeDecimal = f1VolumeResult.data.directVolume;
      const f1Count = f1VolumeResult.data.f1Count || 0;
      
      // Gọi API để cập nhật dữ liệu vào database
      const response = await fetch('/api/user/update-f1-volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          f1Volume: directVolumeDecimal
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi cập nhật F1 volume");
      }

      return { 
        success: true, 
        address: userAddress, 
        f1Volume: directVolumeDecimal,
        f1Count: f1Count
      };
    } catch (error: any) {
      console.error(`Lỗi khi cập nhật F1 volume cho ${userAddress}:`, error);
      
      // Kiểm tra nếu còn có thể thử lại
      const maxRetries = 3;
      if (retryCount < maxRetries) {
        console.log(`Thử lại cập nhật F1 volume lần ${retryCount + 1} cho địa chỉ ${userAddress}...`);
        // Đợi một khoảng thời gian trước khi thử lại
        await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
        return updateF1Volume(userAddress, retryCount + 1);
      }
      
      return { success: false, address: userAddress, error: error.message, f1Volume: 0, f1Count: 0 };
    }
  };

  // Hàm cập nhật TeamVolume và F1Volume cho toàn bộ user
  const updateAllUsersVolumes = async () => {
    try {
      // Lấy danh sách tất cả users
      const users = await fetchAllUsers();
      
      if (!users || users.length === 0) {
        toast.error("Lỗi", { description: "Không có dữ liệu người dùng để cập nhật" });
        return;
      }
      
      // Bắt đầu quá trình cập nhật
      setIsUpdatingAllVolumes(true);
      setShowProgress(true);
      setAllVolumeProgress({current: 0, total: users.length, success: 0, failed: 0});
      
      toast.info("Bắt đầu cập nhật volume cho tất cả users", {
        description: `Tổng số người dùng: ${users.length}. Quá trình này có thể mất thời gian dài.`
      });
      
      let successCount = 0;
      let failedCount = 0;
      
      // Cập nhật từng user
      for (let i = 0; i < users.length; i++) {
        const user = users[i];
        
        try {
          // Cập nhật TeamVolume và F1Volume với cơ chế thử lại
          let teamVolumeSuccess = false;
          let f1VolumeSuccess = false;
          
          // Cập nhật teamVolume với tối đa 3 lần thử lại nếu lỗi
          for (let retryCount = 0; retryCount < 3; retryCount++) {
            try {
              const teamVolumeResult = await updateTeamVolume(user.address);
              if (teamVolumeResult.success) {
                teamVolumeSuccess = true;
                break;
              }
              // Nếu thất bại, đợi trước khi thử lại
              await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            } catch (error) {
              console.error(`Lỗi thử lần ${retryCount + 1} khi cập nhật team volume cho ${user.address}:`, error);
            }
          }
          
          // Cập nhật F1Volume với tối đa 3 lần thử lại nếu lỗi
          for (let retryCount = 0; retryCount < 3; retryCount++) {
            try {
              const f1VolumeResult = await updateF1Volume(user.address);
              if (f1VolumeResult.success) {
                f1VolumeSuccess = true;
                break;
              }
              // Nếu thất bại, đợi trước khi thử lại
              await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
            } catch (error) {
              console.error(`Lỗi thử lần ${retryCount + 1} khi cập nhật F1 volume cho ${user.address}:`, error);
            }
          }
          
          // Kiểm tra kết quả
          if (teamVolumeSuccess && f1VolumeSuccess) {
            successCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Lỗi khi cập nhật data cho user ${user.address}:`, error);
          failedCount++;
        }
        
        // Cập nhật tiến trình
        setAllVolumeProgress(prev => ({
          ...prev,
          current: i + 1,
          success: successCount,
          failed: failedCount
        }));
        
        // Cập nhật toast mỗi 20 user
        if ((i + 1) % 20 === 0 || i === users.length - 1) {
          toast.info(`Đã xử lý ${i + 1}/${users.length} người dùng`, {
            description: `Thành công: ${successCount}, Thất bại: ${failedCount}`
          });
        }
        
        // Đợi một chút trước khi xử lý tiếp theo (để tránh rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Hiển thị thông báo hoàn thành
      toast.success("Hoàn thành cập nhật volume cho tất cả users", {
        description: `Đã cập nhật thành công: ${successCount}, Thất bại: ${failedCount} trong tổng số ${users.length} người dùng`
      });
      
    } catch (error: any) {
      console.error("Lỗi khi cập nhật volume cho tất cả user:", error);
      toast.error("Lỗi", {
        description: "Không thể cập nhật volume cho tất cả user"
      });
    } finally {
      setIsUpdatingAllVolumes(false);
      // Giữ hiển thị tiến trình trong vài giây
      setTimeout(() => setShowProgress(false), 5000);
    }
  };

  // Hàm lấy tuyến trên của một địa chỉ ví
  const getUplinePath = async (address: string) => {
    try {
      const memberContract = getContract({
        address: MEMBER,
        chain: bsc,
        client: client,
      });
      
      let currentAddress = address.toLowerCase();
      const uplinePath: string[] = [];
      let depth = 0;
      const maxDepth = 20; // Giới hạn độ sâu để tránh vòng lặp vô hạn
      
      while (currentAddress && depth < maxDepth) {
        // Gọi hàm getUpline từ contract để lấy địa chỉ tuyến trên
        const uplineResponse = await readContract({
          contract: memberContract,
          method: "function getUpline(address) view returns (address)",
          params: [currentAddress]
        });
        
        const uplineAddress = uplineResponse.toString();
        
        // Kiểm tra nếu upline là địa chỉ zero (0x0) hoặc trùng với địa chỉ hiện tại thì dừng
        if (
          !uplineAddress || 
          uplineAddress === "0x0000000000000000000000000000000000000000" || 
          uplineAddress.toLowerCase() === currentAddress
        ) {
          break;
        }
        
        // Thêm địa chỉ vào đường dẫn tuyến trên
        uplinePath.push(uplineAddress);
        currentAddress = uplineAddress.toLowerCase();
        depth++;
      }
      
      return uplinePath;
    } catch (error: any) {
      console.error(`Lỗi khi lấy tuyến trên cho ${address}:`, error);
      throw error;
    }
  };

  // Hàm cập nhật teamVolume cho toàn bộ tuyến trên của một địa chỉ ví
  const updateUplineTeamVolumes = async () => {
    if (!uplineAddress) {
      toast.error("Lỗi", {
        description: "Vui lòng nhập địa chỉ ví"
      });
      return;
    }
    
    setIsUpdatingUplines(true);
    setShowProgress(true);
    setUplineProgress({current: 0, total: 0, path: []});
    
    try {
      // Lấy đường dẫn tuyến trên
      const uplinePath = await getUplinePath(uplineAddress);
      
      // Thêm địa chỉ ban đầu vào đầu đường dẫn để cập nhật cả địa chỉ nhập vào
      const fullPathToUpdate = [uplineAddress, ...uplinePath];
      
      if (fullPathToUpdate.length <= 1) {
        toast.info("Thông báo", { description: "Địa chỉ này không có tuyến trên" });
        setIsUpdatingUplines(false);
        return;
      }
      
      // Cập nhật state để hiển thị đường dẫn
      setUplineProgress({current: 0, total: fullPathToUpdate.length, path: fullPathToUpdate});
      
      // Biến theo dõi số lượng cập nhật thành công
      let successCount = 0;
      let failedCount = 0;
      
      // Cập nhật từng địa chỉ trong danh sách
      for (let i = 0; i < fullPathToUpdate.length; i++) {
        const currentAddress = fullPathToUpdate[i];
        let teamVolumeResult = { success: false };
        let f1VolumeResult = { success: false };
        
        // Cập nhật teamVolume với tối đa 3 lần thử lại nếu lỗi
        for (let retryCount = 0; retryCount < 3; retryCount++) {
          try {
            teamVolumeResult = await updateTeamVolume(currentAddress);
            if (teamVolumeResult.success) break;
            
            // Nếu thất bại, đợi trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          } catch (error) {
            console.error(`Lỗi thử lần ${retryCount + 1} khi cập nhật team volume cho ${currentAddress}:`, error);
          }
        }
        
        // Cập nhật F1Volume (directVolume) với tối đa 3 lần thử lại nếu lỗi
        for (let retryCount = 0; retryCount < 3; retryCount++) {
          try {
            f1VolumeResult = await updateF1Volume(currentAddress);
            if (f1VolumeResult.success) break;
            
            // Nếu thất bại, đợi trước khi thử lại
            await new Promise(resolve => setTimeout(resolve, 2000 * (retryCount + 1)));
          } catch (error) {
            console.error(`Lỗi thử lần ${retryCount + 1} khi cập nhật F1 volume cho ${currentAddress}:`, error);
          }
        }
        
        if (teamVolumeResult.success && f1VolumeResult.success) {
          successCount++;
        } else {
          failedCount++;
        }
        
        // Cập nhật tiến trình
        setUplineProgress(prev => ({...prev, current: i + 1}));
        
        // Đợi một chút trước khi xử lý tiếp theo (để tránh rate limit)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Hiển thị thông báo hoàn thành
      toast.success("Hoàn thành cập nhật", {
        description: `Đã cập nhật thành công: ${successCount}, Thất bại: ${failedCount} trong tổng số ${fullPathToUpdate.length} địa chỉ`
      });
      
      // Tự động làm mới dữ liệu nếu đang xem cây hệ thống
      if (treeData && searchAddress) {
        fetchTreeData(searchAddress);
      }
      
    } catch (error: any) {
      console.error("Lỗi khi cập nhật tuyến trên:", error);
      toast.error("Lỗi", {
        description: "Không thể cập nhật dữ liệu cho tuyến trên"
      });
    } finally {
      setIsUpdatingUplines(false);
      // Giữ hiển thị tiến trình trong vài giây
      setTimeout(() => setShowProgress(false), 5000);
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

  // Hàm tính level dựa trên directVolume và teamVolume
  const calculateLevel = (teamVolume: number, directVolume: number): number => {
    if (teamVolume >= 500000 && directVolume >= 20000) return 5;
    if (teamVolume >= 350000 && directVolume >= 15000) return 4;
    if (teamVolume >= 200000 && directVolume >= 10000) return 3;
    if (teamVolume >= 100000 && directVolume >= 5000) return 2;
    if (teamVolume >= 30000 && directVolume >= 3000) return 1;
    return 0;
  };

  // Hàm lấy top users theo direct volume
  const fetchTopUsers = async () => {
    setLoadingTopUsers(true);
    
    try {
      // Lấy danh sách tất cả users
      const users = await fetchAllUsers();
      
      if (!users || users.length === 0) {
        throw new Error("Không có dữ liệu người dùng");
      }
      
      // Sắp xếp users theo directVolume và lấy top 15
      const usersWithLevel = [...users]
        .filter(user => user.directVolume && user.directVolume > 0)
        .map(user => ({
          address: user.address,
          directVolume: user.directVolume || 0,
          teamVolume: user.teamVolume || 0,
          level: calculateLevel(user.teamVolume || 0, user.directVolume || 0)
        }))
        // Sắp xếp ưu tiên level cao nhất trước, nếu cùng level thì directVolume cao hơn
        .sort((a, b) => {
          if (a.level !== b.level) return b.level - a.level;
          return b.directVolume - a.directVolume;
        })
        .slice(0, 15);
      
      // Nếu không có đủ dữ liệu (ít hơn 3 người dùng có directVolume)
      if (usersWithLevel.length < 3) {
        toast.info("Đang tải dữ liệu từ blockchain...", {
          description: "Dữ liệu không đủ, đang cập nhật từ blockchain"
        });
        
        // Lấy 15 người dùng có totalInvestment cao nhất để cập nhật
        const topUsers = [...users]
          .sort((a, b) => b.totalInvestment - a.totalInvestment)
          .slice(0, 15);
        
        // Cập nhật teamVolume và directVolume cho các users hàng đầu
        for (const user of topUsers) {
          try {
            // Cập nhật teamVolume
            await updateTeamVolume(user.address);
            
            // Cập nhật directVolume - nếu cần
            // Thêm code cập nhật directVolume ở đây nếu cần
          } catch (err) {
            console.error(`Lỗi khi cập nhật dữ liệu cho ${user.address}:`, err);
          }
        }
        
        // Tải lại dữ liệu sau khi cập nhật
        setTimeout(() => {
          fetchTopUsers();
        }, 2000);
        
        return;
      }
      
      setTopDirectVolumes(usersWithLevel);
      
    } catch (error: any) {
      console.error("Lỗi khi lấy top users:", error);
      toast.error("Lỗi", {
        description: "Không thể lấy danh sách top users"
      });
    } finally {
      setLoadingTopUsers(false);
    }
  };

  useEffect(() => {
    // Tự động tải top users khi component được mount
    fetchTopUsers();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">UPDATE VOLUME</h1>
        <p className="text-muted-foreground">
          Xem cây hệ thống của tuyến dưới bất kỳ
        </p>
        <Link href="/testing1/stakes">
        <Button variant="outline" >
          <ArrowLeft className="h-4 w-4 mr-2" />
          STakes
        </Button>
        </Link>
      
      </div>

    

      {/* Card mới cho chức năng cập nhật Team Volume */}
      {/* <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cập nhật Team Volume</CardTitle>
          <CardDescription>
            Cập nhật trường teamVolume cho toàn bộ users trong database bằng cách gọi getTeamVolume từ smart contract
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Button onClick={updateAllUserTeamVolumes} disabled={isUpdatingVolumes}>
                  {isUpdatingVolumes ? (
                    <>
                      <Spinner className="h-4 w-4 mr-2" />
                      Đang cập nhật...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Cập nhật Team Volume cho tất cả users
                    </>
                  )}
                </Button>
              </div>
              
              {showProgress && !isUpdatingUplines && (
                <div className="text-sm text-muted-foreground">
                  Đã cập nhật: {updateProgress.current}/{updateProgress.total} users
                </div>
              )}
            </div>
            
            {showProgress && !isUpdatingUplines && (
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ 
                    width: `${updateProgress.total > 0 
                      ? Math.round((updateProgress.current / updateProgress.total) * 100) 
                      : 0}%` 
                  }}
                ></div>
              </div>
            )}
          </div>
        </CardContent>
      </Card> */}

      {/* Card mới cho chức năng cập nhật Team Volume của tuyến trên */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Cập nhật Team Volume và F1 Volume của Tuyến Trên</CardTitle>
          <CardDescription>
            Cập nhật đồng thời Team Volume và F1 Volume cho địa chỉ ví nhập vào và toàn bộ tuyến trên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Network className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Nhập địa chỉ ví cần cập nhật tuyến trên..."
                  value={uplineAddress}
                  onChange={(e) => setUplineAddress(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button onClick={updateUplineTeamVolumes} disabled={isUpdatingUplines || isUpdatingAllVolumes}>
                {isUpdatingUplines ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Cập nhật Tuyến Trên
                  </>
                )}
              </Button>
            </div>
            
            {isUpdatingUplines && uplineProgress.path.length > 0 && (
              <>
                <div className="text-sm text-muted-foreground">
                  Đã cập nhật: {uplineProgress.current}/{uplineProgress.total} địa chỉ (đang cập nhật cả TeamVolume và F1Volume)
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${uplineProgress.total > 0 
                        ? Math.round((uplineProgress.current / uplineProgress.total) * 100) 
                        : 0}%` 
                    }}
                  ></div>
                </div>
                
                <div className="mt-2 space-y-2">
                  <div className="text-sm font-medium">Đường dẫn tuyến trên:</div>
                  <div className="max-h-40 overflow-y-auto bg-gray-100 dark:bg-gray-800 rounded-md p-2">
                    {uplineProgress.path.map((address, index) => (
                      <div 
                        key={address} 
                        className={`flex items-center justify-between py-1 px-2 ${
                          index < uplineProgress.current 
                            ? "text-green-600 dark:text-green-400" 
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{index + 1}.</span>
                          <span className="font-mono text-sm">{shortenWalletAddress(address)}</span>
                        </div>
                        {index < uplineProgress.current && (
                          <span className="text-xs text-green-600 dark:text-green-400">✓ Đã cập nhật</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className="border-t pt-4 mt-2">
              <div className="flex flex-col gap-4">
                <div>
                  <Button 
                    onClick={updateAllUsersVolumes} 
                    disabled={isUpdatingAllVolumes || isUpdatingUplines}
                    variant="outline"
                    className="w-full"
                  >
                    {isUpdatingAllVolumes ? (
                      <>
                        <Spinner className="h-4 w-4 mr-2" />
                        Đang cập nhật tất cả người dùng...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Cập nhật Volume cho toàn bộ người dùng
                      </>
                    )}
                  </Button>
                </div>
                
                {isUpdatingAllVolumes && (
                  <>
                    <div className="text-sm text-muted-foreground">
                      Đã xử lý: {allVolumeProgress.current}/{allVolumeProgress.total} ví
                      (Thành công: {allVolumeProgress.success}, Thất bại: {allVolumeProgress.failed})
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${allVolumeProgress.total > 0 
                            ? Math.round((allVolumeProgress.current / allVolumeProgress.total) * 100) 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="text-sm text-center text-muted-foreground">
                      Việc cập nhật tất cả người dùng có thể mất nhiều thời gian. Vui lòng không đóng trang này.
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card mới cho hiển thị top users */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top 15 Users Theo Level
          </CardTitle>
          <CardDescription>
            Sắp xếp theo Level và Doanh Số F1, với các điều kiện:
            L1: $30K Team, $3K F1 | L2: $100K Team, $5K F1 | L3: $200K Team, $10K F1 | L4: $350K Team, $15K F1 | L5: $500K Team, $20K F1
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingTopUsers ? (
            <div className="space-y-2">
              {Array(5).fill(0).map((_, index) => (
                <Skeleton key={`direct-${index}`} className="h-10 w-full" />
              ))}
            </div>
          ) : topDirectVolumes.length === 0 ? (
            <div className="py-4 text-center text-muted-foreground flex items-center justify-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <span>Chưa có dữ liệu</span>
              <Button variant="outline" size="sm" onClick={fetchTopUsers} className="ml-2">
                <RefreshCw className="h-3 w-3 mr-1" />
                Tải dữ liệu
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={fetchTopUsers}>
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Làm mới
                </Button>
              </div>
              <div className="rounded-md border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="py-2 px-3 text-left font-medium text-xs">#</th>
                      <th className="py-2 px-3 text-left font-medium text-xs">Địa chỉ</th>
                      <th className="py-2 px-3 text-right font-medium text-xs">Doanh số F1</th>
                      <th className="py-2 px-3 text-right font-medium text-xs">Doanh số Nhóm</th>
                      <th className="py-2 px-3 text-center font-medium text-xs">Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topDirectVolumes.map((user, index) => (
                      <tr key={user.address} className="border-t">
                        <td className="py-2 px-3 text-left">{index + 1}</td>
                        <td className="py-2 px-3 text-left">
                          <div className="flex items-center">
                            <span className="font-mono text-xs">{shortenWalletAddress(user.address)}</span>
                            <button 
                              className="ml-1 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                              onClick={() => copyToClipboard(user.address)}
                            >
                              {copiedAddress === user.address ? (
                                <Check className="h-3 w-3 text-green-500" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          ${user.directVolume.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-medium">
                          ${user.teamVolume.toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            user.level === 5 ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" :
                            user.level === 4 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" :
                            user.level === 3 ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
                            user.level === 2 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
                            user.level === 1 ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" :
                            "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {user.level > 0 ? `Level ${user.level}` : "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Tìm kiếm địa chỉ ví</CardTitle>
          <CardDescription>
            Nhập địa chỉ ví để xem cây hệ thống của họ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập địa chỉ ví..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch} disabled={isLoading}>
              {isLoading ? "Đang tải..." : "Tìm kiếm"}
            </Button>
          </div>
        </CardContent>
      </Card>
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full" />
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full" />
            Đang tải dữ liệu...
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center p-6 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          <span>{error}</span>
        </div>
      ) : treeData ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cây hệ thống</CardTitle>
              <CardDescription>
                Hiển thị cấu trúc cây hệ thống của địa chỉ {shortenWalletAddress(searchAddress)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo địa chỉ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="px-3 py-2 border rounded-md"
                    value={filterLevel || ""}
                    onChange={(e) => setFilterLevel(e.target.value || null)}
                  >
                    <option value="">Tất cả các cấp</option>
                    <option value="F1">F1</option>
                    <option value="F2">F2</option>
                    <option value="F3">F3</option>
                    <option value="F4">F4</option>
                    <option value="F5">F5</option>
                    <option value="F6">F6</option>
                    <option value="F7">F7</option>
                    <option value="F8">F8</option>
                    <option value="F9">F9</option>
                    <option value="F10">F10</option>
                  </select>
                </div>
              </div>
              <div className="h-[600px] border rounded-lg overflow-hidden bg-background dark:bg-gray-700">
                <ReferralTree 
                  data={treeData} 
                  searchTerm={searchTerm}
                  filterLevel={filterLevel}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
} 