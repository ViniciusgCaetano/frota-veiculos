import Usuario from '../models/Usuario.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const login = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // Validações básicas
        if (!email || !senha) {
            return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
        }

        // Buscar usuário
        const usuario = await Usuario.findOne({ dscEmailUsuar: email });
        if (!usuario) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        // Verificar se usuário está ativo
        if (usuario.indStatUsuar !== 'ativo') {
            return res.status(401).json({ erro: 'Usuário inativo' });
        }

        // COMPARAÇÃO DIRETA - SEM HASH
        if (usuario.dscSenhaUsuar !== senha) {
            return res.status(401).json({ erro: 'Credenciais inválidas' });
        }

        // Gerar token JWT
        const token = jwt.sign(
            {
                userId: usuario._id,
                perfil: usuario.indPerfUsuar,
                email: usuario.dscEmailUsuar
            },
            process.env.JWT_SECRET || 'seu_segredo_aqui',
            { expiresIn: '8h' }
        );

        res.json({
            access_token: token,
            token_type: 'Bearer',
            expires_in: 28800, // 8 horas em segundos
            perfil: usuario.indPerfUsuar
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { login };