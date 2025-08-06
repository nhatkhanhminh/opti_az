"use client"

import { useState, useEffect } from "react"
import { getContract, readContract } from "thirdweb"
import { bsc } from "thirdweb/chains"
import { client } from "@/lib/client"
import { MEMBER } from "@/Context/listaddress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RefreshCw, CheckCircle, X, Network, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { shortenWalletAddress } from "@/lib/shortAddress"
import Spinner from "@/components/Spiner"
import useWalletStore from "@/store/userWalletStore"

interface UserData {
  _id: string
  address: string
  teamVolume?: number
  directVolume?: number
  f1Count?: number
}

export default function UpdateTeamVolumePage() {
  const { account } = useWalletStore()
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [singleWallet, setSingleWallet] = useState<string>("")
  const [isSingleWalletLoading, setIsSingleWalletLoading] = useState(false)
  const [singleWalletResult, setSingleWalletResult] = useState<{
    address: string
    teamVolume: string
    directVolume: string
    f1Count: number
    success: boolean
    message: string
  } | null>(null)
  const [updateResults, setUpdateResults] = useState<{
    total: number
    success: number
    failed: number
    inProgress: boolean
    processedAddresses: {address: string, success: boolean, teamVolume: string, directVolume: string, f1Count: number}[]
    failedAddresses: string[] // Địa chỉ thất bại để thử lại
  }>({
    total: 0,
    success: 0,
    failed: 0,
    inProgress: false,
    processedAddresses: [],
    failedAddresses: []
  })
  
  // Khởi tạo contract
  const contract = getContract({
    client: client,
    chain: bsc,
    address: MEMBER,
  })

  // Lấy toàn bộ users từ database
  useEffect(() => {
    fetchAllUsers()
  }, [])

  const fetchAllUsers = async () => {
    try {
      setIsLoadingUsers(true)
      const response = await fetch("/api/update-blockchain-data/all-users")
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách người dùng")
      }
      
      const result = await response.json()
      if (result.success) {
        setUsers(result.data)
      } else {
        throw new Error(result.error || "Lỗi không xác định")
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách user:", error)
      toast.error("Không thể lấy danh sách người dùng từ cơ sở dữ liệu")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Hàm để lấy team volume từ blockchain với cơ chế thử lại
  const getTeamVolumeFromBlockchain = async (address: string, maxRetries = 3, delayMs = 1000) => {
    let retries = 0;
    
    const tryGetTeamVolume = async (): Promise<string | null> => {
      try {
        const teamVolumeResult = await readContract({
          contract,
          method: "function getTeamVolume(address) view returns (uint256)",
          params: [address],
        });
        
        // Chuyển đổi bigint thành số thập phân (chia cho 1e18)
        const teamVolumeDecimal = Number(teamVolumeResult.toString()) / 1e18;
        return teamVolumeDecimal.toString();
      } catch (error) {
        if (retries < maxRetries) {
          console.log(`Lỗi khi lấy team volume cho ${address}, thử lại lần ${retries + 1}/${maxRetries}`);
          retries++;
          // Tạm dừng trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return tryGetTeamVolume();
        }
        
        console.error(`Lỗi khi lấy team volume cho ${address} sau ${maxRetries} lần thử:`, error);
        return null;
      }
    };
    
    return tryGetTeamVolume();
  }

 
  // Hàm để cập nhật volume cho một địa chỉ
  const updateTeamVolume = async (userAddress: string) => {
    try {
      // Kiểm tra địa chỉ ví có hợp lệ không
      if (!userAddress || userAddress === "0x0000000000000000000000000000000000000000") {
        return {
          success: false,
          address: userAddress,
          teamVolume: "0",
          directVolume: "0",
          f1Count: 0,
          message: "Địa chỉ không hợp lệ"
        }
      }
      
      // Lấy team volume từ blockchain
      const teamVolume = await getTeamVolumeFromBlockchain(userAddress);
      
      if (teamVolume === null) {
        return {
          success: false,
          address: userAddress,
          teamVolume: "0",
          directVolume: "0",
          f1Count: 0,
          message: "Không thể lấy team volume từ blockchain"
        }
      }
      
      let success = true;
      let message = "Cập nhật thành công";
      let directVolume = "0";
      let f1Count = 0;
      
      // Kiểm tra nếu địa chỉ bắt đầu bằng 0x0000000 thì không lưu vào DB
      if (userAddress.match(/^0x0{5,}/)) {
        return {
          success: false,
          address: userAddress,
          teamVolume: teamVolume,
          directVolume: "0",
          f1Count: 0,
          message: "Địa chỉ ví không hợp lệ (0x0000...)"
        }
      }
      
      // Cập nhật team volume vào cơ sở dữ liệu
      const teamVolumeResponse = await fetch('/api/user/update-team-volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress,
          teamVolume: parseFloat(teamVolume)
        }),
      });

      const teamVolumeResult = await teamVolumeResponse.json();
      if (!teamVolumeResponse.ok || !teamVolumeResult.success) {
        success = false;
        message = "Cập nhật team volume thất bại";
      }
      
      // Tính toán và cập nhật F1 volume từ database
      const f1VolumeResponse = await fetch('/api/user/calculate-f1-volume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: userAddress
        }),
      });

      const f1VolumeResult = await f1VolumeResponse.json();
      if (f1VolumeResponse.ok && f1VolumeResult.success) {
        directVolume = f1VolumeResult.data.directVolume.toString();
        f1Count = f1VolumeResult.data.f1Count;
      } else {
        success = success ? false : success;
        message = success ? "Cập nhật F1 volume thất bại" : "Cập nhật cả team và F1 volume thất bại";
      }
      
      return {
        success: success,
        address: userAddress,
        teamVolume: teamVolume,
        directVolume: directVolume,
        f1Count: f1Count,
        message: message
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật volume:", error)
      return {
        success: false,
        address: userAddress,
        teamVolume: "0",
        directVolume: "0",
        f1Count: 0,
        message: "Lỗi xử lý"
      }
    }
  }

  // Hàm cập nhật một ví cụ thể
  const updateSingleWallet = async () => {
    if (!singleWallet) {
      toast.error("Vui lòng nhập địa chỉ ví cần cập nhật")
      return
    }

    try {
      // Đặt trạng thái loading và xóa kết quả trước đó
      setIsSingleWalletLoading(true)
      setSingleWalletResult(null)

      // Kiểm tra định dạng địa chỉ
      if (!singleWallet.startsWith("0x") || singleWallet.length !== 42) {
        toast.error("Địa chỉ ví không hợp lệ")
        setIsSingleWalletLoading(false)
        return
      }

      // Cập nhật team volume
      const result = await updateTeamVolume(singleWallet);

      setSingleWalletResult({
        address: singleWallet,
        teamVolume: result.teamVolume,
        directVolume: result.directVolume,
        f1Count: result.f1Count,
        success: result.success,
        message: result.message
      })

      if (result.success) {
        toast.success("Cập nhật Volume thành công")
      } else {
        toast.error("Cập nhật Volume thất bại")
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ví:", error)
      
      setSingleWalletResult({
        address: singleWallet,
        teamVolume: "0",
        directVolume: "0",
        f1Count: 0,
        success: false,
        message: "Có lỗi xảy ra khi cập nhật"
      })
      
      toast.error("Có lỗi xảy ra khi cập nhật")
    } finally {
      setIsSingleWalletLoading(false)
    }
  }

  // Hàm để cập nhật tất cả user
  const updateAllUsers = async () => {
    if (!users || users.length === 0) {
      toast.error("Không có người dùng nào trong cơ sở dữ liệu")
      return
    }

    setIsUpdating(true)
    setUpdateResults({
      total: users.length,
      success: 0,
      failed: 0,
      inProgress: true,
      processedAddresses: [],
      failedAddresses: []
    })

    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      processedAddresses: [] as {address: string, success: boolean, teamVolume: string, directVolume: string, f1Count: number}[],
      failedAddresses: [] as string[]
    }

    // Xử lý theo lô (batch) để giảm tải cho blockchain
    const batchSize = 5;
    const batchDelayMs = 2000; // Tạm dừng 2 giây giữa các lô
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      // Thông báo tiến trình
      const processedCount = i;
      const totalCount = users.length;
      const percentComplete = Math.round((processedCount / totalCount) * 100);
      console.log(`Đang xử lý: ${processedCount}/${totalCount} (${percentComplete}%)`);
      
      // Lấy team volume và f1 volume cho từng người dùng trong lô, một người một lúc để tránh quá tải
      for (let j = 0; j < batch.length; j++) {
        const user = batch[j];
        
        // Tạm dừng giữa mỗi yêu cầu trong lô để tránh quá tải
        if (j > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        try {
          // Cập nhật team volume và f1 volume
          const result = await updateTeamVolume(user.address);
          
          if (result.success) {
            results.success++;
          } else {
            results.failed++;
            results.failedAddresses.push(user.address);
          }
          
          results.processedAddresses.push({
            address: user.address,
            success: result.success,
            teamVolume: result.teamVolume,
            directVolume: result.directVolume,
            f1Count: result.f1Count
          });
          
          // Cập nhật kết quả sau mỗi địa chỉ
          setUpdateResults({
            ...results,
            inProgress: true
          });
        } catch (error) {
          console.error(`Lỗi khi xử lý cho ${user.address}:`, error);
          results.failed++;
          results.failedAddresses.push(user.address);
          results.processedAddresses.push({
            address: user.address,
            success: false,
            teamVolume: "0",
            directVolume: "0",
            f1Count: 0
          });
          
          // Cập nhật kết quả sau mỗi địa chỉ
          setUpdateResults({
            ...results,
            inProgress: true
          });
        }
      }
      
      // Tạm dừng giữa các lô để tránh quá tải
      if (i + batchSize < users.length) {
        toast.info(`Đã xử lý ${i + batch.length}/${users.length} người dùng. Tạm dừng ${batchDelayMs/1000} giây...`);
        await new Promise(resolve => setTimeout(resolve, batchDelayMs));
      }
    }

    // Hoàn thành
    setUpdateResults({
      ...results,
      inProgress: false
    });
    setIsUpdating(false);
    
    if (results.success === results.total) {
      toast.success(`Đã cập nhật thành công tất cả ${results.total} người dùng`);
    } else {
      toast.warning(`Cập nhật ${results.success}/${results.total} người dùng. ${results.failed} người dùng thất bại.`);
    }
  }

  // Hàm thử lại các địa chỉ đã thất bại
  const retryFailedAddresses = async () => {
    if (!updateResults.failedAddresses || updateResults.failedAddresses.length === 0) {
      toast.error("Không có địa chỉ nào cần thử lại");
      return;
    }

    setIsUpdating(true);
    toast.info(`Đang thử lại ${updateResults.failedAddresses.length} địa chỉ đã thất bại...`);

    const failedAddresses = [...updateResults.failedAddresses];
    const updatedResults = { ...updateResults };
    updatedResults.inProgress = true;
    setUpdateResults(updatedResults);
    
    let retrySuccess = 0;
    let retryFailed = 0;
    const newFailedAddresses: string[] = [];

    // Thử lại từng địa chỉ, với khoảng nghỉ lớn hơn
    for (let i = 0; i < failedAddresses.length; i++) {
      const address = failedAddresses[i];
      
      toast.info(`Đang thử lại địa chỉ ${i + 1}/${failedAddresses.length}: ${shortenWalletAddress(address)}`);
      
      try {
        // Tăng số lần thử và thời gian chờ
        const result = await updateTeamVolume(address);
        
        if (result.success) {
          retrySuccess++;
          
          // Cập nhật trong mảng processedAddresses
          const addressIndex = updatedResults.processedAddresses.findIndex(
            item => item.address.toLowerCase() === address.toLowerCase()
          );
          
          if (addressIndex !== -1) {
            updatedResults.processedAddresses[addressIndex] = {
              address,
              success: true,
              teamVolume: result.teamVolume,
              directVolume: result.directVolume,
              f1Count: result.f1Count
            };
          }
        } else {
          retryFailed++;
          newFailedAddresses.push(address);
        }
        
        // Cập nhật kết quả
        updatedResults.success = updatedResults.success + (result.success ? 1 : 0);
        updatedResults.failed = updatedResults.total - updatedResults.success;
        
        setUpdateResults({ ...updatedResults });
        
        // Khoảng nghỉ lớn giữa các lần thử lại (3 giây)
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (error) {
        console.error(`Lỗi khi thử lại địa chỉ ${address}:`, error);
        retryFailed++;
        newFailedAddresses.push(address);
      }
    }

    // Cập nhật kết quả cuối cùng
    updatedResults.inProgress = false;
    updatedResults.failedAddresses = newFailedAddresses;
    setUpdateResults(updatedResults);
    setIsUpdating(false);
    
    if (retrySuccess > 0) {
      toast.success(`Đã thử lại thành công ${retrySuccess}/${failedAddresses.length} địa chỉ`);
    }
    
    if (retryFailed > 0) {
      toast.warning(`Vẫn còn ${retryFailed} địa chỉ thất bại sau khi thử lại`);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cập Nhật Team & F1 Volume Từ Blockchain</h1>
      
      {/* Phần cập nhật một ví cụ thể */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cập Nhật Volume Cho Một Ví Cụ Thể</CardTitle>
          <CardDescription>
            Nhập địa chỉ ví cần cập nhật Team Volume và F1 Volume từ blockchain
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="singleWallet">Địa Chỉ Ví:</label>
              <div className="flex gap-2">
                <Input
                  id="singleWallet"
                  value={singleWallet}
                  onChange={(e) => setSingleWallet(e.target.value)}
                  placeholder="0x..."
                  disabled={isSingleWalletLoading}
                  className="flex-1"
                />
                <Button 
                  onClick={updateSingleWallet} 
                  disabled={isSingleWalletLoading || !singleWallet}
                >
                  {isSingleWalletLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang Cập Nhật
                    </>
                  ) : (
                    "Cập Nhật"
                  )}
                </Button>
              </div>
            </div>
            
            {/* Hiển thị kết quả cập nhật một ví */}
            {singleWalletResult && (
              <div className={`p-4 rounded-md ${
                singleWalletResult.success ? 'bg-green-50 border border-green-200 dark:bg-accent' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Kết quả cập nhật</h3>
                    <p className="text-sm mt-1">
                      Địa chỉ: {shortenWalletAddress(singleWalletResult.address)}
                    </p>
                    <p className="text-sm mt-1">
                      Team Volume: {singleWalletResult.teamVolume}
                    </p>
                    <p className="text-sm mt-1">
                      F1 Volume: {singleWalletResult.directVolume}
                    </p>
                    <p className="text-sm mt-1">
                      Số lượng F1: {singleWalletResult.f1Count}
                    </p>
                    <p className="text-sm mt-1">
                      Trạng thái: {singleWalletResult.message}
                    </p>
                  </div>
                  <div>
                    {singleWalletResult.success ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <X className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cập Nhật Volume Cho Tất Cả User</CardTitle>
          <CardDescription>
            Lấy dữ liệu Team Volume và F1 Volume từ blockchain và cập nhật cho tất cả người dùng trong cơ sở dữ liệu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                {isLoadingUsers ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    <span>Đang tải danh sách người dùng...</span>
                  </div>
                ) : (
                  <span>Đã tải {users.length} người dùng từ cơ sở dữ liệu</span>
                )}
              </div>
              <Button onClick={fetchAllUsers} disabled={isLoadingUsers || isUpdating} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tải Lại
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={updateAllUsers} 
                disabled={isLoadingUsers || isUpdating || users.length === 0}
                className="flex-1"
              >
                {isUpdating ? (
                  <>
                    <Spinner className="mr-2 h-4 w-4" />
                    Đang Cập Nhật...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Cập Nhật Tất Cả Người Dùng
                  </>
                )}
              </Button>
              
              <Button 
                onClick={retryFailedAddresses} 
                disabled={isUpdating || updateResults.failedAddresses.length === 0}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Thử Lại ({updateResults.failedAddresses.length})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Hiển thị kết quả cập nhật */}
      <Card>
        <CardHeader>
          <CardTitle>Kết Quả Cập Nhật ({updateResults.processedAddresses.length}/{updateResults.total})</CardTitle>
          <CardDescription>
            {updateResults.inProgress ? 
              "Đang cập nhật Volume từ blockchain..." : 
              updateResults.total > 0 ? 
                `Hoàn thành: Thành công ${updateResults.success}, Thất bại ${updateResults.failed}` : 
                "Chưa cập nhật"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {updateResults.inProgress && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p>Đang cập nhật: {updateResults.processedAddresses.length}/{updateResults.total}</p>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${(updateResults.processedAddresses.length / updateResults.total) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {updateResults.failedAddresses.length > 0 && !updateResults.inProgress && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="font-medium">Địa chỉ thất bại: {updateResults.failedAddresses.length}</p>
              <p className="text-sm text-gray-600 mt-1">
                Có {updateResults.failedAddresses.length} địa chỉ thất bại. Bạn có thể thử lại chúng bằng nút "Thử Lại".
              </p>
            </div>
          )}
          
          {/* Hiển thị danh sách địa chỉ đã xử lý */}
          <div className="grid gap-2 max-h-[400px] overflow-y-auto">
            {updateResults.processedAddresses.length > 0 ? (
              updateResults.processedAddresses.map((item, index) => (
                <div 
                  key={index} 
                  className={`p-3 border rounded-md ${
                    item.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{shortenWalletAddress(item.address)}</span>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                        <span>Team Volume: {item.teamVolume}</span>
                        <span>F1 Volume: {item.directVolume}</span>
                        <span>Số F1: {item.f1Count}</span>
                        {updateResults.failedAddresses.includes(item.address) && (
                          <span className="text-amber-600 font-medium">Cần thử lại</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      {item.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <X className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">Chưa có thông tin cập nhật</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 