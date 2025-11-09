import mongoose from 'mongoose';

const auditoriaSchema = new mongoose.Schema({
  idUsuarAudit: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  idEntidAudit: { type: mongoose.Schema.Types.ObjectId, required: true },
  dscTipoEntidAudit: { 
    type: String, 
    required: true,
    enum: ['Reserva', 'Veiculo', 'Alocacao', 'Evento', 'Devolucao', 'Usuario']
  },
  dscAcaoAudit: { 
    type: String, 
    required: true,
    enum: [
      'RESERVA_ABERTA', 'RESERVA_APROVADA', 'RESERVA_REJEITADA', 
      'RESERVA_CANCELADA', 'RESERVA_CONCLUIDA', 'VEICULO_CRIADO',
      'VEICULO_ATUALIZADO', 'VEICULO_INATIVADO', 'ALOCACAO_CRIADA',
      'ALOCACAO_ENCERRADA', 'EVENTO_REGISTRADO', 'DEVOLUCAO_REGISTRADA'
    ]
  },
  dscDetalAudit: { type: String },
  datCriAudit: { type: Date, default: Date.now }
}, { collection: 'Auditoria' });

// Indexes
auditoriaSchema.index({ dscTipoEntidAudit: 1, idEntidAudit: 1 });
auditoriaSchema.index({ datCriAudit: -1 });
auditoriaSchema.index({ idUsuarAudit: 1, datCriAudit: -1 });

export default mongoose.model('Auditoria', auditoriaSchema, 'Auditoria');