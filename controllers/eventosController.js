import Evento from '../models/Evento.js';
import Auditoria from '../models/Auditoria.js';

const getAllEventos = async (req, res) => {
  try {
    const { veiculo_id, tipo, periodo_ini, periodo_fim, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (veiculo_id) filter.idVeicEvent = veiculo_id;
    if (tipo) filter.idTipoEvent = tipo;

    // 🔥 CORREÇÃO: Usar find() em vez de paginate()
    const eventos = await Evento.find(filter)
      .populate('idVeicEvent', 'dscFabrcVeic dscModelVeic numPlacaVeic')
      .sort({ datEvent: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Evento.countDocuments(filter);

    res.json({
      eventos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Erro ao buscar eventos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const createEvento = async (req, res) => {
    try {
        // Verificar perfil (gestor_frota ou admin)
        if (!['gestor_frota', 'admin'].includes(req.user.perfil)) {
            return res.status(403).json({ erro: 'Permissão negada' });
        }

        const eventoData = req.body;

        // Validações: indTipoEvent nos enums; valEvent ≥ 0
        if (eventoData.valEvent && eventoData.valEvent < 0) {
            return res.status(400).json({ erro: 'Valor do evento não pode ser negativo' });
        }

        const novoEvento = new Evento(eventoData);
        await novoEvento.save();

        await novoEvento.populate('idVeicEvent', 'dscFabrcVeic dscModelVeic numPlacaVeic');

        // Auditoria
        await Auditoria.create({
            idUsuarAudit: req.user.userId,
            idEntidAudit: novoEvento._id,
            dscTipoEntidAudit: 'Evento',
            dscAcaoAudit: 'EVENTO_REGISTRADO',
            dscDetalAudit: `Evento ${novoEvento.idTipoEvent} registrado para veículo`
        });

        res.status(201).json(novoEvento);
    } catch (error) {
        console.error('Erro ao criar evento:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ erro: error.message });
        }
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { getAllEventos, createEvento };