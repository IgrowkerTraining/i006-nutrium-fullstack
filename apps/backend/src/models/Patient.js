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
      validate: {
        notNull: { msg: "birth_date es obligatorio" },
        isDate: { msg: "birth_date debe ser una fecha válida (YYYY-MM-DD)" },
        // Última línea de defensa en el ORM: garantiza el formato estricto
        // incluso si el dato llegó sin pasar por el controlador.
        is: {
          args: /^\d{4}-\d{2}-\d{2}$/,
          msg: "birth_date debe seguir el formato exacto YYYY-MM-DD",
        },
      },
    },

    // Género del paciente
    gender: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "gender es obligatorio" },
        notEmpty: { msg: "gender no puede estar vacío" },
      },
    },

    // Objetivos de salud (texto libre)
    health_goals: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Idiomas que habla el paciente (array de strings, al menos uno requerido)
    languages: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
      validate: {
        notNull: { msg: "languages es obligatorio" },
        isNotEmptyArray(value) {
          if (!Array.isArray(value) || value.length === 0) {
            throw new Error("languages debe contener al menos un idioma");
          }
        },
      },
    },

    // Modalidad de atención preferida
    modality: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        notNull: { msg: "modality es obligatoria" },
        notEmpty: { msg: "modality no puede estar vacía" },
        isIn: {
          args: [["online", "presencial", "hibrido"]],
          msg: "modality debe ser: online, presencial o hibrido",
        },
      },
    },

    // URL de la foto de perfil (opcional, pero si se envía debe ser URL válida)
    profile_picture: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isUrlIfPresent(value) {
          if (value !== null && value !== undefined && value !== "") {
            const urlPattern = /^https?:\/\/.+/i;
            if (!urlPattern.test(value)) {
              throw new Error(
                "profile_picture debe ser una URL válida (http/https)",
              );
            }
          }
        },
      },
    },

    // País del paciente
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "country es obligatorio" },
        notEmpty: { msg: "country no puede estar vacío" },
      },
    },

    // Ciudad del paciente
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "city es obligatoria" },
        notEmpty: { msg: "city no puede estar vacía" },
      },
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
