"use client"

import { useState, useEffect, useCallback } from "react"
import { useReadContract } from "thirdweb/react"
import { getContract, readContract } from "thirdweb"
import { bsc } from "thirdweb/chains"
import { client } from "@/lib/client"
import { DATASTAKING, MEMBER } from "@/Context/listaddress"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle, Loader2, RefreshCcw, X } from "lucide-react"
import { toast } from "sonner"
import useWalletStore from "@/store/userWalletStore"
import { shortenWalletAddress } from "@/lib/shortAddress"

interface UserData {
  _id: string
  address: string
  referrer: string
}

export default function UpdateReferralsPage() {
  const { account } = useWalletStore()
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)
  const [users, setUsers] = useState<UserData[]>([])
  const [isUpdating, setIsUpdating] = useState(false)
  const [singleWallet, setSingleWallet] = useState<string>("")
  const [isSingleWalletLoading, setIsSingleWalletLoading] = useState(false)
  const [singleWalletResult, setSingleWalletResult] = useState<{
    address: string
    upline: string
    success: boolean
    message: string
  } | null>(null)
  const [updateResults, setUpdateResults] = useState<{
    total: number
    success: number
    failed: number
    inProgress: boolean
    processedAddresses: {address: string, success: boolean, upline: string}[]
  }>({
    total: 0,
    success: 0,
    failed: 0,
    inProgress: false,
    processedAddresses: []
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
      const response = await fetch("/api/user/all?limit=1000") // Giả sử bạn có API endpoint này
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

  // Hàm để lấy tuyến trên từ blockchain với cơ chế thử lại
  const getUplineFromBlockchain = async (address: string, maxRetries = 3, delayMs = 1000) => {
    let retries = 0;
    
    const tryGetUpline = async (): Promise<string | null> => {
      try {
        const upline = await readContract({
          contract,
          method: "function getUpline(address member) view returns (address)",
          params: [address],
        });
        
        return upline as string;
      } catch (error) {
        if (retries < maxRetries) {
          console.log(`Lỗi khi lấy tuyến trên cho ${address}, thử lại lần ${retries + 1}/${maxRetries}`);
          retries++;
          // Tạm dừng trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, delayMs));
          return tryGetUpline();
        }
        
        console.error(`Lỗi khi lấy tuyến trên cho ${address} sau ${maxRetries} lần thử:`, error);
        return null;
      }
    };
    
    return tryGetUpline();
  }

  // Hàm để cập nhật referrer cho một địa chỉ
  const updateReferral = async (userAddress: string, referrerAddress: string) => {
    try {
      // Kiểm tra nếu địa chỉ trống hoặc là địa chỉ 0
      if (!referrerAddress || 
          referrerAddress === "0x0000000000000000000000000000000000000000" ||
          referrerAddress === userAddress) {
        return false
      }
      
      const response = await fetch("/api/ref/update-ref", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userAddress,
          referrerAddress,
        }),
      })

      const result = await response.json()
      return result.success
    } catch (error) {
      console.error("Lỗi khi cập nhật referral:", error)
      return false
    }
  }

  // Hàm để kiểm tra và tạo người dùng nếu chưa tồn tại
  const ensureUserExists = async (address: string) => {
    try {
      // Kiểm tra địa chỉ ví có hợp lệ không
      if (!address || address === "0x0000000000000000000000000000000000000000") {
        return false;
      }

      // Kiểm tra user đã tồn tại chưa
      const response = await fetch(`/api/user/check?address=${address}`);
      const data = await response.json();
      
      if (data.exists) {
        // Người dùng đã tồn tại
        return true;
      }
      
      // Tạo mới user nếu chưa tồn tại
      const createResponse = await fetch("/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: address,
          // Các thông tin mặc định khác
          totalInvestment: 0,
          totalEarned: 0,
          isActive: true,
          timeJoin: new Date()
        }),
      });
      
      const createResult = await createResponse.json();
      return createResult.success;
    } catch (error) {
      console.error("Lỗi khi kiểm tra/tạo người dùng:", error);
      return false;
    }
  };

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

      // Đảm bảo người dùng hiện tại tồn tại trong DB
      await ensureUserExists(singleWallet);

      // Lấy tuyến trên từ blockchain sử dụng readContract trực tiếp
      const uplineAddress = await getUplineFromBlockchain(singleWallet)

      // Nếu không lấy được tuyến trên hoặc tuyến trên là địa chỉ 0
      if (!uplineAddress || 
          uplineAddress === "0x0000000000000000000000000000000000000000" ||
          uplineAddress === singleWallet) {
        setSingleWalletResult({
          address: singleWallet,
          upline: uplineAddress || "N/A",
          success: false,
          message: "Không tìm thấy tuyến trên hợp lệ"
        })
        setIsSingleWalletLoading(false)
        return
      }

      // Đảm bảo tuyến trên tồn tại trong DB
      const uplineExists = await ensureUserExists(uplineAddress);
      if (!uplineExists) {
        console.warn(`Không thể tạo tuyến trên ${uplineAddress} trong cơ sở dữ liệu`);
        // Vẫn tiếp tục vì đây không phải lỗi nghiêm trọng
      }

      // Cập nhật referrer
      const success = await updateReferral(singleWallet, uplineAddress)

      setSingleWalletResult({
        address: singleWallet,
        upline: uplineAddress,
        success,
        message: success ? "Cập nhật thành công" : "Cập nhật thất bại"
      })

      if (success) {
        toast.success("Cập nhật referrer thành công")
      } else {
        toast.error("Cập nhật referrer thất bại")
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật ví:", error)
      
      setSingleWalletResult({
        address: singleWallet,
        upline: "Lỗi",
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
      processedAddresses: []
    })

    const results = {
      total: users.length,
      success: 0,
      failed: 0,
      processedAddresses: [] as {address: string, success: boolean, upline: string}[]
    }

    // Xử lý theo lô (batch) để giảm tải cho blockchain, với kích thước lô nhỏ hơn
    const batchSize = 5; // Giảm kích thước lô từ 10 xuống 5
    const batchDelayMs = 2000; // Tạm dừng 2 giây giữa các lô
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      // Thông báo tiến trình
      const processedCount = i;
      const totalCount = users.length;
      const percentComplete = Math.round((processedCount / totalCount) * 100);
      console.log(`Đang xử lý: ${processedCount}/${totalCount} (${percentComplete}%)`);
      
      // Lấy tuyến trên cho từng người dùng trong lô, một người một lúc để tránh quá tải
      for (let j = 0; j < batch.length; j++) {
        const user = batch[j];
        
        // Tạm dừng giữa mỗi yêu cầu trong lô để tránh quá tải
        if (j > 0) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Lấy tuyến trên với cơ chế thử lại
        const uplineAddress = await getUplineFromBlockchain(user.address);
        
        try {
          // Nếu không lấy được tuyến trên hoặc tuyến trên là địa chỉ 0, bỏ qua
          if (!uplineAddress || 
              uplineAddress === "0x0000000000000000000000000000000000000000" ||
              uplineAddress === user.address) {
            results.failed++;
            results.processedAddresses.push({
              address: user.address,
              success: false,
              upline: uplineAddress || "N/A"
            });
            
            // Cập nhật kết quả sau mỗi địa chỉ
            setUpdateResults({
              ...results,
              inProgress: true
            });
            
            continue;
          }
          
          // Đảm bảo tuyến trên tồn tại trong DB
          await ensureUserExists(uplineAddress);
          
          // Nếu tuyến trên khác với referrer hiện tại, cập nhật
          if (uplineAddress.toLowerCase() !== user.referrer?.toLowerCase()) {
            const success = await updateReferral(user.address, uplineAddress)
            
            if (success) {
              results.success++
            } else {
              results.failed++
            }
            
            results.processedAddresses.push({
              address: user.address,
              success: success,
              upline: uplineAddress
            })
          } else {
            // Nếu tuyến trên giống với referrer hiện tại, bỏ qua
            results.processedAddresses.push({
              address: user.address,
              success: true,
              upline: uplineAddress
            })
            results.success++
          }
        } catch (error) {
          console.error(`Lỗi khi xử lý cho ${user.address}:`, error);
          results.failed++;
          results.processedAddresses.push({
            address: user.address,
            success: false,
            upline: "Lỗi"
          });
        }
        
        // Cập nhật kết quả sau mỗi địa chỉ
        setUpdateResults({
          ...results,
          inProgress: true
        });
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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Cập Nhật Referral Từ Blockchain</h1>
      
      {/* Phần cập nhật một ví cụ thể */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Cập Nhật Cho Một Ví Cụ Thể</CardTitle>
          <CardDescription>
            Nhập địa chỉ ví cần cập nhật referrer từ blockchain
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
                singleWalletResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Kết quả cập nhật</h3>
                    <p className="text-sm mt-1">
                      Địa chỉ: {shortenWalletAddress(singleWalletResult.address)}
                    </p>
                    <p className="text-sm mt-1">
                      Tuyến trên: {shortenWalletAddress(singleWalletResult.upline)}
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
          <CardTitle>Cập Nhật Tất Cả User</CardTitle>
          <CardDescription>
            Lấy dữ liệu tuyến trên từ blockchain và cập nhật referrer cho tất cả người dùng trong cơ sở dữ liệu
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
                <RefreshCcw className="w-4 h-4 mr-2" />
                Tải Lại
              </Button>
            </div>
            
            <Button 
              onClick={updateAllUsers} 
              disabled={isLoadingUsers || isUpdating || users.length === 0}
              className="mt-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang Cập Nhật...
                </>
              ) : (
                <>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Cập Nhật Tất Cả Người Dùng
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Hiển thị kết quả cập nhật */}
      <Card>
        <CardHeader>
          <CardTitle>Kết Quả Cập Nhật ({updateResults.processedAddresses.length}/{updateResults.total})</CardTitle>
          <CardDescription>
            {updateResults.inProgress ? 
              "Đang cập nhật referral từ blockchain..." : 
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
                      <div className="text-xs text-gray-500 mt-1">
                        Tuyến trên: {shortenWalletAddress(item.upline)}
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