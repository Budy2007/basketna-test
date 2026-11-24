// /api/v1/prices: the public price table.
import express from 'express';
import { getPriceTable } from '../controllers/price.controller.js';

const router = express.Router();

router.get('/', getPriceTable);

export default router;
