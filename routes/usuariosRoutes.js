import express from 'express';
import { createUsuario, getAllUsuarios } from '../controllers/usuariosController.js';

const router = express.Router();

// GET /api/v1/usuarios - Listar usuários (apenas admin)
router.get('/', getAllUsuarios);

// POST /api/v1/usuarios - Criar usuário (apenas admin)
router.post('/', createUsuario);

export default router;