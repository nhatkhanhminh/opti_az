// app/api/sync-members/route.ts
import { NextRequest, NextResponse } from "next/server";
import { MEMBER } from "@/Context/listaddress";
import { client } from "@/lib/client";
import { bsc } from "thirdweb/chains";
import { getContract, getContractEvents, prepareEvent, getRpcClient } from "thirdweb";
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models/User';
import SyncStatus from '@/lib/db/models/SyncStatus';

function convertBigIntToString(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    
    if (typeof obj === 'bigint') {
      return obj.toString();
    }
    
    if (Array.isArray(obj)) {
      return obj.map(convertBigIntToString);
    }
    
    if (typeof obj === 'object') {
      const result: any = {};
      for (const key in obj) {
        result[key] = convertBigIntToString(obj[key]);
      }
      return result;
    }
    
    return obj;
}

// Helper function to estimate block timestamp based on block number
// BSC has approximately 3-second block times
function estimateBlockTimestamp(blockNumber: number): Date {
  // BSC genesis block timestamp (approximate)
  const genesisTimestamp = 1598687091000; // August 29, 2020 in milliseconds
  const blockTime = 3000; // 3 seconds in milliseconds
  
  // Estimate timestamp based on block number and average block time
  const estimatedTimestamp = genesisTimestamp + (blockNumber * blockTime);
  return new Date(estimatedTimestamp);
}

// Thêm hàm lấy current block
async function getCurrentBlock() {
  try {
    const rpcClient = getRpcClient({
      client,
      chain: bsc
    });
    
    const blockNumberHex = await rpcClient({
      method: "eth_blockNumber",
    });
    
    if (typeof blockNumberHex === 'string') {
      // Chuyển đổi từ hex sang decimal
      return BigInt(blockNumberHex);
    }
    
    // Fallback nếu không lấy được block hiện tại
    console.warn("Không thể lấy block hiện tại, sử dụng giá trị mặc định");
    return BigInt(0);
  } catch (error) {
    console.error("Lỗi khi lấy block hiện tại:", error);
    return BigInt(0);
  }
}

// Hàm xác định toBlock an toàn
async function getSafeToBlock(fromBlock: number, maxBlockRange: number = 500) {
  try {
    // Giới hạn maxBlockRange không vượt quá 1000 (giới hạn của RPC)
    if (maxBlockRange > 1000) {
      maxBlockRange = 1000;
      console.warn("Đã giảm maxBlockRange xuống 1000 do giới hạn của RPC");
    }
    
    const currentBlock = await getCurrentBlock();
    
    // Nếu không lấy được block hiện tại, sử dụng phương pháp cộng thêm
    if (currentBlock === BigInt(0)) {
      return BigInt(fromBlock + maxBlockRange);
    }
    
    // Lấy block nhỏ hơn giữa (fromBlock + maxBlockRange) và currentBlock
    const proposedToBlock = BigInt(fromBlock + maxBlockRange);
    return proposedToBlock < currentBlock ? proposedToBlock : currentBlock;
  } catch (error) {
    console.error("Lỗi khi xác định toBlock an toàn:", error);
    // Fallback an toàn
    return BigInt(fromBlock + Math.min(maxBlockRange, 1000));
  }
}

