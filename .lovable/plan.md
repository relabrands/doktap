
# DOKTAP — Plataforma GLP-1 para República Dominicana

Clon funcional inspirado en medvi.org/glp1, adaptado al mercado dominicano, en español, mobile-first. Incluye landing pública, quiz de admisión multi-paso, y portal del doctor para revisar pacientes.

## Stack y backend

- TanStack Start (ya configurado) + Tailwind v4.
- **Lovable Cloud** (activación incluida) para base de datos, auth y storage.
- Diseño verde MEDVI-style adaptado: verde primario `#2E9D6E`, blancos/cremas, tipografía clara, botones grandes redondeados.

## Estructura de rutas

```
/                       Landing pública (hero, beneficios, productos GLP-1, testimonios, FAQ, CTA al quiz)
/quiz                   Quiz multi-paso (sin auth, guarda en DB al finalizar)
/auth                   Login del doctor
/_authenticated/doctor  Dashboard del doctor (lista de pacientes + detalle)
```

## Flujo del Quiz (mobile-first, basado en medvi)

Header fijo: logo DOKTAP + badge "Excelente 4.5 ★★★★★". Barra de progreso (6 pasos). Botón "Siguiente" grande verde abajo.

1. **Paso 1 — Datos básicos**: altura (pies/pulg o cm), peso actual (lb/kg), peso meta, sexo (M/F con iconos), fecha de nacimiento.
2. **Paso 2 — Testimonios**: "Cuando nada más funcionaba… ¡DOKTAP sí!" con 2 videos verticales (placeholders) + CTA "¿Listo para tu próximo capítulo?".
3. **Paso 3 — Cuánto vas a perder**: "¡Perfecto! Perder X kg es más fácil de lo que piensas, y no implica dietas restrictivas."
4. **Paso 4 — Ritmo de pérdida**: "Con medicación, perderás 1.7 a 2.3 kg por semana. Tomará ~X semanas alcanzar tu meta." Opciones: Me funciona / Lo quiero más rápido / Es muy rápido.
5. **Paso 5 — Salud**: condiciones médicas (checkboxes), medicamentos actuales, alergias, presión arterial (rangos con colores), embarazo/lactancia, historial GLP-1.
6. **Paso 6 — Contacto**: nombre, email, teléfono RD (+1 809/829/849), provincia, cédula (opcional). Submit → guarda en DB → pantalla de "Gracias, te contactaremos".

Estado del quiz vive en `useState` + persistencia en `localStorage` (para no perder progreso al refrescar). Al final, una server function inserta el registro completo.

## Modelo de datos (Lovable Cloud / Postgres)

```sql
-- Pacientes (insertados por el quiz público)
patients (
  id uuid pk,
  full_name, email, phone, province, cedula,
  height_cm, current_weight_kg, goal_weight_kg,
  sex, date_of_birth,
  pace_choice,            -- works/faster/too_fast
  conditions jsonb,       -- array de strings
  medications jsonb,
  allergies text,
  blood_pressure_range,   -- normal/elevated/high1/high2/crisis
  pregnant_or_nursing bool,
  prior_glp1 bool,
  status text default 'new',  -- new/contacted/approved/rejected
  doctor_notes text,
  created_at timestamptz default now()
)

-- Roles (patrón seguro: tabla aparte + has_role security definer)
app_role enum ('admin','doctor')
user_roles (user_id, role)
```

RLS:
- `patients` INSERT abierto a `anon` (el quiz es público).
- SELECT/UPDATE solo a usuarios con rol `doctor` o `admin`.
- Grants explícitos a `anon`/`authenticated`/`service_role`.

## Portal del doctor

- `/auth` → login email+password (Lovable Cloud Auth).
- `/_authenticated/doctor` → tabla de pacientes con filtros por estado, búsqueda. Click en fila → panel/diálogo con todos los datos del quiz + campo de notas + cambio de estado.
- Server functions con `requireSupabaseAuth` + `has_role` check para listar/actualizar.

## Landing (`/`)

Secciones, en español RD:
- Hero: "Por fin, en serio. Perder peso con cuidado personalizado y medicación GLP-1." + CTA "Empieza tu evaluación gratis".
- Banda de productos GLP-1 (4 cards con imágenes generadas).
- Testimonios con fotos.
- "Cuando nada más funcionaba… DOKTAP sí" (sección de marca).
- Stats: 18% peso perdido en promedio · 9/10 recomiendan · 6.5 meses · 93% satisfacción.
- Cómo funciona (3 pasos: evaluación → receta → entrega).
- FAQ acordeón.
- CTA final + footer.

SEO: title/description/og en cada ruta. `sitemap.xml` + `robots.txt`.

## Notas técnicas

- Imágenes generadas con imagegen (hero, productos, testimonios). Sin stock genérico.
- Todos los colores en `src/styles.css` como tokens oklch. Variante `hero` para el botón verde grande.
- Sin login para el quiz; el paciente entra como anon.
- Para crear al primer doctor: tras activar Cloud, registras un usuario en `/auth` y se le asigna rol `doctor` vía una migración semilla parametrizada por email (te pediré el email).

## Preguntas mínimas antes de construir

1. Email del primer doctor (para semilla del rol).
2. ¿Quieres logo de texto "DOKTAP" o genero un logo?
