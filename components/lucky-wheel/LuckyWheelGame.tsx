'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatUsdtAmount } from '@/lib/formatUsdt';
import { Loader2, Coins, AlertTriangle, CheckCircle } from 'lucide-react';

// Wheel segments configuration
const WHEEL_SEGMENTS = [
  { multiplier: 10, color: '#FFD700', probability: 0.5, label: 'x10' },    // Gold
  { multiplier: 0, color: '#FF4444', probability: 22.5, label: 'x0' },     // Red
  { multiplier: 1.5, color: '#FF8C00', probability: 15, label: 'x1.5' },   // Orange
  { multiplier: 0.5, color: '#FF6B6B', probability: 25, label: 'x0.5' },   // Light Red
  { multiplier: 2, color: '#4CAF50', probability: 10, label: 'x2' },        // Green
  { multiplier: 1, color: '#9E9E9E', probability: 20, label: 'x1' },        // Gray
  { multiplier: 3, color: '#2196F3', probability: 5, label: 'x3' },         // Blue
  { multiplier: 5, color: '#9C27B0', probability: 2, label: 'x5' },         // Purple
];

interface LuckyWheelGameProps {
  userBalance?: string;
  onSpin?: (betAmount: string) => Promise<{ success: boolean; spinId?: string; segmentIndex?: number; error?: string }>;
  onClaim?: (spinId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function LuckyWheelGame({ 
  userBalance = '0', 
  onSpin,
  onClaim 
}: LuckyWheelGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [betAmount, setBetAmount] = useState('10');
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [lastSpinResult, setLastSpinResult] = useState<{
    multiplier: number;
    reward: string;
    spinId: string;
    claimed: boolean;
  } | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [transactionStep, setTransactionStep] = useState<'idle' | 'approving' | 'spinning' | 'completed' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Canvas drawing
  useEffect(() => {
    drawWheel();
  }, [currentRotation]);

  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw segments
    const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;
    
    WHEEL_SEGMENTS.forEach((segment, index) => {
      const startAngle = index * segmentAngle + currentRotation;
      const endAngle = startAngle + segmentAngle;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = segment.color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + segmentAngle / 2;
      const textRadius = radius * 0.7;
      const textX = centerX + Math.cos(textAngle) * textRadius;
      const textY = centerY + Math.sin(textAngle) * textRadius;

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(segment.label, 0, 0);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333333';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 5);
    ctx.lineTo(centerX - 10, centerY - radius - 25);
    ctx.lineTo(centerX + 10, centerY - radius - 25);
    ctx.closePath();
    ctx.fillStyle = '#FF4444';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const handleSpin = async () => {
    if (isSpinning || !onSpin) return;
    
    setError(null);
    setSuccessMessage(null);
    
    const betAmountNum = parseFloat(betAmount);
    if (betAmountNum <= 0) {
      setError('Vui lòng nhập số tiền cược hợp lệ');
      return;
    }

    if (betAmountNum > parseFloat(userBalance)) {
      setError('Số dư không đủ');
      return;
    }

    try {
      setIsSpinning(true);
      setShowResult(false);
      setTransactionStep('approving');
      
      // Call spin API
      const result = await onSpin(betAmount);
      
      if (result.success && result.segmentIndex !== undefined) {
        setTransactionStep('spinning');
        setSuccessMessage('Giao dịch thành công! Đang quay thưởng...');
        
        // Calculate target rotation
        const segmentAngle = (2 * Math.PI) / WHEEL_SEGMENTS.length;
        const targetSegmentAngle = result.segmentIndex * segmentAngle;
        const spins = 5; // Number of full rotations
        const targetRotation = spins * 2 * Math.PI + (2 * Math.PI - targetSegmentAngle);
        
        // Animate wheel
        animateWheel(targetRotation, result.segmentIndex, result.spinId || '');
      } else {
        setTransactionStep('error');
        setError(result.error || 'Có lỗi xảy ra khi quay thưởng');
        setIsSpinning(false);
      }
    } catch (error: any) {
      console.error('Spin error:', error);
      setTransactionStep('error');
      setError(error.message || 'Có lỗi xảy ra');
      setIsSpinning(false);
    }
  };

  const animateWheel = (targetRotation: number, segmentIndex: number, spinId: string) => {
    const startRotation = currentRotation;
    const duration = 3000; // 3 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      const newRotation = startRotation + (targetRotation - startRotation) * easeOut;
      setCurrentRotation(newRotation);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spin completed
        setTransactionStep('completed');
        setIsSpinning(false);
        showSpinResult(segmentIndex, spinId);
      }
    };

    requestAnimationFrame(animate);
  };

  const showSpinResult = (segmentIndex: number, spinId: string) => {
    const segment = WHEEL_SEGMENTS[segmentIndex];
    const betAmountNum = parseFloat(betAmount);
    const rewardAmount = betAmountNum * segment.multiplier;
    
    setLastSpinResult({
      multiplier: segment.multiplier,
      reward: rewardAmount.toString(),
      spinId,
      claimed: false
    });
    setShowResult(true);
    setSuccessMessage(`Chúc mừng! Bạn đã quay được x${segment.multiplier}!`);
  };

  const handleClaim = async () => {
    if (!lastSpinResult || !onClaim) return;

    try {
      setTransactionStep('approving');
      const result = await onClaim(lastSpinResult.spinId);
      
      if (result.success) {
        setLastSpinResult(prev => prev ? { ...prev, claimed: true } : null);
        setTransactionStep('completed');
        setSuccessMessage('Đã nhận thưởng thành công!');
      } else {
        setTransactionStep('error');
        setError(result.error || 'Có lỗi khi nhận thưởng');
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      setTransactionStep('error');
      setError(error.message || 'Có lỗi xảy ra');
    }
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

  const getTransactionStatus = () => {
    switch (transactionStep) {
      case 'approving':
        return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Đang xử lý giao dịch...', color: 'text-blue-500' };
      case 'spinning':
        return { icon: <Loader2 className="h-4 w-4 animate-spin" />, text: 'Đang quay thưởng...', color: 'text-blue-500' };
      case 'completed':
        return { icon: <CheckCircle className="h-4 w-4" />, text: 'Hoàn thành!', color: 'text-green-500' };
      case 'error':
        return { icon: <AlertTriangle className="h-4 w-4" />, text: 'Có lỗi xảy ra', color: 'text-red-500' };
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Transaction Status */}
      {transactionStep !== 'idle' && (
        <Alert className={`${transactionStep === 'error' ? 'border-red-200 bg-red-50' : transactionStep === 'completed' ? 'border-green-200 bg-green-50' : 'border-blue-200 bg-blue-50'}`}>
          <AlertDescription className="flex items-center space-x-2">
            {getTransactionStatus()?.icon}
            <span className={getTransactionStatus()?.color}>
              {getTransactionStatus()?.text}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Message */}
      {successMessage && !error && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="text-green-600">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Game Wheel */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Canvas Wheel */}
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border-2 border-gray-200 rounded-full shadow-lg"
              />
              {isSpinning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded-full">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
              )}
            </div>

            {/* Bet Controls */}
            <div className="w-full max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Số tiền cược (AZC)
                </label>
                <Input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  min="1"
                  max={userBalance}
                  disabled={isSpinning}
                  className="text-center text-lg font-semibold"
                />
              </div>

              <div className="flex gap-2">
                {['10', '50', '100', '500'].map((amount) => (
                  <Button
                    key={amount}
                    variant="outline"
                    size="sm"
                    onClick={() => setBetAmount(amount)}
                    disabled={isSpinning}
                    className="flex-1"
                  >
                    {amount}
                  </Button>
                ))}
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Số dư: {formatUsdtAmount(userBalance)} AZC
              </div>

              <Button
                onClick={handleSpin}
                disabled={isSpinning || parseFloat(betAmount) <= 0 || parseFloat(betAmount) > parseFloat(userBalance)}
                className="w-full h-12 text-lg font-semibold"
                size="lg"
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {transactionStep === 'approving' ? 'Đang xác nhận...' : 'Đang quay...'}
                  </>
                ) : (
                  <>
                    <Coins className="mr-2 h-5 w-5" />
                    QUAY THƯỞNG
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Spin Result */}
      {showResult && lastSpinResult && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardHeader>
            <CardTitle className="text-center">
              🎉 Kết quả quay thưởng 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <div className={`text-4xl font-bold ${getMultiplierColor(lastSpinResult.multiplier)}`}>
                x{lastSpinResult.multiplier}
              </div>
              <div className="text-sm text-muted-foreground">Hệ số thắng</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-green-500">
                +{formatUsdtAmount(lastSpinResult.reward)} AZC
              </div>
              <div className="text-sm text-muted-foreground">Phần thưởng</div>
            </div>

            {parseFloat(lastSpinResult.reward) > 0 && !lastSpinResult.claimed && (
              <Button
                onClick={handleClaim}
                disabled={transactionStep === 'approving'}
                className="w-full bg-green-500 hover:bg-green-600"
                size="lg"
              >
                {transactionStep === 'approving' ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Nhận thưởng'
                )}
              </Button>
            )}

            {lastSpinResult.claimed && (
              <Badge variant="outline" className="text-green-500">
                ✅ Đã nhận thưởng
              </Badge>
            )}

            {parseFloat(lastSpinResult.reward) === 0 && (
              <div className="text-center text-muted-foreground">
                <p>Không có phần thưởng lần này</p>
                <p className="text-sm">Chúc bạn may mắn lần sau! 🍀</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Game Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Luật chơi</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {WHEEL_SEGMENTS.map((segment, index) => (
              <div key={index} className="flex justify-between items-center p-2 rounded" style={{ backgroundColor: `${segment.color}20` }}>
                <span className="font-semibold" style={{ color: segment.color }}>
                  {segment.label}
                </span>
                <span className="text-muted-foreground">
                  {segment.probability}%
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• Hoa hồng giới thiệu: F1: 5%, F2: 1%, F3: 1%</p>
            <p>• 3% mỗi lần cược sẽ được đốt token</p>
            <p>• Số tiền cược tối thiểu: 1 AZC</p>
            <p>• Cần approve AZC token trước khi quay</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 