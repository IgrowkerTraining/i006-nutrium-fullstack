"use strict";

/**
 * seedNutritionists.js
 *
 * Puebla la BD con 3 nutricionistas clínicamente distintos para probar
 * la capacidad de discriminación del orquestador de IA (Matchmaking).
 *
 * Ejecución:
 *   node src/scripts/seedNutritionists.js
 *
 * El beforeCreate hook de User.js hashea password_hash automáticamente.
 * Si el email ya existe, el registro se omite (idempotente).
 */

require("dotenv").config();

const sequelize = require("../config/database");
const User = require("../models/User");
const NutritionistProfile = require("../models/NutritionistProfile");

// ── Datos seed ────────────────────────────────────────────────────────────────

const SEED_PASSWORD = "Password123!";

const usersData = [
  {
    name: "Dra. Laura Méndez",
    email: "laura.mendez.clinica@nutriom.test",
    role: "nutritionist",
  },
  {
    name: "Dr. Matías Rojas",
    email: "matias.rojas.sport@nutriom.test",
    role: "nutritionist",
  },
  {
    name: "Lic. Valentina Torres",
    email: "valentina.torres.plant@nutriom.test",
    role: "nutritionist",
  },
];

/**
 * Recibe el UUID de cada usuario ya creado para construir el perfil asociado.
 * @param {string[]} userIds - Array de UUIDs en el mismo orden que usersData
 */
const buildProfiles = (userIds) => [
  {
    // ── Nutricionista 1: Clínico / Metabólico ────────────────────────────────
    user_id: userIds[0],
    license_number: "MN-CL-00421",
    years_of_experience: 10,
    modality: "hibrido",
    bio: `Nutricionista clínica especializada en el manejo integral de la diabetes tipo 2
y la resistencia a la insulina. Trabajo con protocolos de bajo índice glucémico,
educación alimentaria y cambio de hábitos sostenido. Más de 10 años acompañando
a pacientes en su proceso de pérdida de peso clínica y mejora metabólica.`,
    specializations: [
      "Diabetes tipo 2",
      "Resistencia a la insulina",
      "Pérdida de peso clínica",
      "Síndrome metabólico",
      "Educación diabetológica",
    ],
    certifications: [
      "Diplomatura en Nutrición Clínica – UBA",
      "Certificación en Diabetes Mellitus – FASEN",
    ],
    languages: ["es"],
    location: "Buenos Aires, Argentina",
    country: "Argentina",
    city: "Buenos Aires",
    consultation_fee_range: "$4.000 - $6.000 ARS",
    accepts_new_patients: true,
    is_verified: true,
  },
  {
    // ── Nutricionista 2: Deportivo / Alto rendimiento ────────────────────────
    user_id: userIds[1],
    license_number: "MN-SP-00835",
    years_of_experience: 7,
    modality: "online",
    bio: `Nutricionista deportivo enfocado en hipertrofia muscular, composición corporal
y alto rendimiento. Trabajo con atletas de fuerza, crossfitters y deportistas de
competición diseñando planes de periodización nutricional, estrategias de carga
de carbohidratos y protocolos de suplementación basados en evidencia.`,
    specializations: [
      "Hipertrofia muscular",
      "Nutrición deportiva",
      "Alto rendimiento",
      "Composición corporal",
      "Suplementación basada en evidencia",
      "Periodización nutricional",
    ],
    certifications: [
      "Especialización en Nutrición Deportiva – ISAK",
      "Certified Sports Nutritionist – NSCA",
    ],
    languages: ["es", "en"],
    location: "Córdoba, Argentina",
    country: "Argentina",
    city: "Córdoba",
    consultation_fee_range: "$8.000 - $12.000 ARS",
    accepts_new_patients: true,
    is_verified: true,
  },
  {
    // ── Nutricionista 3: Plant-based / Salud digestiva ───────────────────────
    user_id: userIds[2],
    license_number: "MN-PB-01147",
    years_of_experience: 5,
    modality: "online",
    bio: `Licenciada en Nutrición especializada en alimentación plant-based, microbiota
intestinal y salud digestiva. Acompaño a personas que desean transicionar hacia
dietas veganas o vegetarianas equilibradas, o que presentan síndrome de intestino
irritable, disbiosis, intolerancias alimentarias y enfermedades inflamatorias del intestino.`,
    specializations: [
      "Dieta vegana y vegetariana",
      "Microbiota intestinal",
      "Salud digestiva",
      "Síndrome de intestino irritable",
      "Intolerancias alimentarias",
      "Alimentación antiinflamatoria",
    ],
    certifications: [
      "Diplomatura en Nutrición Plant-Based – Forks Over Knives",
      "Posgrado en Microbiota y Salud – Universidad de Barcelona",
    ],
    languages: ["es"],
    location: "Rosario, Argentina",
    country: "Argentina",
    city: "Rosario",
    consultation_fee_range: "$3.500 - $5.500 ARS",
    accepts_new_patients: true,
    is_verified: false,
  },
];

// ── Script principal ──────────────────────────────────────────────────────────

async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✔  Conexión a la base de datos establecida.\n");

    const createdUserIds = [];

    for (const userData of usersData) {
      const existing = await User.findOne({ where: { email: userData.email } });

      if (existing) {
        console.log(`⚠  Usuario ya existe, omitiendo: ${userData.email}`);
        createdUserIds.push(existing.id);
        continue;
      }

      // El hook beforeCreate de User.js hashea password_hash automáticamente
      const user = await User.create({
        ...userData,
        password_hash: SEED_PASSWORD,
        is_active: true,
      });

      console.log(`✔  Usuario creado: ${user.email} (id: ${user.id})`);
      createdUserIds.push(user.id);
    }

    console.log("");

    const profilesData = buildProfiles(createdUserIds);

    for (const profileData of profilesData) {
      const existing = await NutritionistProfile.findOne({
        where: { user_id: profileData.user_id },
      });

      if (existing) {
        console.log(
          `⚠  Perfil ya existe para user_id: ${profileData.user_id}, omitiendo.`,
        );
        continue;
      }

      const profile = await NutritionistProfile.create(profileData);
      console.log(
        `✔  Perfil creado: matrícula ${profile.license_number} ` +
          `(${profileData.specializations[0]})`,
      );
    }

    console.log("\n🌱  Seed completado con éxito.");
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error("\n✖  Error durante el seed:", error.message);
    console.error(error);
    await sequelize.close();
    process.exit(1);
  }
}

seed();
