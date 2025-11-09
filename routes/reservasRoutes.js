import express from 'express';
import { 
  getAllReservas, 
  createReserva, 
  processDecisao, 
  cancelReserva 
} from '../controllers/reservasController.js';

const router = express.Router();

// GET /api/v1/reservas - Listar reservas com filtros
router.get('/', getAllReservas);

// POST /api/v1/reservas - Criar reserva (solicitante autenticado)
router.post('/', createReserva);

// POST /api/v1/reservas/:id/decisao - Aprovar/rejeitar reserva (supervisor)
router.post('/:id/decisao', processDecisao);

// POST /api/v1/reservas/:id/cancelar - Cancelar reserva
router.post('/:id/cancelar', cancelReserva);

export default router;