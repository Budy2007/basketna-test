// /api/v1/meals: the meal gallery.
import express from 'express';
import { getMeals } from '../controllers/meal.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { galleryQuerySchema } from '../validators/meal.validator.js';

const router = express.Router();

router.get('/', validate(galleryQuerySchema), getMeals);

export default router;
