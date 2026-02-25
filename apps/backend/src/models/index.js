/**
 * models/index.js
 * Punto central que importa todos los modelos y define sus asociaciones.
 *
 * ¿Por qué centralizar las asociaciones?
 * - Evita dependencias circulares (A require B, B require A).
 * - Un único lugar para entender toda la topología de las relaciones.
 */

const User               = require('./User');
const NutritionistProfile = require('./NutritionistProfile');
const ClinicalTag        = require('./ClinicalTag');
const Availability       = require('./Availability');

// ───────────────────────────────────────────────
// RELACIONES
// ───────────────────────────────────────────────

// 1:1  User ↔ NutritionistProfile
User.hasOne(NutritionistProfile, { foreignKey: 'user_id', as: 'nutritionistProfile' });
NutritionistProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

/**
 * N:M  NutritionistProfile ↔ ClinicalTag
 *
 * Lógica de la relación muchos-a-muchos:
 *  - Un nutricionista puede tener múltiples especialidades (tags).
 *  - Un tag puede pertenecer a muchos nutricionistas.
 *  - La tabla PIVOTE `nutritionist_tags` almacena solo las dos FKs:
 *      nutritionist_profile_id  │  clinical_tag_id
 *    No necesita columnas extra, por eso se usa { through: 'nutritionist_tags' }.
 *
 * Sequelize genera automáticamente:
 *   profile.getTags()          → SELECT clínical_tags JOIN nutritionist_tags
 *   profile.setTags([t1, t2])  → DELETE old rows + INSERT new rows in pivot table
 *   profile.addTag(t)          → INSERT single row in pivot table
 */
NutritionistProfile.belongsToMany(ClinicalTag, {
  through: 'nutritionist_tags',           // nombre de la tabla pivote
  foreignKey: 'nutritionist_profile_id',  // FK apuntando a NutritionistProfile
  otherKey: 'clinical_tag_id',            // FK apuntando a ClinicalTag
  as: 'tags',
});

ClinicalTag.belongsToMany(NutritionistProfile, {
  through: 'nutritionist_tags',
  foreignKey: 'clinical_tag_id',
  otherKey: 'nutritionist_profile_id',
  as: 'nutritionists',
});

// 1:N  NutritionistProfile → Availability
NutritionistProfile.hasMany(Availability, {
  foreignKey: 'nutritionist_profile_id',
  as: 'availabilities',
});
Availability.belongsTo(NutritionistProfile, {
  foreignKey: 'nutritionist_profile_id',
  as: 'profile',
});

// ───────────────────────────────────────────────
// EXPORTS
// ───────────────────────────────────────────────
module.exports = {
  User,
  NutritionistProfile,
  ClinicalTag,
  Availability,
};
