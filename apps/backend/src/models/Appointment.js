const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Modelo Appointment - Mapeado a la tabla `appointments` de PostgreSQL.
 *
 * Esquema esperado:
 *   id                BIGSERIAL PRIMARY KEY
 *   patient_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
 *   nutritionist_id   UUID NOT NULL REFERENCES users(id)
 *   appointment_date  DATE NOT NULL
 *   start_time        TIME NOT NULL
 *   end_time          TIME NOT NULL
 *   notes             TEXT (opcional)
 *   status            ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending'
 *   created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *   updated_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *
 * Relaciones:
 *   - belongsTo User (como patient)
 *   - belongsTo User (como nutritionist)
 *   - Definidas en models/index.js para evitar dependencias circulares
 */
class Appointment extends Model {}

Appointment.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    nutritionist_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("pending", "confirmed", "cancelled"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Appointment",
    tableName: "appointments",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Appointment;
