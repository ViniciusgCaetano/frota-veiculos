import express from 'express';
import { 
  getRelatorioUtilizacao, 
  getRelatorioCustos, 
  getRelatorioSLA 
} from '../controllers/relatoriosController.js';

const router = express.Router();

// GET /api/v1/relatorios/utilizacao - Relatório de utilização
router.get('/utilizacao', getRelatorioUtilizacao);

// GET /api/v1/relatorios/custos-eventos - Relatório de custos
router.get('/custos-eventos', getRelatorioCustos);

// GET /api/v1/relatorios/sla-aprovacao - Relatório de SLA
router.get('/sla-aprovacao', getRelatorioSLA);

export default router;