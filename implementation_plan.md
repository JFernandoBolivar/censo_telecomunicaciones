# Detalle de Migración de Preguntas (Excel a Base de Datos)

A continuación, se lista **cada una de las preguntas** identificadas en el archivo Excel, mostrando exactamente qué **Tipo de Pregunta** se les asignó y cuál es la estructura **JSON** de validación que tendrán en la tabla `PreguntaPersonalizada`.

*(Nota: Las preguntas marcadas con 🔴 serán ignoradas por el script por ser redundantes con el modelo `Usuario`).*

---

## SECCIÓN 1: INFORMACIÓN INSTITUCIONAL

| Ítem | Enunciado (Excel) | Tipo de Pregunta | JSON de Validación |
|---|---|---|---|
| 🔴 1.1 | Nombre de la empresa (Razón Social) | *Ignorado* | *(Ya existe en `Usuario.nombre`)* |
| 🟢 1.2 | Informante calificado | Texto Corto | `{"regex": "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", "min_chars": 0, "max_chars": 255}` |
| 🟢 1.3 | Cargo del informante calificado | Texto Corto | `{"regex": "^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$", "min_chars": 0, "max_chars": 255}` |
| 🔴 1.4 | Correo electrónico | *Ignorado* | *(Ya existe en `Usuario.email`)* |

---

## SECCIÓN 2: DESPLIEGUE Y COMPARTICIÓN DE INFRAESTRUCTURA

| Ítem | Enunciado (Excel) | Tipo de Pregunta | JSON de Validación |
|---|---|---|---|
| 🟢 2.1 | ¿Tiene planificado invertir en despliegue de Fibra Óptica en el segundo semestre de 2026? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 2.1.1 | Cantidad de Kilómetros de Fibra Óptica a desplegar en 2026 | Numérico Decimal | `{"regex": "^\\d+(\\.\\d{1,2})?$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.1.2 | Cantidad de Postes a desplegar en 2026 | Numérico Entero | `{"regex": "^\\d+$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.1.3 | Kilómetros de Ductos a desplegar en 2026 | Numérico Decimal | `{"regex": "^\\d+(\\.\\d{1,2})?$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.1.4 | Cantidad de Abonados estimados a conectar en 2026 | Numérico Entero | `{"regex": "^\\d+$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.1.5 | ¿Cuáles son las zonas de interés para el despliegue de Fibra Óptica para el año 2026? | Selección Geográfica | `{"regex": "^\\d+(,\\d+)*$", "min_chars": 0, "max_chars": 1000}` |
| 🟢 2.2 | ¿Tiene planificado invertir en despliegue de Fibra Óptica en el primer semestre de 2027? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 2.2.1 | Cantidad de Kilómetros de Fibra Óptica a desplegar en 2027 | Numérico Decimal | `{"regex": "^\\d+(\\.\\d{1,2})?$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.2.2 | Cantidad de Abonados estimados a conectar en el período 2027 - 2031 | Numérico Entero | `{"regex": "^\\d+$", "min_chars": 0, "max_chars": 255}` |
| 🟢 2.2.3 | ¿Cuáles son las zonas de interés para el despliegue de Fibra Óptica para el año 2027? | Selección Geográfica | `{"regex": "^\\d+(,\\d+)*$", "min_chars": 0, "max_chars": 1000}` |
| 🟢 2.3 | ¿Tiene Alianzas suscritas para el despliegue de Fibra Óptica? (Compartición o Intercambio de Fibra) | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 2.3.1 | ¿Qué tipo de alianzas? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |
| 🟢 2.3.2 | ¿En que zonas del país? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |
| 🟢 2.4 | ¿Tiene algún interés de generar Alianzas para el despliegue, intercambio o compartición de Fibra Óptica? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 2.4.1 | ¿Qué tipo de alianzas? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |
| 🟢 2.4.2 | ¿En que zonas del país? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |

---

## SECCIÓN 3: VIAS GENERALES DE TELECOMUNICACIONES (VGT)

| Ítem | Enunciado (Excel) | Tipo de Pregunta | JSON de Validación |
|---|---|---|---|
| 🟢 3.1 | ¿Posee Infraestructura de VGT o de compartición de infraestructura? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 3.1.1 | ¿De que tipo? (Especifique el tipo...) | Selección Múltiple | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 255}` |
| 🟢 3.2 | ¿Está compartida con otros operadores? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 3.3 | ¿Tiene interés de compartirla con otros operadores? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 3.4 | ¿Tiene algún interés en formar alianzas relacionadas con las VGT y Copartición de Infraestructura? | Selección Única (SI/NO) | `{"regex": "^(SI|NO)$", "min_chars": 0, "max_chars": 2}` |
| 🟢 3.5 | ¿Qué tipo de alianzas (compartición, intercambio)? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |
| 🟢 3.4(b) | ¿Considera que hay zonas saturadas? Detalle su respuesta: | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |
| 🟢 3.5(b) | Aportes o sugerencias | Texto Largo | `{"regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$", "min_chars": 0, "max_chars": 2000}` |

> [!NOTE]
> Las sub-preguntas (como "2.1.5.1 Entidades Federales", "2.1.5.2 Municipios", "2.1.5.3 Parroquias") fueron agrupadas bajo la pregunta principal "2.1.5 ¿Cuáles son las zonas de interés...?" con el tipo `Selección Geográfica`, ya que en la base de datos se guarda un solo conjunto de datos geográficos para toda la pregunta.

---

## Estructura JSON Avanzada (Para el Frontend)

Para comunicarle al frontend la lógica de negocio (como ocultar preguntas dependiendo de una respuesta anterior o renderizar un componente específico de geografía), utilizaremos el campo `validacion` (JSONField) que ya existe en el modelo `PreguntaPersonalizada`.

### 1. Lógica Condicional (Ocultar/Mostrar Preguntas)
Para preguntas que dependen de una respuesta previa (como la 2.3.1 que depende de que la 2.3 sea "SI"), podemos agregar un atributo `depends_on` al JSON de la pregunta hija (2.3.1).

**Ejemplo para la pregunta 2.3.1 (depende de la 2.3):**
```json
{
  "regex": "^[\\w\\s\\.,\\-ñÑáéíóúÁÉÍÓÚ]+$",
  "min_chars": 0,
  "max_chars": 2000,
  "depends_on": {
    "parent_question_code": "2.3",
    "expected_value": "SI",
    "action_if_false": "hide"
  }
}
```
**¿Cómo lo lee el frontend?** El frontend al renderizar la pregunta 2.3.1 lee `depends_on`. Se suscribe al estado de la pregunta "2.3" y si la respuesta no es "SI", ejecuta el `action_if_false` (es decir, la oculta visualmente y no la envía en el payload).

### 2. Componentes Especiales (Zonas Geográficas)
Para las preguntas 2.1.5 y 2.2.3, el frontend necesita saber que no debe renderizar un input de texto normal, sino los dropdowns en cascada (Estado > Municipio > Parroquia) que consumen los endpoints de `geography`.

**Ejemplo para la pregunta 2.1.5:**
```json
{
  "regex": "^\\d+(,\\d+)*$",
  "min_chars": 0,
  "max_chars": 1000,
  "widget": "geography_cascade",
  "data_source": "/api/geography/direccion/"
}
```
**¿Cómo lo lee el frontend?** Al ver que `widget` es `"geography_cascade"`, el frontend renderiza el componente Vue/React correspondiente a los 3 selects geográficos.
