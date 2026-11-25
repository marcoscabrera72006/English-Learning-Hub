/* ==========================================================================
   dashboard.js — Página de inicio
   Bienvenida, progreso general, estadísticas, objetivo diario, frase del día,
   verbo del día, lecciones y última actividad.
   ========================================================================== */

(function () {
  const { escapeHtml, percent, pickOfTheDay, timeAgo, plural, dayKey } = ELH.core.utils;
  const icon = ELH.core.icon;
  const grammar = ELH.core.grammar;

  const WEEKDAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
  const WEEKDAY_NAMES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const FORM_NAMES = { affirmative: 'afirmativa', negative: 'negativa', question: 'pregunta' };

  function greeting() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Buenos días';
    if (hour >= 14 && hour < 21) return 'Buenas tardes';
    return 'Buenas noches';
  }

  /** Cifras generales que usan el inicio y "Mi progreso". */
  function overview() {
    const state = ELH.store.get();
    const tenses = ELH.data.tenses;
    const verbs = ELH.data.irregularVerbs;
    const lessonStats = tenses.map((tense) => ELH.ui.lessonProgress(tense.id));
    const studied = lessonStats.filter((lesson) => lesson.studied).length;
    const grammarPercent = lessonStats.length
      ? Math.round(lessonStats.reduce((sum, lesson) => sum + (lesson.studied ? 100 : lesson.percent), 0) / lessonStats.length)
      : 0;
    const learnedVerbs = verbs.filter((verb) => state.verbs[verb.infinitive]?.learned).length;
    const items = ELH.core.exercises.lessonItems();
    const mastered = items.filter((item) => state.exercises.byId[item.id]?.correct > 0).length;
    const exercisesPercent = percent(mastered, items.length);
    const verbsPercent = percent(learnedVerbs, verbs.length);
    return {
      studied,
      totalTenses: tenses.length,
      grammarPercent,
      learnedVerbs,
      totalVerbs: verbs.length,
      verbsPercent,
      attempts: state.exercises.attempts,
      correct: state.exercises.correct,
      accuracy: percent(state.exercises.correct, state.exercises.attempts),
      mastered,
      totalItems: items.length,
      exercisesPercent,
      overall: Math.round((grammarPercent + verbsPercent + exercisesPercent) / 3),
      due: verbs.filter((verb) => ELH.store.isVerbDue(verb.infinitive)).length,
    };
  }

  /** Frase de ejemplo construida con el motor gramatical. */
  function randomSentence(seeded) {
    const tenses = ELH.data.tenses.filter((tense) => tense.builder?.verbs?.length);
    if (!tenses.length) return null;
    const pick = (list, salt) => (seeded ? pickOfTheDay(list, salt) : list[Math.floor(Math.random() * list.length)]);
    const tense = pick(tenses, 'tense');
    const verb = pick(tense.builder.verbs, 'verb');
    const subject = pick(grammar.SUBJECTS, 'subject');
    const form = pick(['affirmative', 'negative', 'question'], 'form');
    const time = pick(['', ...(tense.builder.times || [])], 'time');
    const template = ELH.sentenceBuilder.templateFor(tense, verb.base, form);
    const result = grammar.build(template, { subjectId: subject.id, verb: verb.base, complement: verb.complement, time, form });
    return { tense, form, result };
  }

  function sentenceHtml(sentence) {
    if (!sentence) return '';
    return `
      <div class="dash-sentence-blocks">
        ${ELH.blocks.sentence(sentence.result.tokens, { size: 'lg', animated: true, punctuation: sentence.result.punctuation })}
      </div>
      <p class="dash-sentence-meta">
        <a href="#/grammar/${sentence.tense.id}/structure">${escapeHtml(sentence.tense.name)}</a>, frase ${FORM_NAMES[sentence.form]}
      </p>`;
  }

  function continueTarget(state) {
    if (state.lastLocation?.route) return state.lastLocation;
    const next = ELH.data.tenses.find((tense) => !ELH.ui.lessonProgress(tense.id).studied);
    if (next) return { route: `#/grammar/${next.id}`, label: next.name };
    return { route: '#/practice', label: 'Práctica' };
  }

  function statTile({ iconName, value, total, label, progress, href }) {
    return `<a class="card card-link stat-tile" href="${href}">
      <span class="stat-icon">${icon(iconName, { size: 20 })}</span>
      <span class="stat-value">${value}${total !== undefined ? `<small> / ${total}</small>` : ''}</span>
      <span class="stat-label">${escapeHtml(label)}</span>
      ${progress !== undefined ? ELH.ui.progressBar(progress, { size: 'sm', label }) : ''}
    </a>`;
  }

  function weekBars() {
    const days = ELH.store.lastDays(7);
    const max = Math.max(...days.map((day) => day.value), 1);
    const today = dayKey();
    return `
      <div class="week-bars" aria-hidden="true">
        ${days.map((day) => {
          const height = day.value ? Math.max(8, Math.round((day.value / max) * 100)) : 0;
          return `<div class="week-bar ${day.key === today ? 'is-today' : ''}" data-tip="${WEEKDAY_NAMES[day.date.getDay()]}: ${day.value}">
            <span class="week-bar-track"><span class="week-bar-fill" style="height:${height}%"></span></span>
            <span class="week-bar-label">${WEEKDAYS[day.date.getDay()]}</span>
          </div>`;
        }).join('')}
      </div>
      <ul class="sr-only">${days.map((day) => `<li>${WEEKDAY_NAMES[day.date.getDay()]}: ${day.value} actividades</li>`).join('')}</ul>`;
  }

  function activityList(activity) {
    if (!activity.length) {
      return ELH.ui.emptyState({ iconName: 'activity', title: 'Todavía no hay actividad', text: 'Abre una lección, haz unos ejercicios o repasa verbos: aquí verás lo último que has hecho.' });
    }
    return `<ul class="activity-list">
      ${activity.slice(0, 5).map((entry) => `
        <li>
          <a class="activity-item" href="${entry.route || '#/'}">
            <span class="activity-icon">${icon(entry.icon || 'activity', { size: 18 })}</span>
            <span class="activity-text">
              <strong>${escapeHtml(entry.title)}</strong>
              ${entry.detail ? `<span>${escapeHtml(entry.detail)}</span>` : ''}
            </span>
            <span class="activity-time">${escapeHtml(timeAgo(entry.ts))}</span>
          </a>
        </li>`).join('')}
    </ul>`;
  }

  function render({ el }) {
    const state = ELH.store.get();
    const stats = overview();
    const name = state.profile.name.trim();
    const goal = state.profile.dailyGoal || 20;
    const today = ELH.store.todayPoints();
    const streak = ELH.store.streak();
    const next = continueTarget(state);
    const firstTime = state.exercises.attempts === 0 && !Object.keys(state.lessons).length && !Object.keys(state.verbs).length;
    const verbOfDay = pickOfTheDay(ELH.data.irregularVerbs, 'verb-of-the-day');
    const sentence = randomSentence(true);
    const remaining = Math.max(0, goal - today);

    el.innerHTML = `
      <section class="dash-hero" aria-labelledby="dash-title">
        <div class="dash-hero-main">
          <p class="dash-greeting">${greeting()}${name ? `, ${escapeHtml(name)}` : ''}</p>
          <h1 id="dash-title">${firstTime ? 'Empieza a aprender inglés paso a paso' : 'Sigue donde lo dejaste'}</h1>
          <p class="dash-hero-text">${firstTime
            ? 'Empieza por la primera lección, practica con ejercicios corregidos al momento y memoriza los verbos irregulares con tarjetas.'
            : `Llevas ${plural(stats.studied, 'lección estudiada', 'lecciones estudiadas')}, ${plural(stats.learnedVerbs, 'verbo aprendido', 'verbos aprendidos')} y ${plural(stats.attempts, 'ejercicio hecho', 'ejercicios hechos')}.`}</p>
          <div class="row dash-actions">
            <a class="btn btn-primary btn-lg" href="${escapeHtml(next.route)}">${icon('play', { size: 18 })} ${firstTime ? 'Empezar' : 'Continuar'}: ${escapeHtml(next.label)}</a>
            <a class="btn btn-lg btn-hero-secondary" href="#/verbs/flashcards">${icon('cards', { size: 18 })} ${stats.due ? `Repasar ${plural(stats.due, 'verbo', 'verbos')}` : 'Estudiar verbos'}</a>
          </div>
          <div class="dash-progress">
            <div class="row-between"><span>Progreso general</span><strong>${stats.overall}%</strong></div>
            ${ELH.ui.progressBar(stats.overall, { size: 'lg', label: 'Progreso general' })}
            <div class="dash-progress-parts">
              <span><strong>${stats.grammarPercent}%</strong> gramática</span>
              <span><strong>${stats.verbsPercent}%</strong> verbos</span>
              <span><strong>${stats.exercisesPercent}%</strong> ejercicios</span>
            </div>
          </div>
        </div>
        <div class="dash-hero-sentence">
          <div class="row-between">
            <h2 class="dash-sentence-title">Frase del día</h2>
            <div class="row" style="gap:4px">
              <span class="dash-speak">${sentence ? ELH.speech.button(sentence.result.text, { className: 'on-dark' }) : ''}</span>
              <button type="button" class="btn btn-icon btn-sm on-dark" data-action="new-sentence" aria-label="Construir otra frase" title="Otra frase">${icon('shuffle', { size: 18 })}</button>
            </div>
          </div>
          <div class="dash-sentence" aria-live="polite">${sentenceHtml(sentence)}</div>
          <div class="dash-legend">${ELH.blocks.legend()}</div>
        </div>
      </section>

      <section class="section" aria-labelledby="stats-title">
        <h2 class="sr-only" id="stats-title">Resumen</h2>
        <div class="grid grid-4">
          ${statTile({ iconName: 'book', value: stats.studied, total: stats.totalTenses, label: 'Tiempos verbales estudiados', progress: percent(stats.studied, stats.totalTenses), href: '#/grammar' })}
          ${statTile({ iconName: 'layers', value: stats.learnedVerbs, total: stats.totalVerbs, label: 'Verbos irregulares aprendidos', progress: stats.verbsPercent, href: '#/verbs' })}
          ${statTile({ iconName: 'target', value: stats.attempts, label: 'Ejercicios completados', href: '#/practice' })}
          ${statTile({ iconName: 'checkCircle', value: stats.attempts ? `${stats.accuracy}%` : '—', label: 'Porcentaje de aciertos', progress: stats.attempts ? stats.accuracy : undefined, href: '#/progress' })}
        </div>
      </section>

      <section class="section grid dash-row">
        <article class="card goal-card" aria-labelledby="goal-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="goal-title">Objetivo diario</h2>
              <p class="card-subtitle">Cada respuesta y cada tarjeta repasada suman una actividad.</p>
            </div>
          </div>
          <div class="goal-body">
            ${ELH.ui.ring(percent(today, goal), { size: 112, stroke: 11, label: `${Math.min(today, goal)}`, sublabel: `de ${goal}`, success: today >= goal, ariaLabel: `${today} de ${goal} actividades hoy` })}
            <div class="goal-text">
              <p class="goal-message">${today >= goal ? '¡Objetivo cumplido! Todo lo que hagas hoy es extra.' : `Te ${remaining === 1 ? 'falta 1 actividad' : `faltan ${remaining} actividades`} para cumplir el objetivo de hoy.`}</p>
              <p class="goal-streak">${icon('flame', { size: 16 })} ${streak ? `${streak} ${streak === 1 ? 'día seguido' : 'días seguidos'} estudiando` : 'Hoy puede ser el primer día de tu racha'}</p>
              <a class="btn btn-secondary btn-sm" href="#/practice?quick=1">${icon('zap', { size: 16 })} Práctica rápida</a>
            </div>
          </div>
          <h3 class="goal-week-title">Últimos 7 días</h3>
          ${weekBars()}
        </article>

        <article class="card verb-day" aria-labelledby="verb-day-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="verb-day-title">Verbo del día</h2>
              <p class="card-subtitle">¿Recuerdas sus formas?</p>
            </div>
            ${ELH.ui.favButton('verbs', verbOfDay.infinitive, { label: `favoritos: ${verbOfDay.infinitive}` })}
          </div>
          <p class="verb-day-word en">${escapeHtml(verbOfDay.infinitive)}</p>
          <p class="muted">${escapeHtml(verbOfDay.meaning)}</p>
          <div class="verb-day-forms" aria-live="polite">
            <div class="forms-grid forms-grid-2">
              <div class="form-cell"><span class="form-cell-label">Past Simple</span><span class="form-cell-value en"><span class="vd-hidden">?<span class="sr-only"> (oculto)</span></span><span class="vd-real" hidden>${escapeHtml(verbOfDay.past)}</span></span></div>
              <div class="form-cell"><span class="form-cell-label">Past Participle</span><span class="form-cell-value en"><span class="vd-hidden">?<span class="sr-only"> (oculto)</span></span><span class="vd-real" hidden>${ELH.ui.verbFormHtml(verbOfDay.participle)}</span></span></div>
            </div>
          </div>
          <div class="row verb-day-actions">
            <button type="button" class="btn btn-primary btn-sm" data-action="reveal-verb" aria-expanded="false">${icon('eye', { size: 16 })} Ver las formas</button>
            ${ELH.speech.button([verbOfDay.infinitive, verbOfDay.past, verbOfDay.participle].filter(Boolean).join(', '))}
          </div>
        </article>

        <article class="card" aria-labelledby="activity-title">
          <div class="card-header">
            <div>
              <h2 class="card-title" id="activity-title">Última actividad</h2>
              <p class="card-subtitle">Lo que has hecho más recientemente.</p>
            </div>
            <a class="btn btn-ghost btn-sm" href="#/progress">Ver todo</a>
          </div>
          ${activityList(state.activity)}
        </article>
      </section>

      <section class="section" aria-labelledby="lessons-title">
        <div class="section-title">
          <h2 id="lessons-title">Tus lecciones</h2>
          <a class="btn btn-ghost btn-sm" href="#/grammar">Ver gramática</a>
        </div>
        <div class="grid grid-3">
          ${ELH.data.tenses.map((tense) => ELH.pages.grammar.tenseCard(tense)).join('')}
        </div>
      </section>`;

    function onClick(event) {
      const action = event.target.closest('[data-action]')?.dataset.action;
      if (action === 'new-sentence') {
        const fresh = randomSentence(false);
        el.querySelector('.dash-sentence').innerHTML = sentenceHtml(fresh);
        el.querySelector('.dash-speak').innerHTML = fresh ? ELH.speech.button(fresh.result.text, { className: 'on-dark' }) : '';
      }
      if (action === 'reveal-verb') {
        const forms = el.querySelector('.verb-day-forms');
        const button = event.target.closest('[data-action]');
        const reveal = !forms.classList.contains('is-revealed');
        forms.classList.toggle('is-revealed', reveal);
        forms.querySelectorAll('.vd-real').forEach((node) => { node.hidden = !reveal; });
        forms.querySelectorAll('.vd-hidden').forEach((node) => { node.hidden = reveal; });
        button.setAttribute('aria-expanded', String(reveal));
        button.innerHTML = reveal ? `${icon('eyeOff', { size: 16 })} Ocultar` : `${icon('eye', { size: 16 })} Ver las formas`;
      }
    }

    el.addEventListener('click', onClick);
    return () => el.removeEventListener('click', onClick);
  }

  ELH.pages.dashboard = { title: 'Inicio', render, overview };
})();
