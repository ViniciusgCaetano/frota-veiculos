import express from 'express';
import { createDocumento } from '../controllers/documentosController.js';

const router = express.Router();

// POST /api/v1/veiculos/:id/documentos - Adicionar documento ao veículo
router.post('/:id/documentos', createDocumento);

export default router;