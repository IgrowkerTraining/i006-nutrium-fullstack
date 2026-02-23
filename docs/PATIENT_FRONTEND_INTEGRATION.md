# Guía de Integración Frontend - Módulo de Pacientes

## 📱 Cómo Integrar desde React/TypeScript

Esta guía explica cómo consumir los endpoints de pacientes desde el frontend.

## 🔐 Configuración de Headers

En tus servicios API, incluye siempre el header de autenticación:

```typescript
// src/services/api.ts (o similar)

const getAuthToken = () => {
  // Obtener token del localStorage o contexto
  return localStorage.getItem('authToken') || '';
};

const apiCall = async (method: string, url: string, data?: any) => {
  const headers: any = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`,
  };

  const response = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  return response.json();
};
```

## 🎯 Ejemplos de Implementación

### 1. Obtener Perfil del Paciente

```typescript
// src/hooks/usePatientProfile.ts

import { useEffect, useState } from 'react';

interface PatientProfile {
  id: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  pais: string;
  ciudad: string;
  modalidad: 'Virtual' | 'Presencial' | 'Mixto';
  disponibilidad: 'Mañana' | 'Tarde';
  objetivo: string;
  createdAt: string;
  updatedAt: string;
}

export const usePatientProfile = () => {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        const response = await fetch('/api/v1/patients/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Error al obtener perfil');
        }

        setProfile(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return { profile, loading, error };
};
```

### 2. Crear/Actualizar Perfil

```typescript
// src/hooks/useUpdatePatientProfile.ts

import { useState } from 'react';

interface ProfileData {
  nombreCompleto: string;
  fechaNacimiento: string;
  pais: string;
  ciudad: string;
  modalidad: 'Virtual' | 'Presencial' | 'Mixto';
  disponibilidad: 'Mañana' | 'Tarde';
  objetivo: string;
}

export const useUpdatePatientProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (data: ProfileData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/v1/patients/profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Manejar errores de validación
        if (response.status === 400 && result.errors) {
          const errorMessages = result.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Error al actualizar perfil');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateProfile, loading, error };
};
```

### 3. Ejemplo de Componente - Formulario Personal

```typescript
// src/components/PatientProfileForm.tsx

import React, { useState } from 'react';
import { useUpdatePatientProfile } from '../hooks/useUpdatePatientProfile';

const OBJECTIVES = [
  'Pérdida de peso',
  'Ganancia de masa muscular',
  'Reeducación alimentaria',
  'Mejorar salud digestiva',
  'Mejorar composición corporal',
  'Aumentar energía',
  'Mejorar rendimiento deportivo',
  'Organización de hábitos alimentarios',
  'Alimentación para condición digestiva específica',
  'Prevención y bienestar general',
];

export const PatientProfileForm: React.FC = () => {
  const { updateProfile, loading, error } = useUpdatePatientProfile();
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    fechaNacimiento: '',
    pais: '',
    ciudad: '',
    modalidad: 'Virtual' as const,
    disponibilidad: 'Mañana' as const,
    objetivo: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateProfile(formData);
      alert('Perfil actualizado exitosamente');
      // Limpiar o redirigir según sea necesario
    } catch (err) {
      // El error ya está en el estado
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="nombreCompleto">Nombre Completo:</label>
        <input
          type="text"
          id="nombreCompleto"
          name="nombreCompleto"
          value={formData.nombreCompleto}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="fechaNacimiento">Fecha de Nacimiento:</label>
        <input
          type="date"
          id="fechaNacimiento"
          name="fechaNacimiento"
          value={formData.fechaNacimiento}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="pais">País:</label>
        <input
          type="text"
          id="pais"
          name="pais"
          value={formData.pais}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="ciudad">Ciudad:</label>
        <input
          type="text"
          id="ciudad"
          name="ciudad"
          value={formData.ciudad}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label htmlFor="modalidad">Modalidad:</label>
        <select
          id="modalidad"
          name="modalidad"
          value={formData.modalidad}
          onChange={handleChange}
          required
        >
          <option value="Virtual">Virtual</option>
          <option value="Presencial">Presencial</option>
          <option value="Mixto">Mixto</option>
        </select>
      </div>

      <div>
        <label htmlFor="disponibilidad">Disponibilidad:</label>
        <select
          id="disponibilidad"
          name="disponibilidad"
          value={formData.disponibilidad}
          onChange={handleChange}
          required
        >
          <option value="Mañana">Mañana</option>
          <option value="Tarde">Tarde</option>
        </select>
      </div>

      <div>
        <label htmlFor="objetivo">Objetivo:</label>
        <select
          id="objetivo"
          name="objetivo"
          value={formData.objetivo}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona un objetivo</option>
          {OBJECTIVES.map(obj => (
            <option key={obj} value={obj}>{obj}</option>
          ))}
        </select>
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Perfil'}
      </button>
    </form>
  );
};
```

### 4. Obtener Tags/Condiciones de Salud

```typescript
// src/hooks/usePatientTags.ts

import { useEffect, useState } from 'react';

interface PatientTags {
  condiciones: string[];
  otraCondicion: string | null;
}

