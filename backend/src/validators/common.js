// Schema pieces shared by the feature validators.
import { z } from 'zod';
import { SLOTS } from '../models/constants.js';

/** The plan grid: {"d0_breakfast": "ful_medames", ...}. Unknown meals are dropped later by the service. */
const gridKeys = Array.from({ length: 7 }, (_, d) => SLOTS.map((s) => `d${d}_${s}`)).flat();
export const planGrid = z.object(Object.fromEntries(gridKeys.map((k) => [k, z.string().max(60).optional()]))).default({});

/** People may arrive as a number or a string; out-of-range values are clamped by the service. */
export const people = z.union([z.number(), z.string()]).optional();
