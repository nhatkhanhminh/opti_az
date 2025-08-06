import mongoose, { Schema } from 'mongoose';

const investmentSchema = new Schema({
  userAddress: { 
    type: String, 
    required: true,
    index: true 
  },
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
  maxOutLimit: { type: Number }, // Giới hạn 400% initial investment
  lastClaimDate: { type: Date },
  nextClaimDate: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true }
}, { 
  timestamps: true 
});

// Đánh các index cần thiết
investmentSchema.index({ userAddress: 1, status: 1 });
investmentSchema.index({ userAddress: 1, createdAt: -1 });

const Investment = mongoose.model('Investment', investmentSchema);

export default Investment;
