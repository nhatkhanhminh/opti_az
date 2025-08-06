import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { LuckyWheelSpin } from '@/lib/db/models/LuckyWheelSpin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // 'all', 'pending', 'completed', 'failed'

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Build query
    const query: any = {
      user: userAddress.toLowerCase()
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Get spins with pagination
    const [spins, totalCount] = await Promise.all([
      LuckyWheelSpin.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      LuckyWheelSpin.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Get user statistics
    const userStats = await LuckyWheelSpin.aggregate([
      { $match: { user: userAddress.toLowerCase() } },
      {
        $group: {
          _id: null,
          totalSpins: { $sum: 1 },
          totalBetAmount: { $sum: { $toDouble: '$betAmount' } },
          totalRewards: { 
            $sum: { 
              $cond: [
                { $eq: ['$claimed', true] },
                { $toDouble: '$rewardAmount' },
                0
              ]
            }
          },
          pendingRewards: {
            $sum: {
              $cond: [
                { 
                  $and: [
                    { $eq: ['$claimed', false] },
                    { $eq: ['$status', 'completed'] },
                    { $gt: [{ $toDouble: '$rewardAmount' }, 0] }
                  ]
                },
                { $toDouble: '$rewardAmount' },
                0
              ]
            }
          },
          biggestWin: { $max: { $toDouble: '$rewardAmount' } },
          winRate: {
            $avg: {
              $cond: [
                { $gt: [{ $toDouble: '$rewardAmount' }, 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = userStats[0] || {
      totalSpins: 0,
      totalBetAmount: 0,
      totalRewards: 0,
      pendingRewards: 0,
      biggestWin: 0,
      winRate: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        spins: spins.map(spin => ({
          id: spin._id,
          txHash: spin.txHash,
          betAmount: spin.betAmount,
          spinId: spin.spinId,
          segmentIndex: spin.segmentIndex,
          multiplier: spin.multiplier,
          rewardAmount: spin.rewardAmount,
          claimed: spin.claimed,
          claimTxHash: spin.claimTxHash,
          status: spin.status,
          timestamp: spin.timestamp,
          claimTimestamp: spin.claimTimestamp
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit
        },
        userStats: {
          totalSpins: stats.totalSpins,
          totalBetAmount: stats.totalBetAmount.toString(),
          totalRewards: stats.totalRewards.toString(),
          pendingRewards: stats.pendingRewards.toString(),
          biggestWin: stats.biggestWin.toString(),
          winRate: Math.round(stats.winRate * 100) // Convert to percentage
        }
      }
    });

  } catch (error) {
    console.error('Get spin history error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 