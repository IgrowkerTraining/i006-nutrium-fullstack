const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/database");

/**
 * Modelo NutritionistProfile
 * Mapea la tabla `nutritionist_profiles`.
 *
 * Relaciones definidas al final del archivo:
 *  - belongsTo User            (1:1  – cada perfil pertenece a un usuario)
 *  - belongsToMany ClinicalTag (N:M  – a través de la tabla pivote `nutritionist_tags`)
 *  - hasMany Availability      (1:N  – un perfil tiene múltiples franjas horarias)
 */
class NutritionistProfile extends Model {}

NutritionistProfile.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },

    // FK al usuario propietario del perfil
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // Un usuario solo puede tener un perfil de nutricionista
    },

    // Número de matrícula profesional (único por profesional)
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "El número de matrícula no puede estar vacío" },
      },
    },

    // Años de experiencia
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        notNull: { msg: "years_of_experience es obligatorio" },
        min: {
          args: [0],
          msg: "Los años de experiencia no pueden ser negativos",
        },
      },
    },

    // Modalidad de atención: online | presencial | hibrido
    modality: {
      type: DataTypes.ENUM("online", "presencial", "hibrido"),
      allowNull: false,
      validate: {
        notNull: { msg: "modality es obligatoria" },
        notEmpty: { msg: "modality no puede estar vacía" },
        isIn: {
          args: [["online", "presencial", "hibrido"]],
          msg: "Modalidad debe ser: online, presencial o hibrido",
        },
      },
    },

    // Descripción profesional breve
    bio: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notNull: { msg: "bio es obligatoria" },
        notEmpty: { msg: "bio no puede estar vacía" },
      },
    },

    // Campos heredados del schema (opcionales, útiles para lectura)
    specializations: { type: DataTypes.JSONB, defaultValue: [] },
    certifications: { type: DataTypes.JSONB, defaultValue: [] },
    languages: { type: DataTypes.JSONB, defaultValue: ["es"] },
    location: { type: DataTypes.STRING(255), allowNull: true },
    accepts_new_patients: { type: DataTypes.BOOLEAN, defaultValue: true },
    consultation_fee_range: { type: DataTypes.STRING(100), allowNull: true },
    profile_picture_url: { type: DataTypes.TEXT, allowNull: true },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: { min: 0, max: 5 },
    },
    total_reviews: { type: DataTypes.INTEGER, defaultValue: 0 },
    is_verified: { type: DataTypes.BOOLEAN, defaultValue: false },

    // País del nutricionista
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: "country es obligatorio" },
        notEmpty: { msg: "country no puede estar vacío" },
      },
    },

    // Ciudad del nutricionista
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
    modelName: "NutritionistProfile",
    tableName: "nutritionist_profiles",
    timestamps: true,
    underscored: true, // mapea createdAt → created_at
  },
);

module.exports = NutritionistProfile;
