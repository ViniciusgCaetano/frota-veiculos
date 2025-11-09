import Devolucao from '../models/Devolucao.js';
import Reserva from '../models/Reserva.js';
import Auditoria from '../models/Auditoria.js';

const createDevolucao = async (req, res) => {
    try {
        const devolucaoData = req.body;

        // Validações: Reserva deve estar aprovada e sem devolução registrada
        const reserva = await Reserva.findById(devolucaoData.idResrvDevol);
        if (!reserva) {
            return res.status(404).json({ erro: 'Reserva não encontrada' });
        }

        if (reserva.indStatResrv !== 'aprovada') {
            return res.status(400).json({ erro: 'Reserva não está aprovada' });
        }

        const devolucaoExistente = await Devolucao.findOne({
            idResrvDevol: devolucaoData.idResrvDevol
        });
        if (devolucaoExistente) {
            return res.status(400).json({ erro: 'Devolução já registrada para esta reserva' });
        }

        // Validar checklist
        const checklistCampos = ['indLatariaDevol', 'indPneusDevol', 'indMotorDevol'];
        for (let campo of checklistCampos) {
            if (!devolucaoData[campo]) {
                return res.status(400).json({ erro: `Checklist incompleto: ${campo} é obrigatório` });
            }
            if (!['ok', 'avaria'].includes(devolucaoData[campo])) {
                return res.status(400).json({ erro: `Valor inválido para ${campo}` });
            }
        }

        const novaDevolucao = new Devolucao(devolucaoData);
        await novaDevolucao.save();

        // Atualizar status da reserva para concluída
        reserva.indStatResrv = 'concluida';
        reserva.datAtualResrv = new Date();
        await reserva.save();

        // Auditoria
        await Auditoria.create({
            idUsuarAudit: req.user.userId,
            idEntidAudit: reserva._id,
            dscTipoEntidAudit: 'Reserva',
            dscAcaoAudit: 'RESERVA_CONCLUIDA',
            dscDetalAudit: `Devolução registrada para reserva ${reserva._id}`
        });

        res.status(201).json(novaDevolucao);
    } catch (error) {
        console.error('Erro ao registrar devolução:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { createDevolucao };