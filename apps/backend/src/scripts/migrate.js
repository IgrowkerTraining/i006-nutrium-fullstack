/**
 * Migration Runner
 * 
 * Ejecutar con: npm run migrate
 * Las migraciones se ejecutan automáticamente en orden
 */

require('dotenv').config();
const sequelize = require('../config/database');
const path = require('path');
const fs = require('fs');

// Importar las migraciones
const migrations = [
  require('./20250222-create-patients-table'),
];

async function runMigrations() {
  try {
    console.log('🔄 Iniciando migraciones...\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Sincronicar modelos con la base de datos
    // Esto crea las tablas si no existen
    await sequelize.sync({ alter: false });
    console.log('✅ Sincronización completada\n');

    // Ejecutar cada migración
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      try {
        console.log(`📝 Ejecutando migración ${i + 1}/${migrations.length}...`);
        
        // Crear queryInterface para ejecutar la migración
        const queryInterface = sequelize.getQueryInterface();
        
        // Ejecutar función 'up' de la migración
        if (migration.up) {
          await migration.up(queryInterface, sequelize.Sequelize);
          console.log(`✅ Migración ${i + 1} completada\n`);
        }
      } catch (error) {
        // Si es un error de "ya existe", continuar
        if (error.message.includes('already exists') || 
            error.originalError?.message?.includes('already exists') ||
            error.originalError?.message?.includes('relation')) {
          console.log(`⚠️  Migración ${i + 1} ya fue aplicada (omitiendo)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 ¡Todas las migraciones fueron aplicadas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante las migraciones:', error.message);
    console.error('Detalles:', error.originalError || error);
    process.exit(1);
  }
}

runMigrations();
