// App settings as key/value strings (city name, recommendation thresholds, defaults).
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: String, required: true },
});

export const DEFAULT_SETTINGS = {
  city_ar: 'القاهرة', city_en: 'Cairo', neighborhood_ar: '', neighborhood_en: '',
  min_saving_pct: '3', split_min_pct: '8', split_min_egp: '100', default_people: '4',
};

export const Setting = mongoose.model('Setting', settingSchema);
