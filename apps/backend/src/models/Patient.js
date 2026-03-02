const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Modelo Patient - Mapeado a la tabla `patient_profiles` de PostgreSQL.
 *
 * Esquema real (Nutriom.sql):
 *   id            BIGSERIAL PRIMARY KEY
 *   user_id       UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE
 *   birth_date    DATE NOT NULL
 *   gender        VARCHAR(50)
 *   health_goals  TEXT
 *   created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 *
 * Los tags clínicos se gestionan a través de la tabla pivote
 * `patient_tags` (patient_id BIGINT, tag_id INT) mediante la
 * relación N:M definida en models/index.js.
 */
class Patient extends Model {}

Patient.init(
  {
    // PRIMARY KEY: BIGINT autoincremental generado por PostgreSQL (BIGSERIAL)
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    // FOREIGN KEY: Referencia al usuario autenticado
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },

    // Fecha de nacimiento del paciente
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    // Género del paciente
    gender: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // Objetivos de salud (texto libre)
    health_goals: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Idiomas que habla el paciente (array de strings)
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },

    // Modalidad de atención preferida
    modality: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    // URL o path de la foto de perfil
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },

    // País del paciente
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    // Ciudad del paciente
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Patient",
    tableName: "patient_profiles",
    timestamps: true,
    updatedAt: false, // patient_profiles no tiene columna updated_at
    underscored: true,
  },
);

module.exports = Patient;
