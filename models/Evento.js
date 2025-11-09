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

const comprovanteSubschema = new mongoose.Schema({
  dscTipoCmprv: { type: String },
  dscUrlCmprv: { type: String },
  dscArqCmprv: { type: String },
  valCmprv: { type: Number, min: 0 }
});

const eventoSchema = new mongoose.Schema({
  idVeicEvent: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Veiculo', 
    required: true 
  },
  idTipoEvent: { 
    type: String, 
    required: true,
    enum: [
      'manutencao', 'lavagem', 'troca_oleo', 'pneus', 'conserto', 
      'batida', 'guincho', 'roubo', 'apreensao', 'inspecao', 
      'lacracao', 'licenciamento', 'outro'
    ]
  },
  dscRespEvent: { type: String },
  datEvent: { type: Date, required: true },
  enderLocalEvent: enderecoSubschema,
  dscCmprvEvent: comprovanteSubschema,
  valEvent: { type: Number, min: 0 },
  dscDetalEvent: { type: String },
  
  // Auditoria
  datCriEvent: { type: Date, default: Date.now },
  datAtualEvent: { type: Date, default: Date.now }
}, { collection: 'Evento' });

// Indexes
eventoSchema.index({ idVeicEvent: 1, datEvent: -1 });
eventoSchema.index({ idTipoEvent: 1, datEvent: -1 });
eventoSchema.index({ datEvent: 1 });

export default mongoose.model('Evento', eventoSchema, 'Evento');