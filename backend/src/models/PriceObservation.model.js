// One dated price seen at one shop. The log is append-only: a wrong price is fixed by a new observation,
// never by editing.
import mongoose from 'mongoose';
import { ISO_DATE, SOURCES } from './constants.js';

const observationSchema = new mongoose.Schema({
  staple: { type: String, required: true, index: true },
  shop: { type: String, required: true, index: true },
  productTitle: String,
  packSize: { type: Number, required: true, min: 1e-9 }, // in the staple's unit
  packPriceEgp: { type: Number, required: true, min: 0.01 },
  unitPriceEgp: { type: Number, required: true },
  isPromo: { type: Boolean, default: false },
  observedOn: { type: String, required: true, match: ISO_DATE },
  source: { type: String, enum: SOURCES, required: true },
  sourceUrl: String,
  collector: String,
  notes: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

const refuse = function () { throw new Error('price observations are append-only'); };
for (const op of ['updateOne', 'updateMany', 'findOneAndUpdate', 'replaceOne', 'deleteOne', 'deleteMany', 'findOneAndDelete']) {
  observationSchema.pre(op, refuse);
}

export const PriceObservation = mongoose.model('PriceObservation', observationSchema);
