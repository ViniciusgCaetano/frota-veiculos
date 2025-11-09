import express from 'express';
import { 
  getAllVeiculos, 
  getVeiculo, 
  createVeiculo, 
  updateVeiculo, 
  deleteVeiculo,
  checkDisponibilidade 
} from '../controllers/veiculosController.js';

const router = express.Router();

// GET /api/v1/veiculos - Lista paginada com filtros
router.get('/', getAllVeiculos);

// POST /api/v1/veiculos - Criar novo veículo (gestor_frota|admin)
router.post('/', createVeiculo);

// GET /api/v1/veiculos/:id - Buscar veículo por ID
router.get('/:id', getVeiculo);

// PUT /api/v1/veiculos/:id - Atualizar veículo
router.put('/:id', updateVeiculo);

// DELETE /api/v1/veiculos/:id - Soft delete (muda status para inativo)
router.delete('/:id', deleteVeiculo);

// GET /api/v1/veiculos/:id/disponibilidade - Verificar disponibilidade
router.get('/:id/disponibilidade', checkDisponibilidade);

export default router;