const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Modelo ClinicalTag
 * Mapea la tabla `clinical_tags` – catálogo de especialidades clínicas.
 *
 * Relación N:M con NutritionistProfile a través de `nutritionist_tags`.
 */
class ClinicalTag extends Model {}

ClinicalTag.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    // Nombre legible del tag: "Diabetes", "Nutrición deportiva"
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: 'El nombre del tag no puede estar vacío' },
      },
    },

    // Categoría de la especialidad clínica: "endocrinología", "deportiva"
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'ClinicalTag',
    tableName: 'clinical_tags',
    timestamps: true,
    underscored: true,
    updatedAt: false, // la tabla solo tiene created_at
  }
);

module.exports = ClinicalTag;
