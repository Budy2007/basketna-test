// A shop whose prices are compared, or a reference source (official or wholesale prices).
import mongoose from 'mongoose';

const shopSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  // hypermarket, supermarket, discounter, online_grocer, independent, market, government, wholesale_market
  kind: { type: String, required: true },
  inComparison: { type: Boolean, default: true }, // false for official/wholesale reference prices
  website: String,
  notes: String,
});

export const Shop = mongoose.model('Shop', shopSchema);
