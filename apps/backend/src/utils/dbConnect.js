const sequelize = require('../config/database');

/**
 * Prueba la conexión a la base de datos PostgreSQL
 * @async
 * @returns {Promise<void>}
 * @throws {Error} Si la conexión falla
 */
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Conexión a PostgreSQL establecida correctamente');
  } catch (error) {
    console.error('✗ Error al conectar a la base de datos:', error.message);
    throw error;
  }
};

/**
 * Sincroniza todos los modelos de Sequelize con la base de datos
 * Crea las tablas si no existen
 * @async
 * @param {Object} options - Opciones de sincronización
 * @param {boolean} options.force - Si es true, elimina las tablas existentes antes de crear
 * @param {boolean} options.alter - Si es true, modifica las tablas existentes para coincidir con los modelos
 * @returns {Promise<void>}
 * @throws {Error} Si la sincronización falla
 */
const syncDatabase = async (options = {}) => {
  try {
    await sequelize.sync(options);
    console.log('✓ Modelos sincronizados correctamente con la base de datos');
  } catch (error) {
    console.error('✗ Error al sincronizar modelos:', error.message);
    throw error;
  }
};

/**
 * Desconecta de la base de datos de manera segura
 * @async
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('✓ Conexión a la base de datos cerrada');
  } catch (error) {
    console.error('✗ Error al cerrar la conexión:', error.message);
    throw error;
  }
};

module.exports = {
  testConnection,
  syncDatabase,
  closeConnection,
  sequelize,
};
