import Alocacao from '../models/Alocacao.js';
import Auditoria from '../models/Auditoria.js';

const getAllBeneficios = async (req, res) => {
    try {
        const { usuario_id, vigente } = req.query;

        const filter = {};
        if (usuario_id) filter.idUsuarAloc = usuario_id;
        if (vigente === 'true') filter.indVigenAloc = true;

        const beneficios = await Alocacao.find(filter)
            .populate('idUsuarAloc', 'nomUsuar dscEmailUsuar indPerfUsuar')
            .populate('idVeicAloc', 'dscFabrcVeic dscModelVeic numPlacaVeic indStatVeic')
            .sort({ datInicAloc: -1 });

        res.json(beneficios);
    } catch (error) {
        console.error('Erro ao buscar benefícios:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

const createBeneficio = async (req, res) => {
    try {
        // Verificar perfil (gestor_frota ou admin)
        if (!['gestor_frota', 'admin'].includes(req.user.perfil)) {
            return res.status(403).json({ erro: 'Permissão negada' });
        }

        const beneficioData = req.body;

        // Validação: apenas 1 benefício vigente por usuário
        if (beneficioData.indVigenAloc !== false) {
            const beneficioVigente = await Alocacao.findOne({
                idUsuarAloc: beneficioData.idUsuarAloc,
                indVigenAloc: true
            });
            if (beneficioVigente) {
                return res.status(400).json({ erro: 'Usuário já possui um benefício vigente' });
            }
        }

        // Validação: apenas 1 benefício vigente por veículo
        if (beneficioData.indVigenAloc !== false) {
            const veiculoAlocado = await Alocacao.findOne({
                idVeicAloc: beneficioData.idVeicAloc,
                indVigenAloc: true
            });
            if (veiculoAlocado) {
                return res.status(400).json({ erro: 'Veículo já alocado para outro usuário' });
            }
        }

        // Validação: datFimAloc >= datInicAloc
        if (beneficioData.datFimAloc && beneficioData.datInicAloc) {
            if (new Date(beneficioData.datFimAloc) < new Date(beneficioData.datInicAloc)) {
                return res.status(400).json({ erro: 'Data fim não pode ser anterior à data início' });
            }
        }

        const novoBeneficio = new Alocacao(beneficioData);
        await novoBeneficio.save();

        // Popular referências para retorno
        await novoBeneficio.populate('idUsuarAloc', 'nomUsuar dscEmailUsuar');
        await novoBeneficio.populate('idVeicAloc', 'dscFabrcVeic dscModelVeic numPlacaVeic');

        // Auditoria
        await Auditoria.create({
            idUsuarAudit: req.user.userId,
            idEntidAudit: novoBeneficio._id,
            dscTipoEntidAudit: 'Alocacao',
            dscAcaoAudit: 'ALOCACAO_CRIADA',
            dscDetalAudit: `Benefício criado para usuário ${novoBeneficio.idUsuarAloc.nomUsuar}`
        });

        res.status(201).json(novoBeneficio);
    } catch (error) {
        console.error('Erro ao criar benefício:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

const updateBeneficio = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const beneficio = await Alocacao.findById(id);
        if (!beneficio) {
            return res.status(404).json({ erro: 'Benefício não encontrado' });
        }

        // Se estiver encerrando a vigência
        if (updateData.indVigenAloc === false) {
            updateData.datFimAloc = new Date();
            updateData.indVigenAloc = false;
        }

        Object.assign(beneficio, updateData);
        beneficio.datAtualAloc = new Date();
        await beneficio.save();

        // Popular para retorno
        await beneficio.populate('idUsuarAloc', 'nomUsuar dscEmailUsuar');
        await beneficio.populate('idVeicAloc', 'dscFabrcVeic dscModelVeic numPlacaVeic');

        // Auditoria
        await Auditoria.create({
            idUsuarAudit: req.user.userId,
            idEntidAudit: beneficio._id,
            dscTipoEntidAudit: 'Alocacao',
            dscAcaoAudit: 'ALOCACAO_ATUALIZADA',
            dscDetalAudit: `Benefício atualizado para usuário ${beneficio.idUsuarAloc.nomUsuar}`
        });

        res.json(beneficio);
    } catch (error) {
        console.error('Erro ao atualizar benefício:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { getAllBeneficios, createBeneficio, updateBeneficio };