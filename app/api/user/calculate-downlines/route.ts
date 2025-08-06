import { NextRequest, NextResponse } from "next/server";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';

export async function GET(req: NextRequest) {
  try {
    // Kết nối đến database
    await connectDB();
    
    // Lấy tham số bảo mật từ query parameter để tránh chạy API này vô tình
    const searchParams = req.nextUrl.searchParams;
    const securityToken = searchParams.get("token");
    
    // Kiểm tra token bảo mật (nên sử dụng một giá trị phức tạp hơn trong thực tế)
    if (securityToken !== process.env.ADMIN_API_TOKEN) {
      return NextResponse.json({ error: "can't access" }, { status: 403 });
    }
    
    // Lấy danh sách tất cả người dùng
    const allUsers = await User.find({}).select('address referrer');
    console.log(`Đã tìm thấy ${allUsers.length} người dùng để tính toán tuyến dưới`);
    
    // Tạo cấu trúc dữ liệu để biểu diễn mạng lưới tuyến dưới
    // Map từ địa chỉ ví đến danh sách các địa chỉ ví tuyến dưới trực tiếp (F1)
    const directDownlinesMap = new Map<string, string[]>();
    
    // Khởi tạo danh sách trống cho mỗi địa chỉ
    for (const user of allUsers) {
      directDownlinesMap.set(user.address.toLowerCase(), []);
    }
    
    // Xây dựng mạng lưới: Thêm mỗi người vào danh sách tuyến dưới của người giới thiệu
    for (const user of allUsers) {
      if (user.referrer) {
        const referrerAddress = user.referrer.toLowerCase();
        const userAddress = user.address.toLowerCase();
        
        // Thêm người này vào danh sách tuyến dưới trực tiếp của người giới thiệu
        if (directDownlinesMap.has(referrerAddress)) {
          directDownlinesMap.get(referrerAddress)?.push(userAddress);
        }
      }
    }
    
    // Hàm đệ quy để tính tổng số tuyến dưới (bao gồm tất cả các cấp)
    function countTotalDownlines(address: string, visited = new Set<string>()): number {
      // Tránh vòng lặp vô hạn trong trường hợp có chu trình
      if (visited.has(address)) return 0;
      visited.add(address);
      
      const directDownlines = directDownlinesMap.get(address.toLowerCase()) || [];
      let count = directDownlines.length;
      
      // Đệ quy đếm tuyến dưới của mỗi tuyến dưới trực tiếp
      for (const downline of directDownlines) {
        count += countTotalDownlines(downline, visited);
      }
      
      return count;
    }
    
    // Tính toán và lưu tổng số tuyến dưới cho mỗi người dùng
    const operations = [];
    let updatedCount = 0;
    
    for (const user of allUsers) {
      const address = user.address.toLowerCase();
      const totalDownlines = countTotalDownlines(address);
      
      operations.push(
        User.updateOne(
          { address },
          { $set: { totalDownlines } }
        ).then(() => {
          updatedCount++;
        })
      );
    }
    
    // Thực hiện tất cả các thao tác cập nhật
    await Promise.all(operations);
    
    return NextResponse.json({
      success: true,
      message: `Đã cập nhật số lượng tuyến dưới cho ${updatedCount} người dùng`,
      totalUsers: allUsers.length
    });
  } catch (error) {
    console.error("Lỗi khi tính toán tuyến dưới:", error);
    return NextResponse.json(
      { error: "Lỗi server khi xử lý yêu cầu", details: String(error) },
      { status: 500 }
    );
  }
} 