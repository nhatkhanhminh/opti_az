import mongoose, { Schema } from 'mongoose';

// Model này lưu cấu trúc cây giới thiệu denormalized để truy vấn nhanh
const referralTreeSchema = new Schema({
  userAddress: { 
    type: String, 
    required: true,
    unique: true,
    index: true 
  },
  // Mảng các địa chỉ ví của 10 tuyến trên
  uplines: [{ 
    level: Number, // Cấp 1-10
    address: String 
  }],
  // Mảng các địa chỉ ví của tuyến dưới trực tiếp (cấp 1)
  directDownlines: [{ 
    type: String,
    index: true 
  }],
  teamStats: {
    totalMembers: { type: Number, default: 0 },
    totalVolume: { type: Number, default: 0 },
    levelDistribution: [{ level: Number, count: Number, volume: Number }]
  },
  hasLeader: { type: Boolean, default: false },
  leaderAddress: { type: String },
  updatedAt: { type: Date, default: Date.now }
}, { 
  timestamps: true 
});

// Index cho việc tìm kiếm uplines
referralTreeSchema.index({ "uplines.address": 1, "uplines.level": 1 });

const ReferralTree = mongoose.model('ReferralTree', referralTreeSchema);

export default ReferralTree;
