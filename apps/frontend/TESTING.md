# Frontend Testing - Nutrium

## Setup

Framework: **Vitest** + **React Testing Library** + **jsdom**

### Ejecutar tests

```bash
cd apps/frontend

# Watch mode (re-ejecuta al guardar)
npm test

# Una sola ejecución
npm run test:run
```

## Estructura

```
src/
├── test/
│   ├── setup.ts              # Config global (jest-dom matchers)
│   └── fileMock.ts            # Mock para imports de imágenes
├── pages/
│   ├── MatchNutriList.test.tsx    # 14 tests
│   └── onboarding/
│       └── MatchPaciente.test.tsx # 8 tests
```

## Tests existentes (22 total)

### MatchPaciente — pantalla de carga (8 tests)

| Test | Verifica |
|------|----------|
| muestra el texto de búsqueda | Se renderiza "buscando nutricionistas..." |
| muestra aviso cuando no hay sesión real | Banner de advertencia sin token |
| no muestra aviso cuando hay sesión real | Banner oculto con token válido |
| navega con matches de IA cuando la llamada tiene éxito | Redirige a `/match/nutri-list` con matches |
| reintenta hasta 3 veces antes de usar fallback | Falla 2 veces, éxito en la 3ra, navega con matches |
| cae al fallback de backend cuando todos los reintentos fallan | 3 fallos de IA -> llama a getNutritionists como fallback |
| navega sin datos cuando IA y backend fallan | Ambos fallan -> navega sin state |
| navega sin sesión tras el delay mínimo | Sin token -> navega directo sin llamar a la IA |

### MatchNutriList — listado de nutricionistas (14 tests)

| Test | Verifica |
|------|----------|
| muestra el título y descripción | Heading y texto descriptivo |
| muestra nutricionistas mock cuando no hay datos reales | Datos hardcodeados como último recurso |
| muestra aviso cuando no hay sesión real | Banner de advertencia |
| muestra matches de IA con % de compatibilidad | Badge verde "Compatibilidad: 95%" |
| muestra nutricionistas del fallback SIN % de compatibilidad | Sin badge cuando no hay score |
| muestra experiencia en años para cada nutricionista | "8 años", "3 años" |
| muestra un botón 'Agendar cita' por cada nutricionista | 1 botón por card |
| abre el modal al hacer clic en 'Agendar cita' | Modal con campos fecha, hora, notas |
| cierra el modal al hacer clic en 'Cancelar' | Modal se cierra |
| el botón Confirmar está deshabilitado sin fecha | No se puede confirmar sin fecha |
| crea cita exitosamente y muestra mensaje de éxito | "Cita agendada exitosamente" |
| muestra error cuando falla la creación de cita | Mensaje de error del backend |
| navega al perfil del nutricionista al hacer clic en la card | Redirige a `/perfiles-match-nutri/:id` |
| usa datos de sessionStorage como cache | Recupera matches al volver de un perfil |

## Cómo agregar nuevos tests

1. Crear archivo `NombreComponente.test.tsx` junto al componente
2. Mockear dependencias externas (api, storage, router):

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

vi.mock("../services/api", () => ({
  api: { /* métodos como vi.fn() */ },
}));

vi.mock("../utils/storage", () => ({
  storage: { getToken: vi.fn(), getUser: vi.fn() },
}));
```

3. Envolver componentes con router en `<MemoryRouter>`:

```tsx
render(
  <MemoryRouter>
    <MiComponente />
  </MemoryRouter>
);
```

### Notas

- Los `<input type="date">` no funcionan con `userEvent.type()` en jsdom. Usar `fireEvent.change()` en su lugar.
- Las imágenes se mockean automáticamente via `vitest.config.ts` alias.
- Los fake timers (`vi.useFakeTimers()` + `vi.runAllTimersAsync()`) se usan para testear delays sin esperar tiempo real.
