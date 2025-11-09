import Reserva from '../models/Reserva.js';

const getAllReservas = async (req, res) => {
  try {
    const { 
      status, solicitante_id, supervisor_id, periodo_ini, periodo_fim, veiculo_id,
      page = 1, limit = 10 
    } = req.query;

    const filter = {};
    if (status) filter.indStatResrv = status;
    if (solicitante_id) filter.idSolicResrv = solicitante_id;
    if (supervisor_id) filter.idSuperResrv = supervisor_id;
    if (veiculo_id) filter.idVeicResrv = veiculo_id;

    // 🔥 CORREÇÃO: Usar find() em vez de paginate()
    const reservas = await Reserva.find(filter)
      .populate('idSolicResrv', 'nomUsuar dscEmailUsuar')
      .populate('idSuperResrv', 'nomUsuar dscEmailUsuar')
      .populate('idAprovResrv', 'nomUsuar dscEmailUsuar')
      .populate('idVeicResrv', 'dscFabrcVeic dscModelVeic numPlacaVeic')
      .sort({ datCriResrv: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reserva.countDocuments(filter);

    res.json({
      reservas,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
  } catch (error) {
    console.error('Erro ao buscar reservas:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const createReserva = async (req, res) => {
  try {
    const reservaData = req.body;
    const usuarioId = req.user.userId;

    // Validações básicas
    if (new Date(reservaData.datFimResrv) <= new Date(reservaData.datInicResrv)) {
      return res.status(400).json({ erro: 'Data fim deve ser posterior à data início' });
    }

    reservaData.indStatResrv = 'pendente_aprovacao';
    reservaData.idSolicResrv = usuarioId;

    const novaReserva = new Reserva(reservaData);
    await novaReserva.save();

    // Popular para retorno
    await novaReserva.populate([
      { path: 'idSolicResrv', select: 'nomUsuar dscEmailUsuar' },
      { path: 'idSuperResrv', select: 'nomUsuar dscEmailUsuar' },
      { path: 'idVeicResrv', select: 'dscFabrcVeic dscModelVeic numPlacaVeic' }
    ]);

    res.status(201).json(novaReserva);
  } catch (error) {
    console.error('Erro ao criar reserva:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const processDecisao = async (req, res) => {
  try {
    const { id } = req.params;
    const { acao, motivo } = req.body;

    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ erro: 'Reserva não encontrada' });
    }

    if (acao === 'aprovar') {
      reserva.indStatResrv = 'aprovada';
      reserva.idAprovResrv = req.user.userId;
      reserva.datAprovResrv = new Date();
    } else if (acao === 'rejeitar') {
      if (!motivo) {
        return res.status(400).json({ erro: 'Motivo é obrigatório para rejeição' });
      }
      reserva.indStatResrv = 'rejeitada';
      reserva.dscMotivRejeResrv = motivo;
    } else {
      return res.status(400).json({ erro: 'Ação deve ser "aprovar" ou "rejeitar"' });
    }

    reserva.datAtualResrv = new Date();
    await reserva.save();

    res.json(reserva);
  } catch (error) {
    console.error('Erro ao processar decisão:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const cancelReserva = async (req, res) => {
  try {
    const { id } = req.params;

    const reserva = await Reserva.findById(id);
    if (!reserva) {
      return res.status(404).json({ erro: 'Reserva não encontrada' });
    }

    reserva.indStatResrv = 'cancelada';
    reserva.datAtualResrv = new Date();
    await reserva.save();

    res.json({ mensagem: 'Reserva cancelada com sucesso' });
  } catch (error) {
    console.error('Erro ao cancelar reserva:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

export { getAllReservas, createReserva, processDecisao, cancelReserva };