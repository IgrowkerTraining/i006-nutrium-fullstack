const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Availability
 * Mapea la tabla `availabilities`.
 *
 * Cada fila representa UNA franja horaria de un nutricionista.
 * Para armar la agenda completa se envía/persiste un array de franjas.
 *
 * Relación: belongsTo NutritionistProfile (N:1)
 */
class Availability extends Model {}

const VALID_DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

Availability.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // FK al perfil del nutricionista
    nutritionist_profile_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    // Día de la semana en español
    day_of_week: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        isIn: {
          args: [VALID_DAYS],
          msg: `day_of_week debe ser uno de: ${VALID_DAYS.join(', ')}`,
        },
      },
    },

    // Hora de inicio en formato 'HH:MM'
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    // Hora de fin en formato 'HH:MM'
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'Availability',
    tableName: 'availabilities',
    timestamps: true,
    underscored: true,
    updatedAt: false,
  }
);

module.exports = Availability;
