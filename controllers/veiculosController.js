import Veiculo from '../models/Veiculo.js';

const getAllVeiculos = async (req, res) => {
  try {
    const { 
      tipo, combustivel, portas_min, status, placa, fabricante, modelo,
      page = 1, limit = 10 
    } = req.query;

    // Construir filtro
    const filter = {};
    if (tipo) filter.idTipoVeic = tipo;
    if (combustivel) filter.idCombVeic = combustivel;
    if (portas_min) filter.qtdPortaVeic = { $gte: parseInt(portas_min) };
    if (status) filter.indStatVeic = status;
    if (placa) filter.numPlacaVeic = { $regex: placa, $options: 'i' };
    if (fabricante) filter.dscFabrcVeic = { $regex: fabricante, $options: 'i' };
    if (modelo) filter.dscModelVeic = { $regex: modelo, $options: 'i' };

    const veiculos = await Veiculo.find(filter)
      .sort({ datCriVeic: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Veiculo.countDocuments(filter);

    res.json({
      veiculos,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });

  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const getVeiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const veiculo = await Veiculo.findById(id);
    
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.json(veiculo);
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const createVeiculo = async (req, res) => {
  try {
    // Verificar se req.body existe
    const veiculoData = req.body;
    
    console.log('📦 Dados recebidos:', veiculoData); // DEBUG
    
    if (!veiculoData) {
      return res.status(400).json({ erro: 'Dados do veículo não fornecidos' });
    }

    //  Verificar se campos obrigatórios existem
    if (!veiculoData.numPlacaVeic) {
      return res.status(400).json({ erro: 'Placa do veículo é obrigatória' });
    }

    // Validar placa única
    const placaExistente = await Veiculo.findOne({ 
      numPlacaVeic: veiculoData.numPlacaVeic 
    });
    
    if (placaExistente) {
      return res.status(400).json({ erro: 'Placa já cadastrada' });
    }

    // Validar regex da placa (se necessário)
    const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
    if (veiculoData.numPlacaVeic && !placaRegex.test(veiculoData.numPlacaVeic)) {
      return res.status(400).json({ erro: 'Formato de placa inválido. Use: ABC1D23' });
    }

    const novoVeiculo = new Veiculo(veiculoData);
    await novoVeiculo.save();

    console.log('✅ Veículo criado:', novoVeiculo._id); // DEBUG

    res.status(201).json(novoVeiculo);
    
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        erro: 'Erro de validação',
        detalhes: errors 
      });
    }
    
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const updateVeiculo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const veiculo = await Veiculo.findById(id);
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    Object.assign(veiculo, updateData);
    veiculo.datAtualVeic = new Date();
    await veiculo.save();

    res.json(veiculo);
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ erro: error.message });
    }
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const deleteVeiculo = async (req, res) => {
  try {
    const { id } = req.params;

    const veiculo = await Veiculo.findById(id);
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    // Soft delete
    veiculo.indStatVeic = 'inativo';
    veiculo.datAtualVeic = new Date();
    await veiculo.save();

    res.json({ mensagem: 'Veículo inativado com sucesso' });
  } catch (error) {
    console.error('Erro ao inativar veículo:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

const checkDisponibilidade = async (req, res) => {
  try {
    const { id } = req.params;
    const { ini, fim } = req.query;

    if (!ini || !fim) {
      return res.status(400).json({ erro: 'Datas de início e fim são obrigatórias' });
    }

    const veiculo = await Veiculo.findById(id);
    if (!veiculo) {
      return res.status(404).json({ erro: 'Veículo não encontrado' });
    }

    res.json({
      disponivel: true,
      conflitos: []
    });

  } catch (error) {
    console.error('Erro ao verificar disponibilidade:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

export { 
  getAllVeiculos, 
  getVeiculo, 
  createVeiculo, 
  updateVeiculo, 
  deleteVeiculo, 
  checkDisponibilidade 
};