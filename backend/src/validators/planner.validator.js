import { z } from 'zod';
import { people, planGrid } from './common.js';

export const analyzeSchema = { body: z.object({ plan: planGrid, people }) };
