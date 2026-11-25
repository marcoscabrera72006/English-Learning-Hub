# Cómo añadir lecciones y modificar verbos

El contenido está separado del diseño. Para añadir un tiempo verbal **no hace falta tocar el código de las páginas**: solo hay que crear su archivo de datos.

## Añadir un tiempo verbal nuevo (por ejemplo, Past Continuous)

1. **Copia una lección existente.** Duplica `data/tenses/past-simple.js` y llámala `data/tenses/past-continuous.js`.
2. **Cambia los datos básicos** al principio del archivo:
   - `id`: identificador único sin espacios (`'past-continuous'`). Se usa en la dirección: `#/grammar/past-continuous`.
   - `order`: posición en el menú (4, 5...).
   - `name`, `nameEs`, `level`, `icon`, `summary`, `formulaShort`.
   - `timeline.type`: el esquema de la línea del tiempo. Opciones: `repeated`, `now-ongoing`, `past-point`, `past-ongoing`, `past-to-now`, `future-point`.
3. **Rellena los 8 apartados** (todos los campos que no uses pueden quedar como lista vacía `[]`):

   | Campo | Apartado |
   |---|---|
   | `what` | 1. ¿Qué es? (`intro`, `keyIdea`, `spanish`, `examples`, `quickCheck`) |
   | `uses` | 2. ¿Cuándo se utiliza? |
   | `structure` | 3. Estructura (afirmativa, negativa, pregunta, casos especiales, ortografía, notas, respuestas cortas, preguntas Wh-) |
   | `examples` | 4. Ejemplos (`form`: `affirmative`, `negative` o `question`) |
   | `keywords` | 5. Palabras clave |
   | `mistakes` | 6. Errores frecuentes |
   | `comparisons` | 7. Comparación con otros tiempos (`with`: id del otro tiempo) |
   | `exercises` | 8. Ejercicios |

4. **Plantillas de frases.** En `structure.forms.<forma>.template` se escribe cómo se construye la frase con estas piezas:
   `{subject} {base} {s} {ing} {past} {participle} {do} {be} {was} {have} {complement} {time}`.
   Si la pieza empieza en mayúscula (`{Was}`), sale en mayúscula. Ejemplo para Past Continuous:
   `'{subject} {was} {ing} {complement} {time}.'` y en pregunta `'{Was} {subject} {ing} {complement} {time}?'`.
   Con eso funcionan solos el constructor de frases, la tabla de conjugación y la frase del día.
5. **Ejercicios.** Cada ejercicio necesita un `id` único, `type` (`fill`, `choice`, `negative`, `question`, `translate`, `identify`, `irregular`, `correct`), `level` (`beginner`, `intermediate`, `advanced`), `prompt`, `answers` (la primera es la que se muestra; añade otras respuestas válidas si las hay), `explanation` y `skill`. Los de tipo `choice` llevan además `options`. En los de tipo `identify`, la respuesta es el `id` del tiempo verbal.
6. **Añade el archivo a `index.html`**, en el bloque marcado como `TIEMPOS VERBALES`:
   ```html
   <script src="data/tenses/past-continuous.js"></script>
   ```
7. **Recarga la página.** La lección aparece sola en el menú, en Gramática, en el buscador, en Práctica, en el progreso y en la pregunta "Identificar el tiempo verbal". Las comparaciones se muestran en las dos lecciones (se dan la vuelta solas).

Si algo falla, la página muestra un aviso: abre la consola del navegador (F12) y revisa que no falte una coma o una comilla en el archivo.

## Modificar los verbos irregulares

Están en `data/irregular-verbs.js`, uno por línea:

```js
{ n: 31, infinitive: 'go', past: 'went', participle: 'gone', meaning: 'ir' },
```

- Para corregir una forma o una traducción, cambia el texto entre comillas.
- Si un verbo tiene dos formas, escríbelas como en la lista: `'burnt, burned'`. Los ejercicios aceptan cualquiera de las dos.
- Si no tiene participio (como `can`), usa `participle: null`.
- `alsoAccepted` (opcional) añade respuestas válidas en los ejercicios sin mostrarlas en la tabla. Ejemplo: `alsoAccepted: { participle: ['gotten'] }`.
- Para añadir un verbo nuevo, añade una línea con el siguiente número `n`.

## Tu nombre y tu GitHub

Edita `data/site-config.js` y rellena `author.name`, `author.githubUser` y, si quieres, `author.bio`. Aparecerán en "Acerca del proyecto".
