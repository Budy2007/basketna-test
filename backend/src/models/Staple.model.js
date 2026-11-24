// A basic ingredient priced per kg, liter or piece, with nutrition per 100 g.
import mongoose from 'mongoose';

const stapleSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  unit: { type: String, enum: ['kg', 'liter', 'piece'], required: true },
  foodGroup: { type: String, required: true },
  freshDays: { type: Number, required: true, min: 1 },
  compare: { type: Boolean, default: true }, // false for staples bought elsewhere (baladi bread at the bakery)
  gramsPerUnit: Number,
  nutrition: { kcal: Number, protein_g: Number, fat_g: Number, carbs_g: Number, fiber_g: Number, iron_mg: Number }, // per 100 g
  nutritionSource: String,
});

export const Staple = mongoose.model('Staple', stapleSchema);
