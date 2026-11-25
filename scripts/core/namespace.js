/* ==========================================================================
   namespace.js
   Crea el objeto global ELH ("English Learning Hub") donde se guardan los
   contenidos, el núcleo, los componentes y las páginas. Se carga el primero.
   ========================================================================== */

window.ELH = {
  data: {
    config: {},
    skills: {},
    irregularVerbs: [],
    tenses: [],
  },
  core: {},
  components: {},
  pages: {},
};

/**
 * Registra un tiempo verbal. Cada archivo de data/tenses/ llama a esta función.
 * Comprueba los campos mínimos para avisar en la consola si falta algo.
 */
ELH.registerTense = function registerTense(tense) {
  const required = ['id', 'name', 'nameEs', 'summary', 'what', 'uses', 'structure', 'examples'];
  const missing = required.filter((key) => tense[key] === undefined);

  if (missing.length) {
    console.error(`[ELH] El tiempo verbal "${tense.id || '(sin id)'}" no se ha cargado. Faltan los campos: ${missing.join(', ')}.`);
    return;
  }

  if (ELH.data.tenses.some((item) => item.id === tense.id)) {
    console.error(`[ELH] Ya existe un tiempo verbal con el id "${tense.id}". Cambia el id en su archivo.`);
    return;
  }

  // Valores por defecto para los apartados opcionales
  tense.keywords = tense.keywords || [];
  tense.mistakes = tense.mistakes || [];
  tense.comparisons = tense.comparisons || [];
  tense.exercises = (tense.exercises || []).map((exercise) => ({ ...exercise, tense: tense.id }));

  // Las categorías de error propias del tiempo verbal se añaden al listado general
  Object.entries(tense.skills || {}).forEach(([key, skill]) => {
    ELH.data.skills[key] = { tense: tense.id, ...skill };
  });

  ELH.data.tenses.push(tense);
  ELH.data.tenses.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
};
