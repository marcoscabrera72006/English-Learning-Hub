/* ==========================================================================
   skills.js
   Categorías de error generales (no pertenecen a un solo tiempo verbal).
   Cada ejercicio puede indicar en "skill" a qué categoría pertenece; así la
   sección "Mi progreso" muestra cuáles son tus errores más frecuentes.

   Las categorías propias de cada tiempo verbal se definen en su archivo de
   data/tenses/ (campo "skills").
   ========================================================================== */

Object.assign(ELH.data.skills, {
  'question-order': {
    label: 'Orden de las palabras en las preguntas',
    tip: 'En inglés el auxiliar (do, does, did, am, is, are, was, were) va delante del sujeto.',
  },
  'tense-choice': {
    label: 'Elegir el tiempo verbal adecuado',
    tip: 'Fíjate en las palabras clave: every day, now, yesterday...',
  },
  'past-participle': {
    label: 'Participio pasado de los verbos irregulares',
    tip: 'Es la tercera columna de la lista de verbos irregulares.',
    route: '#/verbs',
  },
  'irregular-forms': {
    label: 'Formas de los verbos irregulares',
    tip: 'Repasa la lista con las tarjetas de estudio.',
    route: '#/verbs/flashcards',
  },
  vocabulary: {
    label: 'Vocabulario y traducción',
    tip: 'Lee la frase completa antes de traducir y busca primero el verbo.',
  },
});
