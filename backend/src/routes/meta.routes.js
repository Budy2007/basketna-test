// GET /api/v1/meta: settings, staples, meals and shops every page needs.
import express from 'express';
import { getMeta } from '../controllers/site.controller.js';

const router = express.Router();

router.get('/', getMeta);

export default router;
