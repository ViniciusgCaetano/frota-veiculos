import express from 'express';
import { 
  getAllEventos, 
  createEvento 
} from '../controllers/eventosController.js';

const router = express.Router();

// GET /api/v1/eventos - Listar eventos com filtros
router.get('/', getAllEventos);

// POST /api/v1/eventos - Criar evento (gestor_frota|admin)
router.post('/', createEvento);

export default router;