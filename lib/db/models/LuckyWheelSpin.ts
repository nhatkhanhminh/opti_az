import mongoose, { Schema, Document } from 'mongoose';

export interface ILuckyWheelSpin extends Document {
  user: string;
  txHash: string;
  betAmount: string;
  spinId?: string;
  segmentIndex?: number;
  multiplier?: number;
  rewardAmount?: string;
  claimed: boolean;
  claimTxHash?: string;
  randomNumber?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
  claimTimestamp?: Date;
}

const LuckyWheelSpinSchema = new Schema<ILuckyWheelSpin>({
  user: {
    type: String,
    required: true,
    lowercase: true,
    index: true
  },
  txHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  betAmount: {
    type: String,
    required: true
  },
  spinId: {
    type: String,
    index: true
  },
  segmentIndex: {
    type: Number,
    min: 0
  },
  multiplier: {
    type: Number,
    min: 0
  },
  rewardAmount: {
    type: String,
    default: '0'
  },
  claimed: {
    type: Boolean,
    default: false,
    index: true
  },
  claimTxHash: {
    type: String,
    sparse: true
  },
  randomNumber: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  claimTimestamp: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LuckyWheelSpinSchema.index({ user: 1, timestamp: -1 });
LuckyWheelSpinSchema.index({ status: 1, timestamp: -1 });
LuckyWheelSpinSchema.index({ claimed: 1, rewardAmount: 1 });

export const LuckyWheelSpin = mongoose.models.LuckyWheelSpin || 
  mongoose.model<ILuckyWheelSpin>('LuckyWheelSpin', LuckyWheelSpinSchema); 