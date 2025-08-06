'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useActiveAccount } from 'thirdweb/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import LuckyWheelGame from '@/components/lucky-wheel/LuckyWheelGame';
import SpinResultModal from '@/components/lucky-wheel/SpinResultModal';
import GameStats from '@/components/lucky-wheel/GameStats';
import { useLuckyWheel, GameConfig, WheelSegment } from '@/hooks/useLuckyWheel';
import { useWalletConnect } from '@/hooks/useWalletConnect';
import { formatUsdtAmount } from '@/lib/formatUsdt';

export default function LuckyWheelPage() {
  const t = useTranslations('luckyWheel');
  const account = useActiveAccount();
  const { handleConnect } = useWalletConnect();
  
  const {
    isLoading,
    error,
    spin,
    claimReward,
    getUserBalance,
    getGameConfig,
    getWheelSegments,
    isConnected
  } = useLuckyWheel();

  const [userBalance, setUserBalance] = useState('0');
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [wheelSegments, setWheelSegments] = useState<WheelSegment[]>([]);
  const [spinResult, setSpinResult] = useState<{
    multiplier: number;
    betAmount: string;
    rewardAmount: string;
    spinId: string;
    segmentIndex: number;
  } | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultClaimed, setResultClaimed] = useState(false);

  // Load user data when wallet connects
  useEffect(() => {
    if (isConnected) {
      loadUserData();
      loadGameData();
    }
  }, [isConnected]);

  const loadUserData = async () => {
    try {
      const balance = await getUserBalance();
      setUserBalance(balance);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadGameData = async () => {
    try {
      const [config, segments] = await Promise.all([
        getGameConfig(),
        getWheelSegments()
      ]);
      
      setGameConfig(config);
      setWheelSegments(segments);
    } catch (error) {
      console.error('Error loading game data:', error);
    }
  };

  // Handle spin with real contract integration
  const handleSpin = async (betAmount: string) => {
    if (!isConnected) {
      alert('Vui lòng kết nối ví trước');
      return { success: false };
    }

    try {
      // Convert to wei (18 decimals)
      const betAmountWei = (parseFloat(betAmount) * 10**18).toString();
      
      const result = await spin(betAmountWei);
      
      if (result.success) {
        // For demo purposes, simulate getting result from events or contract
        // In real implementation, you would parse events or make additional contract calls
        const mockSegmentIndex = Math.floor(Math.random() * 8);
        const segmentMultipliers = wheelSegments.map(s => s.multiplier);
        const multiplier = segmentMultipliers[mockSegmentIndex] || 1;
        const rewardAmount = (parseFloat(betAmount) * multiplier).toString();

        const spinResultData = {
          multiplier,
          betAmount,
          rewardAmount,
          spinId: result.txHash || 'unknown', // Use tx hash as temporary spinId
          segmentIndex: mockSegmentIndex,
        };

        setSpinResult(spinResultData);
        setShowResultModal(true);
        setResultClaimed(false);

        // Refresh balance
        await loadUserData();

        return {
          success: true,
          spinId: spinResultData.spinId,
          segmentIndex: mockSegmentIndex,
        };
      } else {
        throw new Error(result.error || 'Spin failed');
      }
    } catch (error: any) {
      console.error('Spin error:', error);
      alert(error.message || 'Có lỗi xảy ra khi quay thưởng');
      return { success: false };
    }
  };

  // Handle claim with real contract integration
  const handleClaim = async (spinId: string) => {
    if (!isConnected) {
      alert('Vui lòng kết nối ví trước');
      return { success: false };
    }

    try {
      const result = await claimReward(spinId);
      
      if (result.success) {
        setResultClaimed(true);
        // Refresh balance
        await loadUserData();
        return { success: true };
      } else {
        throw new Error(result.error || 'Claim failed');
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      alert(error.message || 'Có lỗi khi nhận thưởng');
      return { success: false };
    }
  };

  // Wallet connection component
  const WalletConnection = () => (
    <Card className="mb-6">
      <CardContent className="p-6 text-center">
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Kết nối ví để bắt đầu chơi</h3>
          <p className="text-muted-foreground">
            Bạn cần kết nối ví để có thể tham gia Lucky Wheel
          </p>
          <Button 
            onClick={() => handleConnect()}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600"
          >
            Kết nối ví
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // Game status component
  const GameStatus = () => {
    if (!gameConfig) return null;
    
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trạng thái Game</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Trạng thái:</p>
              <p className={`font-semibold ${gameConfig.gameActive ? 'text-green-500' : 'text-red-500'}`}>
                {gameConfig.gameActive ? 'Hoạt động' : 'Tạm dừng'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Cược tối thiểu:</p>
              <p className="font-semibold">{formatUsdtAmount((parseFloat(gameConfig.minBet) / 10**18).toString())} AZC</p>
            </div>
            <div>
              <p className="text-muted-foreground">Cược tối đa:</p>
              <p className="font-semibold">{formatUsdtAmount((parseFloat(gameConfig.maxBet) / 10**18).toString())} AZC</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tỷ lệ đốt:</p>
              <p className="font-semibold">{gameConfig.burnRate / 100}%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          🎰 Lucky Wheel 🎰
        </h1>
        <p className="text-lg text-muted-foreground">
          Quay thưởng may mắn - Cơ hội thắng lớn với AZC Token!
        </p>
      </div>

      {/* Show wallet connection if not connected */}
      {!isConnected && <WalletConnection />}
      
      {/* Show game status if connected */}
      {isConnected && <GameStatus />}

      {/* Show error if any */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">⚠️ {error}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="game" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="game">🎮 Chơi Game</TabsTrigger>
          <TabsTrigger value="stats">📊 Thống Kê</TabsTrigger>
        </TabsList>

        <TabsContent value="game" className="space-y-6">
          {isConnected ? (
            <LuckyWheelGame
              userBalance={formatUsdtAmount((parseFloat(userBalance) / 10**18).toString())}
              onSpin={handleSpin}
              onClaim={handleClaim}
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                Vui lòng kết nối ví để bắt đầu chơi
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <GameStats />
        </TabsContent>
      </Tabs>

      {/* Spin Result Modal */}
      <SpinResultModal
        isOpen={showResultModal}
        onClose={() => setShowResultModal(false)}
        result={spinResult}
        onClaim={handleClaim}
        claimed={resultClaimed}
      />

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p>Đang xử lý giao dịch...</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
} 