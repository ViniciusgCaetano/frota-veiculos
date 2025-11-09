import mongoose from 'mongoose';

const alocacaoSchema = new mongoose.Schema({
  idUsuarAloc: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  idVeicAloc: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Veiculo', 
    required: true 
  },
  datInicAloc: { type: Date, required: true },
  datFimAloc: { type: Date },
  indVigenAloc: { type: Boolean, default: true },
  
  // Auditoria
  datCriAloc: { type: Date, default: Date.now },
  datAtualAloc: { type: Date, default: Date.now }
}, { collection: 'Alocacao' });

// ESTES INDEXES ESTÃO CORRETOS (não usam unique + index no campo)
alocacaoSchema.index({ idUsuarAloc: 1, indVigenAloc: 1 }, { 
  unique: true, 
  partialFilterExpression: { indVigenAloc: true } 
});

alocacaoSchema.index({ idVeicAloc: 1, indVigenAloc: 1 }, { 
  unique: true, 
  partialFilterExpression: { indVigenAloc: true } 
});

alocacaoSchema.index({ indVigenAloc: 1, datFimAloc: 1 });

export default mongoose.model('Alocacao', alocacaoSchema, 'Alocacao');