import mongoose from 'mongoose';

const devolucaoSchema = new mongoose.Schema({
  idResrvDevol: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reserva', 
    required: true,
    unique: true,  // REMOVER schema.index() duplicado
    index: true
  },
  qtdKmPercDevol: { type: Number, required: true, min: 0 },
  qtdCombFinDevol: { type: Number, min: 0 },
  
  // Checklist
  indLatariaDevol: { 
    type: String, 
    enum: ['ok', 'avaria'],
    required: true
  },
  indPneusDevol: { 
    type: String, 
    enum: ['ok', 'avaria'],
    required: true
  },
  indMotorDevol: { 
    type: String, 
    enum: ['ok', 'avaria'],
    required: true
  },
  
  dscObsDevol: { type: String },
  
  // Auditoria
  datCriDevol: { type: Date, default: Date.now },
  datAtualDevol: { type: Date, default: Date.now }
}, { collection: 'Devolucao' });

// MANTER APENAS ESTES INDEXES (remover duplicatas)
devolucaoSchema.index({ datCriDevol: -1 });

export default mongoose.model('Devolucao', devolucaoSchema, 'Devolucao');