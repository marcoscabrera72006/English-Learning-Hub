/* ==========================================================================
   answer-checker.js
   Corrige las respuestas escritas y explica los errores.

   - No distingue mayúsculas ni signos de puntuación.
   - Acepta formas cortas y largas: "doesn't" = "does not", "I'm" = "I am".
   - Compara palabra por palabra para señalar qué sobra y qué falta.
   - Detecta errores típicos: "goed", "didn't went", "she work", "is runing"...
   ========================================================================== */

(function () {
  const { levenshtein, escapeHtml } = ELH.core.utils;
  const grammar = ELH.core.grammar;

  const BE_PRESENT = ['am', 'is', 'are'];
  const BE_PAST = ['was', 'were'];
  const DO_FORMS = ['do', 'does'];
  const AUXILIARIES = ['do', 'does', 'did'];

  /* ---------- Normalización ---------- */

  function cleanup(text) {
    return String(text ?? '')
      .toLowerCase()
      .replace(/[’‘`´]/g, "'")
      .replace(/[“”"¿¡]/g, '')
      .replace(/[.,!?;:/]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Contracciones escritas sin apóstrofo ("doesnt"): se aceptan, es un despiste de teclado
  const NO_APOSTROPHE = /\b(do|does|did|is|are|was|were|have|has|had|ca|could|would|should|wo)nt\b|\bim\b/g;

  function normalize(text) {
    const fixed = cleanup(text).replace(NO_APOSTROPHE, (word) => (word === 'im' ? "i'm" : `${word.slice(0, -2)}n't`));
    return grammar.expandContractions(fixed).replace(/\s+/g, ' ').trim();
  }

  function tokens(text) {
    return normalize(text).split(' ').filter(Boolean);
  }

  /** Respuestas aceptadas. En "completar", también vale escribir la frase entera. */
  function acceptedAnswers(item, inputIndex = 0) {
    if (item.inputs) return item.inputs[inputIndex].answers;
    const answers = [...(item.answers || [])];
    if (item.type === 'fill' || (item.type === 'irregular' && /_{2,}/.test(item.prompt))) {
      (item.answers || []).forEach((answer) => {
        answers.push(item.prompt.replace(/_{2,}\s*(\([^)]*\))?/, answer));
      });
    }
    return answers;
  }

  function matches(given, answers) {
    const value = normalize(given);
    if (!value) return false;
    return answers.some((answer) => normalize(answer) === value);
  }

  /**
   * Evalúa la respuesta de un ejercicio.
   * response: texto, o lista de textos si el ejercicio tiene varios campos.
   */
  function evaluate(item, response) {
    if (item.type === 'choice' || item.type === 'identify') {
      return { correct: response === item.answers[0], perInput: [response === item.answers[0]] };
    }
    if (item.inputs) {
      const values = Array.isArray(response) ? response : [response];
      const perInput = item.inputs.map((input, index) => matches(values[index] || '', input.answers));
      return { correct: perInput.every(Boolean), perInput };
    }
    const ok = matches(response, acceptedAnswers(item));
    return { correct: ok, perInput: [ok] };
  }

  /* ---------- Respuesta "más parecida" para mostrar ---------- */

  function expandForDisplay(text) {
    return text.replace(/\b[A-Za-z]+'[a-z]+\b/g, (word) => {
      const expanded = grammar.expandContractions(word.toLowerCase());
      if (expanded === word.toLowerCase()) return word;
      if (word === "I'm") return 'I am';
      return word[0] === word[0].toUpperCase() ? expanded.charAt(0).toUpperCase() + expanded.slice(1) : expanded;
    }).replace(/\bi am\b/g, 'I am');
  }

  /** Entre las respuestas válidas, elige la que más se parece a lo que has escrito. */
  function closestAnswer(given, answers) {
    const candidates = new Set();
    answers.forEach((answer) => {
      candidates.add(answer);
      candidates.add(grammar.contractText(answer));
      candidates.add(expandForDisplay(answer));
    });
    const target = cleanup(given);
    let best = answers[0];
    let bestScore = Infinity;
    candidates.forEach((candidate) => {
      const score = levenshtein(cleanup(candidate), target);
      if (score < bestScore) {
        best = candidate;
        bestScore = score;
      }
    });
    return best;
  }

  /* ---------- Comparación palabra por palabra ---------- */

  function diffOps(a, b, keyFn = (x) => x) {
    const n = a.length;
    const m = b.length;
    const table = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
    for (let i = n - 1; i >= 0; i -= 1) {
      for (let j = m - 1; j >= 0; j -= 1) {
        table[i][j] = keyFn(a[i]) === keyFn(b[j]) ? table[i + 1][j + 1] + 1 : Math.max(table[i + 1][j], table[i][j + 1]);
      }
    }
    const ops = [];
    let i = 0;
    let j = 0;
    while (i < n && j < m) {
      if (keyFn(a[i]) === keyFn(b[j])) {
        ops.push({ type: 'same', a: a[i], b: b[j] });
        i += 1;
        j += 1;
      } else if (table[i + 1][j] >= table[i][j + 1]) {
        ops.push({ type: 'del', a: a[i] });
        i += 1;
      } else {
        ops.push({ type: 'ins', b: b[j] });
        j += 1;
      }
    }
    while (i < n) ops.push({ type: 'del', a: a[i++] });
    while (j < m) ops.push({ type: 'ins', b: b[j++] });
    return ops;
  }

  /** HTML de tu respuesta (lo que sobra, tachado) y de la correcta (lo que falta, resaltado). */
  function renderDiff(given, expected) {
    const givenWords = String(given).trim().split(/\s+/).filter(Boolean);
    const expectedWords = String(expected).trim().split(/\s+/).filter(Boolean);
    const ops = diffOps(givenWords, expectedWords, (word) => cleanup(word));
    const givenHtml = [];
    const expectedHtml = [];
    ops.forEach((op) => {
      if (op.type === 'same') {
        givenHtml.push(escapeHtml(op.a));
        expectedHtml.push(escapeHtml(op.b));
      } else if (op.type === 'del') {
        givenHtml.push(`<span class="diff-extra">${escapeHtml(op.a)}</span>`);
      } else {
        expectedHtml.push(`<span class="diff-missing">${escapeHtml(op.b)}</span>`);
      }
    });
    return { givenHtml: givenHtml.join(' '), expectedHtml: expectedHtml.join(' ') };
  }

  /* ---------- Diagnóstico de errores típicos ---------- */

  let verbMaps = null;

  function getVerbMaps() {
    if (verbMaps) return verbMaps;
    verbMaps = { byPast: {}, byParticiple: {}, regularized: {} };
    ELH.data.irregularVerbs.forEach((verb) => {
      const pasts = grammar.splitForms(verb.past);
      const participles = grammar.splitForms(verb.participle);
      pasts.forEach((form) => { if (form !== verb.infinitive) verbMaps.byPast[form] = verb; });
      participles.forEach((form) => { if (form !== verb.infinitive) verbMaps.byParticiple[form] = verb; });
      const wrongPast = grammar.regularPast(verb.infinitive);
      if (!pasts.includes(wrongPast) && !participles.includes(wrongPast)) verbMaps.regularized[wrongPast] = verb;
    });
    return verbMaps;
  }

  function explainSubstitution(wrong, right, expected) {
    const maps = getVerbMaps();
    const regularized = maps.regularized[wrong];
    if (regularized) {
      const inPast = grammar.splitForms(regularized.past).includes(right);
      const inParticiple = grammar.splitForms(regularized.participle).includes(right);
      const which = inPast && inParticiple
        ? `su pasado y su participio son "${right}"`
        : inParticiple ? `su participio es "${regularized.participle}"` : `su pasado es "${regularized.past}"`;
      return `"${regularized.infinitive}" es un verbo irregular: ${which}, no "${wrong}". Repásalo en la lista de verbos irregulares.`;
    }

    const byParticiple = maps.byParticiple[wrong];
    if (byParticiple && grammar.splitForms(byParticiple.past).includes(right)) {
      return `"${wrong}" es el participio (3.ª columna). En Past Simple se usa la 2.ª columna: "${right}".`;
    }

    const byPast = maps.byPast[wrong];
    if (expected.includes('did') && ((byPast && byPast.infinitive === right) || grammar.regularPast(right) === wrong)) {
      return `Después de did / didn't el verbo va en infinitivo: "${right}", no "${wrong}".`;
    }

    if (grammar.thirdPerson(right) === wrong && expected.includes('does')) {
      return `Con does / doesn't el verbo va sin -s: "${right}".`;
    }

    if (grammar.thirdPerson(wrong) === right) {
      return `Con he, she o it el verbo lleva -s: "${right}".`;
    }

    if (BE_PRESENT.includes(wrong) && BE_PRESENT.includes(right)) {
      return `Revisa el verbo to be: aquí va "${right}" (I → am; he / she / it → is; you / we / they → are).`;
    }

    if (BE_PAST.includes(wrong) && BE_PAST.includes(right)) {
      return `Revisa was / were: I, he, she, it → was; you, we, they → were. Aquí va "${right}".`;
    }

    if (DO_FORMS.includes(wrong) && DO_FORMS.includes(right)) {
      return `El auxiliar correcto es "${right}": does con he, she, it; do con I, you, we, they.`;
    }

    if (right.endsWith('ing') && grammar.ingForm(wrong) === right) {
      return `Después de am / is / are el verbo lleva -ing: "${right}".`;
    }

    if (right.endsWith('ing') && wrong.endsWith('ing')) {
      return `Revisa la ortografía de la forma -ing: se escribe "${right}".`;
    }

    const pastOfRight = maps.byPast[right];
    if ((pastOfRight && pastOfRight.infinitive === wrong) || grammar.regularPast(wrong) === right) {
      return `Hace falta el verbo en pasado: "${wrong}" → "${right}".`;
    }

    if (/(ed|ied)$/.test(right) && levenshtein(wrong, right) <= 2) {
      return `Revisa cómo se escribe el pasado: "${right}".`;
    }

    if (levenshtein(wrong, right) <= 2 && right.length > 3) {
      return `¡Casi! Revisa la ortografía: se escribe "${right}".`;
    }

    return `Has escrito "${wrong}" donde va "${right}".`;
  }

  function explainMissing(word, expected) {
    if (BE_PRESENT.includes(word) && expected.some((t) => t.endsWith('ing'))) {
      return `Falta el verbo to be ("${word}") delante del verbo con -ing.`;
    }
    if (AUXILIARIES.includes(word)) {
      return `Falta el auxiliar "${word}". Las preguntas y las negativas lo necesitan.`;
    }
    if (word === 'not') return 'Falta "not": la frase tiene que ser negativa.';
    return `Te falta la palabra "${word}".`;
  }

  function explainExtra(word, expected) {
    if (AUXILIARIES.includes(word) && expected.some((t) => [...BE_PRESENT, ...BE_PAST].includes(t))) {
      return `Sobra "${word}": con el verbo to be (y en el Present Continuous) no se usa do, does ni did.`;
    }
    if (BE_PRESENT.includes(word) && !expected.some((t) => t.endsWith('ing'))) {
      return `Sobra "${word}": en esta frase no hace falta el verbo to be.`;
    }
    return `Sobra la palabra "${word}".`;
  }

  /** Devuelve una lista corta (máx. 3) de pistas sobre lo que ha fallado. */
  function diagnose(item, given, expected) {
    const tips = [];
    const add = (tip) => { if (tip && !tips.includes(tip)) tips.push(tip); };

    Object.entries(item.traps || {}).forEach(([wrong, message]) => {
      if (normalize(wrong) === normalize(given)) add(message);
    });

    const g = tokens(given);
    const e = tokens(expected);
    if (!g.length) return tips;

    const sameWords = g.length === e.length && [...g].sort().join(' ') === [...e].sort().join(' ');
    if (sameWords && g.join(' ') !== e.join(' ')) {
      add('Tienes todas las palabras, pero en otro orden. Recuerda: en las preguntas el auxiliar (do, does, did, am, is, are, was, were) va delante del sujeto.');
      return tips.slice(0, 3);
    }

    const substitutions = [];
    const extras = [];
    const missing = [];
    let deleted = [];
    let inserted = [];
    const flush = () => {
      const pairs = Math.min(deleted.length, inserted.length);
      for (let i = 0; i < pairs; i += 1) substitutions.push([deleted[i], inserted[i]]);
      extras.push(...deleted.slice(pairs));
      missing.push(...inserted.slice(pairs));
      deleted = [];
      inserted = [];
    };

    diffOps(g, e).forEach((op) => {
      if (op.type === 'same') flush();
      else if (op.type === 'del') deleted.push(op.a);
      else inserted.push(op.b);
    });
    flush();

    // Una palabra que "falta" y "sobra" a la vez está, en realidad, mal colocada
    const moved = missing.filter((word) => extras.includes(word));
    moved.forEach((word) => add(word === 'not'
      ? '"Not" va justo detrás del auxiliar o del verbo to be: was not, is not, does not, did not.'
      : `La palabra "${word}" está en el lugar equivocado de la frase.`));

    substitutions.forEach(([wrong, right]) => add(explainSubstitution(wrong, right, e)));
    missing.filter((word) => !moved.includes(word)).forEach((word) => add(explainMissing(word, e)));
    extras.filter((word) => !moved.includes(word)).forEach((word) => add(explainExtra(word, e)));

    return tips.slice(0, 3);
  }

  ELH.core.answers = {
    cleanup,
    normalize,
    acceptedAnswers,
    matches,
    evaluate,
    closestAnswer,
    renderDiff,
    diagnose,
  };
})();
