import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { LuckyWheelSpin } from '@/lib/db/models/LuckyWheelSpin';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'biggest-wins'; // 'biggest-wins', 'total-wins', 'most-spins'
    const limit = parseInt(searchParams.get('limit') || '10');
    const timeframe = searchParams.get('timeframe') || 'all'; // 'all', 'today', 'week', 'month'

    // Connect to database
    await connectDB();

    // Build time filter
    let timeFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case 'today':
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        timeFilter = { timestamp: { $gte: startOfDay } };
        break;
      case 'week':
        const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        timeFilter = { timestamp: { $gte: startOfWeek } };
        break;
      case 'month':
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        timeFilter = { timestamp: { $gte: startOfMonth } };
        break;
      default:
        timeFilter = {};
    }

    let leaderboard = [];

    switch (type) {
      case 'biggest-wins':
        // Top biggest single wins
        leaderboard = await LuckyWheelSpin.find({
          ...timeFilter,
          status: 'completed',
          rewardAmount: { $gt: '0' }
        })
        .sort({ rewardAmount: -1 })
        .limit(limit)
        .select('user betAmount rewardAmount multiplier timestamp txHash')
        .lean();

        leaderboard = leaderboard.map((spin, index) => ({
          rank: index + 1,
          user: spin.user,
          amount: spin.rewardAmount,
          betAmount: spin.betAmount,
          multiplier: spin.multiplier,
          timestamp: spin.timestamp,
          txHash: spin.txHash
        }));
        break;

      case 'total-wins':
        // Top total winners (sum of all wins)
        const totalWinsData = await LuckyWheelSpin.aggregate([
          {
            $match: {
              ...timeFilter,
              status: 'completed',
              claimed: true
            }
          },
          {
            $group: {
              _id: '$user',
              totalWins: { $sum: { $toDouble: '$rewardAmount' } },
              totalSpins: { $sum: 1 },
              biggestWin: { $max: { $toDouble: '$rewardAmount' } },
              winCount: {
                $sum: {
                  $cond: [
                    { $gt: [{ $toDouble: '$rewardAmount' }, 0] },
                    1,
                    0
                  ]
                }
              }
            }
          },
          {
            $sort: { totalWins: -1 }
          },
          {
            $limit: limit
          }
        ]);

        leaderboard = totalWinsData.map((user, index) => ({
          rank: index + 1,
          user: user._id,
          totalWins: user.totalWins.toString(),
          totalSpins: user.totalSpins,
          biggestWin: user.biggestWin.toString(),
          winCount: user.winCount,
          winRate: Math.round((user.winCount / user.totalSpins) * 100)
        }));
        break;

      case 'most-spins':
        // Top most active players
        const mostSpinsData = await LuckyWheelSpin.aggregate([
          {
            $match: {
              ...timeFilter,
              status: 'completed'
            }
          },
          {
            $group: {
              _id: '$user',
              totalSpins: { $sum: 1 },
              totalBetAmount: { $sum: { $toDouble: '$betAmount' } },
              totalWins: { 
                $sum: { 
                  $cond: [
                    { $eq: ['$claimed', true] },
                    { $toDouble: '$rewardAmount' },
                    0
                  ]
                }
              },
              winCount: {
                $sum: {
                  $cond: [
                    { $gt: [{ $toDouble: '$rewardAmount' }, 0] },
                    1,
                    0
                  ]
                }
              }
            }
          },
          {
            $sort: { totalSpins: -1 }
          },
          {
            $limit: limit
          }
        ]);

        leaderboard = mostSpinsData.map((user, index) => ({
          rank: index + 1,
          user: user._id,
          totalSpins: user.totalSpins,
          totalBetAmount: user.totalBetAmount.toString(),
          totalWins: user.totalWins.toString(),
          winCount: user.winCount,
          winRate: Math.round((user.winCount / user.totalSpins) * 100)
        }));
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid leaderboard type' },
          { status: 400 }
        );
    }

    // Get recent big wins for sidebar
    const recentBigWins = await LuckyWheelSpin.find({
      status: 'completed',
      rewardAmount: { $gt: '0' },
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    })
    .sort({ rewardAmount: -1 })
    .limit(5)
    .select('user rewardAmount multiplier timestamp')
    .lean();

    // Get overall stats
    const overallStats = await LuckyWheelSpin.aggregate([
      {
        $match: {
          status: 'completed'
        }
      },
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
          uniquePlayers: { $addToSet: '$user' }
        }
      },
      {
        $project: {
          totalSpins: 1,
          totalBetAmount: 1,
          totalRewards: 1,
          uniquePlayers: { $size: '$uniquePlayers' }
        }
      }
    ]);

    const stats = overallStats[0] || {
      totalSpins: 0,
      totalBetAmount: 0,
      totalRewards: 0,
      uniquePlayers: 0
    };

    return NextResponse.json({
      success: true,
      data: {
        leaderboard,
        recentBigWins: recentBigWins.map(win => ({
          user: win.user,
          amount: win.rewardAmount,
          multiplier: win.multiplier,
          timestamp: win.timestamp
        })),
        stats: {
          totalSpins: stats.totalSpins,
          totalBetAmount: stats.totalBetAmount.toString(),
          totalRewards: stats.totalRewards.toString(),
          uniquePlayers: stats.uniquePlayers
        },
        meta: {
          type,
          timeframe,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 