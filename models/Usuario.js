import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
  // Dados básicos
  nomUsuar: { type: String, required: true },
  dscEmailUsuar: { 
    type: String, 
    required: true, 
    unique: true,  // REMOVER schema.index() duplicado
    index: true 
  },
  dscSenhaUsuar: { type: String, required: true },
  numTelUsuar: { type: String },
  dscCargoUsuar: { type: String },
  
  // Perfil e status
  indPerfUsuar: { 
    type: String, 
    enum: ['solicitante', 'supervisor', 'gestor_frota', 'admin'],
    default: 'solicitante'
  },
  indStatUsuar: { 
    type: String, 
    enum: ['ativo', 'inativo', 'bloqueado'],
    default: 'ativo'
  },
  
  // Hierarquia
  idSupervUsuar: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  
  // Auditoria
  datCriUsuar: { type: Date, default: Date.now },
  datAtualUsuar: { type: Date, default: Date.now }
}, { collection: 'Usuario' });

// MANTER APENAS ESTES INDEXES (remover duplicatas)
usuarioSchema.index({ indPerfUsuar: 1, indStatUsuar: 1 });

export default mongoose.model('Usuario', usuarioSchema, 'Usuario');