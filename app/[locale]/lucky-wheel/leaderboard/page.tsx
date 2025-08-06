'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatUsdtAmount } from '@/lib/formatUsdt';
import { shortenWalletAddress } from '@/lib/shortAddress';
import { Trophy, Medal, Award } from 'lucide-react';

interface LeaderboardEntry {
  rank: number;
  user: string;
  amount?: string;
  totalWins?: string;
  totalSpins?: number;
  biggestWin?: string;
  winCount?: number;
  winRate?: number;
  betAmount?: string;
  totalBetAmount?: string;
  multiplier?: number;
  timestamp?: string;
  txHash?: string;
}

interface RecentWin {
  user: string;
  amount: string;
  multiplier: number;
  timestamp: string;
}

interface OverallStats {
  totalSpins: number;
  totalBetAmount: string;
  totalRewards: string;
  uniquePlayers: number;
}

export default function LeaderboardPage() {
  const t = useTranslations('luckyWheel');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [recentWins, setRecentWins] = useState<RecentWin[]>([]);
  const [stats, setStats] = useState<OverallStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardType, setLeaderboardType] = useState('biggest-wins');
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        type: leaderboardType,
        timeframe,
        limit: '50'
      });

      const response = await fetch(`/api/lucky-wheel/leaderboard?${params}`);
      const data = await response.json();

      if (data.success) {
        setLeaderboard(data.data.leaderboard);
        setRecentWins(data.data.recentBigWins);
        setStats(data.data.stats);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const renderLeaderboardEntry = (entry: LeaderboardEntry) => {
    return (
      <div key={`${entry.user}-${entry.rank}`} className="border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10">
              {getRankIcon(entry.rank)}
            </div>
            <div>
              <p className="font-semibold">{shortenWalletAddress(entry.user)}</p>
              {entry.timestamp && (
                <p className="text-sm text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString('vi-VN')}
                </p>
              )}
            </div>
          </div>
          
          <div className="text-right">
            {leaderboardType === 'biggest-wins' && (
              <>
                <p className="text-lg font-bold text-green-500">
                  {formatUsdtAmount(entry.amount || '0')} AZC
                </p>
                <p className="text-sm text-muted-foreground">
                  x{entry.multiplier} • Cược: {formatUsdtAmount(entry.betAmount || '0')}
                </p>
              </>
            )}
            
            {leaderboardType === 'total-wins' && (
              <>
                <p className="text-lg font-bold text-green-500">
                  {formatUsdtAmount(entry.totalWins || '0')} AZC
                </p>
                <p className="text-sm text-muted-foreground">
                  {entry.totalSpins} lượt • Tỷ lệ thắng: {entry.winRate}%
                </p>
              </>
            )}
            
            {leaderboardType === 'most-spins' && (
              <>
                <p className="text-lg font-bold text-blue-500">
                  {entry.totalSpins} lượt quay
                </p>
                <p className="text-sm text-muted-foreground">
                  Cược: {formatUsdtAmount(entry.totalBetAmount || '0')} • Thắng: {formatUsdtAmount(entry.totalWins || '0')}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Bảng xếp hạng Lucky Wheel</h1>
        
        {/* Overall Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.totalSpins.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Tổng lượt quay</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatUsdtAmount(stats.totalBetAmount)}</div>
                <p className="text-xs text-muted-foreground">Tổng cược</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-500">{formatUsdtAmount(stats.totalRewards)}</div>
                <p className="text-xs text-muted-foreground">Tổng thưởng</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{stats.uniquePlayers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Người chơi</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select value={leaderboardType} onValueChange={setLeaderboardType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="biggest-wins">Thắng lớn nhất</SelectItem>
                <SelectItem value="total-wins">Tổng thắng</SelectItem>
                <SelectItem value="most-spins">Hoạt động nhiều nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả thời gian</SelectItem>
                <SelectItem value="today">Hôm nay</SelectItem>
                <SelectItem value="week">7 ngày qua</SelectItem>
                <SelectItem value="month">30 ngày qua</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {leaderboardType === 'biggest-wins' && 'Thắng lớn nhất'}
                {leaderboardType === 'total-wins' && 'Tổng thắng cao nhất'}
                {leaderboardType === 'most-spins' && 'Hoạt động nhiều nhất'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Đang tải...</div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Chưa có dữ liệu
                </div>
              ) : (
                <div className="space-y-4">
                  {leaderboard.map(renderLeaderboardEntry)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Big Wins */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thắng lớn gần đây</CardTitle>
            </CardHeader>
            <CardContent>
              {recentWins.length === 0 ? (
                <p className="text-muted-foreground text-sm">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {recentWins.map((win, index) => (
                    <div key={index} className="border-b pb-3 last:border-b-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{shortenWalletAddress(win.user)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(win.timestamp).toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-500 text-sm">
                            {formatUsdtAmount(win.amount)} AZC
                          </p>
                          <p className="text-xs text-orange-500">x{win.multiplier}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Thông tin game</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Tỷ lệ thắng</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>x10</span>
                    <span className="text-yellow-500">0.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x5</span>
                    <span className="text-purple-500">2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x3</span>
                    <span className="text-blue-500">5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x2</span>
                    <span className="text-green-500">10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x1.5</span>
                    <span className="text-orange-500">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x1</span>
                    <span>20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x0.5</span>
                    <span className="text-red-400">25%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>x0</span>
                    <span className="text-red-500">22.5%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 