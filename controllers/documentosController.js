import Veiculo from '../models/Veiculo.js';
import Auditoria from '../models/Auditoria.js';

const createDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        const documentoData = req.body;

        // Validações
        if (!documentoData.indTipoDoc) {
            return res.status(400).json({ erro: 'Tipo de documento é obrigatório' });
        }

        if (!['CRLV', 'Seguro', 'Manual', 'Laudo', 'Outro'].includes(documentoData.indTipoDoc)) {
            return res.status(400).json({ erro: 'Tipo de documento inválido' });
        }

        if (!documentoData.dscUrlDoc && !documentoData.dscArqDoc) {
            return res.status(400).json({ erro: 'URL ou arquivo é obrigatório' });
        }

        const veiculo = await Veiculo.findById(id);
        if (!veiculo) {
            return res.status(404).json({ erro: 'Veículo não encontrado' });
        }

        // Adicionar documento ao array
        veiculo.Documento.push(documentoData);
        veiculo.datAtualVeic = new Date();
        await veiculo.save();

        // Auditoria
        await Auditoria.create({
            idUsuarAudit: req.user.userId,
            idEntidAudit: veiculo._id,
            dscTipoEntidAudit: 'Veiculo',
            dscAcaoAudit: 'DOCUMENTO_ADICIONADO',
            dscDetalAudit: `Documento ${documentoData.indTipoDoc} adicionado ao veículo`
        });

        res.status(201).json(veiculo);
    } catch (error) {
        console.error('Erro ao adicionar documento:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { createDocumento };