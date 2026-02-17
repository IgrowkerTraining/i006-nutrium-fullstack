require('dotenv').config();
const { Sequelize } = require('sequelize');

// Crear instancia de Sequelize
const sequelize = new Sequelize(
  process.env.DB_NAME || 'nutriom_db',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASS || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false, // Desactivar logging de SQL en consola
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;
