class Validator {
  static required(value, fieldName) {
    if (!value || value.trim() === '') {
      return `${fieldName} is required`;
    }
    return null;
  }

  static email(value) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Invalid email format';
    }
    return null;
  }

  static minLength(value, min) {
    if (value.length < min) {
      return `Must be at least ${min} characters long`;
    }
    return null;
  }

  static validateRegistration(data) {
    const errors = [];
    
    const nameError = this.required(data.name, 'Name');
    if (nameError) errors.push({ field: 'name', message: nameError });
    
    const emailError = this.required(data.email, 'Email') || this.email(data.email);
    if (emailError) errors.push({ field: 'email', message: emailError });
    
    const passwordError = this.required(data.password, 'Password') || 
                         this.minLength(data.password, 6);
    if (passwordError) errors.push({ field: 'password', message: passwordError });
    
    return errors;
  }

  static validateLogin(data) {
    const errors = [];
    
    const emailError = this.required(data.email, 'Email') || this.email(data.email);
    if (emailError) errors.push({ field: 'email', message: emailError });
    
    const passwordError = this.required(data.password, 'Password');
    if (passwordError) errors.push({ field: 'password', message: passwordError });
    
    return errors;
  }
}

module.exports = Validator;