export const usePatientTags = () => {
  const [tags, setTags] = useState<PatientTags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');

        const response = await fetch('/api/v1/patients/tags', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Error al obtener tags');
        }

        setTags(result.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setTags(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  return { tags, loading, error };
};
```

### 5. Actualizar Tags/Condiciones

```typescript
// src/hooks/useUpdatePatientTags.ts

import { useState } from 'react';

interface TagsData {
  condiciones?: string[];
  otraCondicion?: string | null;
}

export const useUpdatePatientTags = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateTags = async (data: TagsData) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');

      const response = await fetch('/api/v1/patients/tags', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.errors) {
          const errorMessages = result.errors
            .map((e: any) => `${e.field}: ${e.message}`)
            .join('\n');
          throw new Error(errorMessages);
        }
        throw new Error(result.message || 'Error al actualizar tags');
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateTags, loading, error };
};
```

### 6. Componente - Formulario de Salud/Tags

```typescript
// src/components/PatientHealthForm.tsx

import React, { useState } from 'react';
import { useUpdatePatientTags } from '../hooks/useUpdatePatientTags';

const HEALTH_CONDITIONS = [
  'SIBO',
  'Disbiosis intestinal',
  'Síndrome de intestino irritable (SII / IBS)',
  'Intolerancia a la lactosa',
  'Intolerancia al gluten',
  'Sobrecrecimiento bacteriano colónico',
  'Sobrecrecimiento de levaduras (Candida)',
  'Parasitosis intestinal',
  'Inflamación intestinal de bajo grado',
  'Permeabilidad intestinal aumentada',
  'Alteraciones post-antibióticos',
  'Estreñimiento crónico funcional',
  'Diarrea funcional crónica',
  'Crecimiento bacteriano intestinal distal',
  'Desequilibrio de la microbiota intestinal',
  'Fermentación intestinal excesiva',
];

export const PatientHealthForm: React.FC = () => {
  const { updateTags, loading, error } = useUpdatePatientTags();
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [otraCondicion, setOtraCondicion] = useState('');

  const toggleCondition = (condition: string) => {
    setSelectedConditions(prev =>
      prev.includes(condition)
        ? prev.filter(c => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateTags({
        condiciones: selectedConditions,
        otraCondicion: otraCondicion || null,
      });
      alert('Condiciones actualizadas exitosamente');
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h3>Selecciona tus condiciones de salud:</h3>
        {HEALTH_CONDITIONS.map(condition => (
          <label key={condition}>
            <input
              type="checkbox"
              checked={selectedConditions.includes(condition)}
              onChange={() => toggleCondition(condition)}
            />
            {condition}
          </label>
        ))}
      </div>

      <div>
        <label htmlFor="otraCondicion">Otra condición (opcional):</label>
        <textarea
          id="otraCondicion"
          value={otraCondicion}
          onChange={(e) => setOtraCondicion(e.target.value)}
          placeholder="Describe cualquier otra condición..."
        />
      </div>

      {error && <div className="error">{error}</div>}

      <button type="submit" disabled={loading}>
        {loading ? 'Guardando...' : 'Guardar Condiciones'}
      </button>
    </form>
  );
};
```

## 🔑 Constantes TypeScript Reutilizables

```typescript
// src/constants/patient.ts

export const PATIENT_MODALITIES = ['Virtual', 'Presencial', 'Mixto'] as const;
export type PatientModality = typeof PATIENT_MODALITIES[number];

export const PATIENT_AVAILABILITY = ['Mañana', 'Tarde'] as const;
export type PatientAvailability = typeof PATIENT_AVAILABILITY[number];

export const PATIENT_OBJECTIVES = [
  'Pérdida de peso',
  'Ganancia de masa muscular',
  'Reeducación alimentaria',
  'Mejorar salud digestiva',
  'Mejorar composición corporal',
  'Aumentar energía',
  'Mejorar rendimiento deportivo',
  'Organización de hábitos alimentarios',
  'Alimentación para condición digestiva específica',
  'Prevención y bienestar general',
] as const;
export type PatientObjective = typeof PATIENT_OBJECTIVES[number];

export const HEALTH_CONDITIONS = [
  'SIBO',
  'Disbiosis intestinal',
  'Síndrome de intestino irritable (SII / IBS)',
  'Intolerancia a la lactosa',
  'Intolerancia al gluten',
  'Sobrecrecimiento bacteriano colónico',
  'Sobrecrecimiento de levaduras (Candida)',
  'Parasitosis intestinal',
  'Inflamación intestinal de bajo grado',
  'Permeabilidad intestinal aumentada',
  'Alteraciones post-antibióticos',
  'Estreñimiento crónico funcional',
  'Diarrea funcional crónica',
  'Crecimiento bacteriano intestinal distal',
  'Desequilibrio de la microbiota intestinal',
  'Fermentación intestinal excesiva',
] as const;
export type HealthCondition = typeof HEALTH_CONDITIONS[number];
```

## ⚠️ Manejo de Errores

```typescript
const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expirado o inválido
    // Redirigir a login
    console.log('Token inválido, redirigiendo a login');
  } else if (error.response?.status === 400) {
    // Errores de validación
    console.log('Errores de validación:', error.response.data.errors);
  } else if (error.response?.status === 500) {
    // Error de servidor
    console.log('Error de servidor');
  }
};
```

