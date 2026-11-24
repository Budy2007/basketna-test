// An Egyptian home meal: its slot and the staples one adult serving uses.
import mongoose from 'mongoose';
import { SLOTS } from './constants.js';

const mealSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, trim: true },
  nameAr: { type: String, required: true },
  nameEn: { type: String, required: true },
  slot: { type: String, enum: SLOTS, required: true },
  sourceUrl: String,
  ingredients: [{ _id: false, staple: { type: String, required: true }, qty: { type: Number, required: true, min: 0 } }],
});

export const Meal = mongoose.model('Meal', mealSchema);
