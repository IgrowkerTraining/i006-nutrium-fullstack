const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,  // Un usuario solo puede tener un perfil de nutricionista
    },

    // Número de matrícula profesional (único por profesional)
    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El número de matrícula no puede estar vacío' },
      },
    },

    // Años de experiencia
    years_of_experience: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: { args: [0], msg: 'Los años de experiencia no pueden ser negativos' },
      },
    },

    // Modalidad de atención: online | presencial | hibrida
    modality: {
      type: DataTypes.STRING(50),
      allowNull: true,
      validate: {
        isIn: {
          args: [['online', 'presencial', 'hibrida']],
          msg: 'Modalidad debe ser: online, presencial o hibrida',
        },
      },
    },

    // Descripción profesional breve
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    // Campos heredados del schema (opcionales, útiles para lectura)
    specializations:    { type: DataTypes.JSONB, defaultValue: [] },
    certifications:     { type: DataTypes.JSONB, defaultValue: [] },
    languages:          { type: DataTypes.JSONB, defaultValue: ['es'] },
    location:           { type: DataTypes.STRING(255), allowNull: true },
    accepts_new_patients: { type: DataTypes.BOOLEAN, defaultValue: true },
    consultation_fee_range: { type: DataTypes.STRING(100), allowNull: true },
    profile_picture_url: { type: DataTypes.STRING(500), allowNull: true },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: { min: 0, max: 5 },
    },
    total_reviews:  { type: DataTypes.INTEGER, defaultValue: 0 },
    is_verified:    { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  {
    sequelize,
    modelName: 'NutritionistProfile',
    tableName: 'nutritionist_profiles',
    timestamps: true,
    underscored: true, // mapea createdAt → created_at
  }
);

module.exports = NutritionistProfile;
