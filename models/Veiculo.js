import mongoose from 'mongoose';

const documentoSubschema = new mongoose.Schema({
  indTipoDoc: { 
    type: String, 
    required: true,
    enum: ['CRLV', 'Seguro', 'Manual', 'Laudo', 'Outro']
  },
  dscUrlDoc: { type: String },
  dscArqDoc: { type: String },
  datValDoc: { type: Date }
}, { _id: true });

const estadoSubschema = new mongoose.Schema({
  numHodoVeic: { type: Number, min: 0 },
  dscObsVeic: { type: String }
});

const restricaoSubschema = new mongoose.Schema({
  numRodizVeic: { type: Number, min: 1, max: 7 }
});

const veiculoSchema = new mongoose.Schema({
  // Identificação básica
  idTipoVeic: { 
    type: String, 
    required: true,
    enum: ['carro', 'moto', 'van', 'triciclo', 'trator', 'barco', 'aviao_pequeno']
  },
  dscFabrcVeic: { type: String, required: true },
  dscModelVeic: { type: String, required: true },
  numAnoModVeic: { type: Number, min: 1900 },
  dscCorVeic: { type: String },
  
  // Características técnicas
  numPlacaVeic: { 
    type: String, 
    required: true, 
    unique: true,  // REMOVER schema.index() duplicado
    index: true
  },
  idCombVeic: { 
    type: String, 
    required: true,
    enum: ['gasolina', 'etanol', 'diesel', 'flex', 'eletrico', 'hibrido', 'gnv', 'outro']
  },
  qtdPortaVeic: { type: Number, min: 0 },
  dscOpcVeic: [{ type: String }],
  
  // Status e classificação
  indStatVeic: { 
    type: String, 
    required: true,
    enum: ['ativo', 'inativo', 'manutencao', 'sinistrado', 'vendido'],
    default: 'ativo'
  },
  indHabilVeic: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D', 'E', null],
    default: null
  },
  
  // Estado atual e restrições
  dscEstadVeic: estadoSubschema,
  dscRestrVeic: restricaoSubschema,
  
  // Documentos
  Documento: [documentoSubschema],
  
  // Auditoria
  datCriVeic: { type: Date, default: Date.now },
  datAtualVeic: { type: Date, default: Date.now }
}, { collection: 'Veiculo' });

// MANTER APENAS ESTES INDEXES (remover duplicatas)
veiculoSchema.index({ indStatVeic: 1, datCriVeic: -1 });
veiculoSchema.index({ idTipoVeic: 1, indStatVeic: 1 });

export default mongoose.model('Veiculo', veiculoSchema, 'Veiculo');