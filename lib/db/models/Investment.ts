import mongoose, { Schema } from 'mongoose';

const investmentSchema = new Schema({
  userAddress: { 
    type: String, 
    required: true,
    index: true 
  },
  stakeId: { 
    type: Number, 
    required: true,
    index: true
  },
  planId: { type: Number, required: true },
  token: { type: String, required: true }, // Loại token đầu tư (BNB, FIL, v.v.)
  amount: { type: Number, required: true }, // Số lượng token
  usdtValue: { type: Number, required: true }, // Giá trị quy đổi ra USDT
  plan: { 
    monthlyRate: { type: Number, required: true }, // Lãi suất hàng tháng
    dailyRate: { type: Number, required: true }    // Lãi suất hàng ngày
  },
  status: { 
    type: String, 
    enum: ['active', 'completed', 'maxedOut'],
    default: 'active',
    index: true
  },
  totalClaimed: { type: Number, default: 0 }, // Tổng số đã claim
  lastClaimDate: { type: Date },
  nextClaimDate: { type: Date },
  startDate: { type: Date, required: true }, // Thời gian bắt đầu stake
  rawData: {
    amount: { type: String }, // Giá trị gốc từ blockchain
    usdtAmount: { type: String },
    totalClaimed: { type: String }
  },
  createdAt: { type: Date, default: Date.now, index: true }
}, { 
  timestamps: true 
});

// Đánh các index cần thiết
investmentSchema.index({ userAddress: 1, status: 1 });
investmentSchema.index({ userAddress: 1, createdAt: -1 });
investmentSchema.index({ userAddress: 1, stakeId: 1 }, { unique: true });

// const Investment = mongoose.model('Investment', investmentSchema);
export const Investment = mongoose.models.Investment || mongoose.model('Investment', investmentSchema);


// export default Investment;
