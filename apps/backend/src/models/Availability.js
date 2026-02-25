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

// day_of_week: 0=Domingo, 1=Lunes, ..., 6=Sábado
const DAY_MIN = 0;
const DAY_MAX = 6;

Availability.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    // FK al perfil del nutricionista
    nutritionist_profile_id: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },

    // Día de la semana: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles,
    //                   4=Jueves, 5=Viernes, 6=Sábado
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [DAY_MIN], msg: 'day_of_week debe ser >= 0 (Domingo)' },
        max: { args: [DAY_MAX], msg: 'day_of_week debe ser <= 6 (Sábado)' },
        isInt: { msg: 'day_of_week debe ser un número entero' },
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
