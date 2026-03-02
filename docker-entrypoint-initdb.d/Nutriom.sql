-- 1. Habilitar extensión para generar UUIDs automáticamente
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Definir Tipos ENUM (Para restringir valores válidos)
CREATE TYPE role_enum AS ENUM ('admin', 'patient', 'nutritionist');
CREATE TYPE match_status_enum AS ENUM ('suggested', 'pending', 'accepted', 'rejected');
CREATE TYPE modality_enum AS ENUM ('online', 'presencial', 'hibrido');

-- 3. Tabla de Usuarios (Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role role_enum NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Perfiles (Relación 1 a 1)
CREATE TABLE patient_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    birth_date DATE NOT NULL,
    gender VARCHAR(50),
    health_goals TEXT,
    languages TEXT[],
    modality VARCHAR(50),
    profile_picture VARCHAR(255),
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE nutritionist_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    license_number VARCHAR(100) NOT NULL,
    bio TEXT,
    modality modality_enum,
    years_of_experience INT,
    specializations JSONB DEFAULT '[]',
    certifications JSONB DEFAULT '[]',
    languages JSONB DEFAULT '["es"]',
    location VARCHAR(255),
    accepts_new_patients BOOLEAN DEFAULT TRUE,
    consultation_fee_range VARCHAR(100),
    profile_picture_url VARCHAR(500),
    rating DECIMAL(3,2) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    country VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Catálogo de Etiquetas (Clinical Tags)
CREATE TABLE clinical_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- Ej: 'Patología', 'Dieta'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tablas Intermedias (Relaciones Muchos a Muchos)
CREATE TABLE patient_tags (
    patient_id BIGINT REFERENCES patient_profiles(id) ON DELETE CASCADE,
    tag_id INT REFERENCES clinical_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (patient_id, tag_id) -- Clave compuesta para evitar duplicados
);

CREATE TABLE nutritionist_tags (
    nutritionist_profile_id BIGINT REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,
    clinical_tag_id INT REFERENCES clinical_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (nutritionist_profile_id, clinical_tag_id)
);

-- 7. Agenda (Disponibilidad)
CREATE TABLE availabilities (
    id BIGSERIAL PRIMARY KEY,
    nutritionist_profile_id BIGINT NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,
    day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7b. Seed: Catálogo inicial de Clinical Tags
INSERT INTO clinical_tags (name, category) VALUES
  ('Diabetes tipo 2',          'Patología'),
  ('Obesidad',                 'Patología'),
  ('Hipertensión',             'Patología'),
  ('Síndrome metabólico',      'Patología'),
  ('Enfermedad celíaca',       'Patología'),
  ('Hipotiroidismo',           'Patología'),
  ('Anemia ferropénica',       'Patología'),
  ('Nutrición deportiva',      'Especialidad'),
  ('Nutrición pediátrica',     'Especialidad'),
  ('Nutrición oncológica',     'Especialidad'),
  ('Nutrición vegetariana',    'Especialidad'),
  ('Trastornos alimentarios',  'Especialidad'),
  ('Dieta mediterránea',       'Dieta'),
  ('Dieta cetogénica',         'Dieta'),
  ('Dieta vegana',             'Dieta'),
  ('Pérdida de peso',          'Objetivo'),
  ('Ganancia muscular',        'Objetivo'),
  ('Salud digestiva',          'Objetivo'),
  ('Fertilidad y embarazo',    'Objetivo'),
  ('Adulto mayor',             'Población')
ON CONFLICT (name) DO NOTHING;

-- 8. Matches (El núcleo de la IA)
CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    patient_id BIGINT NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    nutritionist_id BIGINT NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,
    score DECIMAL(3, 2) CHECK (score >= 0 AND score <= 1.00), -- Ej: 0.95
    status match_status_enum DEFAULT 'suggested',
    ai_reasoning JSONB, -- Guardamos la respuesta de la IA aquí
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);