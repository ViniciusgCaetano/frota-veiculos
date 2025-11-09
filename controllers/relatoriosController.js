import Reserva from '../models/Reserva.js';
import Evento from '../models/Evento.js';

const getRelatorioUtilizacao = async (req, res) => {
    try {
        const { ano_mes } = req.query; // Formato YYYY-MM

        if (!ano_mes) {
            return res.status(400).json({ erro: 'Parâmetro ano_mes é obrigatório (YYYY-MM)' });
        }

        const [ano, mes] = ano_mes.split('-').map(Number);
        const inicioMes = new Date(ano, mes - 1, 1);
        const fimMes = new Date(ano, mes, 0, 23, 59, 59, 999);

        // Agrupar por veículo e somar dias de uso
        const utilizacao = await Reserva.aggregate([
            {
                $match: {
                    indStatResrv: 'concluida',
                    datInicResrv: { $gte: inicioMes, $lte: fimMes }
                }
            },
            {
                $group: {
                    _id: '$idVeicResrv',
                    totalDias: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$datFimResrv', '$datInicResrv'] },
                                1000 * 60 * 60 * 24 // Converter ms para dias
                            ]
                        }
                    },
                    totalHoras: {
                        $sum: {
                            $divide: [
                                { $subtract: ['$datFimResrv', '$datInicResrv'] },
                                1000 * 60 * 60 // Converter ms para horas
                            ]
                        }
                    },
                    countReservas: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'veiculos',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'veiculo'
                }
            },
            {
                $unwind: '$veiculo'
            },
            {
                $project: {
                    veiculo: '$veiculo.dscFabrcVeic',
                    modelo: '$veiculo.dscModelVeic',
                    placa: '$veiculo.numPlacaVeic',
                    totalDias: { $round: ['$totalDias', 2] },
                    totalHoras: { $round: ['$totalHoras', 2] },
                    countReservas: 1
                }
            }
        ]);

        res.json(utilizacao);
    } catch (error) {
        console.error('Erro ao gerar relatório de utilização:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

const getRelatorioCustos = async (req, res) => {
    try {
        const { ini, fim } = req.query;

        if (!ini || !fim) {
            return res.status(400).json({ erro: 'Parâmetros ini e fim são obrigatórios' });
        }

        const dataIni = new Date(ini);
        const dataFim = new Date(fim);

        const custos = await Evento.aggregate([
            {
                $match: {
                    datEvent: { $gte: dataIni, $lte: dataFim },
                    valEvent: { $gt: 0 }
                }
            },
            {
                $group: {
                    _id: { tipo: '$idTipoEvent', veiculo: '$idVeicEvent' },
                    totalValor: { $sum: '$valEvent' },
                    countEventos: { $sum: 1 },
                    mediaValor: { $avg: '$valEvent' },
                    medianaValor: {
                        $push: '$valEvent'
                    }
                }
            },
            {
                $lookup: {
                    from: 'veiculos',
                    localField: '_id.veiculo',
                    foreignField: '_id',
                    as: 'veiculo'
                }
            },
            {
                $unwind: '$veiculo'
            },
            {
                $project: {
                    tipo: '$_id.tipo',
                    veiculo: '$veiculo.dscFabrcVeic',
                    modelo: '$veiculo.dscModelVeic',
                    placa: '$veiculo.numPlacaVeic',
                    totalValor: 1,
                    countEventos: 1,
                    mediaValor: { $round: ['$mediaValor', 2] }
                    // Nota: Para calcular mediana precisaria de etapa adicional
                }
            },
            {
                $sort: { totalValor: -1 }
            }
        ]);

        res.json(custos);
    } catch (error) {
        console.error('Erro ao gerar relatório de custos:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

const getRelatorioSLA = async (req, res) => {
    try {
        const { ini, fim } = req.query;

        if (!ini || !fim) {
            return res.status(400).json({ erro: 'Parâmetros ini e fim são obrigatórios' });
        }

        const dataIni = new Date(ini);
        const dataFim = new Date(fim);

        const sla = await Reserva.aggregate([
            {
                $match: {
                    datCriResrv: { $gte: dataIni, $lte: dataFim },
                    indStatResrv: { $in: ['aprovada', 'rejeitada'] },
                    datAprovResrv: { $exists: true }
                }
            },
            {
                $project: {
                    tempoAprovacao: {
                        $divide: [
                            { $subtract: ['$datAprovResrv', '$datCriResrv'] },
                            1000 * 60 * 60 // Horas
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    tempoMedio: { $avg: '$tempoAprovacao' },
                    tempoMinimo: { $min: '$tempoAprovacao' },
                    tempoMaximo: { $max: '$tempoAprovacao' },
                    totalReservas: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    tempoMedioHoras: { $round: ['$tempoMedio', 2] },
                    tempoMinimoHoras: { $round: ['$tempoMinimo', 2] },
                    tempoMaximoHoras: { $round: ['$tempoMaximo', 2] },
                    totalReservas: 1
                }
            }
        ]);

        res.json(sla.length > 0 ? sla[0] : {});
    } catch (error) {
        console.error('Erro ao gerar relatório de SLA:', error);
        res.status(500).json({ erro: 'Erro interno do servidor' });
    }
};

export { getRelatorioUtilizacao, getRelatorioCustos, getRelatorioSLA };