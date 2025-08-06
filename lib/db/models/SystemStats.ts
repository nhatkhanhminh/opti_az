import mongoose, { Schema } from 'mongoose';

const systemStatsSchema = new Schema({
  totalUsers: { type: Number, default: 0 },
  totalInvestment: { type: Number, default: 0 }, // Tổng USD đầu tư
  totalClaimed: { type: Number, default: 0 }, // Tổng USD đã trả
  totalCommission: { type: Number, default: 0 }, // Tổng hoa hồng đã trả
  activeInvestments: { type: Number, default: 0 },
  dailySummary: [{
    date: { type: Date },
    newUsers: { type: Number, default: 0 },
    newInvestments: { type: Number, default: 0 },
    claimedAmount: { type: Number, default: 0 },
    commissionAmount: { type: Number, default: 0 }
  }],
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// const SystemStats = mongoose.model('SystemStats', systemStatsSchema);
export const SystemStats = mongoose.models.SystemStats || mongoose.model('SystemStats', systemStatsSchema);
// export default SystemStats;
