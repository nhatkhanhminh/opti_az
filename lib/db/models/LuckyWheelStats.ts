import mongoose, { Schema, Document } from 'mongoose';

export interface ILuckyWheelStats extends Document {
  totalSpins: number;
  totalBetAmount: string;
  totalRewards: string;
  totalBurned: string;
  totalReferralCommissions: string;
  poolBalance: string;
  biggestWin: {
    user: string;
    amount: string;
    multiplier: number;
    timestamp: Date;
  };
  dailyStats: {
    date: string;
    spins: number;
    betAmount: string;
    rewards: string;
    uniqueUsers: number;
  }[];
  segmentStats: {
    segmentIndex: number;
    multiplier: number;
    hitCount: number;
    totalPayout: string;
  }[];
  topWinners: {
    user: string;
    totalWins: string;
    biggestWin: string;
    totalSpins: number;
  }[];
  lastUpdated: Date;
}

const LuckyWheelStatsSchema = new Schema<ILuckyWheelStats>({
  totalSpins: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBetAmount: {
    type: String,
    default: '0'
  },
  totalRewards: {
    type: String,
    default: '0'
  },
  totalBurned: {
    type: String,
    default: '0'
  },
  totalReferralCommissions: {
    type: String,
    default: '0'
  },
  poolBalance: {
    type: String,
    default: '0'
  },
  biggestWin: {
    user: {
      type: String,
      default: ''
    },
    amount: {
      type: String,
      default: '0'
    },
    multiplier: {
      type: Number,
      default: 0
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  dailyStats: [{
    date: {
      type: String,
      required: true
    },
    spins: {
      type: Number,
      default: 0
    },
    betAmount: {
      type: String,
      default: '0'
    },
    rewards: {
      type: String,
      default: '0'
    },
    uniqueUsers: {
      type: Number,
      default: 0
    }
  }],
  segmentStats: [{
    segmentIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 7
    },
    multiplier: {
      type: Number,
      required: true
    },
    hitCount: {
      type: Number,
      default: 0
    },
    totalPayout: {
      type: String,
      default: '0'
    }
  }],
  topWinners: [{
    user: {
      type: String,
      required: true
    },
    totalWins: {
      type: String,
      default: '0'
    },
    biggestWin: {
      type: String,
      default: '0'
    },
    totalSpins: {
      type: Number,
      default: 0
    }
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
LuckyWheelStatsSchema.index({ lastUpdated: -1 });
LuckyWheelStatsSchema.index({ 'dailyStats.date': -1 });
LuckyWheelStatsSchema.index({ 'topWinners.totalWins': -1 });

export const LuckyWheelStats = mongoose.models.LuckyWheelStats || 
  mongoose.model<ILuckyWheelStats>('LuckyWheelStats', LuckyWheelStatsSchema); 