// GET /api/v1/home: stats and the cheapest dishes right now.
import express from 'express';
import { getHome } from '../controllers/site.controller.js';

const router = express.Router();

router.get('/', getHome);

export default router;
