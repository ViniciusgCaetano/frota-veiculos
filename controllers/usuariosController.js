import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import Auditoria from '../models/Auditoria.js';

const createUsuario = async (req, res) => {
  try {
    // Verificar perfil (apenas admin pode criar usuários)
    if (req.user.perfil !== 'admin') {
      return res.status(403).json({ erro: 'Apenas administradores podem criar usuários' });
    }

    const usuarioData = req.body;

    // Hash da senha
    if (usuarioData.dscSenhaUsuar) {
      const saltRounds = 12;
      usuarioData.dscSenhaUsuar = await bcrypt.hash(usuarioData.dscSenhaUsuar, saltRounds);
    }

    const novoUsuario = new Usuario(usuarioData);
    await novoUsuario.save();

    // Remover senha do retorno
    const usuarioRetorno = { ...novoUsuario.toObject() };
    delete usuarioRetorno.dscSenhaUsuar;

    // Auditoria
    await Auditoria.create({
      idUsuarAudit: req.user.userId,
      idEntidAudit: novoUsuario._id,
      dscTipoEntidAudit: 'Usuario',
      dscAcaoAudit: 'USUARIO_CRIADO',
      dscDetalAudit: `Usuário ${novoUsuario.nomUsuar} criado`
    });

    res.status(201).json(usuarioRetorno);
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    if (error.code === 11000) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const getAllUsuarios = async (req, res) => {
  try {
    const { page = 1, limit = 10, perfil, status } = req.query;

    const filter = {};
    if (perfil) filter.indPerfUsuar = perfil;
    if (status) filter.indStatUsuar = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { datCriUsuar: -1 },
      select: '-dscSenhaUsuar' // Não retornar senha
    };

    const usuarios = await Usuario.paginate(filter, options);

    res.json({
      usuarios: usuarios.docs,
      total: usuarios.totalDocs,
      page: usuarios.page,
      pages: usuarios.totalPages
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

export { createUsuario, getAllUsuarios };