'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatUsdtAmount } from '@/lib/formatUsdt';
import { shortenWalletAddress } from '@/lib/shortAddress';

interface SpinHistory {
  id: string;
  txHash: string;
  betAmount: string;
  multiplier?: number;
  rewardAmount: string;
  claimed: boolean;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  claimTimestamp?: string;
}

interface UserStats {
  totalSpins: number;
  totalBetAmount: string;
  totalRewards: string;
  pendingRewards: string;
  biggestWin: string;
  winRate: number;
}

export default function HistoryPage() {
  const t = useTranslations('luckyWheel');
  const [spins, setSpins] = useState<SpinHistory[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    // Get user address from wallet connection
    // This would be from your wallet context
    const address = '0x123...'; // Placeholder
    setUserAddress(address);
    if (address) {
      fetchHistory(address);
    }
  }, [currentPage, statusFilter]);

  const fetchHistory = async (address: string) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        user: address,
        page: currentPage.toString(),
        limit: '20',
        status: statusFilter
      });

      const response = await fetch(`/api/lucky-wheel/history?${params}`);
      const data = await response.json();

      if (data.success) {
        setSpins(data.data.spins);
        setUserStats(data.data.userStats);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (spinId: string) => {
    try {
      // This would integrate with your smart contract
      console.log('Claiming reward for spin:', spinId);
      // After successful claim, refresh the history
      if (userAddress) {
        fetchHistory(userAddress);
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const getStatusBadge = (status: string, claimed: boolean) => {
    if (status === 'pending') {
      return <Badge variant="secondary">Đang xử lý</Badge>;
    }
    if (status === 'failed') {
      return <Badge variant="destructive">Thất bại</Badge>;
    }
    if (status === 'completed' && !claimed) {
      return <Badge variant="default">Chưa nhận</Badge>;
    }
    return <Badge variant="outline">Đã nhận</Badge>;
  };

  const getMultiplierColor = (multiplier?: number) => {
    if (!multiplier) return 'text-gray-500';
    if (multiplier >= 10) return 'text-yellow-500';
    if (multiplier >= 5) return 'text-purple-500';
    if (multiplier >= 3) return 'text-blue-500';
    if (multiplier >= 2) return 'text-green-500';
    if (multiplier >= 1.5) return 'text-orange-500';
    return 'text-red-500';
  };

  if (!userAddress) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Kết nối ví</h3>
              <p className="text-muted-foreground">Vui lòng kết nối ví để xem lịch sử</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Lịch sử Lucky Wheel</h1>
        
        {/* User Stats Cards */}
        {userStats && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{userStats.totalSpins}</div>
                <p className="text-xs text-muted-foreground">Tổng lượt quay</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatUsdtAmount(userStats.totalBetAmount)}</div>
                <p className="text-xs text-muted-foreground">Tổng cược</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-500">{formatUsdtAmount(userStats.totalRewards)}</div>
                <p className="text-xs text-muted-foreground">Tổng thắng</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-orange-500">{formatUsdtAmount(userStats.pendingRewards)}</div>
                <p className="text-xs text-muted-foreground">Chờ nhận</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-500">{formatUsdtAmount(userStats.biggestWin)}</div>
                <p className="text-xs text-muted-foreground">Thắng lớn nhất</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{userStats.winRate}%</div>
                <p className="text-xs text-muted-foreground">Tỷ lệ thắng</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Tabs */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">Tất cả</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
            <TabsTrigger value="pending">Đang xử lý</TabsTrigger>
            <TabsTrigger value="failed">Thất bại</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Spin History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch sử quay thưởng</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : spins.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có lịch sử nào
            </div>
          ) : (
            <div className="space-y-4">
              {spins.map((spin) => (
                <div key={spin.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusBadge(spin.status, spin.claimed)}
                      <span className="text-sm text-muted-foreground">
                        {new Date(spin.timestamp).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {shortenWalletAddress(spin.txHash)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Số tiền cược</p>
                      <p className="font-semibold">{formatUsdtAmount(spin.betAmount)} AZC</p>
                    </div>
                    
                    {spin.multiplier && (
                      <div>
                        <p className="text-sm text-muted-foreground">Hệ số</p>
                        <p className={`font-semibold ${getMultiplierColor(spin.multiplier)}`}>
                          x{spin.multiplier}
                        </p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-muted-foreground">Phần thưởng</p>
                      <p className="font-semibold text-green-500">
                        {formatUsdtAmount(spin.rewardAmount)} AZC
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      {spin.status === 'completed' && 
                       !spin.claimed && 
                       parseFloat(spin.rewardAmount) > 0 && (
                        <Button 
                          size="sm" 
                          onClick={() => handleClaim(spin.id)}
                          className="ml-auto"
                        >
                          Nhận thưởng
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 