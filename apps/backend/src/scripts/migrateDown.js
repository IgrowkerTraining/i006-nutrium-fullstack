/**
 * Migration Rollback
 * 
 * Ejecutar con: npm run migrate:down
 * Revierte la última migración (rollback)
 */

require('dotenv').config();
const sequelize = require('../config/database');

// Importar las migraciones en orden inverso
const migrations = [
  require('./20250222-create-patients-table'),
];

async function rollbackMigrations() {
  try {
    console.log('🔄 Iniciando rollback de migraciones...\n');

    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida\n');

    // Ejecutar rollback de cada migración en orden inverso
    for (let i = migrations.length - 1; i >= 0; i--) {
      const migration = migrations[i];
      try {
        console.log(`📝 Revirtiendo migración ${migrations.length - i}/${migrations.length}...`);
        
        // Crear queryInterface para ejecutar la migración
        const queryInterface = sequelize.getQueryInterface();
        
        // Ejecutar función 'down' de la migración
        if (migration.down) {
          await migration.down(queryInterface, sequelize.Sequelize);
          console.log(`✅ Migración revertida\n`);
        }
      } catch (error) {
        // Si es un error de "no existe", continuar
        if (error.message.includes('does not exist') || 
            error.originalError?.message?.includes('does not exist') ||
            error.originalError?.message?.includes('undefined')) {
          console.log(`⚠️  La migración ya ha sido revertida (omitiendo)\n`);
        } else {
          throw error;
        }
      }
    }

    console.log('🎉 ¡Todas las migraciones fueron revertidas exitosamente!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el rollback:', error.message);
    console.error('Detalles:', error.originalError || error);
    process.exit(1);
  }
}

rollbackMigrations();
