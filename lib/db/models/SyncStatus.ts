// models/SyncStatus.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface ISyncStatus extends Document {
  eventType: string;           // Loại sự kiện hoặc bảng đang theo dõi
  contractAddress: string;     // Địa chỉ hợp đồng
  lastSyncedBlock: number;     // Block cuối cùng đã đồng bộ
  lastSyncedAt: Date;          // Thời gian đồng bộ lần cuối
  status: string;              // Trạng thái đồng bộ: 'success', 'error', 'in_progress'
  errorMessage?: string;       // Thông báo lỗi nếu có
  totalSynced: number;         // Tổng số bản ghi đã đồng bộ
}

const syncStatusSchema: Schema = new Schema({
  eventType: { 
    type: String, 
    required: true 
  },
  contractAddress: { 
    type: String, 
    required: true 
  },
  lastSyncedBlock: { 
    type: Number, 
    required: true,
    default: 0
  },
  lastSyncedAt: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['success', 'error', 'in_progress'],
    default: 'success'
  },
  errorMessage: { 
    type: String 
  },
  totalSynced: { 
    type: Number, 
    default: 0 
  }
}, { 
  timestamps: true 
});

// Đảm bảo mỗi cặp eventType và contractAddress là duy nhất
syncStatusSchema.index({ eventType: 1, contractAddress: 1 }, { unique: true });

const SyncStatus = mongoose.models.SyncStatus || mongoose.model<ISyncStatus>('SyncStatus', syncStatusSchema);

export default SyncStatus;
