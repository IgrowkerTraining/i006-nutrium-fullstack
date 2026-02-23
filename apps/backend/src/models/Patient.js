const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo Patient - Define la estructura de la tabla patients en PostgreSQL
 * 
 * Relacionado con la tabla users (relación 1:1)
 * Almacena información de perfil y salud del paciente
 */
class Patient extends Model {
  /**
   * Retorna objeto Patient sin campos sensibles
   * @returns {Object} Paciente sin datos sensibles
   */
  toJSON() {
    return this.dataValues;
  }
}

// Opciones de enumeradores permitidos
const MODALITIES = ['Virtual', 'Presencial', 'Mixto'];

const AVAILABILITY = ['Mañana', 'Tarde'];

const OBJECTIVES = [
  'Pérdida de peso',
  'Ganancia de masa muscular',
  'Reeducación alimentaria',
  'Mejorar salud digestiva',
  'Mejorar composición corporal',
  'Aumentar energía',
  'Mejorar rendimiento deportivo',
  'Organización de hábitos alimentarios',
  'Alimentación para condición digestiva específica',
  'Prevención y bienestar general',
];

const HEALTH_CONDITIONS = [
  'SIBO',
  'Disbiosis intestinal',
  'Síndrome de intestino irritable (SII / IBS)',
  'Intolerancia a la lactosa',
  'Intolerancia al gluten',
  'Sobrecrecimiento bacteriano colónico',
  'Sobrecrecimiento de levaduras (Candida)',
  'Parasitosis intestinal',
  'Inflamación intestinal de bajo grado',
  'Permeabilidad intestinal aumentada',
  'Alteraciones post-antibióticos',
  'Estreñimiento crónico funcional',
  'Diarrea funcional crónica',
  'Crecimiento bacteriano intestinal distal',
  'Desequilibrio de la microbiota intestinal',
  'Fermentación intestinal excesiva',
];

// Inicializar modelo con Sequelize
Patient.init(
  {
    // PRIMARY KEY: UUID v4
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    // FOREIGN KEY: Referencia al usuario
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    },

    // ============ PERFIL (Profile) ============
    nombreCompleto: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'full_name',
    },

    fechaNacimiento: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'date_of_birth',
    },

    pais: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'country',
    },

    ciudad: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'city',
    },

    // Modalidad: Virtual, Presencial, Mixto
    modalidad: {
      type: DataTypes.ENUM(...MODALITIES),
      allowNull: true,
      validate: {
        isIn: {
          args: [MODALITIES],
          msg: `Modalidad debe ser uno de: ${MODALITIES.join(', ')}`,
        },
      },
    },

    // Disponibilidad: Mañana, Tarde
    disponibilidad: {
      type: DataTypes.ENUM(...AVAILABILITY),
      allowNull: true,
      validate: {
        isIn: {
          args: [AVAILABILITY],
          msg: `Disponibilidad debe ser uno de: ${AVAILABILITY.join(', ')}`,
        },
      },
    },

    // Objetivo: Pérdida de peso, Ganancia de masa muscular, etc.
    objetivo: {
      type: DataTypes.ENUM(...OBJECTIVES),
      allowNull: true,
      validate: {
        isIn: {
          args: [OBJECTIVES],
          msg: `Objetivo debe ser uno de: ${OBJECTIVES.join(', ')}`,
        },
      },
    },

    // ============ SALUD/TAGS (Health Tags) ============
    // Array de condiciones de salud (almacenado como JSON en PostgreSQL)
    condiciones: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
      validate: {
        isValidConditions(value) {
          if (Array.isArray(value)) {
            const invalidConditions = value.filter(
              (condition) => !HEALTH_CONDITIONS.includes(condition)
            );
            if (invalidConditions.length > 0) {
              throw new Error(
                `Condiciones inválidas: ${invalidConditions.join(', ')}. Permitidas: ${HEALTH_CONDITIONS.join(', ')}`
              );
            }
          }
        },
      },
    },

    // Otra condición / Observaciones (texto libre)
    otraCondicion: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'other_condition',
    },

    // ============ TIMESTAMPS ============
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },

    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      onUpdate: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Patient',
    tableName: 'patients',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Patient;
module.exports.MODALITIES = MODALITIES;
module.exports.AVAILABILITY = AVAILABILITY;
module.exports.OBJECTIVES = OBJECTIVES;
module.exports.HEALTH_CONDITIONS = HEALTH_CONDITIONS;
