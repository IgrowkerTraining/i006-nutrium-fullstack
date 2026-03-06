class Validator {
  static required(value, fieldName) {
    if (!value || value.trim() === "") {
      return `${fieldName} is required`;
    }
    return null;
  }

  static email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return "Invalid email format";
    }
    return null;
  }

  static minLength(value, min) {
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  }

  /**
   * Valida estrictamente que una cadena sea una fecha real del calendario
   * en formato YYYY-MM-DD.
   *
   * Lógica en dos pasos:
   *
   * PASO 1 – Validación de formato (Expresión Regular)
   *   /^\d{4}-\d{2}-\d{2}$/
   *   ^^^^^^^^^^^^^^^^^^^^^^^^^^
   *   ^       → ancla al inicio de la cadena
   *   \d{4}   → exactamente 4 dígitos (año)
   *   -       → guión literal
   *   \d{2}   → exactamente 2 dígitos (mes)
   *   -       → guión literal
   *   \d{2}   → exactamente 2 dígitos (día)
   *   $       → ancla al final de la cadena
   *   Rechaza: "1990-3-1", "1990/03/01", "1990-03-", "hola", ...
   *
   * PASO 2 – Validación de existencia en el calendario
   *   a) Se descomponen los fragmentos: year=1990, month=3, day=30
   *   b) Se llama a new Date(year, month - 1, day).
   *      NOTA: el constructor de Date usa meses 0-indexados (enero=0),
   *      por eso se resta 1 al mes antes de pasarlo.
   *   c) Si el día no existe en ese mes, JavaScript NO lanza un error:
   *      en su lugar hace "overflow" (desbordamiento aritmético de fecha):
   *        new Date(1990, 1, 30)  →  1990-03-02  (febrero no tiene día 30,
   *                                              suma los días sobrantes a marzo)
   *        new Date(2026, 1, 30)  →  2026-03-02  (misma razón)
   *   d) Por eso leemos de vuelta los fragmentos de la fecha construida:
   *        date.getFullYear() === year          → ¿el año no mutó?
   *        date.getMonth()    === month - 1     → ¿el mes (0-indexado) no mutó?
   *        date.getDate()     === day           → ¿el día no mutó?
   *      Si los tres coinciden, la fecha existía en el calendario.
   *      Si alguno difiere, hubo overflow → la fecha era inválida.
   *
   * @param {string} dateString  Cadena a validar (ej. "1990-03-15")
   * @returns {boolean}          true si el formato y el calendario son correctos
   */
  static isValidDate(dateString) {
    // PASO 1: formato estricto YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;

    // PASO 2: existencia real en el calendario
    const [year, month, day] = dateString.split("-").map(Number);
    // month - 1 porque Date usa índice 0 para los meses
    const date = new Date(year, month - 1, day);

    return (
      date.getFullYear() === year && // el año no hizo overflow
      date.getMonth() === month - 1 && // el mes  no hizo overflow
      date.getDate() === day // el día  no hizo overflow
    );
  }

  static validateRegistration(data) {
    const errors = [];

    const nameError = this.required(data.name, "Name");
    if (nameError) errors.push({ field: "name", message: nameError });

    const emailError =
      this.required(data.email, "Email") || this.email(data.email);
    if (emailError) errors.push({ field: "email", message: emailError });

    const passwordError =
      this.required(data.password, "Password") ||
      this.minLength(data.password, 6);
    if (passwordError)
      errors.push({ field: "password", message: passwordError });

    return errors;
  }

  static validateLogin(data) {
    const errors = [];

    const emailError =
      this.required(data.email, "Email") || this.email(data.email);
    if (emailError) errors.push({ field: "email", message: emailError });

    const passwordError = this.required(data.password, "Password");
    if (passwordError)
      errors.push({ field: "password", message: passwordError });

    return errors;
  }
}

module.exports = Validator;
