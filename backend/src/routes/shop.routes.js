// GET /api/v1/shops: every shop with its number of prices and newest price date.
import express from 'express';
import { getShops } from '../controllers/shop.controller.js';

const router = express.Router();

router.get('/', getShops);

export default router;
