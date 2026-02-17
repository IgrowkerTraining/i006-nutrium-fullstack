const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

/**
 * Modelo User - Define la estructura de la tabla users en PostgreSQL
 * 
 * UUID vs ID Incremental:
 * - UUID (v4): Identificador único global, generado aleatoriamente
 * - Ventajas: Seguro (no predecible), ideal para sistemas distribuidos
 * - Desventaja: Ocupa más espacio (36 caracteres vs 4 bytes de int)
 * - Es mejor para privacidad: no se puede adivinar el siguiente ID
 * 
 * bcrypt:
 * - Hash unidireccional: no se puede recuperar la contraseña original
 * - Salt automático: agrega aleatoriedad al hash para seguridad extra
 * - Lento intencionalmente (10 rondas por defecto) para resistir fuerza bruta
 */
class User extends Model {
  /**
   * Valida una contraseña en texto plano contra el hash almacenado
   * @param {string} password - Contraseña en texto plano a validar
   * @returns {Promise<boolean>} true si coincide, false si no
   */
  async validatePassword(password) {
    try {
      // bcrypt.compare compara texto plano con hash sin desencriptar
      // Retorna true/false sin revelar la contraseña
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      console.error('Error validando contraseña:', error);
      return false;
    }
  }

  /**
   * Retorna objeto User sin la contraseña hasheada (para APIs/JSON)
   * @returns {Object} Usuario sin datos sensibles
   */
  toJSON() {
    const { password_hash, ...userWithoutPassword } = this.dataValues;
    return userWithoutPassword;
  }
}

// Inicializar modelo con Sequelize
User.init(
  {
    // PRIMARY KEY: UUID v4 (Universally Unique Identifier)
    // Más seguro que IDs secuenciales porque no se pueden predecir
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, // Generado automáticamente al crear
      primaryKey: true,
      comment: 'Identificador único universal generado automáticamente',
    },

    // EMAIL: Identificación única del usuario
    email: {
      type: DataTypes.STRING(255),
      unique: true, // Base de datos garantiza unicidad
      allowNull: false, // No puede ser nulo
      lowercase: true, // Siempre almacenar en minúsculas
      validate: {
        // Utiliza el validador de Sequelize para emails
        isEmail: {
          msg: 'El email debe ser válido',
        },
      },
      comment: 'Email único del usuario para autenticación',
    },

    // PASSWORD HASH: Hash bcrypt de la contraseña original
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false, // Requerido
      comment: 'Hash bcrypt de la contraseña (nunca almacenar en texto plano)',
    },

    // ROLE: Tipo de usuario del sistema
    role: {
      type: DataTypes.ENUM('patient', 'nutritionist', 'admin'),
      defaultValue: 'patient', // Por defecto paciente
      allowNull: false,
      validate: {
        isIn: {
          args: [['patient', 'nutritionist', 'admin']],
          msg: 'Role debe ser patient, nutritionist o admin',
        },
      },
      comment: 'Rol del usuario: paciente, nutricionista o administrador',
    },

    // IS_ACTIVE: Estado del usuario
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true, // Activo por defecto
      allowNull: false,
      comment: 'Indica si el usuario está activo en el sistema',
    },
  },
  {
    sequelize, // Instancia de conexión a BD
    modelName: 'User', // Nombre del modelo
    tableName: 'users', // Nombre de la tabla en BD
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    underscored: true, // Las columnas usan snake_case (created_at, updated_at)
    paranoid: false, // No usar soft delete
  }
);

/**
 * HOOK: beforeCreate
 * Se ejecuta ANTES de insertar un nuevo usuario en la BD
 * Hashea la contraseña automáticamente
 * 
 * ¿Por qué antes de crear?
 * - Si hay validaciones y falla, no gastamos CPU hasheando
 * - El usuario se crea directamente con la contraseña ya hasheada
 */
User.beforeCreate(async (user) => {
  const saltRounds = 10; // Número de rondas de salt (más = más seguro pero lento)
  // bcrypt.hash(texto, rondas) genera el hash
  user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
});

module.exports = User;
