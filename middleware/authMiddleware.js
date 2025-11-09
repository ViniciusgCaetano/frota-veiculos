import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_aqui');
    
    // Buscar usuário para verificar se ainda está ativo
    const usuario = await Usuario.findById(decoded.userId);
    if (!usuario || usuario.indStatUsuar !== 'ativo') {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });
    }
    
    req.user = {
      userId: decoded.userId,
      perfil: decoded.perfil,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    }
    
    res.status(401).json({ erro: 'Falha na autenticação' });
  }
};

export default authMiddleware;