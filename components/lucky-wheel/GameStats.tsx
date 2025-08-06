'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatUsdtAmount } from '@/lib/formatUsdt';
import { shortenWalletAddress } from '@/lib/shortAddress';
import { TrendingUp, Users, Coins, Trophy, Activity, Flame } from 'lucide-react';

interface GameStatsData {
  totalSpins: number;
  totalBetAmount: string;
  totalRewards: string;
  uniquePlayers: number;
  poolBalance: string;
  totalBurned: string;
  recentBigWins: {
    user: string;
    amount: string;
    multiplier: number;
    timestamp: string;
  }[];
  topWinners: {
    user: string;
    totalWins: string;
    totalSpins: number;
  }[];
}

interface GameStatsProps {
  refreshInterval?: number;
}

export default function GameStats({ refreshInterval = 30000 }: GameStatsProps) {
  const [stats, setStats] = useState<GameStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/lucky-wheel/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Không thể tải thống kê
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.totalSpins.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tổng lượt quay</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.uniquePlayers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Người chơi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{formatUsdtAmount(stats.totalBetAmount)}</div>
                <p className="text-xs text-muted-foreground">Tổng cược</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold text-green-500">{formatUsdtAmount(stats.totalRewards)}</div>
                <p className="text-xs text-muted-foreground">Tổng thưởng</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold text-blue-500">{formatUsdtAmount(stats.poolBalance)}</div>
                <p className="text-xs text-muted-foreground">Pool hiện tại</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Flame className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold text-red-500">{formatUsdtAmount(stats.totalBurned)}</div>
                <p className="text-xs text-muted-foreground">Đã đốt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Big Wins */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Thắng lớn gần đây
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBigWins.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentBigWins.map((win, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 text-white rounded-full text-sm font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{shortenWalletAddress(win.user)}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(win.timestamp).toLocaleString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatUsdtAmount(win.amount)} AZC
                      </p>
                      <Badge variant="outline" className="text-orange-500 border-orange-500">
                        x{win.multiplier}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Winners */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Top Winners
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topWinners.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                Chưa có dữ liệu
              </p>
            ) : (
              <div className="space-y-3">
                {stats.topWinners.map((winner, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-amber-600' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{shortenWalletAddress(winner.user)}</p>
                        <p className="text-xs text-muted-foreground">
                          {winner.totalSpins} lượt quay
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {formatUsdtAmount(winner.totalWins)} AZC
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Game Rules Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Tỷ lệ thắng</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { multiplier: 'x10', probability: '0.5%', color: 'bg-yellow-500' },
              { multiplier: 'x5', probability: '2%', color: 'bg-purple-500' },
              { multiplier: 'x3', probability: '5%', color: 'bg-blue-500' },
              { multiplier: 'x2', probability: '10%', color: 'bg-green-500' },
              { multiplier: 'x1.5', probability: '15%', color: 'bg-orange-500' },
              { multiplier: 'x1', probability: '20%', color: 'bg-gray-500' },
              { multiplier: 'x0.5', probability: '25%', color: 'bg-red-400' },
              { multiplier: 'x0', probability: '22.5%', color: 'bg-red-500' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                  <span className="font-semibold">{item.multiplier}</span>
                </div>
                <span className="text-sm text-muted-foreground">{item.probability}</span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Hoa hồng: F1: 5%, F2: 1%, F3: 1%</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Đốt token: 3% mỗi lần cược</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Cược tối thiểu: 1 AZC</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 