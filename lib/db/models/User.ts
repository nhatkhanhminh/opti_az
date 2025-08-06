import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema({
  address: { 
    type: String, 
    unique: true, 
    required: true,
    index: true // Đánh index để tăng tốc tìm kiếm
  },
  referrer: { 
    type: String, 
    index: true // Đánh index cho trường referrer
  },
  leader: { 
    type: String,
    index: true
  },
  totalInvestment: { type: Number, default: 0 }, // Tổng giá trị đầu tư (USDT) - đã chuyển đổi
  activeInvestment: { type: Number, default: 0 }, // Tổng giá trị đầu tư đang hoạt động
  rawInvestment: { type: String, default: '0' }, // Giá trị đầu tư gốc (BigNumber string) từ blockchain
  totalEarned: { type: Number, default: 0 }, // Tổng lãi đã kiếm được - đã chuyển đổi
  rawEarned: { type: String, default: '0' }, // Giá trị lãi gốc từ blockchain
  maxOut: { type: Number, default: 0 }, // Giới hạn maxout
  level: { type: Number, default: 0 }, // Level của user (1-5)
  teamVolume: { type: Number, default: 0 }, // Doanh số nhóm
  directReferrals: { type: Number, default: 0 }, // Số F1 trực tiếp
  directVolume: { type: Number, default: 0 }, // Doanh số F1
  totalDownlines: { type: Number, default: 0 }, // Tổng số tuyến dưới
  isActive: { type: Boolean, default: true },
  timeJoin: {  type: Date, index: true },
  createdAt: { type: Date, default: Date.now, index: true }
}, { 
  timestamps: true 
});

// Đánh composite index cho các truy vấn phổ biến
userSchema.index({ referrer: 1, totalInvestment: -1 });
userSchema.index({ leader: 1, teamVolume: -1 });

// const User = mongoose.model('User', userSchema);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

