import mongoose from 'mongoose';

const enderecoSubschema = new mongoose.Schema({
  dscTipoLogr: { type: String },
  dscNomLogr: { type: String },
  numEnd: { type: String },
  dscCompl: { type: String },
  dscBairro: { type: String },
  numCEP: { type: String },
  dscCidad: { type: String },
  dscEstad: { type: String }
});

const reservaSchema = new mongoose.Schema({
  // Tipo e solicitante
  idTipoUsoResrv: { 
    type: String, 
    required: true,
    enum: ['ocasional'],
    default: 'ocasional'
  },
  idSolicResrv: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  
  // Veículo e período
  idVeicResrv: { type: mongoose.Schema.Types.ObjectId, ref: 'Veiculo' },
  datInicResrv: { type: Date, required: true },
  datFimResrv: { type: Date, required: true },
  
  // Locais
  enderDestResrv: enderecoSubschema,
  enderEstacResrv: enderecoSubschema,
  
  // Estimativas
  numKmEstimResrv: { type: Number, min: 0 },
  qtdCombEstimResrv: { type: Number, min: 0 },
  
  // Finalidade e preferências
  dscFinalResrv: { type: String, required: true },
  dscPrefModelResrv: { type: String },
  dscItensOpcResrv: [{ type: String }],
  
  // Aprovação
  idSuperResrv: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  idAprovResrv: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  indStatResrv: { 
    type: String, 
    enum: [
      'aberta', 'pendente_aprovacao', 'aprovada', 'rejeitada', 
      'concluida', 'cancelada'
    ],
    default: 'pendente_aprovacao'
  },
  indPriorResrv: { type: Boolean, default: false },
  dscMotivRejeResrv: { type: String },
  
  // Auditoria
  datCriResrv: { type: Date, default: Date.now },
  datAtualResrv: { type: Date, default: Date.now },
  datAprovResrv: { type: Date }
}, { collection: 'Reserva' });

// Indexes
reservaSchema.index({ idVeicResrv: 1, datInicResrv: 1, datFimResrv: 1 });
reservaSchema.index({ indStatResrv: 1, idSuperResrv: 1 });
reservaSchema.index({ idSolicResrv: 1, datCriResrv: -1 });
reservaSchema.index({ indStatResrv: 1, datInicResrv: 1 });

export default mongoose.model('Reserva', reservaSchema, 'Reserva');