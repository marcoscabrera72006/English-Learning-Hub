/* ==========================================================================
   storage.js
   Guarda y lee todo el progreso en localStorage (en tu navegador).
   No hay cuentas ni servidores: los datos se quedan en este ordenador.

   Uso:
     ELH.store.get()                  → estado actual
     ELH.store.update((state) => {})  → modifica el estado, lo guarda y avisa
     ELH.store.subscribe(fn)          → ejecuta fn cada vez que algo cambia
   ========================================================================== */

(function () {
  const STORAGE_KEY = 'elh.progress.v1';
  const { dayKey, DAY_MS } = ELH.core.utils;

  // Repetición espaciada de verbos (sistema de cajas de Leitner):
  // caja → días que pasan hasta el siguiente repaso
  const REVIEW_INTERVAL_DAYS = [0, 1, 2, 4, 7, 15];
  const LEARNED_BOX = 3; // al llegar a esta caja el verbo se marca como aprendido
  const MAX_ACTIVITY = 60;
  const MAX_MISTAKES = 60;

  const listeners = new Set();
  let available = true;

  function createDefaultState() {
    return {
      version: 1,
      createdAt: Date.now(),
      profile: {
        name: '',
        theme: 'system',
        dailyGoal: 20,
        showTranslations: true,
        voice: 'en-GB',
      },
      lessons: {},
      verbs: {},
      exercises: {
        attempts: 0,
        correct: 0,
        byId: {},
        byType: {},
        byLevel: {},
        byTense: {},
        skills: {},
        pendingReview: [],
      },
      mistakes: [],
      favorites: { verbs: [], lessons: [], examples: [] },
      activity: [],
      daily: {},
      lastLocation: null,
    };
  }

  function isPlainObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /** Mezcla lo guardado con los valores por defecto (por si en el futuro se añaden campos). */
  function merge(base, saved) {
    const result = { ...base };
    Object.keys(saved || {}).forEach((key) => {
      if (isPlainObject(base[key]) && isPlainObject(saved[key])) {
        result[key] = merge(base[key], saved[key]);
      } else {
        result[key] = saved[key];
      }
    });
    return result;
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? merge(createDefaultState(), JSON.parse(raw)) : createDefaultState();
    } catch (error) {
      available = false;
      console.warn('[ELH] No se pudo leer el progreso guardado.', error);
      return createDefaultState();
    }
  }

  let state = load();

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      available = true;
    } catch (error) {
      available = false;
      console.warn('[ELH] No se pudo guardar el progreso.', error);
    }
  }

  function notify() {
    listeners.forEach((listener) => listener(state));
  }

  function get() {
    return state;
  }

  function update(mutator) {
    mutator(state);
    persist();
    notify();
  }

  function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  }

  /* ---------- Actividad diaria y registro ---------- */

  function addDailyPoints(target, amount = 1) {
    const key = dayKey();
    target.daily[key] = (target.daily[key] || 0) + amount;
  }

  function addActivity(target, entry) {
    target.activity.unshift({ ...entry, ts: Date.now() });
    target.activity = target.activity.slice(0, MAX_ACTIVITY);
  }

  function logActivity(entry) {
    update((s) => addActivity(s, entry));
  }

  function setLastLocation(route, label) {
    state.lastLocation = { route, label, ts: Date.now() };
    persist();
  }

  function todayPoints() {
    return state.daily[dayKey()] || 0;
  }

  /** Días seguidos con actividad (cuenta hoy si ya has estudiado, o desde ayer). */
  function streak() {
    let count = 0;
    const cursor = new Date();
    if (!state.daily[dayKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
    while (state.daily[dayKey(cursor)]) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  /** Actividad de los últimos N días, del más antiguo al más reciente. */
  function lastDays(count) {
    const days = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() - (count - 1));
    for (let i = 0; i < count; i += 1) {
      const key = dayKey(cursor);
      days.push({ key, date: new Date(cursor), value: state.daily[key] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    return days;
  }

  /* ---------- Lecciones ---------- */

  function lessonState(tenseId) {
    return state.lessons[tenseId] || { sections: {}, studied: false };
  }

  /** Marca un apartado como leído. Devuelve true si con él se completa la lección. */
  function markSectionRead(tenseId, sectionId, totalSections) {
    let completedNow = false;
    update((s) => {
      const lesson = s.lessons[tenseId] || { sections: {}, studied: false };
      lesson.sections = lesson.sections || {};
      if (!lesson.sections[sectionId]) lesson.sections[sectionId] = Date.now();
      lesson.lastSection = sectionId;
      lesson.lastVisit = Date.now();
      if (!lesson.studied && Object.keys(lesson.sections).length >= totalSections) {
        lesson.studied = true;
        lesson.studiedAt = Date.now();
        completedNow = true;
      }
      s.lessons[tenseId] = lesson;
    });
    return completedNow;
  }

  function setLessonStudied(tenseId, studied) {
    update((s) => {
      const lesson = s.lessons[tenseId] || { sections: {}, studied: false };
      lesson.studied = studied;
      lesson.studiedAt = studied ? Date.now() : null;
      s.lessons[tenseId] = lesson;
    });
  }

  /* ---------- Favoritos ---------- */

  function isFavorite(kind, id) {
    return (state.favorites[kind] || []).includes(id);
  }

  function toggleFavorite(kind, id) {
    let nowFavorite = false;
    update((s) => {
      const list = s.favorites[kind] || [];
      if (list.includes(id)) {
        s.favorites[kind] = list.filter((item) => item !== id);
      } else {
        s.favorites[kind] = [...list, id];
        nowFavorite = true;
      }
    });
    return nowFavorite;
  }

  /* ---------- Verbos irregulares ---------- */

  function verbState(infinitive) {
    return {
      box: 0,
      learned: false,
      due: 0,
      seen: 0,
      right: 0,
      hard: 0,
      wrong: 0,
      practiceRight: 0,
      practiceWrong: 0,
      ...(state.verbs[infinitive] || {}),
    };
  }

  /**
   * Valora un repaso con tarjetas:
   *   'again' → no lo sabía · 'hard' → dudé · 'good' → lo sabía
   * Devuelve si el verbo se acaba de aprender o se ha "olvidado".
   */
  function rateVerb(infinitive, rating) {
    const result = { learnedNow: false, forgotten: false };
    update((s) => {
      const verb = verbState(infinitive);
      const now = Date.now();
      verb.seen += 1;
      verb.lastReview = now;

      if (rating === 'again') {
        if (verb.learned) result.forgotten = true;
        verb.wrong += 1;
        verb.box = 1;
        verb.learned = false;
        verb.due = now;
      } else if (rating === 'hard') {
        verb.hard += 1;
        verb.box = Math.max(1, verb.box);
        verb.due = now + DAY_MS;
      } else {
        verb.right += 1;
        verb.box = Math.min(REVIEW_INTERVAL_DAYS.length - 1, verb.box + 1);
        verb.due = now + REVIEW_INTERVAL_DAYS[verb.box] * DAY_MS;
        if (!verb.learned && verb.box >= LEARNED_BOX) {
          verb.learned = true;
          verb.learnedAt = now;
          result.learnedNow = true;
        }
      }

      s.verbs[infinitive] = verb;
      addDailyPoints(s);
    });
    return result;
  }

  function setVerbLearned(infinitive, learned) {
    update((s) => {
      const verb = verbState(infinitive);
      verb.learned = learned;
      if (learned) {
        verb.box = Math.max(verb.box, LEARNED_BOX);
        verb.learnedAt = Date.now();
        verb.due = Date.now() + REVIEW_INTERVAL_DAYS[verb.box] * DAY_MS;
      } else {
        verb.box = Math.min(verb.box, 1);
        verb.due = Date.now();
      }
      s.verbs[infinitive] = verb;
    });
  }

  function isVerbDue(infinitive, now = Date.now()) {
    const verb = state.verbs[infinitive];
    return Boolean(verb && verb.seen > 0 && verb.due <= now);
  }

  /* ---------- Ejercicios ---------- */

  function bump(collection, key, correct) {
    if (!key) return;
    const entry = collection[key] || { done: 0, correct: 0 };
    entry.done += 1;
    if (correct) entry.correct += 1;
    collection[key] = entry;
  }

  /** Guarda el resultado de una respuesta. */
  function recordAnswer(item, { correct, given, expected }) {
    update((s) => {
      const ex = s.exercises;
      ex.attempts += 1;
      if (correct) ex.correct += 1;

      const record = ex.byId[item.id] || { tries: 0, correct: 0 };
      record.tries += 1;
      if (correct) record.correct += 1;
      record.lastCorrect = correct;
      record.ts = Date.now();
      ex.byId[item.id] = record;

      bump(ex.byType, item.type, correct);
      bump(ex.byLevel, item.level, correct);
      bump(ex.byTense, item.tense || 'irregular-verbs', correct);

      if (item.verb) {
        const verb = verbState(item.verb);
        if (correct) verb.practiceRight += 1;
        else verb.practiceWrong += 1;
        s.verbs[item.verb] = verb;
      }

      if (correct) {
        ex.pendingReview = ex.pendingReview.filter((id) => id !== item.id);
      } else {
        if (item.skill) ex.skills[item.skill] = (ex.skills[item.skill] || 0) + 1;
        if (!ex.pendingReview.includes(item.id)) ex.pendingReview.push(item.id);
        s.mistakes.unshift({
          id: item.id,
          type: item.type,
          tense: item.tense || null,
          skill: item.skill || null,
          prompt: item.prompt,
          given,
          expected,
          ts: Date.now(),
        });
        s.mistakes = s.mistakes.slice(0, MAX_MISTAKES);
      }

      addDailyPoints(s);
    });
  }

  /* ---------- Ajustes, copia de seguridad y reinicio ---------- */

  function setProfile(changes) {
    update((s) => Object.assign(s.profile, changes));
  }

  function exportData() {
    return JSON.stringify({ app: 'english-learning-hub', exportedAt: new Date().toISOString(), ...state }, null, 2);
  }

  function importData(text) {
    const parsed = JSON.parse(text);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.exercises) || !isPlainObject(parsed.profile)) {
      throw new Error('El archivo no parece una copia de seguridad de English Learning Hub.');
    }
    delete parsed.app;
    delete parsed.exportedAt;
    state = merge(createDefaultState(), parsed);
    persist();
    notify();
  }

  /** Borra una parte del progreso: 'verbs' | 'exercises' | 'lessons' | 'all'. */
  function reset(scope) {
    const fresh = createDefaultState();
    update((s) => {
      if (scope === 'all') {
        const profile = s.profile;
        Object.keys(s).forEach((key) => delete s[key]);
        Object.assign(s, fresh, { profile });
        return;
      }
      if (scope === 'verbs') {
        s.verbs = {};
        s.favorites.verbs = [];
      }
      if (scope === 'exercises') {
        s.exercises = fresh.exercises;
        s.mistakes = [];
      }
      if (scope === 'lessons') {
        s.lessons = {};
      }
    });
  }

  ELH.store = {
    REVIEW_INTERVAL_DAYS,
    LEARNED_BOX,
    get,
    update,
    subscribe,
    isAvailable: () => available,
    logActivity,
    setLastLocation,
    todayPoints,
    streak,
    lastDays,
    lessonState,
    markSectionRead,
    setLessonStudied,
    isFavorite,
    toggleFavorite,
    verbState,
    rateVerb,
    setVerbLearned,
    isVerbDue,
    recordAnswer,
    setProfile,
    exportData,
    importData,
    reset,
  };
})();
