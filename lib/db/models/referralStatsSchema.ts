import mongoose, { Schema } from 'mongoose';
const referralStatsSchema = new Schema({
    userAddress: { type: String, required: true, unique: true },
    chartData: {
      sunburst: {}, // Dữ liệu cho biểu đồ mặt trời
      pyramid: {}   // Dữ liệu cho biểu đồ kim tự tháp
    },
    lastUpdated: { type: Date, default: Date.now }
  });

  const ReferralStats = mongoose.model('ReferralStats', referralStatsSchema);
  
  export default ReferralStats;
  
