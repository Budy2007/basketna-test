// /api/v1/planner: calculations on a plan the visitor builds. POST because the plan travels in the body.
import express from 'express';
import { analyzePlan } from '../controllers/planner.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { analyzeSchema } from '../validators/planner.validator.js';

const router = express.Router();

router.post('/analyze', validate(analyzeSchema), analyzePlan);

export default router;
