'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatUsdtAmount } from '@/lib/formatUsdt';
import { Coins, Gift, Trophy, Zap } from 'lucide-react';

interface SpinResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: {
    multiplier: number;
    betAmount: string;
    rewardAmount: string;
    spinId: string;
    segmentIndex: number;
  } | null;
  onClaim?: (spinId: string) => Promise<{ success: boolean }>;
  claimed?: boolean;
}

export default function SpinResultModal({
  isOpen,
  onClose,
  result,
  onClaim,
  claimed = false
}: SpinResultModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [isClaimed, setIsClaimed] = useState(claimed);

  useEffect(() => {
    if (isOpen && result) {
      // Show confetti for wins
      if (result.multiplier > 0) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);
      }
    }
  }, [isOpen, result]);

  const handleClaim = async () => {
    if (!result || !onClaim) return;

    try {
      setIsClaiming(true);
      const claimResult = await onClaim(result.spinId);
      
      if (claimResult.success) {
        setIsClaimed(true);
      } else {
        alert('Có lỗi khi nhận thưởng');
      }
    } catch (error) {
      console.error('Claim error:', error);
      alert('Có lỗi xảy ra');
    } finally {
      setIsClaiming(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;

    if (result.multiplier >= 10) return <Trophy className="h-16 w-16 text-yellow-500" />;
    if (result.multiplier >= 5) return <Gift className="h-16 w-16 text-purple-500" />;
    if (result.multiplier >= 2) return <Zap className="h-16 w-16 text-blue-500" />;
    if (result.multiplier > 0) return <Coins className="h-16 w-16 text-green-500" />;
    return <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center text-2xl">😢</div>;
  };

  const getResultMessage = () => {
    if (!result) return '';

    if (result.multiplier >= 10) return 'JACKPOT! 🎰';
    if (result.multiplier >= 5) return 'THẮNG LỚN! 🎉';
    if (result.multiplier >= 2) return 'THẮNG TUYỆT VỜI! ✨';
    if (result.multiplier > 0) return 'CHÚC MỪNG! 🎊';
    return 'CHÚC BẠN MAY MẮN LẦN SAU! 🍀';
  };

  const getMultiplierColor = (multiplier: number) => {
    if (multiplier >= 10) return 'text-yellow-500';
    if (multiplier >= 5) return 'text-purple-500';
    if (multiplier >= 3) return 'text-blue-500';
    if (multiplier >= 2) return 'text-green-500';
    if (multiplier >= 1.5) return 'text-orange-500';
    if (multiplier >= 1) return 'text-gray-500';
    return 'text-red-500';
  };

  if (!result) return null;

  return (
    <>
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                transform: `translateY(${100 + Math.random() * 100}vh)`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'][
                    Math.floor(Math.random() * 6)
                  ],
                }}
              />
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold">
              {getResultMessage()}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex flex-col items-center space-y-6 py-6">
            {/* Result Icon */}
            <div className="animate-bounce">
              {getResultIcon()}
            </div>

            {/* Multiplier */}
            <div className="text-center">
              <div className={`text-6xl font-bold ${getMultiplierColor(result.multiplier)}`}>
                x{result.multiplier}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Hệ số nhân
              </div>
            </div>

            {/* Bet and Reward Info */}
            <div className="w-full space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-muted-foreground">Số tiền cược:</span>
                <span className="font-semibold">{formatUsdtAmount(result.betAmount)} AZC</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm text-muted-foreground">Phần thưởng:</span>
                <span className="font-bold text-green-600 text-lg">
                  {formatUsdtAmount(result.rewardAmount)} AZC
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-3">
              {parseFloat(result.rewardAmount) > 0 && !isClaimed && (
                <Button
                  onClick={handleClaim}
                  disabled={isClaiming}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3"
                  size="lg"
                >
                  {isClaiming ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Gift className="mr-2 h-5 w-5" />
                      Nhận thưởng ngay
                    </>
                  )}
                </Button>
              )}

              {isClaimed && (
                <div className="text-center">
                  <Badge variant="outline" className="text-green-500 border-green-500">
                    ✅ Đã nhận thưởng thành công!
                  </Badge>
                </div>
              )}

              {parseFloat(result.rewardAmount) === 0 && (
                <div className="text-center text-muted-foreground">
                  <p>Không có phần thưởng lần này</p>
                  <p className="text-sm">Chúc bạn may mắn lần sau! 🍀</p>
                </div>
              )}

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
              >
                Đóng
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Spin ID: {result.spinId.slice(0, 8)}...</p>
              {result.multiplier > 0 && (
                <p>🎉 Chúc mừng bạn đã thắng! Hãy tiếp tục chơi để có cơ hội thắng lớn hơn!</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 