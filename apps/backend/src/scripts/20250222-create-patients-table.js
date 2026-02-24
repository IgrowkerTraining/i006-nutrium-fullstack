/**
 * Migration: Create Patients Table
 * 
 * Crear la tabla de pacientes con todas las columnas necesarias
 * 
 * Ejecutar con:
 * npx sequelize-cli db:migrate
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('patients', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },

      // Foreign Key - Referencia a tabla users
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },

      // ============ PERFIL (Profile) ============
      fullName: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'full_name',
      },

      dateOfBirth: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'date_of_birth',
      },

      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      modalidad: {
        type: Sequelize.ENUM('Virtual', 'Presencial', 'Mixto'),
        allowNull: true,
      },

      disponibilidad: {
        type: Sequelize.ENUM('Mañana', 'Tarde'),
        allowNull: true,
      },

      objetivo: {
        type: Sequelize.ENUM(
          'Pérdida de peso',
          'Ganancia de masa muscular',
          'Reeducación alimentaria',
          'Mejorar salud digestiva',
          'Mejorar composición corporal',
          'Aumentar energía',
          'Mejorar rendimiento deportivo',
          'Organización de hábitos alimentarios',
          'Alimentación para condición digestiva específica',
          'Prevención y bienestar general'
        ),
        allowNull: true,
      },

      // ============ SALUD/TAGS (Health) ============
      condiciones: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true,
        defaultValue: [],
      },

      otraCondicion: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'other_condition',
      },

      // ============ TIMESTAMPS ============
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'created_at',
      },

      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'updated_at',
      },
    });

    // Crear índices para mejor performance
    await queryInterface.addIndex('patients', {
      fields: ['user_id'],
      name: 'idx_patients_user_id',
    });

    // Crear índice compuesto para búsquedas por country/city
    await queryInterface.addIndex('patients', {
      fields: ['country', 'city'],
      name: 'idx_patients_location',
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Eliminar índices
    await queryInterface.removeIndex('patients', 'idx_patients_user_id');
    await queryInterface.removeIndex('patients', 'idx_patients_location');

    // Eliminar tabla
    await queryInterface.dropTable('patients');
  },
};
