/* ==========================================================================
   exercise-bank.js
   Reúne todos los ejercicios de las lecciones, genera ejercicios de verbos
   irregulares a partir de la lista de 82 verbos y elige qué preguntas
   mostrar en cada sesión, dando prioridad a lo que todavía no dominas.
   ========================================================================== */

(function () {
  const { shuffle, plainText } = ELH.core.utils;
  const grammar = ELH.core.grammar;

  const TYPES = {
    fill: { label: 'Completar frases', icon: 'pencil', description: 'Escribe la forma verbal correcta en el hueco.', instruction: 'Completa el hueco con la forma correcta del verbo.' },
    choice: { label: 'Elegir la respuesta', icon: 'list', description: 'Escoge la opción correcta entre varias.', instruction: 'Elige la respuesta correcta.' },
    negative: { label: 'Pasar a negativa', icon: 'minusCircle', description: 'Transforma frases afirmativas en negativas.', instruction: 'Escribe la frase en forma negativa.' },
    question: { label: 'Pasar a pregunta', icon: 'help', description: 'Convierte frases afirmativas en preguntas.', instruction: 'Convierte la frase en una pregunta.' },
    translate: { label: 'Traducir al inglés', icon: 'translate', description: 'Traduce frases del español al inglés.', instruction: 'Traduce la frase al inglés.' },
    identify: { label: 'Identificar el tiempo verbal', icon: 'search', description: 'Reconoce qué tiempo verbal se usa en una frase.', instruction: '¿Qué tiempo verbal se usa en esta frase?' },
    irregular: { label: 'Completar verbos irregulares', icon: 'layers', description: 'Pasado y participio de los 82 verbos irregulares.', instruction: 'Escribe la forma correcta del verbo irregular.' },
    correct: { label: 'Corregir errores', icon: 'flag', description: 'Encuentra el error de la frase y corrígelo.', instruction: 'Esta frase tiene un error. Escríbela correctamente.' },
  };

  const LEVELS = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };

  function tenseById(id) {
    return ELH.data.tenses.find((tense) => tense.id === id) || null;
  }

  /** Ejercicios escritos en las lecciones (incluidas las preguntas de las comparaciones). */
  function lessonItems() {
    const items = [];
    ELH.data.tenses.forEach((tense) => {
      tense.exercises.forEach((exercise) => items.push(exercise));
      tense.comparisons.forEach((comparison) => {
        if (!tenseById(comparison.with)) return;
        (comparison.quiz || []).forEach((exercise) => items.push({ ...exercise, tense: tense.id }));
      });
    });
    // Identificar el tiempo verbal solo tiene sentido si hay al menos dos tiempos
    return ELH.data.tenses.length > 1 ? items : items.filter((item) => item.type !== 'identify');
  }

  function studiedTenseIds() {
    const lessons = ELH.store.get().lessons;
    return ELH.data.tenses.filter((tense) => lessons[tense.id]?.studied).map((tense) => tense.id);
  }

  /* ---------- Ejercicios generados de verbos irregulares ---------- */

  function acceptedForms(verb, column) {
    const forms = grammar.splitForms(verb[column]);
    const extra = verb.alsoAccepted?.[column] || [];
    const list = [...forms, ...extra];
    if (forms.length > 1) list.push(forms.join(' / '), forms.join(', '));
    return list;
  }

  function skillFor(column) {
    if (column === 'participle') return 'past-participle';
    return ELH.data.skills['past-irregular'] ? 'past-irregular' : 'irregular-forms';
  }

  function summaryOf(verb) {
    const participle = verb.participle || '(no tiene participio)';
    return `${verb.infinitive} → ${verb.past} → ${participle}: ${verb.meaning}.`;
  }

  /**
   * Crea un ejercicio de un verbo. kind:
   *   'choice' → elegir el Past Simple entre 3 opciones (principiante)
   *   'past'   → escribir el Past Simple (intermedio)
   *   'part'   → escribir el Past Participle (intermedio)
   *   'both'   → escribir las dos formas (avanzado)
   */
  function generateIrregular(verb, kind) {
    if (!verb.participle && (kind === 'part' || kind === 'both')) kind = 'past';
    const base = {
      id: `irr-${kind}-${verb.infinitive}`,
      type: 'irregular',
      verb: verb.infinitive,
      tense: null,
      generated: true,
    };

    if (kind === 'choice') {
      const correct = grammar.splitForms(verb.past)[0];
      const accepted = acceptedForms(verb, 'past');
      const distractors = new Set();
      const regular = grammar.regularPast(verb.infinitive);
      const isModalOrBe = verb.infinitive === 'be' || verb.infinitive === 'can';
      if (!isModalOrBe && !accepted.includes(regular)) distractors.add(regular);
      grammar.splitForms(verb.participle).forEach((form) => { if (!accepted.includes(form)) distractors.add(form); });
      shuffle(ELH.data.irregularVerbs).forEach((other) => {
        if (distractors.size >= 3 || other.infinitive === verb.infinitive) return;
        const form = grammar.splitForms(other.past)[0];
        if (!accepted.includes(form)) distractors.add(form);
      });
      const options = shuffle([correct, ...Array.from(distractors).slice(0, 2)]);
      return {
        ...base,
        level: 'beginner',
        prompt: `¿Cuál es el Past Simple de **${verb.infinitive}** (${verb.meaning})?`,
        instruction: 'Elige la forma correcta.',
        options,
        answers: [correct],
        presentation: 'choice',
        explanation: summaryOf(verb),
        skill: skillFor('past'),
      };
    }

    if (kind === 'both') {
      return {
        ...base,
        level: 'advanced',
        prompt: `**${verb.infinitive}** (${verb.meaning})`,
        instruction: 'Escribe el Past Simple y el Past Participle.',
        inputs: [
          { label: 'Past Simple', answers: acceptedForms(verb, 'past'), primary: grammar.splitForms(verb.past) },
          { label: 'Past Participle', answers: acceptedForms(verb, 'participle'), primary: grammar.splitForms(verb.participle) },
        ],
        answers: [verb.past, verb.participle],
        explanation: summaryOf(verb),
        skill: skillFor('participle'),
      };
    }

    const column = kind === 'part' ? 'participle' : 'past';
    const columnLabel = kind === 'part' ? 'Past Participle' : 'Past Simple';
    return {
      ...base,
      level: 'intermediate',
      prompt: `${columnLabel} de **${verb.infinitive}** (${verb.meaning})`,
      instruction: `Escribe el ${columnLabel}.`,
      answers: acceptedForms(verb, column),
      primary: grammar.splitForms(verb[column]),
      explanation: summaryOf(verb),
      skill: skillFor(column),
    };
  }

  function kindForLevel(level, verb) {
    if (level === 'beginner') return 'choice';
    if (level === 'advanced') return 'both';
    if (level === 'intermediate') return Math.random() < 0.5 ? 'past' : 'part';
    // Nivel mezclado: según lo bien que conozcas el verbo
    const state = ELH.store.verbState(verb.infinitive);
    if (state.learned) return 'both';
    if (state.seen === 0 && state.practiceRight === 0) return 'choice';
    return Math.random() < 0.5 ? 'past' : 'part';
  }

  function irregularCandidates(level, studiedOnly) {
    let verbs = ELH.data.irregularVerbs;
    if (studiedOnly) {
      const state = ELH.store.get();
      const studied = verbs.filter((verb) => state.verbs[verb.infinitive]?.seen || state.verbs[verb.infinitive]?.learned);
      if (studied.length >= 6) verbs = studied;
    }
    return verbs.map((verb) => generateIrregular(verb, kindForLevel(level, verb)));
  }

  /** Recupera un ejercicio por su id (incluidos los generados, "irr-past-go"). */
  function findById(id) {
    const generated = /^irr-(choice|past|part|both)-(.+)$/.exec(id);
    if (generated) {
      const verb = ELH.data.irregularVerbs.find((item) => item.infinitive === generated[2]);
      return verb ? generateIrregular(verb, generated[1]) : null;
    }
    for (const tense of ELH.data.tenses) {
      const found = tense.exercises.find((item) => item.id === id)
        || tense.comparisons.flatMap((c) => c.quiz || []).map((item) => ({ ...item, tense: tense.id })).find((item) => item.id === id)
        || (tense.what.quickCheck || []).map((item) => ({ ...item, tense: tense.id })).find((item) => item.id === id);
      if (found) return found;
    }
    return null;
  }

  /* ---------- Selección adaptativa ---------- */

  function itemWeight(item) {
    const state = ELH.store.get();
    if (item.generated) {
      const verb = ELH.store.verbState(item.verb);
      if (verb.practiceWrong > verb.practiceRight) return 4;
      if (verb.learned) return 0.7;
      return 2;
    }
    const record = state.exercises.byId[item.id];
    if (!record) return 3;          // nunca hecho
    if (!record.lastCorrect) return 4; // fallado la última vez
    if (record.correct >= 2) return 0.6; // ya dominado
    return 1.5;
  }

  function weightedSample(items, count) {
    const pool = items.map((item) => ({ item, weight: itemWeight(item) }));
    const chosen = [];
    while (chosen.length < count && pool.length) {
      const total = pool.reduce((sum, entry) => sum + entry.weight, 0);
      let target = Math.random() * total;
      let index = 0;
      for (; index < pool.length - 1; index += 1) {
        target -= pool[index].weight;
        if (target <= 0) break;
      }
      chosen.push(pool[index].item);
      pool.splice(index, 1);
    }
    return chosen;
  }

  /**
   * Ejercicios disponibles según los filtros.
   * options: { types: [], level: 'all' | ..., tense: 'all' | id, studiedOnly: bool }
   */
  function pool({ types = Object.keys(TYPES), level = 'all', tense = 'all', studiedOnly = false } = {}) {
    const studied = studiedTenseIds();
    let items = lessonItems();
    if (tense !== 'all') items = items.filter((item) => item.tense === tense);
    if (studiedOnly && studied.length) items = items.filter((item) => studied.includes(item.tense));
    items = items.filter((item) => types.includes(item.type) && (level === 'all' || item.level === level));

    const includeGenerated = types.includes('irregular') && (tense === 'all' || tense === 'past-simple');
    const generated = includeGenerated ? irregularCandidates(level, studiedOnly) : [];
    return { items, generated };
  }

  function countAvailable(options) {
    const { items, generated } = pool(options);
    return items.length + generated.length;
  }

  /** Elige las preguntas de una sesión. */
  function pickSession(options = {}) {
    const count = options.count || 10;
    const { items, generated } = pool(options);
    const types = options.types || Object.keys(TYPES);
    const onlyIrregular = types.length === 1 && types[0] === 'irregular';

    let generatedCount = 0;
    if (generated.length) {
      generatedCount = onlyIrregular ? count : Math.max(2, Math.round(count / types.length));
      generatedCount = Math.min(generatedCount, generated.length);
    }
    const fromLessons = weightedSample(items, count - generatedCount);
    const missing = count - fromLessons.length - generatedCount;
    const fromVerbs = weightedSample(generated, generatedCount + Math.max(0, missing));
    return shuffle([...fromLessons, ...fromVerbs]).slice(0, count);
  }

  /** Ejercicios que fallaste y todavía no has vuelto a acertar. */
  function reviewItems() {
    const ids = ELH.store.get().exercises.pendingReview;
    return ids.map(findById).filter(Boolean);
  }

  /** Texto de la respuesta correcta para mostrar. */
  function displayAnswer(item) {
    if (item.type === 'identify') return tenseById(item.answers[0])?.name || item.answers[0];
    if (item.inputs) return item.inputs.map((input) => `${input.label}: ${input.answers[0]}`).join(' · ');
    return plainText(item.answers[0]);
  }

  ELH.core.exercises = {
    TYPES,
    LEVELS,
    tenseById,
    lessonItems,
    studiedTenseIds,
    generateIrregular,
    findById,
    pool,
    countAvailable,
    pickSession,
    reviewItems,
    displayAnswer,
    weightedSample,
  };
})();
