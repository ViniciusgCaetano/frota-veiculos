import express from 'express';
import { 
  getAllBeneficios, 
  createBeneficio, 
  updateBeneficio 
} from '../controllers/beneficiosController.js';

const router = express.Router();

// GET /api/v1/beneficios - Listar benefícios com filtros
router.get('/', getAllBeneficios);

// POST /api/v1/beneficios - Criar benefício (gestor_frota|admin)
router.post('/', createBeneficio);

// PUT /api/v1/beneficios/:id - Atualizar/encerrar benefício
router.put('/:id', updateBeneficio);

export default router;