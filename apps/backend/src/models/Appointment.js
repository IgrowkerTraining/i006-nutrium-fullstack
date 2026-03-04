const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Appointment - Mapeado a la tabla `appointments` de PostgreSQL.
 *
 * Esquema esperado:
 *   id                BIGSERIAL PRIMARY KEY
 *   patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
 *   nutritionist_id   UUID NOT NULL REFERENCES users(id)
 *   date              TIMESTAMP NOT NULL
 *   notes             TEXT (opcional)
 *   status            VARCHAR(50) DEFAULT 'scheduled'
 *   review_rating     INT (nullable, 1-5)
 *   review_comment    TEXT (nullable)
 *   created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *   updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
 *
 * Relaciones:
 *   - belongsTo User (como patient)
 *   - belongsTo User (como nutritionist)
 *   - Definidas en models/index.js para evitar dependencias circulares
 */
class Appointment extends Model {}

Appointment.init(
  {
    // PRIMARY KEY: BIGINT autoincremental
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    // FOREIGN KEY: Usuario paciente
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // FOREIGN KEY: Usuario nutricionista
    nutritionist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // Fecha y hora de la cita (ISO format)
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    // Notas/comentarios del paciente sobre la cita
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Estado de la cita
    status: {
      type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
      defaultValue: 'scheduled',
      allowNull: false,
    },

    // Calificación de la reseña (1-5)
    review_rating: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [1], msg: 'La calificación debe ser entre 1 y 5' },
        max: { args: [5], msg: 'La calificación debe ser entre 1 y 5' },
      },
    },

    // Comentario/texto de la reseña
    review_comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Appointment',
    tableName: 'appointments',
    timestamps: true,
    underscored: true, // mapea createdAt → created_at, updatedAt → updated_at
  }
);

module.exports = Appointment;
