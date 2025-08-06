// lib/db/models/PriceHistory.ts
import mongoose from "mongoose";

const PriceHistorySchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  USD: { type: Number, required: true },
  change24h: { type: Number, required: true }, // Thêm change24h
  timestamp: { type: Date, required: true },
});

PriceHistorySchema.index({ symbol: 1, timestamp: -1 });

export const PriceHistory = mongoose.models.PriceHistory || mongoose.model("PriceHistory", PriceHistorySchema);