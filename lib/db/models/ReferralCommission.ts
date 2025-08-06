import mongoose, { Schema } from 'mongoose';

const referralCommissionSchema = new Schema({
  receiverAddress: { 
    type: String, 
    required: true,
    index: true 
  },
  fromAddress: { 
    type: String, 
    required: true,
    index: true 
  },
  level: { type: Number, required: true }, // Cấp giới thiệu (1-10)
  amount: { type: Number, required: true }, // Số tiền hoa hồng
  commissionType: { 
    type: String, 
    enum: ['direct', 'profit', 'volume'],
    required: true,
    index: true
  },
  investmentId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Investment' 
  },
  claimId: { 
    type: Schema.Types.ObjectId, 
    ref: 'ClaimHistory' 
  },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now, index: true }
}, { 
  timestamps: true 
});

// Composite index
referralCommissionSchema.index({ receiverAddress: 1, commissionType: 1, createdAt: -1 });

const ReferralCommission = mongoose.model('ReferralCommission', referralCommissionSchema);

export default ReferralCommission;
