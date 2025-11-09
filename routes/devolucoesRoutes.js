import express from 'express';
import { createDevolucao } from '../controllers/devolucoesController.js';

const router = express.Router();

// POST /api/v1/devolucoes - Registrar devolução
router.post('/', createDevolucao);

export default router;