import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db/connect';
import { LuckyWheelSpin } from '@/lib/db/models/LuckyWheelSpin';

export async function POST(request: NextRequest) {
  try {
    const { spinId, txHash, userAddress } = await request.json();

    // Validate input
    if (!spinId || !txHash || !userAddress) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Find and update the spin record
    const spin = await LuckyWheelSpin.findById(spinId);
    
    if (!spin) {
      return NextResponse.json(
        { error: 'Spin not found' },
        { status: 404 }
      );
    }

    if (spin.user.toLowerCase() !== userAddress.toLowerCase()) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (spin.claimed) {
      return NextResponse.json(
        { error: 'Reward already claimed' },
        { status: 409 }
      );
    }

    if (spin.status !== 'completed' || !spin.rewardAmount || parseFloat(spin.rewardAmount) <= 0) {
      return NextResponse.json(
        { error: 'No reward to claim' },
        { status: 400 }
      );
    }

    // Update spin record as claimed
    spin.claimed = true;
    spin.claimTxHash = txHash;
    spin.claimTimestamp = new Date();
    
    await spin.save();

    return NextResponse.json({
      success: true,
      message: 'Reward claimed successfully',
      spin: {
        id: spin._id,
        rewardAmount: spin.rewardAmount,
        claimTxHash: txHash,
        claimTimestamp: spin.claimTimestamp
      }
    });

  } catch (error) {
    console.error('Claim reward error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 