export async function GET(req: NextRequest) {
  try {
    // Kết nối MongoDB
    await connectDB();
    
    // Xử lý query params để xác định loại event cần đồng bộ
    const searchParams = req.nextUrl.searchParams;
    const eventType = searchParams.get('eventType') || 'all';
    const autoSync = searchParams.get('autoSync') === 'true'; // Thêm tham số autoSync
    const maxIterations = parseInt(searchParams.get('maxIterations') || '10'); // Giới hạn số lần lặp
    
    if (autoSync) {
      return await handleAutoSync(eventType, maxIterations);
    } else {
      let resultMemberAdded = null;
      let resultUplineChanged = null;
      
      // Đồng bộ MemberAdded event
      if (eventType === 'all' || eventType === 'MemberAdded') {
        resultMemberAdded = await syncMemberAddedEvents();
      }
      
      // Đồng bộ UplineChanged event
      if (eventType === 'all' || eventType === 'UplineChanged') {
        resultUplineChanged = await syncUplineChangedEvents();
      }
      
      // Tạo response
      return NextResponse.json({ 
        success: true, 
        memberAdded: resultMemberAdded,
        uplineChanged: resultUplineChanged
      }, { status: 200 });
    }
  } catch (error) {
    console.error("Error in API route:", error);
    
    // Xử lý lỗi và trả về thông báo chi tiết
    let errorMessage = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      try {
        errorMessage = JSON.stringify(error);
      } catch {
        errorMessage = 'Unserializable error object';
      }
    } else if (error) {
      errorMessage = String(error);
    }
    
    return NextResponse.json(
      { 
        error: "Internal Server Error", 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Hàm xử lý đồng bộ tự động cho đến khi đạt đến block mới nhất
async function handleAutoSync(eventType: string, maxIterations: number) {
  // Mảng lưu kết quả qua các lần chạy
  const results = {
    memberAdded: [] as any[],
    uplineChanged: [] as any[],
    iterations: 0,
    completed: false,
    memberAddedCompleted: false,
    uplineChangedCompleted: false
  };
  
  let iteration = 0;
  let continueSync = true;
  
  while (continueSync && iteration < maxIterations) {
    iteration++;
    results.iterations = iteration;
    
    let iterationHasUpdates = false;
    
    // Đồng bộ MemberAdded
    if ((eventType === 'all' || eventType === 'MemberAdded') && !results.memberAddedCompleted) {
      const memberResult = await syncMemberAddedEvents();
      results.memberAdded.push(memberResult);
      
      // Kiểm tra nếu đã đồng bộ đến block mới nhất
      if (memberResult.message === "Đã đồng bộ đến block mới nhất") {
        results.memberAddedCompleted = true;
      } else if (memberResult.success) {
        iterationHasUpdates = true;
      }
      
      // Nếu gặp lỗi, đánh dấu đã hoàn thành để không thử lại
      if (!memberResult.success) {
        results.memberAddedCompleted = true;
      }
    }
    
    // Đồng bộ UplineChanged
    if ((eventType === 'all' || eventType === 'UplineChanged') && !results.uplineChangedCompleted) {
      const uplineResult = await syncUplineChangedEvents();
      results.uplineChanged.push(uplineResult);
      
      // Kiểm tra nếu đã đồng bộ đến block mới nhất
      if (uplineResult.message === "Đã đồng bộ đến block mới nhất") {
        results.uplineChangedCompleted = true;
      } else if (uplineResult.success) {
        iterationHasUpdates = true;
      }
      
      // Nếu gặp lỗi, đánh dấu đã hoàn thành để không thử lại
      if (!uplineResult.success) {
        results.uplineChangedCompleted = true;
      }
    }
    
    // Kiểm tra nếu cả hai loại event đều đã hoàn thành hoặc không có cập nhật nào
    if ((eventType === 'all' && results.memberAddedCompleted && results.uplineChangedCompleted) ||
        (eventType === 'MemberAdded' && results.memberAddedCompleted) ||
        (eventType === 'UplineChanged' && results.uplineChangedCompleted) ||
        !iterationHasUpdates) {
      continueSync = false;
    }
    
    // Đợi một chút giữa các lần đồng bộ để tránh quá tải API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  results.completed = (eventType === 'all' && results.memberAddedCompleted && results.uplineChangedCompleted) ||
                      (eventType === 'MemberAdded' && results.memberAddedCompleted) ||
                      (eventType === 'UplineChanged' && results.uplineChangedCompleted) ||
                      (iteration >= maxIterations);
  
  return NextResponse.json({
    success: true,
    autoSync: true,
    completed: results.completed,
    memberAddedCompleted: results.memberAddedCompleted,
    uplineChangedCompleted: results.uplineChangedCompleted,
    iterations: results.iterations,
    maxIterations: maxIterations,
    memberAdded: results.memberAdded,
    uplineChanged: results.uplineChanged
  }, { status: 200 });
}

// Hàm đồng bộ event MemberAdded
async function syncMemberAddedEvents() {
  try {
    // Lấy hoặc tạo SyncStatus
    let syncStatus = await SyncStatus.findOne({ 
      eventType: 'MemberAdded', 
      contractAddress: MEMBER 
    });
    
    if (!syncStatus) {
      syncStatus = new SyncStatus({
        eventType: 'MemberAdded',
        contractAddress: MEMBER,
        lastSyncedBlock: 47304058, // Block bắt đầu có event
        status: 'in_progress'
      });
      await syncStatus.save();
    }
    
    // Thiết lập block bắt đầu
    const fromBlock = syncStatus.lastSyncedBlock + 1;
    
    // Cập nhật trạng thái
    syncStatus.status = 'in_progress';
    await syncStatus.save();
    
    // Lấy events từ blockchain
    const contract = getContract({
      client,
      chain: bsc,
      address: MEMBER,
    });
    
    const preparedEvent = prepareEvent({
      signature: "event MemberAdded(address indexed member, address indexed upline)",
    });

    // Xác định toBlock an toàn
    const toBlock = await getSafeToBlock(fromBlock, 1000); // Giới hạn ở 1000 block mỗi lần
    
    // Nếu toBlock <= fromBlock, không có gì để đồng bộ
    if (toBlock <= BigInt(fromBlock)) {
      return { 
        success: true, 
        message: "Đã đồng bộ đến block mới nhất",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    let events;
    try {
      events = await getContractEvents({
        contract,
        events: [preparedEvent],
        fromBlock: BigInt(fromBlock),
        toBlock: toBlock,
      });
    } catch (eventError: any) {
      // Xử lý trường hợp lỗi khoảng block quá lớn
      if (eventError.message && (
          eventError.message.includes("Log response size exceeded") || 
          eventError.message.includes("Maximum allowed number of blocks")
        )) {
        
        // Tính toán một khoảng block nhỏ hơn (giảm một nửa)
        const halfRange = Math.floor((Number(toBlock) - fromBlock) / 2);
        const newToBlock = fromBlock + Math.max(halfRange, 100); // Ít nhất 100 block
        
        // Cập nhật trạng thái với khoảng block nhỏ hơn
        syncStatus.errorMessage = `Khoảng block quá lớn, đã giảm xuống ${newToBlock - fromBlock} block`;
        syncStatus.lastSyncedBlock = newToBlock;
        syncStatus.lastSyncedAt = new Date();
        await syncStatus.save();
        
        return { 
          success: false, 
          message: "Khoảng block quá lớn, hãy thử lại với khoảng nhỏ hơn",
          lastSyncedBlock: newToBlock,
          fromBlock: fromBlock,
          toBlock: newToBlock.toString()
        };
      }
      
      // Nếu là lỗi khác, ném lại
      throw eventError;
    }

    const serializedEvents = convertBigIntToString(events);
    
    // Kiểm tra events
    if (!serializedEvents || !Array.isArray(serializedEvents)) {
      // Cập nhật lastSyncedBlock thành toBlock
      syncStatus.lastSyncedBlock = Number(toBlock);
      syncStatus.status = 'success';
      syncStatus.lastSyncedAt = new Date();
      await syncStatus.save();
      
      return { 
        success: true, 
        message: "Không có dữ liệu MemberAdded mới để đồng bộ",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    // Kiểm tra mảng rỗng
    if (serializedEvents.length === 0) {
      // Cập nhật lastSyncedBlock thành toBlock
      syncStatus.lastSyncedBlock = Number(toBlock);
      syncStatus.status = 'success';
      syncStatus.lastSyncedAt = new Date();
      await syncStatus.save();
    
      return { 
        success: true, 
        message: "Không có sự kiện MemberAdded mới.",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    // Lưu dữ liệu vào MongoDB
    let syncedCount = 0;
    const operations = [];
    let lastBlock = 0;
    
    for (const event of serializedEvents) {
      const { member, upline } = event.args;
      const blockNumber = parseInt(event.blockNumber);
      
      // Tìm block lớn nhất
      if (blockNumber > lastBlock) {
        lastBlock = blockNumber;
      }
      
      // Estimate block timestamp
      const blockTimestamp = estimateBlockTimestamp(blockNumber);
      
      // Tạo operation update cho User
      operations.push(
        User.updateOne(
          { address: member.toLowerCase() },
          { 
            $set: { 
              address: member.toLowerCase(),
              referrer: upline.toLowerCase(),
              timeJoin: blockTimestamp,
              createdAt: blockTimestamp 
            } 
          },
          { upsert: true }
        )
      );
      
      syncedCount++;
    }
    
    // Thực hiện tất cả các thao tác cập nhật
    if (operations.length > 0) {
      await Promise.all(operations);
    }
    
    // Xác định block cuối cùng để lưu vào lastSyncedBlock
    // Quan trọng: Để đảm bảo không bỏ sót event, chúng ta lưu (lastBlock - 1) nếu có event
    // hoặc lưu (toBlock - 1) nếu không có event và toBlock là block hiện tại
    const currentBlockBigInt = await getCurrentBlock();
    const currentBlock = Number(currentBlockBigInt);
    
    let blockToSave;
    if (lastBlock > 0) {
      // Nếu có event, lưu lastBlock (block của event cuối cùng)
      blockToSave = lastBlock;
    } else if (Number(toBlock) >= currentBlock) {
      // Nếu không có event và toBlock là block hiện tại hoặc gần block hiện tại,
      // lưu toBlock - 10 để tránh bỏ sót event do reorg
      blockToSave = Number(toBlock) - 10;
    } else {
      // Nếu không có event và toBlock không phải block hiện tại,
      // lưu toBlock theo bình thường
      blockToSave = Number(toBlock);
    }
    
    // Cập nhật SyncStatus
    syncStatus.lastSyncedBlock = blockToSave;
    syncStatus.lastSyncedAt = new Date();
    syncStatus.status = 'success';
    syncStatus.totalSynced += syncedCount;
    await syncStatus.save();
    
    return {
      success: true,
      message: `Đã đồng bộ ${syncedCount} thành viên mới`,
      fromBlock: fromBlock,
      toBlock: toBlock.toString(),
      lastSyncedBlock: syncStatus.lastSyncedBlock,
      totalSynced: syncStatus.totalSynced
    };
  } catch (error) {
    // Xử lý lỗi cho MemberAdded event
    console.error("Error syncing MemberAdded events:", error);
    
    // Cập nhật SyncStatus với thông báo lỗi chi tiết
    try {
      const syncStatus = await SyncStatus.findOne({ 
        eventType: 'MemberAdded', 
        contractAddress: MEMBER 
      });
      
      if (syncStatus) {
        syncStatus.status = 'error';
        syncStatus.errorMessage = error instanceof Error ? error.message : String(error);
        syncStatus.lastSyncedAt = new Date();
        await syncStatus.save();
      }
    } catch (dbError) {
      console.error("Error updating sync status:", dbError);
    }
    
    throw error; // Re-throw để xử lý ở handler chính
  }
}

// Hàm đồng bộ event UplineChanged
async function syncUplineChangedEvents() {
  try {
    // Lấy hoặc tạo SyncStatus
    let syncStatus = await SyncStatus.findOne({ 
      eventType: 'UplineChanged', 
      contractAddress: MEMBER 
    });
    
    if (!syncStatus) {
      syncStatus = new SyncStatus({
        eventType: 'UplineChanged',
        contractAddress: MEMBER,
        lastSyncedBlock: 47304058, // Block bắt đầu có event
        status: 'in_progress'
      });
      await syncStatus.save();
    }
    
    // Thiết lập block bắt đầu
    const fromBlock = syncStatus.lastSyncedBlock + 1;
    
    // Cập nhật trạng thái
    syncStatus.status = 'in_progress';
    await syncStatus.save();
    
    // Lấy events từ blockchain
    const contract = getContract({
      client,
      chain: bsc,
      address: MEMBER,
    });
    
    const preparedEvent = prepareEvent({
      signature: "event UplineChanged(address indexed member, address indexed oldUpline, address indexed newUpline)",
    });

    // Xác định toBlock an toàn
    const toBlock = await getSafeToBlock(fromBlock, 1000); // Giới hạn ở 1000 block mỗi lần
    
    // Nếu toBlock <= fromBlock, không có gì để đồng bộ
    if (toBlock <= BigInt(fromBlock)) {
      return { 
        success: true, 
        message: "Đã đồng bộ đến block mới nhất",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    let events;
    try {
      events = await getContractEvents({
        contract,
        events: [preparedEvent],
        fromBlock: BigInt(fromBlock),
        toBlock: toBlock,
      });
    } catch (eventError: any) {
      // Xử lý trường hợp lỗi khoảng block quá lớn
      if (eventError.message && (
          eventError.message.includes("Log response size exceeded") || 
          eventError.message.includes("Maximum allowed number of blocks")
        )) {
        
        // Tính toán một khoảng block nhỏ hơn (giảm một nửa)
        const halfRange = Math.floor((Number(toBlock) - fromBlock) / 2);
        const newToBlock = fromBlock + Math.max(halfRange, 100); // Ít nhất 100 block
        
        // Cập nhật trạng thái với khoảng block nhỏ hơn
        syncStatus.errorMessage = `Khoảng block quá lớn, đã giảm xuống ${newToBlock - fromBlock} block`;
        syncStatus.lastSyncedBlock = newToBlock;
        syncStatus.lastSyncedAt = new Date();
        await syncStatus.save();
        
        return { 
          success: false, 
          message: "Khoảng block quá lớn, hãy thử lại với khoảng nhỏ hơn",
          lastSyncedBlock: newToBlock,
          fromBlock: fromBlock,
          toBlock: newToBlock.toString()
        };
      }
      
      // Nếu là lỗi khác, ném lại
      throw eventError;
    }

    const serializedEvents = convertBigIntToString(events);
    
    // Kiểm tra events
    if (!serializedEvents || !Array.isArray(serializedEvents)) {
      // Cập nhật lastSyncedBlock thành toBlock
      syncStatus.lastSyncedBlock = Number(toBlock);
      syncStatus.status = 'success';
      syncStatus.lastSyncedAt = new Date();
      await syncStatus.save();
      
      return { 
        success: true, 
        message: "Không có dữ liệu UplineChanged mới để đồng bộ",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    // Kiểm tra mảng rỗng
    if (serializedEvents.length === 0) {
      // Cập nhật lastSyncedBlock thành toBlock
      syncStatus.lastSyncedBlock = Number(toBlock);
      syncStatus.status = 'success';
      syncStatus.lastSyncedAt = new Date();
      await syncStatus.save();
    
      return { 
        success: true, 
        message: "Không có sự kiện UplineChanged mới.",
        lastSyncedBlock: syncStatus.lastSyncedBlock,
        fromBlock: fromBlock,
        toBlock: toBlock.toString()
      };
    }
    
    // Lưu dữ liệu vào MongoDB
    let syncedCount = 0;
    const operations = [];
    let lastBlock = 0;
    
    for (const event of serializedEvents) {
      const { member, newUpline } = event.args;
      const blockNumber = parseInt(event.blockNumber);
      
      // Tìm block lớn nhất
      if (blockNumber > lastBlock) {
        lastBlock = blockNumber;
      }
      
      // Estimate block timestamp
      const blockTimestamp = estimateBlockTimestamp(blockNumber);
      
      // Chỉ cập nhật trường referrer, không lưu lịch sử
      operations.push(
        User.updateOne(
          { address: member.toLowerCase() },
          { 
            $set: { 
              referrer: newUpline.toLowerCase(),
              timeJoin: blockTimestamp,
              updatedAt: blockTimestamp // Update updatedAt field with block timestamp
            }
          },
          { upsert: true }
        )
      );
      
      syncedCount++;
    }
    
    // Thực hiện tất cả các thao tác cập nhật
    if (operations.length > 0) {
      await Promise.all(operations);
    }
    
    // Xác định block cuối cùng để lưu vào lastSyncedBlock
    // Quan trọng: Để đảm bảo không bỏ sót event, chúng ta lưu (lastBlock - 1) nếu có event
    // hoặc lưu (toBlock - 1) nếu không có event và toBlock là block hiện tại
    const currentBlockBigInt = await getCurrentBlock();
    const currentBlock = Number(currentBlockBigInt);
    
    let blockToSave;
    if (lastBlock > 0) {
      // Nếu có event, lưu lastBlock (block của event cuối cùng)
      blockToSave = lastBlock;
    } else if (Number(toBlock) >= currentBlock) {
      // Nếu không có event và toBlock là block hiện tại hoặc gần block hiện tại,
      // lưu toBlock - 10 để tránh bỏ sót event do reorg
      blockToSave = Number(toBlock) - 10;
    } else {
      // Nếu không có event và toBlock không phải block hiện tại,
      // lưu toBlock theo bình thường
      blockToSave = Number(toBlock);
    }
    
    // Cập nhật SyncStatus
    syncStatus.lastSyncedBlock = blockToSave;
    syncStatus.lastSyncedAt = new Date();
    syncStatus.status = 'success';
    syncStatus.totalSynced += syncedCount;
    await syncStatus.save();
    
    return {
      success: true,
      message: `Đã đồng bộ ${syncedCount} thay đổi upline mới`,
      fromBlock: fromBlock,
      toBlock: toBlock.toString(),
      lastSyncedBlock: syncStatus.lastSyncedBlock,
      totalSynced: syncStatus.totalSynced
    };
  } catch (error) {
    // Xử lý lỗi cho UplineChanged event
    console.error("Error syncing UplineChanged events:", error);
    
    // Cập nhật SyncStatus với thông báo lỗi chi tiết
    try {
      const syncStatus = await SyncStatus.findOne({ 
        eventType: 'UplineChanged', 
        contractAddress: MEMBER 
      });
      
      if (syncStatus) {
        syncStatus.status = 'error';
        syncStatus.errorMessage = error instanceof Error ? error.message : String(error);
        syncStatus.lastSyncedAt = new Date();
        await syncStatus.save();
      }
    } catch (dbError) {
      console.error("Error updating sync status:", dbError);
    }
    
    throw error; // Re-throw để xử lý ở handler chính
  }
}
